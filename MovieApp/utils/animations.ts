// Animation utilities to replace Haptic feedback
import { Animated, Easing } from 'react-native';

export const animationUtils = {
  // Scale animation for button press
  createScaleAnimation(scaleValue: Animated.Value, toValue: number = 0.95) {
    return Animated.sequence([
      Animated.timing(scaleValue, {
        toValue,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
  },

  // Bounce animation for selection
  createBounceAnimation(scaleValue: Animated.Value) {
    return Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.1,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
  },

  // Fade animation for feedback
  createFadeAnimation(opacityValue: Animated.Value) {
    return Animated.sequence([
      Animated.timing(opacityValue, {
        toValue: 0.7,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
  },

  // Shake animation for error feedback
  createShakeAnimation(translateX: Animated.Value) {
    return Animated.sequence([
      Animated.timing(translateX, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]);
  }
};

export default animationUtils;


