// Custom Hook for Saved Movies Management
import { useState, useEffect, useCallback } from 'react';
import { MediaItem } from '../types/AppTypes';
import { logger } from '../utils/logger';

interface UseSavedMoviesReturn {
  savedMovies: Set<number>;
  isSaved: (movieId: number) => boolean;
  toggleSaved: (movie: MediaItem) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useSavedMovies = (userId?: number): UseSavedMoviesReturn => {
  const [savedMovies, setSavedMovies] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved movies
  const loadSavedMovies = useCallback(async () => {
    if (!userId) {
      setSavedMovies(new Set());
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('Loading saved movies', { userId });
      
      const { filmzoneApi } = await import('../services/filmzone-api');
      if (!userId) return;
      const response = await filmzoneApi.getSavedMoviesByUserID(userId);
      
      if (response.errorCode === 200 && response.data) {
        const savedIds = new Set<number>(response.data.map((movie: any) => movie.movieID));
        setSavedMovies(savedIds);
        logger.debug('Saved movies loaded', { count: savedIds.size });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load saved movies';
      setError(errorMessage);
      logger.error('Error loading saved movies', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Check if movie is saved
  const isSaved = useCallback((movieId: number): boolean => {
    return savedMovies.has(movieId);
  }, [savedMovies]);

  // Toggle saved status
  const toggleSaved = useCallback(async (movie: MediaItem): Promise<void> => {
    if (!userId) {
      logger.warn('Cannot toggle saved movie: user not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { filmzoneApi } = await import('../services/filmzone-api');
      
      // Check if movie is already saved
      const isCurrentlySaved = savedMovies.has(movie.movieID);
      
      if (isCurrentlySaved) {
        // Remove from saved movies
        await filmzoneApi.deleteSavedMovie(movie.movieID);
        setSavedMovies(prev => {
          const newSet = new Set(prev);
          newSet.delete(movie.movieID);
          return newSet;
        });
        logger.debug('Movie removed from saved list', { movieId: movie.movieID });
      } else {
        // Add to saved movies
        if (userId) {
          await filmzoneApi.createSavedMovie({ userID: userId, movieID: movie.movieID });
          setSavedMovies(prev => new Set([...prev, movie.movieID]));
          logger.debug('Movie added to saved list', { movieId: movie.movieID });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update saved movies';
      setError(errorMessage);
      logger.error('Error toggling saved movie', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load saved movies on mount and when user changes
  useEffect(() => {
    loadSavedMovies();
  }, [loadSavedMovies]);

  return {
    savedMovies,
    isSaved,
    toggleSaved,
    isLoading,
    error,
  };
};




