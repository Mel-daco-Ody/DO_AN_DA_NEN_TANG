// Filter Utilities - Centralized filter logic
import { MediaItem, FilterState, Genre, Year, Studio } from '../types/AppTypes';
import { FILTER_DEFAULTS } from '../constants/AppConstants';

/**
 * Apply filters to media items
 * @param items - Array of media items to filter
 * @param filters - Filter state object
 * @returns Filtered array of media items
 */
export const applyFilters = (items: MediaItem[], filters: FilterState): MediaItem[] => {
  let filteredItems = [...items];

  // Apply genre filter
  if (filters.selectedGenre !== FILTER_DEFAULTS.GENRE) {
    filteredItems = filterByGenre(filteredItems, filters.selectedGenre);
  }

  // Apply year filter
  if (filters.selectedYear !== FILTER_DEFAULTS.YEAR) {
    filteredItems = filterByYear(filteredItems, filters.selectedYear);
  }

  // Apply studio filter
  if (filters.selectedStudio !== FILTER_DEFAULTS.STUDIO) {
    filteredItems = filterByStudio(filteredItems, filters.selectedStudio);
  }

  return filteredItems;
};

/**
 * Filter items by genre
 * @param items - Array of media items
 * @param genre - Selected genre
 * @returns Filtered array
 */
const filterByGenre = (items: MediaItem[], genre: Genre): MediaItem[] => {
  if (genre === 'Movies') {
    return items.filter(item => item.movieType === 'movie');
  }
  
  if (genre === 'TV Shows') {
    return items.filter(item => item.movieType === 'series');
  }
  
  // Filter by tag names
  return items.filter(item => 
    item.categories?.includes(genre) || 
    item.tags?.some(tag => tag.tagName === genre)
  );
};

/**
 * Filter items by year
 * @param items - Array of media items
 * @param year - Selected year
 * @returns Filtered array
 */
const filterByYear = (items: MediaItem[], year: Year): MediaItem[] => {
  return items.filter(item => item.year?.toString() === year);
};

/**
 * Filter items by studio
 * @param items - Array of media items
 * @param studio - Selected studio
 * @returns Filtered array
 */
const filterByStudio = (items: MediaItem[], studio: Studio): MediaItem[] => {
  return items.filter(item => 
    item.studio === studio || 
    item.region?.regionName === studio
  );
};

/**
 * Check if any filters are active
 * @param filters - Filter state object
 * @returns True if any filter is not default
 */
export const hasActiveFilters = (filters: FilterState): boolean => {
  return (
    filters.selectedGenre !== FILTER_DEFAULTS.GENRE ||
    filters.selectedYear !== FILTER_DEFAULTS.YEAR ||
    filters.selectedStudio !== FILTER_DEFAULTS.STUDIO
  );
};

/**
 * Reset all filters to default values
 * @returns Default filter state
 */
export const getDefaultFilterState = (): FilterState => ({
  selectedGenre: FILTER_DEFAULTS.GENRE,
  selectedYear: FILTER_DEFAULTS.YEAR,
  selectedStudio: FILTER_DEFAULTS.STUDIO,
});

/**
 * Validate year input
 * @param year - Year string to validate
 * @returns True if valid year
 */
export const isValidYear = (year: string): boolean => {
  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 1;
};

