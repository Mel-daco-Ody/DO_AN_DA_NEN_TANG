import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, Text, Pressable, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { HeroCarousel } from '../../components/home/HeroCarousel';
import { RecentlyUpdated } from '../../components/home/RecentlyUpdated';
import { FeaturedMovies } from '../../components/home/FeaturedMovies';
import { TrendingMovies } from '../../components/home/TrendingMovies';
import { NowWatching } from '../../components/home/NowWatching';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOptimizedHomeData } from '../../hooks/useOptimizedHomeData';
import { useFilterLogic } from '../../hooks/useFilterLogic';
import { useSavedMovies } from '../../hooks/useSavedMovies';
import { MediaItem, TabItem, FilterState } from '../../types/AppTypes';
import { GRID_CONFIG, FILTER_DEFAULTS } from '../../constants/AppConstants';
import { logger } from '../../utils/logger';
import filmzoneApi from '../../services/filmzone-api';

// Types are now imported from AppTypes.ts


export default function HomeScreen() {
  const { authState } = useAuth();
  const { t } = useLanguage();
  
  // Custom hooks for data management
  const { data: homeData, isLoading, error, refetch, refresh } = useOptimizedHomeData(authState.user?.userID);
  const { 
    filterState, 
    tempFilterState,
    updateFilter,
    updateTempFilter,
    resetFilters,
    resetTempFilters,
    applyTempFilters,
    filteredItems,
    hasActive
  } = useFilterLogic(homeData?.allItems || []);
  const { isSaved, toggleSaved } = useSavedMovies(authState.user?.userID);
  
  // Local state
  const [activeCategory, setActiveCategory] = useState<'new' | 'genre'>('new');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState<'genre' | 'year' | 'studio'>('genre');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [customYearInput, setCustomYearInput] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [planPrices, setPlanPrices] = useState<Record<number, string>>({});
  const [priceList, setPriceList] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any | null>(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [fetchedSubscription, setFetchedSubscription] = useState<any | null>(null);

  // Memoized tabs
  const tabs: TabItem[] = React.useMemo(
    () => [
      { key: 'new', title: t('home.new_items') },
      { key: 'genre', title: t('home.all_content') },
    ],
    [t]
  );


  // Event handlers
  const handleHeroSlidePress = useCallback(async (slide: any) => {
    try {
      await Haptics.selectionAsync();
    
    // Add movie to watch progress when clicked
    try {
      const { movieAppApi } = await import('../../services/mock-api');
      const response = await movieAppApi.addToWatchProgress(parseInt(slide.id));
      
      if (response.success) {
        // Refresh now watching list
        const progressResponse = await movieAppApi.getWatchProgress();
        if (progressResponse.errorCode === 200 && progressResponse.data) {
            // This will be handled by the useHomeData hook
            refetch();
        }
      }
    } catch (error) {
        logger.warn('Failed to add to watch progress', error);
    }
    
    // Navigate to movie/series detail instead of player
      const destinationPath = slide.isSeries ? '/details/series/[id]' : '/details/movie/[id]';
      router.push({
        pathname: destinationPath,
        params: {
          id: slide.id,
          title: slide.title,
          cover: slide.bg,
          rating: slide.rating,
          description: slide.text,
          categories: '',
        }
      });
    } catch (error) {
      logger.warn('Haptic feedback failed', error);
    }
  }, [refetch]);

  const handleMoviePress = useCallback(async (movie: MediaItem) => {
    try {
      await Haptics.selectionAsync();
    
    // Add movie to watch progress when clicked
    try {
      const { movieAppApi } = await import('../../services/mock-api');
        const response = await movieAppApi.addToWatchProgress(movie.movieID);
      
      if (response.success) {
        // Update watch progress with current position
          await movieAppApi.updateWatchProgress(movie.movieID, 0, 0);
        
        // Refresh now watching list
          refetch();
      }
    } catch (error) {
        logger.warn('Failed to add to watch progress', error);
    }
    
      const isSeries = typeof movie.isSeries === 'boolean' ? movie.isSeries : movie.movieType === 'series';
    const pathname = isSeries ? '/details/series/[id]' : '/details/movie/[id]';
      
    // Add mock metadata for demo items
      const baseParams: any = { 
        id: movie.id || movie.movieID.toString(), 
        title: movie.title, 
        cover: (movie as any).cover?.uri ?? movie.image, 
        categories: movie.categories?.join(' • ') || '', 
        rating: movie.rating || movie.popularity?.toString() || '0' 
      };
      
      if (movie.id === 'x1') {
        Object.assign(baseParams, { 
          year: '2024', 
          duration: '126 min', 
          country: 'USA', 
          cast: 'A. Johnson, M. Rivera', 
          description: 'Một thám tử trở về quê nhà điều tra chuỗi vụ án liên quan đến quá khứ của chính mình.' 
        });
      }
      if (movie.id === 'x2') {
        Object.assign(baseParams, { 
          year: '2025', 
          duration: 'Season 1', 
          country: 'UK', 
          cast: 'L. Bennett, K. Ito', 
          description: 'Một vương quốc bị lãng quên vang vọng những bí ẩn cổ xưa, nhóm thám hiểm trẻ bắt đầu hành trình tìm lại nguồn gốc.', 
          episodes: '1|2|3|4|5' 
        });
      }
      
      router.push({ pathname, params: baseParams });
    } catch (error) {
      logger.warn('Haptic feedback failed', error);
    }
  }, [refetch]);

  const handleCategoryChange = useCallback((category: string) => {
    if (category === 'genre') {
                  // Check if user is logged in before allowing filter access
                  if (!authState.user) {
                    Alert.alert(
                      t('filter.signin_required_title'),
                      t('filter.signin_required_message'),
                      [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('common.signin'), onPress: () => {
              setShowFilterModal(false);
                          router.push('/auth/signin');
                        }}
                      ]
                    );
                    return;
                  }
                  
                  // Initialize temp values with current selected values
      resetTempFilters();
      setCustomYearInput(filterState.selectedYear !== FILTER_DEFAULTS.YEAR && !['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].includes(filterState.selectedYear) ? filterState.selectedYear : '');
                  setShowFilterModal(true);
                  setActiveCategory('genre');
                } else {
      setActiveCategory(category as 'new' | 'genre');
    }
  }, [authState.user, t, filterState.selectedYear, resetTempFilters]);

  const handleFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  // Get items to display based on active category
  const displayItems = activeCategory === 'new' ? (homeData?.allItems || []) : filteredItems;

  // Helpers for plans
  const getPlanId = (plan: any) => plan?.planID ?? plan?.planId ?? plan?.id;
  const getPriceId = (plan: any, sub?: any) =>
    sub?.priceID ?? sub?.priceId ?? plan?.priceID ?? plan?.priceId;
  const formatPrice = (price: any) => {
    if (!price) return 'N/A';
    if (price.amount !== undefined) {
      const amountNum = Number(price.amount);
      if (!isNaN(amountNum) && amountNum === 0) return 'Free';
      const currency = price.currency || '';
      return `${price.amount} ${currency}`.trim();
    }
    return price.toString();
  };

  // Load plans based on subscription status
  useEffect(() => {
    const loadPlans = async () => {
      setPlansLoading(true);
      try {
        // Ưu tiên lấy subscription mới nhất từ backend theo userID
        const userId = authState.user?.userID;
        let apiSubscription: any = null;
        if (userId) {
          try {
            const subsRes = await filmzoneApi.getSubscriptionsByUser(userId);
            const subsOk =
              (subsRes as any).success === true ||
              (subsRes.errorCode >= 200 && subsRes.errorCode < 300);
            if (subsOk && subsRes.data) {
              const subsArr = Array.isArray(subsRes.data) ? subsRes.data : [subsRes.data];
              if (subsArr.length > 0) {
                apiSubscription = subsArr
                  .filter((s: any) => s)
                  .sort((a: any, b: any) => {
                    const aId = Number(a.subscriptionID ?? a.subscriptionId ?? 0);
                    const bId = Number(b.subscriptionID ?? b.subscriptionId ?? 0);
                    return bId - aId;
                  })[0];
              }
            }
          } catch (err) {
            logger.warn('Home: getSubscriptionsByUser failed', err);
          }
        }

        // Nếu backend không trả về subscription, fallback về authState
        const sub = apiSubscription || authState.user?.subscription || null;
        setFetchedSubscription(sub);
        let subPlanId = (sub as any)?.planID ?? (sub as any)?.planId;
        let pricesData: any[] = [];

        // Load all prices once
        try {
          const pricesRes = await filmzoneApi.getAllPrices();
          const pricesOk = (pricesRes as any).success === true || (pricesRes.errorCode >= 200 && pricesRes.errorCode < 300);
          pricesData = pricesOk && pricesRes.data ? pricesRes.data : [];
          setPriceList(pricesData);
        } catch {
          pricesData = [];
          setPriceList([]);
        }

        // Nếu không có planID nhưng có priceID, cố gắng suy ra planID từ price
        if (sub && !subPlanId && ((sub as any)?.priceID ?? (sub as any)?.priceId)) {
          const subPriceId = (sub as any)?.priceID ?? (sub as any)?.priceId;
          try {
            const priceRes = await filmzoneApi.getPriceById(Number(subPriceId));
            const priceOk = (priceRes as any).success === true || (priceRes.errorCode >= 200 && priceRes.errorCode < 300);
            if (priceOk && priceRes.data) {
              subPlanId = priceRes.data.planID ?? priceRes.data.planId ?? subPlanId;
            }
          } catch {}
        }

        if (sub && subPlanId) {
          // Fetch current plan
          const planRes = await filmzoneApi.getPlanById(subPlanId);
          const planOk = (planRes as any).success === true || (planRes.errorCode >= 200 && planRes.errorCode < 300);
          if (planOk && planRes.data && planRes.data.isActive !== false) {
            setCurrentPlan(planRes.data);
            // prefer priceId if present, else try match from priceList by planId
            const priceId = getPriceId(planRes.data, sub);
            let priceLabel: string | undefined;
            if (priceId) {
              const priceRes = await filmzoneApi.getPriceById(priceId);
              const priceOk = (priceRes as any).success === true || (priceRes.errorCode >= 200 && priceRes.errorCode < 300);
              if (priceOk && priceRes.data) {
                priceLabel = formatPrice(priceRes.data);
              }
            }
            if (!priceLabel && pricesData.length) {
              const matched = pricesData.find((p: any) => String(p.planID ?? p.planId) === String(subPlanId));
              if (matched) {
                priceLabel = formatPrice(matched);
              }
            }
            if (priceLabel) {
              setPlanPrices(prev => ({ ...prev, [subPlanId]: priceLabel! }));
            }
          } else {
            setCurrentPlan(null);
          }
        } else {
          // Fetch all plans
          const plansRes = await filmzoneApi.getAllPlans();
          const plansOk = (plansRes as any).success === true || (plansRes.errorCode >= 200 && plansRes.errorCode < 300);
          if (plansOk && plansRes.data) {
            const activePlans = (plansRes.data || []).filter((p: any) => p.isActive !== false);
            setPlans(activePlans);

            // Fetch prices for each plan (best-effort)
            const priceEntries = await Promise.all(
              activePlans.map(async (p: any) => {
                const pid = getPlanId(p);
                const priceId = getPriceId(p);
                // 1) try priceId if available
                if (pid && priceId) {
                  const priceRes = await filmzoneApi.getPriceById(priceId);
                  const priceOk = (priceRes as any).success === true || (priceRes.errorCode >= 200 && priceRes.errorCode < 300);
                  if (priceOk && priceRes.data) {
                    return [pid, formatPrice(priceRes.data)] as const;
                  }
                }
                // 2) fallback: match from priceList by planID
                if (pid && pricesData.length) {
                  const matched = pricesData.find((pr: any) => String(pr.planID ?? pr.planId) === String(pid));
                  if (matched) {
                    return [pid, formatPrice(matched)] as const;
                  }
                }
                return null;
              })
            );

            const map: Record<number, string> = {};
            priceEntries.forEach(entry => {
              if (entry) {
                const [pid, priceLabel] = entry;
                map[pid] = priceLabel;
              }
            });
            setPlanPrices(map);
          } else {
            setPlans([]);
          }
        }
      } catch (error) {
        logger.warn('Failed to load plans', error);
        setPlans([]);
        setCurrentPlan(null);
      } finally {
        setPlansLoading(false);
      }
    };

    loadPlans();
  }, [authState.user]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header />
        <ScrollView style={styles.scrollView} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.pagePad}>
          <Text style={styles.loadingText}>Loading...</Text>
        </ScrollView>
                </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <ScrollView style={styles.scrollView} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.pagePad}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </ScrollView>
      </View>
    );
  }

  // Show empty state
  if (!homeData) {
    return (
      <View style={styles.container}>
        <Header />
        <ScrollView style={styles.scrollView} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.pagePad}>
          <Text style={styles.emptyText}>No data available</Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.pagePad}>
        {/* Hero carousel */}
        <HeroCarousel 
          slides={homeData.heroSlides} 
          onSlidePress={handleHeroSlidePress} 
        />

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

        {/* Recently Updated Section */}
        <RecentlyUpdated
          items={displayItems}
          tabs={tabs}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onItemPress={handleMoviePress}
          onFilterPress={handleFilterPress}
          hasActiveFilters={hasActive}
          t={t}
        />

      {/* Featured Movies */}
        <FeaturedMovies 
          movies={homeData.featuredMovies} 
          onMoviePress={handleMoviePress} 
        />

      {/* Trending Movies */}
        <TrendingMovies 
          movies={homeData.trendingMovies} 
          onMoviePress={handleMoviePress} 
        />

        {/* Now Watching */}
        <NowWatching 
          movies={homeData.nowWatching} 
          onMoviePress={handleMoviePress} 
          t={t}
        />

      {/* Filter Modal - Simplified */}
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

            {/* Simple Filter Options */}
            <View style={styles.simpleFilterContainer}>
              <Text style={styles.simpleFilterText}>
                Filter functionality will be implemented in the next version.
                      </Text>
                   </View>
            {/* Action Buttons */}
            <View style={styles.modalActions}>
                    <Pressable
                style={({ pressed }) => [styles.modalBtn, styles.modalBtnSecondary, pressed && { opacity: 0.7 }]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>{t('common.cancel')}</Text>
                    </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalBtn, styles.modalBtnPrimary, pressed && { opacity: 0.7 }]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.modalBtnPrimaryText}>{t('common.close')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>


      {/* Plans */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>
          {(fetchedSubscription || authState.user?.subscription) ? t('home.your_current_plan') : t('plan.choose_plan')}
        </Text>
        {/** Derived current plan for display on home */}
        {(() => {
          const userHasSubscription = !!(fetchedSubscription || authState.user?.subscription);
          const starterPlan = plans.find((p: any) => (p.code || p.name || '').toLowerCase() === 'starter');
          const fallbackPlan = starterPlan || (plans.length > 0 ? plans[0] : null);
          const effectiveCurrentPlan = userHasSubscription && currentPlan ? currentPlan : fallbackPlan;
          const effectivePlanId = effectiveCurrentPlan ? getPlanId(effectiveCurrentPlan) ?? -1 : -1;
          const effectivePrice = effectivePlanId !== -1 ? (planPrices[effectivePlanId] || 'N/A') : t('plan.free');
          const effectiveCta = userHasSubscription ? t('plan.manage_plan') : t('plan.choose_plan');
          const effectiveFeatures = effectiveCurrentPlan
            ? [effectiveCurrentPlan.description || effectiveCta]
            : [effectiveCta];

          return (
        <View style={styles.plansRow}>
          {plansLoading ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color="#e50914" size="small" />
              <Text style={{ color: '#fff' }}>{t('common.loading') || 'Loading...'}</Text>
            </View>
          ) : userHasSubscription && effectiveCurrentPlan ? (
            // Đã có subscription: hiển thị plan hiện tại
            <Plan
              title={effectiveCurrentPlan.name || effectiveCurrentPlan.code || `Plan ${getPlanId(effectiveCurrentPlan) ?? ''}`}
              price={effectivePrice}
              features={effectiveFeatures}
              cta={effectiveCta}
              highlight
              onPress={() => router.push('/profile')}
              t={t}
            />
          ) : (
            // Chưa có subscription: hiển thị tất cả plan khả dụng (thường là 3 plan)
            <>
              {(plans && plans.length > 0 ? plans : []).map((p: any, idx: number) => {
                const pid = getPlanId(p);
                const priceLabel = pid ? (planPrices[pid] || t('plan.free')) : t('plan.free');
                return (
                  <Plan
                    key={pid ?? idx}
                    title={p.name || p.code || `Plan ${pid ?? idx}`}
                    price={priceLabel}
                    features={[p.description || t('plan.choose_plan')]}
                    cta={t('plan.choose_plan')}
                    highlight={false}
                    onPress={() => authState.isAuthenticated ? router.push('/profile') : router.push('/auth/signin')}
                    t={t}
                  />
                );
              })}
              {(!plans || plans.length === 0) && (
                <Plan 
                  title={t('plan.starter')} 
                  price={t('plan.free')} 
                  features={[t('plan.choose_plan')]} 
                  cta={t('plan.choose_plan')} 
                  highlight={false}
                  onPress={() => authState.isAuthenticated ? router.push('/profile') : router.push('/auth/signin')} 
                  t={t}
                />
              )}
            </>
          )}
        </View>
          );
        })()}
      </View>

      {/* Partners (static) */}
      <Text style={styles.sectionTitle}>{t('home.our_partners')}</Text>
      <Text style={styles.sectionText}>{t('home.partners_description')}</Text>
      <View style={styles.partnersRow}>
        {Array.from({ length: 6 }, (_, i) => (
          <Pressable key={i} onPress={() => {}} style={({ pressed }) => [styles.partnerBox, pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }]}>
            <Text style={styles.partnerText}>Partner {i + 1}</Text>
          </Pressable>
        )        )}
      </View>
    </ScrollView>

    </View>
  );
}

function Plan({ title, price, features, cta, highlight, onPress, t }: { title: string; price: string; features: string[]; cta: string; highlight?: boolean; onPress?: () => void; t: (key: string) => string }) {
  return (
    <View style={[styles.planCard, highlight && styles.planCardHighlight]}>
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
  
  // Loading and error states
  loadingText: { 
    color: '#fff', 
    textAlign: 'center', 
    marginTop: 50, 
    fontSize: 16 
  },
  errorText: { 
    color: '#e50914', 
    textAlign: 'center', 
    marginTop: 50, 
    fontSize: 16 
  },
  emptyText: { 
    color: '#8e8e93', 
    textAlign: 'center', 
    marginTop: 50, 
    fontSize: 16 
  },
  
  // Simple filter modal
  simpleFilterContainer: {
    padding: 20,
    alignItems: 'center',
  },
  simpleFilterText: {
    color: '#8e8e93',
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Modal styles
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: '#2b2b31',
    borderWidth: 1,
    borderColor: '#444',
  },
  modalBtnPrimary: {
    backgroundColor: '#e50914',
  },
  modalBtnSecondaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalBtnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },

  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16, marginHorizontal: 16, marginBottom: 15 },
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
    textAlign: 'center',
    fontFamily: 'SpaceMono-Regular'
  },
  planPriceHighlight: { 
    color: '#ffd166',
    fontSize: 20,
    fontFamily: 'SpaceMono-Regular'
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
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  
  // Filter type buttons
  filterTypeRow: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#1c1c23', borderRadius: 8, padding: 4 },
  filterTypeBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  filterTypeBtnActive: { backgroundColor: '#e50914' },
  filterTypeText: { color: '#c7c7cc', fontSize: 14, fontWeight: '600' },
  filterTypeTextActive: { color: '#fff', fontWeight: '700' },
  
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
  
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
  modalResetBtn: { backgroundColor: '#1c1c23', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', flex: 1 },
  modalResetText: { color: '#8e8e93', fontWeight: '700' },
  modalCloseBtn: { backgroundColor: '#e50914', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', flex: 1 },
  modalCloseText: { color: '#fff', fontWeight: '700' },

});


