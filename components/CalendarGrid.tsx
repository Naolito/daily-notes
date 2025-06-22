import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { DayData } from '../types';

interface CalendarGridProps {
  monthData: DayData[];
  monthDate: Date;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const moodColors = {
  1: '#F44336',
  2: '#FF9800',
  3: '#FFC107',
  4: '#8BC34A',
  5: '#4CAF50',
};

export default function CalendarGrid({ monthData, monthDate, selectedDate, onDateSelect }: CalendarGridProps) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayData = (date: Date): DayData | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return monthData.find(d => d.date === dateStr);
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
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
          
          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[
                styles.day,
                !isCurrentMonth && styles.otherMonth,
              ]}
              onPress={() => onDateSelect(day)}
            >
              <View style={[
                styles.dayBox,
                hasNote && moodColor && { backgroundColor: moodColor },
                !hasNote && styles.emptyDayBox,
                isSelected && styles.selectedDayBox,
                isToday && styles.todayBox,
              ]}>
                <Text style={[
                  styles.dayText,
                  !isCurrentMonth && styles.otherMonthText,
                  hasNote && styles.dayTextWithMood,
                  isSelected && styles.selectedDayText,
                ]}>
                  {format(day, 'd')}
                </Text>
              </View>
            </TouchableOpacity>
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
    fontSize: 12,
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
    backgroundColor: '#f0f0f0',
  },
  emptyDayBox: {
    backgroundColor: '#f0f0f0',
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
    fontSize: 16,
    color: '#333',
  },
  dayTextWithMood: {
    color: '#fff',
    fontWeight: 'bold',
  },
  otherMonth: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: '#999',
  },
  selectedDayText: {
    fontWeight: 'bold',
  },
});