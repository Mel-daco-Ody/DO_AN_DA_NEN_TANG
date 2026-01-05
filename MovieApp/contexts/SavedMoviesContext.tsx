import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import filmzoneApi from '../services/filmzone-api';
import { usePermissionGuard } from '../hooks/usePermissionGuard';
import { SAVED_MOVIE_MANAGE, SAVED_MOVIE_READ } from '../utils/permissionUi';

interface SavedMoviesContextType {
  savedMovieIds: Set<number>;
  savedMovieIdMap: Map<number, number>; // movieID -> savedMovieID
  isMovieSaved: (movieId: number) => boolean;
  refreshSavedMovies: () => Promise<void>;
  removeSavedMovie: (movieId: number) => Promise<void>;
  addSavedMovie: (movieId: number) => Promise<void>;
  getSavedMovieID: (movieId: number) => number | undefined;
}

const SavedMoviesContext = createContext<SavedMoviesContextType | undefined>(undefined);

export const useSavedMoviesContext = () => {
  const context = useContext(SavedMoviesContext);
  if (!context) {
    throw new Error('useSavedMoviesContext must be used within SavedMoviesProvider');
  }
  return context;
};

interface SavedMoviesProviderProps {
  children: ReactNode;
}

export const SavedMoviesProvider: React.FC<SavedMoviesProviderProps> = ({ children }) => {
  const { authState } = useAuth();
  const { guardAction } = usePermissionGuard();
  const [savedMovieIds, setSavedMovieIds] = useState<Set<number>>(new Set());
  const [savedMovieIdMap, setSavedMovieIdMap] = useState<Map<number, number>>(new Map());

  const refreshSavedMovies = useCallback(async () => {
    if (!authState.user?.userID) {
      setSavedMovieIds(new Set());
      return;
    }

    try {
      console.log('SavedMoviesContext: Refreshing saved movies for user:', authState.user.userID);
      const response = await filmzoneApi.getSavedMoviesByUserID(authState.user.userID);

      if (response.errorCode === 200 && response.data) {
        const ids = new Set<number>(response.data.map((item: any) => item.movieID));
        const idMap = new Map<number, number>();
        response.data.forEach((item: any) => {
          if (item.savedMovieID && item.movieID) {
            idMap.set(item.movieID, item.savedMovieID);
          }
        });
        setSavedMovieIds(ids);
        setSavedMovieIdMap(idMap);
        console.log('SavedMoviesContext: Refreshed saved movies, count:', ids.size);
      }
    } catch (error) {
      console.error('SavedMoviesContext: Error refreshing saved movies:', error);
    }
  }, [authState.user?.userID]);

  const isMovieSaved = useCallback((movieId: number): boolean => {
    return savedMovieIds.has(movieId);
  }, [savedMovieIds]);

  const removeSavedMovie = useCallback(async (movieId: number) => {
    return guardAction(SAVED_MOVIE_MANAGE, async () => {

    try {
      // Get savedMovieID from map
      let savedMovieID = savedMovieIdMap.get(movieId);
      
      // If savedMovieID not found, try to refresh saved movies first
      if (!savedMovieID) {
        console.warn('SavedMoviesContext: savedMovieID not found for movieID:', movieId, 'refreshing saved movies...');
        try {
          await refreshSavedMovies();
          // Try again after refresh
          savedMovieID = savedMovieIdMap.get(movieId);
        } catch (refreshError) {
          console.error('SavedMoviesContext: Error refreshing saved movies:', refreshError);
        }
      }
      
      if (!savedMovieID) {
        console.warn('SavedMoviesContext: savedMovieID still not found after refresh for movieID:', movieId);
        // Still update context optimistically
        setSavedMovieIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(movieId);
          return newSet;
        });
        setSavedMovieIdMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(movieId);
          return newMap;
        });
        return;
      }

      console.log('SavedMoviesContext: Attempting to remove movie:', movieId, 'savedMovieID:', savedMovieID, 'for user:', authState.user?.userID);
      const response = await filmzoneApi.deleteSavedMovie(savedMovieID);
      
      console.log('SavedMoviesContext: Remove API response:', JSON.stringify(response, null, 2));
      
      // Update context if API call was successful OR if movie not found (404)
      // 404 means movie is already not in saved list, so we should update context anyway
      if (response.errorCode === 200 || response.success || response.errorCode === 404) {
        setSavedMovieIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(movieId);
          console.log('SavedMoviesContext: Removed movie from context, remaining:', newSet.size);
          return newSet;
        });
        setSavedMovieIdMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(movieId);
          return newMap;
        });
        
        if (response.errorCode === 404) {
          console.log('SavedMoviesContext: Movie not found on server (already deleted), updated context:', movieId);
        } else {
          console.log('SavedMoviesContext: Successfully removed movie from saved list:', movieId);
        }
      } else {
        // Only throw error for non-404 errors (server errors, network errors, etc.)
        console.error('SavedMoviesContext: API returned error:', response.errorMessage, 'errorCode:', response.errorCode);
        // Don't throw - let optimistic update work
        // Update context optimistically
        setSavedMovieIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(movieId);
          return newSet;
        });
        setSavedMovieIdMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(movieId);
          return newMap;
        });
      }
    } catch (error) {
      console.error('SavedMoviesContext: Error removing saved movie:', error);
      // If it's a network error or other error, still update context optimistically
      // The UI will show the movie as removed, and if it's still on server, it will reappear on next refresh
      setSavedMovieIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
      setSavedMovieIdMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(movieId);
        return newMap;
      });
      // Don't throw error - let optimistic update work
      // The next refresh will sync with server state
    }
    });
  }, [authState.user?.userID, savedMovieIdMap, refreshSavedMovies, guardAction]);

  const addSavedMovie = useCallback(async (movieId: number) => {
    return guardAction(SAVED_MOVIE_MANAGE, async () => {

    try {
      if (!authState.user?.userID) {
        throw new Error('User not authenticated');
      }

      console.log('SavedMoviesContext: Adding movie to saved list:', movieId, 'for user:', authState.user.userID);
      // According to OpenAPI spec, CreateSavedMovie requires both userID and movieID
      const response = await filmzoneApi.createSavedMovie({ 
        userID: authState.user.userID,
        movieID: movieId 
      });
      console.log('SavedMoviesContext: Add API response:', JSON.stringify(response, null, 2));

      const errorCode = (response as any).errorCode;
      const errorMessage = (response as any).errorMessage || '';
      
      // Handle "already saved" case (400) - treat as success and refresh context to sync
      if (errorCode === 400 && errorMessage.toLowerCase().includes('already saved')) {
        console.log('SavedMoviesContext: Movie already saved, refreshing context to sync...');
        await refreshSavedMovies();
        return; // Don't throw, just sync context
      }

      const ok = (response as any).success === true || (errorCode >= 200 && errorCode < 300);
      if (!ok) {
        throw new Error(errorMessage || 'Failed to save movie');
      }

      // Optimistic update
      setSavedMovieIds(prev => new Set([...prev, movieId]));
      
      // If response contains savedMovieID, add it to map
      if ((response as any).data && (response.data as any).savedMovieID) {
        setSavedMovieIdMap(prev => {
          const newMap = new Map(prev);
          newMap.set(movieId, (response.data as any).savedMovieID);
          return newMap;
        });
      }
      
      // Ensure server + context are in sync (important if API doesn't return savedMovieID)
      await refreshSavedMovies();

      console.log('SavedMoviesContext: Added movie successfully:', movieId);
    } catch (error) {
      console.error('SavedMoviesContext: Error adding saved movie:', error);
      throw error;
    }
    });
  }, [authState.user?.userID, refreshSavedMovies, guardAction]);

  const getSavedMovieID = useCallback((movieId: number): number | undefined => {
    return savedMovieIdMap.get(movieId);
  }, [savedMovieIdMap]);

  // Refresh when user changes
  useEffect(() => {
    refreshSavedMovies();
  }, [refreshSavedMovies]);

  return (
    <SavedMoviesContext.Provider
      value={{
        savedMovieIds,
        savedMovieIdMap,
        isMovieSaved,
        refreshSavedMovies,
        removeSavedMovie,
        addSavedMovie,
        getSavedMovieID,
      }}
    >
      {children}
    </SavedMoviesContext.Provider>
  );
};

