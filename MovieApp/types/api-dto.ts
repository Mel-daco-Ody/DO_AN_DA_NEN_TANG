// DTO Types for FilmZone API
// These types match the Swagger API specification

// FilmZone Backend Response Format
export interface FilmZoneResponse<T> {
  errorCode: number;
  errorMessage?: string;
  data?: T;
  success: boolean;
  timestamp?: string;
  requestId?: string;
  version?: string;
  serverTime?: string;
}

// Auth DTOs
export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  sessionId: number;
  deviceId: string;
  tokenExpiration: string;
  refreshTokenExpiration: string;
  user: UserDTO;
}

export interface UserDTO {
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
}

// Movie DTOs
export interface MovieDTO {
  movieID: number;
  slug: string;
  title: string;
  originalTitle?: string;
  description?: string;
  movieType: string; // movie | series
  image: string;
  status: string;
  releaseDate?: string;
  durationSeconds?: number;
  totalSeasons?: number;
  totalEpisodes?: number;
  year?: number;
  rated?: string;
  popularity?: number;
  regionID: number;
  createdAt: string;
  updatedAt: string;
  region?: RegionDTO;
  tags?: TagDTO[];
  cast?: CastDTO[];
  sources?: MovieSourceDTO[];
}

export interface CastDTO {
  personID: number;
  characterName?: string;
  role?: string;
  creditOrder?: number;
}

// Episode DTOs
export interface EpisodeDTO {
  episodeID: number;
  movieID: number;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  description?: string;
  synopsis?: string;
  durationSeconds?: number;
  thumbnail?: string;
  releaseDate?: string;
  sources?: EpisodeSourceDTO[];
}

export interface EpisodeSourceDTO {
  episodeSourceID: number;
  episodeID: number;
  sourceType: string;
  sourceUrl: string;
  quality?: string;
  language?: string;
}

// Tag, Region, Person DTOs
export interface TagDTO {
  tagID: number;
  tagName: string;
  tagDescription?: string;
}

export interface RegionDTO {
  regionID: number;
  regionName: string;
  regionCode?: string;
}

export interface PersonDTO {
  personID: number;
  fullName: string;
  avatar?: string;
  role?: string;
  career?: string;
}

// Watch Progress DTOs
export interface WatchProgressDTO {
  watchProgressID: number;
  userID: number;
  movieID: number;
  positionSeconds: number;
  durationSeconds?: number;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeWatchProgressDTO {
  episodeWatchProgressID: number;
  userID: number;
  episodeID: number;
  positionSeconds: number;
  durationSeconds?: number;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWatchProgressRequest {
  userID: number;
  movieID: number;
  sourceID?: number | null;
  positionSeconds: number;
  durationSeconds?: number | null;
}

export interface UpdateWatchProgressRequest {
  userID: number;
  movieID: number;
  sourceID?: number | null;
  positionSeconds: number;
  durationSeconds?: number | null;
  watchProgressID: number;
}

export interface CreateEpisodeWatchProgressRequest {
  userID: number;
  episodeID: number;
  episodeSourceID?: number | null;
  positionSeconds: number;
  durationSeconds?: number | null;
}

export interface UpdateEpisodeWatchProgressRequest {
  userID: number;
  episodeID: number;
  episodeSourceID?: number | null;
  positionSeconds: number;
  durationSeconds?: number | null;
  episodeWatchProgressID: number;
}

// Saved Movie DTOs
export interface SavedMovieDTO {
  savedMovieID: number;
  userID: number;
  movieID: number;
  addedDate: string;
  movie?: MovieDTO;
}

export interface CreateSavedMovieRequest {
  movieID: number;
}

// Comment DTOs
export interface CommentDTO {
  commentID: number;
  movieID: number;
  userID: number;
  userName?: string;
  content: string;
  parentID?: number;
  isEdited: boolean;
  likeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  movieID: number;
  userID: number;
  content: string;
  parentID?: number | null;
  likeCount?: number;
}

export interface UpdateCommentRequest {
  content: string;
}

// User Rating DTOs
export interface UserRatingDTO {
  userRatingID: number;
  userID: number;
  movieID: number;
  /** backend field: rating (some code uses stars) */
  rating: number;
  /** legacy alias */
  stars?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRatingRequest {
  userID: number;
  movieID: number;
  rating: number;
}

export interface UpdateUserRatingRequest {
  userRatingID: number;
  userID: number;
  movieID: number;
  rating: number;
}

// Search DTOs
export interface SearchRequest {
  q?: string;
  tagIds?: number[];
  regionCode?: string;
  personId?: number;
  page?: number;
  size?: number;
}

export interface SearchResultDTO {
  id: string;
  title: string;
  cover: string;
  categories: string[];
  rating: string;
  isSeries: boolean;
  year?: string;
  studio?: string;
}

// Movie Source DTO
export interface MovieSourceDTO {
  movieSourceID: number;
  movieID: number;
  sourceType: string;
  sourceUrl: string;
  quality?: string;
  language?: string;
}

// Password Change DTOs
export interface StartPasswordChangeRequest {
  email: string;
}

export interface VerifyEmailCodeRequest {
  email: string;
  code: string;
}

export interface CommitPasswordChangeRequest {
  ticket: string;
  oldPassword: string;
  newPassword: string;
}

// Payment DTOs
export interface CreateVnPayCheckoutRequest {
  priceId: number;
}

export interface VnPayCheckoutResponse {
  paymentUrl: string;
  priceId: number;
}

// Movie Subtitle DTOs
export interface MovieSubTitleDTO {
  movieSubTitleID: number;
  movieSourceID: number;
  language: string;
  subTitleName: string;
  linkSubTitle: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

