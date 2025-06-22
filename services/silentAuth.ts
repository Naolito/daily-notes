import { Platform } from 'react-native';
import { 
  signInAnonymously,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
  User,
  linkWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { GoogleSignin, statusCodes, User as GoogleUser } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

class SilentAuthService {
  private hasAttemptedAuth = false;

  async initializeAuth(): Promise<User | null> {
    if (this.hasAttemptedAuth) {
      return auth.currentUser;
    }

    this.hasAttemptedAuth = true;

    try {
      // Check if user is already signed in
      if (auth.currentUser) {
        console.log('User already authenticated:', auth.currentUser.uid);
        return auth.currentUser;
      }

      // Platform-specific silent authentication
      if (Platform.OS === 'ios') {
        return await this.silentAppleSignIn();
      } else if (Platform.OS === 'android') {
        return await this.silentGoogleSignIn();
      } else {
        // Web fallback to anonymous
        return await this.anonymousSignIn();
      }
    } catch (error) {
      console.log('Silent auth failed, falling back to anonymous:', error);
      return await this.anonymousSignIn();
    }
  }

  private async silentGoogleSignIn(): Promise<User | null> {
    try {
      // Configure Google Sign-In
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID, // From Firebase Console
        offlineAccess: false,
      });

      // Try silent sign in
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: false });
      const userInfo = await GoogleSignin.signInSilently();
      
      if (userInfo && 'data' in userInfo && userInfo.data?.idToken) {
        const googleCredential = GoogleAuthProvider.credential(userInfo.data.idToken);
        const result = await signInWithCredential(auth, googleCredential);
        console.log('Silently signed in with Google:', result.user.uid);
        return result.user;
      }
      
      // If silent sign-in fails, try anonymous and link later
      const anonUser = await this.anonymousSignIn();
      // Store flag to attempt linking when user opens settings
      return anonUser;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        // User has not signed in before, use anonymous
        return await this.anonymousSignIn();
      }
      console.error('Silent Google sign-in failed:', error);
      return await this.anonymousSignIn();
    }
  }

  private async silentAppleSignIn(): Promise<User | null> {
    try {
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return await this.anonymousSignIn();
      }

      // Try to get credentials without UI
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (credential.identityToken) {
        const provider = new OAuthProvider('apple.com');
        const oAuthCredential = provider.credential({
          idToken: credential.identityToken,
          rawNonce: credential.authorizationCode || undefined,
        });
        
        const result = await signInWithCredential(auth, oAuthCredential);
        console.log('Silently signed in with Apple:', result.user.uid);
        return result.user;
      }
      
      return await this.anonymousSignIn();
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        // User canceled, use anonymous
        return await this.anonymousSignIn();
      }
      console.error('Silent Apple sign-in failed:', error);
      return await this.anonymousSignIn();
    }
  }

  private async anonymousSignIn(): Promise<User | null> {
    try {
      const result = await signInAnonymously(auth);
      console.log('Signed in anonymously:', result.user.uid);
      return result.user;
    } catch (error) {
      console.error('Anonymous sign-in failed:', error);
      return null;
    }
  }

  // Method to upgrade anonymous account to permanent account
  async linkAnonymousAccount(): Promise<User | null> {
    if (!auth.currentUser || !auth.currentUser.isAnonymous) {
      return auth.currentUser;
    }

    try {
      if (Platform.OS === 'ios') {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          ],
        });

        if (credential.identityToken) {
          const provider = new OAuthProvider('apple.com');
          const oAuthCredential = provider.credential({
            idToken: credential.identityToken,
            rawNonce: credential.authorizationCode || undefined,
          });
          
          const result = await linkWithCredential(auth.currentUser, oAuthCredential);
          console.log('Linked anonymous account with Apple:', result.user.uid);
          return result.user;
        }
      } else if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        
        if (userInfo && 'data' in userInfo && userInfo.data?.idToken) {
          const googleCredential = GoogleAuthProvider.credential(userInfo.data.idToken);
          const result = await linkWithCredential(auth.currentUser, googleCredential);
          console.log('Linked anonymous account with Google:', result.user.uid);
          return result.user;
        }
      }
    } catch (error) {
      console.error('Failed to link anonymous account:', error);
    }
    
    return auth.currentUser;
  }
}

export default new SilentAuthService();