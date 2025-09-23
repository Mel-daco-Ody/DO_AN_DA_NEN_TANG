import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function CustomSplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinnerRotateAnim = useRef(new Animated.Value(0)).current;
  const spinnerScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync();

    // Start animations
    const startAnimations = () => {
      // Logo entrance animation with rotation
      Animated.parallel([
        Animated.timing(logoScaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start();

      // Main content animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1200,
          delay: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for logo
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Spinner scale animation
      Animated.timing(spinnerScaleAnim, {
        toValue: 1,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }).start();

      // Spinner rotation animation
      const spinnerAnimation = Animated.loop(
        Animated.timing(spinnerRotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      spinnerAnimation.start();

      // Auto finish after 3.5 seconds
      setTimeout(() => {
        pulseAnimation.stop();
        spinnerAnimation.stop();
        onFinish();
      }, 3500);
    };

    startAnimations();
  }, [onFinish]);

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinnerRotation = spinnerRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Background */}
      <View style={styles.background}>
        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: Animated.multiply(logoScaleAnim, pulseAnim) },
                  { rotate: logoRotation },
                ],
              },
            ]}
          >
            <View style={styles.logoWrapper}>
              <Image
                source={{ uri: 'https://flixgo.volkovdesign.com/main/img/logo.svg' }}
                style={styles.logoImage}
                contentFit="contain"
              />
              <View style={styles.logoAccent} />
            </View>
          </Animated.View>

          {/* App Info */}
          <Animated.View
            style={[
              styles.infoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            <Text style={styles.appName}>FlixGo</Text>
            <Text style={styles.tagline}>Your Ultimate Movie Experience</Text>
            <Text style={styles.subtitle}>Stream • Watch • Enjoy</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </Animated.View>

          {/* Loading Indicator */}
          <Animated.View
            style={[
              styles.loadingContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Circular Loading Spinner */}
            <Animated.View
              style={[
                styles.spinnerContainer,
                {
                  transform: [
                    { scale: spinnerScaleAnim },
                    { rotate: spinnerRotation },
                  ],
                },
              ]}
            >
              {/* Outer Ring */}
              <View style={styles.spinnerOuter}>
                <View style={styles.spinnerSegment1} />
                <View style={styles.spinnerSegment2} />
                <View style={styles.spinnerSegment3} />
                <View style={styles.spinnerSegment4} />
              </View>
              
              {/* Inner Ring */}
              <View style={styles.spinnerInner}>
                <View style={styles.spinnerInnerSegment1} />
                <View style={styles.spinnerInnerSegment2} />
                <View style={styles.spinnerInnerSegment3} />
                <View style={styles.spinnerInnerSegment4} />
              </View>
              
              {/* Center Dot */}
              <View style={styles.spinnerCenter} />
            </Animated.View>

            {/* Loading Text */}
            <Animated.Text
              style={[
                styles.loadingText,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              Loading...
            </Animated.Text>
          </Animated.View>
        </View>

        {/* Bottom Accent */}
        <Animated.View
          style={[
            styles.bottomAccent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#2b2b31',
    justifyContent: 'center',
    alignItems: 'center',
    // Add subtle red tint effect
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 200,
    height: 60,
  },
  logoAccent: {
    width: 80,
    height: 3,
    backgroundColor: '#e50914',
    marginTop: 12,
    borderRadius: 2,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 2,
    textShadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#e50914',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0a6',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  version: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  spinnerOuter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(229, 9, 20, 0.2)',
  },
  spinnerInner: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  spinnerCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e50914',
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  // Outer ring segments
  spinnerSegment1: {
    position: 'absolute',
    top: -3,
    left: 35,
    width: 10,
    height: 6,
    backgroundColor: '#e50914',
    borderRadius: 3,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  spinnerSegment2: {
    position: 'absolute',
    right: -3,
    top: 35,
    width: 6,
    height: 10,
    backgroundColor: '#e50914',
    borderRadius: 3,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  spinnerSegment3: {
    position: 'absolute',
    bottom: -3,
    left: 35,
    width: 10,
    height: 6,
    backgroundColor: '#e50914',
    borderRadius: 3,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  spinnerSegment4: {
    position: 'absolute',
    left: -3,
    top: 35,
    width: 6,
    height: 10,
    backgroundColor: '#e50914',
    borderRadius: 3,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  // Inner ring segments
  spinnerInnerSegment1: {
    position: 'absolute',
    top: -2,
    left: 26,
    width: 8,
    height: 4,
    backgroundColor: '#e50914',
    borderRadius: 2,
    opacity: 0.7,
  },
  spinnerInnerSegment2: {
    position: 'absolute',
    right: -2,
    top: 26,
    width: 4,
    height: 8,
    backgroundColor: '#e50914',
    borderRadius: 2,
    opacity: 0.7,
  },
  spinnerInnerSegment3: {
    position: 'absolute',
    bottom: -2,
    left: 26,
    width: 8,
    height: 4,
    backgroundColor: '#e50914',
    borderRadius: 2,
    opacity: 0.7,
  },
  spinnerInnerSegment4: {
    position: 'absolute',
    left: -2,
    top: 26,
    width: 4,
    height: 8,
    backgroundColor: '#e50914',
    borderRadius: 2,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 16,
    color: '#e50914',
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#e50914',
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
});