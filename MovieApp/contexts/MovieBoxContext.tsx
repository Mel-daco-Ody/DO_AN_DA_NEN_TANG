import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MovieBoxItem {
  id: string;
  title: string;
  cover: string;
  categories: string[];
  rating: string;
  isSeries?: boolean;
  year?: string;
  studio?: string;
  episodes?: string;
  season?: string;
  addedAt: number; // timestamp
}

interface MovieBoxContextType {
  movieBox: MovieBoxItem[];
  addToMovieBox: (item: Omit<MovieBoxItem, 'addedAt'>) => void;
  removeFromMovieBox: (id: string) => void;
  isInMovieBox: (id: string) => boolean;
  clearMovieBox: () => void;
}

const MovieBoxContext = createContext<MovieBoxContextType | undefined>(undefined);

export const MovieBoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movieBox, setMovieBox] = useState<MovieBoxItem[]>([]);
  const MOVIEBOX_KEY = 'flixgo_moviebox';

  useEffect(() => {
    const loadMovieBox = async () => {
      try {
        const storedMovieBox = await AsyncStorage.getItem(MOVIEBOX_KEY);
        if (storedMovieBox) {
          setMovieBox(JSON.parse(storedMovieBox));
        }
      } catch (error) {
        console.error('Failed to load MovieBox from AsyncStorage', error);
      }
    };
    loadMovieBox();
  }, []);

  const saveMovieBox = useCallback(async (currentMovieBox: MovieBoxItem[]) => {
    try {
      await AsyncStorage.setItem(MOVIEBOX_KEY, JSON.stringify(currentMovieBox));
    } catch (error) {
      console.error('Failed to save MovieBox to AsyncStorage', error);
    }
  }, []);

  const addToMovieBox = useCallback((item: Omit<MovieBoxItem, 'addedAt'>) => {
    setMovieBox(prevMovieBox => {
      // Check if item already exists
      const exists = prevMovieBox.some(movie => movie.id === item.id);
      if (exists) {
        return prevMovieBox; // Don't add if already exists
      }
      
      const newMovieBoxItem: MovieBoxItem = {
        ...item,
        addedAt: Date.now(),
      };
      
      const updatedMovieBox = [newMovieBoxItem, ...prevMovieBox];
      saveMovieBox(updatedMovieBox);
      return updatedMovieBox;
    });
  }, [saveMovieBox]);

  const removeFromMovieBox = useCallback((id: string) => {
    setMovieBox(prevMovieBox => {
      const updatedMovieBox = prevMovieBox.filter(movie => movie.id !== id);
      saveMovieBox(updatedMovieBox);
      return updatedMovieBox;
    });
  }, [saveMovieBox]);

  const isInMovieBox = useCallback((id: string) => {
    return movieBox.some(movie => movie.id === id);
  }, [movieBox]);

  const clearMovieBox = useCallback(() => {
    setMovieBox([]);
    saveMovieBox([]);
  }, [saveMovieBox]);

  return (
    <MovieBoxContext.Provider value={{ 
      movieBox, 
      addToMovieBox, 
      removeFromMovieBox, 
      isInMovieBox, 
      clearMovieBox 
    }}>
      {children}
    </MovieBoxContext.Provider>
  );
};

export const useMovieBox = () => {
  const context = useContext(MovieBoxContext);
  if (context === undefined) {
    throw new Error('useMovieBox must be used within a MovieBoxProvider');
  }
  return context;
};
