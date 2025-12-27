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
  const [availableSubtitles, setAvailableSubtitles] = useState<any[]>([]);
  const [subtitleTexts, setSubtitleTexts] = useState<Map<string, any[]>>(new Map());
  const [currentSubtitleText, setCurrentSubtitleText] = useState<string>('');
  const [currentSourceId, setCurrentSourceId] = useState<number | undefined>(undefined);
  const [currentEpisodeSourceId, setCurrentEpisodeSourceId] = useState<number | undefined>(undefined);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [requiresSubscription, setRequiresSubscription] = useState<boolean>(false);
  const [waveAnimation1] = useState(new Animated.Value(0));
  const [waveAnimation2] = useState(new Animated.Value(0));
  const [waveAnimation3] = useState(new Animated.Value(0));
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const waveAnimationRefs = useRef<Animated.CompositeAnimation[]>([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isInitialBuffering, setIsInitialBuffering] = useState(false);
  const [loadingBubbleRotation] = useState(new Animated.Value(0));
  const loadingBubbleAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [selectedSubtitleLanguage, setSelectedSubtitleLanguage] = useState<string>('');
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

  // Parse SRT subtitle format
  const parseSRT = (srtContent: string): any[] => {
    const subtitles: any[] = [];
    
    // Split by double newlines (more flexible)
    const blocks = srtContent.split(/\r?\n\s*\r?\n/);
    
    for (const block of blocks) {
      if (!block.trim()) continue;
      
      const lines = block.trim().split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) continue;
      
      // Find time line (usually line 1, but could be line 0 or 1)
      let timeLine = '';
      let textStartIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Check if line contains time pattern
        if (line.match(/\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}/)) {
          timeLine = line;
          textStartIndex = i + 1;
          break;
        }
      }
      
      if (!timeLine) continue;
      
      // Match time with both comma and dot separators
      const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
      if (!timeMatch) continue;
      
      const startTime = 
        parseInt(timeMatch[1]) * 3600 * 1000 +
        parseInt(timeMatch[2]) * 60 * 1000 +
        parseInt(timeMatch[3]) * 1000 +
        parseInt(timeMatch[4]);
      
      const endTime = 
        parseInt(timeMatch[5]) * 3600 * 1000 +
        parseInt(timeMatch[6]) * 60 * 1000 +
        parseInt(timeMatch[7]) * 1000 +
        parseInt(timeMatch[8]);
      
      // Get all text lines after time line
      const text = lines.slice(textStartIndex)
        .join(' ')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\{.*?\}/g, '') // Remove style tags like {font}
        .trim();
      
      if (text && startTime >= 0 && endTime > startTime) {
        subtitles.push({ startTime, endTime, text });
      }
    }
    
    return subtitles.sort((a, b) => a.startTime - b.startTime);
  };

  // Parse VTT subtitle format
  const parseVTT = (vttContent: string): any[] => {
    const subtitles: any[] = [];
    const lines = vttContent.split('\n');
    let currentSubtitle: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Match time line: 00:00:00.000 --> 00:00:05.000
      const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
      if (timeMatch) {
        if (currentSubtitle && currentSubtitle.text) {
          subtitles.push(currentSubtitle);
        }
        
        const startTime = 
          parseInt(timeMatch[1]) * 3600 * 1000 +
          parseInt(timeMatch[2]) * 60 * 1000 +
          parseInt(timeMatch[3]) * 1000 +
          parseInt(timeMatch[4]);
        
        const endTime = 
          parseInt(timeMatch[5]) * 3600 * 1000 +
          parseInt(timeMatch[6]) * 60 * 1000 +
          parseInt(timeMatch[7]) * 1000 +
          parseInt(timeMatch[8]);
        
        currentSubtitle = { startTime, endTime, text: '' };
      } else if (currentSubtitle && line && !line.startsWith('WEBVTT') && !line.startsWith('NOTE')) {
        currentSubtitle.text += (currentSubtitle.text ? ' ' : '') + line.replace(/<[^>]*>/g, '').trim();
      }
    }
    
    if (currentSubtitle && currentSubtitle.text) {
      subtitles.push(currentSubtitle);
    }
    
    return subtitles.sort((a, b) => a.startTime - b.startTime);
  };

  // Load subtitle file from URL
  const loadSubtitleFile = async (url: string): Promise<any[]> => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      
      console.log('VideoPlayerScreen: loadSubtitleFile - file loaded, length:', text.length, 'first 200 chars:', text.substring(0, 200));
      
      if (url.endsWith('.vtt') || text.includes('WEBVTT')) {
        const parsed = parseVTT(text);
        console.log('VideoPlayerScreen: loadSubtitleFile - VTT parsed, entries:', parsed.length);
        return parsed;
      } else {
        const parsed = parseSRT(text);
        console.log('VideoPlayerScreen: loadSubtitleFile - SRT parsed, entries:', parsed.length);
        return parsed;
      }
    } catch (error) {
      console.error('VideoPlayerScreen: Error loading subtitle file:', error);
      return [];
    }
  };

  // Load subtitles from API - supports both movies and episodes
  // This function is designed to be non-blocking and should never throw errors
  const loadSubtitles = async (sourceID: number | string, isEpisode: boolean = false): Promise<void> => {
    try {
      if (!sourceID) {
        console.log('VideoPlayerScreen: loadSubtitles - no sourceID provided');
        return;
      }
      
      // Convert sourceID to number - handle both number and string cases
      let numericSourceId: number;
      if (typeof sourceID === 'number') {
        numericSourceId = sourceID;
      } else if (typeof sourceID === 'string') {
        // If it's a pure number string, parse it directly
        const parsed = parseInt(sourceID, 10);
        if (!isNaN(parsed) && parsed > 0) {
          numericSourceId = parsed;
        } else {
          // Try to extract number from string (e.g., "avengers-infinity-war-1" -> 1)
          // But this is not ideal - we should have the numeric ID from the source object
          const numMatch = sourceID.match(/\d+/);
          if (numMatch) {
            numericSourceId = parseInt(numMatch[0], 10);
          } else {
            console.log('VideoPlayerScreen: loadSubtitles - cannot extract number from sourceID string:', sourceID);
            return;
          }
        }
      } else {
        numericSourceId = parseInt(String(sourceID), 10);
      }
      
      if (isNaN(numericSourceId) || numericSourceId <= 0) {
        console.log('VideoPlayerScreen: loadSubtitles - invalid sourceID, cannot convert to number:', sourceID);
        return;
      }
      
      console.log('VideoPlayerScreen: loadSubtitles - loading subtitles for sourceID:', sourceID, '-> numeric:', numericSourceId, 'isEpisode:', isEpisode);
      
      // Check if methods exist
      console.log('VideoPlayerScreen: filmzoneApi methods check:', {
        hasGetEpisodeSubtitles: typeof filmzoneApi.getEpisodeSubtitlesBySourceID,
        hasGetMovieSubtitles: typeof filmzoneApi.getMovieSubtitlesBySourceID,
        filmzoneApiKeys: Object.keys(filmzoneApi).filter(k => k.includes('Subtitle') || k.includes('subtitle'))
      });
      
      // Use different API endpoint for movies vs episodes
      const response = isEpisode 
        ? await filmzoneApi.getEpisodeSubtitlesBySourceID(numericSourceId)
        : await filmzoneApi.getMovieSubtitlesBySourceID(numericSourceId);
      console.log('VideoPlayerScreen: loadSubtitles - API response:', response);
      
      // Handle both cases: data is array or single object, and empty array
      if (response.errorCode >= 200 && response.errorCode < 300) {
        // If data is empty array or undefined, just log and return (no subtitles available)
        // This is normal and should not affect video playback
        if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
          console.log('VideoPlayerScreen: loadSubtitles - no subtitles available for this source (this is OK, video will still play)');
          setAvailableSubtitles([]);
          setSubtitleTexts(new Map());
          setSelectedSubtitle('off');
          setSelectedSubtitleLanguage('');
          setShowSubtitles(false);
          return; // Exit early if no subtitles - this is normal
        }
        
        const subtitlesData = Array.isArray(response.data) ? response.data : [response.data];
        const activeSubtitles = subtitlesData.filter((s: any) => s.isActive !== false);
        
        console.log('VideoPlayerScreen: loadSubtitles - active subtitles:', activeSubtitles.length);
        setAvailableSubtitles(activeSubtitles);
        
        // Load subtitle files - use a consistent key (language or subTitleName)
        // Wrap in try-catch to handle individual file load errors
        const subtitleTextsMap = new Map<string, any[]>();
        for (const subtitle of activeSubtitles) {
          if (subtitle.linkSubTitle) {
            try {
              console.log('VideoPlayerScreen: loadSubtitles - loading subtitle file:', subtitle.linkSubTitle);
              const parsed = await loadSubtitleFile(subtitle.linkSubTitle);
              console.log('VideoPlayerScreen: loadSubtitles - parsed subtitle entries:', parsed.length);
              if (parsed.length > 0) {
                console.log('VideoPlayerScreen: loadSubtitles - first entry sample:', {
                  startTime: parsed[0].startTime,
                  endTime: parsed[0].endTime,
                  startSeconds: Math.floor(parsed[0].startTime / 1000),
                  endSeconds: Math.floor(parsed[0].endTime / 1000),
                  text: parsed[0].text?.substring(0, 50)
                });
              }
              // Use language as key, fallback to subTitleName
              const key = subtitle.language || subtitle.subTitleName || 'unknown';
              subtitleTextsMap.set(key, parsed);
            } catch (fileError) {
              // If one subtitle file fails to load, continue with others
              console.error('VideoPlayerScreen: Error loading subtitle file (non-critical):', subtitle.linkSubTitle, fileError);
            }
          }
        }
        
        console.log('VideoPlayerScreen: loadSubtitles - subtitleTextsMap keys:', Array.from(subtitleTextsMap.keys()));
        setSubtitleTexts(subtitleTextsMap);
        
        // Auto-select first available subtitle with valid language (prioritize vi, en over "string")
        if (activeSubtitles.length > 0 && subtitleTextsMap.size > 0) {
          // Find subtitle with valid language (vi, en, etc.) that has parsed entries
          const validLanguageCodes = ['vi', 'en', 'zh', 'ja', 'ko', 'th', 'fr', 'de', 'es'];
          let selectedSubtitle = null;
          
          // First, try to find subtitle with valid language code that has parsed entries
          for (const subtitle of activeSubtitles) {
            const lang = subtitle.language?.toLowerCase();
            if (lang && validLanguageCodes.includes(lang)) {
              const langKey = subtitle.language || subtitle.subTitleName || 'unknown';
              const parsed = subtitleTextsMap.get(langKey);
              if (parsed && parsed.length > 0) {
                selectedSubtitle = subtitle;
                break;
              }
            }
          }
          
          // If no valid language found, find any subtitle with parsed entries
          if (!selectedSubtitle) {
            for (const subtitle of activeSubtitles) {
              const langKey = subtitle.language || subtitle.subTitleName || 'unknown';
              const parsed = subtitleTextsMap.get(langKey);
              if (parsed && parsed.length > 0) {
                selectedSubtitle = subtitle;
                break;
              }
            }
          }
          
          // Fallback to first subtitle if none found
          if (!selectedSubtitle) {
            selectedSubtitle = activeSubtitles[0];
          }
          
          const langKey = selectedSubtitle.language || selectedSubtitle.subTitleName || 'unknown';
          const langCode = selectedSubtitle.language?.toLowerCase() || 'vi';
          console.log('VideoPlayerScreen: loadSubtitles - auto-selecting subtitle:', { 
            langKey, 
            langCode, 
            subtitle: selectedSubtitle,
            hasParsedEntries: subtitleTextsMap.get(langKey)?.length || 0
          });
          setSelectedSubtitle(langCode);
          setSelectedSubtitleLanguage(langKey);
          setShowSubtitles(true);
        } else {
          // No subtitles with valid entries, disable subtitles
          console.log('VideoPlayerScreen: loadSubtitles - no subtitles with valid entries found');
          setSelectedSubtitle('off');
          setSelectedSubtitleLanguage('');
          setShowSubtitles(false);
        }
      } else {
        // API error - this is OK, video will still play
        console.log('VideoPlayerScreen: loadSubtitles - API error (non-critical, video will still play):', response.errorCode, response.errorMessage);
        setAvailableSubtitles([]);
        setSubtitleTexts(new Map());
        setSelectedSubtitle('off');
        setSelectedSubtitleLanguage('');
        setShowSubtitles(false);
      }
    } catch (error) {
      // Catch all errors - subtitles are optional, video should still play
      console.error('VideoPlayerScreen: Error loading subtitles (non-critical, video will still play):', error);
      setAvailableSubtitles([]);
      setSubtitleTexts(new Map());
      setSelectedSubtitle('off');
      setSelectedSubtitleLanguage('');
      setShowSubtitles(false);
    }
  };

  // Get current subtitle text based on time
  const getCurrentSubtitleText = (currentTimeMillis: number): string => {
    if (!showSubtitles || selectedSubtitle === 'off') {
      return '';
    }
    
    // If no subtitle texts loaded, return empty
    if (subtitleTexts.size === 0) {
      return '';
    }
    
    // Try to find subtitle list by selected language key first
    let subtitleList = null;
    let searchKey = selectedSubtitleLanguage;
    
    // Debug: log all available keys
    const allKeys = Array.from(subtitleTexts.keys());
    
    // If we have a selected language key, try to get it directly
    if (searchKey) {
      subtitleList = subtitleTexts.get(searchKey);
      if (!subtitleList) {
        // Try exact match case-insensitive
        for (const [key, value] of subtitleTexts.entries()) {
          if (key.toLowerCase() === searchKey.toLowerCase()) {
            subtitleList = value;
            searchKey = key;
            break;
          }
        }
      }
    }
    
    // If not found, try to find by matching language code
    if (!subtitleList) {
      for (const [key, value] of subtitleTexts.entries()) {
        const keyLower = key.toLowerCase();
        // Match by language code (e.g., "vi", "en") or by key containing the code
        if (keyLower === selectedSubtitle || 
            keyLower.includes(selectedSubtitle) || 
            selectedSubtitle.includes(keyLower)) {
          subtitleList = value;
          searchKey = key;
          // Update selected language if we found a match and it's different
          if (searchKey !== selectedSubtitleLanguage) {
            setSelectedSubtitleLanguage(searchKey);
          }
          break;
        }
      }
    }
    
    // If still not found, use first available subtitle with entries
    if (!subtitleList) {
      for (const [key, value] of subtitleTexts.entries()) {
        if (value && value.length > 0) {
          subtitleList = value;
          searchKey = key;
          setSelectedSubtitleLanguage(searchKey);
          break;
        }
      }
    }
    
    if (!subtitleList || subtitleList.length === 0) {
      // Debug log when subtitle list not found
      if (currentTimeMillis % 5000 < 500) {
        console.log('VideoPlayerScreen: getCurrentSubtitleText - no subtitle list found', {
          selectedSubtitle,
          selectedSubtitleLanguage,
          searchKey,
          allKeys,
          subtitleTextsSize: subtitleTexts.size,
          subtitleTextsEntries: Array.from(subtitleTexts.entries()).map(([k, v]) => ({ key: k, length: v.length }))
        });
      }
      return '';
    }
    
    // Find subtitle that matches current time
    const currentSubtitle = subtitleList.find(
      (sub: any) => currentTimeMillis >= sub.startTime && currentTimeMillis <= sub.endTime
    );
    
    // Debug log when no subtitle matches time (log more frequently for debugging)
    if (!currentSubtitle && currentTimeMillis % 5000 < 500) {
      console.log('VideoPlayerScreen: getCurrentSubtitleText - no subtitle matches time', {
        currentTimeMillis,
        currentTimeSeconds: Math.floor(currentTimeMillis / 1000),
        searchKey,
        subtitleListLength: subtitleList.length,
        firstSubtitle: subtitleList[0] ? {
          startTime: subtitleList[0].startTime,
          endTime: subtitleList[0].endTime,
          startSeconds: Math.floor(subtitleList[0].startTime / 1000),
          endSeconds: Math.floor(subtitleList[0].endTime / 1000),
          text: subtitleList[0].text?.substring(0, 50)
        } : null,
        lastSubtitle: subtitleList[subtitleList.length - 1] ? {
          startTime: subtitleList[subtitleList.length - 1].startTime,
          endTime: subtitleList[subtitleList.length - 1].endTime,
          startSeconds: Math.floor(subtitleList[subtitleList.length - 1].startTime / 1000),
          endSeconds: Math.floor(subtitleList[subtitleList.length - 1].endTime / 1000)
        } : null,
        // Check if current time is before first subtitle or after last subtitle
        isBeforeFirst: subtitleList[0] ? currentTimeMillis < subtitleList[0].startTime : false,
        isAfterLast: subtitleList[subtitleList.length - 1] ? currentTimeMillis > subtitleList[subtitleList.length - 1].endTime : false
      });
    }
    
    return currentSubtitle ? currentSubtitle.text : '';
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log('VideoPlayerScreen: state changed', {
      isLoadingVideo,
      videoError,
      requiresSubscription,
      videoUri: videoUri ? videoUri.substring(0, 50) + '...' : '',
      type,
      episode
    });
  }, [isLoadingVideo, videoError, requiresSubscription, videoUri, type, episode]);

  // Load video source from API
  useEffect(() => {
    const loadVideoSource = async () => {
      try {
        setIsLoadingVideo(true);
        setVideoError(false);
        setLoadingElapsedSeconds(0);
        setHasPlayedOnce(false); // Reset wave animation for new video
        setIsBuffering(false); // Reset buffering state for new video
        setIsInitialBuffering(false); // Reset initial buffering state for new video
        // Reset subtitles
        setAvailableSubtitles([]);
        setSubtitleTexts(new Map());
        setCurrentSubtitleText('');
        setSelectedSubtitle('off');
        setSelectedSubtitleLanguage('');
        setShowSubtitles(false);
        
        // Start interval to update loading time every 10 seconds
        loadingIntervalRef.current = setInterval(() => {
          setLoadingElapsedSeconds(prev => prev + 10);
        }, 10000);
        
        console.log('VideoPlayerScreen: loadVideoSource params', { id, type, episode, videoUrl });

        if (type === 'series' && episode) {
          // Load episode source
          const episodeId = parseInt(episode as string);
          console.log('VideoPlayerScreen: loading episode sources for episodeId:', episodeId);
          const sourcesResponse = await filmzoneApi.getEpisodeSourcesByEpisodeId(episodeId);
          console.log('VideoPlayerScreen: episode sources response:', {
            errorCode: sourcesResponse.errorCode,
            hasData: !!sourcesResponse.data,
            dataLength: Array.isArray(sourcesResponse.data) ? sourcesResponse.data.length : 0,
            data: sourcesResponse.data
          });
          
          if (sourcesResponse.errorCode >= 200 && sourcesResponse.errorCode < 300 && sourcesResponse.data && sourcesResponse.data.length > 0) {
            // Get the first active source (or VIP source if user is VIP)
            const activeSources = sourcesResponse.data.filter((s: any) => s.isActive);
            console.log('VideoPlayerScreen: episode - active sources count:', activeSources.length, activeSources);
            
            if (activeSources.length === 0) {
              console.log('VideoPlayerScreen: episode - no active sources found');
              setVideoError(true);
              setVideoUri('');
              setRequiresSubscription(false);
              return;
            }
            
            // Check if user has valid VIP subscription
            const hasValidVipSubscription = await checkVipSubscription();
            
            // Find non-VIP source first
            let selectedSource = activeSources.find((s: any) => !s.isVipOnly);
            console.log('VideoPlayerScreen: episode - selected non-VIP source:', selectedSource);
            
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
              const episodeSourceId = selectedSource.episodeSourceID;
              console.log('VideoPlayerScreen: episode source selected', {
                episodeSourceId,
                sourceUrl: selectedSource.sourceUrl,
                selectedSource
              });
              setVideoUri(selectedSource.sourceUrl);
              setCurrentEpisodeSourceId(episodeSourceId);
              setRequiresSubscription(false);
              setVideoError(false);
              bufferReadyLoggedRef.current = false; // Reset buffer log flag for new video
              // Load subtitles for this episode source (don't await - load in background)
              if (episodeSourceId) {
                loadSubtitles(episodeSourceId, true).catch(err => {
                  console.error('VideoPlayerScreen: Error loading episode subtitles (non-blocking):', err);
                });
              }
              // Video will start loading in chunks automatically via HTTP Range requests
              // expo-av handles progressive loading natively
            } else {
              // No valid source found - show 404 error
              console.log('VideoPlayerScreen: episode - no valid sourceUrl found', { selectedSource });
              setVideoError(true);
              setVideoUri('');
              setRequiresSubscription(false);
            }
          } else {
            // No sources found - show 404 error
            console.log('VideoPlayerScreen: episode - API response not OK or no data', {
              errorCode: sourcesResponse.errorCode,
              hasData: !!sourcesResponse.data,
              dataLength: Array.isArray(sourcesResponse.data) ? sourcesResponse.data.length : 'not array'
            });
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
                // Prioritize movieSourceID over sourceID, and ensure it's a number
                const sourceIdRaw = (selectedSource as any).movieSourceID || (selectedSource as any).sourceID;
                console.log('VideoPlayerScreen: selected source for subtitle loading', { 
                  selectedSource, 
                  movieSourceID: (selectedSource as any).movieSourceID,
                  sourceID: (selectedSource as any).sourceID,
                  sourceIdRaw 
                });
                
                setVideoUri(selectedSource.sourceUrl);
                setCurrentSourceId(sourceIdRaw);
                setRequiresSubscription(false);
                setVideoError(false); // Ensure video error is cleared
                bufferReadyLoggedRef.current = false; // Reset buffer log flag for new video
                // Load subtitles for this movie source (don't await - load in background)
                // Subtitles are optional - video will play even if subtitle loading fails
                if (sourceIdRaw) {
                  loadSubtitles(sourceIdRaw, false).catch(err => {
                    console.error('VideoPlayerScreen: Error loading movie subtitles (non-blocking, video will still play):', err);
                  });
                }
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
        console.log('VideoPlayerScreen: loadVideoSource finally - setting isLoadingVideo to false', {
          videoUri,
          videoError,
          requiresSubscription,
          type
        });
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
    // But keep controls visible when buffering (loading bubbles are showing)
    if (showControls && !isBuffering) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showControls, isBuffering]);

  // Wave animation effect - only run if video hasn't been played yet
  useEffect(() => {
    if (hasPlayedOnce) {
      // Stop all animations if video has been played
      waveAnimationRefs.current.forEach(anim => {
        anim.stop();
      });
      waveAnimationRefs.current = [];
      return;
    }

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
    const anim1 = createWaveAnimation(waveAnimation1, 0);
    const anim2 = createWaveAnimation(waveAnimation2, 700);
    const anim3 = createWaveAnimation(waveAnimation3, 1400);
    
    anim1.start();
    anim2.start();
    anim3.start();
    
    // Store animation references so we can stop them later
    waveAnimationRefs.current = [anim1, anim2, anim3];

    // Cleanup function to stop animations
    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [waveAnimation1, waveAnimation2, waveAnimation3, hasPlayedOnce]);

  // Loading bubble rotation animation - only during initial buffering (first play)
  useEffect(() => {
    if (isInitialBuffering) {
      // Start rotation animation
      const rotationAnimation = Animated.loop(
        Animated.timing(loadingBubbleRotation, {
          toValue: 3,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotationAnimation.start();
      loadingBubbleAnimationRef.current = rotationAnimation;
    } else {
      // Stop rotation animation
      if (loadingBubbleAnimationRef.current) {
        loadingBubbleAnimationRef.current.stop();
        loadingBubbleAnimationRef.current = null;
      }
    }

    return () => {
      if (loadingBubbleAnimationRef.current) {
        loadingBubbleAnimationRef.current.stop();
        loadingBubbleAnimationRef.current = null;
      }
    };
  }, [isInitialBuffering, loadingBubbleRotation]);

  const togglePlayPause = async () => {
    if (isToggling) return; // Prevent multiple rapid calls
    
    try {
      setIsToggling(true);
      await Haptics.selectionAsync();
      
      // Don't change state immediately, let the video status update handle it
      if (isPlaying) {
        await videoRef.current?.pauseAsync();
      } else {
        // Mark as played for the first time when starting playback
        if (!hasPlayedOnce) {
          setHasPlayedOnce(true);
          // Set initial buffering to true immediately when starting playback for the first time
          // This ensures loading bubbles show right away, especially on first play
          setIsInitialBuffering(true);
          setIsBuffering(true);
        }
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
      const currentTimeMillis = playbackStatus.positionMillis || 0;
      setCurrentTime(currentTimeMillis);
      setDuration(playbackStatus.durationMillis || 0);
      
      // Update current subtitle text - only if subtitles are enabled
      if (showSubtitles && selectedSubtitle !== 'off') {
        const subtitleText = getCurrentSubtitleText(currentTimeMillis);
        setCurrentSubtitleText(subtitleText);
        // Debug log occasionally to track subtitle updates
        if (currentTimeMillis % 5000 < 500) { // Log roughly every 5 seconds
          console.log('VideoPlayerScreen: subtitle update', {
            currentTime: Math.floor(currentTimeMillis / 1000),
            subtitleText: subtitleText.substring(0, 50),
            selectedSubtitle,
            selectedSubtitleLanguage,
            subtitleTextsSize: subtitleTexts.size
          });
        }
      } else {
        setCurrentSubtitleText('');
      }
      
      // Check if video is buffering
      const buffering = playbackStatus.isBuffering || false;
      
      // If we're in initial buffering phase and video has enough buffer, end initial buffering
      // Reduced from 5s to 2s for faster playback start
      if (isInitialBuffering && playbackStatus.durationMillis) {
        const bufferedDuration = playbackStatus.playableDurationMillis || 0;
        const minBufferSeconds = 2; // Minimum 2 seconds buffer to end initial buffering (reduced for faster start)
        const minBufferMillis = minBufferSeconds * 1000;
        
        // End initial buffering if we have enough buffer OR if video is already playing
        if ((bufferedDuration >= minBufferMillis && !buffering) || playbackStatus.isPlaying) {
          setIsInitialBuffering(false);
        }
      }
      
      // Update buffering state, but keep it true during initial buffering phase
      if (isInitialBuffering) {
        setIsBuffering(true);
      } else if (buffering !== isBuffering) {
        setIsBuffering(buffering);
      }
      
      // expo-av automatically handles progressive chunk loading via HTTP Range requests
      // Video loads in chunks (typically 10-30 seconds at a time) to avoid long waits
      // The player will automatically buffer ahead while playing
      // No need for manual chunk management - expo-av handles it natively
      
      // Log when buffer is ready (at least 5 seconds buffered - reduced for faster feedback)
      if (!bufferReadyLoggedRef.current && playbackStatus.durationMillis) {
        const bufferedDuration = playbackStatus.playableDurationMillis || 0;
        const minBufferSeconds = 5; // Minimum 5 seconds buffer (reduced from 10s)
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
        // Mark as played for the first time when video starts playing
        if (playbackStatus.isPlaying && !hasPlayedOnce) {
          setHasPlayedOnce(true);
        }
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
      
      if (language.code === 'off') {
        setSelectedSubtitle('off');
        setSelectedSubtitleLanguage('');
        setShowSubtitles(false);
      } else {
        // Find matching subtitle from available subtitles
        const matchingSubtitle = availableSubtitles.find(
          (sub: any) => {
            const subLang = sub.language?.toLowerCase() || '';
            const subName = sub.subTitleName?.toLowerCase() || '';
            return subLang === language.code || 
                   subName.includes(language.code) ||
                   language.code.includes(subLang);
          }
        );
        
        if (matchingSubtitle) {
          const langKey = matchingSubtitle.language || matchingSubtitle.subTitleName || '';
          setSelectedSubtitle(language.code);
          setSelectedSubtitleLanguage(langKey);
          setShowSubtitles(true);
        } else {
          // If no matching subtitle found, try to find any subtitle with similar language
          const fallbackSubtitle = availableSubtitles.find(
            (sub: any) => {
              const subLang = sub.language?.toLowerCase() || '';
              return subLang.startsWith(language.code) || language.code.startsWith(subLang);
            }
          );
          
          if (fallbackSubtitle) {
            const langKey = fallbackSubtitle.language || fallbackSubtitle.subTitleName || '';
            setSelectedSubtitle(language.code);
            setSelectedSubtitleLanguage(langKey);
            setShowSubtitles(true);
          } else {
            // No matching subtitle found
            setSelectedSubtitle(language.code);
            setSelectedSubtitleLanguage('');
            setShowSubtitles(false);
          }
        }
      }
      
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
          progressUpdateIntervalMillis={250}
          // Optimize buffering - update more frequently for better UX and faster response
          useNativeControls={false}
          // Enable faster playback start
          shouldCorrectPitch={false}
          // Optimize for faster buffering
          resizeMode={ResizeMode.CONTAIN}
          // Start playing when enough buffer is available (default behavior)
          onLoadStart={() => {
            console.log('VideoPlayerScreen: Video load started');
          }}
          onLoad={() => {
            console.log('VideoPlayerScreen: Video loaded, ready to play');
            // Video is ready, can start playing
            // Try to start playing immediately if not already playing
            if (!isPlaying && videoRef.current) {
              videoRef.current.playAsync().catch(err => {
                console.log('VideoPlayerScreen: Auto-play on load failed (normal if user interaction required):', err);
              });
            }
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
            {/* Wave Animation Circles - only show if video hasn't been played yet */}
            {!hasPlayedOnce && (
              <>
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
              </>
            )}
            
            {/* Loading Bubbles - show only during initial buffering (first play) */}
            {isInitialBuffering && (
              <Animated.View
                style={[
                  styles.loadingBubbleContainer,
                  {
                    transform: [
                      {
                        rotate: loadingBubbleRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {[...Array(12)].map((_, index) => {
                  const angle = (index * 360) / 12;
                  const radius = 50; // Distance from center of play button (40px radius + 10px gap)
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <View
                      key={index}
                      style={[
                        styles.loadingBubble,
                        {
                          transform: [{ translateX: x }, { translateY: y }],
                        },
                      ]}
                    />
                  );
                })}
              </Animated.View>
            )}
            
            {/* Play/Pause Button */}
            <Pressable 
              style={[
                styles.playPauseButton,
                (isBuffering || isPlaying) && styles.playPauseButtonDimmedMore
              ]} 
              onPress={togglePlayPause}
            >
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
                      {/* Show available subtitles from API first */}
                      {availableSubtitles.length > 0 && (
                        <>
                          {subtitleLanguages.filter(lang => lang.code === 'off').map((language) => (
                            <Pressable
                              key={language.id}
                              style={({ pressed }) => [
                                styles.subtitleMenuItem,
                                selectedSubtitle === language.code && styles.subtitleMenuItemActive,
                                pressed && { opacity: 0.8 }
                              ]}
                              onPress={() => selectSubtitle(language)}
                            >
                              <Text style={[
                                styles.subtitleMenuText,
                                selectedSubtitle === language.code && styles.subtitleMenuTextActive
                              ]}>
                                {language.name}
                              </Text>
                            </Pressable>
                          ))}
                          {availableSubtitles.map((subtitle: any) => {
                            const langCode = subtitle.language?.toLowerCase() || 'vi';
                            const langName = subtitle.subTitleName || subtitle.language || 'Unknown';
                            const isSelected = selectedSubtitle === langCode && selectedSubtitleLanguage === (subtitle.language || subtitle.subTitleName);
                            
                            return (
                              <Pressable
                                key={subtitle.movieSubTitleID || subtitle.subTitleName}
                                style={({ pressed }) => [
                                  styles.subtitleMenuItem,
                                  isSelected && styles.subtitleMenuItemActive,
                                  pressed && { opacity: 0.8 }
                                ]}
                                onPress={() => selectSubtitle({ code: langCode, name: langName })}
                              >
                                <Text style={[
                                  styles.subtitleMenuText,
                                  isSelected && styles.subtitleMenuTextActive
                                ]}>
                                  {langName}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </>
                      )}
                      {/* Fallback to default languages if no subtitles from API */}
                      {availableSubtitles.length === 0 && subtitleLanguages.map((language) => (
                        <Pressable
                          key={language.id}
                          style={({ pressed }) => [
                            styles.subtitleMenuItem,
                            selectedSubtitle === language.code && styles.subtitleMenuItemActive,
                            pressed && { opacity: 0.8 }
                          ]}
                          onPress={() => selectSubtitle(language)}
                        >
                          <Text style={[
                            styles.subtitleMenuText,
                            selectedSubtitle === language.code && styles.subtitleMenuTextActive
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
      {showSubtitles && selectedSubtitle !== 'off' && currentSubtitleText && (
        <View style={styles.subtitlesContainer}>
          <Text style={styles.subtitlesText}>
            {currentSubtitleText}
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
  playPauseButtonDimmed: {
    opacity: 0.5,
  },
  playPauseButtonDimmedMore: {
    opacity: 0.1,
  },
  loadingBubbleContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBubble: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e50914',
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