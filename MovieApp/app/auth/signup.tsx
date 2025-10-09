import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ImageBackground, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import FlixGoLogo from '../../components/FlixGoLogo';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const goSignIn = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/auth/signin'); };
  const goHome = async () => { try { await Haptics.selectionAsync(); } catch {} router.back(); };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!agree) {
      Alert.alert('Error', 'Please agree to the Privacy Policy');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await Haptics.selectionAsync();
      
      const movieAppApi = (await import('../../services/api')).default;
      const response = await movieAppApi.register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
        name.trim().split(' ')[0], // firstName
        name.trim().split(' ').slice(1).join(' ') || '', // lastName
        'Other' // gender
      );

      if (response.errorCode === 200) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Success', 
          'Account created successfully! Please check your email to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/auth/signin')
            }
          ]
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', response.errorMessage || 'Registration failed');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Signup error:', error);
      Alert.alert('Error', 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ImageBackground source={{ uri: 'https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg' }} style={styles.bg}>
        <View style={styles.overlay} />
        <View style={styles.card}>
          <Pressable onPress={goHome} style={({ pressed }) => [styles.logo, pressed && { opacity: 0.9 }]}>
            <FlixGoLogo style={styles.logoImg} />
          </Pressable>

          <TextInput placeholder="Name" placeholderTextColor="#8e8e93" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Email" placeholderTextColor="#8e8e93" value={email} onChangeText={setEmail} style={styles.input} />
          <TextInput placeholder="Password" placeholderTextColor="#8e8e93" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

          <View style={styles.rowBetween}>
            <Pressable onPress={() => setAgree((v) => !v)} style={({ pressed }) => [styles.checkboxRow, pressed && { opacity: 0.9 }]} hitSlop={6}>
              <View style={[styles.checkbox, agree && styles.checkboxChecked]} />
              <Text style={styles.checkboxLabel}>I agree to the Privacy policy</Text>
            </Pressable>
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.primaryBtn, 
              pressed && { opacity: 0.9 },
              isLoading && { opacity: 0.6 }
            ]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.primaryBtnText}>
              {isLoading ? 'Creating Account...' : 'Sign up'}
            </Text>
          </Pressable>

          <Pressable onPress={goSignIn}>
            <Text style={styles.subText}>Already have an account? <Text style={styles.link}>Sign in!</Text></Text>
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
  input: { backgroundColor: '#14141b', borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#fff', marginBottom: 10, borderWidth: 1, borderColor: '#e50914' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 4, backgroundColor: '#1c1c23', marginRight: 8, borderWidth: 1, borderColor: '#2a2a37' },
  checkboxChecked: { borderColor: '#e50914', backgroundColor: '#e50914' },
  checkboxLabel: { color: '#c7c7cc' },
  primaryBtn: { backgroundColor: '#e50914', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  subText: { color: '#c7c7cc', textAlign: 'center', marginTop: 12 },
  link: { color: '#ffd166', fontWeight: '700' },
});


