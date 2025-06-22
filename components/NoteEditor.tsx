import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import MoodSelector from './MoodSelector';
import PaperTexture from './PaperTexture';
import NotebookBackground from './NotebookBackground';
import SimpleDashedBorder from './SimpleDashedBorder';
import { Note, Mood } from '../types';
import { NoteService } from '../services/noteService';
import { StorageService } from '../services/storage';
import { generateJuneMockData } from '../utils/generateMockData';
import { responsiveFontSize, responsivePadding, heightPercentage, scale } from '../utils/responsive';
import { VerySadEmoji, SadEmoji, NeutralEmoji, HappyEmoji, VeryHappyEmoji } from '../components/FlatEmojis';
import { Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';


const { width: screenWidth } = Dimensions.get('window');

const moodEmojis = {
  1: VerySadEmoji,
  2: SadEmoji,
  3: NeutralEmoji,
  4: HappyEmoji,
  5: VeryHappyEmoji,
};

const moodColors = {
  1: '#F44336',
  2: '#FF9800',
  3: '#FFC107',
  4: '#8BC34A',
  5: '#4CAF50',
};

export default function NoteEditor() {
  const { theme } = useTheme();
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateBoxHeight, setDateBoxHeight] = useState(0);
  const [lastText, setLastText] = useState('');
  const textInputRef = React.useRef<TextInput>(null);
  
  // Animation values for mood appearance
  const moodFadeAnim = useRef(new Animated.Value(0)).current;
  const moodScaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    loadCurrentNote();
  }, []);
  
  useFocusEffect(
    React.useCallback(() => {
      loadCurrentNote();
    }, [])
  );

  const loadCurrentNote = async () => {
    try {
      // Always use today's date for the Today's Notes screen
      const today = new Date();
      setCurrentDate(today);
      await StorageService.setCurrentDate(today);
      
      const currentNote = await NoteService.getCurrentNote();
      console.log('Current note:', currentNote); // Debug
      
      if (currentNote) {
        setNote(currentNote);
        // Treat whitespace-only content as empty when loading
        const loadedContent = currentNote.content?.trim() ? currentNote.content : '';
        setContent(loadedContent);
        setSelectedMood(currentNote.mood);
        setImages(currentNote.images);
        // If mood exists, set animation values to show it
        if (currentNote.mood) {
          moodFadeAnim.setValue(1);
          moodScaleAnim.setValue(1);
        }
      } else {
        // No note exists for this date
        setNote(null);
        setContent('');
        setSelectedMood(undefined);
        setImages([]);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async () => {
    try {
      // Treat whitespace-only content as empty
      const trimmedContent = content.trim();
      const contentToSave = trimmedContent.length === 0 ? '' : content;
      
      const savedNote = await NoteService.saveCurrentNote(contentToSave, selectedMood, images);
      setNote(savedNote);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleContentChange = (text: string) => {
    let processedText = text;
    
    // Check for "- " pattern anywhere in the text
    const lines = processedText.split('\n');
    let textChanged = false;
    
    for (let i = 0; i < lines.length; i++) {
      // Convert "- " at the beginning of any line to bullet
      if (lines[i].startsWith('- ')) {
        lines[i] = '• ' + lines[i].substring(2);
        textChanged = true;
      }
    }
    
    if (textChanged) {
      processedText = lines.join('\n');
    }
    
    // Handle enter key for bullet continuation
    if (text.length > lastText.length && text.slice(lastText.length) === '\n') {
      const newLines = processedText.split('\n');
      const previousLine = newLines[newLines.length - 2];
      
      // If previous line was a bullet point
      if (previousLine && previousLine.trim().startsWith('•')) {
        // If previous line only had the bullet, remove it and the newline
        if (previousLine.trim() === '•') {
          newLines.splice(newLines.length - 2, 2, '');
          processedText = newLines.join('\n');
        }
        // If previous line had content, add bullet to new line
        else {
          newLines[newLines.length - 1] = '• ';
          processedText = newLines.join('\n');
        }
      }
    }
    
    setLastText(processedText);
    setContent(processedText);
    saveNote();
  };

  const handleMoodSelect = async (mood: Mood | undefined) => {
    if (mood && !selectedMood) {
      // Animate mood appearance
      setSelectedMood(mood);
      Animated.parallel([
        Animated.timing(moodFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(moodScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!mood) {
      // Animate mood disappearance
      Animated.parallel([
        Animated.timing(moodFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(moodScaleAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSelectedMood(mood);
      });
    }
    
    const currentNote = await NoteService.getCurrentNote();
    if (currentNote) {
      currentNote.mood = mood;
      currentNote.updatedAt = new Date();
      await StorageService.saveNote(currentNote);
    } else if (mood) {
      await NoteService.saveCurrentNote('', mood);
    }
  };

  const focusTextInput = () => {
    textInputRef.current?.focus();
  };


  const displayDate = format(currentDate, 'EEEE, MMMM d');

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundColor }]}>
        <Text style={{ color: theme.primaryText }}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={StyleSheet.absoluteFillObject}>
        {theme.themeType === 'notebook' && <PaperTexture />}
        {theme.showNotebookLines && (
          <NotebookBackground 
            startFromTop={true} 
            lineColor={theme.notebookLineColor}
            opacity={theme.notebookLineOpacity}
          />
        )}
      </View>
      <View style={styles.contentContainer}>
        <View 
          style={styles.dateWrapper}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            if (height !== dateBoxHeight) {
              setDateBoxHeight(height);
            }
          }}
        >
          {dateBoxHeight > 0 && theme.useDottedBorders && (
            <SimpleDashedBorder 
              width={screenWidth - 64} 
              height={dateBoxHeight} 
              color={selectedMood ? moodColors[selectedMood] : theme.borderColor} 
            />
          )}
          <View style={[
            styles.dateBox,
            theme.cardStyle && !theme.useDottedBorders && {
              ...theme.cardStyle,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
              borderColor: selectedMood ? moodColors[selectedMood] : theme.cardStyle.borderColor,
            }
          ]}>
            <View style={styles.dateRow}>
              <Text style={[
                styles.dateHeader, 
                { 
                  color: theme.primaryText,
                  fontFamily: theme.useHandwrittenFont 
                    ? Platform.select({
                        ios: 'Noteworthy-Bold',
                        android: 'sans-serif',
                        default: "'Patrick Hand', cursive"
                      })
                    : undefined,
                  fontSize: responsiveFontSize(theme.useHandwrittenFont ? 32 : 24),
                }
              ]}>{displayDate}</Text>
              {selectedMood && (
                <Animated.View 
                  style={[
                    styles.moodInHeader,
                    {
                      opacity: moodFadeAnim,
                      transform: [{ scale: moodScaleAnim }],
                    }
                  ]}
                >
                  <TouchableOpacity onPress={() => handleMoodSelect(undefined)}>
                    {React.createElement(moodEmojis[selectedMood], { size: 32 })}
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.touchableArea} 
          activeOpacity={1}
          onPress={focusTextInput}
        >
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput, 
              { 
                color: theme.primaryText,
                fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
                fontSize: responsiveFontSize(theme.useHandwrittenFont ? 26 : 18),
                lineHeight: theme.useHandwrittenFont ? responsivePadding(26) : responsiveFontSize(24),
                paddingTop: theme.useHandwrittenFont ? (responsivePadding(26) - 26 + 8) : 8,
              }
            ]}
            multiline
            value={content}
            onChangeText={handleContentChange}
            textAlignVertical="top"
            scrollEnabled
            autoCorrect={false}
            autoCapitalize="sentences"
            placeholder="Type here..."
            placeholderTextColor={`${theme.secondaryText}80`}
          />
        </TouchableOpacity>
      </View>
      
      <MoodSelector 
        selectedMood={selectedMood}
        onMoodSelect={handleMoodSelect}
      />
      
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f0eb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f0eb',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 32, // More side margins
    paddingTop: 16,
    flex: 1,
  },
  dateWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  dateBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dateHeader: {
    fontSize: 32,
    fontWeight: '400',
    color: '#2c2c2c',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  moodInHeader: {
    marginTop: 2,
  },
  touchableArea: {
    flex: 1,
  },
  textInput: {
    fontSize: 26,
    lineHeight: responsivePadding(26), // Exact match with notebook lines
    color: '#1a1a1a',
    backgroundColor: 'transparent',
    textAlignVertical: 'top',
    letterSpacing: -0.3,
    padding: 0,
    paddingTop: responsivePadding(26) - 26 + 8, // Align text to bottom of lines
    flex: 1,
    borderWidth: 0,
    borderColor: 'transparent',
    outlineStyle: 'none',
  },
});