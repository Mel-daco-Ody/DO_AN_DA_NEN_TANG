import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: any;
}

export default function EmptyState({ 
  icon = 'film-outline',
  title,
  subtitle,
  actionText,
  onActionPress,
  style 
}: EmptyStateProps) {
  const handleActionPress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onActionPress?.();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={64} color="#666" />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      
      {actionText && onActionPress && (
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed
          ]}
          onPress={handleActionPress}
        >
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </Pressable>
      )}
    </View>
  );
}

// Pre-built empty state components
export function MovieBoxEmptyState({ 
  title = "MovieBox trống",
  subtitle = "Thêm phim yêu thích để xem sau",
  actionText = "Duyệt phim",
  onBrowsePress 
}: { 
  title?: string;
  subtitle?: string;
  actionText?: string;
  onBrowsePress?: () => void; 
}) {
  return (
    <EmptyState
      icon="bookmark-outline"
      title={title}
      subtitle={subtitle}
      actionText={actionText}
      onActionPress={onBrowsePress}
    />
  );
}

export function WatchHistoryEmptyState({ onBrowsePress }: { onBrowsePress?: () => void }) {
  return (
    <EmptyState
      icon="time-outline"
      title="Chưa có lịch sử xem"
      subtitle="Bắt đầu xem phim để tạo lịch sử"
      actionText="Khám phá phim"
      onActionPress={onBrowsePress}
    />
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon="search-outline"
      title={`Không tìm thấy "${query}"`}
      subtitle="Thử tìm kiếm với từ khóa khác"
    />
  );
}

export function CommentsEmptyState() {
  return (
    <EmptyState
      icon="chatbubbles-outline"
      title="Chưa có bình luận"
      subtitle="Hãy là người đầu tiên bình luận về bộ phim này"
    />
  );
}

export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="wifi-outline"
      title="Không có kết nối mạng"
      subtitle="Vui lòng kiểm tra kết nối internet và thử lại"
      actionText="Thử lại"
      onActionPress={onRetry}
    />
  );
}

export function ServerErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="server-outline"
      title="Lỗi máy chủ"
      subtitle="Đã xảy ra lỗi, vui lòng thử lại sau"
      actionText="Thử lại"
      onActionPress={onRetry}
    />
  );
}

export function LoginRequiredState({ 
  title = "Vui lòng đăng nhập",
  subtitle = "Đăng nhập để sử dụng tính năng này",
  actionText = "Đăng nhập",
  onLoginPress 
}: { 
  title?: string;
  subtitle?: string;
  actionText?: string;
  onLoginPress?: () => void; 
}) {
  return (
    <EmptyState
      icon="person-outline"
      title={title}
      subtitle={subtitle}
      actionText={actionText}
      onActionPress={onLoginPress}
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
  iconContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
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
  actionButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonPressed: {
    backgroundColor: '#b8070f',
    transform: [{ scale: 0.95 }],
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
