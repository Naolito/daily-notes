import React from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';
import { logCrashlyticsMessage, logCrashlyticsError } from '../config/firebase';

export default function CrashlyticsTest() {
  const testCrash = () => {
    Alert.alert(
      'Test Crash',
      'This will crash the app. The crash will be reported to Firebase Crashlytics.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Crash App',
          onPress: () => {
            // Log a message before crashing
            logCrashlyticsMessage('User triggered test crash');
            
            // Force a crash
            crashlytics().crash();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const testNonFatalError = () => {
    try {
      // Log a message
      logCrashlyticsMessage('Testing non-fatal error');
      
      // Simulate an error
      // @ts-ignore - Intentionally accessing undefined property
      const test = null.someProperty;
    } catch (error) {
      // Record the non-fatal error
      logCrashlyticsError(error as Error, {
        context: 'Test non-fatal error',
        userAction: 'Button press',
      });
      
      Alert.alert(
        'Non-Fatal Error Logged',
        'A non-fatal error has been logged to Crashlytics. Check your Firebase Console.',
        [{ text: 'OK' }]
      );
    }
  };

  const testCustomLog = () => {
    // Log custom messages
    logCrashlyticsMessage('Custom log message 1');
    logCrashlyticsMessage('Custom log message 2');
    logCrashlyticsMessage('User performed test action');
    
    Alert.alert(
      'Logs Sent',
      'Custom log messages have been sent to Crashlytics.',
      [{ text: 'OK' }]
    );
  };

  const testJSError = () => {
    Alert.alert(
      'Test JS Error',
      'This will throw an unhandled JavaScript error.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Throw Error',
          onPress: () => {
            logCrashlyticsMessage('User triggered JS error test');
            
            // Throw unhandled error
            setTimeout(() => {
              throw new Error('Test JavaScript Error - This is intentional!');
            }, 100);
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="Test Crash (Force Crash)"
          onPress={testCrash}
          color="#FF3B30"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Test Non-Fatal Error"
          onPress={testNonFatalError}
          color="#FF9500"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Test Custom Logs"
          onPress={testCustomLog}
          color="#007AFF"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Test JS Error"
          onPress={testJSError}
          color="#FF3B30"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  buttonContainer: {
    marginVertical: 10,
  },
});