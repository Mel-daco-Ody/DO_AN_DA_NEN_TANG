import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal, Pressable, Animated, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import FloatingSigninButton from './FloatingSigninButton';

// Mock data for search - in real app this would come from API
type SearchItem = {
  id: string;
  title: string;
  cover: string;
  categories: string[];
  rating: string;
  isSeries: boolean;
  year: string;
  studio: string;
};

// Search data will be loaded from FilmZone backend
const searchData: SearchItem[] = [];

export default function Header() {
  const { authState } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [burgerRotation] = useState(new Animated.Value(0));
  
  // Search functionality - FilmZone backend integration
  useEffect(() => {
    const searchMovies = async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const { movieAppApi } = await import('../services/mock-api');
          const response = await movieAppApi.searchMovies(searchQuery.trim());
          
          if (response.errorCode === 200 && response.data) {
            setSearchResults(response.data);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(searchMovies, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchPress = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchItemPress = async (item: SearchItem) => {
    try { await Haptics.selectionAsync(); } catch {}
    handleSearchClose();
    
    // Add movie to watch progress when clicked
    try {
      const { movieAppApi } = await import('../services/mock-api');
      await movieAppApi.addToWatchProgress(parseInt(item.id));
    } catch (error) {
      console.log('Error adding to watch progress:', error);
    }
    
    const isSeries = typeof item.isSeries === 'boolean' ? item.isSeries : item.isSeries;
    const pathname = isSeries ? '/details/series/[id]' : '/details/movie/[id]';
    const baseParams: any = { 
      id: item.id, 
      title: item.title, 
      cover: item.cover, 
      categories: item.categories.join(' • '), 
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
        <Pressable style={styles.logoRow} onPress={go404} android_ripple={{ color: 'rgba(255,255,255,0.1)' }}>
          <Image
            source={{ uri: 'https://flixgo.volkovdesign.com/main/img/logo.svg' }}
            style={styles.logo}
            contentFit="contain"
          />
        </Pressable>

        {/* Categories (hamburger) */}
        <Pressable style={({ pressed }) => [styles.circleBtn, pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }]} onPress={toggleMenu}>
          <Animated.View style={[styles.burger, { backgroundColor: menuOpen ? '#e50914' : '#fff', transform: [{ rotate: burgerRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }] }]} />
          <Animated.View style={[styles.burger, { width: 12, backgroundColor: menuOpen ? '#e50914' : '#fff', transform: [{ rotate: burgerRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] }) }] }]} />
        </Pressable>

        {/* Nav placeholders */}
        <View style={styles.flexGrow} />

        {/* Search */}
        <Pressable style={styles.searchBox} onPress={handleSearchPress}>
          <TextInput 
            placeholder={t('header.search')} 
            placeholderTextColor="#8e8e93" 
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={false}
          />
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
          <Text style={styles.movieBoxIcon}>📦</Text>
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
              <Text style={styles.searchCloseText}>✕</Text>
            </Pressable>
          </View>
          
          <TextInput
            placeholder={t('search.placeholder')}
            placeholderTextColor="#8e8e93"
            style={styles.searchModalInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          
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
                        <Text style={styles.searchResultCategories}>{item.categories.join(' • ')}</Text>
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
    paddingHorizontal: 12, 
    paddingTop: 60, 
    paddingBottom: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.06)',
    position: 'absolute',
    top: 0,                    // ← Thay đổi từ 0 thành 100px
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  logoRow: { paddingRight: 10 },
  logo: { width: 90, height: 20 },
  circleBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1c1c23', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  burger: { width: 16, height: 2, backgroundColor: '#fff', marginVertical: 1 },
  flexGrow: { flex: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#14141b', borderRadius: 10, paddingHorizontal: 30, height: 34, marginRight: 10, minWidth: 120, borderWidth: 1, borderColor: '#e50914' },
  searchInput: { color: '#fff', flex: 1, fontSize: 12 },
  langBtn: { backgroundColor: '#1c1c23', height: 34, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  langText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  movieBoxBtn: { 
    backgroundColor: '#1c1c23', 
    height: 34, 
    paddingHorizontal: 10, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 8,
    position: 'relative'
  },
  movieBoxIcon: { fontSize: 16 },
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
  signInBtn: { backgroundColor: '#e50914', height: 34, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  signInText: { color: '#fff', fontWeight: '700', textTransform: 'uppercase', fontSize: 11 },
  subscriptionIndicator: { backgroundColor: '#e50914', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  subscriptionText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2a2a37', marginLeft: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#e50914' },
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
  searchModalInput: { 
    backgroundColor: '#1c1c23', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    color: '#fff', 
    fontSize: 16, 
    marginBottom: 16 
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


