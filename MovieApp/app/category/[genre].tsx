import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ImageWithPlaceholder from '../../components/ImageWithPlaceholder';
import filmzoneApi from '../../services/filmzone-api';



export default function CategoryScreen() {
  const { genre, tagID } = useLocalSearchParams();
  const width = Dimensions.get('window').width;
  const itemWidth = (width - 48) / 2; // 2 columns with margins
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategoryMovies = async () => {
      if (!genre) return;
      setIsLoading(true);
      setError(null);

      try {
        let tagId: number | undefined;

        // 1. Ưu tiên sử dụng tagID từ params (nếu có)
        if (tagID) {
          tagId = Number(tagID);
        } else {
          // 2. Nếu không có tagID, lấy toàn bộ tags để map tagName -> tagID
        const tagsResponse = await filmzoneApi.getAllTags();
        const isTagsOk = tagsResponse.errorCode >= 200 && tagsResponse.errorCode < 300 && tagsResponse.data;

        if (isTagsOk) {
          const matchedTag = tagsResponse.data!.find(
            (t: any) => t.tagName.toLowerCase() === (genre as string).toLowerCase()
          );
          tagId = matchedTag?.tagID;
          }
        }

        // 3. Nếu có tagId, dùng API GetMoviesByTagIDs, nếu không thì fallback về search
        if (tagId) {
          const moviesResponse = await filmzoneApi.getMoviesByTagIDs([tagId]);
          const isMoviesOk =
            moviesResponse.errorCode >= 200 && moviesResponse.errorCode < 300 && moviesResponse.data;

          if (!isMoviesOk) {
            setItems([]);
            setError('Không thể tải danh sách phim.');
          } else {
            setItems(moviesResponse.data || []);
          }
        } else {
          // Fallback: search theo text genre nếu không tìm được tagID
          const searchResponse = await filmzoneApi.searchMovies(genre as string);
        const isSearchOk =
          searchResponse.errorCode >= 200 && searchResponse.errorCode < 300 && searchResponse.data;

        if (!isSearchOk) {
          setItems([]);
          setError('Không thể tải danh sách phim.');
        } else {
          setItems(searchResponse.data || []);
          }
        }
      } catch (e) {
        setError('Đã xảy ra lỗi khi tải dữ liệu.');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryMovies();
  }, [genre, tagID]);

  const renderItem = ({ item }: { item: any }) => {
    // Handle both MovieDTO format (from getMoviesByTag) and SearchResultDTO format (from searchMovies)
    const movieId = item.movieID?.toString() || item.id?.toString();
    const coverImage = item.image || item.cover || '';
    const isSeries = item.movieType === 'series' || item.isSeries;
    const pathname = isSeries ? '/details/series/[id]' : '/details/movie/[id]';
    const categories = item.tags?.map((tag: any) => tag.tagName).join(' • ') || 
                      (Array.isArray(item.categories) ? item.categories.join(' • ') : '');
    const rating = item.popularity?.toFixed(1) || item.rating || '0.0';
    const year = item.year || item.releaseDate?.substring(0, 4) || '';

    return (
    <Pressable 
      style={[styles.itemCard, { width: itemWidth }]} 
      onPress={() => {
        router.push({
          pathname,
          params: {
              id: movieId,
            title: item.title,
              cover: coverImage,
              categories: categories,
              rating: rating,
              year: year,
              country: item.region?.regionName || item.studio || '',
          },
        } as any);
      }}
    >
      <ImageWithPlaceholder 
          source={{ uri: coverImage }} 
        style={styles.itemImage} 
        showRedBorder={false}
      />
      <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemRating}>{rating}</Text>
        <Text style={styles.itemYear}>{year}</Text>
    </Pressable>
  );
  };

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

      {/* Loading / Error / Results Count */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#e50914" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : error ? (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {items.length} {items.length === 1 ? 'kết quả' : 'kết quả'} cho "{genre}"
          </Text>
        </View>
      )}

      {/* Movies/Series Grid */}
      {!isLoading && !error && (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.movieID?.toString() || item.id?.toString() || Math.random().toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
        />
      )}
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
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: { color: '#8e8e93', fontSize: 14 },
  
  // Grid
  gridContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  itemCard: { marginBottom: 16 },
  itemImage: { width: '100%', height: 200, borderRadius: 8, backgroundColor: '#2b2b31' },
  itemTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  itemRating: { color: '#ffd166', fontSize: 12, fontWeight: '600' },
  itemYear: { color: '#8e8e93', fontSize: 12, marginTop: 2 },
});
