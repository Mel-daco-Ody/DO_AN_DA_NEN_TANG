import React, { useRef, useEffect } from 'react';
import { Animated, Pressable, PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps extends PressableProps {
  hapticFeedback?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  scaleOnPress?: boolean;
  opacityOnPress?: boolean;
  children: React.ReactNode;
}

export default function AnimatedPressable({
  hapticFeedback = true,
  hapticType = 'light',
  scaleOnPress = true,
  opacityOnPress = false,
  children,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ...props
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    if (hapticFeedback) {
      try {
        switch (hapticType) {
          case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'selection':
            Haptics.selectionAsync();
            break;
        }
      } catch {}
    }

    const animations = [];
    
    if (scaleOnPress) {
      animations.push(
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        })
      );
    }
    
    if (opacityOnPress) {
      animations.push(
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        })
      );
    }

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }

    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    const animations = [];
    
    if (scaleOnPress) {
      animations.push(
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        })
      );
    }
    
    if (opacityOnPress) {
      animations.push(
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      );
    }

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }

    onPressOut?.(event);
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        {...props}
        style={style}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// Pre-built animated components
export function AnimatedButton({ 
  children, 
  onPress, 
  style,
  hapticType = 'medium',
  ...props 
}: AnimatedPressableProps) {
  return (
    <AnimatedPressable
      hapticType={hapticType}
      scaleOnPress={true}
      opacityOnPress={true}
      onPress={onPress}
      style={style}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

export function AnimatedCard({ 
  children, 
  onPress, 
  style,
  hapticType = 'light',
  ...props 
}: AnimatedPressableProps) {
  return (
    <AnimatedPressable
      hapticType={hapticType}
      scaleOnPress={true}
      onPress={onPress}
      style={style}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

export function AnimatedIcon({ 
  children, 
  onPress, 
  style,
  hapticType = 'selection',
  ...props 
}: AnimatedPressableProps) {
  return (
    <AnimatedPressable
      hapticType={hapticType}
      scaleOnPress={true}
      onPress={onPress}
      style={style}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

