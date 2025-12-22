import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  Animated, 
  Dimensions,
  StyleSheet,
  PanResponder
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FloatingSigninButtonProps {
  style?: any;
}

export default function FloatingSigninButton({ style }: FloatingSigninButtonProps) {
  const { authState } = useAuth();
  const { t } = useLanguage();
  
  // Position state
  const [position, setPosition] = useState({
    x: screenWidth - 70, // Start from right edge
    y: screenHeight / 2 - 90, // Start from center vertically
  });
  
  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  // Pan responder for drag functionality
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // More sensitive to movement for smoother response
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        // Start of drag with haptic feedback
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        
        // Smooth scale down when starting drag
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
          }),
          Animated.timing(opacity, {
            toValue: 0.9,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
        
        translateX.setOffset((translateX as any)._value);
        translateY.setOffset((translateY as any)._value);
        translateX.setValue(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        // During drag with smooth feedback
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
        
        // Dynamic opacity based on drag intensity
        const dragIntensity = Math.min(Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy) / 100, 1);
        opacity.setValue(0.9 - dragIntensity * 0.1);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // End of drag
        translateX.flattenOffset();
        translateY.flattenOffset();
        
        // Always snap to center right of screen
        const finalX = screenWidth - 70; // Right edge
        const finalY = screenHeight / 2 - 90 ; // Center vertically (30 = half of button height)
        
        // Haptic feedback when releasing
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
        
        // Update position immediately and animate to final position
        setPosition({ x: finalX, y: finalY });
        
        // Smooth animation back to normal state
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 10,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 10,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;
  
  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    
    if (authState.isAuthenticated) {
      router.push('/profile');
    } else {
      router.push('/auth/signin');
    }
  };
  
  const handlePressIn = () => {
    // Smooth press animation with multiple effects
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.92,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handlePressOut = () => {
    // Smooth release animation
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Don't render if user is authenticated (show avatar in header instead)
  if (authState.isAuthenticated) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.floatingButton,
        {
          left: position.x,
          top: position.y,
          opacity: opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
        style,
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <View style={styles.textContainer}>
          <Text style={styles.buttonTextTop}>SIGN</Text>
          <Text style={styles.buttonTextBottom}>IN</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    zIndex: 9999,
    elevation: 10,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Mờ background
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(145, 9, 9, 0.8)',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    // Viền đỏ to ngoài
    borderWidth: 3,
    borderColor: 'rgba(233, 14, 14, 0.8)',
    // Viền đỏ nhỏ trong
    padding: 2,
  },
  buttonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: '#ff6b6b',
  },
  textContainer: {
    backgroundColor: 'rgba(229, 9, 20, 0.3)', // Background mờ cho text
    borderRadius: 26, // 30 - 4 (padding)
    width: 52, // 60 - 8 (padding)
    height: 52, // 60 - 8 (padding)
    alignItems: 'center',
    justifyContent: 'center',
    // Viền đỏ nhỏ trong
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.6)',
    shadowColor: '#e50914',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonTextTop: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 10,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonTextBottom: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 10,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
