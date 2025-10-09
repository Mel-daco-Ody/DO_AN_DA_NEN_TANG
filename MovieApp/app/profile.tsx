import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ImageBackground, ScrollView, Pressable, TextInput, Switch, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { signOut } from '../services/auth';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { movieAppApi } from '../services/api';
import * as Haptics from 'expo-haptics';
import * as React from 'react';

export default function ProfileScreen() {
  const { authState, signOut: authSignOut, updateSubscription, updateUser } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [avatar, setAvatar] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [showBillingHistory, setShowBillingHistory] = useState(false);

  useEffect(() => {
    if (authState.user) {
      setName(authState.user.userName || 'User');
      setEmail(authState.user.email || '');
      setAvatar(authState.user.avatar || '');
    }
  }, [authState.user]);

  // Function to refresh overview stats
  const refreshOverviewStats = async () => {
    if (authState.user && authState.user.userID) {
      try {
        console.log('🔄 Refreshing overview stats...');
        const { movieAppApi } = await import('../services/mock-api');
        const response = await movieAppApi.getOverviewStats(authState.user.userID.toString());
        
        if (response.success && response.data) {
          setOverviewStats(response.data);
          console.log('✅ Overview stats refreshed:', response.data);
          console.log('✅ Latest comments count:', response.data.latestComments?.length || 0);
          console.log('✅ Latest comments:', response.data.latestComments?.map((c: any) => ({ 
            id: c.commentID, 
            content: c.content.substring(0, 30) + '...', 
            movie: c.movie?.title 
          })) || []);
        }
      } catch (error) {
        console.error('Error refreshing overview stats:', error);
      }
    }
  };

  // Load overview stats
  useEffect(() => {
    const loadOverviewStats = async () => {
      if (activeTab === 'overview' && authState.user && authState.user.userID) {
        setIsLoadingStats(true);
        try {
          const { movieAppApi } = await import('../services/mock-api');
          const response = await movieAppApi.getOverviewStats(authState.user.userID.toString());
          
          if (response.success && response.data) {
            setOverviewStats(response.data);
          }
        } catch (error) {
          console.error('Error loading overview stats:', error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    const loadBillingHistory = async () => {
      if (activeTab === 'subscription' && authState.user && authState.user.userID) {
        try {
          const { movieAppApi } = await import('../services/mock-api');
          const response = await movieAppApi.getBillingHistory(authState.user.userID.toString());
          
          if (response.errorCode === 200 && response.data) {
            setBillingHistory(response.data);
          }
        } catch (error) {
          console.error('Error loading billing history:', error);
        }
      }
    };

    loadOverviewStats();
    loadBillingHistory();
  }, [activeTab, authState.user]);

  // Refresh overview stats when switching to overview tab
  useEffect(() => {
    if (activeTab === 'overview' && authState.user) {
      refreshOverviewStats();
    }
  }, [activeTab]);

  // Refresh overview stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Profile: Screen focused, activeTab:', activeTab, 'user:', authState.user?.userID);
      if (activeTab === 'overview' && authState.user) {
        // Add a small delay to ensure data is updated
        setTimeout(() => {
          console.log('🔄 Profile: Refreshing overview stats...');
          refreshOverviewStats();
        }, 100);
      }
    }, [activeTab, authState.user])
  );

  // Sync selectedPlan with current subscription
  useEffect(() => {
    if (authState.user?.subscription) {
      setSelectedPlan(authState.user.subscription.plan);
    } else {
      setSelectedPlan('starter');
    }
  }, [authState.user?.subscription]);

  const handleChangePassword = async () => {
    if (!password.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await Haptics.selectionAsync();
      
      // Start password change process
      const startResponse = await movieAppApi.startPasswordChangeByEmail(email);
      
      if (startResponse.errorCode === 200) {
        // For now, we'll show an alert. In a real app, you'd navigate to a verification screen
        Alert.alert(
          'Verification Required',
          'Please check your email for a verification code to complete the password change.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'I have the code',
              onPress: () => {
                // TODO: Navigate to verification screen or show input dialog
                Alert.prompt(
                  'Enter Verification Code',
                  'Please enter the verification code sent to your email:',
                  async (code) => {
                    if (code) {
                      try {
                        const verifyResponse = await movieAppApi.verifyEmailCode(email, code);
                        if (verifyResponse.errorCode === 200) {
                          const commitResponse = await movieAppApi.commitPasswordChange(
                            verifyResponse.data?.ticket || '',
                            password,
                            newPassword
                          );
                          
                          if (commitResponse.errorCode === 200) {
                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            Alert.alert('Success', 'Password changed successfully');
                            setPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          } else {
                            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                            Alert.alert('Error', commitResponse.errorMessage || 'Failed to change password');
                          }
                        } else {
                          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                          Alert.alert('Error', verifyResponse.errorMessage || 'Invalid verification code');
                        }
                      } catch (error) {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        Alert.alert('Error', 'An error occurred during verification');
                      }
                    }
                  }
                );
              }
            }
          ]
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', startResponse.errorMessage || 'Failed to start password change');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'An error occurred while changing password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await Haptics.selectionAsync();
      
      // Update profile using Mock API
      const { movieAppApi } = await import('../services/mock-api');
      const userUpdates = {
        name: name,
        email: email,
        profilePicture: avatar
      };
      
      const response = await movieAppApi.updateUser(userUpdates);
      
      if (response.errorCode === 200) {
        // Update auth context with new user data
        updateUser(response.data);
      } else {
        throw new Error(response.errorMessage || 'Failed to update profile');
      }
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('profile.success'), t('profile.profile_updated'));
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'An error occurred while updating profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to change your profile picture!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newAvatarUri = result.assets[0].uri;
      setAvatar(newAvatarUri);
      // Update avatar in authState to sync across the app
      updateUser({
        avatar: newAvatarUri,
        profilePicture: newAvatarUri
      });
    }
  };

  const removeAvatar = () => {
    setAvatar('');
    // Update avatar in authState to sync across the app
    updateUser({
      avatar: '',
      profilePicture: ''
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentInsetAdjustmentBehavior="automatic">
      <ImageBackground source={{ uri: 'https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg' }} style={styles.hero}>
        <View style={styles.overlay} />
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerRow}>
          {avatar ? (
            <ImageWithPlaceholder source={{ uri: avatar }} style={styles.avatar} showRedBorder={false} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
          )}
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerName}>{name || 'User'}</Text>
            <Text style={styles.headerMeta}>Member</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => { authSignOut(); router.replace('/'); }} style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}>
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </Pressable>
        </View>
      </ImageBackground>

      {/* Navigation tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => setActiveTab('overview')} style={({ pressed }) => [styles.tab, activeTab === 'overview' && styles.tabActive, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive, { color: theme.colors.text }]}>Overview</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('settings')} style={({ pressed }) => [styles.tab, activeTab === 'settings' && styles.tabActive, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive, { color: theme.colors.text }]}>{t('profile.settings')}</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('subscription')} style={({ pressed }) => [styles.tab, activeTab === 'subscription' && styles.tabActive, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.tabText, activeTab === 'subscription' && styles.tabTextActive, { color: theme.colors.text }]}>Subscription</Text>
        </Pressable>
      </View>

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
          {!authState.user ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>Please login to view overview</Text>
            </View>
          ) : isLoadingStats ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
            </View>
          ) : (
            <>
              {/* Statistics Cards */}
              <View style={styles.statsGrid}>
                <View style={[styles.overviewStatCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.overviewStatTitle, { color: theme.colors.text }]}>Subscription Plan</Text>
                  <Text style={styles.overviewStatValue}>
                    {authState.user?.subscription?.plan ? authState.user.subscription.plan.toUpperCase() : 'STARTER'}
                  </Text>
                  <Text style={[styles.overviewStatSubtext, { color: theme.colors.textSecondary }]}>
                    {authState.user?.subscription?.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </View>
                
                <View style={[styles.overviewStatCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.overviewStatTitle, { color: theme.colors.text }]}>Films Watched</Text>
                  <Text style={styles.overviewStatValue}>
                    {overviewStats?.filmsWatched !== undefined ? overviewStats.filmsWatched : '---'}
                  </Text>
                </View>
                
                <View style={[styles.overviewStatCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.overviewStatTitle, { color: theme.colors.text }]}>Comments</Text>
                  <Text style={styles.overviewStatValue}>
                    {overviewStats?.commentsCount !== undefined ? overviewStats.commentsCount : '---'}
                  </Text>
                </View>
              </View>

              {/* Recent Views */}
              <View style={styles.overviewSection}>
                <Text style={[styles.overviewSectionTitle, { color: theme.colors.text }]}>Recent Views</Text>
                {overviewStats?.recentViews && overviewStats.recentViews.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {overviewStats.recentViews.map((view: any, index: number) => (
                      <View key={index} style={[styles.recentViewCard, { backgroundColor: theme.colors.surface }]}>
                        <ImageWithPlaceholder source={view.image} style={styles.recentViewImage} showRedBorder={false} />
                        <Text style={[styles.recentViewTitle, { color: theme.colors.text }]} numberOfLines={2}>
                          {view.title}
                        </Text>
                        <Text style={[styles.recentViewDate, { color: theme.colors.textSecondary }]}>
                          {new Date(view.lastWatchedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No recent views</Text>
                  </View>
                )}
              </View>

              {/* Latest Comments */}
              <View style={styles.overviewSection}>
                <Text style={[styles.overviewSectionTitle, { color: theme.colors.text }]}>Latest Comments</Text>
                {overviewStats?.latestComments && overviewStats.latestComments.length > 0 ? (
                  <View style={styles.commentsList}>
                    {overviewStats.latestComments.map((comment: any, index: number) => {
                      console.log('🖼️ Comment image debug:', {
                        commentID: comment.commentID,
                        movieTitle: comment.movie?.title,
                        movieImage: comment.movie?.image,
                        hasImage: !!comment.movie?.image
                      });
                      return (
                      <View key={index} style={[styles.commentCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.commentContent}>
                          <ImageWithPlaceholder 
                            source={{ uri: comment.movie?.image || 'https://via.placeholder.com/60x90/333/fff?text=Movie' }}
                            style={styles.commentMovieImage}
                            showRedBorder={false}
                            errorText="?"
                          />
                          <View style={styles.commentTextContent}>
                            <View style={styles.commentHeader}>
                              <Text style={[styles.commentMovieTitle, { color: theme.colors.text }]}>
                                {comment.movie?.title || 'Movie'}
                              </Text>
                              <Text style={[styles.commentDate, { color: theme.colors.textSecondary }]}>
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </Text>
                            </View>
                            <Text style={[styles.commentText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                              {comment.content}
                            </Text>
                          </View>
                        </View>
                      </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No comments yet</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      )}

      {/* Settings Content */}
      {activeTab === 'settings' && (
        <>
          {/* Profile Picture Section */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.profile_picture')}</Text>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                  {avatar ? (
                    <ImageWithPlaceholder source={{ uri: avatar }} style={styles.settingsAvatar} showRedBorder={false} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { width: 80, height: 80, borderRadius: 40 }]}>
                      <Text style={[styles.avatarInitial, { fontSize: 32 }]}>{name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                    </View>
                  )}
              </View>
              <View style={styles.avatarActions}>
                <Pressable onPress={pickImage} style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.9 }]}>
                  <Text style={styles.avatarBtnText}>Change Photo</Text>
                </Pressable>
                <Pressable onPress={removeAvatar} style={({ pressed }) => [styles.avatarBtn, styles.avatarBtnDanger, pressed && { opacity: 0.9 }]}>
                  <Text style={[styles.avatarBtnText, styles.avatarBtnTextDanger]}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account Information</Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor={theme.colors.textSecondary}
              value={name}
              onChangeText={setName}
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              keyboardType="email-address"
            />
            <TextInput
              placeholder="Current Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              secureTextEntry
            />
            <TextInput
              placeholder="New Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              secureTextEntry
            />
            <TextInput
              placeholder="Confirm New Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              secureTextEntry
            />
            <Pressable 
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }, isUpdatingProfile && styles.disabledButton]}
              onPress={handleUpdateProfile}
              disabled={isUpdatingProfile}
            >
              <Text style={styles.primaryBtnText}>
                {isUpdatingProfile ? t('profile.updating') : t('profile.update_profile')}
              </Text>
            </Pressable>
            <Pressable 
              style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }, isChangingPassword && styles.disabledButton]}
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              <Text style={styles.secondaryBtnText}>
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </Text>
            </Pressable>
          </View>

          {/* Preferences */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences</Text>
            <View style={[styles.preferenceRow, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Push Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#767577', true: '#e50914' }}
                thumbColor={notifications ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={[styles.preferenceRow, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Email Updates</Text>
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={{ false: '#767577', true: '#e50914' }}
                thumbColor={emailUpdates ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={[styles.preferenceRow, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: '#e50914' }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Danger Zone */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Danger Zone</Text>
            <Pressable style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.9 }]}>
              <Text style={styles.dangerBtnText}>Delete Account</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Subscription Content */}
      {activeTab === 'subscription' && (
        <>
          {/* Current plan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current plan</Text>
            <View style={[styles.planCard, styles.planActive]}>
              <Text style={styles.planTitle}>
                {authState.user?.subscription?.plan === 'premium' ? 'Premium Plan' :
                 authState.user?.subscription?.plan === 'cinematic' ? 'Cinematic Plan' : 'Free Plan'}
              </Text>
              <Text style={styles.planPrice}>
                {authState.user?.subscription?.plan === 'premium' ? '$19.99 / month' :
                 authState.user?.subscription?.plan === 'cinematic' ? '$39.99 / 2 months' : '$0 / month'}
              </Text>
              <Text style={styles.planStatus}>
                {authState.user?.subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
              {authState.user?.subscription?.endDate && (
                <Text style={styles.planExpiry}>
                  Expires: {new Date(authState.user.subscription.endDate).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>

          {/* Available plans */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available plans</Text>
            <Text style={styles.sectionSubtitle}>Choose your subscription plan:</Text>
            <View style={styles.plansGrid}>
              <Pressable 
                onPress={() => setSelectedPlan('starter')} 
                style={({ pressed }) => [styles.planCard, selectedPlan === 'starter' && styles.planSelected, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.planTitle}>Starter</Text>
                <Text style={styles.planPrice}>Free</Text>
                <Text style={styles.planDuration}>unlimited</Text>
                <Text style={styles.planFeatures}>• 720p Resolution</Text>
                <Text style={styles.planFeatures}>• Limited Availability</Text>
                <Text style={styles.planFeatures}>• Desktop Only</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => setSelectedPlan('premium')} 
                style={({ pressed }) => [styles.planCard, selectedPlan === 'premium' && styles.planSelected, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.planTitle}>Premium</Text>
                <Text style={styles.planPrice}>$19.99</Text>
                <Text style={styles.planDuration}>per month</Text>
                <Text style={styles.planFeatures}>• Full HD</Text>
                <Text style={styles.planFeatures}>• Lifetime Availability</Text>
                <Text style={styles.planFeatures}>• TV & Desktop</Text>
                <Text style={styles.planFeatures}>• 24/7 Support</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => setSelectedPlan('cinematic')} 
                style={({ pressed }) => [styles.planCard, selectedPlan === 'cinematic' && styles.planSelected, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.planTitle}>Cinematic</Text>
                <Text style={styles.planPrice}>$39.99</Text>
                <Text style={styles.planDuration}>per 2 months</Text>
                <Text style={styles.planFeatures}>• Ultra HD</Text>
                <Text style={styles.planFeatures}>• Lifetime Availability</Text>
                <Text style={styles.planFeatures}>• Any Device</Text>
                <Text style={styles.planFeatures}>• 24/7 Support</Text>
              </Pressable>
            </View>
            
            {/* Action button for all plans */}
            <Pressable 
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
              onPress={async () => {
                try {
                  await Haptics.selectionAsync();
                  
                  const currentPlan = authState.user?.subscription?.plan || 'starter';
                  
                  if (selectedPlan === currentPlan) {
                    Alert.alert('Current Plan', `You are already on the ${currentPlan} plan.`);
                    return;
                  }
                  
                  // Determine if it's an upgrade or downgrade
                  const planHierarchy = { 'starter': 0, 'premium': 1, 'cinematic': 2 };
                  const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
                  const selectedLevel = planHierarchy[selectedPlan as keyof typeof planHierarchy] || 0;
                  
                  if (selectedLevel > currentLevel) {
                    // Upgrade - Navigate to payment page
                    router.push('/payment');
                  } else {
                    // Downgrade - Show confirmation dialog
                    Alert.alert(
                      'Downgrade Subscription',
                      `Are you sure you want to downgrade from ${currentPlan} to ${selectedPlan}? You will lose access to premium features.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Downgrade',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await updateSubscription(selectedPlan as 'starter' | 'premium' | 'cinematic');
                              Alert.alert('Subscription Updated', `Successfully downgraded to ${selectedPlan} plan!`);
                            } catch (error) {
                              Alert.alert('Error', 'Failed to update subscription. Please try again.');
                            }
                          }
                        }
                      ]
                    );
                  }
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
            >
              <Text style={styles.primaryBtnText}>
                {(() => {
                  const currentPlan = authState.user?.subscription?.plan || 'starter';
                  
                  if (selectedPlan === currentPlan) {
                    return `Continue Current Plan`;
                  }
                  
                  // Determine if it's an upgrade or downgrade
                  const planHierarchy = { 'starter': 0, 'premium': 1, 'cinematic': 2 };
                  const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
                  const selectedLevel = planHierarchy[selectedPlan as keyof typeof planHierarchy] || 0;
                  
                  const planNames = { 'starter': 'Starter', 'premium': 'Premium', 'cinematic': 'Cinematic' };
                  const selectedPlanName = planNames[selectedPlan as keyof typeof planNames] || selectedPlan;
                  
                  if (selectedLevel > currentLevel) {
                    return `Upgrade to ${selectedPlanName}`;
                  } else if (selectedLevel < currentLevel) {
                    return `Downgrade to ${selectedPlanName}`;
                  } else {
                    return `Switch to ${selectedPlanName}`;
                  }
                })()}
              </Text>
            </Pressable>
          </View>

          {/* Billing History */}
          <View style={styles.section}>
            <Pressable 
              style={styles.billingHistoryButton}
              onPress={() => setShowBillingHistory(!showBillingHistory)}
            >
              <Text style={styles.billingHistoryButtonText}>
                {showBillingHistory ? 'Hide' : 'Show'} Billing History ({billingHistory.length})
              </Text>
              <Text style={styles.billingHistoryButtonIcon}>
                {showBillingHistory ? '▲' : '▼'}
              </Text>
            </Pressable>
            
            {showBillingHistory && (
              <View style={styles.billingHistoryContainer}>
                {billingHistory.length > 0 ? (
                  billingHistory.map((billing, index) => (
                    <View key={billing.billingID || index} style={styles.billingItem}>
                      <View style={styles.billingHeader}>
                        <Text style={styles.billingPlan}>{billing.subscriptionPlan.toUpperCase()}</Text>
                        <Text style={styles.billingAmount}>${billing.amount.toFixed(2)}</Text>
                      </View>
                      <Text style={styles.billingMethod}>Payment Method: {billing.paymentMethod}</Text>
                      <Text style={styles.billingStatus}>Status: {billing.status}</Text>
                      <Text style={styles.billingDate}>
                        {new Date(billing.billingDate).toLocaleDateString()}
                      </Text>
                      {billing.transactionID && (
                        <Text style={styles.billingTransaction}>
                          Transaction ID: {billing.transactionID}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noBillingHistory}>No billing history found</Text>
                )}
              </View>
            )}
          </View>

          {/* Cancel subscription */}
          <View style={styles.section}>
            <Pressable 
              style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.9 }]}
              onPress={() => {
                Alert.alert(
                  'Cancel Subscription',
                  'Are you sure you want to cancel your subscription? You will lose access to premium features.',
                  [
                    { text: 'Keep Subscription', style: 'cancel' },
                    { 
                      text: 'Cancel Subscription', 
                      style: 'destructive',
                      onPress: () => {
                        // TODO: Implement subscription cancellation with FilmZone backend
                        // const response = await movieAppApi.cancelSubscription();
                        console.log('Cancel subscription');
                        Alert.alert('Subscription Cancelled', 'Your subscription has been reset to Starter plan.');
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.dangerBtnText}>Cancel Subscription</Text>
            </Pressable>
          </View>

        </>
      )}

      {/* Overview Content */}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2b2b31' },
  hero: { height: 180, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  backBtn: { position: 'absolute', top: 12, left: 12, width: 36, height: 36, borderWidth: 2, borderColor: '#e50914', borderRadius: 8, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  backArrow: { color: '#e50914', fontSize: 20, fontWeight: '800' },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#14141b' },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e50914', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontSize: 24, fontWeight: '700' },
  headerName: { color: '#fff', fontWeight: '800', fontSize: 18 },
  headerMeta: { color: '#c7c7cc', marginTop: 4 },

  section: { margin: 12, backgroundColor: '#121219', borderRadius: 12, padding: 12 },
  sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 8 },
  sectionSubtitle: { color: '#8e8e93', fontSize: 12, marginBottom: 12 },
  input: { backgroundColor: '#14141b', borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#fff', marginBottom: 10, borderWidth: 1, borderColor: '#e50914' },
  primaryBtn: { backgroundColor: '#e50914', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  logoutBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e50914', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  logoutText: { color: '#e50914', fontWeight: '700' },

  cardRow: { flexDirection: 'row' },
  card: { flex: 1, backgroundColor: '#14141b', borderRadius: 10, padding: 12, marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  cardSelected: { borderColor: '#e50914' },
  cardTitle: { color: '#fff', fontWeight: '700' },
  cardText: { color: '#c7c7cc', marginTop: 4 },

  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  activityText: { color: '#c7c7cc' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#e50914', marginRight: 8 },

  dangerBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e50914', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  dangerBtnText: { color: '#e50914', fontWeight: '700' },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap' },
  thumbCard: { width: '31%', marginRight: '3.5%', marginBottom: 10 },
  thumbImg: { width: '100%', aspectRatio: 2/3, borderRadius: 10 },
  thumbTitle: { color: '#fff', fontSize: 12, marginTop: 6 },
  tabBar: { flexDirection: 'row', backgroundColor: '#000', marginHorizontal: 12, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#e50914' },
  tabText: { color: '#fff', fontWeight: '700' },
  tabTextActive: { color: '#fff' },

  // Settings styles
  avatarSection: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { marginRight: 16 },
  settingsAvatar: { width: 80, height: 80, borderRadius: 40 },
  avatarActions: { flex: 1 },
  avatarBtn: { backgroundColor: '#e50914', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8 },
  avatarBtnDanger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e50914' },
  avatarBtnText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  avatarBtnTextDanger: { color: '#e50914' },
  preferenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  preferenceLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Subscription styles
  planCard: { backgroundColor: '#14141b', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
  planActive: { borderColor: '#e50914', backgroundColor: 'rgba(229, 9, 20, 0.1)' },
  planSelected: { borderColor: '#e50914' },
  planTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  planPrice: { color: '#ffd166', fontWeight: '700', fontSize: 18, marginTop: 4 },
  planDuration: { color: '#8e8e93', fontSize: 12, marginTop: 2 },
  planStatus: { color: '#c7c7cc', marginTop: 4 },
  planExpiry: { color: '#8e8e93', marginTop: 2, fontSize: 12 },
  planFeatures: { color: '#c7c7cc', marginTop: 4, fontSize: 12 },
  plansGrid: { flexDirection: 'column' },
  
  // Additional styles for new features
  disabledButton: { opacity: 0.6 },
  secondaryBtn: { backgroundColor: 'transparent', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#e50914' },
  secondaryBtnText: { color: '#e50914', fontSize: 16, fontWeight: '600' },
  paymentBtn: { backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  paymentBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  // Overview styles
  content: { flex: 1 },
  loadingContainer: { padding: 20, alignItems: 'center' },
  loadingText: { fontSize: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  overviewStatCard: { flex: 1, minWidth: '30%', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  overviewStatTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  overviewStatValue: { fontSize: 20, fontWeight: '700', color: '#e50914' },
  overviewStatSubtext: { fontSize: 12, fontWeight: '500', marginTop: 4, textAlign: 'center' },
  overviewSection: { paddingHorizontal: 16, paddingVertical: 16 },
  overviewSectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  emptyState: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  
  // Recent Views styles
  recentViewCard: { width: 120, marginRight: 12, borderRadius: 8, padding: 8 },
  recentViewImage: { width: '100%', height: 80, borderRadius: 6, marginBottom: 8 },
  recentViewTitle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  recentViewDate: { fontSize: 10 },
  
  // Comments styles - With movie images
  commentsList: { gap: 8 },
  commentCard: { 
    padding: 12, 
    borderRadius: 8, 
    backgroundColor: '#1a1a1f',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)'
  },
  commentContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  commentMovieImage: {
    width: 50,
    height: 70,
    borderRadius: 6,
    backgroundColor: '#333'
  },
  commentTextContent: {
    flex: 1
  },
  commentHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  commentMovieTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#e50914',
    flex: 1
  },
  commentDate: { 
    fontSize: 11, 
    color: '#8e8e93'
  },
  commentText: { 
    fontSize: 13, 
    lineHeight: 18, 
    color: '#c7c7cc'
  },
  
  // Billing History Styles
  billingHistoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1c23',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  billingHistoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  billingHistoryButtonIcon: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  billingHistoryContainer: {
    marginTop: 8,
  },
  billingItem: {
    backgroundColor: '#1c1c23',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billingPlan: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  billingAmount: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  billingMethod: {
    color: '#c7c7cc',
    fontSize: 14,
    marginBottom: 4,
  },
  billingStatus: {
    color: '#c7c7cc',
    fontSize: 14,
    marginBottom: 4,
  },
  billingDate: {
    color: '#666',
    fontSize: 12,
    marginBottom: 4,
  },
  billingTransaction: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  noBillingHistory: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});


