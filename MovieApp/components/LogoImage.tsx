import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageSourcePropType } from 'react-native';

interface LogoImageProps {
  source: { uri: string } | ImageSourcePropType | string;
  style?: any;
  showRedBorder?: boolean;
}

export default function LogoImage({ 
  source, 
  style, 
  showRedBorder = true
}: LogoImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <View style={[styles.placeholder, style, showRedBorder && styles.withBorder]}>
        <Text style={styles.logoText}>FlixGo</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, showRedBorder && styles.withBorder]}>
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
        style={[styles.image, style]}
        onError={handleError}
        onLoad={handleLoad}
        resizeMode="contain"
      />
      {isLoading && (
        <View style={[styles.loadingOverlay, style]}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </View>
  );
}

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
  logoText: {
    color: '#e50914',
    fontSize: 18,
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
