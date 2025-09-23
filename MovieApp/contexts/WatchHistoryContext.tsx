import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WatchHistoryItem {
  seriesId: string;
  seriesTitle: string;
  season: number;
  episode: number;
  episodeTitle: string;
  episodeDescription: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  watchedAt: number; // timestamp
  progress: number; // 0-1, progress of the episode
}

interface WatchHistoryContextType {
  watchHistory: WatchHistoryItem[];
  addToHistory: (item: Omit<WatchHistoryItem, 'watchedAt' | 'progress'>) => void;
  updateProgress: (seriesId: string, season: number, episode: number, progress: number) => void;
  getLatestWatched: (seriesId: string) => WatchHistoryItem | null;
  getLatestEpisode: () => WatchHistoryItem | null;
  clearHistory: () => void;
}

const WatchHistoryContext = createContext<WatchHistoryContextType | undefined>(undefined);

export const WatchHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);

  // Load watch history from AsyncStorage on mount
  useEffect(() => {
    loadWatchHistory();
  }, []);

  // Save watch history to AsyncStorage whenever it changes
  useEffect(() => {
    saveWatchHistory();
  }, [watchHistory]);

  const loadWatchHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('watchHistory');
      if (stored) {
        setWatchHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading watch history:', error);
    }
  };

  const saveWatchHistory = async () => {
    try {
      await AsyncStorage.setItem('watchHistory', JSON.stringify(watchHistory));
    } catch (error) {
      console.log('Error saving watch history:', error);
    }
  };

  const addToHistory = (item: Omit<WatchHistoryItem, 'watchedAt' | 'progress'>) => {
    const newItem: WatchHistoryItem = {
      ...item,
      watchedAt: Date.now(),
      progress: 0,
    };

    setWatchHistory(prev => {
      // Remove existing entry for the same series/season/episode
      const filtered = prev.filter(
        existing => !(
          existing.seriesId === item.seriesId &&
          existing.season === item.season &&
          existing.episode === item.episode
        )
      );
      
      // Add new item at the beginning
      return [newItem, ...filtered];
    });
  };

  const updateProgress = (seriesId: string, season: number, episode: number, progress: number) => {
    setWatchHistory(prev => 
      prev.map(item => 
        item.seriesId === seriesId && 
        item.season === season && 
        item.episode === episode
          ? { ...item, progress, watchedAt: Date.now() }
          : item
      )
    );
  };

  const getLatestWatched = (seriesId: string): WatchHistoryItem | null => {
    return watchHistory.find(item => item.seriesId === seriesId) || null;
  };

  const getLatestEpisode = (): WatchHistoryItem | null => {
    return watchHistory.length > 0 ? watchHistory[0] : null;
  };

  const clearHistory = () => {
    setWatchHistory([]);
  };

  return (
    <WatchHistoryContext.Provider value={{
      watchHistory,
      addToHistory,
      updateProgress,
      getLatestWatched,
      getLatestEpisode,
      clearHistory,
    }}>
      {children}
    </WatchHistoryContext.Provider>
  );
};

export const useWatchHistory = () => {
  const context = useContext(WatchHistoryContext);
  if (context === undefined) {
    throw new Error('useWatchHistory must be used within a WatchHistoryProvider');
  }
  return context;
};
