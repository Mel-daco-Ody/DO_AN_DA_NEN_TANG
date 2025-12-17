// Optimized Home Data Hook with Caching and Performance Improvements
import { useState, useEffect, useCallback, useMemo } from 'react';
import { HomeData, MediaItem, Tag, Region, Person, HeroSlide } from '../types/AppTypes';
import { logger } from '../utils/logger';
import { apiCache, CACHE_KEYS, CACHE_TTL } from '../utils/apiCache';

// Pick a random subset of slides (default 3) for hero carousel
const pickRandomSlides = (slides: HeroSlide[], count = 3): HeroSlide[] => {
  if (!slides || slides.length === 0) return [];
  if (slides.length <= count) return slides;

  // Fisher–Yates shuffle on a copy to avoid mutating source
  const copy = [...slides];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
};

interface UseOptimizedHomeDataReturn {
  data: HomeData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useOptimizedHomeData = (userId?: number): UseOptimizedHomeDataReturn => {
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data with caching
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('Loading home data', { userId, forceRefresh });
      
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = apiCache.get<HomeData>(CACHE_KEYS.HOME_DATA);
        if (cachedData) {
          // Randomize hero slides each time we load from cache
          const randomizedSlides = pickRandomSlides(cachedData.heroSlides);
          setData({
            ...cachedData,
            heroSlides: randomizedSlides,
          });
          setIsLoading(false);
          logger.debug('Using cached home data');
          return;
        }
      }
      
      const { filmzoneApi } = await import('../services/filmzone-api');
      
      // Load critical data first (hero slides)
      const heroResponse = await filmzoneApi.getNewReleaseMovies();
      const heroSlidesAll: HeroSlide[] =
        heroResponse.errorCode === 200
          ? (heroResponse.data || []).map((m: any) => ({
              id: (m.id || m.movieID || '').toString(),
              title: m.title,
              rating: (m.popularity ?? m.rating ?? '0').toString(),
              text: m.description || m.originalTitle || '',
              bg: m.image || m.cover || m.bg,
              isSeries: m.movieType === 'series' || m.isSeries === true,
            }))
          : [];
      const heroSlides = pickRandomSlides(heroSlidesAll);
      
      // Update UI immediately with hero data
      if (heroSlides.length > 0) {
        setData(prev => ({
          ...prev,
          heroSlides,
          allItems: prev?.allItems || [],
          featuredMovies: prev?.featuredMovies || [],
          trendingMovies: prev?.trendingMovies || [],
          nowWatching: prev?.nowWatching || [],
          tags: prev?.tags || [],
          regions: prev?.regions || [],
          persons: prev?.persons || [],
        }));
      }
      
      // Load other data in parallel (non-blocking)
      const loadOtherData = async () => {
        try {
          const [moviesResponse, featuredResponse, trendingResponse, tagsResponse, regionsResponse, personsResponse] = await Promise.all([
            filmzoneApi.getMoviesMainScreen(),
            filmzoneApi.getFeaturedMovies(),
            filmzoneApi.getTrendingMovies(),
            filmzoneApi.getAllTags(),
            filmzoneApi.getAllRegions(),
            filmzoneApi.getAllPersons()
          ]);
          
          // Process responses
          const allItems: MediaItem[] = moviesResponse.errorCode === 200 ? moviesResponse.data || [] : [];
          const featuredMovies: MediaItem[] = featuredResponse.errorCode === 200 ? featuredResponse.data || [] : [];
          const trendingMovies: MediaItem[] = trendingResponse.errorCode === 200 ? trendingResponse.data || [] : [];
          const tags: Tag[] = tagsResponse.errorCode === 200 ? tagsResponse.data || [] : [];
          const regions: Region[] = regionsResponse.errorCode === 200 ? regionsResponse.data || [] : [];
          const persons: Person[] =
            personsResponse.errorCode === 200
              ? (personsResponse.data || []).map((p: any) => ({
                  personID: p.personID,
                  fullName: p.fullName,
                  avatar: p.avatar || '',
                  role: p.role,
                }))
              : [];
          
          // Load watch progress if user is authenticated
          let nowWatching: MediaItem[] = [];
          if (userId) {
            try {
              const progressResponse = await filmzoneApi.getWatchProgressByUserId(userId);
              if (progressResponse.errorCode === 200 && progressResponse.data) {
                nowWatching = (progressResponse.data || []).map((p: any) => p as MediaItem);
              }
            } catch (progressError) {
              logger.warn('Failed to load watch progress', progressError);
            }
          }
          
          const homeData: HomeData = {
            heroSlides,
            allItems,
            featuredMovies,
            trendingMovies,
            nowWatching,
            tags,
            regions,
            persons,
          };
          
          setData(homeData);
          
          // Cache the complete data
        await apiCache.set(CACHE_KEYS.HOME_DATA, {
          ...homeData,
          // Store full hero slides so we can randomize on next load
          heroSlides: heroSlidesAll.length ? heroSlidesAll : homeData.heroSlides,
        }, CACHE_TTL.MEDIUM);
          
          logger.debug('Home data loaded successfully', { 
            itemsCount: allItems.length,
            featuredCount: featuredMovies.length,
            trendingCount: trendingMovies.length 
          });
          
        } catch (err) {
          logger.error('Error loading additional data', err);
        }
      };
      
      // Start loading other data in background
      loadOtherData();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load home data';
      setError(errorMessage);
      logger.error('Error loading home data', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Refetch data (with cache)
  const refetch = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  // Refresh data (bypass cache)
  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Clean expired cache periodically
  useEffect(() => {
    const interval = setInterval(() => {
      apiCache.cleanExpired();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    refresh,
  };
};
