// Custom Hook for Filter Logic
import { useState, useMemo, useCallback } from 'react';
import { MediaItem, FilterState, Genre, Year, Studio } from '../types/AppTypes';
import { applyFilters, hasActiveFilters, getDefaultFilterState } from '../utils/filterUtils';
import { FILTER_DEFAULTS } from '../constants/AppConstants';

interface UseFilterLogicReturn {
  filterState: FilterState;
  tempFilterState: FilterState;
  setFilterState: (filters: FilterState) => void;
  setTempFilterState: (filters: FilterState) => void;
  updateFilter: (key: keyof FilterState, value: Genre | Year | Studio) => void;
  updateTempFilter: (key: keyof FilterState, value: Genre | Year | Studio) => void;
  resetFilters: () => void;
  resetTempFilters: () => void;
  applyTempFilters: () => void;
  filteredItems: MediaItem[];
  hasActive: boolean;
  hasTempActive: boolean;
}

export const useFilterLogic = (items: MediaItem[]): UseFilterLogicReturn => {
  const [filterState, setFilterState] = useState<FilterState>(getDefaultFilterState());
  const [tempFilterState, setTempFilterState] = useState<FilterState>(getDefaultFilterState());

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    return applyFilters(items, filterState);
  }, [items, filterState]);

  // Check if filters are active
  const hasActive = useMemo(() => hasActiveFilters(filterState), [filterState]);
  const hasTempActive = useMemo(() => hasActiveFilters(tempFilterState), [tempFilterState]);

  // Update filter state
  const updateFilter = useCallback((key: keyof FilterState, value: Genre | Year | Studio) => {
    setFilterState(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Update temporary filter state
  const updateTempFilter = useCallback((key: keyof FilterState, value: Genre | Year | Studio) => {
    setTempFilterState(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilterState(getDefaultFilterState());
  }, []);

  // Reset temporary filters to current filter state
  const resetTempFilters = useCallback(() => {
    setTempFilterState(filterState);
  }, [filterState]);

  // Apply temporary filters to main filter state
  const applyTempFilters = useCallback(() => {
    setFilterState(tempFilterState);
  }, [tempFilterState]);

  // Initialize temp filters when modal opens
  const initializeTempFilters = useCallback(() => {
    setTempFilterState(filterState);
  }, [filterState]);

  return {
    filterState,
    tempFilterState,
    setFilterState,
    setTempFilterState,
    updateFilter,
    updateTempFilter,
    resetFilters,
    resetTempFilters,
    applyTempFilters,
    filteredItems,
    hasActive,
    hasTempActive,
  };
};




