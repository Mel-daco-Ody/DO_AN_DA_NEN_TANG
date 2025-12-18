import { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ImageBackground, KeyboardAvoidingView, Platform, Alert, Modal, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import FlixGoLogo from '../../components/FlixGoLogo';
import { useToast } from '../../contexts/ToastContext';
import filmzoneApi from '../../services/filmzone-api';

export default function ForgotScreen() {
  const { showError, showSuccess } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputRefs = useRef<(TextInput | null)[]>([]);
  const [forgotPasswordTicket, setForgotPasswordTicket] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCommittingPassword, setIsCommittingPassword] = useState(false);
  const goBack = async () => { try { await Haptics.selectionAsync(); } catch {} router.back(); };

  const handleVerifyOtpCode = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      showError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await Haptics.selectionAsync();
      
      // Verify OTP code using /account/password/forgot/email/verify
      const verifyResponse = await filmzoneApi.verifyForgotPasswordByEmail({
        email: email.trim(),
        code: code,
      });
      
      const isOk = (verifyResponse as any).success === true || (verifyResponse.errorCode >= 200 && verifyResponse.errorCode < 300);
      
      if (isOk) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Lưu ticket từ response - data là string trực tiếp (ticket)
        const ticket = verifyResponse.data || '';
        if (ticket) {
          setForgotPasswordTicket(ticket);
          setShowOtpModal(false);
          setOtpCode(['', '', '', '', '', '']);
          // Mở modal forgot password
          setShowForgotPasswordModal(true);
          setNewPassword('');
          setConfirmNewPassword('');
          setShowNewPassword(false);
          setShowConfirmPassword(false);
        } else {
          showError('Failed to get verification ticket');
        }
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showError(verifyResponse.errorMessage || 'Invalid verification code');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showError('An error occurred while verifying code');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpCodeChange = (index: number, value: string) => {
    // Chỉ cho phép số
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length > 1) {
      // Nếu paste nhiều số (từ autofill), chia vào các ô
      const digits = numericValue.split('').slice(0, 6);
      const newCode = [...otpCode];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setOtpCode(newCode);
      
      // Focus vào ô tiếp theo sau ô cuối cùng được điền
      const nextIndex = Math.min(index + digits.length, 5);
      if (nextIndex < 6) {
        otpInputRefs.current[nextIndex]?.focus();
      } else {
        // Nếu đã điền đủ 6 số, blur input
        otpInputRefs.current[5]?.blur();
      }
    } else {
      const newCode = [...otpCode];
      newCode[index] = numericValue;
      setOtpCode(newCode);
      
      // Tự động focus sang ô tiếp theo nếu đã nhập số
      if (numericValue && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpCodeKeyPress = (index: number, key: string) => {
    // Xử lý backspace: xóa số hiện tại và focus về ô trước
    if (key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCommitForgotPassword = async () => {
    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      showError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters long');
      return;
    }

    if (!forgotPasswordTicket) {
      showError('Missing verification ticket. Please start the process again.');
      return;
    }

    setIsCommittingPassword(true);
    try {
      await Haptics.selectionAsync();
      
      // Commit forgot password using /account/password/forgot/commit
      // Note: For forgot password, oldPassword can be empty string or same as newPassword
      const commitResponse = await filmzoneApi.commitForgotPassword({
        ticket: forgotPasswordTicket,
        oldPassword: '', // Forgot password doesn't require old password
        newPassword: newPassword.trim(),
      });
      
      const isOk = (commitResponse as any).success === true || (commitResponse.errorCode >= 200 && commitResponse.errorCode < 300);
      
      if (isOk) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showSuccess('Password reset successfully!');
        setTimeout(() => {
          setShowForgotPasswordModal(false);
          setNewPassword('');
          setConfirmNewPassword('');
          setForgotPasswordTicket(null);
          setShowNewPassword(false);
          setShowConfirmPassword(false);
          router.back();
        }, 2000);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showError(commitResponse.errorMessage || 'Failed to reset password');
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      let errorMessage = 'An error occurred while resetting password';
      if (error?.name === 'AbortError' || error?.message?.includes('Aborted')) {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      showError(errorMessage);
    } finally {
      setIsCommittingPassword(false);
    }
  };

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
                showError('Please enter your email address');
                return;
              }

              setIsLoading(true);
              try {
                await Haptics.selectionAsync();
                
                // Call forgot password API
                const response = await filmzoneApi.startForgotPasswordByEmail({
                  email: email.trim(),
                });
                
                const isOk = (response as any).success === true || (response.errorCode >= 200 && response.errorCode < 300);
                
                if (isOk) {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  // Mở modal OTP
                  setShowOtpModal(true);
                  setOtpCode(['', '', '', '', '', '']);
                  // Focus vào ô đầu tiên sau khi modal mở
                  setTimeout(() => {
                    otpInputRefs.current[0]?.focus();
                  }, 100);
                } else {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  showError(response.errorMessage || 'Failed to send reset email');
                }
              } catch (error: any) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                let errorMessage = 'An error occurred while sending reset email';
                if (error?.message) {
                  errorMessage = error.message;
                }
                showError(errorMessage);
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

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập mã xác thực</Text>
            <Text style={styles.modalSubtitle}>
              Vui lòng nhập mã 6 số đã được gửi đến email của bạn
            </Text>
            
            <View style={styles.otpInputContainer}>
              {otpCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    otpInputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    {
                      borderColor: digit ? '#e50914' : '#8e8e93',
                    },
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpCodeChange(index, value)}
                  onKeyPress={({ nativeEvent }) => handleOtpCodeKeyPress(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? 6 : 1}
                  selectTextOnFocus
                  textAlign="center"
                  textContentType={index === 0 ? "oneTimeCode" : "none"}
                  autoComplete={index === 0 ? "sms-otp" : "off"}
                />
              ))}
            </View>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed && { opacity: 0.9 },
                ]}
                onPress={() => {
                  setShowOtpModal(false);
                  setOtpCode(['', '', '', '', '', '']);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalConfirmButton,
                  pressed && { opacity: 0.9 },
                  isVerifyingOtp && styles.disabledButton,
                ]}
                onPress={handleVerifyOtpCode}
                disabled={isVerifyingOtp}
              >
                {isVerifyingOtp ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Xác nhận</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowForgotPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đặt lại mật khẩu</Text>
            <Text style={styles.modalSubtitle}>
              Vui lòng nhập mật khẩu mới của bạn
            </Text>
            
            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="Mật khẩu mới"
                placeholderTextColor="#8e8e93"
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.passwordInput}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={({ pressed }) => [
                  styles.passwordToggleButton,
                  pressed && styles.passwordTogglePressed
                ]}
                hitSlop={8}
              >
                <Image 
                  source={require('../../assets/icons/eye-icon.png')}
                  style={[
                    styles.passwordToggleIcon,
                    { tintColor: showNewPassword ? '#e50914' : '#8e8e93' }
                  ]}
                />
              </Pressable>
            </View>

            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="Xác nhận mật khẩu mới"
                placeholderTextColor="#8e8e93"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                style={styles.passwordInput}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={({ pressed }) => [
                  styles.passwordToggleButton,
                  pressed && styles.passwordTogglePressed
                ]}
                hitSlop={8}
              >
                <Image 
                  source={require('../../assets/icons/eye-icon.png')}
                  style={[
                    styles.passwordToggleIcon,
                    { tintColor: showConfirmPassword ? '#e50914' : '#8e8e93' }
                  ]}
                />
              </Pressable>
            </View>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed && { opacity: 0.9 },
                ]}
                onPress={() => {
                  setShowForgotPasswordModal(false);
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setForgotPasswordTicket(null);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalConfirmButton,
                  pressed && { opacity: 0.9 },
                  isCommittingPassword && styles.disabledButton,
                ]}
                onPress={handleCommitForgotPassword}
                disabled={isCommittingPassword}
              >
                {isCommittingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Confirm Reset Password</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  
  // OTP Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#121219',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
    color: '#8e8e93',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#14141b',
    color: '#fff',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8e8e93',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14141b',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e50914',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  passwordInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8e8e93',
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#14141b',
    color: '#fff',
  },
  passwordToggleButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 50,
    zIndex: 1,
  },
  passwordTogglePressed: {
    opacity: 0.7,
  },
  passwordToggleIcon: {
    width: 20,
    height: 20,
  },
});


