// Sample Data for FilmZone Application
// This file contains sample data for development and testing purposes

export interface User {
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
  phone?: string;
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
  timeZone?: string;
}

export type AuthUser = User;

export interface Movie {
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
    quality?: string;
    language?: string;
    isVipOnly: boolean;
    isActive: boolean;
  }>;
  actors?: Array<{
    fullName: string;
    avatar?: string;
    personID: number;
    role: string;
    characterName?: string;
    creditOrder?: number;
  }>;
  images?: Array<{
    movieImageID: number;
    imageUrl: string;
  }>;
}

export interface Episode {
  episodeID: number;
  movieID: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  synopsis?: string;
  description?: string;
  durationSeconds?: number;
  releaseDate?: string;
  createdAt: string;
  updatedAt: string;
  sources?: Array<{
    episodeSourceID: number;
    episodeID: number;
    sourceName: string;
    sourceType: string;
    sourceUrl: string;
    quality?: string;
    language?: string;
    isVipOnly: boolean;
    isActive: boolean;
  }>;
}

export interface Advertisement {
  adID: number;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  adType: 'banner' | 'popup' | 'video';
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  isActive: boolean;
  startDate: string;
  endDate?: string;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

// Sample Users
export const sampleUsers: User[] = [
  {
    userID: 1,
    userName: 'admin',
    firstName: 'Admin',
    lastName: 'System',
    name: 'Admin System',
    email: 'admin@flixgo.com',
    password: 'admin123',
    role: 'Admin',
    status: 'Active',
    avatar: '',
    profilePicture: '',
    phone: '+84901234567',
    phoneNumber: '+84901234567',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    address: 'Ho Chi Minh City, Vietnam',
    city: 'Ho Chi Minh City',
    country: 'Vietnam',
    postalCode: '700000',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    preferences: {
      theme: 'dark',
      notifications: true,
      autoPlay: true
    },
    bio: 'System Administrator',
    isEmailVerified: true,
    isPhoneVerified: true,
    twoFactorEnabled: false,
    subscription: {
      plan: 'premium',
      status: 'active',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2025-01-01T00:00:00Z',
      autoRenew: true,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
    lastLogin: '2024-12-20T10:30:00Z',
    lastActiveAt: '2024-12-20T10:30:00Z',
    isOnline: true,
    timeZone: 'Asia/Ho_Chi_Minh'
  },
  {
    userID: 2,
    userName: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'User',
    status: 'Active',
    avatar: '',
    profilePicture: '',
    phone: '+84901234568',
    phoneNumber: '+84901234568',
    dateOfBirth: '1995-05-15',
    gender: 'Male',
    address: 'Hanoi, Vietnam',
    city: 'Hanoi',
    country: 'Vietnam',
    postalCode: '100000',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    preferences: {
      theme: 'light',
      notifications: true,
      autoPlay: false
    },
    bio: 'Movie enthusiast',
    isEmailVerified: true,
    isPhoneVerified: false,
    twoFactorEnabled: false,
    subscription: {
      plan: 'starter',
      status: 'active',
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2025-06-01T00:00:00Z',
      autoRenew: true,
    },
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-12-20T09:15:00Z',
    lastLogin: '2024-12-20T09:15:00Z',
    lastActiveAt: '2024-12-20T09:15:00Z',
    isOnline: true,
    timeZone: 'Asia/Ho_Chi_Minh'
  },
  {
    userID: 3,
    userName: 'user2',
    firstName: 'Jane',
    lastName: 'Smith',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    role: 'User',
    status: 'Active',
    avatar: '',
    profilePicture: '',
    phone: '+84901234569',
    phoneNumber: '+84901234569',
    dateOfBirth: '1992-08-22',
    gender: 'Female',
    address: 'Da Nang, Vietnam',
    city: 'Da Nang',
    country: 'Vietnam',
    postalCode: '500000',
    language: 'en',
    timezone: 'Asia/Ho_Chi_Minh',
    preferences: {
      theme: 'dark',
      notifications: false,
      autoPlay: true
    },
    bio: 'Series lover',
    isEmailVerified: false,
    isPhoneVerified: true,
    twoFactorEnabled: true,
    subscription: {
      plan: 'cinematic',
      status: 'active',
      startDate: '2024-03-01T00:00:00Z',
      endDate: '2025-03-01T00:00:00Z',
      autoRenew: false,
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-12-20T08:45:00Z',
    lastLogin: '2024-12-20T08:45:00Z',
    lastActiveAt: '2024-12-20T08:45:00Z',
    isOnline: false,
    timeZone: 'Asia/Ho_Chi_Minh'
  }
];

// Sample Movies (5 single movies)
export const sampleMovies: Movie[] = [
  {
    movieID: 1,
    slug: 'avatar-the-way-of-water',
    title: 'Avatar: The Way of Water',
    originalTitle: 'Avatar: The Way of Water',
    description: 'Jake Sully và gia đình của anh đang khám phá những vùng biển của Pandora khi một mối đe dọa quen thuộc quay trở lại để hoàn thành những gì đã bắt đầu trước đây.',
    movieType: 'movie',
    image: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    status: 'completed',
    releaseDate: '2022-12-16',
    durationSeconds: 19200,
    year: 2022,
    rated: 'PG-13',
    popularity: 8.5,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 1, tagName: 'Action', tagDescription: 'Action movies' },
      { tagID: 2, tagName: 'Sci-Fi', tagDescription: 'Science Fiction' },
      { tagID: 3, tagName: 'Adventure', tagDescription: 'Adventure movies' }
    ],
    cast: [
      { personID: 1, fullName: 'Michelle Rodriguez', characterName: 'Neytiri', role: 'Lead', creditOrder: 1 },
      { personID: 2, fullName: 'Vin Diesel', characterName: 'Jake Sully', role: 'Lead', creditOrder: 2 },
      { personID: 3, fullName: 'Paul Walker', characterName: 'Spider', role: 'Supporting', creditOrder: 3 }
    ],
    sources: [
      {
        movieSourceID: 1,
        movieID: 1,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/avatar2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Sam Worthington', avatar: 'https://via.placeholder.com/100', personID: 1, role: 'actor', characterName: 'Jake Sully', creditOrder: 1 },
      { fullName: 'Zoe Saldana', avatar: 'https://via.placeholder.com/100', personID: 2, role: 'actress', characterName: 'Neytiri', creditOrder: 2 }
    ]
  },
  {
    movieID: 2,
    slug: 'top-gun-maverick',
    title: 'Top Gun: Maverick',
    originalTitle: 'Top Gun: Maverick',
    description: 'Sau hơn ba mươi năm phục vụ như một trong những phi công giỏi nhất của Hải quân, Pete "Maverick" Mitchell đang ở nơi anh thuộc về.',
    movieType: 'movie',
    image: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
    status: 'completed',
    releaseDate: '2022-05-27',
    durationSeconds: 8100,
    year: 2022,
    rated: 'PG-13',
    popularity: 8.2,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 1, tagName: 'Action', tagDescription: 'Action movies' },
      { tagID: 4, tagName: 'Drama', tagDescription: 'Drama movies' }
    ],
    cast: [
      { personID: 4, fullName: 'Dwayne Johnson', characterName: 'Pete Maverick', role: 'Lead', creditOrder: 1 },
      { personID: 5, fullName: 'Jason Statham', characterName: 'Rooster', role: 'Supporting', creditOrder: 2 },
      { personID: 6, fullName: 'Gal Gadot', characterName: 'Penny', role: 'Supporting', creditOrder: 3 }
    ],
    sources: [
      {
        movieSourceID: 2,
        movieID: 2,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/topgun2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Tom Cruise', avatar: 'https://via.placeholder.com/100', personID: 3, role: 'actor', characterName: 'Pete "Maverick" Mitchell', creditOrder: 1 },
      { fullName: 'Miles Teller', avatar: 'https://via.placeholder.com/100', personID: 4, role: 'actor', characterName: 'Bradley "Rooster" Bradshaw', creditOrder: 2 }
    ]
  },
  {
    movieID: 3,
    slug: 'spider-man-no-way-home',
    title: 'Spider-Man: No Way Home',
    originalTitle: 'Spider-Man: No Way Home',
    description: 'Peter Parker được tiết lộ danh tính là Spider-Man và không thể tách rời cuộc sống bình thường khỏi trách nhiệm siêu anh hùng.',
    movieType: 'movie',
    image: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    status: 'completed',
    releaseDate: '2021-12-17',
    durationSeconds: 9000,
    year: 2021,
    rated: 'PG-13',
    popularity: 8.8,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 1, tagName: 'Action', tagDescription: 'Action movies' },
      { tagID: 5, tagName: 'Superhero', tagDescription: 'Superhero movies' }
    ],
    cast: [
      { personID: 7, fullName: 'Ryan Reynolds', characterName: 'Peter Parker', role: 'Lead', creditOrder: 1 },
      { personID: 8, fullName: 'Scarlett Johansson', characterName: 'MJ', role: 'Supporting', creditOrder: 2 },
      { personID: 1, fullName: 'Michelle Rodriguez', characterName: 'Aunt May', role: 'Supporting', creditOrder: 3 }
    ],
    sources: [
      {
        movieSourceID: 3,
        movieID: 3,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/spiderman3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Tom Holland', avatar: 'https://via.placeholder.com/100', personID: 5, role: 'actor', characterName: 'Peter Parker / Spider-Man', creditOrder: 1 },
      { fullName: 'Zendaya', avatar: 'https://via.placeholder.com/100', personID: 6, role: 'actress', characterName: 'MJ', creditOrder: 2 }
    ]
  },
  {
    movieID: 4,
    slug: 'dune',
    title: 'Dune',
    originalTitle: 'Dune',
    description: 'Paul Atreides, một thiếu niên tài năng và có tương lai vĩ đại vượt quá sự hiểu biết của anh, phải đi đến hành tinh nguy hiểm nhất trong vũ trụ.',
    movieType: 'movie',
    image: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    status: 'completed',
    releaseDate: '2021-10-22',
    durationSeconds: 9900,
    year: 2021,
    rated: 'PG-13',
    popularity: 8.0,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 2, tagName: 'Sci-Fi', tagDescription: 'Science Fiction' },
      { tagID: 3, tagName: 'Adventure', tagDescription: 'Adventure movies' }
    ],
    cast: [
      { personID: 2, fullName: 'Vin Diesel', characterName: 'Paul Atreides', role: 'Lead', creditOrder: 1 },
      { personID: 3, fullName: 'Paul Walker', characterName: 'Duke Leto', role: 'Supporting', creditOrder: 2 },
      { personID: 4, fullName: 'Dwayne Johnson', characterName: 'Lady Jessica', role: 'Supporting', creditOrder: 3 }
    ],
    sources: [
      {
        movieSourceID: 4,
        movieID: 4,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/dune-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Timothée Chalamet', avatar: 'https://via.placeholder.com/100', personID: 7, role: 'actor', characterName: 'Paul Atreides', creditOrder: 1 },
      { fullName: 'Rebecca Ferguson', avatar: 'https://via.placeholder.com/100', personID: 8, role: 'actress', characterName: 'Lady Jessica', creditOrder: 2 }
    ]
  },
  {
    movieID: 5,
    slug: 'the-batman',
    title: 'The Batman',
    originalTitle: 'The Batman',
    description: 'Khi một kẻ giết người nhắm vào giới thượng lưu của Gotham với một loạt các âm mưu tàn bạo, Batman phải điều tra lịch sử bí mật của thành phố.',
    movieType: 'movie',
    image: 'https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
    status: 'completed',
    releaseDate: '2022-03-04',
    durationSeconds: 10800,
    year: 2022,
    rated: 'PG-13',
    popularity: 8.1,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 1, tagName: 'Action', tagDescription: 'Action movies' },
      { tagID: 5, tagName: 'Superhero', tagDescription: 'Superhero movies' },
      { tagID: 6, tagName: 'Crime', tagDescription: 'Crime movies' }
    ],
    cast: [
      { personID: 5, fullName: 'Jason Statham', characterName: 'Batman', role: 'Lead', creditOrder: 1 },
      { personID: 6, fullName: 'Gal Gadot', characterName: 'Catwoman', role: 'Supporting', creditOrder: 2 },
      { personID: 7, fullName: 'Ryan Reynolds', characterName: 'Riddler', role: 'Supporting', creditOrder: 3 }
    ],
    sources: [
      {
        movieSourceID: 5,
        movieID: 5,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/batman-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Robert Pattinson', avatar: 'https://via.placeholder.com/100', personID: 9, role: 'actor', characterName: 'Bruce Wayne / Batman', creditOrder: 1 },
      { fullName: 'Zoë Kravitz', avatar: 'https://via.placeholder.com/100', personID: 10, role: 'actress', characterName: 'Selina Kyle / Catwoman', creditOrder: 2 }
    ]
  }
];

// Sample Series (5 series with episodes)
export const sampleSeries: Movie[] = [
  {
    movieID: 6,
    slug: 'stranger-things-season-4',
    title: 'Stranger Things',
    originalTitle: 'Stranger Things',
    description: 'Khi một cậu bé biến mất, mẹ của cậu, một cảnh sát trưởng và bạn bè của cậu phải đối mặt với những lực lượng siêu nhiên khủng khiếp.',
    movieType: 'series',
    image: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    status: 'completed',
    releaseDate: '2022-05-27',
    totalSeasons: 4,
    totalEpisodes: 34,
    year: 2022,
    rated: 'TV-14',
    popularity: 9.2,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 2, tagName: 'Sci-Fi', tagDescription: 'Science Fiction' },
      { tagID: 7, tagName: 'Horror', tagDescription: 'Horror movies' },
      { tagID: 8, tagName: 'Mystery', tagDescription: 'Mystery movies' }
    ],
    sources: [
      {
        movieSourceID: 6,
        movieID: 6,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Millie Bobby Brown', avatar: 'https://via.placeholder.com/100', personID: 11, role: 'actress', characterName: 'Eleven', creditOrder: 1 },
      { fullName: 'Finn Wolfhard', avatar: 'https://via.placeholder.com/100', personID: 12, role: 'actor', characterName: 'Mike Wheeler', creditOrder: 2 }
    ]
  },
  {
    movieID: 7,
    slug: 'the-witcher-season-3',
    title: 'The Witcher',
    originalTitle: 'The Witcher',
    description: 'Geralt of Rivia, một thợ săn quái vật đột biến, đấu tranh để tìm vị trí của mình trong một thế giới nơi con người thường tồi tệ hơn cả quái vật.',
    movieType: 'series',
    image: 'https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg',
    status: 'ongoing',
    releaseDate: '2023-06-29',
    totalSeasons: 3,
    totalEpisodes: 24,
    year: 2023,
    rated: 'TV-MA',
    popularity: 8.7,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 3, tagName: 'Adventure', tagDescription: 'Adventure movies' },
      { tagID: 9, tagName: 'Fantasy', tagDescription: 'Fantasy movies' },
      { tagID: 1, tagName: 'Action', tagDescription: 'Action movies' }
    ],
    sources: [
      {
        movieSourceID: 7,
        movieID: 7,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Henry Cavill', avatar: 'https://via.placeholder.com/100', personID: 13, role: 'actor', characterName: 'Geralt of Rivia', creditOrder: 1 },
      { fullName: 'Anya Chalotra', avatar: 'https://via.placeholder.com/100', personID: 14, role: 'actress', characterName: 'Yennefer of Vengerberg', creditOrder: 2 }
    ]
  },
  {
    movieID: 8,
    slug: 'house-of-the-dragon-season-1',
    title: 'House of the Dragon',
    originalTitle: 'House of the Dragon',
    description: 'Câu chuyện về sự khởi đầu của sự kết thúc của nhà Targaryen và các sự kiện dẫn đến cuộc "Vũ điệu của những con rồng".',
    movieType: 'series',
    image: 'https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg',
    status: 'completed',
    releaseDate: '2022-08-21',
    totalSeasons: 1,
    totalEpisodes: 10,
    year: 2022,
    rated: 'TV-MA',
    popularity: 8.9,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 9, tagName: 'Fantasy', tagDescription: 'Fantasy movies' },
      { tagID: 4, tagName: 'Drama', tagDescription: 'Drama movies' },
      { tagID: 1, tagName: 'Action', tagDescription: 'Action movies' }
    ],
    sources: [
      {
        movieSourceID: 8,
        movieID: 8,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/house-dragon-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Paddy Considine', avatar: 'https://via.placeholder.com/100', personID: 15, role: 'actor', characterName: 'King Viserys I Targaryen', creditOrder: 1 },
      { fullName: 'Emma D\'Arcy', avatar: 'https://via.placeholder.com/100', personID: 16, role: 'actress', characterName: 'Princess Rhaenyra Targaryen', creditOrder: 2 }
    ]
  },
  {
    movieID: 9,
    slug: 'the-mandalorian-season-3',
    title: 'The Mandalorian',
    originalTitle: 'The Mandalorian',
    description: 'Những cuộc phiêu lưu của Din Djarin, một thợ săn tiền thưởng Mandalorian độc lập, khi anh đi khắp các vùng ngoại vi của thiên hà.',
    movieType: 'series',
    image: 'https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg',
    status: 'completed',
    releaseDate: '2023-03-01',
    totalSeasons: 3,
    totalEpisodes: 24,
    year: 2023,
    rated: 'TV-14',
    popularity: 8.6,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 2, tagName: 'Sci-Fi', tagDescription: 'Science Fiction' },
      { tagID: 3, tagName: 'Adventure', tagDescription: 'Adventure movies' },
      { tagID: 1, tagName: 'Action', tagDescription: 'Action movies' }
    ],
    sources: [
      {
        movieSourceID: 9,
        movieID: 9,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/mandalorian-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Pedro Pascal', avatar: 'https://via.placeholder.com/100', personID: 17, role: 'actor', characterName: 'Din Djarin / The Mandalorian', creditOrder: 1 },
      { fullName: 'Grogu', avatar: 'https://via.placeholder.com/100', personID: 18, role: 'character', characterName: 'Grogu', creditOrder: 2 }
    ]
  },
  {
    movieID: 10,
    slug: 'wednesday-season-1',
    title: 'Wednesday',
    originalTitle: 'Wednesday',
    description: 'Wednesday Addams là một học sinh mới tại Nevermore Academy, nơi cô cố gắng làm chủ khả năng tâm linh của mình.',
    movieType: 'series',
    image: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    status: 'ongoing',
    releaseDate: '2022-11-23',
    totalSeasons: 1,
    totalEpisodes: 8,
    year: 2022,
    rated: 'TV-14',
    popularity: 8.4,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 7, tagName: 'Horror', tagDescription: 'Horror movies' },
      { tagID: 8, tagName: 'Mystery', tagDescription: 'Mystery movies' },
      { tagID: 10, tagName: 'Comedy', tagDescription: 'Comedy movies' }
    ],
    sources: [
      {
        movieSourceID: 10,
        movieID: 10,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/wednesday-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Jenna Ortega', avatar: 'https://via.placeholder.com/100', personID: 19, role: 'actress', characterName: 'Wednesday Addams', creditOrder: 1 },
      { fullName: 'Catherine Zeta-Jones', avatar: 'https://via.placeholder.com/100', personID: 20, role: 'actress', characterName: 'Morticia Addams', creditOrder: 2 }
    ]
  },
  {
    movieID: 11,
    slug: 'the-crown-complete-series',
    title: 'The Crown',
    originalTitle: 'The Crown',
    description: 'The Crown theo dõi cuộc đời của Nữ hoàng Elizabeth II từ những năm 1940 đến đầu những năm 2000.',
    movieType: 'series',
    image: 'https://image.tmdb.org/t/p/w500/1M876Kp8lVl4mHpOvq2yKz8Qj8z.jpg',
    status: 'completed',
    releaseDate: '2016-11-04',
    totalSeasons: 6,
    totalEpisodes: 60,
    year: 2016,
    rated: 'TV-MA',
    popularity: 9.1,
    regionID: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    region: {
      regionID: 1,
      regionName: 'Vietnam'
    },
    tags: [
      { tagID: 4, tagName: 'Drama', tagDescription: 'Drama movies' },
      { tagID: 10, tagName: 'Biography', tagDescription: 'Biography movies' },
      { tagID: 11, tagName: 'History', tagDescription: 'Historical movies' }
    ],
    sources: [
      {
        movieSourceID: 11,
        movieID: 11,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ],
    actors: [
      { fullName: 'Claire Foy', avatar: 'https://via.placeholder.com/100', personID: 21, role: 'actress', characterName: 'Queen Elizabeth II (Seasons 1-2)', creditOrder: 1 },
      { fullName: 'Olivia Colman', avatar: 'https://via.placeholder.com/100', personID: 22, role: 'actress', characterName: 'Queen Elizabeth II (Seasons 3-4)', creditOrder: 2 },
      { fullName: 'Imelda Staunton', avatar: 'https://via.placeholder.com/100', personID: 23, role: 'actress', characterName: 'Queen Elizabeth II (Seasons 5-6)', creditOrder: 3 }
    ]
  }
];

// Sample Episodes for Series
export const sampleEpisodes: Episode[] = [
  // Stranger Things Season 1 Episodes
  {
    episodeID: 1,
    movieID: 6,
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'The Vanishing of Will Byers',
    synopsis: 'Will Byers biến mất một cách bí ẩn.',
    description: 'Will Byers biến mất một cách bí ẩn trong khi đi về nhà từ nhà bạn. Joyce và Jonathan bắt đầu tìm kiếm Will, trong khi Mike, Dustin và Lucas gặp Eleven.',
    durationSeconds: 3600,
    releaseDate: '2016-07-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 1,
        episodeID: 1,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s1e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 2,
    movieID: 6,
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'The Weirdo on Maple Street',
    synopsis: 'Eleven tiết lộ sức mạnh của mình.',
    description: 'Eleven tiết lộ sức mạnh của mình cho Mike và các bạn. Joyce nhận được cuộc gọi từ Will, trong khi Hopper điều tra vụ mất tích.',
    durationSeconds: 3600,
    releaseDate: '2016-07-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 2,
        episodeID: 2,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s1e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 3,
    movieID: 6,
    seasonNumber: 1,
    episodeNumber: 3,
    title: 'Holly, Jolly',
    synopsis: 'Nancy và Jonathan hợp tác để tìm kiếm sự thật.',
    description: 'Nancy và Jonathan hợp tác để tìm kiếm sự thật về những gì đã xảy ra với Will. Eleven giúp Mike tìm kiếm Will thông qua sức mạnh của mình.',
    durationSeconds: 3600,
    releaseDate: '2016-07-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 3,
        episodeID: 3,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s1e3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 4,
    movieID: 6,
    seasonNumber: 1,
    episodeNumber: 4,
    title: 'The Body',
    synopsis: 'Cả nhóm khám phá Upside Down.',
    description: 'Cả nhóm khám phá Upside Down và tìm thấy Will. Eleven tiết lộ quá khứ của mình và sự thật về Hawkins Lab.',
    durationSeconds: 3600,
    releaseDate: '2016-07-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 4,
        episodeID: 4,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s1e4-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 5,
    movieID: 6,
    seasonNumber: 1,
    episodeNumber: 5,
    title: 'The Flea and the Acrobat',
    synopsis: 'Cả nhóm lên kế hoạch cứu Will.',
    description: 'Cả nhóm lên kế hoạch cứu Will từ Upside Down. Eleven sử dụng sức mạnh của mình để mở cổng vào thế giới khác.',
    durationSeconds: 3600,
    releaseDate: '2016-07-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 5,
        episodeID: 5,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s1e5-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 6,
    movieID: 6,
    seasonNumber: 1,
    episodeNumber: 6,
    title: 'The Monster',
    synopsis: 'Demogorgon tấn công Hawkins.',
    description: 'Demogorgon tấn công Hawkins và cả nhóm phải chiến đấu để bảo vệ nhau. Eleven hy sinh để cứu bạn bè.',
    durationSeconds: 3600,
    releaseDate: '2016-07-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 6,
        episodeID: 6,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s1e6-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 7,
    movieID: 6,
    seasonNumber: 1,
    episodeNumber: 7,
    title: 'The Bathtub',
    synopsis: 'Cả nhóm hợp tác để cứu Will.',
    description: 'Cả nhóm hợp tác để cứu Will từ Upside Down. Eleven trở lại và sử dụng sức mạnh của mình để đóng cổng.',
    durationSeconds: 3600,
    releaseDate: '2016-07-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 7,
        episodeID: 7,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s1e7-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 8,
    movieID: 6,
    seasonNumber: 1,
    episodeNumber: 8,
    title: 'The Upside Down',
    synopsis: 'Kết thúc mùa đầu tiên.',
    description: 'Kết thúc mùa đầu tiên với Will được cứu và Eleven biến mất. Cả nhóm phải đối mặt với những bí mật của Hawkins.',
    durationSeconds: 3600,
    releaseDate: '2016-07-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 8,
        episodeID: 8,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s1e8-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  // Stranger Things Season 2 Episodes
  {
    episodeID: 9,
    movieID: 6,
    seasonNumber: 2,
    episodeNumber: 1,
    title: 'Madmax',
    synopsis: 'Một năm sau, Hawkins đối mặt với mối đe dọa mới.',
    description: 'Một năm sau sự kiện mùa đầu tiên, Hawkins đối mặt với mối đe dọa mới. Will vẫn bị ảnh hưởng bởi Upside Down.',
    durationSeconds: 3600,
    releaseDate: '2017-10-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 9,
        episodeID: 9,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s2e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 10,
    movieID: 6,
    seasonNumber: 2,
    episodeNumber: 2,
    title: 'Trick or Treat, Freak',
    synopsis: 'Will bắt đầu có những triệu chứng lạ.',
    description: 'Will bắt đầu có những triệu chứng lạ và cả nhóm phải tìm cách giúp đỡ anh. Eleven trở lại Hawkins.',
    durationSeconds: 3600,
    releaseDate: '2017-10-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 10,
        episodeID: 10,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s2e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 11,
    movieID: 6,
    seasonNumber: 2,
    episodeNumber: 3,
    title: 'The Pollywog',
    synopsis: 'Dustin tìm thấy một sinh vật lạ.',
    description: 'Dustin tìm thấy một sinh vật lạ và đặt tên là Dart. Will tiếp tục có những triệu chứng lạ và cả nhóm phải tìm cách giúp đỡ.',
    durationSeconds: 3600,
    releaseDate: '2017-10-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 11,
        episodeID: 11,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s2e3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 12,
    movieID: 6,
    seasonNumber: 2,
    episodeNumber: 4,
    title: 'Will the Wise',
    synopsis: 'Will bị Mind Flayer kiểm soát.',
    description: 'Will bị Mind Flayer kiểm soát và cả nhóm phải tìm cách cứu anh. Eleven học cách sử dụng sức mạnh của mình.',
    durationSeconds: 3600,
    releaseDate: '2017-10-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 12,
        episodeID: 12,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s2e4-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 13,
    movieID: 6,
    seasonNumber: 2,
    episodeNumber: 5,
    title: 'Dig Dug',
    synopsis: 'Cả nhóm khám phá đường hầm dưới Hawkins.',
    description: 'Cả nhóm khám phá đường hầm dưới Hawkins và tìm thấy sự thật về Mind Flayer. Will tiếp tục bị kiểm soát.',
    durationSeconds: 3600,
    releaseDate: '2017-10-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 13,
        episodeID: 13,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s2e5-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 14,
    movieID: 6,
    seasonNumber: 2,
    episodeNumber: 6,
    title: 'The Spy',
    synopsis: 'Will trở thành gián điệp của Mind Flayer.',
    description: 'Will trở thành gián điệp của Mind Flayer và cả nhóm phải tìm cách cứu anh. Eleven và Hopper hợp tác.',
    durationSeconds: 3600,
    releaseDate: '2017-10-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 14,
        episodeID: 14,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s2e6-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 15,
    movieID: 6,
    seasonNumber: 2,
    episodeNumber: 7,
    title: 'The Lost Sister',
    synopsis: 'Eleven tìm thấy chị gái Kali.',
    description: 'Eleven tìm thấy chị gái Kali và học cách sử dụng sức mạnh của mình. Cả nhóm tiếp tục chiến đấu với Mind Flayer.',
    durationSeconds: 3600,
    releaseDate: '2017-10-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 15,
        episodeID: 15,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s2e7-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 16,
    movieID: 6,
    seasonNumber: 2,
    episodeNumber: 8,
    title: 'The Mind Flayer',
    synopsis: 'Trận chiến cuối cùng với Mind Flayer.',
    description: 'Trận chiến cuối cùng với Mind Flayer. Cả nhóm phải hợp tác để cứu Will và bảo vệ Hawkins.',
    durationSeconds: 3600,
    releaseDate: '2017-10-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 16,
        episodeID: 16,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s2e8-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 17,
    movieID: 6,
    seasonNumber: 2,
    episodeNumber: 9,
    title: 'The Gate',
    synopsis: 'Kết thúc mùa thứ hai.',
    description: 'Kết thúc mùa thứ hai với Will được cứu và Mind Flayer bị đánh bại. Cả nhóm đoàn tụ và chuẩn bị cho những thách thức mới.',
    durationSeconds: 3600,
    releaseDate: '2017-10-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 17,
        episodeID: 17,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s2e9-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  // Stranger Things Season 3 Episodes
  {
    episodeID: 18,
    movieID: 6,
    seasonNumber: 3,
    episodeNumber: 1,
    title: 'Suzie, Do You Copy?',
    synopsis: 'Mùa hè 1985, Hawkins đối mặt với mối đe dọa mới.',
    description: 'Mùa hè 1985, Hawkins đối mặt với mối đe dọa mới. Cả nhóm đã lớn lên và có những mối quan hệ mới.',
    durationSeconds: 3600,
    releaseDate: '2019-07-04',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 18,
        episodeID: 18,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s3e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 19,
    movieID: 6,
    seasonNumber: 3,
    episodeNumber: 2,
    title: 'The Mall Rats',
    synopsis: 'Cả nhóm khám phá Starcourt Mall.',
    description: 'Cả nhóm khám phá Starcourt Mall và phát hiện ra những bí mật đen tối. Billy bị kiểm soát bởi Mind Flayer.',
    durationSeconds: 3600,
    releaseDate: '2019-07-04',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 19,
        episodeID: 19,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s3e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 20,
    movieID: 6,
    seasonNumber: 3,
    episodeNumber: 3,
    title: 'The Case of the Missing Lifeguard',
    synopsis: 'Billy biến mất và cả nhóm tìm kiếm.',
    description: 'Billy biến mất và cả nhóm tìm kiếm. Mind Flayer tiếp tục mở rộng ảnh hưởng và cả nhóm phải chiến đấu.',
    durationSeconds: 3600,
    releaseDate: '2019-07-04',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 20,
        episodeID: 20,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s3e3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 21,
    movieID: 6,
    seasonNumber: 3,
    episodeNumber: 4,
    title: 'The Sauna Test',
    synopsis: 'Cả nhóm thử nghiệm để cứu Billy.',
    description: 'Cả nhóm thử nghiệm để cứu Billy khỏi sự kiểm soát của Mind Flayer. Eleven sử dụng sức mạnh của mình.',
    durationSeconds: 3600,
    releaseDate: '2019-07-04',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 21,
        episodeID: 21,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s3e4-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 22,
    movieID: 6,
    seasonNumber: 3,
    episodeNumber: 5,
    title: 'The Flayed',
    synopsis: 'Mind Flayer tiếp tục mở rộng ảnh hưởng.',
    description: 'Mind Flayer tiếp tục mở rộng ảnh hưởng và cả nhóm phải tìm cách ngăn chặn. Billy tiếp tục bị kiểm soát.',
    durationSeconds: 3600,
    releaseDate: '2019-07-04',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 22,
        episodeID: 22,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s3e5-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 23,
    movieID: 6,
    seasonNumber: 3,
    episodeNumber: 6,
    title: 'E Pluribus Unum',
    synopsis: 'Trận chiến cuối cùng với Mind Flayer.',
    description: 'Trận chiến cuối cùng với Mind Flayer. Cả nhóm phải hợp tác để bảo vệ Hawkins và cứu Billy.',
    durationSeconds: 3600,
    releaseDate: '2019-07-04',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 23,
        episodeID: 23,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s3e6-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 24,
    movieID: 6,
    seasonNumber: 3,
    episodeNumber: 7,
    title: 'The Bite',
    synopsis: 'Kết thúc mùa thứ ba.',
    description: 'Kết thúc mùa thứ ba với Billy hy sinh để cứu Eleven và cả nhóm. Hopper biến mất và cả nhóm phải đối mặt với những thách thức mới.',
    durationSeconds: 3600,
    releaseDate: '2019-07-04',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 24,
        episodeID: 24,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s3e7-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  // Stranger Things Season 4 Episodes
  {
    episodeID: 25,
    movieID: 6,
    seasonNumber: 4,
    episodeNumber: 1,
    title: 'The Hellfire Club',
    synopsis: 'Sáu tháng sau trận chiến ở Starcourt, cả nhóm đã chia tay nhau.',
    description: 'Sáu tháng sau trận chiến ở Starcourt, cả nhóm đã chia tay nhau. Eleven đang viết thư cho Mike từ California, trong khi Joyce đang cố gắng tìm cách để cả gia đình có thể sống cùng nhau.',
    durationSeconds: 3600,
    releaseDate: '2022-05-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 25,
        episodeID: 25,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s4e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 26,
    movieID: 6,
    seasonNumber: 4,
    episodeNumber: 2,
    title: 'Vecna\'s Curse',
    synopsis: 'Vecna tiếp tục săn lùng các nạn nhân mới.',
    description: 'Vecna tiếp tục săn lùng các nạn nhân mới trong Hawkins. Eleven cố gắng khôi phục lại sức mạnh của mình để có thể giúp đỡ bạn bè.',
    durationSeconds: 3600,
    releaseDate: '2022-05-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 26,
        episodeID: 26,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s4e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 27,
    movieID: 6,
    seasonNumber: 4,
    episodeNumber: 3,
    title: 'The Monster and the Superhero',
    synopsis: 'Eleven và Mike đoàn tụ trong khi Vecna tiếp tục săn lùng.',
    description: 'Eleven và Mike đoàn tụ trong khi Vecna tiếp tục săn lùng các nạn nhân mới. Hopper cố gắng trốn thoát khỏi nhà tù ở Nga.',
    durationSeconds: 3600,
    releaseDate: '2022-05-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 27,
        episodeID: 27,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s4e3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 28,
    movieID: 6,
    seasonNumber: 4,
    episodeNumber: 4,
    title: 'Dear Billy',
    synopsis: 'Max đối mặt với Vecna trong khi cả nhóm cố gắng cứu cô.',
    description: 'Max đối mặt với Vecna trong khi cả nhóm cố gắng cứu cô. Eleven khám phá ra sự thật về quá khứ của mình.',
    durationSeconds: 3600,
    releaseDate: '2022-05-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 28,
        episodeID: 28,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s4e4-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 29,
    movieID: 6,
    seasonNumber: 4,
    episodeNumber: 5,
    title: 'The Nina Project',
    synopsis: 'Eleven tham gia vào dự án Nina để khôi phục sức mạnh.',
    description: 'Eleven tham gia vào dự án Nina để khôi phục sức mạnh của mình. Vecna tiếp tục mở rộng cổng vào Upside Down.',
    durationSeconds: 3600,
    releaseDate: '2022-05-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 29,
        episodeID: 29,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s4e5-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 30,
    movieID: 6,
    seasonNumber: 4,
    episodeNumber: 6,
    title: 'The Dive',
    synopsis: 'Cả nhóm lên kế hoạch tấn công Vecna.',
    description: 'Cả nhóm lên kế hoạch tấn công Vecna và cứu Hawkins. Eleven sử dụng sức mạnh của mình để chiến đấu.',
    durationSeconds: 3600,
    releaseDate: '2022-05-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 30,
        episodeID: 30,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s4e6-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 31,
    movieID: 6,
    seasonNumber: 4,
    episodeNumber: 7,
    title: 'The Massacre at Hawkins Lab',
    synopsis: 'Kết thúc mùa thứ tư.',
    description: 'Kết thúc mùa thứ tư với trận chiến cuối cùng chống lại Vecna. Eleven và cả nhóm phải hy sinh để bảo vệ Hawkins.',
    durationSeconds: 3600,
    releaseDate: '2022-05-27',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 31,
        episodeID: 31,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/stranger-things-s4e7-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  // The Witcher Season 1 Episodes
  {
    episodeID: 32,
    movieID: 7,
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'The End\'s Beginning',
    synopsis: 'Geralt gặp Ciri lần đầu tiên.',
    description: 'Geralt gặp Ciri lần đầu tiên và bắt đầu cuộc hành trình bảo vệ cô khỏi những mối đe dọa đen tối.',
    durationSeconds: 3600,
    releaseDate: '2019-12-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 32,
        episodeID: 32,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s1e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 33,
    movieID: 7,
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Four Marks',
    synopsis: 'Geralt điều tra một vụ giết người bí ẩn.',
    description: 'Geralt điều tra một vụ giết người bí ẩn và khám phá ra những bí mật đen tối của thế giới.',
    durationSeconds: 3600,
    releaseDate: '2019-12-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 33,
        episodeID: 33,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s1e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 34,
    movieID: 7,
    seasonNumber: 1,
    episodeNumber: 3,
    title: 'Betrayer Moon',
    synopsis: 'Geralt đối mặt với một con quái vật mạnh mẽ.',
    description: 'Geralt đối mặt với một con quái vật mạnh mẽ và phải sử dụng tất cả kỹ năng của mình để chiến thắng.',
    durationSeconds: 3600,
    releaseDate: '2019-12-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 34,
        episodeID: 34,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s1e3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 35,
    movieID: 7,
    seasonNumber: 1,
    episodeNumber: 4,
    title: 'Of Banquets, Bastards and Burials',
    synopsis: 'Geralt tham gia một bữa tiệc hoàng gia.',
    description: 'Geralt tham gia một bữa tiệc hoàng gia và khám phá ra những âm mưu chính trị phức tạp.',
    durationSeconds: 3600,
    releaseDate: '2019-12-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 35,
        episodeID: 35,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s1e4-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 36,
    movieID: 7,
    seasonNumber: 1,
    episodeNumber: 5,
    title: 'Bottled Appetites',
    synopsis: 'Geralt và Jaskier gặp gỡ Yennefer.',
    description: 'Geralt và Jaskier gặp gỡ Yennefer và bắt đầu một mối quan hệ phức tạp.',
    durationSeconds: 3600,
    releaseDate: '2019-12-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 36,
        episodeID: 36,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s1e5-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 37,
    movieID: 7,
    seasonNumber: 1,
    episodeNumber: 6,
    title: 'Rare Species',
    synopsis: 'Geralt đi săn một con rồng.',
    description: 'Geralt đi săn một con rồng và khám phá ra những bí mật về loài sinh vật này.',
    durationSeconds: 3600,
    releaseDate: '2019-12-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 37,
        episodeID: 37,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s1e6-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 38,
    movieID: 7,
    seasonNumber: 1,
    episodeNumber: 7,
    title: 'Before a Fall',
    synopsis: 'Geralt đối mặt với những thách thức lớn.',
    description: 'Geralt đối mặt với những thách thức lớn và phải đưa ra những quyết định khó khăn.',
    durationSeconds: 3600,
    releaseDate: '2019-12-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 38,
        episodeID: 38,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s1e7-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 39,
    movieID: 7,
    seasonNumber: 1,
    episodeNumber: 8,
    title: 'Much More',
    synopsis: 'Kết thúc mùa đầu tiên.',
    description: 'Kết thúc mùa đầu tiên với Geralt và Ciri đoàn tụ, chuẩn bị cho những thách thức mới.',
    durationSeconds: 3600,
    releaseDate: '2019-12-20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 39,
        episodeID: 39,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s1e8-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  // The Witcher Season 2 Episodes
  {
    episodeID: 40,
    movieID: 7,
    seasonNumber: 2,
    episodeNumber: 1,
    title: 'A Grain of Truth',
    synopsis: 'Geralt và Ciri bắt đầu cuộc hành trình mới.',
    description: 'Geralt và Ciri bắt đầu cuộc hành trình mới và gặp gỡ những nhân vật mới.',
    durationSeconds: 3600,
    releaseDate: '2021-12-17',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 40,
        episodeID: 40,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s2e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 41,
    movieID: 7,
    seasonNumber: 2,
    episodeNumber: 2,
    title: 'Kaer Morhen',
    synopsis: 'Geralt đưa Ciri đến Kaer Morhen.',
    description: 'Geralt đưa Ciri đến Kaer Morhen để huấn luyện cô trở thành một Witcher.',
    durationSeconds: 3600,
    releaseDate: '2021-12-17',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 41,
        episodeID: 41,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s2e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 42,
    movieID: 7,
    seasonNumber: 2,
    episodeNumber: 3,
    title: 'What Is Lost',
    synopsis: 'Ciri học cách sử dụng sức mạnh của mình.',
    description: 'Ciri học cách sử dụng sức mạnh của mình trong khi Geralt đối mặt với những mối đe dọa mới.',
    durationSeconds: 3600,
    releaseDate: '2021-12-17',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 42,
        episodeID: 42,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s2e3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 43,
    movieID: 7,
    seasonNumber: 2,
    episodeNumber: 4,
    title: 'Redanian Intelligence',
    synopsis: 'Geralt điều tra một âm mưu chính trị.',
    description: 'Geralt điều tra một âm mưu chính trị và khám phá ra những bí mật đen tối.',
    durationSeconds: 3600,
    releaseDate: '2021-12-17',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 43,
        episodeID: 43,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s2e4-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 44,
    movieID: 7,
    seasonNumber: 2,
    episodeNumber: 5,
    title: 'Turn Your Back',
    synopsis: 'Geralt đối mặt với những thách thức mới.',
    description: 'Geralt đối mặt với những thách thức mới và phải đưa ra những quyết định khó khăn.',
    durationSeconds: 3600,
    releaseDate: '2021-12-17',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 44,
        episodeID: 44,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s2e5-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 45,
    movieID: 7,
    seasonNumber: 2,
    episodeNumber: 6,
    title: 'Dear Friend...',
    synopsis: 'Geralt và Yennefer đoàn tụ.',
    description: 'Geralt và Yennefer đoàn tụ và bắt đầu một mối quan hệ mới.',
    durationSeconds: 3600,
    releaseDate: '2021-12-17',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 45,
        episodeID: 45,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s2e6-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 46,
    movieID: 7,
    seasonNumber: 2,
    episodeNumber: 7,
    title: 'Voleth Meir',
    synopsis: 'Geralt đối mặt với một kẻ thù mạnh mẽ.',
    description: 'Geralt đối mặt với một kẻ thù mạnh mẽ và phải sử dụng tất cả kỹ năng của mình.',
    durationSeconds: 3600,
    releaseDate: '2021-12-17',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 46,
        episodeID: 46,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s2e7-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 47,
    movieID: 7,
    seasonNumber: 2,
    episodeNumber: 8,
    title: 'Family',
    synopsis: 'Kết thúc mùa thứ hai.',
    description: 'Kết thúc mùa thứ hai với Geralt, Ciri và Yennefer đoàn tụ như một gia đình.',
    durationSeconds: 3600,
    releaseDate: '2021-12-17',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 47,
        episodeID: 47,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s2e8-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  // The Witcher Season 3 Episodes
  {
    episodeID: 48,
    movieID: 7,
    seasonNumber: 3,
    episodeNumber: 1,
    title: 'Shaerrawedd',
    synopsis: 'Geralt và Yennefer đối mặt với những thách thức mới.',
    description: 'Geralt và Yennefer đối mặt với những thách thức mới khi họ cố gắng bảo vệ Ciri khỏi những mối đe dọa đang đến gần.',
    durationSeconds: 3600,
    releaseDate: '2023-06-29',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 48,
        episodeID: 48,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s3e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 49,
    movieID: 7,
    seasonNumber: 3,
    episodeNumber: 2,
    title: 'Unbound',
    synopsis: 'Ciri khám phá sức mạnh mới của mình.',
    description: 'Ciri khám phá sức mạnh mới của mình trong khi Geralt và Yennefer cố gắng tìm cách để bảo vệ cô khỏi những kẻ săn đuổi.',
    durationSeconds: 3600,
    releaseDate: '2023-06-29',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 49,
        episodeID: 49,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s3e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 50,
    movieID: 7,
    seasonNumber: 3,
    episodeNumber: 3,
    title: 'The Wild Hunt',
    synopsis: 'Geralt đối mặt với Wild Hunt.',
    description: 'Geralt đối mặt với Wild Hunt trong khi Ciri học cách kiểm soát sức mạnh của mình.',
    durationSeconds: 3600,
    releaseDate: '2023-06-29',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 50,
        episodeID: 50,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/witcher-s3e3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  // House of the Dragon Season 1 Episodes
  {
    episodeID: 9,
    movieID: 8,
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'The Heirs of the Dragon',
    synopsis: 'Vua Viserys chọn người kế vị mới.',
    description: 'Vua Viserys chọn người kế vị mới sau cái chết của con trai, dẫn đến những căng thẳng trong gia đình Targaryen.',
    durationSeconds: 3600,
    releaseDate: '2022-08-21',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 9,
        episodeID: 9,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/house-dragon-s1e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 10,
    movieID: 8,
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'The Rogue Prince',
    synopsis: 'Daemon Targaryen gây rối ở Stepstones.',
    description: 'Daemon Targaryen gây rối ở Stepstones trong khi Rhaenyra chuẩn bị cho vai trò mới của mình.',
    durationSeconds: 3600,
    releaseDate: '2022-08-28',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 10,
        episodeID: 10,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/house-dragon-s1e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 11,
    movieID: 8,
    seasonNumber: 1,
    episodeNumber: 3,
    title: 'Second of His Name',
    synopsis: 'Cuộc chiến ở Stepstones tiếp tục.',
    description: 'Cuộc chiến ở Stepstones tiếp tục trong khi Rhaenyra đối mặt với những thách thức mới.',
    durationSeconds: 3600,
    releaseDate: '2022-09-04',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 11,
        episodeID: 11,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/house-dragon-s1e3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  // The Mandalorian Season 3 Episodes
  {
    episodeID: 12,
    movieID: 9,
    seasonNumber: 3,
    episodeNumber: 1,
    title: 'The Apostate',
    synopsis: 'Din Djarin và Grogu bắt đầu cuộc phiêu lưu mới.',
    description: 'Din Djarin và Grogu bắt đầu cuộc phiêu lưu mới sau khi được cứu khỏi Moff Gideon.',
    durationSeconds: 3600,
    releaseDate: '2023-03-01',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 12,
        episodeID: 12,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/mandalorian-s3e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 13,
    movieID: 9,
    seasonNumber: 3,
    episodeNumber: 2,
    title: 'The Mines of Mandalore',
    synopsis: 'Din Djarin khám phá các mỏ Mandalore.',
    description: 'Din Djarin khám phá các mỏ Mandalore để tìm hiểu về lịch sử của hành tinh và dân tộc của mình.',
    durationSeconds: 3600,
    releaseDate: '2023-03-08',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 13,
        episodeID: 13,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/mandalorian-s3e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 14,
    movieID: 9,
    seasonNumber: 3,
    episodeNumber: 3,
    title: 'The Convert',
    synopsis: 'Din Djarin gặp gỡ những Mandalorian khác.',
    description: 'Din Djarin gặp gỡ những Mandalorian khác và học hỏi về truyền thống của họ.',
    durationSeconds: 3600,
    releaseDate: '2023-03-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 14,
        episodeID: 14,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/mandalorian-s3e3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  // Wednesday Season 1 Episodes
  {
    episodeID: 15,
    movieID: 10,
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Wednesday\'s Child is Full of Woe',
    synopsis: 'Wednesday Addams bắt đầu học tại Nevermore Academy.',
    description: 'Wednesday Addams bắt đầu học tại Nevermore Academy, nơi cô khám phá khả năng tâm linh của mình và gặp những sinh viên khác.',
    durationSeconds: 3600,
    releaseDate: '2022-11-23',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 15,
        episodeID: 15,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/wednesday-s1e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 16,
    movieID: 10,
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Woe is the Loneliest Number',
    synopsis: 'Wednesday điều tra vụ giết người bí ẩn.',
    description: 'Wednesday điều tra vụ giết người bí ẩn tại Nevermore Academy và khám phá những bí mật đen tối của trường.',
    durationSeconds: 3600,
    releaseDate: '2022-11-23',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 16,
        episodeID: 16,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/wednesday-s1e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 17,
    movieID: 10,
    seasonNumber: 1,
    episodeNumber: 3,
    title: 'Friend or Woe',
    synopsis: 'Wednesday kết bạn với Enid.',
    description: 'Wednesday kết bạn với Enid và khám phá thêm về Nevermore Academy.',
    durationSeconds: 3600,
    releaseDate: '2022-11-23',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 17,
        episodeID: 17,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/wednesday-s1e3-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  // The Crown Episodes (6 Seasons)
  {
    episodeID: 31,
    movieID: 11,
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Wolferton Splash',
    synopsis: 'Nữ hoàng Elizabeth II lên ngôi sau cái chết của cha.',
    description: 'Nữ hoàng Elizabeth II lên ngôi sau cái chết của cha, King George VI. Cô phải đối mặt với những thách thức của việc trở thành nữ hoàng trẻ tuổi.',
    durationSeconds: 3600, // 1 hour
    releaseDate: '2016-11-04',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 31,
        episodeID: 31,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s1e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 32,
    movieID: 11,
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Hyde Park Corner',
    synopsis: 'Elizabeth đối mặt với cuộc khủng hoảng đầu tiên.',
    description: 'Elizabeth đối mặt với cuộc khủng hoảng đầu tiên trong vai trò nữ hoàng khi Winston Churchill bị đột quỵ.',
    durationSeconds: 3600,
    releaseDate: '2016-11-11',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 32,
        episodeID: 32,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s1e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 33,
    movieID: 11,
    seasonNumber: 2,
    episodeNumber: 1,
    title: 'Misadventure',
    synopsis: 'Elizabeth đối mặt với cuộc khủng hoảng Suez.',
    description: 'Elizabeth đối mặt với cuộc khủng hoảng Suez và những thách thức trong quan hệ với các thuộc địa.',
    durationSeconds: 3600,
    releaseDate: '2017-12-08',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 33,
        episodeID: 33,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s2e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 34,
    movieID: 11,
    seasonNumber: 2,
    episodeNumber: 2,
    title: 'A Company of Men',
    synopsis: 'Philip đối mặt với những thách thức trong vai trò chồng của nữ hoàng.',
    description: 'Philip đối mặt với những thách thức trong vai trò chồng của nữ hoàng và cố gắng tìm vị trí của mình trong hoàng gia.',
    durationSeconds: 3600,
    releaseDate: '2017-12-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 34,
        episodeID: 34,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s2e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 35,
    movieID: 11,
    seasonNumber: 3,
    episodeNumber: 1,
    title: 'Olding',
    synopsis: 'Elizabeth đối mặt với những thay đổi trong những năm 1960.',
    description: 'Elizabeth đối mặt với những thay đổi trong những năm 1960 và những thách thức mới trong vai trò nữ hoàng.',
    durationSeconds: 3600,
    releaseDate: '2019-11-17',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 35,
        episodeID: 35,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s3e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 36,
    movieID: 11,
    seasonNumber: 3,
    episodeNumber: 2,
    title: 'Margaretology',
    synopsis: 'Margaret đối mặt với những thách thức trong cuộc sống cá nhân.',
    description: 'Margaret đối mặt với những thách thức trong cuộc sống cá nhân và vai trò của cô trong hoàng gia.',
    durationSeconds: 3600,
    releaseDate: '2019-11-24',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 36,
        episodeID: 36,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s3e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 37,
    movieID: 11,
    seasonNumber: 4,
    episodeNumber: 1,
    title: 'Gold Stick',
    synopsis: 'Elizabeth đối mặt với những thách thức trong những năm 1980.',
    description: 'Elizabeth đối mặt với những thách thức trong những năm 1980 và những thay đổi trong xã hội Anh.',
    durationSeconds: 3600,
    releaseDate: '2020-11-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 37,
        episodeID: 37,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s4e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 38,
    movieID: 11,
    seasonNumber: 4,
    episodeNumber: 2,
    title: 'The Balmoral Test',
    synopsis: 'Diana Spencer được giới thiệu với hoàng gia.',
    description: 'Diana Spencer được giới thiệu với hoàng gia và bắt đầu mối quan hệ với Charles.',
    durationSeconds: 3600,
    releaseDate: '2020-11-22',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 38,
        episodeID: 38,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s4e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 39,
    movieID: 11,
    seasonNumber: 5,
    episodeNumber: 1,
    title: 'Queen Victoria Syndrome',
    synopsis: 'Elizabeth đối mặt với những thách thức trong những năm 1990.',
    description: 'Elizabeth đối mặt với những thách thức trong những năm 1990 và những thay đổi trong hoàng gia.',
    durationSeconds: 3600,
    releaseDate: '2022-11-09',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 39,
        episodeID: 39,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s5e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 40,
    movieID: 11,
    seasonNumber: 5,
    episodeNumber: 2,
    title: 'The System',
    synopsis: 'Charles và Diana đối mặt với những thách thức trong hôn nhân.',
    description: 'Charles và Diana đối mặt với những thách thức trong hôn nhân và những áp lực từ hoàng gia.',
    durationSeconds: 3600,
    releaseDate: '2022-11-16',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 40,
        episodeID: 40,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s5e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 41,
    movieID: 11,
    seasonNumber: 6,
    episodeNumber: 1,
    title: 'Persona Non Grata',
    synopsis: 'Elizabeth đối mặt với những thách thức cuối cùng.',
    description: 'Elizabeth đối mặt với những thách thức cuối cùng trong vai trò nữ hoàng và những thay đổi trong hoàng gia.',
    durationSeconds: 3600,
    releaseDate: '2023-11-16',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 41,
        episodeID: 41,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s6e1-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  },
  {
    episodeID: 42,
    movieID: 11,
    seasonNumber: 6,
    episodeNumber: 2,
    title: 'Two Photographs',
    synopsis: 'Kết thúc của một kỷ nguyên.',
    description: 'Kết thúc của một kỷ nguyên và những thay đổi cuối cùng trong hoàng gia Anh.',
    durationSeconds: 3600,
    releaseDate: '2023-11-23',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    sources: [
      {
        episodeSourceID: 42,
        episodeID: 42,
        sourceName: 'HD Quality',
        sourceType: 'streaming',
        sourceUrl: 'https://example.com/the-crown-s6e2-hd',
        quality: '1080p',
        language: 'vi',
        isVipOnly: false,
        isActive: true
      }
    ]
  }
];

// Sample Advertisement
export const samplePersons: any[] = [
  {
    personID: 1,
    fullName: 'Michelle Rodriguez',
    avatar: 'https://via.placeholder.com/200x300/2b2b31/fff?text=MR',
    role: 'Actress',
    birthDate: '1978-07-12',
    birthPlace: 'San Antonio, Texas, United States',
    height: '165 cm',
    zodiac: 'Cancer',
    bio: 'American actress known for her roles in action films',
    nationality: 'American',
    career: 'Actress',
    totalMovies: 45,
    firstMovie: 'Girl Fight (2000)',
    lastMovie: 'Fast X (2023)',
    bestMovie: 'Avatar',
    genres: ['Action', 'Thriller', 'Drama']
  },
  {
    personID: 2,
    fullName: 'Vin Diesel',
    avatar: 'https://via.placeholder.com/200x300/2b2b31/fff?text=VD',
    role: 'Actor',
    birthDate: '1967-07-18',
    birthPlace: 'New York City, New York, United States',
    height: '183 cm',
    zodiac: 'Cancer',
    bio: 'American actor, producer, director, and screenwriter',
    nationality: 'American',
    career: 'Actor',
    totalMovies: 38,
    firstMovie: 'Multi-Facial (1995)',
    lastMovie: 'Fast X (2023)',
    bestMovie: 'The Fast and the Furious',
    genres: ['Action', 'Crime', 'Drama']
  },
  {
    personID: 3,
    fullName: 'Paul Walker',
    avatar: 'https://via.placeholder.com/200x300/2b2b31/fff?text=PW',
    role: 'Actor',
    birthDate: '1973-09-12',
    birthPlace: 'Glendale, California, United States',
    height: '188 cm',
    zodiac: 'Virgo',
    bio: 'American actor best known for his role in The Fast and the Furious franchise',
    nationality: 'American',
    career: 'Actor',
    totalMovies: 42,
    firstMovie: 'Monster in the Closet (1986)',
    lastMovie: 'Furious 7 (2015)',
    bestMovie: 'The Fast and the Furious',
    genres: ['Action', 'Crime', 'Drama']
  },
  {
    personID: 4,
    fullName: 'Dwayne Johnson',
    avatar: 'https://via.placeholder.com/200x300/2b2b31/fff?text=DJ',
    role: 'Actor',
    birthDate: '1972-05-02',
    birthPlace: 'Hayward, California, United States',
    height: '196 cm',
    zodiac: 'Taurus',
    bio: 'American actor, producer, and former professional wrestler',
    nationality: 'American',
    career: 'Actor',
    totalMovies: 67,
    firstMovie: 'The Mummy Returns (2001)',
    lastMovie: 'Black Adam (2022)',
    bestMovie: 'Jumanji: Welcome to the Jungle',
    genres: ['Action', 'Comedy', 'Adventure']
  },
  {
    personID: 5,
    fullName: 'Jason Statham',
    avatar: 'https://via.placeholder.com/200x300/2b2b31/fff?text=JS',
    role: 'Actor',
    birthDate: '1967-07-26',
    birthPlace: 'Shirebrook, Derbyshire, England',
    height: '178 cm',
    zodiac: 'Leo',
    bio: 'English actor and former diver known for action films',
    nationality: 'British',
    career: 'Actor',
    totalMovies: 52,
    firstMovie: 'Lock, Stock and Two Smoking Barrels (1998)',
    lastMovie: 'Fast X (2023)',
    bestMovie: 'The Transporter',
    genres: ['Action', 'Thriller', 'Crime']
  },
  {
    personID: 6,
    fullName: 'Gal Gadot',
    avatar: 'https://via.placeholder.com/200x300/2b2b31/fff?text=GG',
    role: 'Actress',
    birthDate: '1985-04-30',
    birthPlace: 'Petah Tikva, Israel',
    height: '178 cm',
    zodiac: 'Taurus',
    bio: 'Israeli actress and model best known for playing Wonder Woman',
    nationality: 'Israeli',
    career: 'Actress',
    totalMovies: 28,
    firstMovie: 'Fast & Furious (2009)',
    lastMovie: 'Wonder Woman 1984 (2020)',
    bestMovie: 'Wonder Woman',
    genres: ['Action', 'Adventure', 'Fantasy']
  },
  {
    personID: 7,
    fullName: 'Ryan Reynolds',
    avatar: 'https://via.placeholder.com/200x300/2b2b31/fff?text=RR',
    role: 'Actor',
    birthDate: '1976-10-23',
    birthPlace: 'Vancouver, British Columbia, Canada',
    height: '188 cm',
    zodiac: 'Scorpio',
    bio: 'Canadian-American actor, producer, and businessman',
    nationality: 'Canadian',
    career: 'Actor',
    totalMovies: 76,
    firstMovie: 'Ordinary Magic (1993)',
    lastMovie: 'Deadpool 3 (2024)',
    bestMovie: 'Deadpool',
    genres: ['Action', 'Comedy', 'Drama']
  },
  {
    personID: 8,
    fullName: 'Scarlett Johansson',
    avatar: 'https://via.placeholder.com/200x300/2b2b31/fff?text=SJ',
    role: 'Actress',
    birthDate: '1984-11-22',
    birthPlace: 'New York City, New York, United States',
    height: '160 cm',
    zodiac: 'Sagittarius',
    bio: 'American actress and singer known for her role as Black Widow',
    nationality: 'American',
    career: 'Actress',
    totalMovies: 89,
    firstMovie: 'North (1994)',
    lastMovie: 'Black Widow (2021)',
    bestMovie: 'Lost in Translation',
    genres: ['Action', 'Drama', 'Sci-Fi']
  }
];

export const sampleAdvertisements: Advertisement[] = [
  {
    adID: 1,
    title: 'Netflix Premium - Xem không giới hạn',
    description: 'Đăng ký Netflix Premium để xem phim và series không giới hạn trên mọi thiết bị. Ưu đãi đặc biệt cho thành viên mới!',
    imageUrl: 'https://via.placeholder.com/800x200/FF6B6B/FFFFFF?text=Netflix+Premium+-+Xem+không+giới+hạn',
    linkUrl: 'https://netflix.com/premium',
    adType: 'banner',
    position: 'top',
    isActive: true,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    clickCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Export all sample data
export const allSampleData = {
  users: sampleUsers,
  movies: sampleMovies,
  series: sampleSeries,
  episodes: sampleEpisodes,
  advertisements: sampleAdvertisements
};

// Helper functions
export const getMovieById = (id: number): Movie | undefined => {
  return [...sampleMovies, ...sampleSeries].find(movie => movie.movieID === id);
};

export const getEpisodesByMovieId = (movieId: number): Episode[] => {
  return sampleEpisodes.filter(episode => episode.movieID === movieId);
};

export const getActiveAdvertisements = (): Advertisement[] => {
  const now = new Date();
  return sampleAdvertisements.filter(ad => 
    ad.isActive && 
    new Date(ad.startDate) <= now && 
    (!ad.endDate || new Date(ad.endDate) >= now)
  );
};

export const getAdminUser = (): User | undefined => {
  return sampleUsers.find(user => user.role === 'Admin');
};
