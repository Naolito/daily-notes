import { 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Listen to auth state changes only if auth is available
    if (auth && auth.onAuthStateChanged) {
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        this.notifyAuthStateListeners(user);
      });
    }
  }


  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Add auth state listener
  addAuthStateListener(listener: (user: User | null) => void): () => void {
    this.authStateListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  private notifyAuthStateListeners(user: User | null) {
    this.authStateListeners.forEach(listener => listener(user));
  }

  // Wait for auth to be ready
  async waitForAuth(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

}

export default new AuthService();