import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';

export default function MfaVerification() {
  const { authState, verifyMfa } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!authState.mfaTicket) {
      Alert.alert('Error', 'No MFA ticket available');
      return;
    }

    setIsLoading(true);
    try {
      await Haptics.selectionAsync();
      
      const result = await verifyMfa(authState.mfaTicket, code.trim());
      
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/');
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Verification Failed', result.error || 'Invalid verification code');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code from your authenticator app
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor="#8e8e93"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
        
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          
          <Pressable
            style={[styles.button, styles.verifyButton, isLoading && styles.disabledButton]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#2b2b31',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  verifyButton: {
    backgroundColor: '#e50914',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#8e8e93',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

