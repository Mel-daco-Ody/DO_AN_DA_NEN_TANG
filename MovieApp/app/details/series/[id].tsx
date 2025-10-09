import { StyleSheet, View, Text, ImageBackground, ScrollView, Pressable, Dimensions, TextInput, Alert, FlatList, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import ImageWithPlaceholder from '../../../components/ImageWithPlaceholder';
import FlixGoLogo from '../../../components/FlixGoLogo';
import WaveAnimation from '../../../components/WaveAnimation';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import * as Haptics from 'expo-haptics';

function safe(value?: string | string[], fallback: string = 'N/A') {
  if (!value) return fallback;
  if (Array.isArray(value)) return value.join(' • ');
  return value;
}

// Episodes will be loaded from FilmZone backend
const mockSeasonsData: any = {};

export default function SeriesDetailsScreen() {
  const { id, title, cover, categories, rating, year, duration, country, cast, description, episodes } = useLocalSearchParams();
  const { authState } = useAuth();
  const { t } = useLanguage();
  const [likes, setLikes] = React.useState(0);
  const [unlikes, setUnlikes] = React.useState(0);
  const [liked, setLiked] = React.useState<boolean | null>(null);
  const [commentText, setCommentText] = React.useState('');
  const [comments, setComments] = React.useState<Array<{ author: string; text: string }>>([]);
  const [isPlayPressed, setIsPlayPressed] = React.useState(false);
  const [selectedSeason, setSelectedSeason] = React.useState(1);
  const [seriesData, setSeriesData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [latestWatched, setLatestWatched] = React.useState<any>(null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [movieData, setMovieData] = React.useState<any>(null);
  const [showSeasonDropdown, setShowSeasonDropdown] = React.useState(false);
  const width = Dimensions.get('window').width;

  // Load series data from FilmZone backend
  React.useEffect(() => {
    const loadSeriesData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { movieAppApi } = await import('../../../services/mock-api');
        
        // Load movie details from mockdata
        const movieResponse = await movieAppApi.getMovieById(parseInt(id as string));
        if (movieResponse.errorCode === 200) {
          setMovieData(movieResponse.data);
        }
        
        // Load episodes
        const episodesResponse = await movieAppApi.getEpisodesByMovie(parseInt(id as string));
        if (episodesResponse.errorCode === 200 && episodesResponse.data) {
          setSeriesData(episodesResponse.data);
          
          // Auto-select first season if no season is selected
          if (episodesResponse.data.seasons && episodesResponse.data.seasons.length > 0 && !selectedSeason) {
            setSelectedSeason(episodesResponse.data.seasons[0].id);
          }
        }
        
        // Load comments
        const commentsResponse = await movieAppApi.getCommentsByMovie(id as string);
        if (commentsResponse.errorCode === 200) {
          setComments(commentsResponse.data || []);
        }
        
        // Load user data
        if (authState.user) {
          const [progressResponse, savedResponse] = await Promise.all([
            movieAppApi.getEpisodeWatchProgress(),
            movieAppApi.isMovieSaved(parseInt(id as string))
          ]);
          
          if (progressResponse.errorCode === 200 && progressResponse.data) {
            // Find latest watched episode for this series
            const latest = progressResponse.data.find((progress: any) => 
              progress.episode?.movieID === parseInt(id as string)
            );
            setLatestWatched(latest);
          }
          
          if (savedResponse.errorCode === 200) {
            setIsSaved(savedResponse.data?.isSaved || false);
          }
        }
      } catch (error) {
        console.error('Error loading series data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeriesData();
  }, [id, authState.user]);

  const currentSeason = seriesData?.seasons?.find((s: any) => s.id === selectedSeason);

  const handleMovieBoxToggle = async () => {
    try {
      if (!authState.user) {
        Alert.alert('Login Required', 'Please login to save series to your list');
        return;
      }
      
      const { movieAppApi } = await import('../../../services/mock-api');
      
      if (isSaved) {
        // Remove from saved movies
        await movieAppApi.removeFromSavedMovies(parseInt(id as string));
        setIsSaved(false);
        Alert.alert('Success', 'Series removed from your list');
      } else {
        // Add to saved movies
        await movieAppApi.addToSavedMovies(parseInt(id as string));
        setIsSaved(true);
        Alert.alert('Success', 'Series added to your list');
      }
    } catch (error) {
      console.log('Error toggling MovieBox:', error);
      Alert.alert('Error', 'Failed to update your series list');
    }
  };
  
  // Determine which episode to play when clicking the main play button
  const getPlayEpisode = () => {
    if (latestWatched && seriesData) {
      // Find the latest watched episode in current data
      const season = seriesData.seasons.find((s: any) => s.id === latestWatched.season);
      if (season) {
        const episode = season.episodes.find((e: any) => e.id === latestWatched.episode);
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
      // TODO: Add to watch history with backend
      // addToHistory({
      //   seriesId: safe(id) as string,
      //   seriesTitle: safe(title) as string,
      //   season: playEpisode.season,
      //   episode: playEpisode.episode.id,
      //   episodeTitle: playEpisode.episode.title,
      //   episodeDescription: playEpisode.episode.description,
      //   thumbnail: playEpisode.episode.thumbnail,
      //   videoUrl: playEpisode.episode.videoUrl as string,
      //   duration: playEpisode.episode.duration,
      // });

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
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isSaved ? "#e50914" : "#fff"} 
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
          <Text style={styles.playerTitle}>{movieData?.title || safe(title)}</Text>
          <Text style={styles.playerSubtitle}>
            {movieData?.tags?.map((tag: any) => tag.tagName).join(' • ') || safe(categories)} • {movieData?.year || safe(year)}
          </Text>
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
        <Text style={styles.sectionTitle}>{t('details.introduction')}</Text>
        <Text style={styles.kv}>{t('details.release_year')}: <Text style={styles.kvVal}>{movieData?.year || safe(year)}</Text></Text>
        <Text style={styles.kv}>{t('details.seasons')}: <Text style={styles.kvVal}>
          {(() => {
            const seasonsCount = movieData?.totalSeasons || seriesData?.seasons?.length || 0;
            return seasonsCount > 0 ? `${seasonsCount} ${t('details.seasons').toLowerCase()}` : safe(duration);
          })()}
        </Text></Text>
        <Text style={styles.kv}>{t('details.country')}: <Text style={styles.kvVal}>{movieData?.region?.regionName || safe(country)}</Text></Text>
        <Text style={styles.kv}>{t('details.genre')}: <Text style={styles.kvVal}>{movieData?.tags?.map((tag: any) => tag.tagName).join(', ') || 'Drama, Sci-Fi'}</Text></Text>
        <View style={styles.categoryLinks}>
          {movieData?.tags?.map((tag: any) => (
            <Pressable key={tag.tagID} onPress={() => router.push(`/category/${tag.tagName}` as any)} style={({ pressed }) => [styles.categoryLink, pressed && { opacity: 0.8 }]}>
              <Text style={styles.categoryLinkText}>{tag.tagName}</Text>
            </Pressable>
          )) || (
            <>
              <Pressable onPress={() => router.push('/category/Drama' as any)} style={({ pressed }) => [styles.categoryLink, pressed && { opacity: 0.8 }]}>
                <Text style={styles.categoryLinkText}>Drama</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/category/Sci-Fi' as any)} style={({ pressed }) => [styles.categoryLink, pressed && { opacity: 0.8 }]}>
                <Text style={styles.categoryLinkText}>Sci-Fi</Text>
              </Pressable>
            </>
          )}
        </View>
        <Text style={styles.kv}>{t('details.actors')}: <Text style={styles.kvVal}>{movieData?.actors?.map((actor: any) => actor.fullName).join(', ') || 'Michelle Rodriguez, Vin Diesel, Paul Walker'}</Text></Text>
        <View style={styles.actorLinks}>
          {movieData?.actors?.map((actor: any) => (
            <Pressable key={actor.personID} onPress={() => router.push(`/actor/${actor.personID}` as any)} style={({ pressed }) => [styles.actorLink, pressed && { opacity: 0.8 }]}>
              <Text style={styles.actorLinkText}>{actor.fullName}</Text>
            </Pressable>
          )) || (
            <>
              <Pressable onPress={() => router.push('/actor/1' as any)} style={({ pressed }) => [styles.actorLink, pressed && { opacity: 0.8 }]}>
                <Text style={styles.actorLinkText}>Michelle Rodriguez</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/actor/2' as any)} style={({ pressed }) => [styles.actorLink, pressed && { opacity: 0.8 }]}>
                <Text style={styles.actorLinkText}>Vin Diesel</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/actor/3' as any)} style={({ pressed }) => [styles.actorLink, pressed && { opacity: 0.8 }]}>
                <Text style={styles.actorLinkText}>Paul Walker</Text>
              </Pressable>
            </>
          )}
        </View>
        <Text style={[styles.sectionText, { marginTop: 8 }]}>{movieData?.description || safe(description, 'N/A')}</Text>
      </View>

      {/* Advertisement Banner - Full Width */}
      <View style={styles.adBanner}>
        <Pressable 
          style={({ pressed }) => [styles.adContainer, pressed && { opacity: 0.9 }]}
          onPress={() => {
            // Handle ad click
            console.log('Ad clicked');
          }}
        >
          <ImageWithPlaceholder 
            source={{ uri: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=200&fit=crop' }}
            style={styles.adImage}
            showRedBorder={false}
          />
          <View style={styles.adOverlay}>
            <Text style={styles.adTitle}>🎬 Netflix Originals</Text>
            <Text style={styles.adSubtitle}>Xem phim mới nhất trên Netflix</Text>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>QUẢNG CÁO</Text>
            </View>
          </View>
        </Pressable>
      </View>


      {/* Like / Unlike */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('details.rating')}</Text>
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
        <Text style={styles.sectionTitle}>{t('details.episodes')}</Text>
        
        {/* Season Selector - Dropdown */}
        {seriesData && seriesData.seasons && seriesData.seasons.length > 0 && (
          <View style={styles.seasonSelector}>
            <Text style={styles.seasonLabel}>{t('details.seasons')}:</Text>
            <Pressable
              style={({ pressed }) => [
                styles.seasonDropdown,
                pressed && { opacity: 0.8 }
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setShowSeasonDropdown(!showSeasonDropdown);
              }}
            >
              <Text style={styles.seasonDropdownText}>
                {seriesData.seasons.find((s: any) => s.id === selectedSeason)?.name || `Season ${selectedSeason}`}
              </Text>
              <Ionicons 
                name={showSeasonDropdown ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#e50914" 
              />
            </Pressable>
          </View>
        )}

        {/* Season Dropdown Modal */}
        <Modal
          visible={showSeasonDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSeasonDropdown(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowSeasonDropdown(false)}
          >
            <View style={styles.seasonDropdownList}>
              {seriesData?.seasons?.map((season: any) => (
                <Pressable
                  key={season.id}
                  style={({ pressed }) => [
                    styles.seasonDropdownItem,
                    selectedSeason === season.id && styles.seasonDropdownItemActive,
                    pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedSeason(season.id);
                    setShowSeasonDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.seasonDropdownItemText,
                    selectedSeason === season.id && styles.seasonDropdownItemTextActive
                  ]}>
                    {season.name}
                  </Text>
                  {selectedSeason === season.id && (
                    <Ionicons name="checkmark" size={20} color="#e50914" />
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>

        {/* Episodes List */}
        {(() => {
          // Get episodes from selected season
          let episodesToRender = [];
          if (seriesData && seriesData.seasons && seriesData.seasons.length > 0) {
            const currentSeason = seriesData.seasons.find((s: any) => s.id === selectedSeason);
            if (currentSeason && currentSeason.episodes && currentSeason.episodes.length > 0) {
              episodesToRender = currentSeason.episodes;
            } else {
              // Fallback: get episodes from first season
              const firstSeason = seriesData.seasons[0];
              if (firstSeason && firstSeason.episodes && firstSeason.episodes.length > 0) {
                episodesToRender = firstSeason.episodes;
              }
            }
          }
          
          if (episodesToRender.length > 0) {
            const displayEpisodes = isExpanded ? episodesToRender : episodesToRender.slice(0, 3);
            
            return (
              <View style={styles.episodesContainer}>
                <FlatList
                  data={displayEpisodes}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: episode, index }) => {
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
                    
                    // TODO: Add to watch history with backend
                    // addToHistory({
                    //   seriesId: safe(id) as string,
                    //   seriesTitle: safe(title) as string,
                    //   season: selectedSeason,
                    //   episode: episode.id,
                    //   episodeTitle: episode.title,
                    //   episodeDescription: episode.description,
                    //   thumbnail: episode.thumbnail,
                    //   videoUrl: episode.videoUrl as string,
                    //   duration: episode.duration,
                    // });
                    
                    router.push({ 
                      pathname: '/player/[id]', 
                      params: { 
                        id: safe(id), 
                        title: `${movieData?.title || safe(title)} - ${episode.title}`, 
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
                            <Text style={styles.episodeLatestText}>{t('details.continue_watching')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.episodeContent}>
                    <View style={styles.episodeHeader}>
                      <Text style={styles.episodeNumber}>{t('details.episode')} {episode.episodeNumber}</Text>
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
                  }}
                />
                
                {/* Expand/Collapse Button */}
                {episodesToRender.length > 3 && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.expandButton,
                      pressed && { opacity: 0.8 }
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setIsExpanded(!isExpanded);
                    }}
                  >
                    <Text style={styles.expandButtonText}>
                      {isExpanded ? 'Thu gọn' : `Xem thêm ${episodesToRender.length - 3} ${t('details.episode').toLowerCase()}`}
                    </Text>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#e50914" 
                    />
                  </Pressable>
                )}
              </View>
            );
          } else {
            return (
              <View style={styles.noEpisodesContainer}>
                <Ionicons name="tv-outline" size={48} color="#8e8e93" />
                <Text style={styles.noEpisodesText}>{t('details.no_episodes')}</Text>
                <Text style={styles.noEpisodesSubtext}>{t('details.episodes_coming_soon')}</Text>
              </View>
            );
          }
        })()}
      </View>

      {/* Comments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('details.comments')}</Text>
        <View style={styles.commentForm}>
          <View style={styles.commentAvatar}>
            <Text style={styles.commentAvatarText}>U</Text>
          </View>
          <View style={styles.commentInputContainer}>
            <TextInput
              placeholder={t('details.write_comment')}
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
              <Text style={styles.commentBtnText}>{t('details.post_comment')}</Text>
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
  adBanner: { paddingVertical: 16, paddingHorizontal: 16 },
  adContainer: { 
    height: 120, 
    borderRadius: 12, 
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#2b2b31'
  },
  adImage: { 
    width: '100%', 
    height: '100%' 
  },
  adOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 16
  },
  adTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 4,
    textAlign: 'center'
  },
  adSubtitle: { 
    color: '#c7c7cc', 
    fontSize: 14, 
    marginBottom: 8,
    textAlign: 'center'
  },
  adBadge: { 
    backgroundColor: '#e50914', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 4 
  },
  adBadgeText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: '700' 
  },
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
  // Season Selector - Dropdown
  seasonSelector: { 
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  seasonLabel: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600',
    flex: 1
  },
  seasonDropdown: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 120,
    flex: 2,
    marginLeft: 12
  },
  seasonDropdownText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  seasonDropdownList: {
    backgroundColor: '#1a1a1f',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  seasonDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  seasonDropdownItemActive: {
    backgroundColor: 'rgba(229,9,20,0.1)'
  },
  seasonDropdownItemText: {
    color: '#c7c7cc',
    fontSize: 14,
    fontWeight: '500',
    flex: 1
  },
  seasonDropdownItemTextActive: {
    color: '#e50914',
    fontWeight: '600'
  },

  // Episodes List
  episodesList: { marginTop: 8 },
  episodesContainer: { marginTop: 8 },
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
  
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1c1c23',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e50914',
    marginTop: 8
  },
  expandButtonText: {
    color: '#e50914',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4
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


