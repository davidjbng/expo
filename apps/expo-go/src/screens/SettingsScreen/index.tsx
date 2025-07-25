import { padding, Spacer } from 'expo-dev-client-components';
import * as Tracking from 'expo-tracking-transparency';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { ConstantsSection } from './ConstantsSection';
import { DeleteAccountSection } from './DeleteAccountSection';
import { DevMenuGestureSection } from './DevMenuGestureSection';
import { ThemeSection } from './ThemeSection';
import { TrackingSection } from './TrackingSection';
import { CappedWidthContainerView } from '../../components/Views';
import { useHome_CurrentUserActorQuery } from '../../graphql/types';

export function SettingsScreen() {
  const { data } = useHome_CurrentUserActorQuery();

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag">
      <CappedWidthContainerView style={padding.padding.medium}>
        <ThemeSection />
        <Spacer.Vertical size="medium" />
        {Platform.OS === 'ios' && <DevMenuGestureSection />}
        {Tracking.isAvailable() && <TrackingSection />}
        <ConstantsSection />
        {data?.meUserActor && data.meUserActor.__typename === 'User' ? (
          <>
            <Spacer.Vertical size="xl" />
            <DeleteAccountSection />
          </>
        ) : null}
      </CappedWidthContainerView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
