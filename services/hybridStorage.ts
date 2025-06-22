import { Note } from '../types';
import { StorageService } from './storage';
import { FirebaseStorageService } from './firebaseStorage';
import AuthService from './authService';
import NetInfo from '@react-native-community/netinfo';

class HybridStorageService {
  private isOnline: boolean = true;
  private syncQueue: Note[] = [];

  constructor() {
    // Monitor network connectivity
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline && this.syncQueue.length > 0) {
        this.syncPendingNotes();
      }
    });
  }

  private async syncPendingNotes() {
    const notesToSync = [...this.syncQueue];
    this.syncQueue = [];

    for (const note of notesToSync) {
      try {
        await FirebaseStorageService.saveNote(note);
      } catch (error) {
        console.error('Error syncing note:', error);
        this.syncQueue.push(note);
      }
    }
  }

  async saveNote(note: Note): Promise<void> {
    // Always save locally first for immediate feedback
    await StorageService.saveNote(note);

    // Then try to save to Firebase if authenticated and online
    if (AuthService.isAuthenticated() && this.isOnline) {
      try {
        await FirebaseStorageService.saveNote(note);
      } catch (error) {
        console.error('Error saving to Firebase, queuing for sync:', error);
        this.syncQueue.push(note);
      }
    }
  }

  async getNoteByDate(date: string): Promise<Note | null> {
    // Try Firebase first if authenticated and online
    if (AuthService.isAuthenticated() && this.isOnline) {
      try {
        const firebaseNote = await FirebaseStorageService.getNoteByDate(date);
        if (firebaseNote) return firebaseNote;
      } catch (error) {
        console.error('Error getting from Firebase, falling back to local:', error);
      }
    }

    // Fall back to local storage
    return StorageService.getNoteByDate(date);
  }

  async getAllNotes(): Promise<Note[]> {
    // Try Firebase first if authenticated and online
    if (AuthService.isAuthenticated() && this.isOnline) {
      try {
        const firebaseNotes = await FirebaseStorageService.getAllNotes();
        if (firebaseNotes.length > 0) return firebaseNotes;
      } catch (error) {
        console.error('Error getting from Firebase, falling back to local:', error);
      }
    }

    // Fall back to local storage
    return StorageService.getAllNotes();
  }

  async searchNotes(query: string): Promise<Note[]> {
    // Try Firebase first if authenticated and online
    if (AuthService.isAuthenticated() && this.isOnline) {
      try {
        return await FirebaseStorageService.searchNotes(query);
      } catch (error) {
        console.error('Error searching Firebase, falling back to local:', error);
      }
    }

    // Fall back to local storage
    return StorageService.searchNotes(query);
  }

  async deleteOldNotes(daysToKeep: number = 30): Promise<void> {
    // Delete from both local and Firebase
    await StorageService.deleteOldNotes(daysToKeep);
    
    if (AuthService.isAuthenticated() && this.isOnline) {
      try {
        await FirebaseStorageService.deleteOldNotes(daysToKeep);
      } catch (error) {
        console.error('Error deleting from Firebase:', error);
      }
    }
  }

  async setCurrentDate(date: Date): Promise<void> {
    return StorageService.setCurrentDate(date);
  }

  async getCurrentDate(): Promise<Date> {
    return StorageService.getCurrentDate();
  }

  async clearAllData(): Promise<void> {
    // Clear both local and Firebase data
    await StorageService.clearAllData();
    
    if (AuthService.isAuthenticated() && this.isOnline) {
      try {
        await FirebaseStorageService.clearAllData();
      } catch (error) {
        console.error('Error clearing Firebase data:', error);
      }
    }
  }

  // Sync local notes to Firebase when user logs in
  async syncLocalToFirebase(): Promise<void> {
    if (!AuthService.isAuthenticated() || !this.isOnline) return;

    try {
      const localNotes = await StorageService.getAllNotes();
      
      for (const note of localNotes) {
        try {
          await FirebaseStorageService.saveNote(note);
        } catch (error) {
          console.error('Error syncing note to Firebase:', error);
        }
      }

      console.log(`Synced ${localNotes.length} notes to Firebase`);
    } catch (error) {
      console.error('Error syncing local notes to Firebase:', error);
    }
  }
}

export default new HybridStorageService();