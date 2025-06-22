import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, PanResponder, Animated, ActivityIndicator } from 'react-native';
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

export default function CalendarScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [monthNotes, setMonthNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Animation for swipe
  const translateX = React.useRef(new Animated.Value(0)).current;
  
  // Load notes for current month
  const loadMonthNotes = React.useCallback(async (month: Date) => {
    setIsLoading(true);
    try {
      const allNotes = await HybridStorageService.getAllNotes();
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const filteredNotes = allNotes.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate >= monthStart && noteDate <= monthEnd;
      });
      
      setMonthNotes(filteredNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonthNotes(currentMonth);
  }, [currentMonth, loadMonthNotes]);

  useFocusEffect(
    React.useCallback(() => {
      loadMonthNotes(currentMonth);
    }, [currentMonth, loadMonthNotes])
  );

  // Handle month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'next' 
      ? addMonths(currentMonth, 1) 
      : subMonths(currentMonth, 1);
    
    // Animate transition
    Animated.timing(translateX, {
      toValue: direction === 'next' ? -400 : 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentMonth(newMonth);
      translateX.setValue(0);
    });
  };

  // Pan responder for swipe gestures
  const panResponder = React.useRef(
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

  const getMonthData = (): DayData[] => {
    return monthNotes
      .filter(note => note.content && note.content.trim().length > 0)
      .map(note => ({
        date: note.date,
        hasNote: true,
        mood: note.mood,
      }));
  };

  const handleDateSelect = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const noteForDate = monthNotes.find(n => n.date === dateStr);
    
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
      <Animated.View 
        style={[
          styles.calendarContainer,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primaryText} />
          </View>
        ) : (
          <CalendarGrid
            monthData={getMonthData()}
            monthDate={currentMonth}
            selectedDate={null}
            onDateSelect={handleDateSelect}
            notes={monthNotes}
          />
        )}
      </Animated.View>
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
  calendarContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});