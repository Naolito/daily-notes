import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Platform,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../../services/storage';
import { responsiveFontSize } from '../../utils/responsive';
import { useTheme, ThemeType } from '../../contexts/ThemeContext';
import { NotificationService, NotificationSettings } from '../../services/notificationService';

const skins = [
  { id: 'notebook', name: 'Classic Notebook', color: '#f5f0eb' },
  { id: 'paper', name: 'White Paper', color: '#ffffff' },
  { id: 'dark', name: 'Dark Mode', color: '#1a1a1a' },
  { id: 'pink', name: 'Pink Pastel', color: '#fce4ec' },
];

export default function SettingsScreen() {
  const { theme, themeType, setTheme } = useTheme();
  const [contentHeight, setContentHeight] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    time: "20:00",
    title: "Daily Notes 📝",
    message: "How was your day? Take a moment to reflect and write it down."
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    const settings = await NotificationService.getSettings();
    setNotificationSettings(settings);
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    const newSettings = { ...notificationSettings, enabled };
    setNotificationSettings(newSettings);
    await NotificationService.saveSettings(newSettings);
    
    if (enabled) {
      await NotificationService.scheduleDaily(newSettings);
    } else {
      await NotificationService.cancelAll();
    }
  };


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
        style={[
          styles.settingItem, 
          { backgroundColor: theme.settingsButtonBackground },
          theme.themeType === 'paper' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 2,
            borderWidth: 0,
          }
        ]} 
        onPress={onPress}
      >
        <View style={styles.settingContent}>
          <Ionicons name={icon} size={24} color={danger ? '#F44336' : theme.secondaryText} />
          <Text style={[styles.settingText, { color: danger ? '#F44336' : theme.primaryText }]}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
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
          
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>Appearance</Text>
          
          <View style={styles.skinSelector}>
            {skins.map((skin) => (
              <TouchableOpacity
                key={skin.id}
                style={[
                  styles.skinOption,
                  { backgroundColor: skin.color },
                  themeType === skin.id && styles.selectedSkin
                ]}
                onPress={() => setTheme(skin.id as ThemeType)}
              >
                {themeType === skin.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[
            styles.skinName, 
            { 
              color: theme.secondaryText,
              fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined
            }
          ]}>
            {skins.find(s => s.id === themeType)?.name}
          </Text>
          
          <View style={[styles.divider, { backgroundColor: theme.dividerColor }]} />
          
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>Notifications</Text>
          
          <View style={styles.settingsGroup}>
            <View style={[
              styles.settingItem, 
              { backgroundColor: theme.settingsButtonBackground },
              theme.themeType === 'paper' && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
                borderWidth: 0,
              }
            ]}>
              <View style={styles.settingContent}>
                <Ionicons name="notifications-outline" size={24} color={theme.secondaryText} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingText, { color: theme.primaryText }]}>Daily Reminders</Text>
                  <Text style={[styles.settingSubtext, { color: theme.secondaryText }]}>
                    Get reminded at 6 PM daily
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationSettings.enabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: theme.borderColor, true: '#4CAF50' }}
                thumbColor={notificationSettings.enabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: theme.dividerColor }]} />
          
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>Privacy & Data</Text>
          
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
          
          <View style={[styles.divider, { backgroundColor: theme.dividerColor }]} />
          
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>About</Text>
          
          <View style={styles.settingsGroup}>
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
    fontSize: responsiveFontSize(24),
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
    fontSize: responsiveFontSize(16),
    color: '#666',
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
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: responsiveFontSize(16),
    color: '#333',
  },
  settingSubtext: {
    fontSize: responsiveFontSize(14),
    color: '#666',
    marginTop: 2,
  },
});