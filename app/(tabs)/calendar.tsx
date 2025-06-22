import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, PanResponder, Animated, ActivityIndicator, Dimensions } from 'react-native';
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
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [monthsData, setMonthsData] = useState<{ [key: string]: Note[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Animation for swipe
  const translateX = useRef(new Animated.Value(0)).current;
  
  // Load notes for a specific month
  const loadMonthNotes = async (month: Date): Promise<Note[]> => {
    const monthKey = format(month, 'yyyy-MM');
    
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
    
    const prevMonth = subMonths(currentMonth, 1);
    const nextMonth = addMonths(currentMonth, 1);
    
    try {
      const [prevNotes, currentNotes, nextNotes] = await Promise.all([
        loadMonthNotes(prevMonth),
        loadMonthNotes(currentMonth),
        loadMonthNotes(nextMonth),
      ]);
      
      setMonthsData({
        [format(prevMonth, 'yyyy-MM')]: prevNotes,
        [format(currentMonth, 'yyyy-MM')]: currentNotes,
        [format(nextMonth, 'yyyy-MM')]: nextNotes,
      });
    } catch (error) {
      console.error('Error loading months:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadAdjacentMonths();
  }, [loadAdjacentMonths]);

  useFocusEffect(
    React.useCallback(() => {
      loadAdjacentMonths();
    }, [loadAdjacentMonths])
  );

  // Handle month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'next' 
      ? addMonths(currentMonth, 1) 
      : subMonths(currentMonth, 1);
    
    // Animate transition
    Animated.timing(translateX, {
      toValue: direction === 'next' ? -screenWidth : screenWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentMonth(newMonth);
      translateX.setValue(0);
    });
  };

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          navigateMonth('prev');
        } else if (gestureState.dx < -50) {
          navigateMonth('next');
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
      <Animated.View 
        style={[
          styles.header, 
          { 
            paddingTop: Math.max(insets.top, 20),
            transform: [{ translateX }]
          }
        ]}
      >
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
      </Animated.View>
      
      {/* Calendar content */}
      <View style={styles.calendarWrapper}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primaryText} />
          </View>
        ) : (
          <Animated.View 
            style={[
              styles.calendarContainer,
              {
                transform: [{ translateX }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <CalendarGrid
              monthData={getMonthData(currentMonth)}
              monthDate={currentMonth}
              selectedDate={null}
              onDateSelect={handleDateSelect}
              notes={monthsData[format(currentMonth, 'yyyy-MM')] || []}
            />
          </Animated.View>
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
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  calendarContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});