import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { StorageService } from '../services/storage';
import { Note } from '../types';
import { responsiveFontSize } from '../utils/responsive';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setIsSearching(true);
      try {
        const results = await StorageService.searchNotes(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching notes:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity style={styles.noteItem}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteDate}>
          {format(new Date(item.date), 'EEEE, MMMM d, yyyy')}
        </Text>
        {item.mood && (
          <Text style={styles.noteMood}>
            {['😢', '😕', '😐', '🙂', '😊'][item.mood - 1]}
          </Text>
        )}
      </View>
      <Text style={styles.noteContent} numberOfLines={3}>
        {item.content}
      </Text>
      {item.images.length > 0 && (
        <View style={styles.imageIndicator}>
          <Ionicons name="image-outline" size={16} color="#007AFF" />
          <Text style={styles.imageCount}>{item.images.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your notes..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
        />
      </View>
      
      {isSearching ? (
        <View style={styles.centerContainer}>
          <Text style={styles.statusText}>Searching...</Text>
        </View>
      ) : searchQuery.trim() === '' ? (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={48} color="#CCC" />
          <Text style={styles.statusText}>Start typing to search</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.statusText}>No results found</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: responsiveFontSize(16),
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: responsiveFontSize(16),
    color: '#999',
    marginTop: 16,
  },
  listContainer: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
    color: '#666',
  },
  noteMood: {
    fontSize: responsiveFontSize(20),
  },
  noteContent: {
    fontSize: responsiveFontSize(14),
    lineHeight: responsiveFontSize(20),
    color: '#333',
  },
  imageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  imageCount: {
    fontSize: responsiveFontSize(12),
    color: '#007AFF',
    marginLeft: 4,
  },
});