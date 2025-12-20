import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ImageWithPlaceholder from '../../components/ImageWithPlaceholder';
import filmzoneApi from '../../services/filmzone-api';

const { width } = Dimensions.get('window');

// Mock actor data
const actorData = {
  '1': {
    id: '1',
    name: 'Michelle Rodriguez',
    image: 'https://via.placeholder.com/300x400/2b2b31/fff?text=MR',
    career: 'Actress',
    height: '1.65 m',
    birthDate: 'July 12, 1978',
    birthPlace: 'San Antonio, Texas, United States',
    age: 44,
    zodiac: 'Cancer',
    genres: ['Action', 'Thriller', 'Drama'],
    totalMovies: 109,
    firstMovie: 'Girl Fight (2000)',
    lastMovie: 'Fast and the Furious 10 (2023)',
    bestMovie: 'Avatar',
    filmography: [
      { id: '1', title: 'The Lost Key', year: 2023, rating: 8.4, genres: ['Action', 'Thriller'], image: 'https://via.placeholder.com/150x200/2b2b31/fff?text=TLK' },
      { id: '2', title: 'Fast X', year: 2023, rating: 7.2, genres: ['Action', 'Crime'], image: 'https://via.placeholder.com/150x200/2b2b31/fff?text=FX' },
      { id: '3', title: 'Avatar: The Way of Water', year: 2022, rating: 7.8, genres: ['Action', 'Adventure'], image: 'https://via.placeholder.com/150x200/2b2b31/fff?text=ATW' },
      { id: '4', title: 'F9', year: 2021, rating: 6.8, genres: ['Action', 'Crime'], image: 'https://via.placeholder.com/150x200/2b2b31/fff?text=F9' },
      { id: '5', title: 'The Fate of the Furious', year: 2017, rating: 7.1, genres: ['Action', 'Crime'], image: 'https://via.placeholder.com/150x200/2b2b31/fff?text=TFOTF' },
      { id: '6', title: 'Avatar', year: 2009, rating: 7.9, genres: ['Action', 'Adventure'], image: 'https://via.placeholder.com/150x200/2b2b31/fff?text=AV' },
    ],
    photos: [
      'https://via.placeholder.com/200x300/2b2b31/fff?text=Photo1',
      'https://via.placeholder.com/200x300/2b2b31/fff?text=Photo2',
      'https://via.placeholder.com/200x300/2b2b31/fff?text=Photo3',
      'https://via.placeholder.com/200x300/2b2b31/fff?text=Photo4',
      'https://via.placeholder.com/200x300/2b2b31/fff?text=Photo5',
      'https://via.placeholder.com/200x300/2b2b31/fff?text=Photo6',
    ]
  }
};

export default function ActorScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('filmography');
  const [actor, setActor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<any[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(false);

  useEffect(() => {
    const loadActor = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const personId = parseInt(id as string);
        const response = await filmzoneApi.getPersonById(personId);
        const isOk = response.errorCode >= 200 && response.errorCode < 300;
        
        if (isOk && response.data) {
          // Transform PersonDTO to actor format
          const person = response.data;
          setActor({
            id: person.personID?.toString(),
            fullName: person.fullName || 'Unknown',
            avatar: person.avatar || '',
            career: person.career || person.role || 'Actor',
            height: '', // Not available in API
            birthDate: '', // Not available in API
            birthPlace: '', // Not available in API
            age: '', // Not available in API
            zodiac: '', // Not available in API
            genres: [], // Not available in API
            totalMovies: 0, // Will be updated when movies load
            firstMovie: '', // Not available in API
            lastMovie: '', // Not available in API
            bestMovie: '', // Not available in API
            filmography: [], // Will be loaded separately
            photos: [], // Not available in API
          });
        } else {
          // Fallback to mock data if API fails
          setActor(actorData[id as keyof typeof actorData] || actorData['1']);
        }
      } catch (error) {
        console.error('Error loading actor:', error);
        // Fallback to mock data
        setActor(actorData[id as keyof typeof actorData] || actorData['1']);
      } finally {
        setIsLoading(false);
      }
    };

    loadActor();
  }, [id]);

  // Load movies by person ID
  useEffect(() => {
    const loadMovies = async () => {
      if (!id) return;
      setMoviesLoading(true);
      try {
        const personId = parseInt(id as string);
        const response = await filmzoneApi.getMoviesByPerson(personId);
        const isOk = response.errorCode >= 200 && response.errorCode < 300;
        if (isOk && response.data) {
          // Transform MovieDTO to filmography format
          const transformedMovies = response.data.map((movie: any) => ({
            id: movie.movieID?.toString() || movie.id?.toString(),
            title: movie.title,
            year: movie.year || movie.releaseDate?.substring(0, 4),
            rating: movie.popularity?.toFixed(1) || '0.0',
            genres: movie.tags?.map((tag: any) => tag.tagName) || [],
            image: movie.image,
            isSeries: movie.movieType === 'series' || movie.isSeries,
          }));
          setMovies(transformedMovies);
          
          // Update actor totalMovies count
          setActor((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              totalMovies: transformedMovies.length,
            };
          });
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error('Error loading movies:', error);
        setMovies([]);
      } finally {
        setMoviesLoading(false);
      }
    };

    if (activeTab === 'filmography') {
      loadMovies();
    }
  }, [id, activeTab]);

  const renderFilmographyItem = ({ item }: { item: any }) => {
    const pathname = item.isSeries ? '/details/series/[id]' : '/details/movie/[id]';
    return (
      <Pressable 
        style={styles.filmItem}
        onPress={() => {
          router.push({
            pathname,
            params: {
              id: item.id,
              title: item.title,
              cover: item.image,
              categories: Array.isArray(item.genres) ? item.genres.join(' • ') : '',
              rating: item.rating,
              year: item.year || '',
            },
          } as any);
        }}
      >
        <View style={styles.filmCover}>
          <ImageWithPlaceholder source={{ uri: item.image }} style={styles.filmImage} showRedBorder={false} />
        </View>
        <View style={styles.filmContent}>
          <Text style={styles.filmTitle}>{item.title}</Text>
          <View style={styles.filmGenres}>
            {(item.genres || []).map((genre: string, index: number) => (
              <Text key={index} style={styles.filmGenre}>{genre}</Text>
            ))}
          </View>
          <Text style={styles.filmRating}>{item.rating}</Text>
        </View>
      </Pressable>
    );
  };

  const renderPhotoItem = ({ item }: { item: string }) => (
    <Pressable style={styles.photoItem}>
      <ImageWithPlaceholder source={{ uri: item }} style={styles.photoImage} showRedBorder={false} />
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#e50914" />
          </Pressable>
          <Text style={styles.headerTitle}>Actor Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!actor) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#e50914" />
          </Pressable>
          <Text style={styles.headerTitle}>Actor Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Actor not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#e50914" />
        </Pressable>
        <Text style={styles.headerTitle}>Actor Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.actorName}>{actor.fullName}</Text>
        </View>
      </View>

      {/* Actor Details */}
      <View style={styles.detailsSection}>
        <View style={styles.actorCard}>
          {actor.avatar ? (
            <ImageWithPlaceholder source={{ uri: actor.avatar }} style={styles.actorImage} showRedBorder={false} />
          ) : (
            <View style={[styles.actorImage, styles.actorImagePlaceholder]}>
              <Ionicons name="person" size={40} color="#8e8e93" />
            </View>
          )}
          <View style={styles.actorInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height:</Text>
              <Text style={styles.infoValue}>{actor.height}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of birth:</Text>
              <Text style={styles.infoValue}>{actor.birthDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age:</Text>
              <Text style={styles.infoValue}>{actor.age}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Zodiac:</Text>
              <Text style={styles.infoValue}>{actor.zodiac}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Genres:</Text>
              <View style={styles.genresContainer}>
                {(actor.genres || []).map((genre: string, index: number) => (
                  <Text key={index} style={styles.genreTag}>{genre}</Text>
                ))}
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total number of movies:</Text>
              <Text style={styles.infoValue}> {actor.totalMovies}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content Tabs */}
      <View style={styles.contentSection}>
        <Text style={styles.contentTitle}>Discover</Text>
        <View style={styles.tabsContainer}>
          <Pressable 
            style={[styles.tab, activeTab === 'filmography' && styles.tabActive]}
            onPress={() => setActiveTab('filmography')}
          >
            <Text style={[styles.tabText, activeTab === 'filmography' && styles.tabTextActive]}>
              Filmography
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'photos' && styles.tabActive]}
            onPress={() => setActiveTab('photos')}
          >
            <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>
              Photos
            </Text>
          </Pressable>
        </View>

        {/* Tab Content */}
        {activeTab === 'filmography' ? (
          <>
            {moviesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#e50914" />
                <Text style={styles.loadingText}>Đang tải phim...</Text>
              </View>
            ) : movies.length > 0 ? (
              <FlatList
                data={movies}
                renderItem={renderFilmographyItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.filmographyGrid}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có phim nào</Text>
              </View>
            )}
          </>
        ) : (
          <FlatList
            data={actor.photos || []}
            renderItem={renderPhotoItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.photosGrid}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2b2b31' },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { width: 36, height: 36, borderWidth: 2, borderColor: '#e50914', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  placeholder: { width: 36 },

  // Hero Section
  heroSection: { height: 200, position: 'relative', marginTop: 10 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  heroContent: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  actorName: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 42 },

  // Details Section
  detailsSection: { padding: 16 },
  actorCard: { backgroundColor: '#121219', borderRadius: 12, padding: 16, flexDirection: 'row' },
  actorImage: { width: 120, height: 160, borderRadius: 8, marginRight: 16 },
  actorImagePlaceholder: { 
    backgroundColor: '#2b2b31', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  actorInfo: { flex: 1 },
  infoRow: { flexDirection: 'row', marginBottom: 8, flexWrap: 'wrap' },
  infoLabel: { color: '#c7c7c7', fontSize: 14, fontWeight: '600', minWidth: 120 },
  infoValue: { color: '#fff', fontSize: 14, flex: 1 },
  genresContainer: { flexDirection: 'row', flexWrap: 'wrap', flex: 1 },
  genreTag: { color: '#ffd166', fontSize: 14, marginRight: 8, textDecorationLine: 'underline' },

  // Content Section
  contentSection: { padding: 16 },
  contentTitle: { color: '#fff', fontSize: 24, fontWeight: '300', marginBottom: 16 },
  tabsContainer: { flexDirection: 'row', marginBottom: 20 },
  tab: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#e50914' },
  tabText: { color: '#c7c7c7', fontSize: 16, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  // Filmography
  filmographyGrid: { paddingTop: 10 },
  filmItem: { width: (width - 48) / 2, marginRight: 16, marginBottom: 20 },
  filmCover: { position: 'relative', borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  filmImage: { width: '100%', height: 200 },
  filmContent: {},
  filmTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  filmGenres: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  filmGenre: { color: '#c7c7c7', fontSize: 12, marginRight: 8 },
  filmRating: { color: '#ffd166', fontSize: 12, fontWeight: '600' },

  // Photos
  photosGrid: { paddingTop: 10 },
  photoItem: { width: (width - 48) / 2, marginRight: 16, marginBottom: 16 },
  photoImage: { width: '100%', height: 200, borderRadius: 8 },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    flexDirection: 'row',
    gap: 8,
  },
  loadingText: {
    color: '#8e8e93',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8e8e93',
    fontSize: 14,
  },
});
