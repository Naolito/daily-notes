import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../../services/storage';

const skins = [
  { id: 'notebook', name: 'Classic Notebook', color: '#f5f0eb' },
  { id: 'paper', name: 'White Paper', color: '#ffffff' },
  { id: 'dark', name: 'Dark Mode', color: '#1a1a1a' },
  { id: 'pink', name: 'Pink Pastel', color: '#fce4ec' },
];

export default function SettingsScreen() {
  const [selectedSkin, setSelectedSkin] = useState('notebook');
  const [contentHeight, setContentHeight] = useState(0);

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your notes? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAllData();
            Alert.alert('Success', 'All data has been deleted.');
          }
        }
      ]
    );
  };

  const SettingItem = ({ title, onPress, icon, danger = false }: any) => {
    return (
      <TouchableOpacity 
        style={[styles.settingItem, danger && styles.dangerItem]} 
        onPress={onPress}
      >
        <View style={styles.settingContent}>
          <Ionicons name={icon} size={24} color={danger ? '#F44336' : '#666'} />
          <Text style={[styles.settingText, danger && styles.dangerText]}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View 
          style={styles.content}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            setContentHeight(height + 100);
          }}
        >
          
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.skinSelector}>
            {skins.map((skin) => (
              <TouchableOpacity
                key={skin.id}
                style={[
                  styles.skinOption,
                  { backgroundColor: skin.color },
                  selectedSkin === skin.id && styles.selectedSkin
                ]}
                onPress={() => setSelectedSkin(skin.id)}
              >
                {selectedSkin === skin.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.skinName}>
            {skins.find(s => s.id === selectedSkin)?.name}
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          
          <View style={styles.settingsGroup}>
            <SettingItem 
              title="Privacy Policy" 
              icon="shield-outline"
              onPress={() => Alert.alert('Privacy Policy', 'Your data is stored locally on your device. We do not collect or transmit any personal information.')}
            />
            
            <SettingItem 
              title="Terms of Service" 
              icon="document-text-outline"
              onPress={() => Alert.alert('Terms of Service', 'By using this app, you agree to use it responsibly and understand that all data is stored locally.')}
            />
            
            <SettingItem 
              title="Delete All Data" 
              icon="trash-outline"
              danger
              onPress={handleDeleteData}
            />
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.settingsGroup}>
            <SettingItem 
              title="Version 1.0.0" 
              icon="information-circle-outline"
              onPress={() => {}}
            />
            
            <SettingItem 
              title="Contact" 
              icon="mail-outline"
              onPress={() => Alert.alert('Contact', 'Email: support@dailynotes.app')}
            />
          </View>
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c2c2c',
    marginBottom: 20,
    marginTop: 30,
    marginHorizontal: 20,
  },
  skinSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  skinOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedSkin: {
    borderColor: '#2196F3',
  },
  skinName: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontFamily: 'LettersForLearners',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  settingsGroup: {
    marginHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(220, 214, 214)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  dangerItem: {
    backgroundColor: 'rgb(220, 214, 214)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  dangerText: {
    color: '#F44336',
  },
});