// Recently Updated Section Component
import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import AnimatedButton from '../AnimatedButton';
import { Ionicons } from '@expo/vector-icons';
import { MediaItem, TabItem } from '../../types/AppTypes';
import { GRID_CONFIG } from '../../constants/AppConstants';
import ImageWithPlaceholder from '../ImageWithPlaceholder';
import { logger } from '../../utils/logger';

interface RecentlyUpdatedProps {
  items: MediaItem[];
  tabs: TabItem[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onItemPress: (item: MediaItem) => void;
  onFilterPress: () => void;
  hasActiveFilters: boolean;
  t: (key: string) => string;
}

export const RecentlyUpdated: React.FC<RecentlyUpdatedProps> = ({
  items,
  tabs,
  activeCategory,
  onCategoryChange,
  onItemPress,
  onFilterPress,
  hasActiveFilters,
  t,
}) => {
  const width = Dimensions.get('window').width;
  const gridColumns = width >= GRID_CONFIG.TABLET_COLUMNS ? 3 : width >= GRID_CONFIG.MOBILE_LARGE_COLUMNS ? 2 : 2;
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [recentTopY, setRecentTopY] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const handleItemPress = (item: MediaItem) => onItemPress(item);

  const handleExpandToggle = () => {
    if (recentExpanded) {
      scrollRef.current?.scrollTo({ y: recentTopY, animated: true });
    }
    setRecentExpanded(!recentExpanded);
  };

  const handleCategoryPress = (category: string) => onCategoryChange(category);

  const renderItem = ({ item }: { item: MediaItem }) => (
    <AnimatedButton onPress={() => handleItemPress(item)} animationType="scale" style={styles.recentCard}>
      <ImageWithPlaceholder 
        source={item.cover || item.image} 
        style={styles.recentCover} 
        showRedBorder={false} 
      />
      <Text numberOfLines={1} style={styles.recentTitle}>{item.title}</Text>
      <Text numberOfLines={1} style={styles.recentCats}>
        {item.categories?.join(' • ') || ''}
      </Text>
      {item.isSeries && item.totalSeasons && (
        <Text numberOfLines={1} style={styles.recentEpisodes}>
          {item.totalSeasons} {t('details.seasons').toLowerCase()}
        </Text>
      )}
      <Text style={styles.recentRate}>
        {item.rating || item.popularity?.toString()}
      </Text>
    </AnimatedButton>
  );

  const renderGridItem = (item: MediaItem) => (
    <AnimatedButton
      key={item.id || item.movieID}
      onPress={() => handleItemPress(item)}
      animationType="scale"
      style={[
        styles.card,
        { width: (width - 32 - (gridColumns - 1) * 16) / gridColumns }
      ]}
    >
      <View style={styles.coverWrap}>
        <ImageWithPlaceholder 
          source={item.cover || item.image} 
          style={styles.cover} 
          showRedBorder={false} 
        />
      </View>
      <View style={styles.cardBody}>
        <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
        <Text numberOfLines={1} style={styles.cardCategories}>
          {item.categories?.join(' • ') || ''}
        </Text>
        {item.isSeries && item.totalSeasons && (
          <Text numberOfLines={1} style={styles.cardEpisodes}>
            {item.totalSeasons} {t('details.seasons').toLowerCase()}
          </Text>
        )}
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardRate}>
            {item.rating || item.popularity?.toString()}
          </Text>
          <Text style={styles.cardBadges}>HD • 16+</Text>
        </View>
      </View>
    </AnimatedButton>
  );

  return (
    <View onLayout={(e) => setRecentTopY(e.nativeEvent.layout.y)}>
      <Text style={styles.sectionTitle}>{t('home.recently_updated')}</Text>

      {/* Tabs header */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <Pressable 
            key={tab.key} 
            style={({ pressed }) => [
              styles.tabBtn, 
              activeCategory === tab.key && styles.tabBtnActive,
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => handleCategoryPress(tab.key)}
          >
            <Text style={[
              styles.tabText, 
              activeCategory === tab.key && styles.tabTextActive
            ]}>
              {tab.title}
            </Text>
            {tab.key === 'genre' && hasActiveFilters && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>!</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Content based on expanded state */}
      {!recentExpanded ? (
        <>
          <FlatList
            data={items.slice(0, 4)}
            keyExtractor={(item) => item.id || item.movieID.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={renderItem}
          />
          <AnimatedButton onPress={handleExpandToggle} animationType="scale" style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>{t('home.expand')}</Text>
          </AnimatedButton>
        </>
      ) : (
        <>
          <View style={styles.grid}> 
            {items.map(renderGridItem)}
          </View>
          <AnimatedButton onPress={handleExpandToggle} animationType="scale" style={styles.loadMoreBtn}>
            <Text style={styles.loadMoreText}>{t('home.collapse')}</Text>
          </AnimatedButton>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700', 
    marginTop: 16, 
    marginHorizontal: 16, 
    marginBottom: 15 
  },
  tabsRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    marginBottom: 8 
  },
  tabBtn: { 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 999, 
    backgroundColor: '#1c1c23', 
    position: 'relative',
    marginRight: 8
  },
  tabBtnActive: { 
    backgroundColor: '#292935' 
  },
  tabText: { 
    color: '#b0b0b8', 
    fontWeight: '600' 
  },
  tabTextActive: { 
    color: '#fff' 
  },
  filterBadge: { 
    position: 'absolute', 
    top: -2, 
    right: -2, 
    backgroundColor: '#ffd166', 
    borderRadius: 8, 
    width: 16, 
    height: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  filterBadgeText: { 
    color: '#000', 
    fontSize: 10, 
    fontWeight: '700' 
  },
  horizontalList: { 
    paddingHorizontal: 16 
  },
  separator: { 
    width: 16 
  },
  recentCard: { 
    width: 136, 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowRadius: 5, 
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 3 
  },
  recentCover: { 
    width: 136, 
    height: 188, 
    borderRadius: 12 
  },
  recentTitle: { 
    color: '#fff', 
    fontWeight: '700', 
    marginTop: 6, 
    fontSize: 13 
  },
  recentCats: { 
    color: '#a0a0a6', 
    marginTop: 2, 
    fontSize: 12 
  },
  recentEpisodes: { 
    color: '#e50914', 
    marginTop: 2, 
    fontSize: 11, 
    fontWeight: '600' 
  },
  recentRate: { 
    color: '#ffd166', 
    marginTop: 3, 
    fontWeight: '700' 
  },
  grid: { 
    paddingHorizontal: 16, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  card: { 
    backgroundColor: '#2b2b31', 
    borderRadius: 10, 
    overflow: 'hidden', 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOpacity: 0.25, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 3 }, 
    elevation: 4 
  },
  coverWrap: { 
    width: '100%', 
    aspectRatio: 2/3, 
    position: 'relative' 
  },
  cover: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 12 
  },
  cardBody: { 
    padding: 10 
  },
  cardTitle: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '700' 
  },
  cardCategories: { 
    color: '#a0a0a6', 
    marginTop: 3, 
    fontSize: 12 
  },
  cardEpisodes: { 
    color: '#e50914', 
    marginTop: 2, 
    fontSize: 11, 
    fontWeight: '600' 
  },
  cardMetaRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 6 
  },
  cardRate: { 
    color: '#ffd166', 
    fontWeight: '700' 
  },
  cardBadges: { 
    color: '#8e8e93', 
    fontSize: 12 
  },
  loadMoreBtn: { 
    alignSelf: 'center', 
    marginTop: 12, 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 999, 
    backgroundColor: '#e50914' 
  },
  loadMoreBtnPressed: { 
    opacity: 0.9, 
    transform: [{ scale: 0.98 }] 
  },
  loadMoreText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
});




