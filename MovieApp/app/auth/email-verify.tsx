import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ImageBackground, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import FlixGoLogo from '../../components/FlixGoLogo';

export default function EmailVerifyScreen() {
  const params = useLocalSearchParams<{ email?: string; userID?: string }>();
  const [email, setEmail] = useState((params.email as string) || '');
  const [userId] = useState<number>(() => {
    const idStr = params.userID as string | undefined;
    const parsed = idStr ? parseInt(idStr, 10) : NaN;
    return Number.isNaN(parsed) ? 0 : parsed;
  });
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const goBack = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    router.back();
  };

  const handleVerify = async () => {
    const trimmedCode = code.trim();

    if (!userId || Number.isNaN(userId) || !trimmedCode) {
      Alert.alert('Error', 'Missing user information or verification code');
      return;
    }

    setIsLoading(true);
    try {
      await Haptics.selectionAsync();
      const { filmzoneApi } = await import('../../services/filmzone-api');

      const response = await filmzoneApi.verifyRegisterEmail({
        userID: userId,
        token: trimmedCode,
      });

      console.log('verifyRegisterEmail response:', response);

      const ok = (response as any).success === true || (response.errorCode >= 200 && response.errorCode < 300);

      if (ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Email Verified',
          'Your email has been verified successfully. You can now sign in.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/signin'),
            },
          ]
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Verification Failed',
          response.errorMessage
            || `Invalid verification code or email (code ${response.errorCode ?? 'unknown'})`
        );
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Email verify error:', error);
      Alert.alert('Error', 'An error occurred during email verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <StatusBar style="light" />
      <ImageBackground
        source={{ uri: 'https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg' }}
        style={styles.bg}
      >
        <View style={styles.overlay} />
        <View style={styles.card}>
          <Pressable onPress={goBack} style={({ pressed }) => [styles.logo, pressed && { opacity: 0.9 }]}>
            <FlixGoLogo style={styles.logoImg} />
          </Pressable>

          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We have sent a verification code to your email address. Please enter it below to activate your account.
          </Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#8e8e93"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Verification code"
            placeholderTextColor="#8e8e93"
            value={code}
            onChangeText={setCode}
            style={styles.input}
            keyboardType="number-pad"
            autoCapitalize="none"
          />

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.9 },
              isLoading && { opacity: 0.6 },
            ]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            <Text style={styles.primaryBtnText}>
              {isLoading ? 'Verifying...' : 'Verify email'}
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2b2b31' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  card: { width: '88%', backgroundColor: '#121219', borderRadius: 12, padding: 16 },
  logo: { alignSelf: 'center', marginBottom: 16 },
  logoImg: { width: 110, height: 24 },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#c7c7cc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#14141b',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    color: '#fff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e50914',
  },
  primaryBtn: {
    backgroundColor: '#e50914',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});


