import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Note } from '../types';
import AuthService from './authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_COLLECTION = 'notes';
const CURRENT_DATE_KEY = '@current_date';

export const FirebaseStorageService = {
  async saveNote(note: Note): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const noteRef = doc(db, NOTES_COLLECTION, `${user.uid}_${note.date}`);
      
      // Convert date strings to Firestore Timestamps for better querying
      const noteData = {
        ...note,
        userId: user.uid,
        dateTimestamp: Timestamp.fromDate(new Date(note.date)),
        createdAtTimestamp: Timestamp.fromDate(new Date(note.createdAt)),
        updatedAtTimestamp: Timestamp.fromDate(new Date(note.updatedAt))
      };

      // If content is empty/whitespace only and no mood, delete the note
      if ((!note.content || note.content.trim().length === 0) && !note.mood) {
        await deleteDoc(noteRef);
      } else {
        await setDoc(noteRef, noteData);
      }
    } catch (error) {
      console.error('Error saving note to Firebase:', error);
      throw error;
    }
  },

  async getNoteByDate(date: string): Promise<Note | null> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const noteRef = doc(db, NOTES_COLLECTION, `${user.uid}_${date}`);
      const noteDoc = await getDoc(noteRef);
      
      if (noteDoc.exists()) {
        const data = noteDoc.data();
        return {
          id: data.id,
          date: data.date,
          content: data.content,
          mood: data.mood,
          images: data.images || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Note;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting note from Firebase:', error);
      return null;
    }
  },

  async getAllNotes(): Promise<Note[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const notesQuery = query(
        collection(db, NOTES_COLLECTION),
        where('userId', '==', user.uid),
        orderBy('dateTimestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(notesQuery);
      const notes: Note[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          id: data.id,
          date: data.date,
          content: data.content,
          mood: data.mood,
          images: data.images || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Note);
      });
      
      return notes;
    } catch (error) {
      console.error('Error getting all notes from Firebase:', error);
      return [];
    }
  },

  async searchNotes(searchQuery: string): Promise<Note[]> {
    try {
      // For text search, we need to get all notes and filter client-side
      // Firebase doesn't support full-text search natively
      const notes = await this.getAllNotes();
      const lowercaseQuery = searchQuery.toLowerCase();
      
      return notes.filter(note => 
        note.content?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  },

  async deleteOldNotes(daysToKeep: number = 30): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const oldNotesQuery = query(
        collection(db, NOTES_COLLECTION),
        where('userId', '==', user.uid),
        where('dateTimestamp', '<', Timestamp.fromDate(cutoffDate))
      );
      
      const querySnapshot = await getDocs(oldNotesQuery);
      
      // Delete each old note
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting old notes:', error);
    }
  },

  async setCurrentDate(date: Date): Promise<void> {
    try {
      // Still use AsyncStorage for local date tracking
      await AsyncStorage.setItem(CURRENT_DATE_KEY, date.toISOString());
    } catch (error) {
      console.error('Error setting current date:', error);
    }
  },

  async getCurrentDate(): Promise<Date> {
    try {
      const dateStr = await AsyncStorage.getItem(CURRENT_DATE_KEY);
      return dateStr ? new Date(dateStr) : new Date();
    } catch (error) {
      console.error('Error getting current date:', error);
      return new Date();
    }
  },

  async clearAllData(): Promise<void> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all user's notes
      const userNotesQuery = query(
        collection(db, NOTES_COLLECTION),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(userNotesQuery);
      
      // Delete all notes
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Clear local storage
      await AsyncStorage.clear();
      
      console.log('All user data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
};