import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

interface SkeletonPlaceholderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
  children?: React.ReactNode;
}

export default function SkeletonPlaceholder({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style,
  children 
}: SkeletonPlaceholderProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnimation]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  if (children) {
    return (
      <View style={[styles.container, style]}>
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.skeleton, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </View>
  );
}

// Pre-built skeleton components
export function MovieCardSkeleton() {
  return (
    <View style={styles.movieCardSkeleton}>
      <SkeletonPlaceholder width="100%" height={200} borderRadius={8} />
      <View style={styles.movieCardContent}>
        <SkeletonPlaceholder width="80%" height={16} borderRadius={4} />
        <SkeletonPlaceholder width="60%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonPlaceholder width="40%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function ActorCardSkeleton() {
  return (
    <View style={styles.actorCardSkeleton}>
      <SkeletonPlaceholder width={80} height={80} borderRadius={40} />
      <View style={styles.actorCardContent}>
        <SkeletonPlaceholder width="70%" height={14} borderRadius={4} />
        <SkeletonPlaceholder width="50%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function CommentSkeleton() {
  return (
    <View style={styles.commentSkeleton}>
      <SkeletonPlaceholder width={40} height={40} borderRadius={20} />
      <View style={styles.commentContent}>
        <SkeletonPlaceholder width="60%" height={12} borderRadius={4} />
        <SkeletonPlaceholder width="100%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonPlaceholder width="80%" height={14} borderRadius={4} style={{ marginTop: 4 }} />
        <SkeletonPlaceholder width="30%" height={10} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.listSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItemSkeleton}>
          <SkeletonPlaceholder width={60} height={60} borderRadius={8} />
          <View style={styles.listItemContent}>
            <SkeletonPlaceholder width="70%" height={16} borderRadius={4} />
            <SkeletonPlaceholder width="50%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
            <SkeletonPlaceholder width="40%" height={10} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function GridSkeleton({ columns = 2, count = 6 }: { columns?: number; count?: number }) {
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / columns; // 48 = padding + gaps

  return (
    <View style={styles.gridSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.gridItemSkeleton, { width: itemWidth }]}>
          <SkeletonPlaceholder width="100%" height={itemWidth * 1.4} borderRadius={8} />
          <View style={styles.gridItemContent}>
            <SkeletonPlaceholder width="80%" height={14} borderRadius={4} />
            <SkeletonPlaceholder width="60%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  skeleton: {
    backgroundColor: '#2a2a2a',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3a3a3a',
  },
  
  // Movie Card Skeleton
  movieCardSkeleton: {
    marginBottom: 16,
  },
  movieCardContent: {
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  
  // Actor Card Skeleton
  actorCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  actorCardContent: {
    marginLeft: 16,
    flex: 1,
  },
  
  // Comment Skeleton
  commentSkeleton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  commentContent: {
    marginLeft: 12,
    flex: 1,
  },
  
  // List Skeleton
  listSkeleton: {
    paddingHorizontal: 16,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  listItemContent: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  
  // Grid Skeleton
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridItemSkeleton: {
    marginBottom: 16,
  },
  gridItemContent: {
    paddingTop: 8,
  },
});

