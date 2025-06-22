import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import AuthService from '../services/authService';
import HybridStorage from '../services/hybridStorage';
import SilentAuth from '../services/silentAuth';
import { setCrashlyticsUserId, setCrashlyticsAttributes } from '../config/firebase';
import { Platform } from 'react-native';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize silent authentication
    const initAuth = async () => {
      try {
        const authenticatedUser = await SilentAuth.initializeAuth();
        setUser(authenticatedUser);
        
        // Sync local notes to Firebase if authenticated
        if (authenticatedUser) {
          await HybridStorage.syncLocalToFirebase();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const unsubscribe = AuthService.addAuthStateListener((newUser) => {
      setUser(newUser);
      
      // Set Crashlytics user ID for native platforms
      if (Platform.OS !== 'web') {
        if (newUser) {
          setCrashlyticsUserId(newUser.uid);
          setCrashlyticsAttributes({
            email: newUser.email || 'anonymous',
            provider: newUser.providerData[0]?.providerId || 'unknown'
          });
        } else {
          setCrashlyticsUserId('anonymous');
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}