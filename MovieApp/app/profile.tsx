import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ImageBackground, ScrollView, Pressable, TextInput, Switch, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { getCurrentUser, signOut } from '../services/auth';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import * as ImagePicker from 'expo-image-picker';
import { useSubscription, SubscriptionPlan } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen() {
  const { subscription, updateSubscription, cancelSubscription, toggleAutoRenew, refreshSubscription } = useSubscription();
  const { authState, signOut: authSignOut } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/200');
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(subscription.currentPlan?.id || 'starter');

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setName(u.name);
      setEmail(u.email);
    }
  }, []);

  // Sync selectedPlan with current subscription
  useEffect(() => {
    setSelectedPlan(subscription.currentPlan?.id || 'starter');
  }, [subscription.currentPlan]);

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
      setAvatar(result.assets[0].uri);
    }
  };

  const removeAvatar = () => {
    setAvatar('');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentInsetAdjustmentBehavior="automatic">
      <ImageBackground source={{ uri: 'https://flixgo.volkovdesign.com/main/img/bg/section__bg.jpg' }} style={styles.hero}>
        <View style={styles.overlay} />
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerRow}>
          <ImageWithPlaceholder source={{ uri: avatar }} style={styles.avatar} showRedBorder={false} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.headerMeta}>Member</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => { authSignOut(); router.replace('/'); }} style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ImageBackground>

      {/* Navigation tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => setActiveTab('overview')} style={({ pressed }) => [styles.tab, activeTab === 'overview' && styles.tabActive, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive, { color: theme.colors.text }]}>Overview</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('settings')} style={({ pressed }) => [styles.tab, activeTab === 'settings' && styles.tabActive, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive, { color: theme.colors.text }]}>Settings</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab('subscription')} style={({ pressed }) => [styles.tab, activeTab === 'subscription' && styles.tabActive, pressed && { opacity: 0.9 }]}>
          <Text style={[styles.tabText, activeTab === 'subscription' && styles.tabTextActive, { color: theme.colors.text }]}>Subscription</Text>
        </Pressable>
      </View>

      {/* Settings Content */}
      {activeTab === 'settings' && (
        <>
          {/* Profile Picture Section */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profile Picture</Text>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {avatar ? (
                  <ImageWithPlaceholder source={{ uri: avatar }} style={styles.settingsAvatar} showRedBorder={false} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
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
              placeholder="Password"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              secureTextEntry
            />
            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}>
              <Text style={styles.primaryBtnText}>Save Changes</Text>
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
              <Text style={styles.planTitle}>{subscription.currentPlan?.name || 'No Plan'}</Text>
              <Text style={styles.planPrice}>${subscription.currentPlan?.price || 0} / {subscription.currentPlan?.duration || 'month'}</Text>
              <Text style={styles.planStatus}>
                {subscription.isActive ? `Active until ${subscription.expiryDate}` : 'Inactive'}
              </Text>
            </View>
          </View>

          {/* Available plans */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available plans</Text>
            <View style={styles.plansGrid}>
              <Pressable onPress={() => setSelectedPlan('starter')} style={({ pressed }) => [styles.planCard, selectedPlan === 'starter' && styles.planSelected, pressed && { opacity: 0.9 }]}>
                <Text style={styles.planTitle}>Starter</Text>
                <Text style={styles.planPrice}>Free</Text>
                <Text style={styles.planFeatures}>• 7 days trial</Text>
                <Text style={styles.planFeatures}>• 720p Resolution</Text>
                <Text style={styles.planFeatures}>• Limited Availability</Text>
                <Text style={styles.planFeatures}>• Desktop Only</Text>
              </Pressable>
              
              <Pressable onPress={() => setSelectedPlan('premium')} style={({ pressed }) => [styles.planCard, selectedPlan === 'premium' && styles.planSelected, pressed && { opacity: 0.9 }]}>
                <Text style={styles.planTitle}>Premium</Text>
                <Text style={styles.planPrice}>$19.99</Text>
                <Text style={styles.planFeatures}>• 1 Month</Text>
                <Text style={styles.planFeatures}>• Full HD</Text>
                <Text style={styles.planFeatures}>• Lifetime Availability</Text>
                <Text style={styles.planFeatures}>• TV & Desktop</Text>
                <Text style={styles.planFeatures}>• 24/7 Support</Text>
              </Pressable>
              
              <Pressable onPress={() => setSelectedPlan('cinematic')} style={({ pressed }) => [styles.planCard, selectedPlan === 'cinematic' && styles.planSelected, pressed && { opacity: 0.9 }]}>
                <Text style={styles.planTitle}>Cinematic</Text>
                <Text style={styles.planPrice}>$39.99</Text>
                <Text style={styles.planFeatures}>• 2 Months</Text>
                <Text style={styles.planFeatures}>• Ultra HD</Text>
                <Text style={styles.planFeatures}>• Lifetime Availability</Text>
                <Text style={styles.planFeatures}>• Any Device</Text>
                <Text style={styles.planFeatures}>• 24/7 Support</Text>
              </Pressable>
            </View>
            
            <Pressable 
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
              onPress={() => {
                const plans: { [key: string]: SubscriptionPlan } = {
                  'starter': {
                    id: 'starter',
                    name: 'Starter',
                    price: 0,
                    duration: 'monthly',
                    features: ['7 days trial', '720p Resolution', 'Limited Availability', 'Desktop Only']
                  },
                  'premium': {
                    id: 'premium',
                    name: 'Premium',
                    price: 19.99,
                    duration: 'monthly',
                    features: ['1 Month', 'Full HD', 'Lifetime Availability', 'TV & Desktop', '24/7 Support'],
                    isPopular: true
                  },
                  'cinematic': {
                    id: 'cinematic',
                    name: 'Cinematic',
                    price: 39.99,
                    duration: 'monthly',
                    features: ['2 Months', 'Ultra HD', 'Lifetime Availability', 'Any Device', '24/7 Support']
                  }
                };

                const selectedPlanData = plans[selectedPlan];
                if (selectedPlanData) {
                  updateSubscription(selectedPlanData);
                  refreshSubscription();
                  const currentPlanId = subscription.currentPlan?.id || 'starter';
                  const planHierarchy = { 'starter': 0, 'premium': 1, 'cinematic': 2 };
                  const currentLevel = planHierarchy[currentPlanId as keyof typeof planHierarchy] || 0;
                  const selectedLevel = planHierarchy[selectedPlan as keyof typeof planHierarchy] || 0;
                  
                  let actionText = 'updated';
                  if (selectedLevel > currentLevel) {
                    actionText = 'upgraded to';
                  } else if (selectedLevel < currentLevel) {
                    actionText = 'downgraded to';
                  } else if (selectedPlan === currentPlanId) {
                    actionText = 'continued';
                  } else {
                    actionText = 'switched to';
                  }
                  
                  Alert.alert(
                    'Subscription Updated',
                    `Successfully ${actionText} ${selectedPlanData.name} plan!`,
                    [{ text: 'OK' }]
                  );
                }
              }}
            >
              <Text style={styles.primaryBtnText}>
                {(() => {
                  const currentPlanId = subscription.currentPlan?.id || 'starter';
                  
                  if (selectedPlan === currentPlanId) {
                    return `Continue ${subscription.currentPlan?.name || 'Current Plan'}`;
                  }
                  
                  // Determine if it's an upgrade or downgrade
                  const planHierarchy = { 'starter': 0, 'premium': 1, 'cinematic': 2 };
                  const currentLevel = planHierarchy[currentPlanId as keyof typeof planHierarchy] || 0;
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
                        cancelSubscription();
                        refreshSubscription();
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

          {/* Billing history */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing history</Text>
            <View style={styles.billingItem}>
              <Text style={styles.billingDate}>Nov 25, 2024</Text>
              <Text style={styles.billingAmount}>$19.99</Text>
              <Text style={styles.billingStatus}>Paid</Text>
            </View>
            <View style={styles.billingItem}>
              <Text style={styles.billingDate}>Oct 25, 2024</Text>
              <Text style={styles.billingAmount}>$19.99</Text>
              <Text style={styles.billingStatus}>Paid</Text>
            </View>
            <View style={styles.billingItem}>
              <Text style={styles.billingDate}>Sep 25, 2024</Text>
              <Text style={styles.billingAmount}>$19.99</Text>
              <Text style={styles.billingStatus}>Paid</Text>
            </View>
          </View>
        </>
      )}

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <>
          {/* KPI cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Premium plan</Text>
          <Text style={styles.statValue}>$19.99</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Films watched</Text>
          <Text style={styles.statValue}>1 172</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Your comments</Text>
          <Text style={styles.statValue}>2 573</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Your reviews</Text>
          <Text style={styles.statValue}>1 021</Text>
        </View>
      </View>

      {/* Recent Views panel */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Recent Views</Text>
          <Pressable style={({ pressed }) => [styles.panelBtn, pressed && { opacity: 0.9 }]} onPress={() => router.push('/recent-views')}>
            <Text style={styles.panelBtnText}>View All</Text>
          </Pressable>
        </View>
        <View style={styles.tableHead}>
          <Text style={[styles.th, { flex: 0.6 }]}>ID</Text>
          <Text style={[styles.th, { flex: 3 }]}>TITLE</Text>
          <Text style={[styles.th, { flex: 2 }]}>CATEGORY</Text>
          <Text style={[styles.th, { flex: 1 }]}>RATING</Text>
        </View>
        {[
          { id: '321', title: 'The Lost City', cat: 'Movie', rate: '9.2' },
          { id: '54', title: 'Undercurrents', cat: 'Anime', rate: '9.1' },
          { id: '670', title: 'Tales from the Underworld', cat: 'TV Show', rate: '9.0' },
          { id: '241', title: 'The Unseen World', cat: 'TV Show', rate: '8.9' },
          { id: '22', title: 'Redemption Road', cat: 'Movie', rate: '8.9' },
        ].map((r, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 0.6 }]}>{r.id}</Text>
            <Text style={[styles.td, { flex: 3 }]}>{r.title}</Text>
            <Text style={[styles.td, { flex: 2 }]}>{r.cat}</Text>
            <Text style={[styles.td, { flex: 1, color: '#ffd166', fontWeight: '700' }]}>{r.rate}</Text>
          </View>
        ))}
      </View>

      {/* Latest reviews panel */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Latest reviews</Text>
          <Pressable style={({ pressed }) => [styles.panelBtn, pressed && { opacity: 0.9 }]} onPress={() => router.push('/latest-reviews')}>
            <Text style={styles.panelBtnText}>View All</Text>
          </Pressable>
        </View>
        <View style={styles.tableHead}>
          <Text style={[styles.th, { flex: 0.8 }]}>ID</Text>
          <Text style={[styles.th, { flex: 3 }]}>ITEM</Text>
          <Text style={[styles.th, { flex: 2 }]}>AUTHOR</Text>
          <Text style={[styles.th, { flex: 1 }]}>RATING</Text>
        </View>
        {[
          { id: '126', item: 'I Dream in Another Language', author: 'Jackson Brown', rate: '7.2' },
          { id: '125', item: 'Benched', author: 'Quang', rate: '6.3' },
          { id: '124', item: 'Whitney', author: 'Brian Cranston', rate: '8.4' },
          { id: '123', item: 'Blindspotting', author: 'Ketut', rate: '9.0' },
          { id: '122', item: 'I Dream in Another Language', author: 'Eliza Josceline', rate: '7.7' },
        ].map((r, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 0.8 }]}>{r.id}</Text>
            <Text style={[styles.td, { flex: 3 }]}>{r.item}</Text>
            <Text style={[styles.td, { flex: 2 }]}>{r.author}</Text>
            <Text style={[styles.td, { flex: 1, color: '#ffd166', fontWeight: '700' }]}>{r.rate}</Text>
          </View>
        ))}
      </View>
        </>
      )}
      
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
  headerName: { color: '#fff', fontWeight: '800', fontSize: 18 },
  headerMeta: { color: '#c7c7cc', marginTop: 4 },

  section: { margin: 12, backgroundColor: '#121219', borderRadius: 12, padding: 12 },
  sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 8 },
  input: { backgroundColor: '#14141b', borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#fff', marginBottom: 10, borderWidth: 1, borderColor: '#e50914' },
  primaryBtn: { backgroundColor: '#e50914', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, marginTop: 12 },
  statCard: { flex: 1, backgroundColor: '#121219', borderRadius: 12, padding: 12, marginRight: 10 },
  statLabel: { color: '#c7c7cc' },
  statValue: { color: '#fff', fontWeight: '800', fontSize: 18, marginTop: 6 },
  panel: { margin: 12, backgroundColor: '#121219', borderRadius: 12, padding: 12 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  panelTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  panelBtn: { marginLeft: 'auto', borderWidth: 1, borderColor: '#2a2a37', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  panelBtnText: { color: '#c7c7cc', fontWeight: '700' },
  tableHead: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  th: { color: '#8e8e93', fontWeight: '700' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  td: { color: '#c7c7cc' },
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
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e50914', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontSize: 32, fontWeight: '700' },
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
  planStatus: { color: '#c7c7cc', marginTop: 4 },
  planFeatures: { color: '#c7c7cc', marginTop: 4, fontSize: 12 },
  plansGrid: { flexDirection: 'column' },
  billingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  billingDate: { color: '#c7c7cc', flex: 2 },
  billingAmount: { color: '#fff', fontWeight: '700', flex: 1 },
  billingStatus: { color: '#4CAF50', fontWeight: '700', flex: 1 },
});


