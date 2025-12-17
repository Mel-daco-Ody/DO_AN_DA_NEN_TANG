// Hero Carousel Component
import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { HeroSlide } from '../../types/AppTypes';
import { logger } from '../../utils/logger';

interface HeroCarouselProps {
  slides: HeroSlide[];
  onSlidePress: (slide: HeroSlide) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides, onSlidePress }) => {
  const width = Dimensions.get('window').width;
  const heroRef = useRef<FlatList | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    if (idx !== heroIndex) setHeroIndex(idx);
  };

  const handleSlidePress = async (slide: HeroSlide) => {
    try {
      await Haptics.selectionAsync();
      onSlidePress(slide);
    } catch (error) {
      logger.warn('Haptic feedback failed', error);
    }
  };

  const handleDotPress = async (index: number) => {
    try {
      await Haptics.selectionAsync();
      heroRef.current?.scrollToIndex({ index, animated: true });
    } catch (error) {
      logger.warn('Failed to scroll to slide', error);
    }
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <View style={styles.heroWrap}>
      <FlatList
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.heroList}
        ref={heroRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.heroSlide}>
            <Image source={item.bg} style={styles.heroBg} contentFit="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                {item.title} <Text style={styles.heroSub}> {item.rating}</Text>
              </Text>
              <Text numberOfLines={3} style={styles.heroText}>{item.text}</Text>
              <Pressable 
                onPress={() => handleSlidePress(item)} 
                style={({ pressed }) => [
                  styles.primaryBtn, 
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
                ]}
              >
                <Text style={styles.primaryBtnText}>Watch now</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      
      {/* Pagination dots */}
      <View style={styles.pagerWrap} pointerEvents="box-none">
        <View style={styles.pagerRow}>
          {slides.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => handleDotPress(i)}
              style={({ pressed }) => [
                styles.pagerDot, 
                i === heroIndex && styles.pagerDotActive, 
                pressed && { opacity: 0.8 }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroWrap: { 
    position: 'relative' 
  },
  heroList: { 
    height: 200 
  },
  heroSlide: { 
    width: Dimensions.get('window').width, 
    height: 200, 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  heroBg: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    width: '100%', 
    height: '100%' 
  },
  heroOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.35)' 
  },
  heroContent: { 
    position: 'absolute', 
    left: 12, 
    right: 12, 
    bottom: 12 
  },
  heroTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700' 
  },
  heroSub: { 
    color: '#ffd166', 
    fontSize: 14, 
    fontWeight: '700' 
  },
  heroText: { 
    color: '#d1d1d6', 
    marginTop: 6, 
    fontSize: 12 
  },
  primaryBtn: { 
    backgroundColor: '#e50914', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8, 
    alignSelf: 'flex-start', 
    marginTop: 10 
  },
  primaryBtnText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  pagerWrap: { 
    position: 'absolute', 
    bottom: 12, 
    right: 12, 
    alignItems: 'flex-end' 
  },
  pagerRow: { 
    flexDirection: 'row' 
  },
  pagerDot: { 
    width: 14, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    marginHorizontal: 3 
  },
  pagerDotActive: { 
    backgroundColor: '#e50914' 
  },
});




