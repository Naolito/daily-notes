import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { StorageService } from '../../services/storage';
import { Note } from '../../types';
import { VerySadEmoji, SadEmoji, NeutralEmoji, HappyEmoji, VeryHappyEmoji } from '../../components/FlatEmojis';
import NotebookBackground from '../../components/NotebookBackground';
import SimpleDashedBorder from '../../components/SimpleDashedBorder';

const { width: screenWidth } = Dimensions.get('window');

const moodColors = {
  1: '#F44336',
  2: '#FF9800',
  3: '#FFC107',
  4: '#8BC34A',
  5: '#4CAF50',
};

const getMoodEmoji = (mood: number) => {
  switch (mood) {
    case 1: return <VerySadEmoji size={24} />;
    case 2: return <SadEmoji size={24} />;
    case 3: return <NeutralEmoji size={24} />;
    case 4: return <HappyEmoji size={24} />;
    case 5: return <VeryHappyEmoji size={24} />;
    default: return null;
  }
};

const HighlightedText = ({ text, searchText }: { text: string; searchText: string }) => {
  if (!searchText.trim()) {
    return <Text style={styles.noteText}>{text}</Text>;
  }

  const parts = text.split(new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <Text style={styles.noteText}>
      {parts.map((part, index) => {
        if (part.toLowerCase() === searchText.toLowerCase()) {
          return (
            <Text key={index} style={styles.highlightedText}>
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

const NoteItem = ({ item, searchText }: { item: Note; searchText: string }) => {
  const [itemHeight, setItemHeight] = useState(0);
  const noteWidth = screenWidth - 32;
  const borderColor = item.mood ? moodColors[item.mood] : '#333';
  
  return (
    <View 
      style={styles.noteWrapper}
      onLayout={(e) => {
        const { height } = e.nativeEvent.layout;
        if (height !== itemHeight) {
          setItemHeight(height);
        }
      }}
    >
      {itemHeight > 0 && (
        <SimpleDashedBorder width={noteWidth} height={itemHeight} color={borderColor} />
      )}
      <TouchableOpacity style={styles.noteItem}>
        <View style={styles.noteHeader}>
          <Text style={styles.noteDate}>
            {format(new Date(item.date), 'EEEE, MMMM d, yyyy')}
          </Text>
          {item.mood && getMoodEmoji(item.mood)}
        </View>
        <HighlightedText text={item.content || 'No content'} searchText={searchText} />
      </TouchableOpacity>
    </View>
  );
};

export default function AllNotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadAllNotes();
  }, []);
  
  useFocusEffect(
    React.useCallback(() => {
      if (notes.length > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }, [notes.length])
  );

  const loadAllNotes = async () => {
    try {
      const allNotes = await StorageService.getAllNotes();
      const sortedNotes = allNotes.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setNotes(sortedNotes);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (notes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No notes yet</Text>
        <Text style={styles.emptySubtext}>Start writing your daily thoughts!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={StyleSheet.absoluteFillObject}>
          <NotebookBackground startFromTop={true} />
        </View>
        <View style={styles.notesContainer}>
          {notes
            .filter((item) => {
              if (!searchText.trim()) return true;
              return item.content?.toLowerCase().includes(searchText.toLowerCase());
            })
            .map((item) => (
              <NoteItem key={item.id} item={item} searchText={searchText} />
            ))}
        </View>
      </ScrollView>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf0e6',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf0e6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf0e6',
    padding: 20,
  },
  emptyText: {
    fontSize: 24,
    fontFamily: Platform.select({
      ios: 'Noteworthy-Bold',
      android: 'sans-serif',
      default: "'Patrick Hand', cursive"
    }),
    color: '#4a4a4a',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'Noteworthy-Light',
      android: 'sans-serif',
      default: "'Patrick Hand', cursive"
    }),
    color: '#666',
  },
  notesContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for search bar
  },
  noteWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  noteItem: {
    padding: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4a4a4a',
    fontFamily: Platform.select({
      ios: 'Noteworthy-Bold',
      android: 'sans-serif',
      default: "'Patrick Hand', cursive"
    }),
    flex: 1,
    marginRight: 8,
  },
  noteText: {
    fontSize: 22,
    lineHeight: 28,
    color: '#1a1a1a',
    fontFamily: 'LettersForLearners',
    letterSpacing: -0.3,
  },
  searchBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#faf0e6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'sans-serif'
    }),
    color: '#333',
  },
  highlightedText: {
    backgroundColor: '#ffeb3b',
    color: '#1a1a1a',
  },
});