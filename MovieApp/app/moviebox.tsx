import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, FlatList, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function MovieBoxScreen() {
  const { authState } = useAuth();
  const { theme } = useTheme();
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'rating'>('date');
  const [savedMovies, setSavedMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved movies from backend
  React.useEffect(() => {
    const loadSavedMovies = async () => {
      if (!authState.user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { movieAppApi } = await import('../services/mock-api');
        const response = await movieAppApi.getSavedMovies();
        if (response.errorCode === 200) {
          setSavedMovies(response.data || []);
        }
      } catch (error) {
        console.error('Error loading saved movies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedMovies();
  }, [authState.user]);

  const removeFromMovieBox = async (id: string) => {
    try {
      const { movieAppApi } = await import('../services/mock-api');
      await movieAppApi.removeFromSavedMovies(parseInt(id));
      setSavedMovies(prev => prev.filter(movie => movie.movieID.toString() !== id));
    } catch (error) {
      console.error('Error removing from saved movies:', error);
      throw error;
    }
  };

  const handleRemoveFromMovieBox = async (id: string) => {
    try {
      await Haptics.selectionAsync();
      await removeFromMovieBox(id);
    } catch (error) {
      console.log('Error removing from MovieBox:', error);
    }
  };

  const handleMoviePress = (item: any) => {
    Haptics.selectionAsync();
    if (item.isSeries) {
      router.push({
        pathname: '/details/series/[id]',
        params: {
          id: item.id,
          title: item.title,
          cover: item.cover,
          categories: item.categories.join(', '),
          rating: item.rating,
          year: item.year,
          duration: item.duration || 'N/A',
          country: item.country || 'N/A',
          cast: item.cast || 'N/A',
          description: item.description || 'N/A',
          episodes: item.episodes,
          season: item.season,
        }
      });
    } else {
      router.push({
        pathname: '/details/movie/[id]',
        params: {
          id: item.id,
          title: item.title,
          cover: item.cover,
          categories: item.categories.join(', '),
          rating: item.rating,
          year: item.year,
          duration: item.duration || 'N/A',
          country: item.country || 'N/A',
          cast: item.cast || 'N/A',
          description: item.description || 'N/A',
        }
      });
    }
  };

  const sortedMovieBox = [...savedMovies].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.addedDate || b.createdAt || 0).getTime() - new Date(a.addedDate || a.createdAt || 0).getTime();
      case 'title':
        return (a.title || a.movie?.title || '').localeCompare(b.title || b.movie?.title || '');
      case 'rating':
        return (b.rating || b.movie?.popularity || 0) - (a.rating || a.movie?.popularity || 0);
      default:
        return 0;
    }
  });

  const renderMovieItem = ({ item }: { item: any }) => (
    <Pressable
      style={({ pressed }) => [
        styles.movieCard,
        { backgroundColor: theme.colors.card },
        pressed && { opacity: 0.8 }
      ]}
      onPress={() => handleMoviePress(item)}
    >
      <View style={styles.movieImageContainer}>
        <Image source={{ uri: item.cover || item.movie?.image }} style={styles.movieImage} />
        <View style={styles.movieOverlay}>
          <Pressable
            style={styles.playButton}
            onPress={() => handleMoviePress(item)}
          >
            <Ionicons name="play" size={24} color="#fff" />
          </Pressable>
        </View>
        <Pressable
          style={styles.removeButton}
          onPress={() => handleRemoveFromMovieBox(item.id || item.movieID.toString())}
        >
          <Ionicons name="close" size={16} color="#fff" />
        </Pressable>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{item.rating || item.movie?.popularity || '0'}</Text>
        </View>
      </View>
      <View style={styles.movieInfo}>
        <Text style={[styles.movieTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {item.title || item.movie?.title}
        </Text>
        <Text style={[styles.movieYear, { color: theme.colors.textSecondary }]}>
          {item.year || item.movie?.year}
        </Text>
        <Text style={[styles.movieCategories, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {item.categories?.join(', ') || item.movie?.tags?.map((tag: any) => tag.tagName).join(', ') || 'N/A'}
        </Text>
        {(item.isSeries || item.movie?.movieType === 'series') && (item.episodes || item.movie?.totalEpisodes) && (
          <Text style={[styles.movieEpisodes, { color: '#e50914' }]}>
            {item.season || 'Season 1'} • {item.episodes || item.movie?.totalEpisodes} tập
          </Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Ionicons name="bookmark" size={24} color="#e50914" />
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                MovieBox
              </Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {savedMovies.length} phim đã lưu
            </Text>
          </View>
        </View>

        {/* Sort Options */}
        {savedMovies.length > 0 && (
          <View style={styles.sortSection}>
            <Text style={[styles.sortLabel, { color: theme.colors.textSecondary }]}>
              Sắp xếp theo:
            </Text>
            <View style={styles.sortButtons}>
              {[
                { key: 'date', label: 'Ngày thêm' },
                { key: 'title', label: 'Tên phim' },
                { key: 'rating', label: 'Đánh giá' }
              ].map((option) => (
                <Pressable
                  key={option.key}
                  style={({ pressed }) => [
                    styles.sortButton,
                    { 
                      backgroundColor: sortBy === option.key ? '#e50914' : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                    pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSortBy(option.key as any);
                  }}
                >
                  <Text style={[
                    styles.sortButtonText,
                    { 
                      color: sortBy === option.key ? '#fff' : theme.colors.text 
                    }
                  ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Movie List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
          </View>
        ) : savedMovies.length > 0 ? (
          <FlatList
            data={sortedMovieBox}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id || item.movieID.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.movieList}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {!authState.user ? 'Please login' : 'MovieBox trống'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              {!authState.user ? 'Login to save movies and series' : 'Thêm phim yêu thích để xem sau'}
            </Text>
            {authState.user && (
              <Pressable
                style={({ pressed }) => [
                  styles.browseButton,
                  { backgroundColor: '#e50914' },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.browseButtonText}>Duyệt phim</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b2b31', // Same as homescreen background
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 100, // Updated: 100px (top) + 60px (header height) = 160px
  },
  headerSection: {
    paddingVertical: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  sortSection: {
    marginBottom: 20,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  movieList: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  movieCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  movieImageContainer: {
    position: 'relative',
    aspectRatio: 0.7,
  },
  movieImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  movieOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  movieYear: {
    fontSize: 12,
    marginBottom: 2,
  },
  movieCategories: {
    fontSize: 11,
    marginBottom: 4,
  },
  movieEpisodes: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
