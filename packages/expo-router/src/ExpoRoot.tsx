'use client';

import {
  LinkingOptions,
  NavigationAction,
  StackRouter,
  useNavigationBuilder,
} from '@react-navigation/native';
import React, { type PropsWithChildren, Fragment, type ComponentType, useMemo } from 'react';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { INTERNAL_SLOT_NAME } from './constants';
import { useDomComponentNavigation } from './domComponents/useDomComponentNavigation';
import { NavigationContainer as UpstreamNavigationContainer } from './fork/NavigationContainer';
import { ExpoLinkingOptions } from './getLinkingConfig';
import { store, useStore } from './global-state/router-store';
import { ServerContext, ServerContextType } from './global-state/serverLocationContext';
import { StoreContext } from './global-state/storeContext';
import { ImperativeApiEmitter } from './imperative-api';
import { LinkPreviewContextProvider } from './link/preview/LinkPreviewContext';
import { ModalContextProvider } from './modal/ModalContext';
import { Screen } from './primitives';
import { RequireContext } from './types';
import { canOverrideStatusBarBehavior } from './utils/statusbar';
import * as SplashScreen from './views/Splash';

export type ExpoRootProps = {
  context: RequireContext;
  location?: URL | string;
  wrapper?: ComponentType<PropsWithChildren>;
  linking?: Partial<ExpoLinkingOptions>;
};

export type NativeIntent = {
  redirectSystemPath?: (event: {
    path: string | null;
    initial: boolean;
  }) => Promise<string | null | undefined> | string | null | undefined;
};

const isTestEnv = process.env.NODE_ENV === 'test';

const INITIAL_METRICS =
  Platform.OS === 'web' || isTestEnv
    ? {
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }
    : undefined;

const documentTitle = {
  enabled: false,
};

/**
 * @hidden
 */
export function ExpoRoot({ wrapper: ParentWrapper = Fragment, ...props }: ExpoRootProps) {
  /*
   * Due to static rendering we need to wrap these top level views in second wrapper
   * View's like <SafeAreaProvider /> generate a <div> so if the parent wrapper
   * is a HTML document, we need to ensure its inside the <body>
   */
  const wrapper = ({ children }: PropsWithChildren) => {
    return (
      <ParentWrapper>
        <LinkPreviewContextProvider>
          <SafeAreaProvider
            // SSR support
            initialMetrics={INITIAL_METRICS}>
            {/* Users can override this by adding another StatusBar element anywhere higher in the component tree. */}
            {canOverrideStatusBarBehavior && <AutoStatusBar />}
            {children}
          </SafeAreaProvider>
        </LinkPreviewContextProvider>
      </ParentWrapper>
    );
  };

  return <ContextNavigator {...props} wrapper={wrapper} />;
}

function AutoStatusBar() {
  return <StatusBar barStyle={useColorScheme() === 'light' ? 'dark-content' : 'light-content'} />;
}

const initialUrl =
  Platform.OS === 'web' && typeof window !== 'undefined'
    ? new URL(window.location.href)
    : undefined;

function ContextNavigator({
  context,
  location: initialLocation = initialUrl,
  wrapper: WrapperComponent = Fragment,
  linking = {},
}: ExpoRootProps) {
  // location and linking.getInitialURL are both used to initialize the router state
  //  - location is used on web and during static rendering
  //  - linking.getInitialURL is used on native
  const serverContext = useMemo(() => {
    let contextType: ServerContextType = {};

    if (initialLocation instanceof URL) {
      contextType = {
        location: {
          pathname: initialLocation.pathname + initialLocation.hash,
          search: initialLocation.search,
        },
      };
    } else if (typeof initialLocation === 'string') {
      // The initial location is a string, so we need to parse it into a URL.
      const url = new URL(initialLocation, 'http://placeholder.base');
      contextType = {
        location: {
          pathname: url.pathname,
          search: url.search,
        },
      };
    }

    return contextType;
  }, []);

  /*
   * The serverUrl is an initial URL used in server rendering environments.
   * e.g Static renders, units tests, etc
   */
  const serverUrl = serverContext.location
    ? `${serverContext.location.pathname}${serverContext.location.search}`
    : undefined;

  const store = useStore(context, linking, serverUrl);

  useDomComponentNavigation();

  if (store.shouldShowTutorial()) {
    SplashScreen.hideAsync();
    if (process.env.NODE_ENV === 'development') {
      const Tutorial = require('./onboard/Tutorial').Tutorial;
      return (
        <WrapperComponent>
          <Tutorial />
        </WrapperComponent>
      );
    } else {
      // Ensure tutorial styles are stripped in production.
      return null;
    }
  }

  return (
    <StoreContext.Provider value={store}>
      <UpstreamNavigationContainer
        ref={store.navigationRef}
        initialState={store.state}
        linking={store.linking as LinkingOptions<any>}
        onUnhandledAction={onUnhandledAction}
        documentTitle={documentTitle}
        onReady={store.onReady}>
        <ServerContext.Provider value={serverContext}>
          <WrapperComponent>
            <ModalContextProvider>
              <ImperativeApiEmitter />
              <Content />
            </ModalContextProvider>
          </WrapperComponent>
        </ServerContext.Provider>
      </UpstreamNavigationContainer>
    </StoreContext.Provider>
  );
}

function Content() {
  const { state, descriptors, NavigationContent } = useNavigationBuilder(StackRouter, {
    children: <Screen name={INTERNAL_SLOT_NAME} component={store.rootComponent} />,
    id: INTERNAL_SLOT_NAME,
  });

  return <NavigationContent>{descriptors[state.routes[0].key].render()}</NavigationContent>;
}

let onUnhandledAction: (action: NavigationAction) => void;

if (process.env.NODE_ENV !== 'production') {
  onUnhandledAction = (action: NavigationAction) => {
    const payload: Record<string, any> | undefined = action.payload;

    let message = `The action '${action.type}'${
      payload ? ` with payload ${JSON.stringify(action.payload)}` : ''
    } was not handled by any navigator.`;

    switch (action.type) {
      case 'NAVIGATE':
      case 'PUSH':
      case 'REPLACE':
      case 'JUMP_TO':
        if (payload?.name) {
          message += `\n\nDo you have a route named '${payload.name}'?`;
        } else {
          message += `\n\nYou need to pass the name of the screen to navigate to. This may be a bug.`;
        }

        break;
      case 'GO_BACK':
      case 'POP':
      case 'POP_TO_TOP':
        message += `\n\nIs there any screen to go back to?`;
        break;
      case 'OPEN_DRAWER':
      case 'CLOSE_DRAWER':
      case 'TOGGLE_DRAWER':
        message += `\n\nIs your screen inside a Drawer navigator?`;
        break;
    }

    message += `\n\nThis is a development-only warning and won't be shown in production.`;

    if (process.env.NODE_ENV === 'test') {
      throw new Error(message);
    }
    console.error(message);
  };
} else {
  onUnhandledAction = function () {};
}
