# Firebase Crashlytics Setup Guide for Daily Notes

This guide provides step-by-step instructions for setting up Firebase Crashlytics in the Daily Notes React Native Expo project.

## Prerequisites

1. Firebase project already set up (which you have)
2. Expo development build capability (not Expo Go)
3. Google Services configuration files

## Setup Steps Completed

### 1. Dependencies Installed

The following packages have been installed:
- `@react-native-firebase/app`
- `@react-native-firebase/crashlytics`
- `expo-dev-client`

### 2. Configuration Files

#### app.json Configuration
The Firebase plugins have been added to `app.json`:
```json
"plugins": [
  "expo-router",
  "expo-font",
  "@react-native-firebase/app",
  "@react-native-firebase/crashlytics"
]
```

#### Firebase Configuration
Crashlytics has been integrated into `/config/firebase.ts` with:
- Initialization function
- Error logging utilities
- User identification
- Custom attributes
- Log messages

### 3. Implementation

#### Automatic Initialization
Crashlytics is automatically initialized in the app's root layout (`app/_layout.tsx`) for native platforms.

#### User Identification
When users authenticate, their user ID is automatically set in Crashlytics (`contexts/AuthContext.tsx`).

#### Test Component
A test component has been created at `components/CrashlyticsTest.tsx` that provides:
- Force crash test
- Non-fatal error logging
- Custom log messages
- JavaScript error testing

The test component is accessible in the Settings screen under the "Development" section (only visible in development mode).

## Required Manual Steps

### 1. Download Google Services Files

You need to download the configuration files from Firebase Console:

#### For Android (google-services.json):
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon next to "Project Overview"
4. Select "Project settings"
5. In the "Your apps" section, find your Android app
6. Click "Download google-services.json"
7. Place the file in the root directory: `/Users/nacho/daily-notes/google-services.json`

#### For iOS (GoogleService-Info.plist):
1. In the same Firebase project settings
2. Find your iOS app
3. Click "Download GoogleService-Info.plist"
4. Place the file in the root directory: `/Users/nacho/daily-notes/GoogleService-Info.plist`

### 2. Enable Crashlytics in Firebase Console

1. Go to Firebase Console
2. Navigate to "Crashlytics" in the left sidebar
3. Click "Enable Crashlytics"
4. Follow the setup wizard if prompted

### 3. Build Your App

Since Firebase requires native code, you need to create a development build:

```bash
# For local development build
npx expo prebuild

# For EAS Build
eas build --platform android --profile development
eas build --platform ios --profile development
```

### 4. Test Crashlytics

1. Run your development build on a device or simulator
2. Go to Settings in the app
3. Scroll to the bottom (in development mode)
4. Tap "Test Crashlytics"
5. Try the different test options:
   - **Test Crash**: Forces the app to crash
   - **Test Non-Fatal Error**: Logs a handled error
   - **Test Custom Logs**: Sends custom log messages
   - **Test JS Error**: Throws an unhandled JavaScript error

### 5. Verify in Firebase Console

After testing:
1. Go to Firebase Console > Crashlytics
2. You should see crash reports appearing (may take a few minutes)
3. Check for:
   - Crash-free statistics
   - Error logs
   - Custom log messages
   - User identification

## Usage in Your Code

### Logging Errors

```typescript
import { logCrashlyticsError } from '../config/firebase';

try {
  // Your code
} catch (error) {
  logCrashlyticsError(error as Error, {
    context: 'Feature name',
    additionalInfo: 'Any relevant data'
  });
}
```

### Logging Custom Messages

```typescript
import { logCrashlyticsMessage } from '../config/firebase';

logCrashlyticsMessage('User performed important action');
```

### Setting User Attributes

```typescript
import { setCrashlyticsAttributes } from '../config/firebase';

setCrashlyticsAttributes({
  subscription_type: 'premium',
  user_preference: 'dark_mode'
});
```

## Production Configuration

For production builds:

1. Ensure Crashlytics is enabled in your Firebase project
2. Remove or disable the Development section in Settings
3. Test thoroughly before releasing
4. Monitor crash reports regularly in Firebase Console

## Troubleshooting

### Crashes Not Appearing
- Make sure you're using a development/production build, not Expo Go
- Check that google-services.json and GoogleService-Info.plist are present
- Verify Crashlytics is enabled in Firebase Console
- Wait a few minutes - reports can be delayed

### Build Errors
- Run `npx expo prebuild --clean` to regenerate native directories
- Ensure all configuration files are in place
- Check that your bundle identifiers match Firebase configuration

### Testing Issues
- Force crashes only work on device/simulator, not in development mode
- Some crashes may not appear immediately in the console
- Check device logs for any initialization errors

## Best Practices

1. **Privacy**: Always respect user privacy - only collect necessary crash data
2. **User Identification**: Use anonymous IDs when possible
3. **Custom Logs**: Don't log sensitive information
4. **Error Handling**: Use try-catch blocks and log errors appropriately
5. **Testing**: Test crash reporting in development before production
6. **Monitoring**: Regularly check crash reports and fix issues promptly

## Additional Resources

- [Firebase Crashlytics Documentation](https://firebase.google.com/docs/crashlytics)
- [React Native Firebase Documentation](https://rnfirebase.io/crashlytics/usage)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)