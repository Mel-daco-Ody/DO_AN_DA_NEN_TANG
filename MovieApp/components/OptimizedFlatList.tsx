// Optimized FlatList Component with performance optimizations
import React, { useCallback, useMemo } from 'react';
import { FlatList, FlatListProps, Dimensions } from 'react-native';
import { logger } from '../utils/logger';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'getItemLayout'> {
  itemHeight?: number;
  itemWidth?: number;
  enablePerformanceOptimizations?: boolean;
}

export const OptimizedFlatList = <T,>({
  itemHeight,
  itemWidth,
  enablePerformanceOptimizations = true,
  ...props
}: OptimizedFlatListProps<T>) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Optimized getItemLayout for horizontal lists
  const getItemLayout = useCallback((data: T[] | null | undefined, index: number) => {
    if (!enablePerformanceOptimizations || !itemWidth) return undefined;
    
    return {
      length: itemWidth,
      offset: itemWidth * index,
      index,
    };
  }, [itemWidth, enablePerformanceOptimizations]);

  // Optimized keyExtractor
  const keyExtractor = useCallback((item: any, index: number) => {
    if (typeof item === 'object' && item.id) {
      return item.id.toString();
    }
    if (typeof item === 'object' && item.movieID) {
      return item.movieID.toString();
    }
    return index.toString();
  }, []);

  // Performance optimizations
  const performanceProps = useMemo(() => {
    if (!enablePerformanceOptimizations) return {};

    return {
      // Reduce memory usage
      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: 5,
      
      // Improve scroll performance
      windowSize: 10,
      getItemLayout: getItemLayout,
      
      // Reduce overdraw
      disableIntervalMomentum: true,
      disableScrollViewPanResponder: true,
      
      // Memory management
      onEndReachedThreshold: 0.5,
    };
  }, [enablePerformanceOptimizations, getItemLayout]);

  // Error boundary for FlatList
  const handleError = useCallback((error: any) => {
    logger.error('FlatList error', error);
  }, []);

  return (
    <FlatList
      {...props}
      {...performanceProps}
      keyExtractor={props.keyExtractor || keyExtractor}
      onError={handleError}
      // Additional optimizations
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
    />
  );
};




