import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface FlixGoLogoProps {
  style?: any;
  showRedBorder?: boolean;
}

export default function FlixGoLogo({ style, showRedBorder = false }: FlixGoLogoProps) {
  return (
    <View style={[styles.container, showRedBorder && styles.withBorder]}>
      <Image
        source={{ uri: 'https://flixgo.volkovdesign.com/main/img/logo.svg' }}
        style={[styles.logo, style]}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  withBorder: {
    borderWidth: 2,
    borderColor: '#e50914',
    borderRadius: 8,
    padding: 8,
  },
  logo: {
    width: 110,
    height: 24,
  },
});
