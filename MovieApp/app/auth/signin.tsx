import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ImageBackground, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import FlixGoLogo from '../../components/FlixGoLogo';
import { useAuth } from '../../contexts/AuthContext';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const goSignUp = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/auth/signup'); };
  const goHome = async () => { try { await Haptics.selectionAsync(); } catch {} router.back(); };
  const goForgot = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/auth/forgot'); };
  const togglePasswordVisibility = async () => { 
    try { await Haptics.selectionAsync(); } catch {} 
    setShowPassword(!showPassword); 
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ImageBackground source={{ uri: 'https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg' }} style={styles.bg}>
        <View style={styles.overlay} />
        <View style={styles.card}>
          <Pressable onPress={goHome} style={({ pressed }) => [styles.logo, pressed && { opacity: 0.9 }]}>
            <FlixGoLogo style={styles.logoImg} />
          </Pressable>

          <TextInput placeholder="Username or Email" placeholderTextColor="#8e8e93" value={userName} onChangeText={setUserName} style={styles.input} />
          
          <View style={styles.passwordContainer}>
            <TextInput 
              placeholder="Password" 
              placeholderTextColor="#8e8e93" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={!showPassword}
              style={styles.passwordInput} 
            />
            <Pressable 
              onPress={togglePasswordVisibility}
              style={({ pressed }) => [
                styles.passwordToggle,
                pressed && styles.passwordTogglePressed
              ]}
              hitSlop={8}
            >
              <Image 
                source={require('../../assets/icons/eye-icon.png')}
                style={[
                  styles.passwordToggleIcon,
                  { tintColor: showPassword ? '#e50914' : '#8e8e93' }
                ]}
              />
            </Pressable>
          </View>

          <View style={styles.rowBetween}>
            <Pressable onPress={() => setRemember((v) => !v)} style={({ pressed }) => [styles.checkboxRow, pressed && { opacity: 0.9 }]} hitSlop={6}>
              <View style={[styles.checkbox, remember && styles.checkboxChecked]} />
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.signInButton, isLoading && styles.disabledButton]}
            onPress={async () => {
              if (!userName.trim() || !password.trim()) {
                Alert.alert('Error', 'Please enter both username and password');
                return;
              }

              setIsLoading(true);
              try {
                await Haptics.selectionAsync();
                
                const result = await signIn(userName.trim(), password);
                
                if (result.success) {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  router.replace('/');
                } else if (result.requiresMfa) {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  router.push('/auth/mfa-verify');
                } else {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  Alert.alert('Login Failed', result.error || 'Invalid credentials');
                }
              } catch (error) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Error', 'An error occurred during login');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
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
  passwordContainer: { position: 'relative', marginBottom: 10 },
  passwordInput: { backgroundColor: '#14141b', borderRadius: 10, paddingHorizontal: 12, paddingRight: 50, height: 44, color: '#fff', borderWidth: 1, borderColor: '#e50914' },
  passwordToggle: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', width: 30, height: 44 },
  passwordTogglePressed: { opacity: 0.7 },
  passwordToggleIcon: { width: 20, height: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 18, height: 18, borderRadius: 4, backgroundColor: '#1c1c23', marginRight: 8, borderWidth: 1, borderColor: '#2a2a37' },
  checkboxChecked: { borderColor: '#e50914', backgroundColor: '#e50914' },
  checkboxLabel: { color: '#c7c7cc' },
  signInButton: { backgroundColor: '#e50914', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  signInButtonText: { color: '#fff', fontWeight: '700' },
  disabledButton: { opacity: 0.6 },
  subText: { color: '#c7c7cc', textAlign: 'center', marginTop: 12 },
  link: { color: '#ffd166', fontWeight: '700' },
});


