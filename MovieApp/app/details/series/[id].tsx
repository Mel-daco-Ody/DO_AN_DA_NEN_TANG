import { StyleSheet, View, Text, ImageBackground, ScrollView, Pressable, Dimensions, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import ImageWithPlaceholder from '../../../components/ImageWithPlaceholder';
import FlixGoLogo from '../../../components/FlixGoLogo';
import WaveAnimation from '../../../components/WaveAnimation';
import * as Haptics from 'expo-haptics';
import { useWatchHistory } from '../../../contexts/WatchHistoryContext';
import { useMovieBox } from '../../../contexts/MovieBoxContext';

function safe(value?: string | string[], fallback: string = 'N/A') {
  if (!value) return fallback;
  if (Array.isArray(value)) return value.join(' • ');
  return value;
}

// Mock data for seasons and episodes
const mockSeasonsData = {
  '2': { // Undercurrents
    seasons: [
      {
        id: 1,
        name: 'Season 1',
        episodes: [
          { id: 1, title: 'The Beginning', duration: '45 min', description: 'Khởi đầu của câu chuyện với những nhân vật chính...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/2.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 2, title: 'The Discovery', duration: '42 min', description: 'Khám phá ra sự thật đằng sau những bí mật...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/2.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { id: 3, title: 'The Conflict', duration: '48 min', description: 'Xung đột nảy sinh giữa các phe phái...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/2.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 4, title: 'The Resolution', duration: '44 min', description: 'Giải quyết vấn đề và tìm ra hướng đi mới...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/2.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
          { id: 5, title: 'The Twist', duration: '46 min', description: 'Bước ngoặt bất ngờ thay đổi mọi thứ...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/2.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
          { id: 6, title: 'The Climax', duration: '50 min', description: 'Đỉnh điểm của câu chuyện với những cảnh hành động...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/2.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
          { id: 7, title: 'The Fallout', duration: '43 min', description: 'Hậu quả của sự kiện và những thay đổi...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/2.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
          { id: 8, title: 'The End', duration: '47 min', description: 'Kết thúc của mùa đầu với những câu hỏi mở...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/2.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
        ]
      }
    ]
  },
  '4': { // Tales from the Underworld
    seasons: [
      {
        id: 1,
        name: 'Season 1',
        episodes: [
          { id: 1, title: 'Welcome to Hell', duration: '50 min', description: 'Chào mừng đến địa ngục với những thử thách đầu tiên...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 2, title: 'The Deal', duration: '48 min', description: 'Thỏa thuận với quỷ dữ và những điều kiện khắc nghiệt...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { id: 3, title: 'The Price', duration: '52 min', description: 'Cái giá phải trả cho những quyết định trong quá khứ...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 4, title: 'The Escape', duration: '46 min', description: 'Cuộc trốn chạy khỏi những ràng buộc của địa ngục...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
          { id: 5, title: 'The Return', duration: '49 min', description: 'Sự trở lại với những kiến thức và sức mạnh mới...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
          { id: 6, title: 'The Truth', duration: '51 min', description: 'Sự thật được hé lộ về nguồn gốc và mục đích thực sự...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
        ]
      },
      {
        id: 2,
        name: 'Season 2',
        episodes: [
          { id: 1, title: 'New Beginnings', duration: '53 min', description: 'Khởi đầu mới với những thử thách và cơ hội...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
          { id: 2, title: 'The Alliance', duration: '47 min', description: 'Liên minh được thành lập giữa các thế lực...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
          { id: 3, title: 'The Betrayal', duration: '50 min', description: 'Sự phản bội từ những người tin tưởng nhất...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
          { id: 4, title: 'The War', duration: '55 min', description: 'Cuộc chiến bắt đầu với những hậu quả khôn lường...', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
          { id: 5, title: 'The Sacrifice', duration: '48 min', description: 'Hy sinh vì mục đích cao cả và những người thân yêu...', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4' },
          { id: 6, title: 'The Victory', duration: '52 min', description: 'Chiến thắng cuối cùng nhưng với cái giá đắt...', thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 7, title: 'The Aftermath', duration: '49 min', description: 'Hậu quả của chiến thắng và những thay đổi...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { id: 8, title: 'The Future', duration: '51 min', description: 'Tương lai mới với những hy vọng và lo lắng...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 9, title: 'The Reunion', duration: '46 min', description: 'Cuộc đoàn tụ với những người đã mất...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
          { id: 10, title: 'The Legacy', duration: '54 min', description: 'Di sản để lại cho thế hệ sau...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
          { id: 11, title: 'The Choice', duration: '47 min', description: 'Lựa chọn cuối cùng sẽ quyết định tương lai...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
          { id: 12, title: 'The End', duration: '56 min', description: 'Kết thúc của mùa 2 với những câu hỏi mở...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/4.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
        ]
      }
    ]
  },
  '6': { // The Unseen World
    seasons: [
      {
        id: 1,
        name: 'Season 1',
        episodes: [
          { id: 1, title: 'The Hidden Truth', duration: '42 min', description: 'Khám phá sự thật ẩn giấu về thế giới...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/6.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 2, title: 'The Revelation', duration: '45 min', description: 'Sự tiết lộ về những bí mật cổ xưa...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/6.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { id: 3, title: 'The Awakening', duration: '48 min', description: 'Sự thức tỉnh của những sức mạnh tiềm ẩn...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/6.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
          { id: 4, title: 'The Journey', duration: '44 min', description: 'Cuộc hành trình đến những vùng đất mới...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/6.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
          { id: 5, title: 'The Confrontation', duration: '46 min', description: 'Cuộc đối đầu với những thế lực đen tối...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/6.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
          { id: 6, title: 'The Resolution', duration: '50 min', description: 'Giải pháp cuối cùng cho mọi vấn đề...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/6.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
        ]
      }
    ]
  },
  '7': { // Midnight Express
    seasons: [
      {
        id: 1,
        name: 'Season 1',
        episodes: [
          { id: 1, title: 'The Midnight Train', duration: '48 min', description: 'Chuyến tàu nửa đêm mang theo những bí mật...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/16.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
          { id: 2, title: 'The Mysterious Passenger', duration: '45 min', description: 'Hành khách bí ẩn với những mục đích không rõ...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/16.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
          { id: 3, title: 'The Disappearance', duration: '50 min', description: 'Sự biến mất của một hành khách quan trọng...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/16.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
          { id: 4, title: 'The Investigation', duration: '47 min', description: 'Cuộc điều tra về những sự kiện bí ẩn...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/16.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
          { id: 5, title: 'The Truth Revealed', duration: '52 min', description: 'Sự thật được hé lộ về chuyến tàu định mệnh...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/16.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4' },
          { id: 6, title: 'The Final Stop', duration: '49 min', description: 'Trạm dừng cuối cùng với những quyết định quan trọng...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/16.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
          { id: 7, title: 'The Escape', duration: '46 min', description: 'Cuộc trốn chạy khỏi những ràng buộc...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/16.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
          { id: 8, title: 'The New Beginning', duration: '51 min', description: 'Khởi đầu mới với những hy vọng...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/16.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
        ]
      }
    ]
  },
  '8': { // City Lights
    seasons: [
      {
        id: 1,
        name: 'Season 1',
        episodes: [
          { id: 1, title: 'City of Dreams', duration: '44 min', description: 'Thành phố của những giấc mơ và hy vọng...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/18.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
          { id: 2, title: 'Love in the City', duration: '42 min', description: 'Tình yêu trong thành phố không ngủ...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/18.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
          { id: 3, title: 'The Night Life', duration: '46 min', description: 'Cuộc sống về đêm với những bí mật...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/18.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
          { id: 4, title: 'The Morning After', duration: '43 min', description: 'Buổi sáng sau với những hậu quả...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/18.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' },
          { id: 5, title: 'The Reunion', duration: '45 min', description: 'Cuộc đoàn tụ với những người thân yêu...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/18.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
          { id: 6, title: 'The Farewell', duration: '48 min', description: 'Lời tạm biệt với thành phố yêu dấu...', thumbnail: 'https://flixgo.volkovdesign.com/main/img/covers/18.png', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
        ]
      }
    ]
  }
};

export default function SeriesDetailsScreen() {
  const { id, title, cover, categories, rating, year, duration, country, cast, description, episodes } = useLocalSearchParams();
  const { getLatestWatched, addToHistory } = useWatchHistory();
  const { addToMovieBox, removeFromMovieBox, isInMovieBox } = useMovieBox();
  const [likes, setLikes] = React.useState(256);
  const [unlikes, setUnlikes] = React.useState(12);
  const [liked, setLiked] = React.useState<boolean | null>(null);
  const [commentText, setCommentText] = React.useState('');
  const [comments, setComments] = React.useState<Array<{ author: string; text: string }>>([
    { author: 'Khách', text: 'Series này nghe plot hấp dẫn đó!' },
  ]);
  const [isPlayPressed, setIsPlayPressed] = React.useState(false);
  const [selectedSeason, setSelectedSeason] = React.useState(1);
  const width = Dimensions.get('window').width;

  // Get series data
  const seriesData = mockSeasonsData[safe(id) as keyof typeof mockSeasonsData];
  const currentSeason = seriesData?.seasons.find(s => s.id === selectedSeason);
  
  // Get latest watched episode for this series
  const latestWatched = getLatestWatched(safe(id));
  
  // Determine which episode to play when clicking the main play button
  const getPlayEpisode = () => {
    if (latestWatched && seriesData) {
      // Find the latest watched episode in current data
      const season = seriesData.seasons.find(s => s.id === latestWatched.season);
      if (season) {
        const episode = season.episodes.find(e => e.id === latestWatched.episode);
        if (episode) {
          return { season: latestWatched.season, episode };
        }
      }
    }
    
    // Fallback to first episode of first season
    if (seriesData && seriesData.seasons.length > 0) {
      const firstSeason = seriesData.seasons[0];
      if (firstSeason.episodes.length > 0) {
        return { season: firstSeason.id, episode: firstSeason.episodes[0] };
      }
    }
    
    return null;
  };

  const handleMainPlayPress = () => {
    const playEpisode = getPlayEpisode();
    if (playEpisode) {
      // Add to watch history
      addToHistory({
        seriesId: safe(id) as string,
        seriesTitle: safe(title) as string,
        season: playEpisode.season,
        episode: playEpisode.episode.id,
        episodeTitle: playEpisode.episode.title,
        episodeDescription: playEpisode.episode.description,
        thumbnail: playEpisode.episode.thumbnail,
        videoUrl: playEpisode.episode.videoUrl as string,
        duration: playEpisode.episode.duration,
      });

      // Navigate to player
      router.push({ 
        pathname: '/player/[id]', 
        params: { 
          id: safe(id), 
          title: `${safe(title)} - ${playEpisode.episode.title}`, 
          type: 'series',
          season: playEpisode.season.toString(),
          episode: playEpisode.episode.id.toString(),
          videoUrl: playEpisode.episode.videoUrl
        } 
      });
    }
  };

  const handleMovieBoxToggle = async () => {
    try {
      if (isInMovieBox(safe(id))) {
        removeFromMovieBox(safe(id));
      } else {
        addToMovieBox({
          id: safe(id),
          title: safe(title),
          cover: safe(cover),
          categories: safe(categories).split(' • '),
          rating: safe(rating),
          isSeries: true,
          year: safe(year),
          studio: 'N/A',
          episodes: safe(episodes),
          season: 'Season 1',
        });
      }
    } catch (error) {
      console.log('Error toggling MovieBox:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#e50914" />
        </Pressable>
        <View style={styles.logoContainer}>
          <FlixGoLogo />
        </View>
        <Pressable style={styles.bookmarkBtn} onPress={handleMovieBoxToggle}>
          <Ionicons 
            name={isInMovieBox(safe(id)) ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isInMovieBox(safe(id)) ? "#e50914" : "#fff"} 
          />
        </Pressable>
      </View>

      {/* Series Player Section - Full Width */}
      <ImageBackground 
        source={typeof cover === 'string' ? { uri: cover } : { uri: 'https://invalid-url.com' }} 
        style={styles.playerBackground}
        imageStyle={styles.playerBackgroundImage}
      >
        <View style={styles.playerGradient} />
        <View style={styles.playerContent}>
          <Text style={styles.playerTitle}>{safe(title)}</Text>
          <Text style={styles.playerSubtitle}>{safe(categories)} • {safe(year)}</Text>
          <View style={styles.playButtonContainer}>
            <WaveAnimation isActive={!isPlayPressed} color="#e50914" size={60} />
            <Pressable 
              style={({ pressed }) => [
                styles.playButton, 
                pressed && styles.playButtonPressed
              ]} 
              onPressIn={() => setIsPlayPressed(true)}
              onPressOut={() => setIsPlayPressed(false)}
              onPress={handleMainPlayPress}
            >
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.playButtonText}>Play</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>

      {/* Introduction Section - No Container */}
      <View style={styles.introSection}>
        <Text style={styles.sectionTitle}>Giới thiệu</Text>
        <Text style={styles.kv}>Năm phát hành: <Text style={styles.kvVal}>{safe(year)}</Text></Text>
        <Text style={styles.kv}>Mùa: <Text style={styles.kvVal}>{seriesData ? `${seriesData.seasons.length} mùa` : safe(duration)}</Text></Text>
        <Text style={styles.kv}>Quốc gia: <Text style={styles.kvVal}>{safe(country)}</Text></Text>
        <Text style={styles.kv}>Thể loại: <Text style={styles.kvVal}>Drama, Sci-Fi</Text></Text>
        <View style={styles.categoryLinks}>
          <Pressable onPress={() => router.push('/category/Drama' as any)} style={({ pressed }) => [styles.categoryLink, pressed && { opacity: 0.8 }]}>
            <Text style={styles.categoryLinkText}>Drama</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/category/Sci-Fi' as any)} style={({ pressed }) => [styles.categoryLink, pressed && { opacity: 0.8 }]}>
            <Text style={styles.categoryLinkText}>Sci-Fi</Text>
          </Pressable>
        </View>
        <Text style={styles.kv}>Diễn viên: <Text style={styles.kvVal}>Michelle Rodriguez, Vin Diesel, Paul Walker</Text></Text>
        <View style={styles.actorLinks}>
          <Pressable onPress={() => router.push('/actor/1' as any)} style={({ pressed }) => [styles.actorLink, pressed && { opacity: 0.8 }]}>
            <Text style={styles.actorLinkText}>Michelle Rodriguez</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/actor/2' as any)} style={({ pressed }) => [styles.actorLink, pressed && { opacity: 0.8 }]}>
            <Text style={styles.actorLinkText}>Vin Diesel</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/actor/3' as any)} style={({ pressed }) => [styles.actorLink, pressed && { opacity: 0.8 }]}>
            <Text style={styles.actorLinkText}>Paul Walker</Text>
          </Pressable>
        </View>
        <Text style={[styles.sectionText, { marginTop: 8 }]}>{safe(description, 'N/A')}</Text>
      </View>

      {/* Advertisement Banner - Full Width */}
      <View style={styles.adBanner}>
        <View style={styles.adPlaceholder}>
          <Text style={styles.adPlaceholderText}>Banner quảng cáo</Text>
        </View>
      </View>


      {/* Like / Unlike */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Đánh giá</Text>
        <View style={styles.likeRow}>
          <Pressable
            onPress={() => {
              if (liked === true) { setLiked(null); setLikes((n) => Math.max(0, n - 1)); }
              else { setLiked(true); setLikes((n) => n + 1); if (liked === false) setUnlikes((n) => Math.max(0, n - 1)); }
            }}
            style={({ pressed }) => [styles.likeBtn, liked === true && styles.likeBtnActive, pressed && { opacity: 0.9 }]}
          >
            <Text style={[styles.likeText, liked === true && styles.likeTextActive]}>👍 {likes}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (liked === false) { setLiked(null); setUnlikes((n) => Math.max(0, n - 1)); }
              else { setLiked(false); setUnlikes((n) => n + 1); if (liked === true) setLikes((n) => Math.max(0, n - 1)); }
            }}
            style={({ pressed }) => [styles.likeBtn, liked === false && styles.likeBtnActive, pressed && { opacity: 0.9 }]}
          >
            <Text style={[styles.likeText, liked === false && styles.likeTextActive]}>👎 {unlikes}</Text>
          </Pressable>
        </View>
      </View>

      {/* Episode list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danh sách tập</Text>
        
        {/* Season Selector */}
        {seriesData && seriesData.seasons.length > 1 && (
          <View style={styles.seasonSelector}>
            <Text style={styles.seasonLabel}>Chọn mùa:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonScroll}>
              {seriesData.seasons.map((season) => (
                <Pressable
                  key={season.id}
                  style={({ pressed }) => [
                    styles.seasonButton,
                    selectedSeason === season.id && styles.seasonButtonActive,
                    pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedSeason(season.id);
                  }}
                >
                  <Text style={[
                    styles.seasonButtonText,
                    selectedSeason === season.id && styles.seasonButtonTextActive
                  ]}>
                    {season.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Episodes List */}
        {currentSeason ? (
          <View style={styles.episodesList}>
            {currentSeason.episodes.map((episode, index) => {
              const isLatestWatched = latestWatched && 
                latestWatched.season === selectedSeason && 
                latestWatched.episode === episode.id;
              
              return (
                <Pressable
                  key={episode.id}
                  style={({ pressed }) => [
                    styles.episodeItem,
                    isLatestWatched && styles.episodeItemLatest,
                    pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    
                    // Add to watch history
                    addToHistory({
                      seriesId: safe(id) as string,
                      seriesTitle: safe(title) as string,
                      season: selectedSeason,
                      episode: episode.id,
                      episodeTitle: episode.title,
                      episodeDescription: episode.description,
                      thumbnail: episode.thumbnail,
                      videoUrl: episode.videoUrl as string,
                      duration: episode.duration,
                    });
                    
                    router.push({ 
                      pathname: '/player/[id]', 
                      params: { 
                        id: safe(id), 
                        title: `${safe(title)} - ${episode.title}`, 
                        type: 'series',
                        season: selectedSeason.toString(),
                        episode: episode.id.toString(),
                        videoUrl: episode.videoUrl
                      } 
                    });
                  }}
                >
                  <View style={styles.episodeThumbnail}>
                    <ImageWithPlaceholder 
                      source={{ uri: episode.thumbnail }} 
                      style={styles.episodeThumbnailImage} 
                      showRedBorder={false}
                    />
                    <View style={styles.episodePlayOverlay}>
                      <Ionicons name="play" size={20} color="#fff" />
                    </View>
                    {isLatestWatched && (
                      <View style={styles.episodeLatestBadge}>
                        <Text style={styles.episodeLatestText}>Tiếp tục</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.episodeContent}>
                    <View style={styles.episodeHeader}>
                      <Text style={styles.episodeNumber}>Tập {episode.id}</Text>
                      <Text style={styles.episodeDuration}>{episode.duration}</Text>
                    </View>
                    <Text style={styles.episodeTitle}>{episode.title}</Text>
                    <Text style={styles.episodeDescription} numberOfLines={2}>
                      {episode.description}
                    </Text>
                  </View>
                  <View style={styles.episodeAction}>
                    <Ionicons name="chevron-forward" size={20} color="#8e8e93" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.noEpisodesContainer}>
            <Ionicons name="tv-outline" size={48} color="#8e8e93" />
            <Text style={styles.noEpisodesText}>Chưa có thông tin tập</Text>
            <Text style={styles.noEpisodesSubtext}>Dữ liệu sẽ được cập nhật sớm</Text>
          </View>
        )}
      </View>

      {/* Comments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bình luận</Text>
        <View style={styles.commentForm}>
          <View style={styles.commentAvatar}>
            <Text style={styles.commentAvatarText}>U</Text>
          </View>
          <View style={styles.commentInputContainer}>
            <TextInput
              placeholder="Viết bình luận của bạn..."
              placeholderTextColor="#8e8e93"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              style={styles.commentInput}
            />
            <Pressable
              onPress={() => {
                const text = commentText.trim();
                if (!text) return;
                setComments((prev) => [{ author: 'Bạn', text }, ...prev]);
                setCommentText('');
              }}
              style={({ pressed }) => [styles.commentBtn, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.commentBtnText}>Gửi</Text>
            </Pressable>
          </View>
        </View>
        
        <View style={styles.commentsList}>
          {comments.map((c, idx) => (
            <View key={idx} style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{c.author.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{c.author}</Text>
                  <Text style={styles.commentTime}>2 phút trước</Text>
                </View>
                <Text style={styles.commentText}>{c.text}</Text>
                <View style={styles.commentActions}>
                  <Pressable style={({ pressed }) => [styles.commentActionBtn, pressed && { opacity: 0.7 }]}>
                    <Text style={styles.commentActionText}>👍 Thích</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.commentActionBtn, pressed && { opacity: 0.7 }]}>
                    <Text style={styles.commentActionText}>Trả lời</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14141b', paddingTop: 0 }, // Add padding top for fixed header
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { width: 36, height: 36, borderWidth: 2, borderColor: '#e50914', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { width: 36 },
  bookmarkBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  
  // Movie Player Section - Full Width
  playerBackground: { height: 300, justifyContent: 'flex-end' },
  playerBackgroundImage: { borderRadius: 0 },
  playerGradient: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  playerContent: { padding: 20, alignItems: 'flex-start' },
  playerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  playerSubtitle: { color: '#c7c7cc', fontSize: 16, marginBottom: 20 },
  playButtonContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  playButton: { 
    backgroundColor: '#e50914', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8,
    gap: 8,
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  playButtonPressed: {
    backgroundColor: '#b8070f',
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12
  },
  playButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  // Introduction Section - No Container
  introSection: { paddingHorizontal: 16, paddingVertical: 20 },
  
  // Advertisement Banner - Full Width
  adBanner: { paddingVertical: 16 },
  adPlaceholder: { height: 80, backgroundColor: '#2b2b31', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  adPlaceholderText: { color: '#8e8e93', fontSize: 14 },
  poster: { width: 110, height: 160, borderRadius: 10, backgroundColor: '#14141b' },
  metaCol: { marginLeft: 12, flex: 1 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  sub: { color: '#c7c7cc', marginTop: 6 },
  rate: { color: '#ffd166', marginTop: 6, fontWeight: '700' },


  section: { marginHorizontal: 12, marginBottom: 20, backgroundColor: '#1a1a1f', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  sectionTitle: { color: '#fff', fontWeight: '700', paddingTop: 20, fontSize: 16, marginBottom: 6 },
  sectionText: { color: '#c7c7cc' },
  kv: { color: '#c7c7cc', marginTop: 4 },
  kvVal: { color: '#fff' },
  likeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  likeBtn: { backgroundColor: '#1c1c23', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginRight: 10 },
  likeBtnActive: { backgroundColor: '#e50914' },
  likeText: { color: '#c7c7cc', fontWeight: '700' },
  likeTextActive: { color: '#fff' },
  // Season Selector
  seasonSelector: { marginBottom: 16 },
  seasonLabel: { color: '#c7c7cc', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  seasonScroll: { marginHorizontal: -4 },
  seasonButton: { 
    backgroundColor: '#1c1c23', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  seasonButtonActive: { 
    backgroundColor: '#e50914', 
    borderColor: '#e50914' 
  },
  seasonButtonText: { 
    color: '#c7c7cc', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  seasonButtonTextActive: { 
    color: '#fff' 
  },

  // Episodes List
  episodesList: { marginTop: 8 },
  episodeItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 8, 
    marginBottom: 8, 
    backgroundColor: '#121219', 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  episodeItemLatest: {
    borderWidth: 2,
    borderColor: '#e50914',
    backgroundColor: 'rgba(229, 9, 20, 0.05)'
  },
  episodeThumbnail: { 
    width: 80, 
    height: 60, 
    borderRadius: 8, 
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1c1c23'
  },
  episodeThumbnailImage: { 
    width: '100%', 
    height: '100%' 
  },
  episodePlayOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  episodeLatestBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#e50914',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  episodeLatestText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700'
  },
  episodeContent: { 
    flex: 1, 
    marginLeft: 12 
  },
  episodeHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  episodeNumber: { 
    color: '#e50914', 
    fontSize: 12, 
    fontWeight: '700', 
    marginRight: 8 
  },
  episodeDuration: { 
    color: '#8e8e93', 
    fontSize: 12 
  },
  episodeTitle: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  episodeDescription: { 
    color: '#c7c7cc', 
    fontSize: 12, 
    lineHeight: 16 
  },
  episodeAction: { 
    marginLeft: 8 
  },

  // No Episodes
  noEpisodesContainer: { 
    alignItems: 'center', 
    paddingVertical: 32 
  },
  noEpisodesText: { 
    color: '#8e8e93', 
    fontSize: 16, 
    fontWeight: '600', 
    marginTop: 12 
  },
  noEpisodesSubtext: { 
    color: '#8e8e93', 
    fontSize: 12, 
    marginTop: 4 
  },
  commentForm: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginTop: 12, 
    padding: 16, 
    backgroundColor: '#121219', 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  commentAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#e50914', 
    marginRight: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  commentAvatarText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  },
  commentInputContainer: { 
    flex: 1 
  },
  commentInput: { 
    minHeight: 80, 
    backgroundColor: '#1c1c23', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#e50914', 
    paddingHorizontal: 12, 
    paddingVertical: 10,
    color: '#e50914',
    fontSize: 14,
    textAlignVertical: 'top'
  },
  commentBtn: { 
    alignSelf: 'flex-end', 
    marginTop: 8, 
    backgroundColor: '#e50914', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20 
  },
  commentBtnText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 12 
  },
  commentsList: {
    marginTop: 16
  },
  commentItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 16, 
    padding: 12, 
    backgroundColor: '#121219', 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  commentContent: {
    flex: 1,
    marginLeft: 12
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  commentAuthor: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 14 
  },
  commentTime: {
    color: '#8e8e93',
    fontSize: 12
  },
  commentText: { 
    color: '#e0e0e0', 
    fontSize: 14, 
    lineHeight: 20,
    marginBottom: 8
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16
  },
  commentActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  commentActionText: {
    color: '#8e8e93',
    fontSize: 12,
    fontWeight: '600'
  },
  categoryLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8
  },
  categoryLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e50914'
  },
  categoryLinkText: {
    color: '#e50914',
    fontSize: 12,
    fontWeight: '600'
  },
  actorLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8
  },
  actorLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e50914'
  },
  actorLinkText: {
    color: '#e50914',
    fontSize: 12,
    fontWeight: '600'
  },
});


