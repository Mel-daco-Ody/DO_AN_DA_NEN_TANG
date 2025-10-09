import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ImageBackground, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import FlixGoLogo from '../../components/FlixGoLogo';
import { movieAppApi } from '../../services/api';

export default function ForgotScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const goBack = async () => { try { await Haptics.selectionAsync(); } catch {} router.back(); };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ImageBackground source={{ uri: 'https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg' }} style={styles.bg}>
        <View style={styles.overlay} />
        <View style={styles.card}>
          <Pressable onPress={goBack} style={({ pressed }) => [styles.logo, pressed && { opacity: 0.9 }]}>
            <FlixGoLogo style={styles.logoImg} />
          </Pressable>

          <TextInput placeholder="Email" placeholderTextColor="#8e8e93" value={email} onChangeText={setEmail} style={styles.input} />

          <Pressable 
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }, isLoading && styles.disabledButton]}
            onPress={async () => {
              if (!email.trim()) {
                Alert.alert('Error', 'Please enter your email address');
                return;
              }

              setIsLoading(true);
              try {
                await Haptics.selectionAsync();
                
                const response = await movieAppApi.startForgotPassword(email.trim());
                
                if (response.errorCode === 200) {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert(
                    'Success', 
                    'Password reset instructions have been sent to your email address.',
                    [{ text: 'OK', onPress: () => router.back() }]
                  );
                } else {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  Alert.alert('Error', response.errorMessage || 'Failed to send reset email');
                }
              } catch (error) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Error', 'An error occurred while sending reset email');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <Text style={styles.primaryBtnText}>
              {isLoading ? 'Sending...' : 'Recover'}
            </Text>
          </Pressable>

          <Text style={styles.subText}>We will send a password to your Email</Text>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  disabledButton: {
    opacity: 0.6,
  },
  bg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2b2b31' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  card: { width: '88%', backgroundColor: '#121219', borderRadius: 12, padding: 16 },
  logo: { alignSelf: 'center', marginBottom: 16 },
  logoImg: { width: 110, height: 24 },
  input: { backgroundColor: '#14141b', borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#fff', marginBottom: 10, borderWidth: 1, borderColor: '#e50914' },
  primaryBtn: { backgroundColor: '#e50914', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  subText: { color: '#c7c7cc', textAlign: 'center', marginTop: 10 },
});


