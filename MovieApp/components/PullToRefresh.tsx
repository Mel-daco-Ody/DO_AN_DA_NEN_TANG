import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  // accept node or a single scrollable element so we can inject handlers
  children: React.ReactNode | React.ReactElement;
  style?: any;
}

export default function PullToRefresh({ 
  onRefresh, 
  refreshing, 
  children, 
  style 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const pullAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleRefresh = async () => {
    if (refreshing) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Animate refresh icon
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        { iterations: -1 }
      ).start();
      
      await onRefresh();
    } catch (error) {
    } finally {
      // Reset animations
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
      pullAnim.setValue(0);
      setPullDistance(0);
      setIsPulling(false);
      setCanRefresh(false);
    }
  };

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const scrollY = contentOffset.y;
    
    if (scrollY < -10 && !refreshing) {
      const distance = Math.abs(scrollY);
      const clampedDistance = Math.min(distance, MAX_PULL);
      
      setPullDistance(clampedDistance);
      setIsPulling(true);
      
      // Animate pull
      Animated.timing(pullAnim, {
        toValue: clampedDistance,
        duration: 0,
        useNativeDriver: true,
      }).start();
      
      // Check if can refresh
      if (clampedDistance >= PULL_THRESHOLD) {
        setCanRefresh(true);
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }).start();
      } else {
        setCanRefresh(false);
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    } else if (scrollY >= -10) {
      setIsPulling(false);
      setCanRefresh(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleScrollEnd = () => {
    if (canRefresh && !refreshing) {
      handleRefresh();
    } else {
      // Reset pull animation
      Animated.spring(pullAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      setPullDistance(0);
      setIsPulling(false);
      setCanRefresh(false);
    }
  };

  const getRefreshIcon = () => {
    if (refreshing) return 'refresh';
    if (canRefresh) return 'arrow-down';
    return 'arrow-down';
  };

  const getRefreshText = () => {
    if (refreshing) return 'Đang làm mới...';
    if (canRefresh) return 'Thả để làm mới';
    return 'Kéo để làm mới';
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Pull to refresh indicator */}
      {(isPulling || refreshing) && (
        <Animated.View 
          style={[
            styles.refreshIndicator,
            {
              transform: [
                { translateY: pullAnim },
                { scale: scaleAnim },
              ],
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.refreshIcon,
              { transform: [{ rotate: refreshing ? rotateInterpolation : '0deg' }] }
            ]}
          >
            <Ionicons 
              name={getRefreshIcon() as any} 
              size={24} 
              color={canRefresh ? '#e50914' : '#666'} 
            />
          </Animated.View>
          <Text style={[
            styles.refreshText,
            { color: canRefresh ? '#e50914' : '#666' }
          ]}>
            {getRefreshText()}
          </Text>
        </Animated.View>
      )}
      
      {/* Content */}
      <View style={styles.content}>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement, {
              // inject our handlers but preserve any existing handlers the child provided
              onScroll: (e: any) => {
                // our handler first
                handleScroll(e);
                // then call child's original onScroll if any
                const childOnScroll = (children as any).props?.onScroll;
                if (typeof childOnScroll === 'function') childOnScroll(e);
              },
              onScrollEndDrag: (e: any) => {
                handleScrollEnd();
                const childOnEnd = (children as any).props?.onScrollEndDrag;
                if (typeof childOnEnd === 'function') childOnEnd(e);
              },
              scrollEventThrottle: (children as any).props?.scrollEventThrottle ?? 16,
              showsVerticalScrollIndicator: (children as any).props?.showsVerticalScrollIndicator ?? false,
            } as any)
          : children}
      </View>
    </View>
  );
}

// Enhanced ScrollView with pull-to-refresh
export function RefreshableScrollView({ 
  onRefresh, 
  refreshing, 
  children, 
  style,
  ...props 
}: PullToRefreshProps & any) {
  return (
    <PullToRefresh onRefresh={onRefresh} refreshing={refreshing} style={style}>
      <ScrollView {...props}>
        {children}
      </ScrollView>
    </PullToRefresh>
  );
}

// Enhanced FlatList with pull-to-refresh
export function RefreshableFlatList({ 
  onRefresh, 
  refreshing, 
  children, 
  style,
  ...props 
}: PullToRefreshProps & any) {
  return (
    <PullToRefresh onRefresh={onRefresh} refreshing={refreshing} style={style}>
      <FlatList {...props} />
    </PullToRefresh>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  refreshIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
  },
  refreshIcon: {
    marginBottom: 8,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
});
