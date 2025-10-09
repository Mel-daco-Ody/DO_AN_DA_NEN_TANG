import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, StatusBar, Animated, ScrollView } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import FlixGoLogo from '../../components/FlixGoLogo';
import { useAuth } from '../../contexts/AuthContext';
import Slider from '@react-native-community/slider';

export default function VideoPlayerScreen() {
  const { id, title, type, videoUrl, season, episode } = useLocalSearchParams();
  const { authState } = useAuth();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState({});
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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

  // Use videoUrl from params, fallback to demo video
  const videoUri = videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  // Handle screen orientation
  useEffect(() => {
    const lockToLandscape = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsLandscape(true);
      } catch (error) {
        console.log('Error locking orientation:', error);
      }
    };

    lockToLandscape();

    // Cleanup function to unlock orientation when component unmounts
    return () => {
      ScreenOrientation.unlockAsync();
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
      // Only update isPlaying if the status actually changed
      if (playbackStatus.isPlaying !== isPlaying) {
        setIsPlaying(playbackStatus.isPlaying);
      }
      // Keep local mute state in sync with player
      // @ts-expect-error - isMuted exists when isLoaded is true
      if (typeof playbackStatus.isMuted === 'boolean' && playbackStatus.isMuted !== isMuted) {
        // @ts-expect-error - isMuted exists when isLoaded is true
        setIsMuted(playbackStatus.isMuted);
      }
      
      // Update progress in watch history every 5 seconds
      if (type === 'series' && season && episode && playbackStatus.positionMillis && playbackStatus.durationMillis) {
        const progress = playbackStatus.positionMillis / playbackStatus.durationMillis;
        // Only update if progress is significant (more than 5%)
        if (progress > 0.05) {
          // Update episode watch progress with FilmZone backend
          const updateProgress = async () => {
            try {
              const { movieAppApi } = await import('../../services/api');
              const progressData = {
                userID: authState.user?.userID || 0,
                episodeID: parseInt(episode as string),
                progressPercentage: Math.round(progress * 100),
                watchTimeSeconds: Math.round(playbackStatus.positionMillis / 1000),
                isCompleted: progress >= 0.9
              };
              await movieAppApi.addEpisodeWatchProgress(progressData);
              
              // Add to watch history
              if (authState.user) {
                const historyData = {
                  movieID: parseInt(id as string),
                  episodeID: progressData.episodeID,
                  watchTimeSeconds: progressData.watchTimeSeconds,
                  progressPercentage: progressData.progressPercentage
                };
                await movieAppApi.addToWatchHistory(authState.user.userID.toString(), historyData);
                
                // Increment films watched if completed
                if (progressData.isCompleted) {
                  await movieAppApi.incrementFilmsWatched(parseInt(id as string));
                }
              }
            } catch (error) {
              console.error('Error updating episode progress:', error);
            }
          };
          updateProgress();
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
      
      {/* Video Player */}
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: videoUri }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={isPlaying}
        isLooping={false}
        isMuted={isMuted}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

      {/* Controls Overlay */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
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
          <View style={styles.bottomControls}>
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
                      thumbStyle={styles.volumeSliderThumb}
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
    left: -100,
    top: -10,
    width: 150,
    maxHeight: 200,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 8,
    paddingVertical: 8,
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