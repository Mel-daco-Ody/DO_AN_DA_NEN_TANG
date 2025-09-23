import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import FlixGoLogo from '../../components/FlixGoLogo';

export default function ForgotScreen() {
  const [email, setEmail] = useState('');
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

          <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}>
            <Text style={styles.primaryBtnText}>Recover</Text>
          </Pressable>

          <Text style={styles.subText}>We will send a password to your Email</Text>
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
  primaryBtn: { backgroundColor: '#e50914', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  subText: { color: '#c7c7cc', textAlign: 'center', marginTop: 10 },
});


