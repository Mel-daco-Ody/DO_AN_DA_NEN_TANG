import { useRef, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ImageBackground, KeyboardAvoidingView, Platform, Alert, Modal, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import FlixGoLogo from '../../components/FlixGoLogo';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function SignInScreen() {
  const { authState, signIn, verifyMfa } = useAuth();
  const { showError } = useToast();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const mfaInputRefs = useRef<(TextInput | null)[]>([]);
  
  const goSignUp = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/auth/signup'); };
  const goHome = async () => { try { await Haptics.selectionAsync(); } catch {} router.back(); };
  const goForgot = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/auth/forgot'); };
  const togglePasswordVisibility = async () => { 
    try { await Haptics.selectionAsync(); } catch {} 
    setShowPassword(!showPassword); 
  };

  const handleMfaDigitChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');

    const nextCode = [...mfaCode];
    nextCode[index] = numericValue.slice(-1);
    setMfaCode(nextCode);

    if (numericValue && index < 5) {
      mfaInputRefs.current[index + 1]?.focus();
    }
  };

  const handleMfaKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !mfaCode[index] && index > 0) {
      mfaInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyMfa = async () => {
    const code = mfaCode.join('');

    if (code.length !== 6) {
      showError('Please enter the complete 6-digit code');
      return;
    }

    if (!authState.mfaTicket) {
      showError('Missing MFA ticket. Please try signing in again.');
      return;
    }

    setIsVerifyingMfa(true);
    try {
      await Haptics.selectionAsync();

      const result = await verifyMfa(authState.mfaTicket, code);

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowMfaModal(false);
        setMfaCode(['', '', '', '', '', '']);
        router.replace('/');
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError('An error occurred during verification');
    } finally {
      setIsVerifyingMfa(false);
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
                showError('Please enter both username and password');
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
                  setMfaCode(['', '', '', '', '', '']);
                  setShowMfaModal(true);
                  setTimeout(() => {
                    mfaInputRefs.current[0]?.focus();
                  }, 100);
                } else {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  showError(result.error || 'Invalid credentials');
                }
              } catch (error) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                showError('An error occurred during login');
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

  // MFA Modal styles
  mfaOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mfaCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#2b2b31',
    borderRadius: 16,
    padding: 24,
  },
  mfaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  mfaSubtitle: {
    fontSize: 14,
    color: '#c7c7cc',
    textAlign: 'center',
    marginBottom: 24,
  },
  mfaInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  mfaInput: {
    width: 44,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#14141b',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  mfaButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mfaButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mfaCancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  mfaConfirmButton: {
    backgroundColor: '#e50914',
  },
  mfaCancelText: {
    color: '#c7c7cc',
    fontSize: 16,
    fontWeight: '600',
  },
  mfaConfirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});


