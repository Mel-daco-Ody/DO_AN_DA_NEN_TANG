import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, StatusBar, Animated, ScrollView, Alert } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import FlixGoLogo from '../../components/FlixGoLogo';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Slider from '@react-native-community/slider';
import { filmzoneApi } from '../../services/filmzone-api';

export default function VideoPlayerScreen() {
  const { id, title, type, videoUrl, season, episode } = useLocalSearchParams();
  const { authState } = useAuth();
  const { showInfo } = useToast();
  const videoRef = useRef<Video>(null);
  const lastProgressUpdateRef = useRef<number>(0);
  const bufferReadyLoggedRef = useRef<boolean>(false);
  const [status, setStatus] = useState({});
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoUri, setVideoUri] = useState<string>('');
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [currentSourceId, setCurrentSourceId] = useState<number | undefined>(undefined);
  const [currentEpisodeSourceId, setCurrentEpisodeSourceId] = useState<number | undefined>(undefined);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [requiresSubscription, setRequiresSubscription] = useState<boolean>(false);
  const [waveAnimation1] = useState(new Animated.Value(0));
  const [waveAnimation2] = useState(new Animated.Value(0));
  const [waveAnimation3] = useState(new Animated.Value(0));
  const [isToggling, setIsToggling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState('Vietnamese');
  const [loadingElapsedSeconds, setLoadingElapsedSeconds] = useState(0);
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subtitle languages data
  const subtitleLanguages = [
    { id: 'off', name: 'Tắt phụ đề', code: 'off' },
    { id: 'vi', name: 'Tiếng Việt', code: 'vi' },
    { id: 'en', name: 'English', code: 'en' },
    { id: 'zh', name: '中文', code: 'zh' },
    { id: 'ja', name: '日本語', code: 'ja' },
    { id: 'ko', name: '한국어', code: 'ko' },
    { id: 'th', name: 'ไทย', code: 'th' },
    { id: 'fr', name: 'Français', code: 'fr' },
    { id: 'de', name: 'Deutsch', code: 'de' },
    { id: 'es', name: 'Español', code: 'es' },
  ];

  // Check if user has valid VIP subscription
  const checkVipSubscription = async (): Promise<boolean> => {
    try {
      const userId = authState.user?.userID;
      if (!userId) {
        return false;
      }

      const subsResponse = await filmzoneApi.getSubscriptionsByUser(userId);
      const subsOk = (subsResponse as any).success === true || (subsResponse.errorCode >= 200 && subsResponse.errorCode < 300);
      
      if (subsOk && subsResponse.data) {
        const subsArr = Array.isArray(subsResponse.data) ? subsResponse.data : [subsResponse.data];
        if (subsArr.length > 0) {
          // Get the latest subscription (max subscriptionID)
          const latestSub = subsArr
            .filter((s: any) => s)
            .sort((a: any, b: any) => {
              const aId = Number(a.subscriptionID ?? a.subscriptionId ?? 0);
              const bId = Number(b.subscriptionID ?? b.subscriptionId ?? 0);
              return bId - aId;
            })[0];

          // Check if currentPeriodEnd >= current time
          if (latestSub?.currentPeriodEnd) {
            const periodEnd = new Date(latestSub.currentPeriodEnd);
            const now = new Date();
            return periodEnd >= now;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking VIP subscription:', error);
      return false;
    }
  };

  // Load video source from API
  useEffect(() => {
    const loadVideoSource = async () => {
      try {
        setIsLoadingVideo(true);
        setVideoError(false);
        setLoadingElapsedSeconds(0);
        
        // Start interval to update loading time every 10 seconds
        loadingIntervalRef.current = setInterval(() => {
          setLoadingElapsedSeconds(prev => prev + 10);
        }, 10000);
        
        console.log('VideoPlayerScreen: loadVideoSource params', { id, type, episode, videoUrl });

        if (type === 'series' && episode) {
          // Load episode source
          const episodeId = parseInt(episode as string);
          const sourcesResponse = await filmzoneApi.getEpisodeSourcesByEpisodeId(episodeId);
          
          if (sourcesResponse.errorCode >= 200 && sourcesResponse.errorCode < 300 && sourcesResponse.data && sourcesResponse.data.length > 0) {
            // Get the first active source (or VIP source if user is VIP)
            const activeSources = sourcesResponse.data.filter((s: any) => s.isActive);
            
            // Check if user has valid VIP subscription
            const hasValidVipSubscription = await checkVipSubscription();
            
            // Find non-VIP source first
            let selectedSource = activeSources.find((s: any) => !s.isVipOnly);
            
            // If no non-VIP source, check VIP source
            if (!selectedSource) {
              const vipSource = activeSources.find((s: any) => s.isVipOnly);
              if (vipSource) {
                if (hasValidVipSubscription) {
                  selectedSource = vipSource;
                } else {
                  // User needs subscription
                  setRequiresSubscription(true);
                  setVideoError(false);
                  setIsLoadingVideo(false);
                  return;
                }
              } else {
                // No sources available
                selectedSource = activeSources[0];
              }
            } else if (hasValidVipSubscription) {
              // Prefer VIP source if user has valid subscription
              const vipSource = activeSources.find((s: any) => s.isVipOnly);
              if (vipSource) {
                selectedSource = vipSource;
              }
            }
            
            if (selectedSource?.sourceUrl) {
              setVideoUri(selectedSource.sourceUrl);
              setCurrentEpisodeSourceId(selectedSource.episodeSourceID);
              setRequiresSubscription(false);
              bufferReadyLoggedRef.current = false; // Reset buffer log flag for new video
              // Video will start loading in chunks automatically via HTTP Range requests
              // expo-av handles progressive loading natively
            } else {
              // No valid source found - show 404 error
              setVideoError(true);
              setVideoUri('');
              setRequiresSubscription(false);
            }
          } else {
            // No sources found - show 404 error
            setVideoError(true);
            setVideoUri('');
            setRequiresSubscription(false);
          }
        } else {
          // Load movie sources via public endpoint by movieId
          const movieId = parseInt(id as string);
          const sourcesResponse = await filmzoneApi.getMovieSourcesByMovieId(movieId);
          console.log('VideoPlayerScreen: movie sources (public) response', { movieId, response: sourcesResponse });

          if (sourcesResponse.errorCode >= 200 && sourcesResponse.errorCode < 300 && sourcesResponse.data) {
            const sourcesData = Array.isArray(sourcesResponse.data)
              ? sourcesResponse.data
              : [sourcesResponse.data];

            if (sourcesData.length > 0) {
              const activeSources = sourcesData.filter((s: any) => s.isActive !== false);
              
              // Check if user has valid VIP subscription
              const hasValidVipSubscription = await checkVipSubscription();
              
              // Find non-VIP source first
              let selectedSource = activeSources.find((s: any) => !s.isVipOnly);
              
              // If no non-VIP source, check VIP source
              if (!selectedSource) {
                const vipSource = activeSources.find((s: any) => s.isVipOnly);
                if (vipSource) {
                  if (hasValidVipSubscription) {
                    selectedSource = vipSource;
                  } else {
                    // User needs subscription
                    setRequiresSubscription(true);
                    setVideoError(false);
                    setIsLoadingVideo(false);
                    return;
                  }
                } else {
                  // No sources available
                  selectedSource = activeSources[0];
                }
              } else if (hasValidVipSubscription) {
                // Prefer VIP source if user has valid subscription
                const vipSource = activeSources.find((s: any) => s.isVipOnly);
                if (vipSource) {
                  selectedSource = vipSource;
                }
              }

              if (selectedSource?.sourceUrl) {
                setVideoUri(selectedSource.sourceUrl);
                setCurrentSourceId((selectedSource as any).sourceID || (selectedSource as any).movieSourceID);
                setRequiresSubscription(false);
                bufferReadyLoggedRef.current = false; // Reset buffer log flag for new video
                // Video will start loading in chunks automatically via HTTP Range requests
                // expo-av handles progressive loading natively
              } else {
                console.log('VideoPlayerScreen: no valid sourceUrl in selectedSource', selectedSource);
                setVideoError(true);
                setVideoUri('');
                setRequiresSubscription(false);
              }
            } else {
              console.log('VideoPlayerScreen: no movie sources data after parsing (public)', sourcesData);
              setVideoError(true);
              setVideoUri('');
              setRequiresSubscription(false);
            }
          } else {
            console.log('VideoPlayerScreen: movie source (public) API not ok', sourcesResponse);
            setVideoError(true);
            setVideoUri('');
            setRequiresSubscription(false);
          }
        }
      } catch (error) {
        console.error('VideoPlayerScreen: Error loading video source:', error);
        // Error loading - show 404 error
        setVideoError(true);
        setVideoUri('');
      } finally {
        // Clear interval when loading finishes
        if (loadingIntervalRef.current) {
          clearInterval(loadingIntervalRef.current);
          loadingIntervalRef.current = null;
        }
        setIsLoadingVideo(false);
        setLoadingElapsedSeconds(0);
      }
    };

    loadVideoSource();

    // Cleanup interval on unmount
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    };
  }, [id, type, episode, videoUrl, authState.user]);

  // Handle screen orientation - Allow both portrait and landscape
  useEffect(() => {
    const unlockOrientation = async () => {
      try {
        // Unlock orientation to allow both portrait and landscape
        await ScreenOrientation.unlockAsync();
      } catch (error) {
        console.log('Error unlocking orientation:', error);
      }
    };

    unlockOrientation();

    // Listen for dimension changes to detect orientation
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setIsLandscape(width > height);
    };

    // Set initial orientation
    updateOrientation();

    // Listen for dimension changes
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    // Cleanup function
    return () => {
      subscription?.remove();
      ScreenOrientation.unlockAsync().catch(err => {
        console.log('Error unlocking orientation:', err);
      });
    };
  }, []);

  useEffect(() => {
    // Hide controls after 3 seconds when they are shown
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showControls]);

  // Wave animation effect
  useEffect(() => {
    const createWaveAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      );
    };

    // Start all three wave animations with different delays
    createWaveAnimation(waveAnimation1, 0).start();
    createWaveAnimation(waveAnimation2, 700).start();
    createWaveAnimation(waveAnimation3, 1400).start();
  }, [waveAnimation1, waveAnimation2, waveAnimation3]);

  const togglePlayPause = async () => {
    if (isToggling) return; // Prevent multiple rapid calls
    
    try {
      setIsToggling(true);
      await Haptics.selectionAsync();
      
      // Don't change state immediately, let the video status update handle it
      if (isPlaying) {
        await videoRef.current?.pauseAsync();
      } else {
        await videoRef.current?.playAsync();
      }
      
      // Reset controls timer
      setShowControls(true);
    } catch (error) {
      console.log('Error toggling play/pause:', error);
    } finally {
      // Reset the flag after a short delay
      setTimeout(() => setIsToggling(false), 500);
    }
  };

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    if (playbackStatus.isLoaded) {
      setCurrentTime(playbackStatus.positionMillis || 0);
      setDuration(playbackStatus.durationMillis || 0);
      
      // expo-av automatically handles progressive chunk loading via HTTP Range requests
      // Video loads in chunks (typically 10-30 seconds at a time) to avoid long waits
      // The player will automatically buffer ahead while playing
      // No need for manual chunk management - expo-av handles it natively
      
      // Log when buffer is ready (at least 10 seconds buffered)
      if (!bufferReadyLoggedRef.current && playbackStatus.durationMillis) {
        const bufferedDuration = playbackStatus.playableDurationMillis || 0;
        const minBufferSeconds = 10; // Minimum 10 seconds buffer
        const minBufferMillis = minBufferSeconds * 1000;
        
        if (bufferedDuration >= minBufferMillis) {
          bufferReadyLoggedRef.current = true;
          const bufferedSeconds = Math.round(bufferedDuration / 1000);
          const totalDurationSeconds = Math.round(playbackStatus.durationMillis / 1000);
          console.log(`[VideoPlayer] Buffer ready: ${bufferedSeconds}s buffered out of ${totalDurationSeconds}s total duration`);
          console.log(`[VideoPlayer] Video is ready to play without interruption`);
        }
      }
      
      // Only update isPlaying if the status actually changed
      if (playbackStatus.isPlaying !== isPlaying) {
        setIsPlaying(playbackStatus.isPlaying);
      }
      // Keep local mute state in sync with player
      if (playbackStatus.isLoaded && typeof playbackStatus.isMuted === 'boolean' && playbackStatus.isMuted !== isMuted) {
        setIsMuted(playbackStatus.isMuted);
      }
      
      // Update progress in watch history every 5 seconds
      if (playbackStatus.positionMillis && playbackStatus.durationMillis && authState.user?.userID) {
        const progress = playbackStatus.positionMillis / playbackStatus.durationMillis;
        const positionSeconds = Math.round(playbackStatus.positionMillis / 1000);
        const durationSeconds = Math.round(playbackStatus.durationMillis / 1000);
        
        // Only update if progress is significant (more than 5%)
        if (progress > 0.05) {
          const updateProgress = async () => {
            try {
              if (type === 'series' && season && episode) {
                // Update episode watch progress for series
                const episodeId = parseInt(episode as string);
                await filmzoneApi.updateEpisodeWatchProgressByEpisode(
                  episodeId,
                  positionSeconds,
                  durationSeconds,
                  currentEpisodeSourceId
                );
              } else {
                // Update movie watch progress
                const movieId = parseInt(id as string);
                await filmzoneApi.updateWatchProgressByMovie(
                  movieId,
                  positionSeconds,
                  durationSeconds,
                  currentSourceId
                );
              }
            } catch (error) {
              console.error('Error updating watch progress:', error);
            }
          };
          
          // Debounce: only update every 5 seconds
          const now = Date.now();
          if (!lastProgressUpdateRef.current || now - lastProgressUpdateRef.current > 5000) {
            lastProgressUpdateRef.current = now;
            updateProgress();
          }
        }
      }
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const seekTo = async (position: number) => {
    try {
      await videoRef.current?.setPositionAsync(position);
    } catch (error) {
      console.log('Error seeking:', error);
    }
  };

  const seekBy = async (deltaMillis: number) => {
    try {
      const newPos = Math.max(0, Math.min((currentTime || 0) + deltaMillis, duration || 0));
      await seekTo(newPos);
      setShowControls(true);
    } catch (error) {
      console.log('Error seeking by delta:', error);
    }
  };

  const toggleMute = async () => {
    try {
      await Haptics.selectionAsync();
      const next = !isMuted;
      await videoRef.current?.setIsMutedAsync(next);
      setIsMuted(next);
      if (next) {
        setVolume(0.0);
      } else {
        setVolume(1.0);
      }
      setShowControls(true);
    } catch (error) {
      console.log('Error toggling mute:', error);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    try {
      setVolume(newVolume);
      if (newVolume === 0) {
        await videoRef.current?.setIsMutedAsync(true);
        setIsMuted(true);
      } else {
        await videoRef.current?.setIsMutedAsync(false);
        setIsMuted(false);
        await videoRef.current?.setVolumeAsync(newVolume);
      }
    } catch (error) {
      console.log('Error changing volume:', error);
    }
  };

  const handleVolumePress = () => {
    setShowVolumeSlider(!showVolumeSlider);
    setShowControls(true);
  };

  const toggleSubtitles = async () => {
    try {
      await Haptics.selectionAsync();
      setShowSubtitleMenu(!showSubtitleMenu);
      setShowControls(true);
    } catch (error) {
      console.log('Error toggling subtitles:', error);
    }
  };

  const selectSubtitle = async (language: any) => {
    try {
      await Haptics.selectionAsync();
      setSelectedSubtitle(language.name);
      setShowSubtitles(language.code !== 'off');
      setShowSubtitleMenu(false);
      setShowControls(true);
    } catch (error) {
      console.log('Error selecting subtitle:', error);
    }
  };

  const handleSeekFromGesture = (x: number) => {
    if (!progressBarWidth || !duration) return;
    const ratio = Math.max(0, Math.min(x / progressBarWidth, 1));
    const target = Math.floor(ratio * duration);
    seekTo(target);
  };

  const goBack = async () => {
    try {
      await Haptics.selectionAsync();
      await ScreenOrientation.unlockAsync();
      router.back();
    } catch (error) {
      console.log('Error going back:', error);
    }
  };

  const handleControlPress = () => {
    // Reset controls timer when any control is pressed
    setShowControls(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Loading Indicator */}
      {isLoadingVideo && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải video...</Text>
          {loadingElapsedSeconds > 0 && (
            <Text style={styles.loadingTimeText}>
              Đã tải {loadingElapsedSeconds} giây...
            </Text>
          )}
        </View>
      )}
      
      {/* Subscription Required */}
      {!isLoadingVideo && requiresSubscription && (
        <View style={styles.errorContainer}>
          {/* Top Buttons - Left Side */}
          <View style={styles.topButtonsContainer}>
            <Pressable style={styles.backButtonError} onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color="#e50914" />
            </Pressable>
          </View>
          
          {/* Subscription Required Content - Centered */}
          <View style={styles.errorContent}>
            <Ionicons name="lock-closed-outline" size={64} color="#e50914" />
            <Text style={styles.errorTitle}>Subscription Required</Text>
            <Text style={styles.errorMessage}>You must subscribe to watch this movie.</Text>
            <Text style={styles.errorSubtext}>This content is available for VIP subscribers only</Text>
            <Pressable 
              style={styles.subscribeButton}
              onPress={() => {
                router.push('/payment');
              }}
            >
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Error 404 */}
      {!isLoadingVideo && videoError && !requiresSubscription && (
        <View style={styles.errorContainer}>
          {/* Top Buttons - Left Side */}
          <View style={styles.topButtonsContainer}>
            <Pressable style={styles.backButtonError} onPress={goBack}>
              <Ionicons name="arrow-back" size={24} color="#e50914" />
            </Pressable>
            
            <Pressable 
              style={({ pressed }) => [
                styles.reportButtonError,
                pressed && { opacity: 0.7 }
              ]}
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                } catch {}
                showInfo('This feature will be added in a later update');
              }}
            >
              <Ionicons name="flag-outline" size={20} color="#e50914" />
            </Pressable>
          </View>
          
          {/* Error Content - Centered */}
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle-outline" size={64} color="#e50914" />
            <Text style={styles.errorTitle}>404</Text>
            <Text style={styles.errorMessage}>Không tìm thấy video</Text>
            <Text style={styles.errorSubtext}>Video này không có sẵn hoặc đã bị xóa</Text>
          </View>
        </View>
      )}
      
      {/* Video Player */}
      {!isLoadingVideo && !videoError && !requiresSubscription && videoUri && (
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ 
            uri: videoUri,
            // HTTP Range requests are automatically handled by expo-av
            // Video will load in chunks as needed
          }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={isPlaying}
          isLooping={false}
          isMuted={isMuted}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          progressUpdateIntervalMillis={500}
          // Optimize buffering - update more frequently for better UX
          useNativeControls={false}
          // Enable faster playback start
          shouldCorrectPitch={false}
          // Start playing when enough buffer is available (default behavior)
          onLoadStart={() => {
            console.log('VideoPlayerScreen: Video load started');
          }}
          onLoad={() => {
            console.log('VideoPlayerScreen: Video loaded, ready to play');
            // Video is ready, can start playing
          }}
        />
      )}

      {/* Controls Overlay */}
      {showControls && !videoError && !requiresSubscription && (
        <View style={styles.controlsOverlay}>
          {/* Top Controls */}
          <View style={[styles.topControls, !isLandscape && styles.topControlsPortrait]}>
            <Pressable style={styles.backButton} onPress={() => { handleControlPress(); goBack(); }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View style={styles.logoContainer}>
              <FlixGoLogo />
            </View>
            <View style={styles.placeholder} />
          </View>

          {/* Center Play/Pause Button with Wave Animation */}
          <View style={styles.centerControls}>
            {/* Wave Animation Circles */}
            <Animated.View 
              style={[
                styles.waveCircle,
                {
                  transform: [
                    {
                      scale: waveAnimation1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.5],
                      }),
                    },
                  ],
                  opacity: waveAnimation1.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.8, 0.4, 0],
                  }),
                },
              ]}
            />
            <Animated.View 
              style={[
                styles.waveCircle,
                {
                  transform: [
                    {
                      scale: waveAnimation2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.5],
                      }),
                    },
                  ],
                  opacity: waveAnimation2.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.6, 0.3, 0],
                  }),
                },
              ]}
            />
            <Animated.View 
              style={[
                styles.waveCircle,
                {
                  transform: [
                    {
                      scale: waveAnimation3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.5],
                      }),
                    },
                  ],
                  opacity: waveAnimation3.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.4, 0.2, 0],
                  }),
                },
              ]}
            />
            
            {/* Play/Pause Button */}
            <Pressable style={styles.playPauseButton} onPress={togglePlayPause}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={40} 
                color="#fff" 
              />
            </Pressable>
          </View>

          {/* Bottom Controls */}
          <View style={[styles.bottomControls, !isLandscape && styles.bottomControlsPortrait]}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View 
                style={styles.progressBar}
                onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => handleSeekFromGesture(e.nativeEvent.locationX)}
                onResponderMove={(e) => handleSeekFromGesture(e.nativeEvent.locationX)}
                onResponderRelease={(e) => handleSeekFromGesture(e.nativeEvent.locationX)}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                  ]} 
                />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
            
            <View style={styles.controlButtons}>
              <Pressable style={styles.controlButton} onPress={() => { handleControlPress(); seekBy(-10000); }}>
                <Ionicons name="play-back" size={20} color="#fff" />
              </Pressable>
              <View style={styles.subtitleContainer}>
                <Pressable style={styles.controlButton} onPress={() => { handleControlPress(); toggleSubtitles(); }}>
                  <Ionicons name={showSubtitles ? 'text' : 'text-outline'} size={20} color="#fff" />
                </Pressable>
                {showSubtitleMenu && (
                  <View style={styles.subtitleMenuContainer}>
                    <ScrollView style={styles.subtitleMenu} showsVerticalScrollIndicator={false}>
                      {subtitleLanguages.map((language) => (
                        <Pressable
                          key={language.id}
                          style={({ pressed }) => [
                            styles.subtitleMenuItem,
                            selectedSubtitle === language.name && styles.subtitleMenuItemActive,
                            pressed && { opacity: 0.8 }
                          ]}
                          onPress={() => selectSubtitle(language)}
                        >
                          <Text style={[
                            styles.subtitleMenuText,
                            selectedSubtitle === language.name && styles.subtitleMenuTextActive
                          ]}>
                            {language.name}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              <View style={styles.volumeContainer}>
                <Pressable style={styles.controlButton} onPress={() => { handleControlPress(); handleVolumePress(); }}>
                  <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={20} color="#fff" />
                </Pressable>
                {showVolumeSlider && (
                  <View style={styles.volumeSliderContainer}>
                    <Slider
                      style={styles.volumeSlider}
                      minimumValue={0}
                      maximumValue={1}
                      value={volume}
                      onValueChange={handleVolumeChange}
                      minimumTrackTintColor="#e50914"
                      maximumTrackTintColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                )}
              </View>
              <Pressable style={styles.controlButton} onPress={() => { handleControlPress(); seekBy(10000); }}>
                <Ionicons name="play-forward" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Subtitles overlay */}
      {showSubtitles && (
        <View style={styles.subtitlesContainer}>
          <Text style={styles.subtitlesText}>
            [{selectedSubtitle}] {formatTime(currentTime)} - Sample subtitle text
          </Text>
        </View>
      )}

      {/* Tap to show controls - only when controls are hidden */}
      {!showControls && (
        <Pressable 
          style={styles.tapArea} 
          onPress={() => setShowControls(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingTimeText: {
    color: '#8e8e93',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 32,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#e50914',
    marginTop: 24,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  topButtonsContainer: {
    position: 'absolute',
    top: 20,
    left: 16,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  backButtonError: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: '#e50914',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButton: {
    backgroundColor: '#e50914',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  reportButtonError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#e50914',
    borderRadius: 8,
    gap: 6,
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  topControlsPortrait: {
    paddingTop: 40, // Đẩy cụm top controls xuống thấp hơn khi màn hình dọc
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  centerControls: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  waveCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#e50914',
    backgroundColor: 'transparent',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomControls: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  bottomControlsPortrait: {
    paddingBottom: 80, // Đẩy cụm control lên cao hơn khi màn hình dọc
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e50914',
    borderRadius: 2,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  volumeSliderContainer: {
    position: 'absolute',
    right: -180,
    top: -10,
    width: 200,
    height: 60,
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeSlider: {
    width: 180,
    height: 30,
  },
  volumeSliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#e50914',
    borderRadius: 10,
  },
  subtitleContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  subtitleMenuContainer: {
    position: 'absolute',
    right: 0,
    bottom: 50,
    width: 150,
    maxHeight: 200,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e50914',
  },
  subtitleMenu: {
    maxHeight: 180,
  },
  subtitleMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  subtitleMenuItemActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.3)',
  },
  subtitleMenuText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  subtitleMenuTextActive: {
    color: '#e50914',
    fontWeight: '600',
  },
  subtitlesContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitlesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});