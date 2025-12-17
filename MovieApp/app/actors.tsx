import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, FlatList, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import { ListSkeleton } from '../components/SkeletonPlaceholder';
import { EmptyState } from '../components/EmptyState';
import { AnimatedCard } from '../components/AnimatedPressable';

const { width } = Dimensions.get('window');

// Mock actors data
const actorsData = [
  {
    id: '1',
    name: 'Michelle Rodriguez',
    image: 'https://via.placeholder.com/200x300/2b2b31/fff?text=MR',
    career: 'Actress',
    age: 44,
    totalMovies: 109,
    genres: ['Action', 'Thriller', 'Drama'],
  },
  {
    id: '2',
    name: 'Vin Diesel',
    image: 'https://via.placeholder.com/200x300/2b2b31/fff?text=VD',
    career: 'Actor',
    age: 56,
    totalMovies: 45,
    genres: ['Action', 'Crime', 'Drama'],
  },
  {
    id: '3',
    name: 'Paul Walker',
    image: 'https://via.placeholder.com/200x300/2b2b31/fff?text=PW',
    career: 'Actor',
    age: 40,
    totalMovies: 38,
    genres: ['Action', 'Crime', 'Drama'],
  },
  {
    id: '4',
    name: 'Dwayne Johnson',
    image: 'https://via.placeholder.com/200x300/2b2b31/fff?text=DJ',
    career: 'Actor',
    age: 51,
    totalMovies: 67,
    genres: ['Action', 'Comedy', 'Adventure'],
  },
  {
    id: '5',
    name: 'Jason Statham',
    image: 'https://via.placeholder.com/200x300/2b2b31/fff?text=JS',
    career: 'Actor',
    age: 56,
    totalMovies: 52,
    genres: ['Action', 'Crime', 'Thriller'],
  },
  {
    id: '6',
    name: 'Gal Gadot',
    image: 'https://via.placeholder.com/200x300/2b2b31/fff?text=GG',
    career: 'Actress',
    age: 38,
    totalMovies: 23,
    genres: ['Action', 'Adventure', 'Fantasy'],
  },
  {
    id: '7',
    name: 'Ryan Reynolds',
    image: 'https://via.placeholder.com/200x300/2b2b31/fff?text=RR',
    career: 'Actor',
    age: 47,
    totalMovies: 89,
    genres: ['Action', 'Comedy', 'Drama'],
  },
  {
    id: '8',
    name: 'Scarlett Johansson',
    image: 'https://via.placeholder.com/200x300/2b2b31/fff?text=SJ',
    career: 'Actress',
    age: 39,
    totalMovies: 76,
    genres: ['Action', 'Drama', 'Sci-Fi'],
  },
];

export default function ActorsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActors, setFilteredActors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActors = async () => {
      try {
        const { filmzoneApi } = await import('../services/filmzone-api');
        const response = await filmzoneApi.getAllPersons();
        if (response.errorCode === 200) {
          setFilteredActors(response.data);
        } else {
          // Fallback to mock data if API fails
          setFilteredActors(actorsData);
        }
      } catch (error) {
        // Fallback to mock data
        setFilteredActors(actorsData);
      } finally {
        setIsLoading(false);
      }
    };

    loadActors();
  }, []);

  const filteredActorsList = filteredActors.filter(actor => {
    const name = (actor.fullName || '').toLowerCase();
    const career = (actor.career || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || career.includes(q);
  });

  const renderActorItem = ({ item }: { item: any }) => {
    const genres = Array.isArray(item.genres)
      ? item.genres
      : Array.isArray(item.tags)
        ? item.tags.map((t: any) => t.tagName || t)
        : [];

    return (
      <Pressable 
        style={styles.actorCard}
        onPress={() => router.push(`/actor/${item.personID}` as any)}
      >
        <ImageWithPlaceholder source={{ uri: item.avatar }} style={styles.actorImage} showRedBorder={false} />
        <View style={styles.actorInfo}>
          <Text style={styles.actorName}>{item.fullName}</Text>
          <Text style={styles.actorCareer}>{item.career}</Text>
          <Text style={styles.actorAge}>Age: {item.age}</Text>
          <Text style={styles.actorMovies}>{item.totalMovies} movies</Text>
          <View style={styles.genresContainer}>
            {genres.slice(0, 2).map((genre: string, index: number) => (
              <Text key={index} style={styles.genreTag}>{genre}</Text>
            ))}
          </View>
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#e50914" />
          </Pressable>
          <Text style={styles.headerTitle}>Actors</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading actors...</Text>
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
        <Text style={styles.headerTitle}>Actors</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#8e8e93" style={styles.searchIcon} />
          <Text style={styles.searchInput}>Search actors...</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Popular Actors</Text>
        <Text style={styles.sectionSubtitle}>Discover your favorite actors and actresses</Text>
        
        <FlatList
          data={filteredActorsList}
          renderItem={renderActorItem}
          keyExtractor={(item) => item.personID.toString()}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.actorsGrid}
          columnWrapperStyle={styles.row}
        />
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

  // Search
  searchContainer: { padding: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#14141b', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#e50914' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#8e8e93', fontSize: 16 },

  // Content
  content: { padding: 16 },
  sectionTitle: { color: '#fff', fontSize: 24, fontWeight: '300', marginBottom: 8 },
  sectionSubtitle: { color: '#c7c7c7', fontSize: 14, marginBottom: 20 },

  // Actors Grid
  actorsGrid: { paddingTop: 10 },
  row: { justifyContent: 'space-between' },
  actorCard: { 
    width: (width - 48) / 2, 
    backgroundColor: '#121219', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 16,
    alignItems: 'center'
  },
  actorImage: { width: 80, height: 100, borderRadius: 8, marginBottom: 12 },
  actorInfo: { alignItems: 'center', flex: 1 },
  actorName: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  actorCareer: { color: '#ffd166', fontSize: 12, marginBottom: 4 },
  actorAge: { color: '#c7c7c7', fontSize: 11, marginBottom: 2 },
  actorMovies: { color: '#c7c7c7', fontSize: 11, marginBottom: 8 },
  genresContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  genreTag: { color: '#e50914', fontSize: 10, marginHorizontal: 2, marginBottom: 2 },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
