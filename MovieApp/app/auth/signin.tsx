import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { signInWithEmailPassword } from '../../services/auth';
import FlixGoLogo from '../../components/FlixGoLogo';
import { useAuth } from '../../contexts/AuthContext';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const goSignUp = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/auth/signup'); };
  const goHome = async () => { try { await Haptics.selectionAsync(); } catch {} router.back(); };
  const goForgot = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/auth/forgot'); };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ImageBackground source={{ uri: 'https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg' }} style={styles.bg}>
        <View style={styles.overlay} />
        <View style={styles.card}>
          <Pressable onPress={goHome} style={({ pressed }) => [styles.logo, pressed && { opacity: 0.9 }]}>
            <FlixGoLogo style={styles.logoImg} />
          </Pressable>

          <TextInput placeholder="Email" placeholderTextColor="#8e8e93" value={email} onChangeText={setEmail} style={styles.input} />
          <TextInput placeholder="Password" placeholderTextColor="#8e8e93" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

          <View style={styles.rowBetween}>
            <Pressable onPress={() => setRemember((v) => !v)} style={({ pressed }) => [styles.checkboxRow, pressed && { opacity: 0.9 }]} hitSlop={6}>
              <View style={[styles.checkbox, remember && styles.checkboxChecked]} />
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              const res = signInWithEmailPassword(email, password);
              if (res.ok) {
                // Sign in to auth context
                signIn({
                  id: '1',
                  name: res.user?.name || 'User',
                  email: email
                });
                router.replace('/');
              } else {
                // quick feedback by light haptic
                try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
                alert(res.error);
              }
            }}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.primaryBtnText}>Sign in</Text>
          </Pressable>

          <Pressable onPress={goSignUp}>
            <Text style={styles.subText}>Don't have an account? <Text style={styles.link}>Sign up!</Text></Text>
          </Pressable>

          <Pressable onPress={goForgot}>
            <Text style={styles.subText}><Text style={styles.link}>Forgot password?</Text></Text>
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


