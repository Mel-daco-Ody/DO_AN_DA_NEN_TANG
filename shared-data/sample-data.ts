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
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  bio?: string;
  isEmailVerified?: boolean;
  createdAt: string;
  lastLogin?: string;
  lastActiveAt?: string;
  isOnline?: boolean;
  timeZone?: string;
}

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
    avatar: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=A',
    profilePicture: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=A',
    phone: '+84901234567',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    address: 'Ho Chi Minh City, Vietnam',
    bio: 'System Administrator',
    isEmailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-12-20T10:30:00Z',
    lastActiveAt: '2024-12-20T10:30:00Z',
    isOnline: true,
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
  // Stranger Things Season 4 Episodes
  {
    episodeID: 1,
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
        episodeSourceID: 1,
        episodeID: 1,
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
    episodeID: 2,
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
        episodeSourceID: 2,
        episodeID: 2,
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
    episodeID: 3,
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
        episodeSourceID: 3,
        episodeID: 3,
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
    episodeID: 4,
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
        episodeSourceID: 4,
        episodeID: 4,
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
    episodeID: 5,
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
        episodeSourceID: 5,
        episodeID: 5,
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
  // The Witcher Season 3 Episodes
  {
    episodeID: 6,
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
        episodeSourceID: 6,
        episodeID: 6,
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
    episodeID: 7,
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
        episodeSourceID: 7,
        episodeID: 7,
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
    episodeID: 8,
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
        episodeSourceID: 8,
        episodeID: 8,
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
