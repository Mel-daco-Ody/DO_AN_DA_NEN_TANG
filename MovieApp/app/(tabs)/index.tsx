import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, TouchableOpacity, ScrollView, Pressable, Modal, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import ImageWithPlaceholder from '../../components/ImageWithPlaceholder';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

type Category = 'new' | 'movies' | 'shows' | 'genre';
type Genre = 'All' | 'Movies' | 'TV Shows' | 'Action' | 'Comedy' | 'Drama' | 'Romance' | 'Thriller' | 'Mystery' | 'Fantasy' | 'Adventure' | 'Music';
type Year = 'All' | '2024' | '2023' | '2022' | '2021' | '2020' | '2019' | '2018' | '2017' | '2016' | '2015' |'2014' | '2013' | '2012' | '2011' | '2010' | '2009' | '2008' | '2007' | '2006' | '2005' | '2004' | '2003' | '2002' | '2001' | '2000' | '1999' | '1998' | '1997' | '1996' | '1995' | '1994' | '1993' | '1992' | '1991' | '1990' | '1989' | '1988' | '1987' | '1986' | '1985' | '1984' | '1983' | '1982' | '1981' | '1980' | '1979' | '1978' | '1977' | '1976' | '1975' | '1974' | '1973' | '1972' | '1971' | '1970' | '1969' | '1968' | '1967' | '1966' | '1965' | '1964' | '1963' | '1962' | '1961' | '1960' | '1959' | '1958' | '1957' | '1956' | '1955' | '1954' | '1953' | '1952' | '1951' | '1950' | '1949' | '1948' | '1947' | '1946' | '1945' | '1944' | '1943' | '1942' | '1941' | '1940' | '1939' | '1938' | '1937' | '1936' | '1935' | '1934' | '1933' | '1932' | '1931' | '1930' | '1929' | '1928' | '1927' | '1926' | '1925' | '1924' | '1923' | '1922' | '1921' | '1920' | '1919' | '1918' | '1917' | '1916' | '1915' | '1914' | '1913' | '1912' | '1911' | '1910' | '1909' | '1908' | '1907' | '1906' | '1905' | '1904' | '1903' | '1902' | '1901' | '1900';
type Studio = 'All' | 'Netflix' | 'Disney+' | 'HBO Max' | 'Amazon Prime' | 'Apple TV+' | 'Paramount+' | 'Hulu' | 'Peacock' | 'Showtime';

type MediaItem = {
  movieID: number;
  slug: string;
  title: string;
  originalTitle?: string;
  description?: string;
  movieType: string; // movie | series
  image: string;
  status: string;
  releaseDate?: string;
  durationSeconds?: number;
  totalSeasons?: number;
  totalEpisodes?: number;
  year?: number;
  rated?: string;
  popularity?: number;
  regionID: number;
  createdAt: string;
  updatedAt: string;
  // Navigation properties
  region?: {
    regionID: number;
    regionName: string;
  };
  tags?: Array<{
    tagID: number;
    tagName: string;
    tagDescription?: string;
  }>;
  // Legacy properties for compatibility
  id?: string;
  cover?: string;
  categories?: string[];
  rating?: string;
  isSeries?: boolean;
  episodes?: string;
  season?: string;
  studio?: string;
};

// Hero slides will be loaded from FilmZone backend
// const heroSlides: any[] = [];

// Movies will be loaded from FilmZone backend
// const allItems: MediaItem[] = [];
// const nowWatching: MediaItem[] = [];

export default function HomeScreen() {
  const { authState } = useAuth();
  const { t } = useLanguage();
  const width = Dimensions.get('window').width;

  const gridColumns = width >= 1024 ? 3 : width >= 600 ? 2 : 2;

  const [recentExpanded, setRecentExpanded] = useState(false);
  const [recentTopY, setRecentTopY] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const heroRef = useRef<FlatList | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<Category>('new');
  const [selectedGenre, setSelectedGenre] = useState<Genre>('All');
  const [selectedYear, setSelectedYear] = useState<Year>('All');
  const [selectedStudio, setSelectedStudio] = useState<Studio>('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState<'genre' | 'year' | 'studio'>('genre');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [savedMovies, setSavedMovies] = useState<Set<number>>(new Set());
  const [featuredMovies, setFeaturedMovies] = useState<MediaItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  
  // Temporary filter states for the modal
  const [tempSelectedGenre, setTempSelectedGenre] = useState<Genre>('All');
  const [tempSelectedYear, setTempSelectedYear] = useState<Year>('All');
  const [tempSelectedStudio, setTempSelectedStudio] = useState<Studio>('All');

  // Initialize temporary filter states when modal opens
  React.useEffect(() => {
    if (showFilterModal) {
      setTempSelectedGenre(selectedGenre);
      setTempSelectedYear(selectedYear);
      setTempSelectedStudio(selectedStudio);
    }
  }, [showFilterModal, selectedGenre, selectedYear, selectedStudio]);

  const tabs: { key: Category; title: string }[] = useMemo(
    () => [
      { key: 'new', title: t('home.new_items') },
      { key: 'genre', title: t('home.all_content') },
    ],
    [t]
  );

  const [genres, setGenres] = useState<Genre[]>(['All', 'Movies', 'TV Shows', 'Action', 'Comedy', 'Drama', 'Romance', 'Thriller', 'Mystery', 'Fantasy', 'Adventure', 'Music']);
  const years: Year[] = ['All', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004', '2003', '2002', '2001', '2000', '1999', '1998', '1997', '1996', '1995', '1994', '1993', '1992', '1991', '1990', '1989', '1988', '1987', '1986', '1985', '1984', '1983', '1982', '1981', '1980', '1979', '1978', '1977', '1976', '1975', '1974', '1973', '1972', '1971', '1970', '1969', '1968', '1967', '1966', '1965', '1964', '1963', '1962', '1961', '1960', '1959', '1958', '1957', '1956', '1955', '1954', '1953', '1952', '1951', '1950', '1949', '1948', '1947', '1946', '1945', '1944', '1943', '1942', '1941', '1940', '1939', '1938', '1937', '1936', '1935', '1934', '1933', '1932', '1931', '1930', '1929', '1928', '1927', '1926', '1925', '1924', '1923', '1922', '1921', '1920', '1919', '1918', '1917', '1916', '1915', '1914', '1913', '1912', '1911', '1910', '1909', '1908', '1907', '1906', '1905', '1904', '1903', '1902', '1901', '1900'];
  const [studios, setStudios] = useState<Studio[]>(['All', 'Netflix', 'Disney+', 'HBO Max', 'Amazon Prime', 'Apple TV+', 'Paramount+', 'Hulu', 'Peacock', 'Showtime']);
  const [tags, setTags] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  
  // Data from backend
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<MediaItem[]>([]);
  const [nowWatching, setNowWatching] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Mock API (using sample data)
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const { movieAppApi } = await import('../../services/mock-api');
        
        // Load metadata
        const [tagsResponse, regionsResponse, personsResponse] = await Promise.all([
          movieAppApi.getAllTags(),
          movieAppApi.getAllRegions(),
          movieAppApi.getAllPersons()
        ]);
        
        if (tagsResponse.errorCode === 200 && tagsResponse.data) {
          setTags(tagsResponse.data);
          const tagNames = tagsResponse.data.map((tag: any) => tag.tagName);
          setGenres(['All', 'Movies', 'TV Shows', ...tagNames]);
        }

        if (regionsResponse.errorCode === 200 && regionsResponse.data) {
          setRegions(regionsResponse.data);
          const regionNames = regionsResponse.data.map((region: any) => region.regionName);
          setStudios(['All', ...regionNames]);
        }

        if (personsResponse.errorCode === 200 && personsResponse.data) {
          setPersons(personsResponse.data);
        }
        
        // Load movie data
        // Load content data
        const [heroResponse, moviesResponse, featuredResponse, trendingResponse] = await Promise.all([
          movieAppApi.getNewReleaseMovies(),
          movieAppApi.getMoviesMainScreen(),
          movieAppApi.getFeaturedMovies(),
          movieAppApi.getTrendingMovies()
        ]);
        
        if (heroResponse.errorCode === 200 && heroResponse.data) {
          setHeroSlides(heroResponse.data);
        }
        
        if (moviesResponse.errorCode === 200 && moviesResponse.data) {
          setAllItems(moviesResponse.data);
        }
        
        if (featuredResponse.errorCode === 200 && featuredResponse.data) {
          setFeaturedMovies(featuredResponse.data);
        }
        
        if (trendingResponse.errorCode === 200 && trendingResponse.data) {
          setTrendingMovies(trendingResponse.data);
        }
        
        // Load watch progress for "Now Watching"
        if (authState.user) {
          try {
            const progressResponse = await movieAppApi.getWatchProgress();
        if (progressResponse.errorCode === 200 && progressResponse.data) {
          setNowWatching(progressResponse.data as unknown as MediaItem[]);
        }
          } catch (error) {
            console.error('Error loading watch progress:', error);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [authState.user]);

  // Load saved movies
  React.useEffect(() => {
    const loadSavedMovies = async () => {
      if (!authState.user) {
        setSavedMovies(new Set());
        return;
      }
      
      try {
        const { movieAppApi } = await import('../../services/mock-api');
        const response = await movieAppApi.getSavedMovies();
        if (response.errorCode === 200 && response.data) {
          const savedIds = new Set<number>(response.data.map((movie: any) => movie.movieID));
          setSavedMovies(savedIds);
        }
      } catch (error) {
        console.error('Error loading saved movies:', error);
      }
    };
    
    loadSavedMovies();
  }, [authState.user]);

  // Load movies by category
  const loadMoviesByCategory = async (categoryId: number) => {
    try {
      const { movieAppApi } = await import('../../services/mock-api');
      const response = await movieAppApi.getMoviesByCategory(categoryId);
      if (response.errorCode === 200 && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error loading movies by category:', error);
      return [];
    }
  };

  const filteredItems = useMemo(() => {
    let items = allItems;
    
    if (activeCategory === 'new') {
      // Show all movies and series as "recently updated"
      return allItems;
    }
    
    if (activeCategory === 'genre') {
      // Apply all filters together (combine them)
      if (selectedGenre !== 'All') {
        if (selectedGenre === 'Movies') {
          items = items.filter(item => item.movieType === 'movie');
        } else if (selectedGenre === 'TV Shows') {
          items = items.filter(item => item.movieType === 'series');
        } else {
          // Filter by tag names
          items = items.filter(item => 
            item.categories?.includes(selectedGenre) || 
            item.tags?.some(tag => tag.tagName === selectedGenre)
          );
        }
      }
      
      if (selectedYear !== 'All') {
        items = items.filter(item => item.year?.toString() === selectedYear);
      }
      
      if (selectedStudio !== 'All') {
        items = items.filter(item => 
          item.studio === selectedStudio || 
          item.region?.regionName === selectedStudio
        );
      }
    }
    
    return items;
  }, [activeCategory, selectedGenre, selectedYear, selectedStudio, allItems]);

  const go404 = async () => {
    try { await Haptics.selectionAsync(); } catch {}
    router.push('/+not-found');
  };

  const openHeroDetails = async (slide: any) => {
    try { await Haptics.selectionAsync(); } catch {}
    
    // Add movie to watch progress when clicked
    try {
      const { movieAppApi } = await import('../../services/mock-api');
      const response = await movieAppApi.addToWatchProgress(parseInt(slide.id));
      
      if (response.success) {
        // Refresh now watching list
        const progressResponse = await movieAppApi.getWatchProgress();
        if (progressResponse.errorCode === 200 && progressResponse.data) {
          setNowWatching(progressResponse.data as unknown as MediaItem[]);
        }
      }
    } catch (error) {
      console.log('Error adding to watch progress:', error);
    }
    
    // Navigate directly to video player
    router.push({ pathname: '/player/[id]', params: { id: slide.id, title: slide.title, type: slide.isSeries ? 'series' : 'movie' } });
  };
  const openDetails = async (m: MediaItem) => {
    try { await Haptics.selectionAsync(); } catch {}
    
    // Add movie to watch progress when clicked
    try {
      const { movieAppApi } = await import('../../services/mock-api');
      const response = await movieAppApi.addToWatchProgress(m.movieID);
      
      if (response.success) {
        // Update watch progress with current position
        await movieAppApi.updateWatchProgress(m.movieID, 0, 0);
        
        // Refresh now watching list
        const progressResponse = await movieAppApi.getWatchProgress();
        if (progressResponse.errorCode === 200 && progressResponse.data) {
          setNowWatching(progressResponse.data as unknown as MediaItem[]);
        }
      }
    } catch (error) {
      console.log('Error adding to watch progress:', error);
    }
    
    const isSeries = typeof m.isSeries === 'boolean' ? m.isSeries : m.movieType === 'series';
    const pathname = isSeries ? '/details/series/[id]' : '/details/movie/[id]';
    // Add mock metadata for demo items
    const baseParams: any = { id: m.id || m.movieID.toString(), title: m.title, cover: (m as any).cover?.uri ?? m.image, categories: m.categories?.join(' • ') || '', rating: m.rating || m.popularity?.toString() || '0' };
    if (m.id === 'x1') {
      Object.assign(baseParams, { year: '2024', duration: '126 min', country: 'USA', cast: 'A. Johnson, M. Rivera', description: 'Một thám tử trở về quê nhà điều tra chuỗi vụ án liên quan đến quá khứ của chính mình.' });
    }
    if (m.id === 'x2') {
      Object.assign(baseParams, { year: '2025', duration: 'Season 1', country: 'UK', cast: 'L. Bennett, K. Ito', description: 'Một vương quốc bị lãng quên vang vọng những bí ẩn cổ xưa, nhóm thám hiểm trẻ bắt đầu hành trình tìm lại nguồn gốc.', episodes: '1|2|3|4|5' });
    }
    router.push({ pathname, params: baseParams });
  };

  const handleMovieBoxToggle = async (item: MediaItem) => {
    try {
      await Haptics.selectionAsync();
      
      if (!authState.user) {
        Alert.alert('Login Required', 'Please login to save movies to your list');
        return;
      }
      
      const { movieAppApi } = await import('../../services/mock-api');
      
      // Check if movie is already saved
      const savedResponse = await movieAppApi.getSavedMovies();
      const isSaved = savedResponse.data?.some((saved: any) => saved.movieID === item.movieID);
      
      if (isSaved) {
        // Remove from saved movies
        await movieAppApi.removeFromSavedMovies(item.movieID);
        setSavedMovies(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.movieID);
          return newSet;
        });
        Alert.alert('Success', 'Movie removed from your list');
      } else {
        // Add to saved movies
        await movieAppApi.addToSavedMovies(item.movieID);
        setSavedMovies(prev => new Set([...prev, item.movieID]));
        Alert.alert('Success', 'Movie added to your list');
      }
    } catch (error) {
      console.log('Error toggling MovieBox:', error);
      Alert.alert('Error', 'Failed to update your movie list');
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView ref={scrollRef} style={styles.scrollView} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.pagePad}>
        {/* Hero carousel (horizontal) */}
        <View style={styles.heroWrap}>
      <FlatList
        data={heroSlides}
        keyExtractor={(i) => i.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
          style={{ height: 200 }}
          ref={heroRef}
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const idx = Math.round(x / width);
            if (idx !== heroIndex) setHeroIndex(idx);
          }}
          scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.heroSlide}>
            <Image source={item.bg} style={styles.heroBg} contentFit="cover" />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{item.title} <Text style={styles.heroSub}> {item.rating}</Text></Text>
              <Text numberOfLines={3} style={styles.heroText}>{item.text}</Text>
                <Pressable onPress={() => openHeroDetails(item)} style={({ pressed }) => [styles.primaryBtn, pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }]}>
                <Text style={styles.primaryBtnText}>{t('home.watch_now')}</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
        {/* Splide-like pagination */}
        <View style={styles.pagerWrap} pointerEvents="box-none">
          <View style={styles.pagerRow}>
            {heroSlides.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => heroRef.current?.scrollToIndex({ index: i, animated: true })}
                style={({ pressed }) => [styles.pagerDot, i === heroIndex && styles.pagerDotActive, pressed && { opacity: 0.8 }]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Subscription Status Banner */}
      {authState.isAuthenticated && showWelcomeBanner && (
        <View style={styles.subscriptionBanner}>
          <Text style={styles.subscriptionBannerText}>
            Welcome to FilmZone!
          </Text>
          <Pressable 
            style={styles.closeButton}
            onPress={() => setShowWelcomeBanner(false)}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Featured Movies */}
      {featuredMovies.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Featured Movies</Text>
          <FlatList
            data={featuredMovies}
            keyExtractor={(item) => item.movieID.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.featuredCard, pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }]}
                onPress={() => openDetails(item)}
              >
                <View style={styles.featuredImageContainer}>
                  <ImageWithPlaceholder source={{ uri: item.image }} style={styles.featuredImage} showRedBorder={false} />
                  <View style={styles.featuredOverlay}>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>FEATURED</Text>
                    </View>
                    <View style={styles.featuredRating}>
                      <Ionicons name="star" size={12} color="#ffd166" />
                      <Text style={styles.featuredRatingText}>{item.popularity?.toFixed(1) || '8.0'}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.featuredYear}>{item.year || '2024'}</Text>
                  <Text style={styles.featuredGenre} numberOfLines={1}>
                    {item.tags?.map(tag => tag.tagName).join(' • ') || item.categories?.join(' • ') || 'Action'}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Trending Movies */}
      {trendingMovies.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <FlatList
            data={trendingMovies}
            keyExtractor={(item) => item.movieID.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.trendingCard, pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }]}
                onPress={() => openDetails(item)}
              >
                <View style={styles.trendingImageContainer}>
                  <ImageWithPlaceholder source={{ uri: item.image }} style={styles.trendingImage} showRedBorder={false} />
                  <View style={styles.trendingOverlay}>
                    <View style={styles.trendingBadge}>
                      <Ionicons name="trending-up" size={12} color="#e50914" />
                      <Text style={styles.trendingBadgeText}>TRENDING</Text>
                    </View>
                    <View style={styles.trendingRating}>
                      <Ionicons name="star" size={12} color="#ffd166" />
                      <Text style={styles.trendingRatingText}>{item.popularity?.toFixed(1) || '8.0'}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.trendingContent}>
                  <Text style={styles.trendingTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.trendingYear}>{item.year || '2024'}</Text>
                  <Text style={styles.trendingGenre} numberOfLines={1}>
                    {item.tags?.map(tag => tag.tagName).join(' • ') || item.categories?.join(' • ') || 'Action'}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Recently Updated */}
      <View onLayout={(e) => setRecentTopY(e.nativeEvent.layout.y)}>
      <Text style={styles.sectionTitle}>{t('home.recently_updated')}</Text>

        {/* Tabs header */}
      <View style={styles.tabsRow}>
        {tabs.map((t, idx) => (
            <TouchableOpacity 
              key={t.key} 
              style={[styles.tabBtn, activeCategory === t.key && styles.tabBtnActive]}
              onPress={() => {
                if (t.key === 'genre') {
                  // Initialize temp values with current selected values
                  setTempSelectedGenre(selectedGenre);
                  setTempSelectedYear(selectedYear);
                  setTempSelectedStudio(selectedStudio);
                  setShowFilterModal(true);
                  // Also set active category to genre to show filtered content
                  setActiveCategory('genre');
                } else {
                  setActiveCategory(t.key);
                }
              }}
            >
              <Text style={[styles.tabText, activeCategory === t.key && styles.tabTextActive]}>{t.title}</Text>
              {t.key === 'genre' && (selectedGenre !== 'All' || selectedYear !== 'All' || selectedStudio !== 'All') && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>!</Text>
                </View>
              )}
          </TouchableOpacity>
        ))}
      </View>


        {/* Content based on active category */}
      {!recentExpanded ? (
        <>
            <FlatList
              data={filteredItems.slice(0, 4)}
              keyExtractor={(i) => i.id || i.movieID.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            renderItem={({ item }) => (
              <Pressable onPress={() => openDetails(item as any)} style={({ pressed }) => [styles.recentCard, pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }]}>
                <ImageWithPlaceholder source={item.cover || item.image} style={styles.recentCover} showRedBorder={false} />
                <Text numberOfLines={1} style={styles.recentTitle}>{item.title}</Text>
                <Text numberOfLines={1} style={styles.recentCats}>{item.categories?.join(' • ') || ''}</Text>
                {item.isSeries && item.totalSeasons && (
                  <Text numberOfLines={1} style={styles.recentEpisodes}>{item.totalSeasons} {t('details.seasons').toLowerCase()}</Text>
                )}
                <Text style={styles.recentRate}>{item.rating || item.popularity?.toString()}</Text>
              </Pressable>
            )}
          />
          <Pressable onPress={() => setRecentExpanded(true)} style={({ pressed }) => [styles.loadMoreBtn, pressed && styles.loadMoreBtnPressed]}>
            <Text style={styles.loadMoreText}>{t('home.expand')}</Text>
          </Pressable>
        </>
      ) : (
        <>
        <View style={styles.grid}> 
              {filteredItems.map((m) => (
               <Pressable key={m.id || m.movieID} onPress={() => openDetails(m as any)} style={({ pressed }) => [styles.card, { width: (width - 32 - (gridColumns - 1) * 16) / gridColumns }, pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }]}> 
            <View style={styles.coverWrap}>
                  <ImageWithPlaceholder source={m.cover || m.image} style={styles.cover} showRedBorder={false} />
                  <Pressable
                    style={styles.bookmarkButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleMovieBoxToggle(m);
                    }}
                  >
                    <Ionicons 
                      name={savedMovies.has(m.movieID) ? "bookmark" : "bookmark-outline"} 
                      size={20} 
                      color={savedMovies.has(m.movieID) ? "#e50914" : "#fff"} 
                    />
                  </Pressable>
            </View>
            <View style={styles.cardBody}>
              <Text numberOfLines={1} style={styles.cardTitle}>{m.title}</Text>
              <Text numberOfLines={1} style={styles.cardCategories}>{m.categories?.join(' • ') || ''}</Text>
              {m.isSeries && m.totalSeasons && (
                <Text numberOfLines={1} style={styles.cardEpisodes}>{m.totalSeasons} {t('details.seasons').toLowerCase()}</Text>
              )}
              <View style={styles.cardMetaRow}>
                <Text style={styles.cardRate}>{m.rating || m.popularity?.toString()}</Text>
                <Text style={styles.cardBadges}>HD • 16+</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
          <Pressable onPress={() => { scrollRef.current?.scrollTo({ y: recentTopY, animated: true }); setRecentExpanded(false); }} style={({ pressed }) => [styles.loadMoreBtn, pressed && styles.loadMoreBtnPressed]}>
            <Text style={styles.loadMoreText}>{t('home.collapse')}</Text>
          </Pressable>
        </>
      )}
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="fade" onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('filter.options')}</Text>
            
            {/* Filter Type Buttons */}
            <View style={styles.filterTypeRow}>
              <Pressable
                style={({ pressed }) => [styles.filterTypeBtn, filterType === 'genre' && styles.filterTypeBtnActive, pressed && { opacity: 0.7 }]}
                onPress={() => setFilterType('genre')}
              >
                <Text style={[styles.filterTypeText, filterType === 'genre' && styles.filterTypeTextActive]}>{t('filter.genre')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.filterTypeBtn, filterType === 'year' && styles.filterTypeBtnActive, pressed && { opacity: 0.7 }]}
                onPress={() => setFilterType('year')}
              >
                <Text style={[styles.filterTypeText, filterType === 'year' && styles.filterTypeTextActive]}>{t('filter.year')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.filterTypeBtn, filterType === 'studio' && styles.filterTypeBtnActive, pressed && { opacity: 0.7 }]}
                onPress={() => setFilterType('studio')}
              >
                <Text style={[styles.filterTypeText, filterType === 'studio' && styles.filterTypeTextActive]}>{t('filter.studio')}</Text>
              </Pressable>
            </View>

            {/* Filter Options - Scrollable */}
            <ScrollView style={styles.filterScrollView} showsVerticalScrollIndicator={true}>
              {filterType === 'genre' && genres.map((genre) => (
                <Pressable
                  key={genre}
                  style={({ pressed }) => [styles.filterItem, pressed && { opacity: 0.7 }]}
                  onPress={() => setTempSelectedGenre(genre)}
                >
                  <Text style={[styles.filterText, tempSelectedGenre === genre && styles.filterTextActive]}>{genre}</Text>
                </Pressable>
              ))}
              
              {filterType === 'year' && years.map((year) => (
                <Pressable
                  key={year}
                  style={({ pressed }) => [styles.filterItem, pressed && { opacity: 0.7 }]}
                  onPress={() => setTempSelectedYear(year)}
                >
                  <Text style={[styles.filterText, tempSelectedYear === year && styles.filterTextActive]}>{year}</Text>
                </Pressable>
              ))}
              
              {filterType === 'studio' && studios.map((studio) => (
                <Pressable
                  key={studio}
                  style={({ pressed }) => [styles.filterItem, pressed && { opacity: 0.7 }]}
                  onPress={() => setTempSelectedStudio(studio)}
                >
                  <Text style={[styles.filterText, tempSelectedStudio === studio && styles.filterTextActive]}>{studio}</Text>
                </Pressable>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtonRow}>
              <Pressable
                style={({ pressed }) => [styles.modalResetBtn, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  setTempSelectedGenre('All');
                  setTempSelectedYear('All');
                  setTempSelectedStudio('All');
                }}
              >
                <Text style={styles.modalResetText}>{t('filter.reset')}</Text>
              </Pressable>
              
              <Pressable
                style={({ pressed }) => [styles.modalCloseBtn, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  // Apply the temporary filters to the actual filters
                  setSelectedGenre(tempSelectedGenre);
                  setSelectedYear(tempSelectedYear);
                  setSelectedStudio(tempSelectedStudio);
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.modalCloseText}>{t('filter.apply')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Now Watching carousel */}
      <Text style={styles.sectionTitle}>{t('home.now_watching')}</Text>
        <FlatList
          data={nowWatching}
          keyExtractor={(i) => i.id || i.movieID.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => openDetails(item as any)} style={({ pressed }) => [styles.nowCard, pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }]}>
            <ImageWithPlaceholder source={item.cover || item.image} style={styles.nowCover} showRedBorder={false} />
            <Text numberOfLines={1} style={styles.nowTitle}>{item.title}</Text>
            <Text numberOfLines={1} style={styles.nowCats}>{item.categories?.join(' • ') || ''}</Text>
            {item.isSeries && item.episodes && (
              <Text numberOfLines={1} style={styles.nowEpisodes}>{item.season} • {item.episodes} tập</Text>
            )}
            <Text style={styles.nowRate}>{item.rating || item.popularity?.toString()}</Text>
          </Pressable>
        )}
      />

      {/* Plans */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>
          {authState.user?.subscription ? t('home.your_current_plan') : t('home.select_plan')}
        </Text>
        <View style={styles.plansRow}>
          {authState.user?.subscription ? (
            // Show current plan only
            <Plan 
              title={authState.user.subscription.plan === 'premium' ? t('plan.premium') : 
                     authState.user.subscription.plan === 'cinematic' ? t('plan.cinematic') : t('plan.starter')} 
              price={authState.user.subscription.plan === 'premium' ? '$19.99' : 
                     authState.user.subscription.plan === 'cinematic' ? '$39.99' : t('plan.free')} 
              features={authState.user.subscription.plan === 'premium' ? 
                ["1 Month","Full HD","Lifetime Availability","TV & Desktop","24/7 Support"] :
                authState.user.subscription.plan === 'cinematic' ?
                ["2 Months","Ultra HD","Lifetime Availability","Any Device","24/7 Support"] :
                ["7 days","720p Resolution","Limited Availability","Desktop Only","Limited Support"]} 
              cta={t('plan.manage_plan')} 
              highlight={authState.user.subscription.plan !== 'starter'}
              onPress={() => router.push('/profile')} 
              t={t}
            />
          ) : (
            // Show all plans for selection
            <>
              <Plan 
                title={t('plan.starter')} 
                price={t('plan.free')} 
                features={["7 days","720p Resolution","Limited Availability","Desktop Only","Limited Support"]} 
                cta={t('plan.choose_plan')} 
                highlight={false}
                onPress={() => authState.isAuthenticated ? router.push('/profile') : router.push('/auth/signin')} 
                t={t}
              />
              <Plan 
                title={t('plan.premium')} 
                price="$19.99" 
                features={["1 Month","Full HD","Lifetime Availability","TV & Desktop","24/7 Support"]} 
                cta={t('plan.choose_plan')} 
                highlight={true}
                onPress={() => authState.isAuthenticated ? router.push('/profile') : router.push('/auth/signin')} 
                t={t}
              />
              <Plan 
                title={t('plan.cinematic')} 
                price="$39.99" 
                features={["2 Months","Ultra HD","Lifetime Availability","Any Device","24/7 Support"]} 
                cta={t('plan.choose_plan')} 
                highlight={false}
                onPress={() => authState.isAuthenticated ? router.push('/profile') : router.push('/auth/signin')} 
                t={t}
              />
            </>
          )}
        </View>
      </View>

      {/* Partners (static) */}
      <Text style={styles.sectionTitle}>{t('home.our_partners')}</Text>
      <Text style={styles.sectionText}>{t('home.partners_description')}</Text>
      <View style={styles.partnersRow}>
        {Array.from({ length: 6 }, (_, i) => (
          <Pressable key={i} onPress={go404} style={({ pressed }) => [styles.partnerBox, pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }]}>
            <Text style={styles.partnerText}>Partner {i + 1}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
    </View>
  );
}

function Plan({ title, price, features, cta, highlight, onPress, t }: { title: string; price: string; features: string[]; cta: string; highlight?: boolean; onPress?: () => void; t: (key: string) => string }) {
  return (
    <View style={[styles.planCard, highlight && styles.planCardHighlight]}>
      {highlight && (
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>POPULAR</Text>
        </View>
      )}
      <View style={styles.planHeader}>
        <Text style={[styles.planTitle, highlight && styles.planTitleHighlight]}>{title}</Text>
        <Text style={[styles.planPrice, highlight && styles.planPriceHighlight]}>{price}</Text>
      </View>
      <View style={styles.planFeatures}>
        {features.map((f, idx) => (
          <View key={idx} style={styles.planFeatureItem}>
            <Ionicons 
              name="checkmark-circle" 
              size={16} 
              color={highlight ? "#ffd166" : "#e50914"} 
            />
            <Text style={[styles.planFeatureText, highlight && styles.planFeatureTextHighlight]}>{f}</Text>
          </View>
        ))}
      </View>
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => [
          styles.planButton, 
          highlight && styles.planButtonHighlight,
          pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
        ]}
      >
        <Text style={[styles.planButtonText, highlight && styles.planButtonTextHighlight]}>{cta}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2b2b31' },
  scrollView: { flex: 1 },
  pagePad: { paddingTop: 70 }, // Updated: 100px (top) + 60px (header height) = 160px
  heroSlide: { width: Dimensions.get('window').width, height: 200, borderRadius: 12, overflow: 'hidden' },
  heroWrap: { position: 'relative' },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroContent: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heroSub: { color: '#ffd166', fontSize: 14, fontWeight: '700' },
  heroText: { color: '#d1d1d6', marginTop: 6, fontSize: 12 },
  primaryBtn: { backgroundColor: '#e50914', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', marginTop: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  pagerWrap: { position: 'absolute', bottom: 12, right: 12, alignItems: 'flex-end' },
  pagerRow: { flexDirection: 'row' },
  pagerDot: { width: 14, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.7)', marginHorizontal: 3 },
  pagerDotActive: { backgroundColor: '#e50914' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16, marginHorizontal: 16, marginBottom: 10 },
  sectionText: { color: '#c7c7cc', marginHorizontal: 16, marginBottom: 10, fontSize: 12 },
  sectionContainer: { marginBottom: 20 },
  
  // Featured Movies Styles
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
  
  // Trending Movies Styles
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

  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#1c1c23', position: 'relative' },
  tabBtnActive: { backgroundColor: '#292935' },
  tabText: { color: '#b0b0b8', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  filterBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#ffd166', borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: '#000', fontSize: 10, fontWeight: '700' },

  grid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#2b2b31', borderRadius: 10, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  coverWrap: { width: '100%', aspectRatio: 2/3, position: 'relative' },
  cover: { width: '100%', height: '100%', borderRadius: 12 },
  bookmarkButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 10 },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cardCategories: { color: '#a0a0a6', marginTop: 3, fontSize: 12 },
  cardEpisodes: { color: '#e50914', marginTop: 2, fontSize: 11, fontWeight: '600' },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  cardRate: { color: '#ffd166', fontWeight: '700' },
  cardBadges: { color: '#8e8e93', fontSize: 12 },

  nowCard: { width: 136 },
  nowCover: { width: 136, height: 188, borderRadius: 12 },
  nowTitle: { color: '#fff', fontWeight: '700', marginTop: 6, fontSize: 13 },
  nowCats: { color: '#a0a0a6', marginTop: 2, fontSize: 12 },
  nowEpisodes: { color: '#e50914', marginTop: 2, fontSize: 11, fontWeight: '600' },
  nowRate: { color: '#ffd166', marginTop: 3, fontWeight: '700' },

  plansRow: { paddingHorizontal: 16, flexDirection: 'column', gap: 6 },
  
  // Plans Section
  plansSection: {
    marginBottom: 30
  },
  
  // Enhanced Plan Styles
  planCard: { 
    backgroundColor: '#2b2b31', 
    borderRadius: 10, 
    padding: 10, 
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: 'relative'
  },
  planCardHighlight: { 
    borderColor: '#ffd166',
    backgroundColor: '#1a1a1f',
    transform: [{ scale: 1.05 }]
  },
  planBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -30,
    backgroundColor: '#ffd166',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1
  },
  planBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2
  },
  planTitle: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 14,
    marginBottom: 3,
    textAlign: 'center'
  },
  planTitleHighlight: { 
    color: '#ffd166',
    fontSize: 15
  },
  planPrice: { 
    color: '#fff', 
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center'
  },
  planPriceHighlight: { 
    color: '#ffd166',
    fontSize: 20
  },
  planFeatures: {
    marginBottom: 10
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 1
  },
  planFeatureText: { 
    color: '#c7c7cc', 
    fontSize: 11,
    marginLeft: 5,
    flex: 1
  },
  planFeatureTextHighlight: { 
    color: '#fff',
    fontWeight: '500'
  },
  planButton: {
    backgroundColor: '#e50914',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  planButtonHighlight: {
    backgroundColor: '#ffd166'
  },
  planButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2
  },
  planButtonTextHighlight: {
    color: '#000',
    fontSize: 12
  },

  partnersRow: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  partnerBox: { 
    width: (Dimensions.get('window').width - 16*2 - 10*3)/4, 
    height: 60, 
    marginRight: 10, 
    marginBottom: 10, 
    backgroundColor: '#2b2b31', 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  partnerText: { color: '#8e8e93', fontSize: 12, fontWeight: '600' },
  
  
  // Subscription banner styles
  subscriptionBanner: { 
    backgroundColor: '#e50914', 
    padding: 16, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  subscriptionBannerText: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1, marginRight: 12 },
  subscriptionBannerBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  subscriptionBannerBtnText: { color: '#e50914', fontSize: 12, fontWeight: '700' },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Recently Updated (collapsed) styles
  recentCard: { width: 136, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  recentCover: { width: 136, height: 188, borderRadius: 12 },
  recentTitle: { color: '#fff', fontWeight: '700', marginTop: 6, fontSize: 13 },
  recentCats: { color: '#a0a0a6', marginTop: 2, fontSize: 12 },
  recentEpisodes: { color: '#e50914', marginTop: 2, fontSize: 11, fontWeight: '600' },
  recentRate: { color: '#ffd166', marginTop: 3, fontWeight: '700' },
  loadMoreBtn: { alignSelf: 'center', marginTop: 12, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: '#e50914' },
  loadMoreBtnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  loadMoreText: { color: '#fff', fontWeight: '700' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#121219', borderRadius: 12, padding: 20, width: '85%', maxHeight: '70%' },
  filterScrollView: { maxHeight: 300, marginBottom: 16 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  
  // Filter type buttons
  filterTypeRow: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#1c1c23', borderRadius: 8, padding: 4 },
  filterTypeBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  filterTypeBtnActive: { backgroundColor: '#e50914' },
  filterTypeText: { color: '#c7c7cc', fontSize: 14, fontWeight: '600' },
  filterTypeTextActive: { color: '#fff', fontWeight: '700' },
  
  // Filter items
  filterItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  filterText: { color: '#c7c7cc', fontSize: 16 },
  filterTextActive: { color: '#e50914', fontWeight: '700' },
  
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
  modalResetBtn: { backgroundColor: '#1c1c23', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', flex: 1 },
  modalResetText: { color: '#8e8e93', fontWeight: '700' },
  modalCloseBtn: { backgroundColor: '#e50914', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', flex: 1 },
  modalCloseText: { color: '#fff', fontWeight: '700' },

});


