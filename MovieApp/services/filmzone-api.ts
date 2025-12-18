// FilmZone API Service
// Real API client replacing mock-api.ts
// Base URL: https://filmzone-api.koyeb.app

import {
  FilmZoneResponse,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  UserDTO,
  MovieDTO,
  EpisodeDTO,
  TagDTO,
  RegionDTO,
  PersonDTO,
  WatchProgressDTO,
  EpisodeWatchProgressDTO,
  CreateWatchProgressRequest,
  UpdateWatchProgressRequest,
  CreateEpisodeWatchProgressRequest,
  UpdateEpisodeWatchProgressRequest,
  SavedMovieDTO,
  CreateSavedMovieRequest,
  CommentDTO,
  CreateCommentRequest,
  UpdateCommentRequest,
  UserRatingDTO,
  CreateUserRatingRequest,
  UpdateUserRatingRequest,
  SearchRequest,
  SearchResultDTO,
  EpisodeSourceDTO,
  StartPasswordChangeRequest,
  VerifyEmailCodeRequest,
  CommitPasswordChangeRequest,
  CreateVnPayCheckoutRequest,
  VnPayCheckoutResponse,
} from '../types/api-dto';
import { logger } from '../utils/logger';

interface ApiConfig {
  baseURL: string;
  timeout?: number;
}

class FilmZoneApi {
  private config: ApiConfig;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: ApiConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setRefreshToken(refreshToken: string | null) {
    this.refreshToken = refreshToken;
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
    options: RequestInit = {},
    customTimeout?: number
  ): Promise<FilmZoneResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeout = customTimeout || this.config.timeout;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 204 No Content
      if (response.status === 204) {
        return {
          errorCode: 204,
          errorMessage: 'No Content',
          success: true,
        } as FilmZoneResponse<T>;
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
            data: undefined,
          };
        }
        // Empty but successful response (e.g., DELETE operations)
        return {
          errorCode: response.status,
          errorMessage: 'Success',
          success: true,
          data: undefined as any,
        };
      }

      // Try to parse JSON
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        // If not JSON, return error
        logger.warn('Response is not valid JSON', { endpoint, contentType, text: text.substring(0, 100) });
        return {
          errorCode: response.status,
          errorMessage: `Invalid JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          success: false,
          data: undefined,
        };
      }

      if (!response.ok) {
        return {
          errorCode: response.status,
          errorMessage: data.errorMessage || data.message || `HTTP ${response.status}: ${response.statusText}`,
          success: false,
          data: undefined,
        };
      }

      // If response already has FilmZoneResponse format, return as is
      if (data.errorCode !== undefined) {
        return data as FilmZoneResponse<T>;
      }

      // Wrap response in FilmZoneResponse format
      return {
        errorCode: response.status,
        errorMessage: 'Success',
        success: true,
        data: data,
      };

    } catch (error: any) {
      logger.error('API request failed', { endpoint, error });
      
      if (error.name === 'AbortError') {
        return {
          errorCode: 408,
          errorMessage: 'Request timeout',
          success: false,
        };
      }

      return {
        errorCode: 500,
        errorMessage: error.message || 'Network error',
        success: false,
      };
    }
  }

  // ==================== AUTH APIs ====================

  /**
   * POST /register
   */
  async register(request: RegisterRequest): Promise<FilmZoneResponse<UserDTO>> {
    return this.request<UserDTO>('/register', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * POST /register/verifyRegisterEmail
   * Verify registration email with token
   * Backend yêu cầu body: { userID, token }
   */
  async verifyRegisterEmail(request: { userID: number; token: string }): Promise<FilmZoneResponse<any>> {
    return this.request<any>('/register/verifyRegisterEmail', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * POST /login/login/mobile
   */
  async login(request: LoginRequest): Promise<FilmZoneResponse<LoginResponse>> {
    const response = await this.request<any>('/login/login/mobile', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (response.success && response.data) {
      // API thật trả về { accessToken, refreshToken, ... } thay vì { token, refreshToken, ... }
      // Map sang format mong đợi
      const loginData = response.data;
      const mappedData: LoginResponse = {
        token: loginData.accessToken || loginData.token,
        refreshToken: loginData.refreshToken,
        sessionId: loginData.sessionId || 0,
        deviceId: loginData.deviceId || '',
        tokenExpiration: loginData.accessTokenExpiresAt || loginData.tokenExpiration || '',
        refreshTokenExpiration: loginData.refreshTokenExpiresAt || loginData.refreshTokenExpiration || '',
        user: loginData.user, // May be undefined for real API
      };
      
      this.setToken(mappedData.token);
      this.setRefreshToken(mappedData.refreshToken);
      
      // Return mapped response
      return {
        ...response,
        data: mappedData,
      };
    }

    return response;
  }

  /**
   * POST /api/Auth/RefreshToken
   */
  async refreshAccessToken(): Promise<FilmZoneResponse<LoginResponse>> {
    if (!this.refreshToken) {
      return {
        errorCode: 401,
        errorMessage: 'No refresh token available',
        success: false,
      };
    }

    const response = await this.request<LoginResponse>('/api/Auth/RefreshToken', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setRefreshToken(response.data.refreshToken);
    }

    return response;
  }

  /**
   * GET /user/me
   */
  async getCurrentUser(): Promise<FilmZoneResponse<UserDTO>> {
    return this.request<UserDTO>('/user/me');
  }

  /**
   * GET /user/getUserById?userId={userID}
   * According to API docs, this endpoint uses query parameter, not path parameter
   */
  async getUserById(userID: number): Promise<FilmZoneResponse<UserDTO>> {
    // Filter out invalid userIDs
    if (!userID || userID <= 0 || isNaN(userID)) {
      return {
        errorCode: 400,
        errorMessage: 'Invalid userID',
        success: false,
      };
    }

    // Use query parameter as per API documentation
    return this.request<UserDTO>(`/user/getUserById?userId=${userID}`);
  }

  /**
   * PUT /api/Auth/UpdateUser
   */
  async updateUser(userUpdates: Partial<UserDTO>): Promise<FilmZoneResponse<UserDTO>> {
    return this.request<UserDTO>('/api/Auth/UpdateUser', {
      method: 'PUT',
      body: JSON.stringify(userUpdates),
    });
  }

  /**
   * PUT /user/update/profile
   * Cập nhật avatar/profile bằng multipart/form-data
   */
  async updateUserProfileAvatar(params: {
    userID: number;
    avatarUri: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    dateOfBirth?: string;
  }): Promise<FilmZoneResponse<UserDTO>> {
    const { userID, avatarUri, firstName, lastName, gender, dateOfBirth } = params;

    if (!userID || !avatarUri) {
      return {
        errorCode: 400,
        errorMessage: 'userID and avatarUri are required',
        success: false,
      };
    }

    const formData = new FormData();
    formData.append('userID', String(userID));
    if (firstName) formData.append('firstName', firstName);
    if (lastName) formData.append('lastName', lastName);
    if (gender) formData.append('gender', gender);
    if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);

    // React Native / Expo file object
    formData.append('avatar', {
      uri: avatarUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    } as any);

    const url = `${this.config.baseURL}/user/update/profile`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: formData,
      });

      const text = await response.text();
      let data: any = undefined;
      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text);
        } catch {
          // ignore parse error, sẽ trả errorMessage chung
        }
      }

      if (!response.ok) {
        return {
          errorCode: response.status,
          errorMessage:
            (data && (data.errorMessage || data.message)) ||
            `HTTP ${response.status}: ${response.statusText}`,
          success: false,
        };
      }

      // Nếu backend đã trả FilmZoneResponse thì trả luôn
      if (data && data.errorCode !== undefined) {
        return data as FilmZoneResponse<UserDTO>;
      }

      return {
        errorCode: response.status,
        errorMessage: 'Success',
        success: true,
        data: data as UserDTO,
      };
    } catch (error: any) {
      logger.error('updateUserProfileAvatar failed', { error });
      return {
        errorCode: 500,
        errorMessage: error?.message || 'Network error',
        success: false,
      };
    }
  }

  /**
   * POST /account/password/change/email/start
   */
  async startPasswordChangeByEmail(request: StartPasswordChangeRequest): Promise<FilmZoneResponse<any>> {
    return this.request<any>('/account/password/change/email/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * POST /account/password/change/email/verify
   * Returns ticket as string in data field
   */
  async verifyEmailCode(request: VerifyEmailCodeRequest): Promise<FilmZoneResponse<string>> {
    return this.request<string>('/account/password/change/email/verify', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * POST /account/password/change/commit
   * Uses longer timeout (30s) as password change may take longer
   */
  async commitPasswordChange(request: CommitPasswordChangeRequest): Promise<FilmZoneResponse<any>> {
    return this.request<any>('/account/password/change/commit', {
      method: 'POST',
      body: JSON.stringify(request),
    }, 30000); // 30 seconds timeout
  }

  /**
   * POST /account/password/forgot/email/start
   * Start forgot password process by sending email
   */
  async startForgotPasswordByEmail(request: StartPasswordChangeRequest): Promise<FilmZoneResponse<any>> {
    return this.request<any>('/account/password/forgot/email/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * POST /account/password/forgot/email/verify
   * Verify OTP code for forgot password
   * Returns ticket as string in data field
   */
  async verifyForgotPasswordByEmail(request: VerifyEmailCodeRequest): Promise<FilmZoneResponse<string>> {
    return this.request<string>('/account/password/forgot/email/verify', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * POST /account/password/forgot/commit
   * Commit forgot password change using ticket from verify step
   */
  async commitForgotPassword(request: CommitPasswordChangeRequest): Promise<FilmZoneResponse<any>> {
    return this.request<any>('/account/password/forgot/commit', {
      method: 'POST',
      body: JSON.stringify(request),
    }, 30000); // 30 seconds timeout
  }

  async logout(): Promise<FilmZoneResponse<any>> {
    try {
      await this.request('/api/Auth/Logout', { method: 'POST' });
    } catch (error) {
      logger.warn('Logout request failed', error);
    } finally {
      this.setToken(null);
      this.setRefreshToken(null);
    }

    return {
      errorCode: 200,
      success: true,
    };
  }

  // ==================== MOVIE APIs ====================

  /**
   * GET /api/Movie/GetAllMoviesMainScreen/mainScreen
   */
  async getMoviesMainScreen(): Promise<FilmZoneResponse<MovieDTO[]>> {
    return this.request<MovieDTO[]>('/api/Movie/GetAllMoviesMainScreen/mainScreen');
  }

  /**
   * GET /api/Movie/GetAllMoviesNewReleaseMainScreen/newReleaseMainScreen
   */
  async getNewReleaseMovies(): Promise<FilmZoneResponse<MovieDTO[]>> {
    return this.request<MovieDTO[]>('/api/Movie/GetAllMoviesNewReleaseMainScreen/newReleaseMainScreen');
  }

  /**
   * GET /api/Movie/GetMovieById/{id}
   */
  async getMovieById(movieId: number): Promise<FilmZoneResponse<MovieDTO>> {
    return this.request<MovieDTO>(`/api/Movie/GetMovieById/${movieId}`);
  }

  /**
   * Legacy method for compatibility
   */
  async getMovie(movieId: string): Promise<FilmZoneResponse<MovieDTO> | null> {
    const response = await this.getMovieById(parseInt(movieId));
    if (!response.success || !response.data) {
      return null;
    }
    return response;
  }

  /**
   * GET /api/Movie/GetFeaturedMovies (if exists) or use mainScreen with filter
   */
  async getFeaturedMovies(): Promise<FilmZoneResponse<MovieDTO[]>> {
    // If endpoint exists, use it; otherwise filter from mainScreen
    const response = await this.getMoviesMainScreen();
    if (response.success && response.data) {
      // Return first 3 as featured (client-side filtering)
      const featured = response.data.slice(0, 3);
      return {
        ...response,
        data: featured,
      };
    }
    return response;
  }

  /**
   * GET /api/Movie/GetTrendingMovies (if exists) or use mainScreen with sort
   */
  async getTrendingMovies(): Promise<FilmZoneResponse<MovieDTO[]>> {
    // If endpoint exists, use it; otherwise sort by popularity
    const response = await this.getMoviesMainScreen();
    if (response.success && response.data) {
      const trending = [...response.data]
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 5);
      return {
        ...response,
        data: trending,
      };
    }
    return response;
  }

  /**
   * Legacy method
   */
  async getMovies(): Promise<MovieDTO[]> {
    const response = await this.getMoviesMainScreen();
    return response.data || [];
  }

  /**
   * Legacy method
   */
  async getMoviesByCategory(categoryId: number): Promise<FilmZoneResponse<MovieDTO[]>> {
    // Use mainScreen and filter by tag if needed
    return this.getMoviesMainScreen();
  }

  // ==================== EPISODE APIs ====================

  /**
   * GET /api/Episode/GetAllEpisodes/getAll
   * Note: This gets all episodes. Client should filter by movieID
   */
  async getAllEpisodes(): Promise<FilmZoneResponse<EpisodeDTO[]>> {
    return this.request<EpisodeDTO[]>('/api/Episode/GetAllEpisodes/getAll');
  }

  /**
   * Get episodes by movie ID (client-side filtering)
   */
  async getEpisodesByMovie(movieId: number): Promise<FilmZoneResponse<{
    seasons: Array<{
      id: number;
      name: string;
      episodes: Array<{
        id: number;
        title: string;
        description?: string;
        duration: string;
        thumbnail?: string;
        videoUrl?: string;
        episodeNumber: number;
        seasonNumber: number;
      }>;
    }>;
    totalSeasons: number;
    totalEpisodes: number;
  }>> {
    const allEpisodesResponse = await this.getAllEpisodes();
    
    // Backend có thể không trả trường "success", chỉ có errorCode/data,
    // nên ta dựa vào errorCode 2xx + có data để coi là thành công.
    const isOk = allEpisodesResponse.errorCode >= 200 && allEpisodesResponse.errorCode < 300;
    if (!isOk || !allEpisodesResponse.data) {
      return {
        ...allEpisodesResponse,
        data: {
          seasons: [],
          totalSeasons: 0,
          totalEpisodes: 0,
        },
      };
    }

    // Filter episodes by movieID
    const movieEpisodes = allEpisodesResponse.data.filter(ep => ep.movieID === movieId);

    if (movieEpisodes.length === 0) {
      return {
        errorCode: 404,
        errorMessage: 'No episodes found for this movie',
        success: false,
        data: {
          seasons: [],
          totalSeasons: 0,
          totalEpisodes: 0,
        },
      };
    }

    // Group by season
    const seasonsMap = new Map<number, {
      id: number;
      name: string;
      episodes: any[];
    }>();

    movieEpisodes.forEach(ep => {
      if (!seasonsMap.has(ep.seasonNumber)) {
        seasonsMap.set(ep.seasonNumber, {
          id: ep.seasonNumber,
          name: `Season ${ep.seasonNumber}`,
          episodes: [],
        });
      }

      const season = seasonsMap.get(ep.seasonNumber)!;
      season.episodes.push({
        id: ep.episodeID,
        title: ep.title,
        description: ep.description || ep.synopsis,
        duration: ep.durationSeconds ? `${Math.floor(ep.durationSeconds / 60)} phút` : '60 phút',
        thumbnail: ep.thumbnail,
        videoUrl: ep.sources?.[0]?.sourceUrl,
        episodeNumber: ep.episodeNumber,
        seasonNumber: ep.seasonNumber,
      });
    });

    const seasons = Array.from(seasonsMap.values()).sort((a, b) => a.id - b.id);
    const maxSeason = Math.max(...seasons.map(s => s.id));

    return {
      errorCode: 200,
      errorMessage: 'Success',
      success: true,
      data: {
        seasons,
        totalSeasons: maxSeason,
        totalEpisodes: movieEpisodes.length,
      },
    };
  }

  /**
   * GET /movie/EpisodeSource/GetEpisodeSourcesByEpisodeId/{episodeId}
   */
  async getEpisodeSourcesByEpisodeId(episodeId: number): Promise<FilmZoneResponse<EpisodeSourceDTO[]>> {
    return this.request<EpisodeSourceDTO[]>(`/movie/EpisodeSource/GetEpisodeSourcesByEpisodeId/${episodeId}`);
  }

  /**
   * GET /movie/MovieSource/GetMovieSourceById/{id}
   */
  async getMovieSourceById(movieId: number): Promise<FilmZoneResponse<any>> {
    return this.request<any>(`/movie/MovieSource/GetMovieSourceById/${movieId}`);
  }

  /**
   * GET /movie/MovieSource/GetMovieSourcesByMovieIdPublic/getByMovieId/{movieId}
   * Lấy danh sách source theo movieID (public)
   */
  async getMovieSourcesByMovieId(movieId: number): Promise<FilmZoneResponse<any>> {
    return this.request<any>(`/movie/MovieSource/GetMovieSourcesByMovieIdPublic/getByMovieId/${movieId}`);
  }

  // ==================== WATCH PROGRESS APIs ====================

  /**
   * POST /movie/WatchProgress/CreateWatchProgress
   */
  async createWatchProgress(request: CreateWatchProgressRequest): Promise<FilmZoneResponse<WatchProgressDTO>> {
    return this.request<WatchProgressDTO>('/movie/WatchProgress/CreateWatchProgress', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * PUT /movie/WatchProgress/UpdateWatchProgress
   */
  async updateWatchProgress(request: UpdateWatchProgressRequest): Promise<FilmZoneResponse<WatchProgressDTO>> {
    return this.request<WatchProgressDTO>('/movie/WatchProgress/UpdateWatchProgress', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  /**
   * GET /movie/WatchProgress/GetWatchProgressByUserId/{userId}
   */
  async getWatchProgressByUserId(userId: number): Promise<FilmZoneResponse<WatchProgressDTO[]>> {
    return this.request<WatchProgressDTO[]>(`/movie/WatchProgress/GetWatchProgressByUserId/${userId}`);
  }

  /**
   * Legacy methods for compatibility
   */
  async getWatchProgress(): Promise<FilmZoneResponse<any[]>> {
    // Need user ID from context - will be handled by caller
    return {
      errorCode: 400,
      errorMessage: 'User ID required. Use getWatchProgressByUserId instead.',
      success: false,
    };
  }

  async addToWatchProgress(movieId: number, sourceId?: number): Promise<FilmZoneResponse<WatchProgressDTO>> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser.success || !currentUser.data) {
      return {
        errorCode: 401,
        errorMessage: 'User not authenticated',
        success: false,
      };
    }
    return this.createWatchProgress({
      userID: currentUser.data.userID,
      movieID: movieId,
      sourceID: sourceId || null,
      positionSeconds: 0,
      durationSeconds: null,
    });
  }

  async updateWatchProgressByMovie(
    movieId: number,
    positionSeconds: number,
    durationSeconds?: number,
    sourceId?: number
  ): Promise<FilmZoneResponse<WatchProgressDTO>> {
    // First get the watch progress to find the ID
    const currentUser = await this.getCurrentUser();
    if (!currentUser.success || !currentUser.data) {
      return {
        errorCode: 401,
        errorMessage: 'User not authenticated',
        success: false,
      };
    }

    const progressList = await this.getWatchProgressByUserId(currentUser.data.userID);
    if (!progressList.success || !progressList.data) {
      return {
        errorCode: 404,
        errorMessage: 'Watch progress not found',
        success: false,
      };
    }

    const progress = progressList.data.find(p => p.movieID === movieId);
    if (!progress) {
      // Create new if not exists
      return this.createWatchProgress({
        userID: currentUser.data.userID,
        movieID: movieId,
        sourceID: sourceId || null,
        positionSeconds,
        durationSeconds: durationSeconds || null,
      });
    }

    return this.updateWatchProgress({
      userID: currentUser.data.userID,
      movieID: movieId,
      sourceID: sourceId || null,
      positionSeconds,
      durationSeconds: durationSeconds || null,
      watchProgressID: progress.watchProgressID,
    });
  }

  // ==================== EPISODE WATCH PROGRESS APIs ====================

  /**
   * POST /api/EpisodeWatchProgress/CreateEpisodeWatchProgress
   */
  async createEpisodeWatchProgress(request: CreateEpisodeWatchProgressRequest): Promise<FilmZoneResponse<EpisodeWatchProgressDTO>> {
    return this.request<EpisodeWatchProgressDTO>('/api/EpisodeWatchProgress/CreateEpisodeWatchProgress', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * PUT /api/EpisodeWatchProgress/UpdateEpisodeWatchProgress
   */
  async updateEpisodeWatchProgress(request: UpdateEpisodeWatchProgressRequest): Promise<FilmZoneResponse<EpisodeWatchProgressDTO>> {
    return this.request<EpisodeWatchProgressDTO>('/api/EpisodeWatchProgress/UpdateEpisodeWatchProgress', {
        method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  /**
   * GET /api/EpisodeWatchProgress/GetEpisodeWatchProgressByUserID/user/{userId}
   */
  async getEpisodeWatchProgressByUserID(userId: number): Promise<FilmZoneResponse<EpisodeWatchProgressDTO[]>> {
    return this.request<EpisodeWatchProgressDTO[]>(`/api/EpisodeWatchProgress/GetEpisodeWatchProgressByUserID/user/${userId}`);
  }

  /**
   * Legacy method
   */
  async getEpisodeWatchProgress(): Promise<FilmZoneResponse<EpisodeWatchProgressDTO[]>> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser.success || !currentUser.data) {
      return {
        errorCode: 401,
        errorMessage: 'User not authenticated',
        success: false,
      };
    }
    return this.getEpisodeWatchProgressByUserID(currentUser.data.userID);
  }

  async addEpisodeWatchProgress(
    episodeId: number,
    positionSeconds: number,
    durationSeconds?: number,
    episodeSourceId?: number
  ): Promise<FilmZoneResponse<EpisodeWatchProgressDTO>> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser.success || !currentUser.data) {
      return {
        errorCode: 401,
        errorMessage: 'User not authenticated',
        success: false,
      };
    }
    return this.createEpisodeWatchProgress({
      userID: currentUser.data.userID,
      episodeID: episodeId,
      episodeSourceID: episodeSourceId || null,
      positionSeconds,
      durationSeconds: durationSeconds || null,
    });
  }

  async updateEpisodeWatchProgressByEpisode(
    episodeId: number,
    positionSeconds: number,
    durationSeconds?: number,
    episodeSourceId?: number
  ): Promise<FilmZoneResponse<EpisodeWatchProgressDTO>> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser.success || !currentUser.data) {
      return {
        errorCode: 401,
        errorMessage: 'User not authenticated',
        success: false,
      };
    }

    // Get existing progress
    const progressList = await this.getEpisodeWatchProgressByUserID(currentUser.data.userID);
    if (!progressList.success || !progressList.data) {
      // Create new if not exists
      return this.createEpisodeWatchProgress({
        userID: currentUser.data.userID,
        episodeID: episodeId,
        episodeSourceID: episodeSourceId || null,
        positionSeconds,
        durationSeconds: durationSeconds || null,
      });
    }

    const progress = progressList.data.find(p => p.episodeID === episodeId);
    if (!progress) {
      // Create new if not exists
      return this.createEpisodeWatchProgress({
        userID: currentUser.data.userID,
        episodeID: episodeId,
        episodeSourceID: episodeSourceId || null,
        positionSeconds,
        durationSeconds: durationSeconds || null,
      });
    }

    return this.updateEpisodeWatchProgress({
      userID: currentUser.data.userID,
      episodeID: episodeId,
      episodeSourceID: episodeSourceId || null,
      positionSeconds,
      durationSeconds: durationSeconds || null,
      episodeWatchProgressID: progress.episodeWatchProgressID,
    });
  }

  // ==================== SAVED MOVIES APIs ====================

  /**
   * POST /api/SavedMovie/CreateSavedMovie
   */
  async createSavedMovie(request: CreateSavedMovieRequest): Promise<FilmZoneResponse<SavedMovieDTO>> {
    return this.request<SavedMovieDTO>('/api/SavedMovie/CreateSavedMovie', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * DELETE /api/SavedMovie/DeleteSavedMovie/{id}
   */
  async deleteSavedMovie(id: number): Promise<FilmZoneResponse<any>> {
    return this.request<any>(`/api/SavedMovie/DeleteSavedMovie/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * GET /api/SavedMovie/GetSavedMoviesByUserID/user/{userId}
   */
  async getSavedMoviesByUserID(userId: number): Promise<FilmZoneResponse<SavedMovieDTO[]>> {
    return this.request<SavedMovieDTO[]>(`/api/SavedMovie/GetSavedMoviesByUserID/user/${userId}`);
  }

  /**
   * Legacy methods
   */
  async getSavedMovies(): Promise<FilmZoneResponse<SavedMovieDTO[]>> {
    const currentUser = await this.getCurrentUser();
    if (!currentUser.success || !currentUser.data) {
      return {
        errorCode: 401,
        errorMessage: 'User not authenticated',
        success: false,
      };
    }
    return this.getSavedMoviesByUserID(currentUser.data.userID);
  }

  async addToSavedMovies(movieId: number, userId?: number): Promise<FilmZoneResponse<SavedMovieDTO>> {
    // If userId is provided, include it in the request
    // Otherwise, backend should get it from token
    const request: any = { movieID: movieId };
    if (userId) {
      request.userID = userId;
    }
    return this.createSavedMovie(request);
  }

  async removeFromSavedMovies(movieId: number, userId?: number): Promise<FilmZoneResponse<any>> {
    // Need to find the saved movie ID first
    let savedMoviesResponse: FilmZoneResponse<SavedMovieDTO[]>;
    
    if (userId) {
      // Use direct method if userId is provided
      savedMoviesResponse = await this.getSavedMoviesByUserID(userId);
    } else {
      // Fallback to getSavedMovies (which calls getCurrentUser)
      savedMoviesResponse = await this.getSavedMovies();
    }
    
    if (!savedMoviesResponse.success || !savedMoviesResponse.data) {
      return {
        errorCode: 404,
        errorMessage: 'Saved movie not found',
        success: false,
      };
    }

    const savedMovie = savedMoviesResponse.data.find(sm => sm.movieID === movieId);
    if (!savedMovie) {
      return {
        errorCode: 404,
        errorMessage: 'Movie not found in saved list',
        success: false,
      };
    }

    return this.deleteSavedMovie(savedMovie.savedMovieID);
  }

  async isMovieSaved(movieId: number, userId?: number): Promise<FilmZoneResponse<{ isSaved: boolean }>> {
    let savedMoviesResponse: FilmZoneResponse<SavedMovieDTO[]>;
    
    if (userId) {
      // Use direct method if userId is provided
      savedMoviesResponse = await this.getSavedMoviesByUserID(userId);
    } else {
      // Fallback to getSavedMovies (which calls getCurrentUser)
      try {
        savedMoviesResponse = await this.getSavedMovies();
      } catch (error) {
        // If getSavedMovies fails, return not saved
        return {
          errorCode: 200,
          success: true,
          data: { isSaved: false },
        };
      }
    }
    
    if (!savedMoviesResponse.success || !savedMoviesResponse.data) {
      return {
        errorCode: 200,
        success: true,
        data: { isSaved: false },
      };
    }

    const isSaved = savedMoviesResponse.data.some(sm => sm.movieID === movieId);
    return {
      errorCode: 200,
      success: true,
      data: { isSaved },
    };
  }

  // ==================== COMMENT APIs ====================

  /**
   * GET /api/Comment/GetCommentsByMovieId/movie/{movieId}
   */
  async getCommentsByMovieId(movieId: number): Promise<FilmZoneResponse<CommentDTO[]>> {
    return this.request<CommentDTO[]>(`/api/Comment/GetCommentsByMovieId/movie/${movieId}`);
  }

  /**
   * GET /api/Comment/GetCommentsByMovieID/{movieID}
   * Requires both path parameter (string) and query parameter (integer)
   */
  async getCommentsByMovieID(movieID: number): Promise<FilmZoneResponse<CommentDTO[]>> {
    return this.request<CommentDTO[]>(`/api/Comment/GetCommentsByMovieID/${movieID}?movieID=${movieID}`);
  }

  /**
   * GET /api/Comment/GetCommentsByUserID/{userID}
   * Requires both path parameter (string) and query parameter (integer)
   */
  async getCommentsByUserID(userID: number): Promise<FilmZoneResponse<CommentDTO[]>> {
    return this.request<CommentDTO[]>(`/api/Comment/GetCommentsByUserID/${userID}?userID=${userID}`);
  }

  /**
   * POST /api/Comment/CreateComment
   */
  async createComment(request: CreateCommentRequest): Promise<FilmZoneResponse<CommentDTO>> {
    return this.request<CommentDTO>('/api/Comment/CreateComment', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * PUT /api/Comment/UpdateComment/{commentId}
   */
  async updateComment(commentId: number, request: UpdateCommentRequest): Promise<FilmZoneResponse<CommentDTO>> {
    return this.request<CommentDTO>(`/api/Comment/UpdateComment/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  /**
   * DELETE /api/Comment/DeleteComment/{commentId}
   */
  async deleteComment(commentId: number): Promise<FilmZoneResponse<any>> {
    return this.request<any>(`/api/Comment/DeleteComment/${commentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Legacy methods
   */
  async getCommentsByMovie(movieId: string): Promise<FilmZoneResponse<CommentDTO[]>> {
    return this.getCommentsByMovieId(parseInt(movieId));
  }

  async addComment(commentData: any): Promise<FilmZoneResponse<CommentDTO>> {
    return this.createComment({
      movieID: commentData.movieID,
      userID: commentData.userID ?? 0,
      content: commentData.content,
      parentID: commentData.parentID,
      likeCount: commentData.likeCount ?? 0,
    });
  }

  // ==================== USER RATING APIs ====================

  /**
   * GET /api/UserRating/GetUserRatingByMovieId/movie/{movieId}
   */
  async getUserRatingByMovieId(movieId: number): Promise<FilmZoneResponse<UserRatingDTO>> {
    return this.request<UserRatingDTO>(`/api/UserRating/GetUserRatingByMovieId/movie/${movieId}`);
  }

  /**
   * GET /api/UserRating/GetUserRatingById/{ID}
   */
  async getUserRatingById(userRatingId: number): Promise<FilmZoneResponse<UserRatingDTO>> {
    return this.request<UserRatingDTO>(`/api/UserRating/GetUserRatingById/${userRatingId}`);
  }

  /**
   * GET /api/UserRating/GetAllUserRatingsByUserId/{userID}
   */
  async getUserRatingsByUserId(userID: number): Promise<FilmZoneResponse<UserRatingDTO[]>> {
    return this.request<UserRatingDTO[]>(`/api/UserRating/GetAllUserRatingsByUserId/${userID}`);
  }

  /**
   * POST /api/UserRating/CreateUserRating
   */
  async createUserRating(request: CreateUserRatingRequest): Promise<FilmZoneResponse<UserRatingDTO>> {
    return this.request<UserRatingDTO>('/api/UserRating/CreateUserRating', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * PUT /api/UserRating/UpdateUserRating
   */
  async updateUserRating(request: UpdateUserRatingRequest): Promise<FilmZoneResponse<UserRatingDTO>> {
    return this.request<UserRatingDTO>('/api/UserRating/UpdateUserRating', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  /**
   * DELETE /api/UserRating/DeleteUserRating/{userRatingId}
   */
  async deleteUserRating(userRatingId: number): Promise<FilmZoneResponse<any>> {
    return this.request<any>(`/api/UserRating/DeleteUserRating/${userRatingId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Legacy methods
   */
  async getUserRating(movieId: number): Promise<FilmZoneResponse<UserRatingDTO>> {
    return this.getUserRatingByMovieId(movieId);
  }

  async addUserRating(movieId: number, stars: number): Promise<FilmZoneResponse<UserRatingDTO>> {
    // Legacy helper (no userID available here) - kept for backwards compat
    return this.createUserRating({ userID: 0, movieID: movieId, rating: stars });
  }

  async updateUserRatingByMovie(
    movieId: number,
    stars: number
  ): Promise<FilmZoneResponse<UserRatingDTO>> {
    // First get existing rating to find the ID
    const existingRating = await this.getUserRatingByMovieId(movieId);
    const ok = (existingRating as any).success === true || (existingRating.errorCode >= 200 && existingRating.errorCode < 300);
    if (!ok || !existingRating.data) {
      // Create new if not exists
      return this.createUserRating({ userID: 0, movieID: movieId, rating: stars });
    }

    return this.updateUserRating({
      userRatingID: existingRating.data.userRatingID,
      userID: existingRating.data.userID,
      movieID: existingRating.data.movieID,
      rating: stars,
    });
  }

  /**
   * Upsert rating with explicit userId (recommended)
   */
  async upsertUserRating(userID: number, movieID: number, rating: number): Promise<FilmZoneResponse<UserRatingDTO>> {
    const existing = await this.getUserRatingByMovieId(movieID);
    const ok = (existing as any).success === true || (existing.errorCode >= 200 && existing.errorCode < 300);
    if (!ok || !existing.data) {
      return this.createUserRating({ userID, movieID, rating });
    }
    return this.updateUserRating({
      userRatingID: existing.data.userRatingID,
      userID,
      movieID,
      rating,
    });
  }

  // ==================== SEARCH API ====================

  /**
   * GET /api/search/movies
   */
  async searchMovies(query: string, options?: {
    tagIds?: number[];
    regionCode?: string;
    personId?: number;
    page?: number;
    size?: number;
  }): Promise<FilmZoneResponse<SearchResultDTO[]>> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (options?.tagIds?.length) {
      options.tagIds.forEach(id => params.append('tagIds', id.toString()));
    }
    if (options?.regionCode) params.append('regionCode', options.regionCode);
    if (options?.personId) params.append('personId', options.personId.toString());
    if (options?.page) params.append('page', options.page.toString());
    if (options?.size) params.append('size', options.size.toString());

    const response = await this.request<MovieDTO[]>(`/api/search/movies?${params.toString()}`);
    
    // Transform MovieDTO[] to SearchResultDTO[]
    if (response.success && response.data) {
      const searchResults: SearchResultDTO[] = response.data.map(movie => ({
        id: movie.movieID.toString(),
        title: movie.title,
        cover: movie.image,
        categories: movie.tags?.map(tag => tag.tagName) || [],
        rating: movie.popularity?.toString() || '0',
        isSeries: movie.movieType === 'series',
        year: movie.year?.toString(),
        studio: movie.region?.regionName,
      }));

      return {
        ...response,
        data: searchResults,
      };
    }

    return {
      ...response,
      data: [],
    };
  }

  // ==================== METADATA APIs ====================

  /**
   * GET /movie/Tag/GetAllTags/getALlTags
   */
  async getAllTags(): Promise<FilmZoneResponse<TagDTO[]>> {
    return this.request<TagDTO[]>('/movie/Tag/GetAllTags/getALlTags');
  }

  /**
   * GET /movie/MovieTag/GetTagsByMovie/{movieID}
   * Lấy danh sách tag (genre) theo movieID
   */
  async getTagsByMovie(movieId: number): Promise<FilmZoneResponse<TagDTO[]>> {
    return this.request<TagDTO[]>(`/movie/MovieTag/GetTagsByMovie/${movieId}`);
  }

  // ==================== PLAN & PRICE APIs ====================

  /**
   * GET /api/plans/all
   */
  async getAllPlans(): Promise<FilmZoneResponse<any[]>> {
    return this.request<any[]>('/api/plans/all');
  }

  /**
   * GET /api/plans/{planID}
   */
  async getPlanById(planId: number): Promise<FilmZoneResponse<any>> {
    return this.request<any>(`/api/plans/${planId}`);
  }

  /**
   * GET /api/price/{priceID}
   */
  async getPriceById(priceId: number): Promise<FilmZoneResponse<any>> {
    return this.request<any>(`/api/price/${priceId}`);
  }

  /**
   * GET /api/price/all
   */
  async getAllPrices(): Promise<FilmZoneResponse<any[]>> {
    return this.request<any[]>('/api/price/all');
  }

  /**
   * GET /movie/Region/GetAllRegions/getAll
   */
  async getAllRegions(): Promise<FilmZoneResponse<RegionDTO[]>> {
    return this.request<RegionDTO[]>('/movie/Region/GetAllRegions/getAll');
  }

  /**
   * GET /movie/Person/GetAllPerson/getall
   */
  async getAllPersons(): Promise<FilmZoneResponse<PersonDTO[]>> {
    return this.request<PersonDTO[]>('/movie/Person/GetAllPerson/getall');
  }

  /**
   * GET /movie/Person/GetPersonById/{personId}
   */
  async getPersonById(personId: number): Promise<FilmZoneResponse<PersonDTO>> {
    return this.request<PersonDTO>(`/movie/Person/GetPersonById/${personId}`);
  }

  /**
   * Legacy methods for actors
   */
  async getAllActors(): Promise<FilmZoneResponse<PersonDTO[]>> {
    return this.getAllPersons();
  }

  async getActorById(actorId: number): Promise<FilmZoneResponse<PersonDTO>> {
    return this.getPersonById(actorId);
  }

  /**
   * GET /movie/MoviePerson/GetPersonsByMovie/{movieID}
   * Lấy danh sách diễn viên theo movieID từ backend
   */
  async getPersonsByMovie(movieId: number): Promise<FilmZoneResponse<PersonDTO[]>> {
    return this.request<PersonDTO[]>(`/movie/MoviePerson/GetPersonsByMovie/${movieId}`);
  }

  // ==================== REVIEW APIs (Legacy - not in Swagger) ====================

  async getReviewsByMovie(movieId: string): Promise<FilmZoneResponse<any[]>> {
    // Reviews might be comments with rating, or not implemented yet
    return {
      errorCode: 200,
      success: true,
      data: [],
    };
  }

  async addReview(reviewData: any): Promise<FilmZoneResponse<any>> {
    // Not in Swagger - might use comments or user ratings
    return {
      errorCode: 501,
      errorMessage: 'Reviews not implemented',
      success: false,
    };
  }

  async updateReview(reviewId: number, reviewData: any): Promise<FilmZoneResponse<any>> {
    return {
      errorCode: 501,
      errorMessage: 'Reviews not implemented',
      success: false,
    };
  }

  async deleteReview(reviewId: number): Promise<FilmZoneResponse<any>> {
    return {
      errorCode: 501,
      errorMessage: 'Reviews not implemented',
      success: false,
    };
  }

  // ==================== FAVORITES APIs (Legacy - using SavedMovies) ====================

  async getFavorites(userId: string): Promise<FilmZoneResponse<SavedMovieDTO[]>> {
    return this.getSavedMoviesByUserID(parseInt(userId));
  }

  async addToFavorites(userId: string, movieId: string): Promise<FilmZoneResponse<SavedMovieDTO>> {
    return this.addToSavedMovies(parseInt(movieId));
  }

  async removeFromFavorites(userId: string, movieId: string): Promise<FilmZoneResponse<any>> {
    return this.removeFromSavedMovies(parseInt(movieId));
  }

  // ==================== PAYMENT APIs ====================

  /**
   * POST /api/payment/vnpay/checkout
   */
  async createVnPayCheckout(request: CreateVnPayCheckoutRequest): Promise<FilmZoneResponse<VnPayCheckoutResponse>> {
    const response = await this.request<any>('/api/payment/vnpay/checkout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    // Backend trả CheckoutResponseDto với field payUrl, map sang paymentUrl
    if (response && (response as any).data && !(response as any).data.paymentUrl && (response as any).data.payUrl) {
      (response as any).data = {
        paymentUrl: (response as any).data.payUrl,
        priceId: (response as any).data.priceId ?? request.priceId,
      };
    }
    return response as FilmZoneResponse<VnPayCheckoutResponse>;
  }

  /**
   * GET /api/payment/order/user/{userID}
   */
  async getPaymentOrdersByUser(userID: number): Promise<FilmZoneResponse<any[]>> {
    return this.request<any[]>(`/api/payment/order/user/${userID}`);
  }

  /**
   * GET /api/payment/subscription/user/{userID}
   * Lấy danh sách subscription của user
   */
  async getSubscriptionsByUser(userID: number): Promise<FilmZoneResponse<any[]>> {
    return this.request<any[]>(`/api/payment/subscription/user/${userID}`);
  }

  /**
   * POST /api/payment/subscription/cancel-subs?userID={userID}
   */
  async cancelSubscription(userID: number): Promise<FilmZoneResponse<any>> {
    return this.request<any>(`/api/payment/subscription/cancel-subs?userID=${userID}`, {
      method: 'POST',
    });
  }

  // ==================== WATCH HISTORY (Legacy - using WatchProgress) ====================

  async getWatchHistory(userId: string): Promise<FilmZoneResponse<WatchProgressDTO[]>> {
    return this.getWatchProgressByUserId(parseInt(userId));
  }

  async addToWatchHistory(userId: string, historyData: any): Promise<FilmZoneResponse<WatchProgressDTO>> {
    return this.createWatchProgress({
      userID: parseInt(userId) || 0,
      movieID: historyData.movieID,
      positionSeconds: historyData.positionSeconds || 0,
      durationSeconds: historyData.durationSeconds ?? null,
      sourceID: historyData.sourceID ?? null,
    });
  }

  async updateWatchHistory(
    userId: string,
    historyId: number,
    progress: number
  ): Promise<FilmZoneResponse<WatchProgressDTO>> {
    return this.updateWatchProgress({
      userID: parseInt(userId) || 0,
      movieID: historyId,
      sourceID: null,
      positionSeconds: progress,
      durationSeconds: null,
      watchProgressID: historyId,
    });
  }

}

// Create API instance
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://filmzone-api.koyeb.app';

export const filmzoneApi = new FilmZoneApi({
  baseURL: BASE_URL,
});

export default filmzoneApi;

