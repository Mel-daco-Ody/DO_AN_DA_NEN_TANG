# BÁO CÁO PHÂN TÍCH CHI TIẾT HỆ THỐNG FLIXGO MOVIE APP

## TỔNG QUAN DỰ ÁN

**FlixGo Movie App** là một ứng dụng streaming phim và TV show được phát triển bằng React Native với Expo framework. Đây là một ứng dụng di động đa nền tảng (iOS, Android, Web) với giao diện hiện đại và tính năng phong phú.

### Thông tin cơ bản:
- **Tên dự án**: MovieApp
- **Phiên bản**: 1.0.0
- **Package ID**: com.mel_daco_ody.MovieApp
- **Framework**: React Native với Expo SDK 54
- **Ngôn ngữ**: TypeScript
- **Kiến trúc**: Component-based với Context API

---

## KIẾN TRÚC VÀ CẤU TRÚC DỰ ÁN

### 1. Cấu trúc thư mục chính

```
FlixgoMobile/MovieApp/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   ├── auth/              # Authentication screens
│   ├── details/           # Movie/Series details
│   ├── player/            # Video player
│   └── [other pages]      # Various app screens
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── services/              # API and business logic
├── hooks/                 # Custom React hooks
├── constants/             # App constants
├── assets/                # Images, fonts, icons
└── android/               # Android-specific code
```

### 2. Routing System (Expo Router)

Ứng dụng sử dụng **Expo Router** với file-based routing:

- **Root Layout** (`app/_layout.tsx`): Cấu hình providers và navigation stack
- **Tab Layout** (`app/(tabs)/_layout.tsx`): Bottom tab navigation
- **Dynamic Routes**: 
  - `/details/movie/[id]` - Chi tiết phim
  - `/details/series/[id]` - Chi tiết series
  - `/player/[id]` - Video player
  - `/actor/[id]` - Thông tin diễn viên
  - `/category/[genre]` - Danh mục theo thể loại

---

## THƯ VIỆN VÀ DEPENDENCIES

### Core Dependencies

#### React Native & Expo Core
- **expo**: ~54.0.0 - Expo SDK chính
- **react**: 19.1.0 - React framework
- **react-native**: 0.81.4 - React Native core
- **expo-router**: ~6.0.1 - File-based routing

#### UI & Navigation
- **@react-navigation/native**: ^7.1.6 - Navigation core
- **@react-navigation/bottom-tabs**: ^7.3.10 - Bottom tab navigation
- **@expo/vector-icons**: ^15.0.2 - Icon library
- **react-native-gesture-handler**: ~2.28.0 - Gesture handling
- **react-native-reanimated**: ^4.1.0 - Advanced animations

#### Media & Assets
- **expo-av**: ~16.0.7 - Audio/Video playback
- **expo-image**: ~3.0.8 - Optimized image component
- **expo-image-picker**: ~17.0.8 - Image selection
- **react-native-webview**: 13.15.0 - Web content display

#### Storage & State
- **@react-native-async-storage/async-storage**: ^2.2.0 - Local storage
- **expo-constants**: ~18.0.8 - App constants
- **expo-haptics**: ~15.0.7 - Device haptic feedback

#### Development Tools
- **typescript**: ~5.8.3 - TypeScript support
- **eslint**: ^9.25.0 - Code linting
- **@babel/core**: ^7.25.2 - JavaScript compilation

---

## STATE MANAGEMENT VÀ CONTEXT SYSTEM

Ứng dụng sử dụng **React Context API** để quản lý state toàn cục với 6 context providers chính:

### 1. AuthContext
**File**: `contexts/AuthContext.tsx`
- **Chức năng**: Quản lý trạng thái đăng nhập người dùng
- **State**: 
  - `isAuthenticated`: boolean
  - `user`: User object (id, name, email, avatar)
- **Methods**: `signIn()`, `signOut()`, `updateUser()`

### 2. ThemeContext
**File**: `contexts/ThemeContext.tsx`
- **Chức năng**: Quản lý theme (dark/light mode)
- **Features**:
  - Persistent theme preference với AsyncStorage
  - Light/Dark theme colors
  - `toggleTheme()` method
- **Colors**: Background, surface, primary, text colors

### 3. LanguageContext
**File**: `contexts/LanguageContext.tsx`
- **Chức năng**: Đa ngôn ngữ (English/Vietnamese)
- **Features**:
  - Translation system với `t()` function
  - Persistent language preference
  - Comprehensive translation keys

### 4. SubscriptionContext
**File**: `contexts/SubscriptionContext.tsx`
- **Chức năng**: Quản lý gói đăng ký
- **Plans**: Starter (Free), Premium ($19.99), Cinematic ($39.99)
- **State**: Current plan, expiry date, auto-renew

### 5. MovieBoxContext
**File**: `contexts/MovieBoxContext.tsx`
- **Chức năng**: Quản lý danh sách yêu thích
- **Features**:
  - Add/remove movies từ watchlist
  - Persistent storage với AsyncStorage
  - `isInMovieBox()` check function

### 6. WatchHistoryContext
**File**: `contexts/WatchHistoryContext.tsx`
- **Chức năng**: Lịch sử xem phim
- **Features**:
  - Track progress của episodes
  - Resume watching functionality
  - Episode-based history tracking

---

## COMPONENTS VÀ UI ELEMENTS

### Core Components

#### 1. Header Component
**File**: `components/Header.tsx` (448 lines)
- **Chức năng**: Navigation header với search và menu
- **Features**:
  - Search functionality với real-time filtering
  - Language switcher (EN/VI)
  - User authentication status
  - MovieBox counter
  - Responsive design

#### 2. ImageWithPlaceholder
**File**: `components/ImageWithPlaceholder.tsx`
- **Chức năng**: Image component với error handling
- **Features**:
  - Loading state
  - Error fallback với custom text
  - Red border option
  - Optimized image loading

#### 3. FlixGoLogo
**File**: `components/FlixGoLogo.tsx`
- **Chức năng**: Brand logo component
- **Features**:
  - SVG logo từ remote URL
  - Consistent sizing
  - Optional border styling

#### 4. WaveAnimation
**File**: `components/WaveAnimation.tsx`
- **Chức năng**: Animated wave effect
- **Usage**: Video player play button animation

---

## SCREENS VÀ PAGES

### 1. Home Screen (`app/(tabs)/index.tsx`)
**Tính năng chính**:
- Hero carousel với 3 slides
- Recently Updated section với filtering
- Now Watching carousel
- Subscription plans display
- Partners section
- Advanced filtering modal (Genre, Year, Studio)

**State Management**:
- Filter states (genre, year, studio)
- Expandable content view
- MovieBox integration

### 2. Authentication Screens

#### Sign In (`app/auth/signin.tsx`)
- Email/password form
- Remember me checkbox
- Demo credentials: `test@demo.com` / `123456`
- Background image với overlay
- Form validation

#### Sign Up (`app/auth/signup.tsx`)
- Registration form
- Terms acceptance
- Password confirmation

#### Forgot Password (`app/auth/forgot.tsx`)
- Password reset form
- Email validation

### 3. Movie Details (`app/details/movie/[id].tsx`)
**Tính năng**:
- Full-screen movie poster background
- Play button với wave animation
- Movie metadata (year, duration, country, cast)
- Like/Unlike system
- Comments section với real-time updates
- Category và actor links
- Advertisement banner

### 4. Video Player (`app/player/[id].tsx`)
**Tính năng nâng cao**:
- Full-screen video playback
- Landscape orientation lock
- Custom video controls:
  - Play/pause với wave animation
  - Progress bar với seek functionality
  - Volume control với slider
  - Subtitle selection (10 languages)
  - 10-second skip forward/backward
- Auto-hide controls (3-second timeout)
- Watch history integration
- Haptic feedback

### 5. Series Details (`app/details/series/[id].tsx`)
- Episode list với season organization
- Episode progress tracking
- Resume watching functionality
- Series metadata display

---

## SERVICES VÀ API INTEGRATION

### Authentication Service
**File**: `services/auth.ts`
- **Demo Implementation**: Hardcoded user credentials
- **Methods**:
  - `signInWithEmailPassword()`: Email/password authentication
  - `getCurrentUser()`: Get current user
  - `signOut()`: Sign out user

**Production Notes**: Cần tích hợp với backend API thực tế

---

## ANDROID CONFIGURATION

### Build Configuration
**File**: `android/app/build.gradle`
- **Package**: com.mel_daco_ody.MovieApp
- **Min SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)
- **Build Tools**: Latest stable
- **Signing**: Debug keystore configured

### Permissions (`AndroidManifest.xml`)
- `INTERNET`: Network access
- `READ_EXTERNAL_STORAGE`: File access
- `WRITE_EXTERNAL_STORAGE`: File writing
- `VIBRATE`: Haptic feedback
- `SYSTEM_ALERT_WINDOW`: Overlay windows

### App Configuration
- **Orientation**: Portrait mode
- **Theme**: Custom splash screen theme
- **Deep Linking**: movieapp:// scheme support

---

## TÍNH NĂNG NỔI BẬT

### 1. Advanced Video Player
- Custom video controls với animations
- Multi-language subtitle support
- Volume control với slider
- Seek functionality
- Landscape orientation
- Progress tracking

### 2. Smart Filtering System
- Multi-criteria filtering (Genre, Year, Studio)
- Real-time search với debouncing
- Expandable/collapsible content views
- Filter persistence

### 3. Internationalization
- Complete Vietnamese/English translation
- Persistent language preference
- Context-aware translations

### 4. State Persistence
- AsyncStorage integration
- Theme preferences
- Language settings
- MovieBox và WatchHistory
- User authentication state

### 5. Responsive Design
- Adaptive layouts cho different screen sizes
- Grid system với dynamic columns
- Touch-friendly interactions
- Haptic feedback integration

---

## DATA STRUCTURE

### Media Items
```typescript
interface MediaItem {
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
}
```

### User Data
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
```

### Watch History
```typescript
interface WatchHistoryItem {
  seriesId: string;
  seriesTitle: string;
  season: number;
  episode: number;
  episodeTitle: string;
  episodeDescription: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  watchedAt: number;
  progress: number;
}
```

---

## PERFORMANCE OPTIMIZATIONS

### 1. Image Optimization
- `expo-image` với caching
- Placeholder components
- Error handling
- Lazy loading

### 2. State Management
- Context optimization
- Memoization với `useMemo`
- Callback optimization với `useCallback`

### 3. Navigation
- Expo Router với file-based routing
- Lazy loading của screens
- Optimized navigation stack

### 4. Memory Management
- Proper cleanup trong useEffect
- Video player resource management
- Animation cleanup

---

## SECURITY CONSIDERATIONS

### Current Implementation
- Basic authentication với hardcoded credentials
- No sensitive data exposure
- Proper input validation

### Production Recommendations
- Implement proper authentication với JWT
- Add API rate limiting
- Implement data encryption
- Add security headers
- User input sanitization

---

## DEMO VÀ TESTING TECHNIQUES

### 1. Demo Data Sources

#### Video Content
- **Primary Source**: Google Cloud Storage sample videos
  - `BigBuckBunny.mp4` - Main demo video
  - `ElephantsDream.mp4` - Alternative content
  - `ForBiggerBlazes.mp4` - Action sequences
  - `ForBiggerEscapes.mp4` - Adventure content
  - `ForBiggerFun.mp4` - Comedy content
  - `ForBiggerJoyrides.mp4` - Thriller content
  - `ForBiggerMeltdowns.mp4` - Drama content
  - `Sintel.mp4` - Fantasy content

#### Image Assets
- **Movie Covers**: `https://flixgo.volkovdesign.com/main/img/covers/1.png` đến `19.png`
- **Background Images**: `https://flixgo.volkovdesign.com/main/img/bg/slide__bg-1.jpg` đến `3.jpg`
- **Logo**: `https://flixgo.volkovdesign.com/main/img/logo.svg`
- **Authentication Background**: `https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg`

#### Avatar Generation
- **Default Avatar Service**: `https://i.pravatar.cc/200`
- **Fallback System**: 
  - Nếu không có avatar → hiển thị chữ cái đầu của tên
  - User có thể upload từ gallery hoặc camera
  - Placeholder với màu đỏ (#e50914) và chữ trắng

### 2. Mock Data Structure

#### Hero Slides Data
```typescript
const heroSlides = [
  {
    id: 'h1',
    title: 'Savage Beauty',
    rating: '9.8',
    bg: { uri: 'https://flixgo.volkovdesign.com/main/img/bg/slide__bg-1.jpg' },
    text: "A brilliant scientist discovers...",
    year: '2024',
    duration: '142 min',
    country: 'USA',
    cast: 'Emma Stone, Ryan Gosling',
    description: 'Một nhà khoa học tài năng...',
    categories: ['Action', 'Sci-Fi', 'Drama'],
    isSeries: false,
  }
  // ... 2 more slides
];
```

#### Media Items Database
- **Total Items**: 15+ movies và series
- **Categories**: Action, Comedy, Drama, Romance, Thriller, Mystery, Fantasy, Adventure, Music
- **Studios**: Netflix, Disney+, HBO Max, Amazon Prime, Apple TV+, Paramount+, Hulu, Peacock, Showtime
- **Years**: 2000-2024 (comprehensive range)

#### Series Episodes Data
```typescript
const mockSeasonsData = {
  '2': { // Undercurrents
    seasons: [
      {
        id: 1,
        name: 'Season 1',
        episodes: [
          { 
            id: 1, 
            title: 'The Beginning', 
            duration: '45 min', 
            description: 'Khởi đầu của câu chuyện...',
            thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/2.png',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          }
          // ... 7 more episodes
        ]
      }
    ]
  }
  // ... more series
};
```

### 3. Authentication Demo

#### Test Credentials
- **Email**: `test@demo.com`
- **Password**: `123456`
- **User Info**: 
  - ID: 'u1'
  - Name: 'Jane Tester'
  - Email: 'test@demo.com'

#### Demo User Features
- Automatic login với hardcoded credentials
- Profile management với mock data
- Subscription plan switching
- Theme và language preferences

### 4. Error Handling & Fallbacks

#### Image Loading Strategy
```typescript
// ImageWithPlaceholder component
const handleError = () => {
  setHasError(true);
  setIsLoading(false);
};

// Fallback display
if (hasError) {
  return (
    <View style={[styles.placeholder, style, showRedBorder && styles.withBorder]}>
      <Text style={styles.errorText}>{errorText}</Text>
    </View>
  );
}
```

#### Video Fallback
```typescript
// Video player fallback
const videoUri = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
```

### 5. Testing Techniques

#### Manual Testing Scenarios
1. **Authentication Flow**
   - Sign in với demo credentials
   - Profile management
   - Theme switching
   - Language switching

2. **Content Discovery**
   - Browse movies và series
   - Search functionality
   - Filter by genre, year, studio
   - Add to MovieBox

3. **Video Playback**
   - Play different video sources
   - Test controls (play/pause, seek, volume)
   - Subtitle switching
   - Orientation changes

4. **State Persistence**
   - Theme preferences
   - Language settings
   - MovieBox items
   - Watch history

#### Demo Data Validation
- **Image URLs**: Tất cả đều accessible và load được
- **Video URLs**: Google Cloud Storage videos stable và reliable
- **Content Metadata**: Consistent và realistic
- **User Interactions**: Smooth và responsive

### 6. Performance Testing

#### Image Loading Performance
- **Caching**: Expo Image với built-in caching
- **Placeholder**: Loading states cho better UX
- **Error Handling**: Graceful fallbacks

#### Video Performance
- **Streaming**: Smooth playback với Google Cloud Storage
- **Controls**: Responsive touch interactions
- **Memory**: Proper cleanup khi unmount

#### State Management
- **Context Updates**: Efficient re-renders
- **AsyncStorage**: Fast read/write operations
- **Navigation**: Smooth transitions

---

## TESTING STRATEGY

### Current State
- **Manual Testing**: Comprehensive với demo data
- **Demo Credentials**: `test@demo.com` / `123456`
- **Content Sources**: Google Cloud Storage + FlixGo CDN
- **Avatar System**: Pravatar.cc + fallback initials

### Recommended Testing
- Unit tests cho utility functions
- Integration tests cho Context providers
- E2E tests cho critical user flows
- Performance testing cho video playback
- Image loading và caching tests

---

## DEPLOYMENT VÀ BUILD

### Development
```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

### Production Build
- Android APK generation
- iOS App Store preparation
- Web deployment với static export

---

## FUTURE ENHANCEMENTS

### 1. Backend Integration
- Real API endpoints
- User authentication server
- Content management system
- Payment processing

### 2. Advanced Features
- Offline viewing
- Social features (sharing, reviews)
- Recommendation engine
- Live streaming support

### 3. Performance Improvements
- Code splitting
- Bundle optimization
- Caching strategies
- CDN integration

### 4. Analytics
- User behavior tracking
- Content performance metrics
- Error monitoring
- Performance monitoring

---

## KẾT LUẬN

### Điểm đã đạt được:
- ✅ Kiến trúc code clean và maintainable
- ✅ UI/UX hiện đại và responsive
- ✅ State management tốt với Context API
- ✅ Video player với tính năng đầy đủ
- ✅ Internationalization support
- ✅ Cross-platform compatibility

### Cần cải thiện:
- 🔄 Backend API integration
- 🔄 Authentication security
- 🔄 Automated testing
- 🔄 Performance monitoring
- 🔄 Error handling

Ứng dụng có tiềm năng phát triển thành một platform streaming hoàn chỉnh sau khi đã tích hợp backend và các tính năng nâng cao.

---
