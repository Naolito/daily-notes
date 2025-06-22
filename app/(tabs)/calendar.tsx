import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, PanResponder, Animated, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CalendarGrid from '../../components/CalendarGrid';
import NotebookBackground from '../../components/NotebookBackground';
import HybridStorageService from '../../services/hybridStorage';
import { DayData, Note } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { responsiveFontSize } from '../../utils/responsive';

const { width: screenWidth } = Dimensions.get('window');

export default function CalendarScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [monthsData, setMonthsData] = useState<{ [key: string]: Note[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Keep track of current position
  const scrollX = useRef(new Animated.Value(screenWidth)).current;
  
  // Calculate the three months we need based on current index
  const baseMonth = startOfMonth(new Date());
  const currentMonth = addMonths(baseMonth, currentMonthIndex);
  const prevMonth = subMonths(currentMonth, 1);
  const nextMonth = addMonths(currentMonth, 1);
  
  // Load notes for a specific month
  const loadMonthNotes = async (month: Date): Promise<Note[]> => {
    try {
      const allNotes = await HybridStorageService.getAllNotes();
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const filteredNotes = allNotes.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate >= monthStart && noteDate <= monthEnd;
      });
      
      return filteredNotes;
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  };

  // Load current month and adjacent months
  const loadAdjacentMonths = React.useCallback(async () => {
    setIsLoading(true);
    
    try {
      const [prevNotes, currentNotes, nextNotes] = await Promise.all([
        loadMonthNotes(prevMonth),
        loadMonthNotes(currentMonth),
        loadMonthNotes(nextMonth),
      ]);
      
      setMonthsData(prev => ({
        ...prev,
        [format(prevMonth, 'yyyy-MM')]: prevNotes,
        [format(currentMonth, 'yyyy-MM')]: currentNotes,
        [format(nextMonth, 'yyyy-MM')]: nextNotes,
      }));
    } catch (error) {
      console.error('Error loading months:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, prevMonth, nextMonth]);

  useEffect(() => {
    loadAdjacentMonths();
  }, [loadAdjacentMonths]);

  useEffect(() => {
    // Always scroll to middle position after render
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: screenWidth, animated: false });
    }, 100);
  }, [currentMonthIndex]);

  useFocusEffect(
    React.useCallback(() => {
      loadAdjacentMonths();
    }, [loadAdjacentMonths])
  );

  // Handle scroll end
  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    
    if (offsetX < screenWidth / 2) {
      // Scrolled to previous month
      setCurrentMonthIndex(currentMonthIndex - 1);
    } else if (offsetX > screenWidth * 1.5) {
      // Scrolled to next month
      setCurrentMonthIndex(currentMonthIndex + 1);
    } else {
      // Snap back to center
      scrollViewRef.current?.scrollTo({ x: screenWidth, animated: true });
    }
  };

  // Handle month navigation via buttons
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      scrollViewRef.current?.scrollTo({ x: screenWidth * 2, animated: true });
      setTimeout(() => setCurrentMonthIndex(currentMonthIndex + 1), 300);
    } else {
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      setTimeout(() => setCurrentMonthIndex(currentMonthIndex - 1), 300);
    }
  };

  const getMonthData = (month: Date): DayData[] => {
    const monthKey = format(month, 'yyyy-MM');
    const notes = monthsData[monthKey] || [];
    
    return notes
      .filter(note => note.content && note.content.trim().length > 0)
      .map(note => ({
        date: note.date,
        hasNote: true,
        mood: note.mood,
      }));
  };

  const handleDateSelect = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const monthKey = format(currentMonth, 'yyyy-MM');
    const notes = monthsData[monthKey] || [];
    const noteForDate = notes.find(n => n.date === dateStr);
    
    if (noteForDate?.content && noteForDate.content.trim().length > 0) {
      router.push({
        pathname: '/(tabs)/allnotes',
        params: { scrollToDate: dateStr }
      });
    } else {
      return false;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={StyleSheet.absoluteFillObject}>
        {theme.showNotebookLines && <NotebookBackground />}
      </View>
      
      {/* Header with month navigation */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity 
          onPress={() => navigateMonth('prev')}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.primaryText} />
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: theme.primaryText }]}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        
        <TouchableOpacity 
          onPress={() => navigateMonth('next')}
          style={styles.navButton}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.primaryText} />
        </TouchableOpacity>
      </View>
      
      {/* Calendar content */}
      <View style={styles.calendarWrapper}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primaryText} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
            contentOffset={{ x: screenWidth, y: 0 }}
            style={styles.scrollView}
          >
            {/* Previous month */}
            <View style={styles.monthContainer}>
              <CalendarGrid
                monthData={getMonthData(prevMonth)}
                monthDate={prevMonth}
                selectedDate={null}
                onDateSelect={handleDateSelect}
                notes={monthsData[format(prevMonth, 'yyyy-MM')] || []}
              />
            </View>
            
            {/* Current month */}
            <View style={styles.monthContainer}>
              <CalendarGrid
                monthData={getMonthData(currentMonth)}
                monthDate={currentMonth}
                selectedDate={null}
                onDateSelect={handleDateSelect}
                notes={monthsData[format(currentMonth, 'yyyy-MM')] || []}
              />
            </View>
            
            {/* Next month */}
            <View style={styles.monthContainer}>
              <CalendarGrid
                monthData={getMonthData(nextMonth)}
                monthDate={nextMonth}
                selectedDate={null}
                onDateSelect={handleDateSelect}
                notes={monthsData[format(nextMonth, 'yyyy-MM')] || []}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navButton: {
    padding: 10,
  },
  monthTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: '600',
  },
  calendarWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  monthContainer: {
    width: screenWidth,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});