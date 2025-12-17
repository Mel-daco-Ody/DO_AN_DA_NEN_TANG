// Trending Movies Section Component
import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import AnimatedButton from '../AnimatedButton';
import { Ionicons } from '@expo/vector-icons';
import { MediaItem } from '../../types/AppTypes';
import ImageWithPlaceholder from '../ImageWithPlaceholder';
import { logger } from '../../utils/logger';

interface TrendingMoviesProps {
  movies: MediaItem[];
  onMoviePress: (movie: MediaItem) => void;
}

export const TrendingMovies: React.FC<TrendingMoviesProps> = ({ movies, onMoviePress }) => {
  const handleMoviePress = (movie: MediaItem) => onMoviePress(movie);

  if (movies.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Trending Now</Text>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.movieID.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <AnimatedButton
            onPress={() => handleMoviePress(item)}
            animationType="scale"
            style={styles.trendingCard}
          >
            <View style={styles.trendingImageContainer}>
              <ImageWithPlaceholder 
                source={{ uri: item.image }} 
                style={styles.trendingImage} 
                showRedBorder={false} 
              />
              <View style={styles.trendingOverlay}>
                <View style={styles.trendingBadge}>
                  <Ionicons name="trending-up" size={12} color="#e50914" />
                  <Text style={styles.trendingBadgeText}>TRENDING</Text>
                </View>
                <View style={styles.trendingRating}>
                  <Ionicons name="star" size={12} color="#ffd166" />
                  <Text style={styles.trendingRatingText}>
                    {item.popularity?.toFixed(1) || '8.0'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.trendingContent}>
              <Text style={styles.trendingTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.trendingYear}>
                {item.year || '2024'}
              </Text>
              <Text style={styles.trendingGenre} numberOfLines={1}>
                {item.tags?.map(tag => tag.tagName).join(' • ') || 
                 item.categories?.join(' • ') || 'Action'}
              </Text>
            </View>
          </AnimatedButton>
        )}
      />
    </View>
  );
};

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
  trendingCard: { 
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
  trendingImageContainer: { 
    position: 'relative',
    width: '100%',
    height: 200
  },
  trendingImage: { 
    width: '100%', 
    height: '100%',
    borderRadius: 12
  },
  trendingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    padding: 8
  },
  trendingBadge: {
    backgroundColor: '#ffd166',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center'
  },
  trendingBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 2
  },
  trendingRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-end'
  },
  trendingRatingText: {
    color: '#ffd166',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2
  },
  trendingContent: {
    padding: 12
  },
  trendingTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4
  },
  trendingYear: {
    color: '#8e8e93',
    fontSize: 12,
    marginBottom: 2
  },
  trendingGenre: {
    color: '#e50914',
    fontSize: 11,
    fontWeight: '600'
  },
});

