// Featured Movies Section Component
import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import AnimatedButton from '../AnimatedButton';
import { Ionicons } from '@expo/vector-icons';
import { MediaItem } from '../../types/AppTypes';
import { OptimizedImage } from '../OptimizedImage';
import { OptimizedFlatList } from '../OptimizedFlatList';
import { logger } from '../../utils/logger';
import { dataOptimizer } from '../../utils/dataOptimizer';

interface FeaturedMoviesProps {
  movies: MediaItem[];
  onMoviePress: (movie: MediaItem) => void;
}

export const FeaturedMovies: React.FC<FeaturedMoviesProps> = memo(({ movies, onMoviePress }) => {
  // Optimize movies data
  const optimizedMovies = useMemo(() => 
    dataOptimizer.optimizeMovieData(movies, 10), 
    [movies]
  );

  const handleMoviePress = useCallback((movie: MediaItem) => onMoviePress(movie), [onMoviePress]);

  const renderItem = useCallback(({ item }: { item: MediaItem }) => (
    <AnimatedButton
      onPress={() => handleMoviePress(item)}
      animationType="scale"
      style={styles.featuredCard}
    >
      <View style={styles.featuredImageContainer}>
        <OptimizedImage 
          source={{ uri: item.image }} 
          style={styles.featuredImage} 
          showRedBorder={false}
          priority="high"
          cachePolicy="memory-disk"
        />
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>FEATURED</Text>
          </View>
          <View style={styles.featuredRating}>
            <Ionicons name="star" size={12} color="#ffd166" />
            <Text style={styles.featuredRatingText}>
              {item.popularity?.toFixed(1) || '8.0'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.featuredYear}>
          {item.year || '2024'}
        </Text>
        <Text style={styles.featuredGenre} numberOfLines={1}>
          {item.tags?.map(tag => tag.tagName).join(' • ') || 
           item.categories?.join(' • ') || 'Action'}
        </Text>
      </View>
    </AnimatedButton>
  ), [handleMoviePress]);

  const keyExtractor = useCallback((item: MediaItem) => item.movieID.toString(), []);

  if (optimizedMovies.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Featured Movies</Text>
      <OptimizedFlatList
        data={optimizedMovies}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={renderItem}
        itemWidth={150}
        enablePerformanceOptimizations={true}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  sectionContainer: { 
    marginBottom: 20 
  },
  sectionTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700', 
    marginTop: 16, 
    marginHorizontal: 16, 
    marginBottom: 15 
  },
  horizontalList: { 
    paddingHorizontal: 16 
  },
  separator: { 
    width: 16 
  },
  featuredCard: { 
    width: 150, 
    backgroundColor: '#2b2b31', 
    borderRadius: 12, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6
  },
  featuredImageContainer: { 
    position: 'relative',
    width: '100%',
    height: 200
  },
  featuredImage: { 
    width: '100%', 
    height: '100%',
    borderRadius: 12
  },
  featuredOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    padding: 8
  },
  featuredBadge: {
    backgroundColor: '#e50914',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-end'
  },
  featuredRatingText: {
    color: '#ffd166',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2
  },
  featuredContent: {
    padding: 12
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4
  },
  featuredYear: {
    color: '#8e8e93',
    fontSize: 12,
    marginBottom: 2
  },
  featuredGenre: {
    color: '#e50914',
    fontSize: 11,
    fontWeight: '600'
  },
});
