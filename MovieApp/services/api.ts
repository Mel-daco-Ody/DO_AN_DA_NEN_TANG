// API Service for MovieApp
// This file provides API calls to the .NET backend

import { FilmZoneResponse, LoginResponse } from '../types/api-dto';

interface ApiConfig {
  baseURL: string;
  timeout?: number;
}

class MovieAppApi {
  private config: ApiConfig;
  private token: string | null = null;

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 204 No Content
      if (response.status === 204) {
        return {
          errorCode: 204,
          errorMessage: 'No Content',
          success: true,
        } as any;
      }

      // Check if response has content
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();
      
      // Handle empty response
      if (!text || text.trim().length === 0) {
        if (!response.ok) {
          return {
            errorCode: response.status,
            errorMessage: `HTTP ${response.status}: ${response.statusText}`,
            success: false,
          } as any;
        }
        return {
          errorCode: response.status,
          errorMessage: 'Success',
          success: true,
        } as any;
      }

      // Try to parse JSON
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        if (!response.ok) {
          throw new Error(`Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
        return {
          errorCode: response.status,
          errorMessage: 'Success',
          success: true,
          data: text,
        } as any;
      }
      
      if (!response.ok) {
        return {
          errorCode: response.status,
          errorMessage: data.errorMessage || data.message || `HTTP ${response.status}: ${response.statusText}`,
          success: false,
          data: undefined,
        } as any;
      }

      // If response already has FilmZoneResponse format, return as is
      if (data.errorCode !== undefined) {
        return data as T;
      }

      // Wrap response in FilmZoneResponse format
      return {
        errorCode: response.status,
        errorMessage: 'Success',
        success: true,
        data: data,
      } as any;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async register(userName: string, email: string, password: string, firstName?: string, lastName?: string, gender?: string) {
    const response = await this.request<FilmZoneResponse<any>>('/register', {
      method: 'POST',
      body: JSON.stringify({ 
        userName, 
        email, 
        password, 
        firstName, 
        lastName, 
        gender 
      }),
    });

    return response;
  }

  async login(userName: string, password: string) {
    const response = await this.request<FilmZoneResponse<LoginResponse>>('/login/login/mobile', {
      method: 'POST',
      body: JSON.stringify({ userName, password }),
    });

    if (response.errorCode === 200 && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request<any>('/api/auth/me');
  }

  async updateUser(userId: string, userData: any) {
    return this.request<any>(`/api/auth/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(userId: string, passwordData: any) {
    return this.request<any>(`/api/auth/user/${userId}/change-password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.setToken(null);
    }
  }

  // Movies
  async getMovies() {
    return this.request<any>('/api/movies');
  }

  async getMovie(movieId: string) {
    return this.request<any>(`/api/movies/${movieId}`);
  }

  async getFeaturedMovies() {
    return this.request<any>('/api/movies/featured');
  }

  async getTrendingMovies() {
    return this.request<any>('/api/movies/trending');
  }

  async searchMovies(query: string) {
    return this.request<any>(`/api/movies/search?q=${encodeURIComponent(query)}`);
  }

  async getMoviesByCategory(categoryId: number) {
    return this.request<any>(`/api/movies/category/${categoryId}`);
  }

  // Comments
  async getCommentsByMovie(movieId: string) {
    return this.request<any>(`/api/comments/movie/${movieId}`);
  }

  async addComment(commentData: any) {
    return this.request<any>('/api/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async updateComment(commentId: number, commentData: any) {
    return this.request<any>(`/api/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(commentData),
    });
  }

  async deleteComment(commentId: number) {
    return this.request<any>(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // Reviews
  async getReviewsByMovie(movieId: string) {
    return this.request<any>(`/api/reviews/movie/${movieId}`);
  }

  async addReview(reviewData: any) {
    return this.request<any>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(reviewId: number, reviewData: any) {
    return this.request<any>(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId: number) {
    return this.request<any>(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Favorites (would need to be implemented in .NET API)
  async getFavorites(userId: string) {
    return this.request<any>(`/api/users/${userId}/favorites`);
  }

  async addToFavorites(userId: string, movieId: string) {
    return this.request<any>(`/api/users/${userId}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ movieId }),
    });
  }

  async removeFromFavorites(userId: string, movieId: string) {
    return this.request<any>(`/api/users/${userId}/favorites/${movieId}`, {
      method: 'DELETE',
    });
  }

  // Metadata APIs
  async getAllTags() {
    return this.request<FilmZoneResponse<any[]>>('/api/tag/getAll');
  }

  async getAllRegions() {
    return this.request<FilmZoneResponse<any[]>>('/api/region/getAll');
  }

  async getAllPersons() {
    return this.request<FilmZoneResponse<any[]>>('/api/person/getAll');
  }

  // Movie APIs
  async getNewReleaseMovies() {
    return this.request<FilmZoneResponse<any[]>>('/api/movie/newReleaseMainScreen');
  }

  async getMoviesMainScreen() {
    return this.request<FilmZoneResponse<any[]>>('/api/movie/mainScreen');
  }

  async getMovieById(movieId: number) {
    return this.request<FilmZoneResponse<any>>(`/api/movie/getMovieById?id=${movieId}`);
  }

  // Episode APIs
  async getEpisodesByMovie(movieId: number) {
    return this.request<FilmZoneResponse<any[]>>(`/api/episode/getEpisodesByMovie?movieId=${movieId}`);
  }

  // Watch Progress APIs
  async getWatchProgress() {
    return this.request<FilmZoneResponse<any[]>>('/movie/watchprogress');
  }

  async getEpisodeWatchProgress() {
    return this.request<FilmZoneResponse<any[]>>('/movie/episodewatchprogress');
  }

  // Saved Movies APIs
  async getSavedMovies() {
    return this.request<FilmZoneResponse<any[]>>('/api/savedmovie');
  }

  async addToSavedMovies(movieId: number) {
    return this.request<FilmZoneResponse<any>>('/api/savedmovie', {
      method: 'POST',
      body: JSON.stringify({ movieID: movieId }),
    });
  }

  async removeFromSavedMovies(movieId: number) {
    return this.request<FilmZoneResponse<any>>(`/api/savedmovie?movieId=${movieId}`, {
      method: 'DELETE',
    });
  }

  // User Rating APIs
  async getUserRating(movieId: number) {
    return this.request<FilmZoneResponse<any>>(`/api/userrating?movieId=${movieId}`);
  }

  // Account Management APIs
  async startPasswordChangeByEmail(email: string) {
    return this.request<FilmZoneResponse<any>>('/account/password/change/email/start', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmailCode(email: string, code: string) {
    return this.request<FilmZoneResponse<any>>('/account/password/change/email/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async commitPasswordChange(ticket: string, oldPassword: string, newPassword: string) {
    return this.request<FilmZoneResponse<any>>('/account/password/change/commit', {
      method: 'POST',
      body: JSON.stringify({ ticket, oldPassword, newPassword }),
    });
  }

  // Payment APIs
  async createVnPayCheckout(priceId: number) {
    return this.request<FilmZoneResponse<any>>('/api/payment/vnpay/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    });
  }

  // Watch History (would need to be implemented in .NET API)
  async getWatchHistory(userId: string) {
    return this.request<any>(`/api/users/${userId}/history`);
  }

  async addToWatchHistory(userId: string, historyData: any) {
    return this.request<any>(`/api/users/${userId}/history`, {
      method: 'POST',
      body: JSON.stringify(historyData),
    });
  }

  async updateWatchProgress(userId: string, historyId: number, progress: number) {
    return this.request<any>(`/api/users/${userId}/history/${historyId}`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }
}

// Create API instance
export const movieAppApi = new MovieAppApi({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://filmzone-api.koyeb.app',
});

export default movieAppApi;

