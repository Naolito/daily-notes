import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
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
import { VerySadEmoji, SadEmoji, NeutralEmoji, HappyEmoji, VeryHappyEmoji } from '../../components/FlatEmojis';

const getMoodEmoji = (mood: number) => {
  switch (mood) {
    case 1:
      return <VerySadEmoji size={24} />;
    case 2:
      return <SadEmoji size={24} />;
    case 3:
      return <NeutralEmoji size={24} />;
    case 4:
      return <HappyEmoji size={24} />;
    case 5:
      return <VeryHappyEmoji size={24} />;
    default:
      return null;
  }
};

export default function CalendarScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [monthNotes, setMonthNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const router = useRouter();

  // Load notes for current month
  const loadMonthNotes = async (month: Date) => {
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
      setMonthNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load notes on mount and when month changes
  useEffect(() => {
    loadMonthNotes(currentMonth);
  }, [currentMonth]);

  // Reload when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadMonthNotes(currentMonth);
    }, [currentMonth])
  );

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
    setSelectedNote(null);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
    setSelectedNote(null);
  };

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
      setSelectedDate(date);
      setSelectedNote(noteForDate);
    } else {
      setSelectedDate(null);
      setSelectedNote(null);
      return false;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Calendar section without notebook lines */}
      <View style={[styles.calendarSection, { backgroundColor: theme.backgroundColor }]}>
        {/* Header with month navigation */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity 
          onPress={goToPreviousMonth}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.primaryText} />
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: theme.primaryText }]}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        
        <TouchableOpacity 
          onPress={goToNextMonth}
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
          <CalendarGrid
            monthData={getMonthData()}
            monthDate={currentMonth}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            notes={monthNotes}
          />
        )}
        </View>
      </View>
      
      {/* Selected note display - match Today screen layout */}
      {selectedNote && (
        <View style={styles.noteDisplayWrapper}>
          {/* Date header box */}
          <View style={styles.dateHeaderWrapper}>
            <View style={styles.dateHeaderBox}>
              <View style={styles.dateHeaderRow}>
                <Text style={[
                  styles.dateHeaderText, 
                  { 
                    color: theme.secondaryText,
                    fontFamily: theme.useHandwrittenFont 
                      ? Platform.select({
                          ios: 'Noteworthy-Bold',
                          android: 'sans-serif',
                          default: "'Patrick Hand', cursive"
                        })
                      : undefined
                  }
                ]}>
                  {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </Text>
                {selectedNote.mood && (
                  <View style={styles.moodContainer}>
                    {getMoodEmoji(selectedNote.mood)}
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {/* Note content with notebook lines */}
          <ScrollView 
            style={styles.noteContentScrollView}
            contentContainerStyle={styles.noteContentContainer}
          >
            {theme.showNotebookLines && (
              <View style={StyleSheet.absoluteFillObject}>
                <NotebookBackground 
                  startFromTop={true}
                  textOffset={10}
                  lineColor={theme.notebookLineColor}
                  opacity={theme.notebookLineOpacity}
                />
              </View>
            )}
            <Text style={[
              styles.noteText, 
              { 
                color: theme.primaryText,
                fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
                fontSize: theme.useHandwrittenFont ? 26 : 16,
                lineHeight: 26,  // Fixed line height to match notebook lines
                paddingTop: 10, // Match the text offset to align with lines
              }
            ]}>
              {selectedNote.content}
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarSection: {
    paddingBottom: 0,
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
    paddingHorizontal: 16,
  },
  loadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteDisplayWrapper: {
    flex: 1,
    paddingHorizontal: 32, // Match Today screen margins
  },
  dateHeaderWrapper: {
    marginTop: 0,
    marginBottom: 8,
  },
  dateHeaderBox: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateHeaderText: {
    fontSize: 20,
    fontWeight: '500',
  },
  moodContainer: {
    marginLeft: 8,
  },
  noteContentScrollView: {
    flex: 1,
  },
  noteContentContainer: {
    paddingTop: 0, // No top padding, text handles it
    paddingBottom: 20,
    minHeight: '100%',
  },
  noteText: {
    fontSize: 26,
    lineHeight: 26, // Fixed to match notebook lines
    letterSpacing: -0.3,
    textAlignVertical: 'top',
  },
});