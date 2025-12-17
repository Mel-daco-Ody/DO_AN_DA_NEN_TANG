// Data Optimizer for Performance
import { logger } from './logger';

interface DataOptimizationConfig {
  maxItems: number;
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
}

class DataOptimizer {
  private config: DataOptimizationConfig;

  constructor(config: DataOptimizationConfig = {
    maxItems: 50,
    enableLazyLoading: true,
    enableImageOptimization: true,
  }) {
    this.config = config;
  }

  // Optimize image URLs for better performance
  optimizeImageUrl(url: string, width?: number, height?: number, quality: number = 80): string {
    if (!this.config.enableImageOptimization) return url;
    
    try {
      // For placeholder images, return optimized version
      if (url.includes('via.placeholder.com')) {
        const size = width && height ? `${width}x${height}` : '300x400';
        return `https://via.placeholder.com/${size}/1a1a1a/ffffff?text=Loading&font=roboto`;
      }
      
      // For other images, add optimization parameters
      if (url.includes('http')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('w', (width || 300).toString());
        urlObj.searchParams.set('h', (height || 400).toString());
        urlObj.searchParams.set('q', quality.toString());
        urlObj.searchParams.set('f', 'webp'); // Use WebP format
        return urlObj.toString();
      }
      
      return url;
    } catch (error) {
      logger.warn('Failed to optimize image URL', { url, error });
      return url;
    }
  }

  // Optimize movie data for performance
  optimizeMovieData(movies: any[], maxItems?: number): any[] {
    const limit = maxItems || this.config.maxItems;
    
    return movies
      .slice(0, limit)
      .map(movie => ({
        ...movie,
        // Optimize image URLs
        image: this.optimizeImageUrl(movie.image, 300, 400),
        cover: movie.cover ? this.optimizeImageUrl(movie.cover, 300, 400) : undefined,
        // Remove unnecessary fields for list view
        description: movie.description?.substring(0, 100) + '...',
        // Add performance hints
        _optimized: true,
        _loadPriority: movie.popularity > 8 ? 'high' : 'normal',
      }));
  }

  // Create lazy loading chunks
  createLazyChunks<T>(data: T[], chunkSize: number = 10): T[][] {
    if (!this.config.enableLazyLoading) return [data];
    
    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Optimize hero slides for faster loading
  optimizeHeroSlides(slides: any[]): any[] {
    return slides
      .slice(0, 5) // Limit to 5 slides max
      .map(slide => ({
        ...slide,
        bg: this.optimizeImageUrl(slide.bg, 800, 400, 90),
        _priority: 'high',
      }));
  }

  // Memory usage estimation
  estimateMemoryUsage(data: any[]): number {
    try {
      const jsonString = JSON.stringify(data);
      return jsonString.length * 2; // Rough estimate: 2 bytes per character
    } catch (error) {
      logger.warn('Failed to estimate memory usage', error);
      return 0;
    }
  }

  // Clean up unused data
  cleanupData<T>(data: T[], keepFields: string[]): Partial<T>[] {
    return data.map(item => {
      const cleaned: any = {};
      keepFields.forEach(field => {
        if (item && typeof item === 'object' && field in item) {
          cleaned[field] = (item as any)[field];
        }
      });
      return cleaned;
    });
  }
}

// Create singleton instance
export const dataOptimizer = new DataOptimizer();

// Performance monitoring
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static startTiming(key: string): void {
    const startTime = performance.now();
    (global as any)[`perf_${key}`] = startTime;
  }

  static endTiming(key: string): number {
    const startTime = (global as any)[`perf_${key}`];
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    
    // Store measurement
    if (!this.measurements.has(key)) {
      this.measurements.set(key, []);
    }
    this.measurements.get(key)!.push(duration);
    
    // Log performance
    logger.performance(key, duration);
    
    return duration;
  }

  static getAverageTime(key: string): number {
    const measurements = this.measurements.get(key);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }

  static getStats(): Record<string, { average: number; count: number; latest: number }> {
    const stats: Record<string, { average: number; count: number; latest: number }> = {};
    
    for (const [key, measurements] of this.measurements.entries()) {
      stats[key] = {
        average: this.getAverageTime(key),
        count: measurements.length,
        latest: measurements[measurements.length - 1] || 0,
      };
    }
    
    return stats;
  }
}




