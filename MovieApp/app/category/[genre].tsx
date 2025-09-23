import { StyleSheet, View, Text, ScrollView, Pressable, FlatList, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import ImageWithPlaceholder from '../../components/ImageWithPlaceholder';

// Mock data for movies and series
const allItems = [
  { id: '1', title: 'Fast & Furious 9', cover: 'https://via.placeholder.com/300x450', categories: ['Action', 'Thriller'], rating: '8.5', year: 2021, duration: '143 phút', country: 'Mỹ', isSeries: false },
  { id: '2', title: 'The Matrix Resurrections', cover: 'https://via.placeholder.com/300x450', categories: ['Action', 'Sci-Fi'], rating: '7.2', year: 2021, duration: '148 phút', country: 'Mỹ', isSeries: false },
  { id: '3', title: 'Spider-Man: No Way Home', cover: 'https://via.placeholder.com/300x450', categories: ['Action', 'Adventure'], rating: '9.1', year: 2021, duration: '148 phút', country: 'Mỹ', isSeries: false },
  { id: '4', title: 'Stranger Things', cover: 'https://via.placeholder.com/300x450', categories: ['Drama', 'Sci-Fi', 'Thriller'], rating: '8.7', year: 2016, duration: '4 mùa', country: 'Mỹ', isSeries: true },
  { id: '5', title: 'The Witcher', cover: 'https://via.placeholder.com/300x450', categories: ['Fantasy', 'Adventure'], rating: '8.2', year: 2019, duration: '2 mùa', country: 'Mỹ', isSeries: true },
  { id: '6', title: 'Money Heist', cover: 'https://via.placeholder.com/300x450', categories: ['Crime', 'Thriller'], rating: '8.3', year: 2017, duration: '5 phần', country: 'Tây Ban Nha', isSeries: true },
  { id: '7', title: 'Squid Game', cover: 'https://via.placeholder.com/300x450', categories: ['Thriller', 'Drama'], rating: '8.1', year: 2021, duration: '1 mùa', country: 'Hàn Quốc', isSeries: true },
  { id: '8', title: 'Black Widow', cover: 'https://via.placeholder.com/300x450', categories: ['Action', 'Adventure'], rating: '6.7', year: 2021, duration: '134 phút', country: 'Mỹ', isSeries: false },
  { id: '9', title: 'The Queen\'s Gambit', cover: 'https://via.placeholder.com/300x450', categories: ['Drama'], rating: '8.5', year: 2020, duration: '1 mùa', country: 'Mỹ', isSeries: true },
  { id: '10', title: 'Dune', cover: 'https://via.placeholder.com/300x450', categories: ['Sci-Fi', 'Adventure'], rating: '8.0', year: 2021, duration: '155 phút', country: 'Mỹ', isSeries: false },
  { id: '11', title: 'Lupin', cover: 'https://via.placeholder.com/300x450', categories: ['Crime', 'Thriller'], rating: '7.5', year: 2021, duration: '2 phần', country: 'Pháp', isSeries: true },
  { id: '12', title: 'No Time to Die', cover: 'https://via.placeholder.com/300x450', categories: ['Action', 'Thriller'], rating: '7.3', year: 2021, duration: '163 phút', country: 'Anh', isSeries: false },
];

export default function CategoryScreen() {
  const { genre } = useLocalSearchParams();
  const width = Dimensions.get('window').width;
  const itemWidth = (width - 48) / 2; // 2 columns with margins

  // Filter items by genre
  const filteredItems = allItems.filter(item => 
    item.categories.includes(genre as string)
  );

  const renderItem = ({ item }: { item: any }) => (
    <Pressable 
      style={[styles.itemCard, { width: itemWidth }]} 
      onPress={() => {
        if (item.isSeries) {
          router.push(`/details/series/${item.id}?title=${item.title}&cover=${item.cover}&categories=${item.categories.join(',')}&rating=${item.rating}&year=${item.year}&duration=${item.duration}&country=${item.country}` as any);
        } else {
          router.push(`/details/movie/${item.id}?title=${item.title}&cover=${item.cover}&categories=${item.categories.join(',')}&rating=${item.rating}&year=${item.year}&duration=${item.duration}&country=${item.country}` as any);
        }
      }}
    >
      <ImageWithPlaceholder 
        source={{ uri: item.cover }} 
        style={styles.itemImage} 
        showRedBorder={false}
      />
      <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.itemRating}>{item.rating}</Text>
      <Text style={styles.itemYear}>{item.year}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#e50914" />
        </Pressable>
        <Text style={styles.headerTitle}>{genre}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredItems.length} {filteredItems.length === 1 ? 'kết quả' : 'kết quả'} cho "{genre}"
        </Text>
      </View>

      {/* Movies/Series Grid */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14141b' },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { width: 36, height: 36, borderWidth: 2, borderColor: '#e50914', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  placeholder: { width: 36 },
  
  // Results Header
  resultsHeader: { paddingHorizontal: 16, paddingVertical: 12 },
  resultsText: { color: '#8e8e93', fontSize: 14 },
  
  // Grid
  gridContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  itemCard: { marginBottom: 16 },
  itemImage: { width: '100%', height: 200, borderRadius: 8, backgroundColor: '#2b2b31' },
  itemTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  itemRating: { color: '#ffd166', fontSize: 12, fontWeight: '600' },
  itemYear: { color: '#8e8e93', fontSize: 12, marginTop: 2 },
});
