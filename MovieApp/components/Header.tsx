import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal, Pressable, Animated, FlatList, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import FloatingSigninButton from './FloatingSigninButton';
import filmzoneApi from '../services/filmzone-api';

// Search items lấy từ FilmZone search API
type SearchItem = import('../types/api-dto').SearchResultDTO;


export default function Header() {
  const { authState } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { showWarning } = useToast();
  const { width } = useWindowDimensions();
  
  // Hide search text when screen width is less than 600px
  const showSearchText = width >= 100;
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [filterType, setFilterType] = useState<'genre' | 'year' | 'studio'>('genre');
  const [tempSelectedGenre, setTempSelectedGenre] = useState('Tất cả');
  const [tempSelectedYear, setTempSelectedYear] = useState('Tất cả');
  const [tempSelectedStudio, setTempSelectedStudio] = useState('Tất cả');
  const [customYearInput, setCustomYearInput] = useState('');
  const [burgerRotation] = useState(new Animated.Value(0));
  
  // Filter data - Load from FilmZone API
  const [genres, setGenres] = useState(['Tất cả']);
  const [tagList, setTagList] = useState<any[]>([]);
  const [years, setYears] = useState(['Tất cả', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015']);
  const [studios, setStudios] = useState(['Tất cả']);
  const [regionList, setRegionList] = useState<any[]>([]);
  
  // Load filter data from backend (tags + regions)
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [tagsResponse, regionsResponse] = await Promise.all([
          filmzoneApi.getAllTags(),
          filmzoneApi.getAllRegions(),
        ]);

        if (tagsResponse.errorCode === 200 && tagsResponse.data) {
          setTagList(tagsResponse.data);
          const tagNames = tagsResponse.data.map((tag: any) => tag.tagName);
          setGenres(['Tất cả', ...tagNames]);
        }

        if (regionsResponse.errorCode === 200 && regionsResponse.data) {
          setRegionList(regionsResponse.data);
          const regionNames = regionsResponse.data.map((region: any) => region.regionName);
          setStudios(['Tất cả', ...regionNames]);
        }
      } catch (error) {
      }
    };
    
    loadFilterData();
  }, []);
  
  // Search functionality - FilmZone backend search API + filter logic
  useEffect(() => {
    const searchMovies = async () => {
      const query = searchQuery.trim();
      if (!query) {
        setSearchResults([]);
        return;
      }

      try {
        // Map filters to backend parameters when có tag/region
        let tagIds: number[] | undefined;
        if (tempSelectedGenre !== 'Tất cả' && tempSelectedGenre !== 'Movies' && tempSelectedGenre !== 'TV Shows') {
          const foundTag = tagList.find((t: any) => t.tagName === tempSelectedGenre);
          if (foundTag) tagIds = [foundTag.tagID];
        }

        let regionCode: string | undefined;
        if (tempSelectedStudio !== 'Tất cả') {
          const foundRegion = regionList.find((r: any) => r.regionName === tempSelectedStudio);
          if (foundRegion?.regionCode) regionCode = foundRegion.regionCode;
        }

        const response = await filmzoneApi.searchMovies(query, { tagIds, regionCode });

        const isOk = (response as any).success === true || (response.errorCode >= 200 && response.errorCode < 300);
        if (isOk && response.data) {
          let filteredResults = response.data;

          // Client-side filter for type (Movies/TV)
          if (tempSelectedGenre === 'Movies') {
            filteredResults = filteredResults.filter(item => (item as any).isSeries === false);
          } else if (tempSelectedGenre === 'TV Shows') {
            filteredResults = filteredResults.filter(item => (item as any).isSeries === true);
          }

          // Client-side filter for year (backend chưa hỗ trợ param year)
          if (tempSelectedYear !== 'Tất cả') {
            filteredResults = filteredResults.filter(item => item.year?.toString() === tempSelectedYear);
          }

          // Nếu chưa map được regionCode thì vẫn lọc client theo studio/regionName
          if (tempSelectedStudio !== 'Tất cả' && !regionCode) {
            filteredResults = filteredResults.filter(item => 
              item.studio === tempSelectedStudio || 
              (item as any).region?.regionName === tempSelectedStudio
            );
          }

          setSearchResults(filteredResults);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(searchMovies, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, tempSelectedGenre, tempSelectedYear, tempSelectedStudio]);

  const handleSearchPress = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };


  const handleFilterToggle = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    
    // Check if user is logged in before allowing filter access
    if (!authState.user) {
      showWarning(t('filter.signin_required_message') || 'Please sign in to use filters');
      return;
    }
    
    setShowFilterOptions(!showFilterOptions);
  };


  const handleSearchItemPress = async (item: SearchItem) => {
    try { await Haptics.selectionAsync(); } catch {}
    handleSearchClose();
    
    const isSeries = typeof item.isSeries === 'boolean' ? item.isSeries : item.isSeries;
    const pathname = isSeries ? '/details/series/[id]' : '/details/movie/[id]';
    const baseParams: any = { 
      id: item.id, 
      title: item.title, 
      cover: item.cover, 
      categories: Array.isArray(item.categories) ? item.categories.join(' • ') : '', 
      rating: item.rating 
    };
    router.push({ pathname, params: baseParams });
  };

  const go404 = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/+not-found'); };
  const goSignIn = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/auth/signin'); };
  const goProfile = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/profile'); };
  const goAboutUs = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/about-us'); };
  const goHelpCenter = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/help-center'); };
  const goContacts = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/contacts'); };
  const goPrivacyPolicy = async () => { try { await Haptics.selectionAsync(); } catch {} router.push('/privacy-policy'); };
  
  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    setMenuOpen(!menuOpen);
    
    Animated.timing(burgerRotation, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <Image
            source={{ uri: 'https://flixgo.volkovdesign.com/main/img/logo.svg' }}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        {/* Categories (hamburger) */}
        <Pressable style={({ pressed }) => [styles.circleBtn, pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }]} onPress={toggleMenu}>
          <Animated.View style={[styles.burger, { backgroundColor: menuOpen ? '#e50914' : '#fff', transform: [{ rotate: burgerRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }] }]} />
          <Animated.View style={[styles.burger, { width: 12, backgroundColor: menuOpen ? '#e50914' : '#fff', transform: [{ rotate: burgerRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] }) }] }]} />
        </Pressable>

        {/* Nav placeholders */}
        <View style={styles.flexGrow} />

        {/* Search */}
        <Pressable style={[styles.searchBox, !showSearchText && styles.searchBoxIconOnly]} onPress={handleSearchPress}>
          {showSearchText ? (
            <TextInput 
              placeholder={t('header.search')} 
              placeholderTextColor="#8e8e93" 
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={false}
            />
          ) : (
            <Image
              source={require('../assets/images/search.png')}
              style={styles.searchIcon}
              contentFit="contain"
            />
          )}
        </Pressable>

        {/* Language */}
        <Pressable style={({ pressed }) => [styles.langBtn, pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }]} onPress={() => setLangOpen(true)}>
          <Text style={styles.langText}>{language === 'en' ? 'EN' : 'VI'}</Text>
        </Pressable>

        {/* MovieBox */}
        <Pressable 
          style={({ pressed }) => [styles.movieBoxBtn, pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }]} 
          onPress={() => {
            Haptics.selectionAsync();
            router.push('/moviebox');
          }}
        >
          <Image 
            source={require('../assets/images/box.png')} 
            style={styles.movieBoxIcon}
            contentFit="contain"
          />
        </Pressable>

        {/* Avatar based on auth status - Signin button is now floating */}
        {authState.isAuthenticated && (
          <Pressable style={({ pressed }) => [styles.avatar, pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }]} onPress={goProfile}>
            {authState.user?.avatar ? (
              <Image source={{ uri: authState.user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {authState.user?.userName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </Pressable>
        )}
      </View>

      {/* Menu Modal */}
      <Modal visible={menuOpen} animationType="fade" transparent onRequestClose={toggleMenu}>
        <Pressable style={styles.modalBackdrop} onPress={toggleMenu} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{t('header.menu')}</Text>
          {[
            { name: t('menu.actor'), action: () => { toggleMenu(); router.push('/actors' as any); } },
            { name: t('menu.about_us'), action: () => { toggleMenu(); goAboutUs(); } },
            { name: t('menu.help_center'), action: () => { toggleMenu(); goHelpCenter(); } },
            { name: t('menu.contacts'), action: () => { toggleMenu(); goContacts(); } },
            { name: t('menu.privacy_policy'), action: () => { toggleMenu(); goPrivacyPolicy(); } },
          ].map((item) => (
            <Pressable key={item.name} style={({ pressed }) => [styles.modalItem, pressed && { opacity: 0.9 }]} onPress={item.action}>
              <Text style={styles.modalItemText}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={langOpen} animationType="fade" transparent onRequestClose={() => setLangOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setLangOpen(false)} />
        <View style={styles.langCard}>
          <Text style={styles.langTitle}>{t('header.language')}</Text>
          {[
            { code: 'en', name: t('language.english') },
            { code: 'vi', name: t('language.vietnamese') },
          ].map((lang) => (
            <Pressable 
              key={lang.code} 
              style={({ pressed }) => [
                styles.langItem, 
                { backgroundColor: language === lang.code ? '#e50914' : 'transparent' },
                pressed && { opacity: 0.9 }
              ]} 
              onPress={() => {
                setLanguage(lang.code as 'en' | 'vi');
                setLangOpen(false);
              }}
            >
              <Text style={[
                styles.langTextItem, 
                { color: language === lang.code ? '#fff' : '#8e8e93' }
              ]}>
                {lang.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal visible={searchOpen} animationType="fade" transparent onRequestClose={handleSearchClose}>
        <Pressable style={styles.modalBackdrop} onPress={handleSearchClose} />
        <View style={styles.searchCard}>
          <View style={styles.searchHeader}>
            <Text style={styles.searchTitle}>{t('search.title')}</Text>
            <Pressable onPress={handleSearchClose} style={styles.searchCloseBtn}>
              <Text style={styles.searchCloseText}>X</Text>
            </Pressable>
          </View>
          
                  {/* Search Input with Filter Toggle Button */}
                  <View style={styles.searchInputContainer}>
                    <TextInput
                      placeholder={t('search.placeholder')}
                      placeholderTextColor="#8e8e93"
                      style={styles.searchModalInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoFocus={true}
                    />
                    
                    {/* Small Square Filter Toggle Button */}
                    <Pressable 
                      style={({ pressed }) => [
                        styles.searchFilterToggleButton, 
                        pressed && { opacity: 0.8 },
                        showFilterOptions && styles.searchFilterToggleButtonActive,
                        (tempSelectedGenre !== 'Tất cả' || tempSelectedYear !== 'Tất cả' || tempSelectedStudio !== 'Tất cả') && styles.searchFilterToggleButtonActive
                      ]}
                      onPress={handleFilterToggle}
                    >
                      <Ionicons 
                        name="filter" 
                        size={16} 
                        color={(showFilterOptions || tempSelectedGenre !== 'Tất cả' || tempSelectedYear !== 'Tất cả' || tempSelectedStudio !== 'Tất cả') ? '#fff' : '#e50914'} 
                      />
                    </Pressable>
                  </View>
                  
                  {/* Filter Status Display */}
                  {(tempSelectedGenre !== 'Tất cả' || tempSelectedYear !== 'Tất cả' || tempSelectedStudio !== 'Tất cả') && (
                    <View style={styles.searchFilterStatus}>
                      <Text style={styles.searchFilterStatusText}>
                        {t('filter.active_filters')}: 
                        {tempSelectedGenre !== 'Tất cả' && ` ${tempSelectedGenre}`}
                        {tempSelectedYear !== 'Tất cả' && ` • ${tempSelectedYear}`}
                        {tempSelectedStudio !== 'Tất cả' && ` • ${tempSelectedStudio}`}
                      </Text>
                    </View>
                  )}
          
          {/* Filter Section - Conditional Display */}
          {showFilterOptions && (
            <View style={styles.searchFilterSection}>
              <Text style={styles.searchFilterTitle}>{t('filter.options')}</Text>
              
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

              {/* Filter Options - Grid Layout */}
              <View style={styles.filterGridContainer}>
                {filterType === 'genre' && (
                  <FlatList
                    data={genres}
                    numColumns={3}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <Pressable
                        style={({ pressed }) => [
                          styles.filterGridItem,
                          tempSelectedGenre === item && styles.filterGridItemActive,
                          pressed && { opacity: 0.7 }
                        ]}
                        onPress={() => setTempSelectedGenre(item)}
                      >
                        <Text style={[
                          styles.filterGridText,
                          tempSelectedGenre === item && styles.filterGridTextActive
                        ]}>
                          {item}
                        </Text>
                      </Pressable>
                    )}
                    contentContainerStyle={styles.filterGridContent}
                    showsVerticalScrollIndicator={false}
                  />
                )}
                
                {filterType === 'year' && (
                  <View style={styles.yearFilterContainer}>
                    {/* Recent Years Grid */}
                    <FlatList
                      data={years}
                      numColumns={4}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <Pressable
                          style={({ pressed }) => [
                            styles.filterGridItem,
                            tempSelectedYear === item && styles.filterGridItemActive,
                            pressed && { opacity: 0.7 }
                          ]}
                          onPress={() => {
                            setTempSelectedYear(item);
                            setCustomYearInput(''); // Clear custom input when selecting preset year
                          }}
                        >
                          <Text style={[
                            styles.filterGridText,
                            tempSelectedYear === item && styles.filterGridTextActive
                          ]}>
                            {item}
                          </Text>
                        </Pressable>
                      )}
                      contentContainerStyle={styles.filterGridContent}
                      showsVerticalScrollIndicator={false}
                    />
                    
                    {/* Custom Year Input */}
                    <View style={styles.customYearContainer}>
                      <Text style={styles.customYearLabel}>Nhập năm tùy chỉnh:</Text>
                      <TextInput
                        style={styles.customYearInput}
                        placeholder="VD: 2010"
                        placeholderTextColor="#8e8e93"
                        value={customYearInput}
                        onChangeText={(text: string) => {
                          setCustomYearInput(text);
                          if (text.trim() !== '') {
                            setTempSelectedYear(text);
                          }
                        }}
                        keyboardType="numeric"
                        maxLength={4}
                      />
                    </View>
                  </View>
                )}
                
                {filterType === 'studio' && (
                  <FlatList
                    data={studios}
                    numColumns={3}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <Pressable
                        style={({ pressed }) => [
                          styles.filterGridItem,
                          tempSelectedStudio === item && styles.filterGridItemActive,
                          pressed && { opacity: 0.7 }
                        ]}
                        onPress={() => setTempSelectedStudio(item)}
                      >
                        <Text style={[
                          styles.filterGridText,
                          tempSelectedStudio === item && styles.filterGridTextActive
                        ]}>
                          {item}
                        </Text>
                      </Pressable>
                    )}
                    contentContainerStyle={styles.filterGridContent}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
              
              <View style={styles.modalButtonRow}>
                <Pressable
                  style={({ pressed }) => [styles.modalResetBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => {
                    setTempSelectedGenre('Tất cả');
                    setTempSelectedYear('Tất cả');
                    setTempSelectedStudio('Tất cả');
                    setCustomYearInput(''); // Clear custom input on reset
                    
                    // Reset will automatically trigger search with cleared filters
                  }}
                >
                  <Text style={styles.modalResetText}>{t('filter.reset')}</Text>
                </Pressable>
                
                        <Pressable
                          style={({ pressed }) => [styles.modalCloseBtn, pressed && { opacity: 0.7 }]}
                          onPress={() => {
                            // Apply filters - the useEffect will handle the filtering automatically
                            // No need to modify search query, just close filter options
                            setShowFilterOptions(false);
                            
                            // Trigger search with current query and filters
                            // The useEffect will automatically apply the filters
                          }}
                        >
                          <Text style={styles.modalCloseText}>{t('filter.apply')}</Text>
                        </Pressable>
              </View>
            </View>
          )}
          
          {searchQuery.trim().length > 0 && (
            <View style={styles.searchResultsContainer}>
              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Pressable 
                      style={({ pressed }) => [styles.searchResultItem, pressed && { opacity: 0.8 }]} 
                      onPress={() => handleSearchItemPress(item)}
                    >
                      <Image source={{ uri: item.cover }} style={styles.searchResultImage} />
                      <View style={styles.searchResultContent}>
                        <Text style={styles.searchResultTitle}>{item.title}</Text>
                        <Text style={styles.searchResultCategories}>{(item.categories || []).join(' • ')}</Text>
                        <View style={styles.searchResultMeta}>
                          <Text style={styles.searchResultRating}>{item.rating}</Text>
                          <Text style={styles.searchResultYear}>{item.year}</Text>
                          <Text style={styles.searchResultType}>{item.isSeries ? 'TV Show' : 'Movie'}</Text>
                        </View>
                      </View>
                    </Pressable>
                  )}
                />
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>{t('search.no_results')} "{searchQuery}"</Text>
                  <Text style={styles.noResultsSubtext}>{t('search.try_different')}</Text>
                </View>
              )}
            </View>
          )}
          
          {searchQuery.trim().length === 0 && (
            <View style={styles.searchSuggestionsContainer}>
              <Text style={styles.searchSuggestionsTitle}>{t('search.popular_searches')}</Text>
              {['Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi', 'Adventure'].map((suggestion) => (
                <Pressable 
                  key={suggestion} 
                  style={({ pressed }) => [styles.searchSuggestion, pressed && { opacity: 0.8 }]} 
                  onPress={() => setSearchQuery(suggestion)}
                >
                  <Text style={styles.searchSuggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Modal>

      
      {/* Floating Signin Button */}
      <FloatingSigninButton />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    backgroundColor: '#2b2b31', 
    paddingHorizontal: 10, 
    paddingTop: 60, 
    paddingBottom: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.06)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  logoRow: { 
    paddingRight: 8,
    flexShrink: 0, // Không thu nhỏ logo
  },
  logo: { width: 90, height: 20 },
  circleBtn: { 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    backgroundColor: '#1c1c23', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 8,
    flexShrink: 0, // Không thu nhỏ button
  },
  burger: { width: 20, height: 2, backgroundColor: '#fff', marginVertical: 1 },
  flexGrow: { 
    flex: 0,
    minWidth: 0, // Minimum spacing
  },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#14141b', 
    borderRadius: 10, 
    paddingHorizontal: 20, 
    height: 34, 
    marginRight: 8,
    flex: 2, // Cho phép search box co giãn
    minWidth: 60, // Giảm minWidth để responsive tốt hơn
    maxWidth: 500, // Giới hạn width tối đa
    borderWidth: 1, 
    borderColor: '#e50914',
  },
  searchBoxIconOnly: {
    flex: 0,
    minWidth: 34,
    maxWidth: 34,
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  searchInput: { color: '#fff', flex: 1, fontSize: 12 },
  searchIcon: {
    width: 20,
    height: 20,
  },
  langBtn: { 
    backgroundColor: '#1c1c23', 
    height: 34, 
    paddingHorizontal: 10, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 6,
    flexShrink: 0, // Không thu nhỏ
  },
  langText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  movieBoxBtn: { 
    backgroundColor: '#1c1c23', 
    height: 34, 
    paddingHorizontal: 10, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 6,
    position: 'relative',
    flexShrink: 0, // Không thu nhỏ
  },
  movieBoxIcon: { width: 20, height: 26 },
  movieBoxBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#e50914',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movieBoxBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  signInBtn: { 
    backgroundColor: '#e50914', 
    height: 34, 
    paddingHorizontal: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 6,
    flexShrink: 0, // Không thu nhỏ
  },
  signInText: { color: '#fff', fontWeight: '700', textTransform: 'uppercase', fontSize: 11 },
  subscriptionIndicator: { 
    backgroundColor: '#e50914', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    marginRight: 6,
    flexShrink: 0, // Không thu nhỏ
  },
  subscriptionText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  avatar: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    backgroundColor: '#2a2a37', 
    marginLeft: 0, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 2, 
    borderColor: '#e50914',
    flexShrink: 0, // Không thu nhỏ
  },
  avatarImage: { width: 28, height: 28, borderRadius: 14 },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { position: 'absolute', top: 100, left: 12, right: 12, backgroundColor: '#121219', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  modalTitle: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  modalItem: { paddingVertical: 10 },
  modalItemText: { color: '#c7c7cc' },
  langCard: { position: 'absolute', top: 100, right: 12, width: 160, backgroundColor: '#121219', borderRadius: 12, padding: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  langTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  langItem: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8 },
  langTextItem: { color: '#fff' },

  // Search Modal Styles
  searchCard: { 
    position: 'absolute', 
    top: 100, 
    left: 12, 
    right: 12, 
    backgroundColor: '#121219', 
    borderRadius: 12, 
    padding: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 }, 
    elevation: 8,
    maxHeight: '70%'
  },
  searchHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  searchTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  searchCloseBtn: { padding: 4 },
  searchCloseText: { color: '#8e8e93', fontSize: 18, fontWeight: '700' },
  // Search Input Container
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  searchModalInput: { 
    flex: 1,
    backgroundColor: '#1c1c23', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    color: '#fff', 
    fontSize: 16, 
    borderWidth: 1,
    borderColor: '#e50914',
  },
  
  // Small Square Filter Toggle Button
  searchFilterToggleButton: {
    width: 40,
    height: 40,
    backgroundColor: '#1c1c23',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e50914',
  },
  searchFilterToggleButtonActive: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
  },
  
  // Filter Status Display
  searchFilterStatus: {
    backgroundColor: '#1c1c23',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e50914',
  },
  searchFilterStatusText: {
    color: '#e50914',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Filter Section in Search Modal
  searchFilterSection: {
    marginBottom: 16,
  },
  searchFilterTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  // Filter Type Buttons
  filterTypeRow: { 
    flexDirection: 'row', 
    marginBottom: 16, 
    backgroundColor: '#1c1c23', 
    borderRadius: 8, 
    padding: 4 
  },
  filterTypeBtn: { 
    flex: 1, 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  filterTypeBtnActive: { 
    backgroundColor: '#e50914' 
  },
  filterTypeText: { 
    color: '#c7c7cc', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  filterTypeTextActive: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  
  // Filter Grid Layout
  filterGridContainer: {
    maxHeight: 200,
    marginBottom: 16,
  },
  filterGridContent: {
    paddingHorizontal: 4,
  },
  filterGridItem: {
    flex: 1,
    backgroundColor: '#1c1c23',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterGridItemActive: {
    backgroundColor: '#e50914',
    borderColor: '#e50914',
  },
  filterGridText: {
    color: '#c7c7cc',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  filterGridTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  
  // Custom Year Input Styles
  yearFilterContainer: {
    marginBottom: 16,
  },
  customYearContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  customYearLabel: {
    color: '#c7c7cc',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  customYearInput: {
    backgroundColor: '#1c1c23',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e50914',
    textAlign: 'center',
  },
  
  // Modal Buttons
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalResetBtn: {
    flex: 1,
    backgroundColor: '#1c1c23',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e50914',
  },
  modalResetText: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseBtn: {
    flex: 1,
    backgroundColor: '#e50914',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchResultsContainer: { maxHeight: 300 },
  searchResultItem: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.1)' 
  },
  searchResultImage: { width: 60, height: 80, borderRadius: 8, marginRight: 12 },
  searchResultContent: { flex: 1, justifyContent: 'center' },
  searchResultTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  searchResultCategories: { color: '#8e8e93', fontSize: 12, marginBottom: 4 },
  searchResultMeta: { flexDirection: 'row', alignItems: 'center' },
  searchResultRating: { color: '#ffd166', fontSize: 12, fontWeight: '700', marginRight: 8 },
  searchResultYear: { color: '#8e8e93', fontSize: 12, marginRight: 8 },
  searchResultType: { color: '#8e8e93', fontSize: 12 },
  noResultsContainer: { padding: 20, alignItems: 'center' },
  noResultsText: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  noResultsSubtext: { color: '#8e8e93', fontSize: 14 },
  searchSuggestionsContainer: { paddingTop: 8 },
  searchSuggestionsTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  searchSuggestion: { 
    backgroundColor: '#1c1c23', 
    borderRadius: 8, 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    marginBottom: 8 
  },
  searchSuggestionText: { color: '#8e8e93', fontSize: 14 },
});


