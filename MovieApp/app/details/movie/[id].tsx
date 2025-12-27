import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ImageBackground, ScrollView, Pressable, Dimensions, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import ImageWithPlaceholder from '../../../components/ImageWithPlaceholder';
import FlixGoLogo from '../../../components/FlixGoLogo';
import WaveAnimation from '../../../components/WaveAnimation';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useSavedMoviesContext } from '../../../contexts/SavedMoviesContext';
import { useToast } from '../../../contexts/ToastContext';
import { AnimatedButton, AnimatedCard } from '../../../components/AnimatedPressable';
import { CommentSkeleton } from '../../../components/SkeletonPlaceholder';
import { CommentsEmptyState } from '../../../components/EmptyState';
import filmzoneApi from '../../../services/filmzone-api';

function safe(value?: string | string[], fallback: string = 'N/A') {
  if (!value) return fallback;
  if (Array.isArray(value)) return value.join(' • ');
  return value;
}

export default function MovieDetailsScreen() {
  const { id, title, cover, categories, rating, year, duration, country, cast, description } = useLocalSearchParams();
  const { authState } = useAuth();
  const { t } = useLanguage();
  const { refreshSavedMovies, isMovieSaved, addSavedMovie, removeSavedMovie } = useSavedMoviesContext();
  const { showSuccess, showError, showWarning } = useToast();
  const movieId = parseInt(id as string);
  const [actors, setActors] = useState<any[]>([]);

  useEffect(() => {
    const loadMovieActors = async () => {
      try {
        const response = await filmzoneApi.getPersonsByMovie(parseInt(id as string));
        const ok = response.errorCode >= 200 && response.errorCode < 300 && response.data;
        if (ok) {
          setActors(response.data || []);
        } else {
          setActors([]);
        }
      } catch (error) {
        setActors([]);
      }
    };

    loadMovieActors();
  }, [id]);
  const width = Dimensions.get('window').width;
  const [likes, setLikes] = React.useState(0);
  const [unlikes, setUnlikes] = React.useState(0);
  const [liked, setLiked] = React.useState<boolean | null>(null);
  const [commentText, setCommentText] = React.useState('');
  const [comments, setComments] = React.useState<any[]>([]);
  const [isPlayPressed, setIsPlayPressed] = React.useState(false);
  const [replyingToCommentID, setReplyingToCommentID] = React.useState<number | null>(null);
  const [replyText, setReplyText] = React.useState('');
  
  // Backend data
  const [movieData, setMovieData] = React.useState<any>(null);
  const [userRating, setUserRating] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  // Use context to get saved status instead of local state
  const isSaved = isMovieSaved(movieId);
  const [tags, setTags] = React.useState<any[]>([]);
  // Store user data for comments (userID -> UserDTO)
  const [commentUsers, setCommentUsers] = React.useState<Map<number, any>>(new Map());
  // Current user data from /user/me
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  // Load movie data from backend
  React.useEffect(() => {
    const loadMovieData = async () => {
      try {
        // Load movie details
        const movieResponse = await filmzoneApi.getMovieById(parseInt(id as string));
        if (movieResponse.errorCode === 200 && movieResponse.data) {
          setMovieData(movieResponse.data);
        }

        // Load tags (genres) via MovieTag
        try {
          const tagsResponse = await filmzoneApi.getTagsByMovie(parseInt(id as string));
          const ok = tagsResponse.errorCode >= 200 && tagsResponse.errorCode < 300 && tagsResponse.data;
          if (ok) {
            setTags(tagsResponse.data || []);
          } else {
            setTags([]);
          }
        } catch {
          setTags([]);
        }
        
        // Load comments
        const commentsResponse = await filmzoneApi.getCommentsByMovieID(parseInt(id as string));
        const commentsOk = (commentsResponse as any).success === true || (commentsResponse.errorCode >= 200 && commentsResponse.errorCode < 300);
        if (commentsOk && commentsResponse.data) {
          const commentsData = commentsResponse.data || [];
          // Sort comments by createdAt descending (newest first)
          const sortedComments = [...commentsData].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Descending order (newest first)
          });
          setComments(sortedComments);
          
          // Fetch user data for each unique userID in comments
          // Filter out invalid userIDs (0, null, undefined, negative)
          const uniqueUserIDs = [...new Set(
            commentsData
              .map((c: any) => c.userID)
              .filter((id: any) => id != null && id !== undefined && !isNaN(Number(id)) && Number(id) > 0)
              .map((id: any) => Number(id))
          )];
          
          console.log('Comments loaded:', commentsData.length);
          console.log('Unique userIDs to fetch:', uniqueUserIDs);
          
          const userDataMap = new Map<number, any>();
          
          // Fetch user data for all unique userIDs
          await Promise.all(
            uniqueUserIDs.map(async (userID: number) => {
              try {
                const userResponse = await filmzoneApi.getUserById(userID);
                const userOk = (userResponse as any).success === true || (userResponse.errorCode >= 200 && userResponse.errorCode < 300);
                if (userOk && userResponse.data) {
                  userDataMap.set(userID, userResponse.data);
                  console.log(`User data loaded for userID ${userID}:`, userResponse.data.userName || userResponse.data.name);
                } else {
                  console.log(`Failed to load user data for userID ${userID}:`, userResponse.errorMessage || 'Unknown error');
                }
              } catch (err) {
                console.error(`Error loading user data for userID ${userID}:`, err);
              }
            })
          );
          
          console.log('User data map size:', userDataMap.size);
          setCommentUsers(userDataMap);
        }
        
        // Load current user data from /user/me
        if (authState.user && authState.user.userID) {
          try {
            const currentUserResponse = await filmzoneApi.getCurrentUser();
            const currentUserOk = (currentUserResponse as any).success === true || (currentUserResponse.errorCode >= 200 && currentUserResponse.errorCode < 300);
            if (currentUserOk && currentUserResponse.data) {
              console.log('Current user loaded:', currentUserResponse.data.userName || currentUserResponse.data.name);
              setCurrentUser(currentUserResponse.data);
            } else {
              console.log('Failed to load current user, using authState.user:', currentUserResponse.errorMessage);
              // Fallback to authState.user if API fails
              setCurrentUser(authState.user);
            }
          } catch (err) {
            console.log('Failed to load current user, using authState.user:', err);
            // Fallback to authState.user if API fails
            setCurrentUser(authState.user);
          }
          
          // Load user rating by fetching all ratings for user and filtering by movieID
          try {
            const ratingResponse = await filmzoneApi.getUserRatingsByUserId(authState.user.userID);
            const ratingOk = (ratingResponse as any).success === true || (ratingResponse.errorCode >= 200 && ratingResponse.errorCode < 300);
            if (ratingOk && ratingResponse.data) {
              const ratings = Array.isArray(ratingResponse.data) ? ratingResponse.data : [ratingResponse.data];
              const movieRating = ratings.find((r: any) => r.movieID === parseInt(id as string));
              if (movieRating) {
                setUserRating(movieRating);
              }
            }
          } catch (err) {
            console.log('Failed to load user rating:', err);
          }
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMovieData();
  }, [id, authState.user]);

  // Also load current user when authState changes
  React.useEffect(() => {
    const loadCurrentUser = async () => {
      if (authState.user && authState.user.userID) {
        try {
          const currentUserResponse = await filmzoneApi.getCurrentUser();
          const currentUserOk = (currentUserResponse as any).success === true || (currentUserResponse.errorCode >= 200 && currentUserResponse.errorCode < 300);
          if (currentUserOk && currentUserResponse.data) {
            setCurrentUser(currentUserResponse.data);
          } else {
            // Fallback to authState.user
            setCurrentUser(authState.user);
          }
        } catch (err) {
          // Fallback to authState.user
          setCurrentUser(authState.user);
        }
      } else {
        setCurrentUser(null);
      }
    };
    loadCurrentUser();
  }, [authState.user]);

  const handleMovieBoxToggle = async () => {
    try {
      if (!authState.user || !authState.user.userID) {
        showWarning('Please login to save movies to your list');
        return;
      }
      
      const movieId = parseInt(id as string);
      
      try {
        if (isSaved) {
          // Remove from saved movies using context
          console.log('MovieDetail: Removing movie from saved list:', movieId);
          await removeSavedMovie(movieId);
          showSuccess('Movie removed from your list');
        } else {
          // Add to saved movies using context
          console.log('MovieDetail: Adding movie to saved list:', movieId);
          await addSavedMovie(movieId);
          showSuccess('Movie added to your list!');
        }
        // Context is already updated, UI will automatically reflect the change
      } catch (error) {
        console.error('MovieDetail: Error toggling saved status:', error);
        showError('Failed to update your movie list');
      }
    } catch (error) {
      console.error('MovieDetail: Error toggling saved status:', error);
      showError('Failed to update your movie list');
    }
  };

  const handleAddRating = async (stars: number) => {
    if (!authState.user) {
      showWarning('Please login to rate movies');
      return;
    }
    
    try {
      const movieId = parseInt(id as string);
      const userId = authState.user.userID;
      // First time: CreateUserRating. Next time: UpdateUserRating.
      const response = userRating?.userRatingID
        ? await filmzoneApi.updateUserRating({
            userRatingID: userRating.userRatingID,
            userID: userId,
            movieID: movieId,
            rating: stars,
          })
        : await filmzoneApi.createUserRating({ userID: userId, movieID: movieId, rating: stars });

      const ok = (response as any).success === true || (response.errorCode >= 200 && response.errorCode < 300);
      if (ok && response.data) {
        setUserRating({ ...response.data, stars: (response.data as any).stars ?? (response.data as any).rating ?? stars });
      }
    } catch (error) {
      console.error('Error adding rating:', error);
    }
  };

  const handleAddReview = async (reviewData: any) => {
    if (!authState.user) {
      showWarning('Please login to add reviews');
      return;
    }
    
    try {
      const response = await filmzoneApi.addReview(reviewData);
      
      if (response.errorCode === 200) {
        showSuccess('Review added successfully!');
        // Refresh reviews (not implemented, legacy)
        const reviewsResponse = await filmzoneApi.getReviewsByMovie(id as string);
        if (reviewsResponse.errorCode === 200) {
          // Handle reviews data if needed
        }
      }
    } catch (error) {
      showError('Failed to add review');
    }
  };

  // Helper function to organize comments with replies
  const organizeCommentsWithReplies = (allComments: any[]) => {
    // Separate parent comments and replies
    const parentComments = allComments.filter((c: any) => !c.parentID || c.parentID === null || c.parentID === 0);
    const replies = allComments.filter((c: any) => c.parentID && c.parentID !== null && c.parentID !== 0);
    
    // Group replies by parentID
    const repliesByParent = new Map<number, any[]>();
    replies.forEach((reply: any) => {
      const parentID = Number(reply.parentID);
      if (!repliesByParent.has(parentID)) {
        repliesByParent.set(parentID, []);
      }
      repliesByParent.get(parentID)!.push(reply);
    });
    
    // Sort parent comments by date (newest first)
    const sortedParents = [...parentComments].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    // Sort replies by date (oldest first - to show conversation flow)
    repliesByParent.forEach((replyList) => {
      replyList.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB; // Oldest first
      });
    });
    
    return { sortedParents, repliesByParent };
  };

  const handleReplyComment = async (parentCommentID: number) => {
    const text = replyText.trim();
    if (!text) return;
    
    if (!authState.user || !authState.user.userID) {
      showWarning('Please login to reply to comments');
      return;
    }
    
    try {
      const response = await filmzoneApi.createComment({
        movieID: parseInt(id as string),
        userID: authState.user.userID,
        content: text,
        parentID: parentCommentID,
        likeCount: 0,
      });
      
      const responseOk = (response as any).success === true || (response.errorCode >= 200 && response.errorCode < 300);
      if (responseOk) {
        showSuccess('Reply posted successfully!');
        // Reload comments to get updated list
        const commentsResponse = await filmzoneApi.getCommentsByMovieID(parseInt(id as string));
        const commentsOk = (commentsResponse as any).success === true || (commentsResponse.errorCode >= 200 && commentsResponse.errorCode < 300);
        if (commentsOk && commentsResponse.data) {
          const commentsData = commentsResponse.data || [];
          // Sort comments by createdAt descending (newest first)
          const sortedComments = [...commentsData].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Descending order (newest first)
          });
          setComments(sortedComments);
          
          // Fetch user data for each unique userID in comments
          const uniqueUserIDs = [...new Set(
            commentsData
              .map((c: any) => c.userID)
              .filter((id: any) => id != null && id !== undefined && !isNaN(Number(id)) && Number(id) > 0)
              .map((id: any) => Number(id))
          )];
          
          const userDataMap = new Map<number, any>();
          
          await Promise.all(
            uniqueUserIDs.map(async (userID: number) => {
              try {
                const userResponse = await filmzoneApi.getUserById(userID);
                const userOk = (userResponse as any).success === true || (userResponse.errorCode >= 200 && userResponse.errorCode < 300);
                if (userOk && userResponse.data) {
                  userDataMap.set(userID, userResponse.data);
                }
              } catch (err) {
                console.error(`Error loading user data for userID ${userID}:`, err);
              }
            })
          );
          
          setCommentUsers(userDataMap);
        }
        setReplyText('');
        setReplyingToCommentID(null);
      } else {
        showError(response.errorMessage || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error replying to comment:', error);
      showError('Failed to post reply');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={{ flex: 1, marginTop: 40  }}>
        {/* Header (fixed, not scrollable) */}
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

        <ScrollView 
          style={styles.container} 
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Movie Player Section - Full Width */}
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
                onPress={() => {
                  const movieId = id as string;
                  if (!movieId || isNaN(parseInt(movieId))) {
                    showError('Invalid movie ID');
                    return;
                  }
                  router.push({ pathname: '/player/[id]', params: { id: movieId, title: safe(title), type: 'movie' } });
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
        <Text style={styles.kv}>{t('details.release_year')}: <Text style={styles.kvVal}>{movieData?.year || safe(year)}</Text></Text>
        <Text style={styles.kv}>
          {t('details.duration')}: <Text style={styles.kvVal}>
            {movieData?.durationSeconds
              ? `${Math.floor(movieData.durationSeconds / 60)} min`
              : safe(duration)}
          </Text>
        </Text>
        <Text style={styles.kv}>{t('details.country')}: <Text style={styles.kvVal}>{movieData?.region?.regionName || safe(country)}</Text></Text>
        <Text style={styles.kv}>
          {t('details.genre')}: <Text style={styles.kvVal}>
            {tags.length
              ? tags.map((tag: any) => tag.tagName).join(', ')
              : safe(categories)}
          </Text>
        </Text>
        {tags.length ? (
          <View style={styles.categoryLinks}>
            {tags.map((tag: any) => (
              <Pressable
                key={tag.tagID}
                onPress={() => router.push(`/category/${tag.tagName}` as any)}
                style={({ pressed }) => [styles.categoryLink, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.categoryLinkText}>{tag.tagName}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <Text style={styles.kv}>
          {t('details.actors')}: 
        </Text>
        <View style={styles.actorLinks}>
          {actors.slice(0, actors.length).map((actor: any, index: number) => (
            <Pressable
              key={actor.personID || index}
              onPress={() => actor.personID && router.push(`/actor/${actor.personID}` as any)}
              style={({ pressed }) => [styles.actorLink, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.actorLinkText}>{actor.fullName}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.sectionText, { marginTop: 8 }]}>{movieData?.description || 'No description available'}</Text>
      </View>

      {/* Advertisement Banner - Full Width */}
      <View style={styles.adBanner}>
        <Pressable 
          style={({ pressed }) => [styles.adContainer, pressed && { opacity: 0.9 }]}
          onPress={() => {
            // Handle ad click
          }}
        >
          <ImageWithPlaceholder 
            source={{ uri: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=200&fit=crop' }}
            style={styles.adImage}
            showRedBorder={false}
          />
          <View style={styles.adOverlay}>
            <Text style={styles.adTitle}>Netflix Originals</Text>
            <Text style={styles.adSubtitle}>Xem phim mới nhất trên Netflix</Text>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>QUẢNG CÁO</Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Advertisement Banner - Full Width */}
      <View style={styles.adBanner}>
        <Pressable 
          style={({ pressed }) => [styles.adContainer, pressed && { opacity: 0.9 }]}
          onPress={() => {
            // Handle ad click
          }}
        >
          <ImageWithPlaceholder 
            source={{ uri: 'https://images.unsplash.com/photo-1489599803004-0b2b0a0b0b0b?w=800&h=200&fit=crop' }}
            style={styles.adImage}
            showRedBorder={false}
          />
          <View style={styles.adOverlay}>
            <Text style={styles.adTitle}>Disney+ Hotstar</Text>
            <Text style={styles.adSubtitle}>Xem phim bom tấn mới nhất</Text>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>QUẢNG CÁO</Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Rating Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rate This Movie</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => handleAddRating(star)}
              style={styles.starButton}
            >
              <Ionicons 
                name={(userRating?.rating ?? userRating?.stars) && star <= (userRating?.rating ?? userRating?.stars) ? "star" : "star-outline"} 
                size={28} 
                color={(userRating?.rating ?? userRating?.stars) && star <= (userRating?.rating ?? userRating?.stars) ? "#ffd166" : "#666"} 
              />
            </Pressable>
          ))}
        </View>
        {userRating && (
          <Text style={styles.ratingText}>You rated this movie {userRating.rating ?? userRating.stars} star{(userRating.rating ?? userRating.stars) > 1 ? 's' : ''}</Text>
        )}
        <Text style={styles.ratingSubtext}>Tap a star to rate this movie</Text>
      </View>

      {/* Comments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('details.comments')}</Text>
        <View style={styles.commentForm}>
          <View style={styles.commentAvatar}>
            {(() => {
              const user = currentUser || authState.user;
              const avatar = user?.avatar || user?.profilePicture;
              const userName = user?.name || user?.userName || 'U';
              
              return avatar ? (
                <Image
                  source={{ uri: avatar }}
                  style={styles.commentAvatarImage}
                />
              ) : (
                <Text style={styles.commentAvatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              );
            })()}
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
              onPress={async () => {
                const text = commentText.trim();
                if (!text) return;
                
                if (!authState.user || !authState.user.userID) {
                  return;
                }
                
                try {
                  const response = await filmzoneApi.createComment({
                    movieID: parseInt(id as string),
                    userID: authState.user.userID,
                    content: text,
                    likeCount: 0,
                  });
                  
                  const responseOk = (response as any).success === true || (response.errorCode >= 200 && response.errorCode < 300);
                  if (responseOk) {
                    // Reload comments to get updated list
                    const commentsResponse = await filmzoneApi.getCommentsByMovieID(parseInt(id as string));
                    const commentsOk = (commentsResponse as any).success === true || (commentsResponse.errorCode >= 200 && commentsResponse.errorCode < 300);
                    if (commentsOk && commentsResponse.data) {
                      const commentsData = commentsResponse.data || [];
                      // Sort comments by createdAt descending (newest first)
                      const sortedComments = [...commentsData].sort((a, b) => {
                        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return dateB - dateA; // Descending order (newest first)
                      });
                      setComments(sortedComments);
                      
                      // Fetch user data for each unique userID in comments
                      // Filter out invalid userIDs (0, null, undefined, negative)
                      const uniqueUserIDs = [...new Set(
                        commentsData
                          .map((c: any) => c.userID)
                          .filter((id: any) => id != null && id !== undefined && !isNaN(Number(id)) && Number(id) > 0)
                          .map((id: any) => Number(id))
                      )];
                      
                      const userDataMap = new Map<number, any>();
                      
                      // Fetch user data for all unique userIDs
                      await Promise.all(
                        uniqueUserIDs.map(async (userID: number) => {
                          try {
                            const userResponse = await filmzoneApi.getUserById(userID);
                            const userOk = (userResponse as any).success === true || (userResponse.errorCode >= 200 && userResponse.errorCode < 300);
                            if (userOk && userResponse.data) {
                              userDataMap.set(userID, userResponse.data);
                            }
                          } catch (err) {
                            console.error(`Error loading user data for userID ${userID}:`, err);
                          }
                        })
                      );
                      
                      setCommentUsers(userDataMap);
                    }
                    setCommentText('');
                  }
                } catch (error) {
                  console.error('Error creating comment:', error);
                }
              }}
              style={({ pressed }) => [styles.commentBtn, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.commentBtnText}>{t('details.post_comment')}</Text>
            </Pressable>
          </View>
        </View>
        
        {/* Comments List */}
        {(() => {
          const { sortedParents, repliesByParent } = organizeCommentsWithReplies(comments);
          const totalCommentsCount = comments.length;
          
          const renderComment = (c: any, idx: number, isReply: boolean = false) => {
            const userID = c.userID ? Number(c.userID) : null;
            const user = userID ? commentUsers.get(userID) : null;
            const userName = user?.name || user?.userName || c.userName || 'User';
            const userAvatar = user?.avatar || user?.profilePicture || null;
            const avatarInitial = userName.charAt(0).toUpperCase();
            
            return (
              <View key={c.commentID || idx} style={[styles.commentItem, isReply && styles.replyCommentItem]}>
                <View style={styles.commentAvatar}>
                  {userAvatar ? (
                    <Image
                      source={{ uri: userAvatar }}
                      style={styles.commentAvatarImage}
                    />
                  ) : (
                    <Text style={styles.commentAvatarText}>{avatarInitial}</Text>
                  )}
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{userName}</Text>
                    <Text style={styles.commentTime}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recently'}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{c.content}</Text>
                  {!isReply && (
                    <View style={styles.commentActions}>
                      <Pressable style={({ pressed }) => [styles.commentActionBtn, pressed && { opacity: 0.7 }]}>
                        <Text style={styles.commentActionText}>Likes {c.likeCount || 0}</Text>
                      </Pressable>
                      <Pressable 
                        style={({ pressed }) => [styles.commentActionBtn, pressed && { opacity: 0.7 }]}
                        onPress={() => {
                          if (replyingToCommentID === c.commentID) {
                            setReplyingToCommentID(null);
                            setReplyText('');
                          } else {
                            setReplyingToCommentID(c.commentID);
                            setReplyText('');
                          }
                        }}
                      >
                        <Text style={styles.commentActionText}>
                          {replyingToCommentID === c.commentID ? 'Hủy' : 'Trả lời'}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                  {!isReply && replyingToCommentID === c.commentID && (
                    <View style={styles.replyContainer}>
                      <View style={styles.replyInputContainer}>
                        <TextInput
                          placeholder="Viết phản hồi..."
                          placeholderTextColor="#8e8e93"
                          value={replyText}
                          onChangeText={setReplyText}
                          multiline
                          style={styles.replyInput}
                        />
                      </View>
                      <View style={styles.replyActions}>
                        <Pressable
                          onPress={() => {
                            setReplyingToCommentID(null);
                            setReplyText('');
                          }}
                          style={({ pressed }) => [styles.replyCancelBtn, pressed && { opacity: 0.7 }]}
                        >
                          <Text style={styles.replyCancelText}>Hủy</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleReplyComment(c.commentID)}
                          style={({ pressed }) => [styles.replySubmitBtn, pressed && { opacity: 0.9 }]}
                          disabled={!replyText.trim()}
                        >
                          <Text style={[styles.replySubmitText, !replyText.trim() && { opacity: 0.5 }]}>
                            Gửi
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          };
          
          return (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                {'All Comments'} ({totalCommentsCount})
              </Text>
              <ScrollView 
                style={styles.commentsList} 
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {sortedParents.length === 0 ? (
                  <Text style={styles.noCommentsText}>{'No comments yet. Be the first to comment!'}</Text>
                ) : (
                  sortedParents.map((parentComment, idx) => {
                    const replies = repliesByParent.get(parentComment.commentID) || [];
                    return (
                      <View key={parentComment.commentID || idx}>
                        {renderComment(parentComment, idx, false)}
                        {replies.map((reply, replyIdx) => renderComment(reply, replyIdx, true))}
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </>
          );
        })()}
        </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#14141b' },
  
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
    marginTop: 12,
    maxHeight: 450,
    backgroundColor: 'rgba(20, 20, 27, 0.6)',
    borderRadius: 16,
    padding: 12,
  },
  noCommentsText: {
    color: '#8e8e93',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
    fontStyle: 'italic',
  },
  commentItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12, 
    padding: 14, 
    backgroundColor: 'rgba(30, 30, 40, 0.9)', 
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  replyCommentItem: {
    marginLeft: 40, // Indent replies to the right
    backgroundColor: 'rgba(30, 30, 40, 0.9)', // Slightly darker for visual distinction
    borderLeftWidth: 3,
    borderLeftColor: '#e50914', // Red border on left to show it's a reply
  },
  commentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e50914',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#121219',
    overflow: 'hidden',
    shadowColor: '#121219',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  commentAvatarImage: {
    width: '100%',
    height: '100%',
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  commentContent: {
    flex: 1,
    marginLeft: 14
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  commentAuthor: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 15,
    letterSpacing: 0.3,
  },
  commentTime: {
    color: '#ffd166',
    fontSize: 11,
    fontWeight: '500',
  },
  commentText: { 
    color: '#e8e8e8', 
    fontSize: 14, 
    lineHeight: 21,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 10,
    marginTop: 4,
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  commentActionText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600'
  },
  replyContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  replyInputContainer: {
    marginBottom: 8,
  },
  replyInput: {
    backgroundColor: '#121219',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  replyCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  replyCancelText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  replySubmitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e50914',
  },
  replySubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryLinks: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginTop: 8,
    gap: 8,
    overflow: 'visible'
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
    gap: 8,
    overflow: 'visible'
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
  ratingContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginVertical: 16,
    gap: 8
  },
  starButton: { 
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  ratingText: { 
    color: '#ffd166', 
    fontSize: 16, 
    fontWeight: '600',
    textAlign: 'center', 
    marginTop: 8 
  },
  ratingSubtext: { 
    color: '#8e8e93', 
    fontSize: 14, 
    textAlign: 'center', 
    marginTop: 4 
  },
  
});


