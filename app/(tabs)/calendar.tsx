import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, FlatList } from 'react-native';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import CalendarGrid from '../../components/CalendarGrid';
import NotebookBackground from '../../components/NotebookBackground';
import { StorageService } from '../../services/storage';
import { DayData, Note } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { responsiveFontSize } from '../../utils/responsive';

export default function CalendarScreen() {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [contentHeight, setContentHeight] = useState(0);
  const [visibleMonths, setVisibleMonths] = useState<Date[]>([]);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(12); // Start at current month
  const scrollViewRef = React.useRef<ScrollView>(null);
  const router = useRouter();
  const isInitialMount = React.useRef(true);
  
  // Generate array of months (12 months before and after current date)
  const months = [];
  const currentDate = new Date();
  for (let i = -12; i <= 12; i++) {
    months.push(addMonths(startOfMonth(currentDate), i));
  }

  useEffect(() => {
    loadAllNotes();
    // Initially load only current month and neighbors
    const currentMonthIndex = 12;
    setVisibleMonths([
      months[currentMonthIndex - 1],
      months[currentMonthIndex],
      months[currentMonthIndex + 1]
    ]);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Reload notes every time the screen gains focus
      loadAllNotes();
    }, [])
  );

  useEffect(() => {
    // Only scroll to current month on initial mount
    if (isInitialMount.current && visibleMonths.length > 0) {
      isInitialMount.current = false;
      const currentMonthIndex = 12;
      const monthHeight = 400;
      // Center the current month in the viewport
      const viewportHeight = 600; // Approximate viewport height
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ 
          y: currentMonthIndex * monthHeight - (viewportHeight / 2 - monthHeight / 2), 
          animated: false 
        });
      }, 150);
    }
  }, [visibleMonths]);

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const monthHeight = 400;
    const currentIndex = Math.floor((scrollY + 200) / monthHeight);
    
    if (currentIndex !== currentScrollIndex && currentIndex >= 0 && currentIndex < months.length) {
      setCurrentScrollIndex(currentIndex);
      
      // Load months around current visible month
      const newVisibleMonths = [];
      for (let i = Math.max(0, currentIndex - 2); i <= Math.min(months.length - 1, currentIndex + 2); i++) {
        if (!visibleMonths.some(vm => vm.getTime() === months[i].getTime())) {
          newVisibleMonths.push(months[i]);
        }
      }
      
      if (newVisibleMonths.length > 0) {
        setVisibleMonths([...visibleMonths, ...newVisibleMonths]);
      }
    }
  };

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
    // Check if this date has content
    const dateStr = format(date, 'yyyy-MM-dd');
    const noteForDate = allNotes.find(n => n.date === dateStr);
    
    if (noteForDate?.content && noteForDate.content.trim().length > 0) {
      // Navigate to All Notes and scroll to this date
      router.push({
        pathname: '/(tabs)/allnotes',
        params: { scrollToDate: dateStr }
      });
    } else {
      // Return false to trigger shake animation in CalendarGrid
      return false;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(contentWidth, contentHeight) => {
          setContentHeight(contentHeight);
        }}
      >
        {months.map((monthDate, index) => {
          const isVisible = visibleMonths.some(vm => vm.getTime() === monthDate.getTime());
          
          return (
            <View key={monthDate.toISOString()} style={styles.monthContainer}>
              {isVisible ? (
                <>
                  <Text style={[styles.monthTitle, { color: theme.primaryText }]}>{format(monthDate, 'MMMM yyyy')}</Text>
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
                </>
              ) : (
                <View style={{ height: 400 }} />
              )}
            </View>
          );
        })}
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
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
});