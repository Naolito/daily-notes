import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ACTIVE_COLOR = '#2196F3'; // Blue for active tab

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <View key={route.key} style={styles.tabWrapper}>
              <TouchableOpacity
                onPress={onPress}
                style={[
                  styles.tab,
                  isFocused && styles.activeTab
                ]}
              >
                {route.name === 'index' && <Ionicons name="today-outline" size={32} color={isFocused ? ACTIVE_COLOR : '#666'} />}
                {route.name === 'allnotes' && <Ionicons name="search-outline" size={32} color={isFocused ? ACTIVE_COLOR : '#666'} />}
                {route.name === 'calendar' && <Ionicons name="calendar-outline" size={32} color={isFocused ? ACTIVE_COLOR : '#666'} />}
                {route.name === 'settings' && <Ionicons name="settings-outline" size={32} color={isFocused ? ACTIVE_COLOR : '#666'} />}
                <Text style={[
                  styles.tabText,
                  { color: isFocused ? ACTIVE_COLOR : '#666' }
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f0eb',
    borderTopWidth: 2,
    borderTopColor: '#e8dfd6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    height: 70,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabWrapper: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
  },
  tab: {
    width: 90,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: -4,
  },
  activeTab: {
    transform: [{ translateY: -2 }],
  },
  tabText: {
    fontSize: 12,
    marginTop: 2,
  },
});