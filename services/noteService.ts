import { format } from 'date-fns';
import { Note, Mood } from '../types';
import { StorageService } from './storage';

export const NoteService = {
  async getCurrentDate(): Promise<string> {
    const currentDate = await StorageService.getCurrentDate();
    return format(currentDate, 'yyyy-MM-dd');
  },

  getTodayDate(): string {
    return format(new Date(), 'yyyy-MM-dd');
  },

  async getCurrentNote(): Promise<Note | null> {
    const currentDateStr = await this.getCurrentDate();
    return StorageService.getNoteByDate(currentDateStr);
  },

  async getTodayNote(): Promise<Note | null> {
    const today = this.getTodayDate();
    return StorageService.getNoteByDate(today);
  },

  async saveCurrentNote(content: string, mood?: Mood, images: string[] = []): Promise<Note> {
    const currentDateStr = await this.getCurrentDate();
    const existingNote = await StorageService.getNoteByDate(currentDateStr);
    
    const note: Note = {
      id: existingNote?.id || `note_${Date.now()}`,
      date: currentDateStr,
      content,
      mood,
      images,
      createdAt: existingNote?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    await StorageService.saveNote(note);
    return note;
  },

  async saveTodayNote(content: string, mood?: Mood, images: string[] = []): Promise<Note> {
    const today = this.getTodayDate();
    const existingNote = await this.getTodayNote();
    
    const note: Note = {
      id: existingNote?.id || `note_${Date.now()}`,
      date: today,
      content,
      mood,
      images,
      createdAt: existingNote?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    await StorageService.saveNote(note);
    return note;
  },

  async updateTodayMood(mood: Mood): Promise<void> {
    const todayNote = await this.getTodayNote();
    if (todayNote) {
      todayNote.mood = mood;
      todayNote.updatedAt = new Date();
      await StorageService.saveNote(todayNote);
    } else {
      await this.saveTodayNote('', mood);
    }
  },

  async addImageToTodayNote(imageUri: string): Promise<void> {
    const todayNote = await this.getTodayNote();
    if (todayNote) {
      if (!todayNote.images.includes(imageUri)) {
        todayNote.images.push(imageUri);
        todayNote.updatedAt = new Date();
        await StorageService.saveNote(todayNote);
      }
    } else {
      await this.saveTodayNote('', undefined, [imageUri]);
    }
  },

  async removeImageFromTodayNote(imageUri: string): Promise<void> {
    const todayNote = await this.getTodayNote();
    if (todayNote) {
      todayNote.images = todayNote.images.filter(img => img !== imageUri);
      todayNote.updatedAt = new Date();
      await StorageService.saveNote(todayNote);
    }
  },
};