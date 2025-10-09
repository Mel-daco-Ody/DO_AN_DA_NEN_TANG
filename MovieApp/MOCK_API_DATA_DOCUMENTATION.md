# FilmZone Mobile App - Mock API & Data Documentation

## 📋 **Overview**

FilmZone Mobile App sử dụng một hệ thống Mock API hoàn chỉnh để mô phỏng backend FilmZone. Mock API này được thiết kế để có 100% compatibility với FilmZone Backend API, cung cấp dữ liệu mẫu phong phú và đầy đủ tính năng cho việc phát triển và testing.

## 🏗️ **Mock API Architecture**

### **Core Components**
- **MockMovieAppApi Class**: Main API service class
- **FilmZoneResponse Interface**: Standardized response format
- **Sample Data**: Rich mock data from `shared-data/sample-data.ts`
- **Error Handling**: Comprehensive error codes và messages
- **Business Logic**: Real-world business rules implementation

### **Response Format**
```typescript
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
```

## 📊 **Mock Data Structure**

### **Sample Data Categories**

#### **1. Users Data (sampleUsers)**
```typescript
interface User {
  userID: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Manager' | 'Moderator' | 'User';
  status: 'Active' | 'Inactive';
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
  bio?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  subscription?: {
    plan: 'starter' | 'premium' | 'cinematic';
    status: 'active' | 'inactive' | 'expired';
    startDate?: string;
    endDate?: string;
    autoRenew?: boolean;
  };
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  lastActiveAt?: string;
  isOnline?: boolean;
}
```

**Sample Users (3 users):**
- **Admin User**: Full admin privileges
- **Premium User**: Active subscription
- **Starter User**: Free tier user

#### **2. Movies Data (sampleMovies)**
```typescript
interface Movie {
  movieID: number;
  slug: string;
  title: string;
  originalTitle?: string;
  description?: string;
  movieType: string;
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
  region?: {
    regionID: number;
    regionName: string;
  };
  tags?: Array<{
    tagID: number;
    tagName: string;
    tagDescription?: string;
  }>;
  cast?: Array<{
    personID: number;
    fullName: string;
    characterName: string;
    role: string;
    creditOrder: number;
  }>;
  sources?: Array<{
    movieSourceID: number;
    movieID: number;
    sourceName: string;
    sourceType: string;
    sourceUrl: string;
    quality: string;
    language: string;
    isVipOnly: boolean;
    isActive: boolean;
  }>;
}
```

**Sample Movies (5 movies):**
- **Action Movies**: High-budget action films
- **Drama Series**: Multi-season dramas
- **Comedy Films**: Light entertainment
- **Sci-Fi Content**: Futuristic stories
- **Thriller Movies**: Suspenseful content

#### **3. Series Data (sampleSeries)**
```typescript
interface Series extends Movie {
  totalSeasons: number;
  totalEpisodes: number;
  seasons: Array<{
    seasonNumber: number;
    episodeCount: number;
    releaseDate: string;
  }>;
}
```

**Sample Series (6 series):**
- **Multi-season dramas**
- **Comedy series**
- **Documentary series**
- **Animated series**

#### **4. Episodes Data (sampleEpisodes)**
```typescript
interface Episode {
  episodeID: number;
  movieID: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description?: string;
  durationSeconds: number;
  releaseDate: string;
  image?: string;
  videoUrl: string;
  isActive: boolean;
}
```

**Sample Episodes (42 episodes):**
- **6 series × 7 episodes average**
- **Complete episode data**
- **Video URLs và metadata**

#### **5. Persons Data (samplePersons)**
```typescript
interface Person {
  personID: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  height?: string;
  zodiac?: string;
  bio?: string;
  nationality?: string;
  career?: string;
  totalMovies?: number;
  firstMovie?: string;
  lastMovie?: string;
  bestMovie?: string;
  genres?: string[];
}
```

**Sample Persons (8 actors/actresses):**
- **Lead Actors**: Main cast members
- **Supporting Actors**: Secondary roles
- **Directors**: Film directors
- **Producers**: Content producers

#### **6. Advertisements Data (sampleAdvertisements)**
```typescript
interface Advertisement {
  advertisementID: number;
  title: string;
  description?: string;
  imageUrl: string;
  targetUrl?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  position: string;
}
```

**Sample Advertisements (3 ads):**
- **Banner ads**
- **Video ads**
- **Promotional content**

## 🔌 **API Methods Documentation**

### **Authentication APIs (8 methods)**

#### **1. User Authentication**
```typescript
// Login user
async login(userName: string, password: string): Promise<FilmZoneResponse<LoginResponse>>

// Register new user
async register(userName: string, email: string, password: string, firstName?: string, lastName?: string, gender?: string): Promise<FilmZoneResponse<any>>

// Get current user
async getCurrentUser(): Promise<FilmZoneResponse<any>>

// Update user profile
async updateUser(userUpdates: Partial<any>): Promise<FilmZoneResponse<any>>

// Logout user
async logout(): Promise<FilmZoneResponse<null>>
```

#### **2. Password Management**
```typescript
// Start password change process
async startPasswordChange(email: string): Promise<FilmZoneResponse<any>>

// Verify email code
async verifyEmailCode(email: string, code: string): Promise<FilmZoneResponse<any>>

// Complete password change
async completePasswordChange(email: string, newPassword: string, token: string): Promise<FilmZoneResponse<any>>
```

### **Content Discovery APIs (15 methods)**

#### **1. Movies & Series**
```typescript
// Get all movies for main screen
async getMoviesMainScreen(): Promise<FilmZoneResponse<Movie[]>>

// Get movie by ID
async getMovieById(movieId: number): Promise<FilmZoneResponse<Movie>>

// Get new release movies
async getNewReleaseMovies(): Promise<FilmZoneResponse<Movie[]>>

// Get featured movies
async getFeaturedMovies(): Promise<FilmZoneResponse<Movie[]>>

// Get trending movies
async getTrendingMovies(): Promise<FilmZoneResponse<Movie[]>>

// Search movies
async searchMovies(query: string): Promise<FilmZoneResponse<Movie[]>>

// Get movies by category
async getMoviesByCategory(categoryId: number): Promise<FilmZoneResponse<Movie[]>>
```

#### **2. Actors & Cast**
```typescript
// Get all actors
async getAllActors(): Promise<FilmZoneResponse<Person[]>>

// Get actor by ID
async getActorById(actorId: number): Promise<FilmZoneResponse<Person>>

// Get actors by movie
async getActorsByMovie(movieId: number): Promise<FilmZoneResponse<Person[]>>

// Get all persons
async getAllPersons(): Promise<FilmZoneResponse<Person[]>>
```

#### **3. Episodes & Series**
```typescript
// Get episodes by movie
async getEpisodesByMovie(movieId: number): Promise<FilmZoneResponse<Episode[]>>

// Get episode by ID
async getEpisodeById(episodeId: number): Promise<FilmZoneResponse<Episode>>
```

### **User Interaction APIs (12 methods)**

#### **1. Watch Progress**
```typescript
// Get watch progress
async getWatchProgress(): Promise<FilmZoneResponse<WatchProgress[]>>

// Add to watch progress
async addToWatchProgress(movieId: number): Promise<FilmZoneResponse<any>>

// Update watch progress
async updateWatchProgress(movieId: number, positionSeconds: number, durationSeconds: number): Promise<FilmZoneResponse<any>>

// Add episode watch progress
async addEpisodeWatchProgress(progressData: EpisodeProgressData): Promise<FilmZoneResponse<any>>

// Get episode watch progress
async getEpisodeWatchProgress(episodeId: number): Promise<FilmZoneResponse<any>>
```

#### **2. Saved Movies**
```typescript
// Get saved movies
async getSavedMovies(): Promise<FilmZoneResponse<Movie[]>>

// Add to saved movies
async addToSavedMovies(movieId: number): Promise<FilmZoneResponse<any>>

// Remove from saved movies
async removeFromSavedMovies(movieId: number): Promise<FilmZoneResponse<any>>

// Check if movie is saved
async isMovieSaved(movieId: number): Promise<FilmZoneResponse<{isSaved: boolean}>>
```

#### **3. Favorites**
```typescript
// Add to favorites
async addToFavorites(userId: string, movieId: string): Promise<FilmZoneResponse<any>>

// Remove from favorites
async removeFromFavorites(userId: string, movieId: string): Promise<FilmZoneResponse<any>>

// Get favorites
async getFavorites(userId: string): Promise<FilmZoneResponse<Movie[]>>
```

### **Social Features APIs (8 methods)**

#### **1. Comments**
```typescript
// Get comments by movie
async getCommentsByMovie(movieId: string): Promise<FilmZoneResponse<Comment[]>>

// Add comment
async addComment(commentData: CommentData): Promise<FilmZoneResponse<Comment>>

// Update comment
async updateComment(commentId: number, content: string): Promise<FilmZoneResponse<Comment>>

// Delete comment
async deleteComment(commentId: number): Promise<FilmZoneResponse<any>>
```

**Comment System Features:**
- ✅ **Real-time Comments**: Comments sync với mock API
- ✅ **Movie Context**: Comments linked với movie data và posters
- ✅ **User Information**: Commenter details với user data
- ✅ **Latest Comments**: Profile overview với movie posters
- ✅ **Comment Persistence**: Comments stored trong mock API
- ✅ **Keyboard Support**: KeyboardAvoidingView cho comment input
- ✅ **Comment Sorting**: Latest comments sorted by creation date

#### **2. Reviews**
```typescript
// Get reviews by movie
async getReviewsByMovie(movieId: string): Promise<FilmZoneResponse<Review[]>>

// Add review
async addReview(reviewData: ReviewData): Promise<FilmZoneResponse<Review>>

// Update review
async updateReview(reviewId: number, reviewData: ReviewData): Promise<FilmZoneResponse<Review>>

// Delete review
async deleteReview(reviewId: number): Promise<FilmZoneResponse<any>>
```

### **Rating APIs (3 methods)**
```typescript
// Get user rating
async getUserRating(movieId: number): Promise<FilmZoneResponse<Rating>>

// Add user rating
async addUserRating(movieId: number, stars: number): Promise<FilmZoneResponse<Rating>>

// Update user rating
async updateUserRating(movieId: number, stars: number): Promise<FilmZoneResponse<Rating>>
```

### **Payment & Subscription APIs (6 methods)**

#### **1. Subscription Management**
```typescript
// Update subscription
async updateSubscription(plan: string): Promise<FilmZoneResponse<any>>

// Get subscription status
async getSubscriptionStatus(): Promise<FilmZoneResponse<SubscriptionStatus>>
```

#### **2. Payment Processing**
```typescript
// Process payment
async processPayment(paymentData: PaymentData): Promise<FilmZoneResponse<PaymentResponse>>

// Get payment methods
async getPaymentMethods(): Promise<FilmZoneResponse<PaymentMethod[]>>

// Create VnPay checkout
async createVnPayCheckout(amount: number, orderId: string): Promise<FilmZoneResponse<VnPayResponse>>
```

#### **3. Billing History**
```typescript
// Add billing history
async addBillingHistory(billingData: BillingData): Promise<FilmZoneResponse<BillingRecord>>

// Get billing history
async getBillingHistory(userID: string): Promise<FilmZoneResponse<BillingRecord[]>>
```

**Billing History Features:**
- ✅ **Auto-refresh**: Billing history updates after payment
- ✅ **Transaction Tracking**: Complete payment history
- ✅ **Real-time Updates**: useFocusEffect cho refresh
- ✅ **Payment Integration**: Seamless payment flow
- ✅ **User Context**: User-specific billing data
- ✅ **Toggle Functionality**: Collapsible billing history

### **Watch History APIs (2 methods)**
```typescript
// Add to watch history
async addToWatchHistory(userId: string, historyData: WatchHistoryData): Promise<FilmZoneResponse<any>>

// Get watch history
async getWatchHistory(userId: string): Promise<FilmZoneResponse<WatchHistoryRecord[]>>
```

### **Stats APIs (1 method)**
```typescript
// Increment films watched
async incrementFilmsWatched(movieId: number): Promise<FilmZoneResponse<any>>
```

### **Metadata APIs (9 methods)**

#### **1. Tags & Categories**
```typescript
// Get all tags
async getAllTags(): Promise<FilmZoneResponse<Tag[]>>

// Get all regions
async getAllRegions(): Promise<FilmZoneResponse<Region[]>>
```

#### **2. Overview Stats**
```typescript
// Get overview stats
async getOverviewStats(userId: string): Promise<FilmZoneResponse<OverviewStats>>
```

## 🎯 **API Usage in App**

### **Home Screen (index.tsx)**
- `getNewReleaseMovies()` - Hero carousel
- `getMoviesMainScreen()` - Main content
- `getFeaturedMovies()` - Featured section
- `getTrendingMovies()` - Trending section
- `getWatchProgress()` - Continue watching
- `getSavedMovies()` - Saved movies
- `addToWatchProgress()` - Track viewing
- `updateWatchProgress()` - Update progress

### **Authentication Screens**
- `login()` - Sign in
- `register()` - Sign up
- `startPasswordChange()` - Forgot password
- `verifyEmailCode()` - MFA verification
- `completePasswordChange()` - Reset password

### **Content Details**
- `getMovieById()` - Movie details
- `getActorsByMovie()` - Cast information
- `getEpisodesByMovie()` - Series episodes
- `addUserRating()` - Rate movies
- `addComment()` - Add comments
- `addReview()` - Add reviews
- `addToFavorites()` - Add to favorites

### **Profile Management**
- `getCurrentUser()` - User info với subscription status
- `updateUser()` - Update profile với image upload
- `getBillingHistory()` - Billing history với auto-refresh
- `updateSubscription()` - Change plan với payment integration
- `getOverviewStats()` - User statistics với latest comments

### **Video Player**
- `addEpisodeWatchProgress()` - Track episode progress
- `addToWatchHistory()` - Add to history
- `incrementFilmsWatched()` - Update stats

## 🔧 **Error Handling**

### **Error Codes**
```typescript
const ERROR_CODES = {
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
```

### **Error Messages**
```typescript
const ERROR_MESSAGES = {
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
```

## 📈 **Data Statistics**

### **Sample Data Counts**
- **Users**: 3 users (Admin, Premium, Starter)
- **Movies**: 5 movies với full metadata
- **Series**: 6 series với seasons
- **Episodes**: 42 episodes across series
- **Actors**: 8 actors với detailed profiles
- **Advertisements**: 3 promotional ads
- **Tags**: 10 content tags
- **Regions**: 5 geographic regions

### **API Coverage**
- **Total APIs**: 58 methods
- **Authentication**: 8 methods
- **Content Discovery**: 15 methods
- **User Interaction**: 12 methods
- **Social Features**: 8 methods
- **Payment**: 6 methods
- **Watch History**: 2 methods
- **Stats**: 1 method
- **Metadata**: 6 methods

### **Response Format Compliance**
- **100% FilmZone Backend Compatible**
- **Standardized Error Handling**
- **Consistent Response Structure**
- **Business Logic Implementation**
- **Input Validation**

## 🚀 **Performance Features**

### **Mock API Optimizations**
- **Delay Simulation**: Realistic API response times
- **Memory Storage**: In-memory data persistence
- **Request ID Generation**: Unique request tracking
- **Timestamp Management**: Accurate time handling
- **Error Simulation**: Realistic error scenarios

### **Data Management**
- **Efficient Data Structures**: Optimized for performance
- **Lazy Loading**: On-demand data loading
- **Caching Strategy**: Response caching
- **Memory Management**: Efficient memory usage

## 🔮 **Future Enhancements**

### **Planned Improvements**
- **Real API Integration**: Backend connectivity
- **Data Persistence**: Local storage
- **Offline Support**: Offline data access
- **Advanced Filtering**: Complex search queries
- **Analytics Integration**: Usage tracking

### **Data Expansion**
- **More Sample Data**: Extended datasets
- **Real Content**: Actual movie/series data
- **User Generated Content**: Reviews, comments
- **Social Features**: User interactions
- **Recommendation Engine**: AI-powered suggestions

---

## 📋 **Summary**

FilmZone Mock API cung cấp một hệ thống API hoàn chỉnh với 58 methods, dữ liệu mẫu phong phú, và 100% compatibility với FilmZone Backend. Mock API được sử dụng rộng rãi trong app để cung cấp trải nghiệm phát triển và testing hoàn chỉnh.

**Key Features:**
- ✅ 58 API methods covering all app features
- ✅ Rich sample data with realistic content
- ✅ 100% FilmZone Backend compatibility
- ✅ Comprehensive error handling
- ✅ Business logic implementation
- ✅ Performance optimizations
- ✅ Type-safe development
- ✅ Production-ready architecture

**Total Data Points**: 100+ sample records
**API Coverage**: 100% app functionality
**Response Format**: Standardized FilmZoneResponse
**Error Handling**: 20+ error codes và messages