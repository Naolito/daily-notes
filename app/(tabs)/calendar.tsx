import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { format } from 'date-fns';
import CalendarGrid from '../../components/CalendarGrid';
import { StorageService } from '../../services/storage';
import { DayData, Note } from '../../types';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    loadMonthData();
  }, [selectedDate]);

  const loadMonthData = async () => {
    try {
      const notes = await StorageService.getAllNotes();
      const dayDataMap: DayData[] = notes.map(note => ({
        date: note.date,
        hasNote: true,
        mood: note.mood,
      }));
      setMonthData(dayDataMap);
    } catch (error) {
      console.error('Error loading month data:', error);
    }
  };

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const note = await StorageService.getNoteByDate(dateStr);
    setSelectedNote(note);
  };

  return (
    <ScrollView style={styles.container}>
      <CalendarGrid
        monthData={monthData}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
      
      {selectedNote && (
        <View style={styles.notePreview}>
          <Text style={styles.noteDate}>
            {format(new Date(selectedNote.date), 'EEEE, MMMM d, yyyy')}
          </Text>
          {selectedNote.mood && (
            <Text style={styles.noteMood}>
              Mood: {['😢', '😕', '😐', '🙂', '😊'][selectedNote.mood - 1]}
            </Text>
          )}
          <Text style={styles.noteContent} numberOfLines={5}>
            {selectedNote.content || 'No content for this day'}
          </Text>
          {selectedNote.images.length > 0 && (
            <Text style={styles.imageCount}>
              {selectedNote.images.length} image{selectedNote.images.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notePreview: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  noteDate: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  noteMood: {
    fontSize: 16,
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  imageCount: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 8,
  },
});