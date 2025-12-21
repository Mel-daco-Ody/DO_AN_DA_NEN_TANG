import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, FlatList, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSavedMoviesContext } from '../contexts/SavedMoviesContext';
import { MovieBoxEmptyState, LoginRequiredState } from '../components/EmptyState';
import { GridSkeleton } from '../components/SkeletonPlaceholder';
import { NetworkErrorState, ServerErrorState } from '../components/ErrorState';
import { AnimatedCard } from '../components/AnimatedPressable';

export default function MovieBoxScreen() {
  const { authState } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { removeSavedMovie, refreshSavedMovies, savedMovieIds } = useSavedMoviesContext();
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'rating'>('date');
  const [savedMovies, setSavedMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved movies from backend
  React.useEffect(() => {
    const loadSavedMovies = async () => {
      if (!authState.user || !authState.user.userID) {
        setIsLoading(false);
        return;
      }
      
      try {
        setError(null);
        const { filmzoneApi } = await import('../services/filmzone-api');
        console.log('MovieBox: Loading saved movies for user:', authState.user.userID);
        
        const response = await filmzoneApi.getSavedMoviesByUserID(authState.user.userID);
        
        console.log('MovieBox: getSavedMovies response:', JSON.stringify(response, null, 2));
        
        if (response.errorCode === 200) {
          const movies = response.data || [];
          // Filter movies to only include those in context (to avoid showing deleted movies)
          // Only filter if context has been loaded (has items) to avoid filtering on initial load
          const savedIds = Array.from(savedMovieIds);
          const filteredMovies = (savedIds.length > 0 && savedMovieIds.size > 0)
            ? movies.filter((item: any) => savedIds.includes(item.movieID))
            : movies;
          
          // If movies don't have full movie data, fetch it
          const moviesWithDetails = await Promise.all(
            filteredMovies.map(async (item: any) => {
              if (!item.movie && item.movieID) {
                try {
                  // Try to get movie details if method exists
                  const movieResponse = await filmzoneApi.getMovieById(item.movieID);
                    if (movieResponse.errorCode === 200 && movieResponse.data) {
                      return { 
                        ...item, 
                        movie: movieResponse.data,
                        // Map movie data to item format for display
                        title: movieResponse.data.title || item.title,
                        cover: movieResponse.data.image || item.cover,
                        year: movieResponse.data.year || item.year,
                        rating: movieResponse.data.popularity || item.rating,
                        categories: movieResponse.data.tags?.map((tag: any) => tag.tagName) || item.categories,
                        isSeries: movieResponse.data.movieType === 'series',
                        totalEpisodes: movieResponse.data.totalEpisodes || item.episodes,
                      };
                    }
                } catch (error) {
                  console.warn('MovieBox: Failed to fetch movie details for:', item.movieID, error);
                }
              }
              return item;
            })
          );
          setSavedMovies(moviesWithDetails);
          console.log('MovieBox: Loaded', moviesWithDetails.length, 'saved movies (filtered by context)');
        } else {
          console.error('MovieBox: Server error:', response.errorMessage);
          setError(t('moviebox.server_error_title'));
        }
      } catch (error) {
        console.error('MovieBox: Network error:', error);
        setError(t('moviebox.network_error_title'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedMovies();
    // Don't reload when savedMovieIds changes - that would cause deleted movies to reappear
    // Only reload when user changes
  }, [authState.user?.userID]);

  const retryLoadMovies = async () => {
    setIsLoading(true);
    setError(null);
    
    if (!authState.user || !authState.user.userID) {
      setIsLoading(false);
      return;
    }
    
    try {
      const { filmzoneApi } = await import('../services/filmzone-api');
      console.log('MovieBox: Retrying load saved movies for user:', authState.user.userID);
      
      const response = await filmzoneApi.getSavedMoviesByUserID(authState.user.userID);
      
      console.log('MovieBox: Retry response:', JSON.stringify(response, null, 2));
      
      if (response.errorCode === 200) {
        setSavedMovies(response.data || []);
      } else {
        setError(t('moviebox.server_error_title'));
      }
    } catch (error) {
      console.error('MovieBox: Retry error:', error);
      setError(t('moviebox.network_error_title'));
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromMovieBox = async (id: string) => {
    const movieId = parseInt(id);
    console.log('MovieBox: Removing movie:', movieId);
    
    // Update local state immediately (optimistic update for better UX)
    setSavedMovies(prev => {
      const filtered = prev.filter(movie => movie.movieID !== movieId);
      console.log('MovieBox: Updated local state, removed movie:', movieId, 'remaining:', filtered.length);
      return filtered;
    });
    
    // Remove from context (will sync across app and call API)
    // removeSavedMovie handles errors gracefully (404 = already deleted, network errors = optimistic update)
    await removeSavedMovie(movieId);
    console.log('MovieBox: Removed movie from context:', movieId);
  };

  const handleRemoveFromMovieBox = async (id: string) => {
    await Haptics.selectionAsync();
    await removeFromMovieBox(id);
    // removeFromMovieBox handles everything gracefully, no need for error handling
  };

  const handleMoviePress = (item: any) => {
    Haptics.selectionAsync();
    
    // Safely get categories - handle both array and undefined cases
    const categories = Array.isArray(item.categories) 
      ? item.categories.join(', ')
      : (Array.isArray(item.movie?.tags) 
          ? item.movie.tags.map((tag: any) => tag.tagName || tag).join(', ')
          : 'N/A');
    
    // Safely get other fields with fallbacks
    const movieId = item.id || item.movieID;
    const title = item.title || item.movie?.title;
    const cover = item.cover || item.movie?.image;
    const rating = item.rating || item.movie?.popularity;
    const year = item.year || item.movie?.year;
    
    if (item.isSeries || item.movie?.movieType === 'series') {
      router.push({
        pathname: '/details/series/[id]',
        params: {
          id: movieId,
          title: title,
          cover: cover,
          categories: categories,
          rating: rating,
          year: year,
          duration: item.duration || 'N/A',
          country: item.country || 'N/A',
          cast: item.cast || 'N/A',
          description: item.description || 'N/A',
          episodes: item.episodes || item.movie?.totalEpisodes,
          season: item.season,
        }
      });
    } else {
      router.push({
        pathname: '/details/movie/[id]',
        params: {
          id: movieId,
          title: title,
          cover: cover,
          categories: categories,
          rating: rating,
          year: year,
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
          onPress={() => handleRemoveFromMovieBox(item.movieID?.toString() || item.id?.toString() || '')}
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
            {item.season || `${t('moviebox.season')} 1`} • {item.episodes || item.movie?.totalEpisodes} {t('moviebox.episodes')}
          </Text>
        )}
      </View>
    </Pressable>
  );

  const handleBack = async () => {
    try {
      await Haptics.selectionAsync();
      router.back();
    } catch (error) {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="#e50914" />
      </Pressable>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Ionicons name="bookmark" size={24} color="#e50914" />
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                {t('moviebox.title')}
              </Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {savedMovies.length} {t('moviebox.subtitle')}
            </Text>
          </View>
        </View>

        {/* Sort Options */}
        {savedMovies.length > 0 && (
          <View style={styles.sortSection}>
            <Text style={[styles.sortLabel, { color: theme.colors.textSecondary }]}>
              {t('moviebox.sort_by')}
            </Text>
            <View style={styles.sortButtons}>
              {[
                { key: 'date', label: t('moviebox.sort_date') },
                { key: 'title', label: t('moviebox.sort_title') },
                { key: 'rating', label: t('moviebox.sort_rating') }
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
          <GridSkeleton columns={2} count={6} />
        ) : error ? (
          <View style={styles.errorContainer}>
            {error.includes(t('moviebox.network_error_title')) ? (
              <NetworkErrorState 
                title={t('moviebox.network_error_title')}
                subtitle={t('moviebox.network_error_subtitle')}
                retryText={t('moviebox.retry')}
                onRetry={retryLoadMovies} 
              />
            ) : (
              <ServerErrorState 
                title={t('moviebox.server_error_title')}
                subtitle={t('moviebox.server_error_subtitle')}
                retryText={t('moviebox.retry')}
                onRetry={retryLoadMovies} 
              />
            )}
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
          <View style={styles.emptyStateContainer}>
            {!authState.user ? (
              <LoginRequiredState 
                title={t('moviebox.login_required_title')}
                subtitle={t('moviebox.login_required_subtitle')}
                actionText={t('moviebox.sign_in')}
                onLoginPress={() => router.push('/auth/signin')} 
              />
            ) : (
              <MovieBoxEmptyState 
                title={t('moviebox.empty_title')}
                subtitle={t('moviebox.empty_subtitle')}
                actionText={t('moviebox.browse_movies')}
                onBrowsePress={() => router.push('/(tabs)')} 
              />
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
  backButton: {
    position: 'absolute',
    top: 120, // Below header (60px header + 40px padding)
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1c1c23',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#e50914',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
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
