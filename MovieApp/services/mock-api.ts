// Mock API Service for MovieApp
// This file provides mock API calls using sample data instead of real backend calls

// Mock API Service for MovieApp
// This file provides mock API calls using sample data instead of real backend calls
// Designed to match FilmZone backend API exactly

import { 
  sampleUsers, 
  sampleMovies, 
  sampleSeries, 
  sampleEpisodes, 
  sampleAdvertisements,
  samplePersons,
  getMovieById,
  getEpisodesByMovieId,
  getActiveAdvertisements,
  getAdminUser
} from '../shared-data';

interface ApiConfig {
  baseURL: string;
  timeout?: number;
}

// FilmZone Backend Response Format - 100% Compatible with ASP.NET Core
interface FilmZoneResponse<T> {
  errorCode: number;
  errorMessage?: string;
  data?: T;
  success: boolean;
  timestamp: string;
  requestId: string;
  version: string;
  serverTime: string;
}

// Login Response matching FilmZone backend
interface LoginResponse {
  token: string;
  refreshToken: string;
  sessionId: number;
  deviceId: string;
  tokenExpiration: string;
  refreshTokenExpiration: string;
  user: {
    userID: number;
    userName: string;
    firstName?: string;
    lastName?: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar?: string;
    profilePicture?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    language?: string;
    timezone?: string;
    preferences?: any;
    subscription?: {
      plan: string;
      status: string;
      startDate?: string;
      endDate?: string;
    };
    createdAt?: string;
    updatedAt?: string;
    lastLoginAt?: string;
    isEmailVerified: boolean;
    isPhoneVerified?: boolean;
    twoFactorEnabled?: boolean;
  };
}

class MockMovieAppApi {
  private config: ApiConfig;
  private token: string | null = null;
  private currentUser: any = null;
  private watchProgress: any[] = []; // Store watch progress in memory
  private savedMovies: any[] = []; // Store saved movies in memory
  private billingHistory: any[] = []; // Store billing history in memory
  private comments: any[] = []; // Store comments in memory
  private reviews: any[] = []; // Store reviews in memory

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  setToken(token: string | null) {
    this.token = token;
  }

  // Simulate network delay
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // FilmZone Backend Helper Methods - 100% Compatible
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // FilmZone Error Codes - 100% Compatible with Backend
  private readonly ERROR_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    RATE_LIMITED: 429,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  };

  // FilmZone Error Messages - 100% Compatible with Backend
  private readonly ERROR_MESSAGES = {
    SUCCESS: 'Success',
    CREATED: 'Resource created successfully',
    NO_CONTENT: 'No content',
    BAD_REQUEST: 'Bad request',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    CONFLICT: 'Resource conflict',
    VALIDATION_ERROR: 'Validation failed',
    RATE_LIMITED: 'Rate limit exceeded',
    INTERNAL_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service unavailable',
    INVALID_CREDENTIALS: 'Invalid username or password',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User already exists',
    INVALID_TOKEN: 'Invalid or expired token',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    MOVIE_NOT_FOUND: 'Movie not found',
    ACTOR_NOT_FOUND: 'Actor not found',
    SUBSCRIPTION_REQUIRED: 'Subscription required',
    PAYMENT_FAILED: 'Payment processing failed'
  };

  // Generate FilmZone-compatible response format
  private createResponse<T>(data: T, errorCode: number = 200, errorMessage: string = 'Success'): FilmZoneResponse<T> {
    return {
      errorCode,
      errorMessage,
      data,
      success: errorCode >= 200 && errorCode < 300,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      version: '1.0.0',
      serverTime: new Date().toISOString()
    };
  }

  private generateJWTToken(user: any): string {
    // Simulate FilmZone JWT token format
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      userID: user.userID,
      userName: user.userName,
      email: user.email,
      role: user.role || 'User',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa(`mock_signature_${user.userID}_${Date.now()}`);
    return `${header}.${payload}.${signature}`;
  }

  private generateRefreshToken(user: any): string {
    return `refresh_${user.userID}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Authentication
  async register(userName: string, email: string, password: string, firstName?: string, lastName?: string, gender?: string) {
    await this.delay();
    
    // FilmZone Backend Validation - 100% Compatible
    if (!userName || !email || !password) {
      return this.createResponse(null, this.ERROR_CODES.BAD_REQUEST, this.ERROR_MESSAGES.VALIDATION_ERROR);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return this.createResponse(null, this.ERROR_CODES.VALIDATION_ERROR, 'Invalid email format');
    }

    // Password validation (FilmZone standards)
    if (password.length < 8) {
      return this.createResponse(null, this.ERROR_CODES.VALIDATION_ERROR, 'Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = sampleUsers.find((user: any) => user.userName === userName || user.email === email);
    if (existingUser) {
      return this.createResponse(null, this.ERROR_CODES.CONFLICT, this.ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    // Create new user
    const newUser = {
      userID: sampleUsers.length + 1,
      userName,
      firstName: firstName || '',
      lastName: lastName || '',
      name: `${firstName || ''} ${lastName || ''}`.trim(),
      email,
      password,
      role: 'User' as const,
      status: 'Active' as const,
      avatar: '',
      profilePicture: '',
      phone: '',
      dateOfBirth: '',
      gender: gender || '',
      address: '',
      bio: '',
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      lastLogin: undefined,
      lastActiveAt: new Date().toISOString(),
      isOnline: true,
      timeZone: 'Asia/Ho_Chi_Minh'
    };

    sampleUsers.push(newUser);

    return this.createResponse(newUser, this.ERROR_CODES.CREATED, "Registration successful");
  }

  async login(userName: string, password: string) {
    await this.delay();
    
    // Find user
    const user = sampleUsers.find((u: any) => u.userName === userName && u.password === password);
    if (!user) {
      return this.createResponse(null, this.ERROR_CODES.UNAUTHORIZED, this.ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate FilmZone-compatible tokens
    const token = this.generateJWTToken(user);
    const refreshToken = this.generateRefreshToken(user);
    const sessionId = Math.floor(Math.random() * 1000000);
    const deviceId = this.generateDeviceId();
    const now = new Date();
    const tokenExpiration = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    const refreshTokenExpiration = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    
    this.setToken(token);
    this.currentUser = user;

    const loginData: LoginResponse = {
      token,
      refreshToken,
      sessionId,
      deviceId,
      tokenExpiration,
      refreshTokenExpiration,
      user: {
        userID: user.userID,
        userName: user.userName,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        name: user.name || user.userName,
        email: user.email,
        role: user.role || 'User',
        status: user.status || 'Active',
        avatar: user.avatar,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        postalCode: user.postalCode || '',
        language: user.language || 'vi',
        timezone: user.timezone || 'Asia/Ho_Chi_Minh',
        subscription: user.subscription,
        preferences: user.preferences || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: new Date().toISOString(),
        isEmailVerified: user.isEmailVerified || false,
        isPhoneVerified: user.isPhoneVerified || false,
        twoFactorEnabled: user.twoFactorEnabled || false
      }
    };

    return this.createResponse(loginData, this.ERROR_CODES.SUCCESS, this.ERROR_MESSAGES.SUCCESS);
  }

  async getCurrentUser(): Promise<FilmZoneResponse<any>> {
    await this.delay();
    
    if (!this.currentUser) {
      return this.createResponse(null, this.ERROR_CODES.UNAUTHORIZED, this.ERROR_MESSAGES.INVALID_TOKEN);
    }

    return this.createResponse(this.currentUser, this.ERROR_CODES.SUCCESS, this.ERROR_MESSAGES.SUCCESS);
  }

  async updateUser(userUpdates: Partial<any>): Promise<FilmZoneResponse<any>> {
    await this.delay();
    
    if (!this.currentUser) {
      return this.createResponse(null, this.ERROR_CODES.UNAUTHORIZED, this.ERROR_MESSAGES.INVALID_TOKEN);
    }

    // Update current user with new data
    this.currentUser = { ...this.currentUser, ...userUpdates };
    
    return this.createResponse(this.currentUser, this.ERROR_CODES.SUCCESS, 'User updated successfully');
  }

  async changePassword(userId: string, passwordData: any) {
    await this.delay();
    return { success: true };
  }

  async logout() {
    await this.delay();
    this.setToken(null);
    this.currentUser = null;
    return { success: true };
  }

  // Movies
  async getMovies() {
    await this.delay();
    return [...sampleMovies, ...sampleSeries];
  }

  async getMovie(movieId: string) {
    await this.delay();
    const movie = getMovieById(parseInt(movieId));
    return movie || null;
  }

  async getFeaturedMovies() {
    await this.delay();
    // Return first 3 movies as featured
    const featuredMovies = sampleMovies.slice(0, 3);
    return this.createResponse(featuredMovies, this.ERROR_CODES.SUCCESS, "Featured movies retrieved successfully");
  }

  async getTrendingMovies() {
    await this.delay();
    // Return movies sorted by popularity
    const trendingMovies = [...sampleMovies, ...sampleSeries]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 5);
    return this.createResponse(trendingMovies, this.ERROR_CODES.SUCCESS, "Trending movies retrieved successfully");
  }

  async searchMovies(query: string) {
    await this.delay();
    const allMovies = [...sampleMovies, ...sampleSeries];
    const filteredMovies = allMovies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.description?.toLowerCase().includes(query.toLowerCase()) ||
      movie.tags?.some(tag => tag.tagName.toLowerCase().includes(query.toLowerCase()))
    );
    
    // Convert to search format expected by Header component
    const searchResults = filteredMovies.map(movie => ({
      id: movie.movieID.toString(),
      title: movie.title,
      cover: movie.image,
      categories: movie.tags?.map(tag => tag.tagName) || ['Action'],
      rating: movie.popularity?.toString() || '8.0',
      isSeries: movie.movieType === 'series',
      year: movie.year?.toString() || '2022',
      studio: movie.region?.regionName || 'Netflix'
    }));
    
    return this.createResponse(searchResults, 200, "Success");
  }

  async getMoviesByCategory(categoryId: number) {
    await this.delay();
    const movies = [...sampleMovies, ...sampleSeries];
    return this.createResponse(movies, this.ERROR_CODES.SUCCESS, "Movies by category retrieved successfully");
  }

  // Comments APIs (matching FilmZone backend)
  async getCommentsByMovie(movieId: string) {
    await this.delay();
    
    // Get comments for this movie from the comments array
    const movieComments = this.comments.filter(comment => comment.movieID === parseInt(movieId));
    
    // Format comments to include user information
    const formattedComments = movieComments.map(comment => {
      const user = sampleUsers.find((u: any) => u.userID === comment.userID);
      return {
        commentID: comment.commentID,
        movieID: comment.movieID,
        userID: comment.userID,
        userName: user?.userName || 'User',
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likeCount: comment.likeCount || 0,
        parentID: comment.parentID
      };
    });
    
    return this.createResponse(formattedComments, 200, "Comments retrieved successfully");
  }

  async addComment(commentData: any) {
    await this.delay();
    
    const newComment = {
      commentID: Date.now(),
      movieID: commentData.movieID,
      userID: this.currentUser?.userID || commentData.userID,
      parentID: commentData.parentID || null,
      content: commentData.content,
      isEdited: false,
      likeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add comment to the comments array
    this.comments.push(newComment);
    
    console.log('💬 Comment added:', newComment);
    console.log('💬 Total comments:', this.comments.length);
    
    return {
      errorCode: 200,
      errorMessage: 'Comment added',
      data: newComment,
      success: true
    };
  }

  async updateComment(commentId: number, commentData: any) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Comment updated',
      data: {
        commentID: commentId,
        movieID: commentData.movieID,
        userID: this.currentUser?.userID || 1,
        parentID: commentData.parentID || null,
        content: commentData.content,
        isEdited: true,
        likeCount: commentData.likeCount || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      success: true
    };
  }

  async deleteComment(commentId: number) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Comment deleted',
      data: { commentID: commentId },
      success: true
    };
  }

  // Reviews APIs (matching FilmZone backend)
  async getReviewsByMovie(movieId: string) {
    await this.delay();
    return this.createResponse([], 200, "Success");
  }

  async addReview(reviewData: any) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Review added',
      data: {
        reviewID: Date.now(),
        movieID: reviewData.movieID,
        userID: this.currentUser?.userID || 1,
        title: reviewData.title,
        content: reviewData.content,
        rating: reviewData.rating,
        isEdited: false,
        likeCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      success: true
    };
  }

  async updateReview(reviewId: number, reviewData: any) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Review updated',
      data: {
        reviewID: reviewId,
        movieID: reviewData.movieID,
        userID: this.currentUser?.userID || 1,
        title: reviewData.title,
        content: reviewData.content,
        rating: reviewData.rating,
        isEdited: true,
        likeCount: reviewData.likeCount || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      success: true
    };
  }

  async deleteReview(reviewId: number) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Review deleted',
      data: { reviewID: reviewId },
      success: true
    };
  }

  // Favorites APIs (matching FilmZone backend)
  async getFavorites(userId: string) {
    await this.delay();
    return this.createResponse([], 200, "Success");
  }

  async addToFavorites(userId: string, movieId: string) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Added to favorites',
      data: {
        favoriteID: Date.now(),
        userID: parseInt(userId),
        movieID: parseInt(movieId),
        createdAt: new Date().toISOString()
      },
      success: true
    };
  }

  async removeFromFavorites(userId: string, movieId: string) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Removed from favorites',
      data: { userID: parseInt(userId), movieID: parseInt(movieId) },
      success: true
    };
  }

  // Metadata APIs
  async getAllTags() {
    await this.delay();
    const tags = [
      { tagID: 1, tagName: 'Action', tagDescription: 'Action movies' },
      { tagID: 2, tagName: 'Sci-Fi', tagDescription: 'Science Fiction' },
      { tagID: 3, tagName: 'Adventure', tagDescription: 'Adventure movies' },
      { tagID: 4, tagName: 'Drama', tagDescription: 'Drama movies' },
      { tagID: 5, tagName: 'Superhero', tagDescription: 'Superhero movies' },
      { tagID: 6, tagName: 'Crime', tagDescription: 'Crime movies' },
      { tagID: 7, tagName: 'Horror', tagDescription: 'Horror movies' },
      { tagID: 8, tagName: 'Mystery', tagDescription: 'Mystery movies' },
      { tagID: 9, tagName: 'Fantasy', tagDescription: 'Fantasy movies' },
      { tagID: 10, tagName: 'Comedy', tagDescription: 'Comedy movies' }
    ];
    
    return this.createResponse(tags, 200, "Success");
  }

  async getAllRegions() {
    await this.delay();
    const regions = [
      { regionID: 1, regionName: 'Vietnam' },
      { regionID: 2, regionName: 'USA' },
      { regionID: 3, regionName: 'UK' },
      { regionID: 4, regionName: 'Japan' },
      { regionID: 5, regionName: 'Korea' }
    ];
    
    return this.createResponse(regions, 200, "Success");
  }

  async getAllPersons() {
    await this.delay();
    const persons = [
      { personID: 1, fullName: 'Sam Worthington', avatar: 'https://via.placeholder.com/100' },
      { personID: 2, fullName: 'Zoe Saldana', avatar: 'https://via.placeholder.com/100' },
      { personID: 3, fullName: 'Tom Cruise', avatar: 'https://via.placeholder.com/100' },
      { personID: 4, fullName: 'Miles Teller', avatar: 'https://via.placeholder.com/100' },
      { personID: 5, fullName: 'Tom Holland', avatar: 'https://via.placeholder.com/100' }
    ];
    
    return this.createResponse(persons, 200, "Success");
  }

  // Movie APIs
  async getNewReleaseMovies() {
    await this.delay();
    // Return movies with mock hero slide data
    const heroSlides = sampleMovies.slice(0, 3).map((movie: any, index: number) => ({
      id: movie.movieID.toString(),
      title: movie.title,
      rating: movie.popularity?.toString() || '8.0',
      text: movie.description || 'A great movie to watch',
      bg: movie.image,
      isSeries: movie.movieType === 'series'
    }));
    
    return this.createResponse(heroSlides, 200, "Success");
  }

  async getMoviesMainScreen(): Promise<FilmZoneResponse<any>> {
    await this.delay();
    
    // FilmZone Backend Business Logic - 100% Compatible
    // Movies are public content, no authentication required
    // Check subscription status for premium content (if user is logged in)
    const hasActiveSubscription = this.currentUser?.subscription?.status === 'active';
    
    // Return all movies and series with FilmZone backend format
    const allItems = [...sampleMovies, ...sampleSeries].map((movie: any) => ({
      movieID: movie.movieID,
      slug: movie.slug,
      title: movie.title,
      originalTitle: movie.originalTitle,
      description: movie.description,
      movieType: movie.movieType,
      image: movie.image,
      status: movie.status,
      releaseDate: movie.releaseDate,
      durationSeconds: movie.durationSeconds,
      totalSeasons: movie.totalSeasons,
      totalEpisodes: movie.totalEpisodes,
      year: movie.year,
      rated: movie.rated,
      popularity: movie.popularity,
      regionID: movie.regionID,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      region: movie.region,
      tags: movie.tags,
      cast: movie.cast,
      sources: movie.sources,
      // Legacy compatibility fields
      id: movie.movieID.toString(),
      cover: { uri: movie.image },
      categories: movie.tags?.map((tag: any) => tag.tagName) || ['Action'],
      rating: movie.popularity?.toString() || '8.0',
      isSeries: movie.movieType === 'series',
      episodes: movie.movieType === 'series' ? '1|2|3|4|5' : undefined,
      season: movie.movieType === 'series' ? 'Season 1' : undefined,
      studio: movie.region?.regionName || 'Netflix'
    }));
    
    return this.createResponse(allItems, this.ERROR_CODES.SUCCESS, "Movies retrieved successfully");
  }

  async getMovieById(movieId: number): Promise<FilmZoneResponse<any>> {
    await this.delay();
    
    // FilmZone Backend Business Logic - 100% Compatible
    // Movie details are public content, no authentication required
    const movie = getMovieById(movieId);
    
    if (!movie) {
      return this.createResponse(null, this.ERROR_CODES.NOT_FOUND, this.ERROR_MESSAGES.MOVIE_NOT_FOUND);
    }

    // Check subscription for premium content (if user is logged in)
    const hasActiveSubscription = this.currentUser?.subscription?.status === 'active';
    if (movie.rated === 'R' && this.currentUser && !hasActiveSubscription) {
      return this.createResponse(null, this.ERROR_CODES.FORBIDDEN, this.ERROR_MESSAGES.SUBSCRIPTION_REQUIRED);
    }
    
    return this.createResponse(movie, this.ERROR_CODES.SUCCESS, "Movie retrieved successfully");
  }

  // Episode APIs
  async getEpisodesByMovie(movieId: number) {
    await this.delay();
    const movie = getMovieById(movieId);
    const episodes = getEpisodesByMovieId(movieId);
    
    if (!movie || movie.movieType !== 'series') {
      return {
        errorCode: 404,
        errorMessage: 'Series not found',
        success: false
      };
    }
    
    // Create seasons based on totalSeasons from movie data
    const totalSeasons = movie.totalSeasons || 1;
    const seasonsMap = new Map();
    
    // Initialize all seasons
    for (let seasonNum = 1; seasonNum <= totalSeasons; seasonNum++) {
      seasonsMap.set(seasonNum, {
        id: seasonNum,
        name: `Season ${seasonNum}`,
        episodes: []
      });
    }
    
    // Add existing episodes to their respective seasons
    episodes.forEach(episode => {
      const seasonNumber = episode.seasonNumber;
      if (seasonsMap.has(seasonNumber)) {
        seasonsMap.get(seasonNumber).episodes.push({
          id: episode.episodeID,
          title: episode.title,
          description: episode.description || episode.synopsis,
          duration: episode.durationSeconds ? `${Math.floor(episode.durationSeconds / 60)} phút` : '60 phút',
          thumbnail: episode.sources?.[0]?.sourceUrl || 'https://via.placeholder.com/300x200',
          videoUrl: episode.sources?.[0]?.sourceUrl || 'https://example.com/video.mp4',
          episodeNumber: episode.episodeNumber,
          seasonNumber: episode.seasonNumber
        });
      }
    });
    
    // Generate mock episodes for seasons that don't have episodes in data
    seasonsMap.forEach((season, seasonNumber) => {
      if (season.episodes.length === 0) {
        // Generate mock episodes for this season
        const episodesPerSeason = Math.floor((movie.totalEpisodes || 10) / totalSeasons);
        for (let epNum = 1; epNum <= episodesPerSeason; epNum++) {
          season.episodes.push({
            id: `${movieId}-${seasonNumber}-${epNum}`,
            title: `Episode ${epNum}`,
            description: `Episode ${epNum} of ${movie.title} Season ${seasonNumber}`,
            duration: '60 phút',
            thumbnail: 'https://via.placeholder.com/300x200',
            videoUrl: `https://example.com/${movie.slug}-s${seasonNumber}e${epNum}`,
            episodeNumber: epNum,
            seasonNumber: seasonNumber
          });
        }
      }
    });
    
    const seasons = Array.from(seasonsMap.values());
    
    return {
      errorCode: 200,
      errorMessage: 'Success',
      data: {
        seasons: seasons,
        totalSeasons: totalSeasons,
        totalEpisodes: movie.totalEpisodes || episodes.length
      },
      success: true
    };
  }

  // Watch Progress APIs
  async getWatchProgress() {
    await this.delay();
    // Return movies from watch progress
    const nowWatching = this.watchProgress.map((progress: any) => {
      const movie = getMovieById(progress.movieID);
      if (!movie) return null;
      
      return {
        ...movie,
        id: movie.movieID.toString(),
        cover: { uri: movie.image },
        categories: movie.tags?.map((tag: any) => tag.tagName) || ['Action'],
        rating: movie.popularity?.toString() || '8.0',
        isSeries: movie.movieType === 'series',
        episodes: movie.movieType === 'series' ? '1|2|3|4|5' : undefined,
        season: movie.movieType === 'series' ? 'Season 1' : undefined,
        studio: movie.region?.regionName || 'Netflix',
        watchProgress: progress
      };
    }).filter(Boolean);
    
    return this.createResponse(nowWatching, 200, "Success");
  }

  // Add movie to watch progress
  async addToWatchProgress(movieId: number) {
    await this.delay();
    
    // Check if already exists
    const existing = this.watchProgress.find((progress: any) => progress.movieID === movieId);
    if (existing) {
      return this.createResponse(existing, 200, "Already in watch progress");
    }
    
    // Add new watch progress
    const newProgress = {
      watchProgressID: this.watchProgress.length + 1,
      movieID: movieId,
      userID: this.currentUser?.userID || 1,
      positionSeconds: 0,
      durationSeconds: null,
      lastWatchedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.watchProgress.push(newProgress);
    
    return this.createResponse(newProgress, 200, "Added to watch progress");
  }

  // Update watch progress
  async updateWatchProgress(movieId: number, positionSeconds: number, durationSeconds?: number) {
    await this.delay();
    
    const progress = this.watchProgress.find((p: any) => p.movieID === movieId);
    if (progress) {
      progress.positionSeconds = positionSeconds;
      progress.durationSeconds = durationSeconds;
      progress.lastWatchedAt = new Date().toISOString();
      progress.updatedAt = new Date().toISOString();
      
      return this.createResponse(progress, 200, "Watch progress updated");
    }
    
    return {
      errorCode: 404,
      errorMessage: 'Watch progress not found',
      success: false
    };
  }

  // Episode Watch Progress APIs (matching FilmZone backend)
  async getEpisodeWatchProgress() {
    await this.delay();
    return this.createResponse([], 200, "Success");
  }

  async addEpisodeWatchProgress(episodeId: number, positionSeconds: number, durationSeconds?: number) {
    await this.delay();
    
    const newProgress = {
      episodeWatchProgressID: Date.now(),
      userID: this.currentUser?.userID || 1,
      episodeID: episodeId,
      positionSeconds,
      durationSeconds,
      lastWatchedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return this.createResponse(newProgress, 200, "Episode watch progress added");
  }

  // Saved Movies APIs
  async getSavedMovies(): Promise<FilmZoneResponse<any>> {
    await this.delay();
    
    // Get saved movies with full movie details
    const savedMoviesWithDetails = this.savedMovies.map(savedMovie => {
      const movie = getMovieById(savedMovie.movieID);
      if (!movie) return null;
      
      return {
        id: savedMovie.movieID.toString(),
        movieID: savedMovie.movieID,
        title: movie.title,
        cover: movie.image,
        categories: movie.tags?.map((tag: any) => tag.tagName) || [],
        rating: movie.popularity || '0',
        year: movie.year,
        duration: movie.durationSeconds ? `${Math.floor(movie.durationSeconds / 60)} min` : 'N/A',
        country: movie.region?.regionName || 'N/A',
        cast: 'N/A', // Cast info not available in current Movie interface
        description: movie.description || 'N/A',
        isSeries: movie.movieType === 'series',
        episodes: movie.totalEpisodes,
        season: 'Season 1',
        addedDate: savedMovie.addedDate,
        createdAt: savedMovie.addedDate,
        movie: movie
      };
    }).filter(Boolean);
    
    return this.createResponse(savedMoviesWithDetails, 200, "Saved movies retrieved successfully");
  }

  async addToSavedMovies(movieId: number) {
    await this.delay();
    
    // Check if movie is already saved
    const existingSavedMovie = this.savedMovies.find(saved => saved.movieID === movieId);
    if (existingSavedMovie) {
      return this.createResponse(null, 400, "Movie already saved");
    }
    
    // Add movie to saved list
    const newSavedMovie = {
      movieID: movieId,
      addedDate: new Date().toISOString(),
      userID: this.currentUser?.userID || '1'
    };
    
    this.savedMovies.push(newSavedMovie);
    
    return this.createResponse(newSavedMovie, 200, "Movie added to saved list");
  }

  async removeFromSavedMovies(movieId: number) {
    await this.delay();
    
    // Find and remove movie from saved list
    const movieIndex = this.savedMovies.findIndex(saved => saved.movieID === movieId);
    if (movieIndex === -1) {
      return this.createResponse(null, 404, "Movie not found in saved list");
    }
    
    this.savedMovies.splice(movieIndex, 1);
    
    return {
      errorCode: 200,
      errorMessage: 'Movie removed from saved list',
      data: { movieID: movieId },
      success: true
    };
  }

  async isMovieSaved(movieId: number) {
    await this.delay();
    
    const isSaved = this.savedMovies.some(saved => saved.movieID === movieId);
    
    return {
      errorCode: 200,
      errorMessage: 'Success',
      data: { isSaved },
      success: true
    };
  }

  // Actor APIs
  async getAllActors() {
    await this.delay();
    
    const actors = samplePersons.map((person: any) => ({
      personID: person.personID,
      fullName: person.fullName,
      avatar: person.avatar,
      career: person.role || 'Actor',
      age: Math.floor(Math.random() * 30) + 25, // Random age 25-55
      totalMovies: Math.floor(Math.random() * 50) + 10, // Random 10-60 movies
      genres: ['Action', 'Drama', 'Comedy'].slice(0, Math.floor(Math.random() * 3) + 1), // Random genres
      birthDate: `${Math.floor(Math.random() * 30) + 1970}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      birthPlace: ['Los Angeles, CA', 'New York, NY', 'London, UK', 'Paris, France', 'Tokyo, Japan'][Math.floor(Math.random() * 5)],
      height: `${Math.floor(Math.random() * 30) + 150} cm`,
      zodiac: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(Math.random() * 12)],
    }));
    
    return this.createResponse(actors, 200, "Success");
  }

  async getActorById(actorId: number) {
    await this.delay();
    
    // FilmZone Backend Business Logic - 100% Compatible
    // Actor details are public content, no authentication required
    const person = samplePersons.find((p: any) => p.personID === actorId);
    if (!person) {
      return this.createResponse(null, this.ERROR_CODES.NOT_FOUND, this.ERROR_MESSAGES.ACTOR_NOT_FOUND);
    }
    
    // Get actor's filmography from movies
    const filmography = sampleMovies
      .filter((movie: any) => 
        (movie as any).cast?.some((cast: any) => cast.personID === actorId)
      )
      .map((movie: any) => ({
        id: movie.movieID.toString(),
        title: movie.title,
        year: movie.year,
        rating: movie.popularity || Math.floor(Math.random() * 3) + 6, // Random 6-9
        genres: movie.tags?.map((tag: any) => tag.tagName) || ['Action'],
        image: movie.image,
        movieType: movie.movieType,
        totalSeasons: movie.totalSeasons,
        totalEpisodes: movie.totalEpisodes,
      }))
      .slice(0, 10); // Limit to 10 movies
    
    const actor = {
      personID: person.personID,
      fullName: person.fullName,
      avatar: person.avatar,
      career: person.role || 'Actor',
      age: Math.floor(Math.random() * 30) + 25,
      totalMovies: filmography.length,
      genres: ['Action', 'Drama', 'Comedy'].slice(0, Math.floor(Math.random() * 3) + 1),
      birthDate: `${Math.floor(Math.random() * 30) + 1970}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      birthPlace: ['Los Angeles, CA', 'New York, NY', 'London, UK', 'Paris, France', 'Tokyo, Japan'][Math.floor(Math.random() * 5)],
      height: `${Math.floor(Math.random() * 30) + 150} cm`,
      zodiac: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(Math.random() * 12)],
      firstMovie: filmography[filmography.length - 1]?.title || 'Unknown',
      lastMovie: filmography[0]?.title || 'Unknown',
      bestMovie: filmography.find(m => m.rating >= 8)?.title || filmography[0]?.title || 'Unknown',
      filmography: filmography,
      photos: [
        person.avatar,
        `https://via.placeholder.com/200x300/2b2b31/fff?text=${person.fullName.charAt(0)}`,
        `https://via.placeholder.com/200x300/2b2b31/fff?text=${person.fullName.split(' ')[1]?.charAt(0) || 'A'}`,
        `https://via.placeholder.com/200x300/2b2b31/fff?text=Photo1`,
        `https://via.placeholder.com/200x300/2b2b31/fff?text=Photo2`,
        `https://via.placeholder.com/200x300/2b2b31/fff?text=Photo3`,
      ]
    };
    
    return this.createResponse(actor, this.ERROR_CODES.SUCCESS, "Actor retrieved successfully");
  }

  async getActorsByMovie(movieId: number) {
    await this.delay();
    
    // FilmZone Backend Business Logic - 100% Compatible
    // Cast information is public content, no authentication required
    const movie = getMovieById(movieId);
    if (!movie) {
      return this.createResponse(null, this.ERROR_CODES.NOT_FOUND, this.ERROR_MESSAGES.MOVIE_NOT_FOUND);
    }
    
    if (!(movie as any).cast) {
      return this.createResponse([], this.ERROR_CODES.SUCCESS, "No cast information available");
    }
    
    const actors = (movie as any).cast.map((cast: any) => {
      const person = samplePersons.find((p: any) => p.personID === cast.personID);
      if (!person) return null;
      
      return {
        personID: person.personID,
        fullName: person.fullName,
        avatar: person.avatar,
        characterName: cast.characterName,
        role: cast.role,
        creditOrder: cast.creditOrder,
      };
    }).filter(Boolean);
    
    return this.createResponse(actors, this.ERROR_CODES.SUCCESS, "Cast retrieved successfully");
  }

  // User Rating APIs
  async getUserRating(movieId: number) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Success',
      data: { 
        userRatingID: Date.now(),
        userID: this.currentUser?.userID || 1,
        movieID: movieId, 
        stars: Math.floor(Math.random() * 5) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      success: true
    };
  }

  async addUserRating(movieId: number, stars: number) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Rating added',
      data: {
        userRatingID: Date.now(),
        userID: this.currentUser?.userID || 1,
        movieID: movieId,
        stars,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      success: true
    };
  }

  async updateUserRating(movieId: number, stars: number) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Rating updated',
      data: {
        userRatingID: Date.now(),
        userID: this.currentUser?.userID || 1,
        movieID: movieId,
        stars,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      success: true
    };
  }

  // Account Management APIs
  async startPasswordChangeByEmail(email: string) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Password change email sent',
      data: { email },
      success: true
    };
  }

  async verifyEmailCode(email: string, code: string) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Email code verified',
      data: { ticket: 'mock_ticket' },
      success: true
    };
  }

  async commitPasswordChange(ticket: string, oldPassword: string, newPassword: string) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Password changed successfully',
      data: {},
      success: true
    };
  }

  // Payment APIs
  async createVnPayCheckout(priceId: number) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Payment checkout created',
      data: { 
        paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
        priceId 
      },
      success: true
    };
  }

  // Watch History
  // Watch History APIs (matching FilmZone backend)
  async getWatchHistory(userId: string) {
    await this.delay();
    return this.createResponse([], 200, "Success");
  }

  async addToWatchHistory(userId: string, historyData: any) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Added to watch history',
      data: {
        historyID: Date.now(),
        userID: parseInt(userId),
        movieID: historyData.movieID,
        episodeID: historyData.episodeID || null,
        positionSeconds: historyData.positionSeconds || 0,
        durationSeconds: historyData.durationSeconds || null,
        lastWatchedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      success: true
    };
  }

  async updateWatchHistory(userId: string, historyId: number, progress: number) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Watch history updated',
      data: {
        historyID: historyId,
        userID: parseInt(userId),
        positionSeconds: progress,
        lastWatchedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      success: true
    };
  }

  // Payment Methods
  async getPaymentMethods() {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Payment methods retrieved',
      data: [
        {
          id: 'credit_card',
          name: 'Credit Card',
          icon: '💳',
          description: 'Visa, Mastercard, American Express',
          isPopular: true,
        },
        {
          id: 'paypal',
          name: 'PayPal',
          icon: '🅿️',
          description: 'Pay with your PayPal account',
          isPopular: true,
        },
        {
          id: 'momo',
          name: 'MoMo',
          icon: '💜',
          description: 'MoMo Wallet - Quick and secure',
          isPopular: true,
        },
        {
          id: 'apple_pay',
          name: 'Apple Pay',
          icon: '🍎',
          description: 'Touch ID or Face ID payment',
        },
        {
          id: 'google_pay',
          name: 'Google Pay',
          icon: 'G',
          description: 'Quick and secure payment',
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          icon: '🏦',
          description: 'Direct bank transfer',
        },
        {
          id: 'crypto',
          name: 'Cryptocurrency',
          icon: '₿',
          description: 'Bitcoin, Ethereum, and more',
        },
      ],
      success: true
    };
  }

  async processPayment(paymentData: {
    method: string;
    amount: number;
    currency: string;
    cardDetails?: {
      number: string;
      expiry: string;
      cvv: string;
      name: string;
    };
    momoDetails?: {
      phoneNumber: string;
      amount: number;
    };
  }) {
    await this.delay(1500); // Simulate processing time
    
    // Simulate payment processing with different success rates
    let isSuccess = Math.random() > 0.1; // 90% success rate
    
    // MoMo has slightly higher success rate
    if (paymentData.method === 'momo') {
      isSuccess = Math.random() > 0.05; // 95% success rate
    }
    
    if (isSuccess) {
      return {
        errorCode: 200,
        errorMessage: 'Payment processed successfully',
        data: {
          transactionId: `txn_${Date.now()}`,
          amount: paymentData.amount,
          currency: paymentData.currency,
          method: paymentData.method,
          status: 'completed',
          processedAt: new Date().toISOString(),
          ...(paymentData.method === 'momo' && {
            momoTransactionId: `momo_${Date.now()}`,
            momoStatus: 'success'
          })
        },
        success: true
      };
    } else {
      return {
        errorCode: 400,
        errorMessage: paymentData.method === 'momo' 
          ? 'MoMo payment failed. Please check your wallet balance and try again.'
          : 'Payment failed. Please try again.',
        success: false
      };
    }
  }

  async getPaymentHistory(userId: string) {
    await this.delay();
    return {
      errorCode: 200,
      errorMessage: 'Payment history retrieved',
      data: [
        {
          id: 1,
          transactionId: 'txn_123456789',
          amount: 9.99,
          currency: 'USD',
          method: 'credit_card',
          status: 'completed',
          description: 'FlixGo Premium Monthly',
          processedAt: '2024-12-01T10:30:00Z',
        },
        {
          id: 2,
          transactionId: 'txn_987654321',
          amount: 9.99,
          currency: 'USD',
          method: 'paypal',
          status: 'completed',
          description: 'FlixGo Premium Monthly',
          processedAt: '2024-11-01T10:30:00Z',
        },
      ],
      success: true
    };
  }

  // Initialize sample comments for a user
  private initializeSampleComments(userId: number) {
    const sampleComments = [
      {
        commentID: Date.now() + 1,
        userID: userId,
        movieID: 1,
        content: "This movie was absolutely amazing! The visual effects were stunning.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        replies: 3
      },
      {
        commentID: Date.now() + 2,
        userID: userId,
        movieID: 2,
        content: "Great action sequences and plot twists. Highly recommended!",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        replies: 1
      },
      {
        commentID: Date.now() + 3,
        userID: userId,
        movieID: 3,
        content: "The cinematography in this film is breathtaking. A true masterpiece.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 15,
        replies: 5
      },
      {
        commentID: Date.now() + 4,
        userID: userId,
        movieID: 4,
        content: "Love the character development and emotional depth of this story.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 6,
        replies: 2
      },
      {
        commentID: Date.now() + 5,
        userID: userId,
        movieID: 5,
        content: "The soundtrack perfectly complements the movie's atmosphere.",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        likes: 9,
        replies: 0
      }
    ];
    
    this.comments.push(...sampleComments);
    console.log('📊 Overview: Added sample comments for user:', userId);
  }

  // Overview Statistics APIs
  async getOverviewStats(userId: string) {
    await this.delay();
    
    console.log('📊 Overview: Getting overview stats for user:', userId);
    console.log('📊 Overview: Current user:', this.currentUser?.userID);
    console.log('📊 Overview: Total comments in system:', this.comments.length);
    
    // Get subscription plan from current user
    const subscriptionPlan = this.currentUser?.subscription?.plan || 'starter';
    
    // Count films watched (from watch progress)
    const filmsWatched = this.watchProgress.length;
    console.log('📊 Overview: Films watched:', filmsWatched);
    
    // Count comments (from actual comments data)
    const userComments = this.comments.filter(comment => comment.userID === parseInt(userId));
    let commentsCount = userComments.length;
    console.log('📊 Overview: User comments count before init:', commentsCount);
    
    // If no comments yet, initialize with some sample comments for the user
    if (commentsCount === 0 && this.currentUser) {
      console.log('📊 Overview: No comments found, initializing sample comments...');
      this.initializeSampleComments(parseInt(userId));
      const updatedUserComments = this.comments.filter(comment => comment.userID === parseInt(userId));
      commentsCount = updatedUserComments.length;
      console.log('📊 Overview: Initialized sample comments, count:', commentsCount);
    }
    
    console.log('📊 Overview: Final comments count:', commentsCount);
    console.log('📊 Overview: User comments:', userComments.map(c => ({ id: c.commentID, content: c.content.substring(0, 20) + '...', createdAt: c.createdAt })));
    
    // Get recent views (from watch progress)
    const recentViews = this.watchProgress.slice(0, 5).map((progress: any) => {
      const movie = getMovieById(progress.movieID);
      if (!movie) return null;
      
      return {
        movieID: movie.movieID,
        title: movie.title,
        image: movie.image,
        lastWatchedAt: progress.lastWatchedAt,
        positionSeconds: progress.positionSeconds,
        durationSeconds: progress.durationSeconds
      };
    }).filter(Boolean);
    
    // Get latest comments (from actual comments data) - sorted by creation date
    const latestComments = userComments
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map((comment: any) => {
        const movie = getMovieById(comment.movieID);
        return {
          commentID: comment.commentID,
          movieID: comment.movieID,
          content: comment.content,
          createdAt: comment.createdAt,
          movie: movie ? {
            title: movie.title,
            image: movie.image
          } : {
            title: 'Unknown Movie',
            image: 'https://via.placeholder.com/300x200'
          }
        };
      });
    
    console.log('📊 Overview: Latest comments:', latestComments.map(c => ({ id: c.commentID, content: c.content.substring(0, 20) + '...', movie: c.movie.title })));
    
    return {
      errorCode: 200,
      errorMessage: 'Overview stats retrieved',
      data: {
        subscriptionPlan,
        filmsWatched,
        commentsCount,
        recentViews,
        latestComments
      },
      success: true
    };
  }

  // Increment films watched count (called when user finishes watching an episode)
  async incrementFilmsWatched(movieId: number) {
    await this.delay();
    
    // Add to watch progress if not already there
    const existing = this.watchProgress.find((progress: any) => progress.movieID === movieId);
    if (!existing) {
      const newProgress = {
        watchProgressID: this.watchProgress.length + 1,
        movieID: movieId,
        userID: this.currentUser?.userID || 1,
        positionSeconds: 0,
        durationSeconds: null,
        lastWatchedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.watchProgress.push(newProgress);
    }
    
    return {
      errorCode: 200,
      errorMessage: 'Films watched count updated',
      data: { movieID: movieId },
      success: true
    };
  }

  // Billing History APIs (matching FilmZone backend)
  async addBillingHistory(billingData: {
    userID: number;
    subscriptionPlan: string;
    amount: number;
    paymentMethod: string;
    status: string;
    transactionID?: string;
    description?: string;
  }) {
    await this.delay();
    
    if (!this.currentUser) {
      return this.createResponse(null, this.ERROR_CODES.UNAUTHORIZED, this.ERROR_MESSAGES.INVALID_TOKEN);
    }

    console.log('💰 addBillingHistory Debug:');
    console.log('- Billing data received:', billingData);
    console.log('- Current userID:', this.currentUser.userID);

    const newBilling = {
      billingID: Date.now(),
      userID: billingData.userID,
      subscriptionPlan: billingData.subscriptionPlan,
      amount: billingData.amount,
      paymentMethod: billingData.paymentMethod,
      status: billingData.status,
      transactionID: billingData.transactionID || `txn_${Date.now()}`,
      description: billingData.description || `Subscription: ${billingData.subscriptionPlan}`,
      billingDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('- New billing record:', newBilling);

    // Store billing history (in real app, this would be saved to database)
    // Ensure billingHistory is always initialized
    if (!this.billingHistory || !Array.isArray(this.billingHistory)) {
      this.billingHistory = [];
      console.log('- Initialized billingHistory array');
    }
    this.billingHistory.push(newBilling);
    
    console.log('- Updated billing history array:', this.billingHistory);
    console.log('- Billing history length:', this.billingHistory.length);
    console.log('- All billing records:', JSON.stringify(this.billingHistory, null, 2));

    // Update user subscription status
    if (this.currentUser) {
      this.currentUser.subscription = {
        plan: billingData.subscriptionPlan as any,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        autoRenew: true
      };
    }

    return this.createResponse(newBilling, this.ERROR_CODES.CREATED, "Billing history added successfully");
  }

  async getBillingHistory(userID: string) {
    await this.delay();
    
    if (!this.currentUser) {
      return this.createResponse(null, this.ERROR_CODES.UNAUTHORIZED, this.ERROR_MESSAGES.INVALID_TOKEN);
    }

    // Debug logging
    console.log('🔍 getBillingHistory Debug:');
    console.log('- Requested userID:', userID, 'type:', typeof userID);
    console.log('- Current user:', this.currentUser);
    console.log('- Current userID:', this.currentUser.userID, 'type:', typeof this.currentUser.userID);
    console.log('- All billing history:', this.billingHistory);
    console.log('- Billing history length:', this.billingHistory?.length || 0);
    
    // Ensure billingHistory is initialized
    if (!this.billingHistory || !Array.isArray(this.billingHistory)) {
      this.billingHistory = [];
      console.log('- Initialized empty billingHistory array');
    }
    
    // Return billing history for the user
    const userBillingHistory = this.billingHistory?.filter(billing => {
      console.log('- Comparing billing.userID:', billing.userID, 'with requested:', parseInt(userID));
      return billing.userID === parseInt(userID);
    }) || [];
    
    console.log('- Filtered billing history:', userBillingHistory);
    console.log('- Response data:', JSON.stringify(userBillingHistory, null, 2));
    
    return this.createResponse(userBillingHistory, this.ERROR_CODES.SUCCESS, "Billing history retrieved successfully");
  }
}

// Create mock API instance
export const movieAppApi = new MockMovieAppApi({
  baseURL: 'http://localhost:6000', // Not used in mock
});

// Debug: Log instance creation
console.log('🏗️ Mock API instance created:', movieAppApi);

export default movieAppApi;
