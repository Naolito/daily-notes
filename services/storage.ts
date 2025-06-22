import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types';

const NOTES_STORAGE_KEY = '@daily_notes';
const CURRENT_DATE_KEY = '@current_date';

export const StorageService = {
  async saveNote(note: Note): Promise<void> {
    try {
      const existingNotes = await this.getAllNotes();
      const noteIndex = existingNotes.findIndex(n => n.date === note.date);
      
      if (noteIndex >= 0) {
        existingNotes[noteIndex] = note;
      } else {
        existingNotes.push(note);
      }
      
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(existingNotes));
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  },

  async getNoteByDate(date: string): Promise<Note | null> {
    try {
      const notes = await this.getAllNotes();
      return notes.find(note => note.date === date) || null;
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  },

  async getAllNotes(): Promise<Note[]> {
    try {
      const notesJson = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error('Error getting all notes:', error);
      return [];
    }
  },

  async searchNotes(query: string): Promise<Note[]> {
    try {
      const notes = await this.getAllNotes();
      const lowercaseQuery = query.toLowerCase();
      return notes.filter(note => 
        note.content.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  },

  async deleteOldNotes(daysToKeep: number = 30): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const filteredNotes = notes.filter(note => 
        new Date(note.date) >= cutoffDate
      );
      
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Error deleting old notes:', error);
    }
  },

  async setCurrentDate(date: Date): Promise<void> {
    try {
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
      await AsyncStorage.clear();
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
};