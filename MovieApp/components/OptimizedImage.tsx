// Optimized Image Component with expo-image
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { logger } from '../utils/logger';

interface OptimizedImageProps {
  source: { uri: string } | ImageSourcePropType | string;
  style?: any;
  placeholderStyle?: any;
  showRedBorder?: boolean;
  errorText?: string;
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'memory' | 'disk' | 'memory-disk';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({ 
  source, 
  style, 
  placeholderStyle, 
  showRedBorder = true,
  errorText = '404',
  priority = 'normal',
  cachePolicy = 'memory-disk'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    logger.warn('Image load failed', { source });
  }, [source]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (hasError) {
    return (
      <View style={[styles.placeholder, style, showRedBorder && styles.withBorder]}>
        <Text style={styles.errorText}>{errorText}</Text>
      </View>
    );
  }

  const imageSource = typeof source === 'string' ? { uri: source } : source;

  return (
    <View style={[styles.container, showRedBorder && styles.withBorder]}>
      <Image
        source={imageSource}
        style={[styles.image, style]}
        onError={handleError}
        onLoad={handleLoad}
        contentFit="cover"
        priority={priority}
        cachePolicy={cachePolicy}
        placeholder="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        transition={200}
      />
      {isLoading && (
        <View style={[styles.loadingOverlay, style]}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: '#1c1c23',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  withBorder: {
    borderWidth: 2,
    borderColor: '#e50914',
  },
  errorText: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});




