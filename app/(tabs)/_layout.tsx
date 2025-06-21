import { Tabs, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#007AFF',
      headerShown: false 
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Today's Note",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}