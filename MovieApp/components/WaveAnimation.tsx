import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface WaveAnimationProps {
  isActive: boolean;
  color?: string;
  size?: number;
}

export default function WaveAnimation({ isActive, color = '#e50914', size = 60 }: WaveAnimationProps) {
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      const createWaveAnimation = (animatedValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 2000,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animation1 = createWaveAnimation(wave1, 0);
      const animation2 = createWaveAnimation(wave2, 500);
      const animation3 = createWaveAnimation(wave3, 1000);

      animation1.start();
      animation2.start();
      animation3.start();

      return () => {
        animation1.stop();
        animation2.stop();
        animation3.stop();
      };
    } else {
      wave1.setValue(0);
      wave2.setValue(0);
      wave3.setValue(0);
    }
  }, [isActive, wave1, wave2, wave3]);

  const getWaveStyle = (animatedValue: Animated.Value, scale: number) => ({
    position: 'absolute' as const,
    width: size * 1.5, // Rectangular width
    height: size * 0.6, // Rectangular height (button-like proportions)
    borderRadius: 8, // Match button border radius
    borderWidth: 1,
    borderColor: color,
    opacity: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0],
    }),
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, scale],
        }),
      },
    ],
  });

  if (!isActive) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[getWaveStyle(wave1, 2.0)]} />
      <Animated.View style={[getWaveStyle(wave2, 2.5)]} />
      <Animated.View style={[getWaveStyle(wave3, 3.0)]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 300, // Increased width for rectangular waves
    height: 200, // Increased height for rectangular waves
  },
});
