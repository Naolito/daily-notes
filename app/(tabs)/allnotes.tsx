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
import { useLocalSearchParams } from 'expo-router';
import HybridStorageService from '../../services/hybridStorage';
import { Note } from '../../types';
import { VerySadEmoji, SadEmoji, NeutralEmoji, HappyEmoji, VeryHappyEmoji } from '../../components/FlatEmojis';
import NotebookBackground from '../../components/NotebookBackground';
import SimpleDashedBorder from '../../components/SimpleDashedBorder';
import { responsivePadding } from '../../utils/responsive';
import { useTheme } from '../../contexts/ThemeContext';
import WelcomeInstructions from '../../components/WelcomeInstructions';

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
    case 1: return <VerySadEmoji size={30} />;
    case 2: return <SadEmoji size={30} />;
    case 3: return <NeutralEmoji size={30} />;
    case 4: return <HappyEmoji size={30} />;
    case 5: return <VeryHappyEmoji size={30} />;
    default: return null;
  }
};

const HighlightedText = ({ text, searchText, textColor, fontFamily, fontSize }: { text: string; searchText: string; textColor: string; fontFamily?: string; fontSize: number }) => {
  if (!searchText.trim()) {
    return <Text style={[styles.noteText, { color: textColor, fontFamily, fontSize, lineHeight: fontSize + 4 }]}>{text}</Text>;
  }

  const parts = text.split(new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <Text style={[styles.noteText, { color: textColor, fontFamily, fontSize, lineHeight: fontSize + 4 }]}>
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

const NoteItem = ({ item, searchText, theme }: { item: Note; searchText: string; theme: any }) => {
  const [itemHeight, setItemHeight] = useState(0);
  const noteWidth = screenWidth - 32;
  const borderColor = item.mood ? moodColors[item.mood] : theme.borderColor;
  
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
      {itemHeight > 0 && theme.useDottedBorders && (
        <SimpleDashedBorder width={noteWidth} height={itemHeight} color={borderColor} />
      )}
      <TouchableOpacity style={[
        styles.noteItem,
        theme.cardStyle && !theme.useDottedBorders && {
          ...theme.cardStyle,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
          marginBottom: 12,
          borderWidth: item.mood ? 2 : 0,
          borderColor: item.mood ? moodColors[item.mood] : 'transparent',
        }
      ]}>
        <View style={styles.noteHeader}>
          <Text style={[
            styles.noteDate, 
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
            {format(new Date(item.date), 'EEEE, MMMM d, yyyy')}
          </Text>
          {item.mood && getMoodEmoji(item.mood)}
        </View>
        {item.content ? (
          <HighlightedText 
            text={item.content} 
            searchText={searchText} 
            textColor={theme.primaryText} 
            fontFamily={theme.useHandwrittenFont ? 'LettersForLearners' : undefined}
            fontSize={theme.useHandwrittenFont ? 26 : 16}
          />
        ) : (
          <Text style={[
            styles.noteText, 
            { 
              color: theme.primaryText,
              opacity: 0.5,
              fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
              fontSize: theme.useHandwrittenFont ? 26 : 16,
              lineHeight: (theme.useHandwrittenFont ? 26 : 16) + 4
            }
          ]}>
            Type here...
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function AllNotesScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollToDate, setScrollToDate] = useState<string | undefined>();
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToNote = (index: number, totalNotes: number) => {
    // More generous height estimation to ensure we scroll far enough
    // Most notes with text + mood + spacing are taller than expected
    const estimatedNoteHeight = 180; // Increased from 100-130
    const noteMargin = 16; // marginBottom from noteWrapper
    
    // Calculate total height per note
    const heightPerNote = estimatedNoteHeight + noteMargin;
    
    // Calculate position
    const topPadding = 16; // from notesContainer
    const yPosition = topPadding + (index * heightPerNote);
    
    const screenHeight = Dimensions.get('window').height;
    // Center the note on screen
    const scrollY = Math.max(0, yPosition - screenHeight / 2 + estimatedNoteHeight / 2);
    
    console.log(`Note height estimate: ${heightPerNote}px, scrolling to Y: ${scrollY}`);
    scrollViewRef.current?.scrollTo({ y: scrollY, animated: false });
  };

  useEffect(() => {
    loadAllNotes();
  }, []);
  
  useFocusEffect(
    React.useCallback(() => {
      // Reload notes every time the screen gains focus
      loadAllNotes();
    }, [params.scrollToDate])
  );

  const loadAllNotes = async () => {
    try {
      const allNotes = await HybridStorageService.getAllNotes();
      // Filter out notes without content
      const notesWithContent = allNotes.filter(note => note.content && note.content.trim().length > 0);
      const sortedNotes = notesWithContent.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      setNotes(sortedNotes);
      
      // Store sorted notes for scroll calculation
      setScrollToDate(params.scrollToDate as string | undefined);
      
      // Check if we should scroll to a specific date
      if (params.scrollToDate && sortedNotes.length > 0) {
        // Find the note with the specified date
        const targetNoteIndex = sortedNotes.findIndex(note => note.date === params.scrollToDate);
        if (targetNoteIndex !== -1) {
          // Delay scroll to ensure layout is complete
          setTimeout(() => {
            console.log(`Scrolling to date ${params.scrollToDate} at index ${targetNoteIndex} of ${sortedNotes.length} notes`);
            scrollToNote(targetNoteIndex, sortedNotes.length);
          }, 300);
        }
      } else if (sortedNotes.length > 0 && !params.scrollToDate) {
        // Default behavior: scroll to end
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 50);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundColor }]}>
        <Text style={{ color: theme.primaryText }}>Loading...</Text>
      </View>
    );
  }

  // Always show welcome instructions as the first item

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View 
          style={styles.notesContainer}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            setContentHeight(height + 100); // Add extra space
          }}
        >
          {!searchText.trim() && (
            <WelcomeInstructions />
          )}
          {notes
            .filter((item) => {
              if (!searchText.trim()) return true;
              return item.content?.toLowerCase().includes(searchText.toLowerCase());
            })
            .map((item, index) => (
              <View key={item.id} id={`note-${item.date}`}>
                <NoteItem 
                  item={item} 
                  searchText={searchText} 
                  theme={theme}
                />
              </View>
            ))}
        </View>
      </ScrollView>
      <View style={[
        styles.searchBarContainer, 
        { 
          backgroundColor: theme.themeType === 'paper' ? 'transparent' : theme.searchBarBackground, 
          borderTopColor: theme.themeType === 'paper' ? 'transparent' : theme.dividerColor,
          paddingHorizontal: theme.themeType === 'paper' ? 20 : 16,
        }
      ]}>
        <TextInput
          style={[
            styles.searchBar, 
            { 
              backgroundColor: theme.surfaceColor, 
              color: theme.searchBarText,
              ...(theme.themeType === 'paper' && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 0,
              })
            }
          ]}
          placeholder="Search..."
          placeholderTextColor={theme.secondaryText}
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
    backgroundColor: '#f5f0eb',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f0eb',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f0eb',
    padding: 20,
  },
  emptyText: {
    fontSize: 24,
    color: '#4a4a4a',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
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
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4a4a4a',
    flex: 1,
    marginRight: 8,
  },
  noteText: {
    fontSize: 26,
    lineHeight: responsivePadding(26), // Exact match with notebook lines
    color: '#1a1a1a',
    letterSpacing: -0.3,
    paddingTop: responsivePadding(26) - 26 + 8, // Align text to bottom of lines
  },
  searchBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgb(220, 214, 214)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 8,
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