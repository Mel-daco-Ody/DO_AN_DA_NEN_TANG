import { StyleSheet, View, Text, ImageBackground, ScrollView, Pressable, Dimensions, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { useState, useEffect } from 'react';
import ImageWithPlaceholder from '../../../components/ImageWithPlaceholder';
import FlixGoLogo from '../../../components/FlixGoLogo';
import WaveAnimation from '../../../components/WaveAnimation';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';

function safe(value?: string | string[], fallback: string = 'N/A') {
  if (!value) return fallback;
  if (Array.isArray(value)) return value.join(' • ');
  return value;
}

export default function MovieDetailsScreen() {
  const { id, title, cover, categories, rating, year, duration, country, cast, description } = useLocalSearchParams();
  const { authState } = useAuth();
  const { t } = useLanguage();
  const [movie, setMovie] = useState<any>(null);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const { movieAppApi } = await import('../../../services/mock-api');
        const response = await movieAppApi.getActorsByMovie(parseInt(id as string));
        if (response.errorCode === 200) {
          setMovie({ cast: response.data });
        }
      } catch (error) {
        console.error('Error loading movie cast:', error);
      }
    };

    loadMovie();
  }, [id]);
  const width = Dimensions.get('window').width;
  const [likes, setLikes] = React.useState(0);
  const [unlikes, setUnlikes] = React.useState(0);
  const [liked, setLiked] = React.useState<boolean | null>(null);
  const [commentText, setCommentText] = React.useState('');
  const [comments, setComments] = React.useState<Array<{ author: string; text: string }>>([]);
  const [isPlayPressed, setIsPlayPressed] = React.useState(false);
  
  // Backend data
  const [movieData, setMovieData] = React.useState<any>(null);
  const [userRating, setUserRating] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaved, setIsSaved] = React.useState(false);

  // Load movie data from backend
  React.useEffect(() => {
    const loadMovieData = async () => {
      try {
        const { movieAppApi } = await import('../../../services/mock-api');
        
        // Load movie details
        const movieResponse = await movieAppApi.getMovieById(parseInt(id as string));
        if (movieResponse.errorCode === 200) {
          setMovieData(movieResponse.data);
        }
        
        // Load comments
        const commentsResponse = await movieAppApi.getCommentsByMovie(id as string);
        if (commentsResponse.errorCode === 200) {
          setComments(commentsResponse.data || []);
        }
        
        // Load user rating and saved status
        if (authState.user) {
          const [ratingResponse, savedResponse] = await Promise.all([
            movieAppApi.getUserRating(parseInt(id as string)),
            movieAppApi.isMovieSaved(parseInt(id as string))
          ]);
          
          if (ratingResponse.errorCode === 200) {
            setUserRating(ratingResponse.data);
          }
          
          if (savedResponse.errorCode === 200) {
            setIsSaved(savedResponse.data?.isSaved || false);
          }
        }
      } catch (error) {
        console.error('Error loading movie data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMovieData();
  }, [id, authState.user]);

  const handleMovieBoxToggle = async () => {
    try {
      if (!authState.user) {
        Alert.alert('Login Required', 'Please login to save movies to your list');
        return;
      }
      
      const { movieAppApi } = await import('../../../services/mock-api');
      
      if (isSaved) {
        // Remove from saved movies
        await movieAppApi.removeFromSavedMovies(parseInt(id as string));
        setIsSaved(false);
        Alert.alert('Success', 'Movie removed from your list');
      } else {
        // Add to saved movies
        await movieAppApi.addToSavedMovies(parseInt(id as string));
        setIsSaved(true);
        Alert.alert('Success', 'Movie added to your list');
      }
    } catch (error) {
      console.log('Error toggling MovieBox:', error);
      Alert.alert('Error', 'Failed to update your movie list');
    }
  };

  const handleAddRating = async (stars: number) => {
    if (!authState.user) {
      Alert.alert('Login Required', 'Please login to rate movies');
      return;
    }
    
    try {
      const { movieAppApi } = await import('../../../services/mock-api');
      const response = await movieAppApi.addUserRating(parseInt(id as string), stars);
      
      if (response.errorCode === 200) {
        setUserRating(response.data);
        Alert.alert('Success', `You rated this movie ${stars} star${stars > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.log('Error adding rating:', error);
      Alert.alert('Error', 'Failed to add rating');
    }
  };

  const handleAddReview = async (reviewData: any) => {
    if (!authState.user) {
      Alert.alert('Login Required', 'Please login to add reviews');
      return;
    }
    
    try {
      const { movieAppApi } = await import('../../../services/mock-api');
      const response = await movieAppApi.addReview(reviewData);
      
      if (response.errorCode === 200) {
        Alert.alert('Success', 'Review added successfully');
        // Refresh reviews
        const reviewsResponse = await movieAppApi.getReviewsByMovie(id as string);
        if (reviewsResponse.errorCode === 200) {
          // Handle reviews data
          console.log('Reviews loaded:', reviewsResponse.data);
        }
      }
    } catch (error) {
      console.log('Error adding review:', error);
      Alert.alert('Error', 'Failed to add review');
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

      {/* Movie Player Section - Full Width */}
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
              onPress={() => {
                router.push({ pathname: '/player/[id]', params: { id: safe(id), title: safe(title), type: 'movie' } });
              }}
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
        <Text style={styles.kv}>{t('details.release_year')}: <Text style={styles.kvVal}>{safe(year)}</Text></Text>
        <Text style={styles.kv}>{t('details.duration')}: <Text style={styles.kvVal}>{safe(duration)}</Text></Text>
        <Text style={styles.kv}>{t('details.country')}: <Text style={styles.kvVal}>{safe(country)}</Text></Text>
        <Text style={styles.kv}>{t('details.genre')}: <Text style={styles.kvVal}>Action, Thriller</Text></Text>
        <View style={styles.categoryLinks}>
          <Pressable onPress={() => router.push('/category/Action' as any)} style={({ pressed }) => [styles.categoryLink, pressed && { opacity: 0.8 }]}>
            <Text style={styles.categoryLinkText}>Action</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/category/Thriller' as any)} style={({ pressed }) => [styles.categoryLink, pressed && { opacity: 0.8 }]}>
            <Text style={styles.categoryLinkText}>Thriller</Text>
          </Pressable>
        </View>
        <Text style={styles.kv}>{t('details.actors')}: <Text style={styles.kvVal}>{movie?.cast?.map((cast: any) => cast.characterName || cast.fullName).join(', ') || 'N/A'}</Text></Text>
        <View style={styles.actorLinks}>
          {movie?.cast?.slice(0, 3).map((cast: any, index: number) => (
            <Pressable 
              key={cast.personID || index} 
              onPress={() => router.push(`/actor/${cast.personID}` as any)} 
              style={({ pressed }) => [styles.actorLink, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.actorLinkText}>{cast.fullName}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.sectionText, { marginTop: 8 }]}>{safe(description, 'N/A')}</Text>
      </View>

      {/* Rating Section */}
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Rate This Movie</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => handleAddRating(star)}
              style={styles.starButton}
            >
              <Ionicons 
                name={userRating?.stars && star <= userRating.stars ? "star" : "star-outline"} 
                size={24} 
                color={userRating?.stars && star <= userRating.stars ? "#ffd166" : "#666"} 
              />
            </Pressable>
          ))}
        </View>
        {userRating && (
          <Text style={styles.ratingText}>You rated this movie {userRating.stars} star{userRating.stars > 1 ? 's' : ''}</Text>
        )}
      </View>

      {/* Comments Section */}
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Comments</Text>
        {authState.user ? (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
              onChangeText={setCommentText}
              value={commentText}
            />
            <Pressable
              style={styles.commentButton}
              onPress={() => {
                if (commentText.trim()) {
                  handleAddComment(commentText.trim());
                  setCommentText('');
                }
              }}
            >
              <Text style={styles.commentButtonText}>Post Comment</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.loginPrompt}>Please login to add comments</Text>
        )}
        
        {comments.length > 0 ? (
          <View style={styles.commentsList}>
            {comments.map((comment: any, index: number) => (
              <View key={comment.commentID || index} style={styles.commentItem}>
                <Text style={styles.commentAuthor}>User {comment.userID}</Text>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
        )}
      </View>
      <View style={styles.adBanner}>
        <Pressable 
          style={({ pressed }) => [styles.adContainer, pressed && { opacity: 0.9 }]}
          onPress={() => {
            // Handle ad click
            console.log('Ad clicked');
          }}
        >
          <ImageWithPlaceholder 
            source={{ uri: 'https://images.unsplash.com/photo-1489599803004-0b2b0a0b0b0b?w=800&h=200&fit=crop' }}
            style={styles.adImage}
            showRedBorder={false}
          />
          <View style={styles.adOverlay}>
            <Text style={styles.adTitle}>🎬 Disney+ Hotstar</Text>
            <Text style={styles.adSubtitle}>Xem phim bom tấn mới nhất</Text>
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
  
  // Rating Section
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16 },
  starButton: { marginHorizontal: 4 },
  ratingText: { color: '#ffd166', fontSize: 14, textAlign: 'center', marginTop: 8 },
  
  // Comments Section
  commentInputContainer: { marginVertical: 16 },
  commentInput: { 
    backgroundColor: '#1c1c23', 
    borderRadius: 8, 
    padding: 12, 
    color: '#fff', 
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 12
  },
  commentButton: { 
    backgroundColor: '#e50914', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    alignSelf: 'flex-end' 
  },
  commentButtonText: { color: '#fff', fontWeight: '600' },
  loginPrompt: { color: '#666', fontSize: 14, textAlign: 'center', marginVertical: 16 },
  commentsList: { marginTop: 16 },
  commentItem: { 
    backgroundColor: '#1c1c23', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8 
  },
  commentAuthor: { color: '#ffd166', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  commentContent: { color: '#fff', fontSize: 14, marginBottom: 4 },
  commentDate: { color: '#666', fontSize: 12 },
  noComments: { color: '#666', fontSize: 14, textAlign: 'center', marginVertical: 16 },
});


