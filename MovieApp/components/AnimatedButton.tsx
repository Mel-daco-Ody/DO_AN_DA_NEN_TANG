// Animated Button Component - replaces Haptic feedback with animations
import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps } from 'react-native';
import { animationUtils } from '../utils/animations';
import Haptics from '@/utils/safeHaptics';

interface AnimatedButtonProps extends PressableProps {
  animationType?: 'scale' | 'bounce' | 'fade' | 'shake';
  onPress?: () => void;
  children: React.ReactNode;
  style?: any;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  animationType = 'scale',
  onPress,
  children,
  style,
  ...props
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Trigger haptic + animation
    (async () => {
      try {
        await Haptics.selectionAsync();
      } catch {}

      // Trigger animation based on type
      switch (animationType) {
        case 'scale':
          animationUtils.createScaleAnimation(scaleValue).start();
          break;
        case 'bounce':
          animationUtils.createBounceAnimation(scaleValue).start();
          break;
        case 'fade':
          animationUtils.createFadeAnimation(opacityValue).start();
          break;
        case 'shake':
          animationUtils.createShakeAnimation(translateX).start();
          break;
      }

      // Call original onPress
      if (onPress) {
        try {
          onPress();
        } catch {}
      }
    })();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [
            { scale: scaleValue },
            { translateX: translateX }
          ],
          opacity: opacityValue,
        },
        style,
      ]}
    >
      <Pressable onPress={handlePress} {...props}>
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default AnimatedButton;


