import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

export default function GoogleCallbackScreen() {
  const params = useLocalSearchParams();
  const { showError } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await Haptics.selectionAsync();
        
        // Parse token from URL params
        const token = params.token as string | undefined;
        const error = params.error as string | undefined;
        
        if (error) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          showError('Google sign in failed: ' + error);
          router.replace('/auth/signin');
          return;
        }
        
        if (!token) {
          // Try to get token from backend by calling refresh endpoint
          // Backend should have set cookie during OAuth flow
          try {
            const { filmzoneApi } = await import('../../../services/filmzone-api');
            
            // Try refresh endpoint first
            const refreshResponse = await filmzoneApi.refreshAccessToken();
            
            if (refreshResponse.success && refreshResponse.data?.token) {
              const userResponse = await filmzoneApi.getCurrentUser();
              if (userResponse.errorCode === 200 && userResponse.data) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace('/');
                return;
              }
            }
            
            // If refresh fails, try getCurrentUser (cookie might be set)
            const userResponse = await filmzoneApi.getCurrentUser();
            if (userResponse.errorCode === 200 && userResponse.data) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace('/');
            } else {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              showError('Google sign in failed. Please try again.');
              router.replace('/auth/signin');
            }
          } catch (error) {
            console.error('Error verifying Google login:', error);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showError('Google sign in failed. Please try again.');
            router.replace('/auth/signin');
          }
        } else {
          // Token is in URL, set it and verify
          const { filmzoneApi } = await import('../../../services/filmzone-api');
          filmzoneApi.setToken(token);
          
          const userResponse = await filmzoneApi.getCurrentUser();
          if (userResponse.errorCode === 200 && userResponse.data) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/');
          } else {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showError('Google sign in failed. Please try again.');
            router.replace('/auth/signin');
          }
        }
      } catch (error) {
        console.error('Google callback error:', error);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showError('An error occurred during Google sign in');
        router.replace('/auth/signin');
      }
    };

    handleCallback();
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#e50914" />
      <Text style={styles.text}>Đang xử lý đăng nhập Google...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b2b31',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
});

