# Firebase Authentication Setup Guide

This guide will help you enable proper authentication so users don't lose their data when reinstalling the app.

## Step 1: Enable Authentication Methods in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (dailynotes-d099e)
3. Navigate to **Authentication** > **Sign-in method**
4. Enable the following providers:

### For Android - Google Sign-In:
1. Click on **Google**
2. Enable it
3. Fill in your project support email
4. Click **Save**
5. Once saved, expand the Google provider settings
6. Copy the **Web client ID** (it looks like: 265993334513-xxxxxxxxxxxx.apps.googleusercontent.com)
7. Add this to your `.env` file:
   ```
   EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=265993334513-xxxxxxxxxxxx.apps.googleusercontent.com
   ```

### For iOS - Apple Sign-In:
1. Click on **Apple**
2. Enable it
3. You'll need an Apple Developer account to configure this properly
4. Follow Firebase's instructions for Apple setup

### Anonymous Authentication:
1. Click on **Anonymous**
2. Enable it (this is already done if the app is working)

## Step 2: Configure Your App

### Android Configuration:
1. The google-services.json you already have should work
2. Make sure you have the Web Client ID in your .env file

### iOS Configuration:
1. You'll need to add Sign in with Apple capability in Xcode
2. Add the GoogleService-Info.plist to your iOS project

## Step 3: How It Works

1. **First Install**: User opens app, gets anonymous account, data syncs to Firebase
2. **User Opens Settings**: Sees "Sync with Google" or "Sync with Apple" button
3. **User Taps Sync**: Signs in with their Google/Apple account
4. **Account Linked**: Anonymous account upgrades to permanent account
5. **Reinstall App**: User signs in again, all data is restored

## Step 4: Testing

1. Install the app fresh
2. Create some notes
3. Go to Settings and tap "Sync with Google/Apple"
4. Sign in with your account
5. Delete the app
6. Reinstall and check if data persists

## Important Notes

- Users who never tap the sync button will remain anonymous
- Anonymous users who uninstall lose their data
- Once linked, data persists across all devices with same account
- The sync is automatic after initial linking