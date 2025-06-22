import React, { useState, useEffect } from 'react';
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
  const translateX = React.useRef(new Animated.Value(0)).current;
  
  // Get the three months we need
  const prevMonth = subMonths(currentMonth, 1);
  const nextMonth = addMonths(currentMonth, 1);
  
  // Load notes for a specific month
  const loadMonthNotes = React.useCallback(async (month: Date) => {
    const monthKey = format(month, 'yyyy-MM');
    
    // If already loaded, skip
    if (monthsData[monthKey]) return;
    
    try {
      const allNotes = await HybridStorageService.getAllNotes();
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const filteredNotes = allNotes.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate >= monthStart && noteDate <= monthEnd;
      });
      
      setMonthsData(prev => ({
        ...prev,
        [monthKey]: filteredNotes
      }));
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }, [monthsData]);

  // Load current month and adjacent months
  const loadAdjacentMonths = React.useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      loadMonthNotes(prevMonth),
      loadMonthNotes(currentMonth),
      loadMonthNotes(nextMonth),
    ]);
    setIsLoading(false);
  }, [currentMonth, prevMonth, nextMonth, loadMonthNotes]);

  useEffect(() => {
    loadAdjacentMonths();
  }, [currentMonth]);

  useFocusEffect(
    React.useCallback(() => {
      // Reload current month when screen gains focus
      const monthKey = format(currentMonth, 'yyyy-MM');
      setMonthsData(prev => {
        const updated = { ...prev };
        delete updated[monthKey];
        return updated;
      });
      loadMonthNotes(currentMonth);
    }, [currentMonth, loadMonthNotes])
  );

  // Handle month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'next' ? nextMonth : prevMonth;
    setCurrentMonth(newMonth);
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
          // Swipe right - go to previous month
          Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            navigateMonth('prev');
            translateX.setValue(0);
          });
        } else if (gestureState.dx < -50) {
          // Swipe left - go to next month
          Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            navigateMonth('next');
            translateX.setValue(0);
          });
        } else {
          // Snap back
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
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          onPress={() => navigateMonth('prev')}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.primaryText} />
        </TouchableOpacity>
        
        <View style={styles.monthTitleContainer}>
          {/* Previous month (hidden, for swipe) */}
          <Text style={[styles.monthTitle, styles.hiddenMonth, { color: theme.primaryText }]}>
            {format(prevMonth, 'MMMM yyyy')}
          </Text>
          
          {/* Current month */}
          <Text style={[styles.monthTitle, { color: theme.primaryText }]}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          
          {/* Next month (hidden, for swipe) */}
          <Text style={[styles.monthTitle, styles.hiddenMonth, { color: theme.primaryText }]}>
            {format(nextMonth, 'MMMM yyyy')}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => navigateMonth('next')}
          style={styles.navButton}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.primaryText} />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Calendar content */}
      <View style={styles.calendarWrapper}>
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
            <View style={styles.monthsContainer}>
              {/* Previous month */}
              <View style={styles.monthView}>
                <CalendarGrid
                  monthData={getMonthData(prevMonth)}
                  monthDate={prevMonth}
                  selectedDate={null}
                  onDateSelect={handleDateSelect}
                  notes={monthsData[format(prevMonth, 'yyyy-MM')] || []}
                />
              </View>
              
              {/* Current month */}
              <View style={styles.monthView}>
                <CalendarGrid
                  monthData={getMonthData(currentMonth)}
                  monthDate={currentMonth}
                  selectedDate={null}
                  onDateSelect={handleDateSelect}
                  notes={monthsData[format(currentMonth, 'yyyy-MM')] || []}
                />
              </View>
              
              {/* Next month */}
              <View style={styles.monthView}>
                <CalendarGrid
                  monthData={getMonthData(nextMonth)}
                  monthDate={nextMonth}
                  selectedDate={null}
                  onDateSelect={handleDateSelect}
                  notes={monthsData[format(nextMonth, 'yyyy-MM')] || []}
                />
              </View>
            </View>
          )}
        </Animated.View>
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
  monthTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  monthTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: '600',
    position: 'absolute',
  },
  hiddenMonth: {
    opacity: 0,
  },
  calendarWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  calendarContainer: {
    flex: 1,
  },
  monthsContainer: {
    flexDirection: 'row',
    width: screenWidth * 3,
    marginLeft: -screenWidth,
  },
  monthView: {
    width: screenWidth,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});