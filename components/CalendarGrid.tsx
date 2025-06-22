import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { DayData, Note } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { responsiveFontSize } from '../utils/responsive';

interface CalendarGridProps {
  monthData: DayData[];
  monthDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => Promise<void | boolean>;
  notes?: Note[];
}

const moodColors = {
  1: '#F44336',
  2: '#FF9800',
  3: '#FFC107',
  4: '#8BC34A',
  5: '#4CAF50',
};

// Function to darken a color by 30%
const darkenColor = (hex: string): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) * 0.7);
  const g = Math.max(0, ((num >> 8) & 0x00FF) * 0.7);
  const b = Math.max(0, (num & 0x0000FF) * 0.7);
  return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
};

export default function CalendarGrid({ monthData, monthDate, selectedDate, onDateSelect, notes = [] }: CalendarGridProps) {
  const { theme } = useTheme();
  const [shakingDate, setShakingDate] = useState<string | null>(null);
  const shakeAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Determine empty day color based on theme
  const emptyDayColor = theme.themeType === 'pink' 
    ? 'rgb(236, 202, 202)' 
    : theme.themeType === 'dark' 
      ? '#2e2f34'
      : 'rgb(220, 214, 214)';

  const getDayData = (date: Date): DayData | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return monthData.find(d => d.date === dateStr);
  };

  const triggerShake = (dateStr: string) => {
    if (!shakeAnimations[dateStr]) {
      shakeAnimations[dateStr] = new Animated.Value(0);
    }
    
    Animated.sequence([
      Animated.timing(shakeAnimations[dateStr], {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimations[dateStr], {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimations[dateStr], {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimations[dateStr], {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <Text key={day} style={[styles.weekDay, { color: theme.secondaryText }]}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.daysContainer}>
        {days.map((day) => {
          const dayData = getDayData(day);
          const isCurrentMonth = day.getMonth() === monthStart.getMonth();
          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const hasNote = dayData?.hasNote;
          const moodColor = dayData?.mood ? moodColors[dayData.mood] : undefined;
          
          // Check if this date has content
          const dateStr = format(day, 'yyyy-MM-dd');
          const noteWithContent = notes.find(n => n.date === dateStr && n.content && n.content.trim().length > 0);
          const hasContent = !!noteWithContent;
          
          // Determine background color for empty days
          const emptyBgColor = isCurrentMonth ? emptyDayColor : (theme.themeType === 'dark' ? '#26272a' : emptyDayColor);
          
          // Determine dot color (darken the box color by 30%)
          const dotColor = moodColor ? darkenColor(moodColor) : (theme.themeType === 'dark' ? '#4a4c52' : darkenColor(emptyDayColor));
          
          // Initialize shake animation for this date if not exists
          if (!shakeAnimations[dateStr]) {
            shakeAnimations[dateStr] = new Animated.Value(0);
          }
          
          const handlePress = async () => {
            const result = await onDateSelect(day);
            if (result === false) {
              triggerShake(dateStr);
            }
          };
          
          return (
            <Animated.View
              key={day.toISOString()}
              style={[
                styles.day,
                !isCurrentMonth && styles.otherMonth,
                {
                  transform: [{ translateX: shakeAnimations[dateStr] || new Animated.Value(0) }]
                }
              ]}
            >
              <TouchableOpacity
                onPress={handlePress}
                style={{ flex: 1 }}
              >
              <View style={[
                styles.dayBox,
                { backgroundColor: emptyBgColor },
                hasNote && moodColor && { backgroundColor: moodColor },
                isSelected && [styles.selectedDayBox, theme.themeType === 'dark' && { borderColor: '#4a8ef4' }],
                isToday && [styles.todayBox, theme.themeType === 'dark' && { borderColor: theme.borderColor }],
              ]}>
                <Text style={[
                  styles.dayText,
                  !isCurrentMonth && { 
                    color: theme.themeType === 'dark' ? theme.secondaryText : '#999',
                    opacity: theme.themeType === 'dark' ? 0.5 : 1
                  },
                  hasNote && styles.dayTextWithMood,
                  isSelected && styles.selectedDayText,
                  !hasNote && isCurrentMonth && { color: theme.primaryText },
                ]}>
                  {format(day, 'd')}
                </Text>
                {hasContent && (
                  <View style={[styles.contentIndicator, { backgroundColor: dotColor }]} />
                )}
              </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: responsiveFontSize(12),
    color: '#666',
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
  },
  dayBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  emptyDayBox: {
    backgroundColor: 'rgb(220, 214, 214)',
  },
  selectedDayBox: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  todayBox: {
    borderWidth: 2,
    borderColor: '#333',
  },
  dayText: {
    fontSize: responsiveFontSize(16),
    color: '#333',
  },
  dayTextWithMood: {
    color: '#fff',
    fontWeight: 'bold',
  },
  otherMonth: {
    // Opacity handled inline based on theme
  },
  otherMonthText: {
    color: '#999',
  },
  selectedDayText: {
    fontWeight: 'bold',
  },
  contentIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});