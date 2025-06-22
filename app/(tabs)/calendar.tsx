import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, FlatList } from 'react-native';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import CalendarGrid from '../../components/CalendarGrid';
import NotebookBackground from '../../components/NotebookBackground';
import { StorageService } from '../../services/storage';
import { DayData, Note } from '../../types';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [contentHeight, setContentHeight] = useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const router = useRouter();
  
  // Generate array of months (12 months before and after current date)
  const months = [];
  const currentDate = new Date();
  for (let i = -12; i <= 12; i++) {
    months.push(addMonths(startOfMonth(currentDate), i));
  }

  useEffect(() => {
    loadAllNotes();
    // Scroll to current month after a brief delay
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 12 * 400, animated: false });
    }, 100);
  }, []);

  const loadAllNotes = async () => {
    try {
      const notes = await StorageService.getAllNotes();
      setAllNotes(notes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };
  
  const getMonthData = (monthDate: Date): DayData[] => {
    return allNotes
      .filter(note => {
        const noteDate = new Date(note.date);
        return noteDate.getMonth() === monthDate.getMonth() && 
               noteDate.getFullYear() === monthDate.getFullYear();
      })
      .map(note => ({
        date: note.date,
        hasNote: true,
        mood: note.mood,
      }));
  };

  const handleDateSelect = async (date: Date) => {
    // Set the selected date in storage so the editor can load it
    await StorageService.setCurrentDate(date);
    // Navigate to today's notes tab
    router.push('/(tabs)/');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(contentWidth, contentHeight) => {
          setContentHeight(contentHeight);
        }}
      >
        {months.map((monthDate, index) => (
          <View key={monthDate.toISOString()} style={styles.monthContainer}>
            <Text style={styles.monthTitle}>{format(monthDate, 'MMMM yyyy')}</Text>
            <CalendarGrid
              monthData={getMonthData(monthDate)}
              monthDate={monthDate}
              selectedDate={
                selectedDate.getMonth() === monthDate.getMonth() && 
                selectedDate.getFullYear() === monthDate.getFullYear() 
                  ? selectedDate 
                  : null
              }
              onDateSelect={handleDateSelect}
              notes={allNotes}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0eb',
  },
  scrollContainer: {
    flex: 1,
  },
  monthContainer: {
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
});