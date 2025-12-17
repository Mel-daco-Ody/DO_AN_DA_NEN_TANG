// Now Watching Section Component
import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import AnimatedButton from '../AnimatedButton';
import { MediaItem } from '../../types/AppTypes';
import ImageWithPlaceholder from '../ImageWithPlaceholder';
import { logger } from '../../utils/logger';

interface NowWatchingProps {
  movies: MediaItem[];
  onMoviePress: (movie: MediaItem) => void;
  t: (key: string) => string;
}

export const NowWatching: React.FC<NowWatchingProps> = ({ movies, onMoviePress, t }) => {
  const handleMoviePress = (movie: MediaItem) => onMoviePress(movie);

  if (movies.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{t('home.now_watching')}</Text>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id || item.movieID.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <AnimatedButton onPress={() => handleMoviePress(item)} animationType="scale" style={styles.nowCard}>
            <ImageWithPlaceholder 
              source={item.cover || item.image} 
              style={styles.nowCover} 
              showRedBorder={false} 
            />
            <Text numberOfLines={1} style={styles.nowTitle}>{item.title}</Text>
            <Text numberOfLines={1} style={styles.nowCats}>
              {item.categories?.join(' • ') || ''}
            </Text>
            {item.isSeries && item.episodes && (
              <Text numberOfLines={1} style={styles.nowEpisodes}>
                {item.season} • {item.episodes} tập
              </Text>
            )}
            <Text style={styles.nowRate}>
              {item.rating || item.popularity?.toString()}
            </Text>
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
  nowCard: { 
    width: 136 
  },
  nowCover: { 
    width: 136, 
    height: 188, 
    borderRadius: 12 
  },
  nowTitle: { 
    color: '#fff', 
    fontWeight: '700', 
    marginTop: 6, 
    fontSize: 13 
  },
  nowCats: { 
    color: '#a0a0a6', 
    marginTop: 2, 
    fontSize: 12 
  },
  nowEpisodes: { 
    color: '#e50914', 
    marginTop: 2, 
    fontSize: 11, 
    fontWeight: '600' 
  },
  nowRate: { 
    color: '#ffd166', 
    marginTop: 3, 
    fontWeight: '700' 
  },
});

