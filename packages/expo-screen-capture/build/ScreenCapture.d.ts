import { PermissionResponse, PermissionStatus, PermissionHookOptions, EventSubscription } from 'expo-modules-core';
/**
 * Returns whether the Screen Capture API is available on the current device.
 *
 * @returns A promise that resolves to a `boolean` indicating whether the Screen Capture API is available on the current
 * device.
 */
export declare function isAvailableAsync(): Promise<boolean>;
/**
 * Prevents screenshots and screen recordings until `allowScreenCaptureAsync` is called or the app is restarted. If you are
 * already preventing screen capture, this method does nothing (unless you pass a new and unique `key`).
 *
 * > On iOS, this prevents screen recordings and screenshots, and is only available on iOS 11+ (recordings) and iOS 13+ (screenshots). On older
 * iOS versions, this method does nothing.
 *
 * @param key Optional. If provided, this will help prevent multiple instances of the `preventScreenCaptureAsync`
 * and `allowScreenCaptureAsync` methods (and `usePreventScreenCapture` hook) from conflicting with each other.
 * When using multiple keys, you'll have to re-allow each one in order to re-enable screen capturing.
 *
 * @platform android
 * @platform ios
 */
export declare function preventScreenCaptureAsync(key?: string): Promise<void>;
/**
 * Re-allows the user to screen record or screenshot your app. If you haven't called
 * `preventScreenCapture()` yet, this method does nothing.
 *
 * @param key This will prevent multiple instances of the `preventScreenCaptureAsync` and
 * `allowScreenCaptureAsync` methods from conflicting with each other. If provided, the value must
 * be the same as the key passed to `preventScreenCaptureAsync` in order to re-enable screen
 * capturing.
 */
export declare function allowScreenCaptureAsync(key?: string): Promise<void>;
/**
 * A React hook to prevent screen capturing for as long as the owner component is mounted.
 *
 * @param key If provided, this will prevent multiple instances of this hook or the
 * `preventScreenCaptureAsync` and `allowScreenCaptureAsync` methods from conflicting with each other.
 * This argument is useful if you have multiple active components using the `allowScreenCaptureAsync`
 * hook.
 */
export declare function usePreventScreenCapture(key?: string): void;
/**
 * Enables a privacy protection blur overlay that hides sensitive content when the app is not in focus.
 * The overlay applies a customizable blur effect when the app is in the app switcher, background, or during interruptions
 * (calls, Siri, Control Center, etc.), and automatically removes it when the app becomes active again.
 *
 * This provides visual privacy protection by preventing sensitive app content from being visible in:
 * - App switcher previews
 * - Background app snapshots
 * - Screenshots taken during inactive states
 *
 * For Android, app switcher protection is automatically provided by `preventScreenCaptureAsync()`
 * using the FLAG_SECURE window flag, which shows a blank screen in the recent apps preview.
 *
 * @param blurIntensity The intensity of the blur effect, from 0.0 (no blur) to 1.0 (maximum blur). Default is 0.5.
 *
 * @platform ios
 *
 */
export declare function enableAppSwitcherProtectionAsync(blurIntensity?: number): Promise<void>;
/**
 * Disables the privacy protection overlay that was previously enabled with `enableAppSwitcherProtectionAsync`.
 *
 * @platform ios
 */
export declare function disableAppSwitcherProtectionAsync(): Promise<void>;
/**
 * Adds a listener that will fire whenever the user takes a screenshot while the app is foregrounded.
 *
 * Permission requirements for this method depend on your device’s Android version:
 * - **Before Android 13**: Requires `READ_EXTERNAL_STORAGE`.
 * - **Android 13**: Switches to `READ_MEDIA_IMAGES`.
 * - **Post-Android 13**: No additional permissions required.
 * You can request the appropriate permissions by using [`MediaLibrary.requestPermissionsAsync()`](./media-library/#medialibraryrequestpermissionsasync).
 *
 * @param listener The function that will be executed when the user takes a screenshot.
 * This function accepts no arguments.
 *
 * @return A `Subscription` object that you can use to unregister the listener, either by calling
 * `remove()` or passing it to `removeScreenshotListener`.
 */
export declare function addScreenshotListener(listener: () => void): EventSubscription;
/**
 * Removes the subscription you provide, so that you are no longer listening for screenshots.
 * You can also call `remove()` on that `Subscription` object.
 *
 * @param subscription Subscription returned by `addScreenshotListener`.
 *
 * @example
 * ```ts
 * let mySubscription = addScreenshotListener(() => {
 *   console.log("You took a screenshot!");
 * });
 * ...
 * mySubscription.remove();
 * // OR
 * removeScreenshotListener(mySubscription);
 * ```
 */
export declare function removeScreenshotListener(subscription: EventSubscription): void;
/**
 * A React hook that listens for screenshots taken while the component is mounted.
 *
 * @param listener A function that will be called whenever a screenshot is detected.
 *
 * This hook automatically starts listening when the component mounts, and stops
 * listening when the component unmounts.
 */
export declare function useScreenshotListener(listener: () => void): void;
/**
 * Checks user's permissions for detecting when a screenshot is taken.
 * > Only Android requires additional permissions to detect screenshots. On iOS devices, this method will always resolve to a `granted` permission response.
 * @return A promise that resolves to a [`PermissionResponse`](#permissionresponse) object.
 */
export declare function getPermissionsAsync(): Promise<PermissionResponse>;
/**
 * Asks the user to grant permissions necessary for detecting when a screenshot is taken.
 * > Only Android requires additional permissions to detect screenshots. On iOS devices, this method will always resolve to a `granted` permission response.
 * @return A promise that resolves to a [`PermissionResponse`](#permissionresponse) object.
 * */
export declare function requestPermissionsAsync(): Promise<PermissionResponse>;
/**
 * Check or request permissions necessary for detecting when a screenshot is taken.
 * This uses both [`requestPermissionsAsync`](#screencapturerequestpermissionsasync) and [`getPermissionsAsync`](#screencapturegetpermissionsasync) to interact with the permissions.
 *
 * @example
 * ```js
 * const [status, requestPermission] = ScreenCapture.usePermissions();
 * ```
 */
export declare const usePermissions: (options?: PermissionHookOptions<object> | undefined) => [PermissionResponse | null, () => Promise<PermissionResponse>, () => Promise<PermissionResponse>];
export { EventSubscription as Subscription, PermissionResponse, PermissionStatus, PermissionHookOptions, };
//# sourceMappingURL=ScreenCapture.d.ts.map