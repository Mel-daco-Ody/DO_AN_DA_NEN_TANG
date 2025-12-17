import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ErrorStateProps {
  title: string;
  subtitle?: string;
  retryText?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: any;
}

export default function ErrorState({ 
  title,
  subtitle,
  retryText = 'Retry',
  onRetry,
  onDismiss,
  style 
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRetry = async () => {
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Animate retry button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      
      await onRetry?.();
    } catch (error) {
    } finally {
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  const handleDismiss = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    onDismiss?.();
  };

  return (
    <Animated.View style={[
      styles.container, 
      style,
      {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }
    ]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
        </View>
        
        <Text style={styles.title}>{title}</Text>
        
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
        
        <View style={styles.buttonContainer}>
          {onRetry && (
            <Pressable
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.buttonPressed,
                isRetrying && styles.buttonDisabled,
              ]}
              onPress={handleRetry}
              disabled={isRetrying}
            >
              <Ionicons 
                name={isRetrying ? "refresh" : "refresh-outline"} 
                size={16} 
                color="#fff" 
                style={isRetrying ? styles.spinningIcon : undefined}
              />
              <Text style={styles.retryButtonText}>
                {isRetrying ? 'Đang thử lại...' : retryText}
              </Text>
            </Pressable>
          )}
          
          {onDismiss && (
            <Pressable
              style={({ pressed }) => [
                styles.dismissButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleDismiss}
            >
              <Text style={styles.dismissButtonText}>Bỏ qua</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// Pre-built error state components
export function NetworkErrorState({ 
  title = "Không có kết nối mạng",
  subtitle = "Vui lòng kiểm tra kết nối internet và thử lại",
  retryText = "Thử lại",
  onRetry, 
  onDismiss 
}: { 
  title?: string;
  subtitle?: string;
  retryText?: string;
  onRetry?: () => void; 
  onDismiss?: () => void; 
}) {
  return (
    <ErrorState
      title={title}
      subtitle={subtitle}
      retryText={retryText}
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
}

export function ServerErrorState({ 
  title = "Lỗi máy chủ",
  subtitle = "Đã xảy ra lỗi từ phía máy chủ, vui lòng thử lại sau",
  retryText = "Thử lại",
  onRetry, 
  onDismiss 
}: { 
  title?: string;
  subtitle?: string;
  retryText?: string;
  onRetry?: () => void; 
  onDismiss?: () => void; 
}) {
  return (
    <ErrorState
      title={title}
      subtitle={subtitle}
      retryText={retryText}
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
}

export function TimeoutErrorState({ onRetry, onDismiss }: { onRetry?: () => void; onDismiss?: () => void }) {
  return (
    <ErrorState
      title="Hết thời gian chờ"
      subtitle="Kết nối quá chậm, vui lòng thử lại"
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
}

export function NotFoundErrorState({ onRetry, onDismiss }: { onRetry?: () => void; onDismiss?: () => void }) {
  return (
    <ErrorState
      title="Không tìm thấy nội dung"
      subtitle="Nội dung bạn tìm kiếm không tồn tại hoặc đã bị xóa"
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
}

export function UnauthorizedErrorState({ onRetry, onDismiss }: { onRetry?: () => void; onDismiss?: () => void }) {
  return (
    <ErrorState
      title="Không có quyền truy cập"
      subtitle="Vui lòng đăng nhập để tiếp tục"
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#e50914',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dismissButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  spinningIcon: {
    transform: [{ rotate: '360deg' }],
  },
});
