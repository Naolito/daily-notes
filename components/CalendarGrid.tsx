import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { DayData } from '../types';

interface CalendarGridProps {
  monthData: DayData[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const moodColors = {
  1: '#FF6B6B',
  2: '#FFA06B',
  3: '#FFD93D',
  4: '#6BCF7F',
  5: '#4ECDC4',
};

export default function CalendarGrid({ monthData, selectedDate, onDateSelect }: CalendarGridProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
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
      <Text style={styles.monthTitle}>{format(selectedDate, 'MMMM yyyy')}</Text>
      
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.daysContainer}>
        {days.map((day) => {
          const dayData = getDayData(day);
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[
                styles.day,
                !isCurrentMonth && styles.otherMonth,
                isSelected && styles.selectedDay,
                isToday && styles.today,
              ]}
              onPress={() => onDateSelect(day)}
            >
              <Text style={[
                styles.dayText,
                !isCurrentMonth && styles.otherMonthText,
                isSelected && styles.selectedDayText,
              ]}>
                {format(day, 'd')}
              </Text>
              {dayData?.hasNote && (
                <View 
                  style={[
                    styles.indicator,
                    dayData.mood && { backgroundColor: moodColors[dayData.mood] }
                  ]} 
                />
              )}
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
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  otherMonth: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: '#999',
  },
  selectedDay: {
    backgroundColor: '#007AFF20',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  today: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 20,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    position: 'absolute',
    bottom: 4,
  },
});