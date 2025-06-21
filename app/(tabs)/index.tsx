import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NoteEditor from '../../components/NoteEditor';

export default function TodayScreen() {
  const router = useRouter();

  React.useLayoutEffect(() => {
    router.setParams({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push('/search')}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="search" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [router]);

  return (
    <View style={styles.container}>
      <NoteEditor />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});