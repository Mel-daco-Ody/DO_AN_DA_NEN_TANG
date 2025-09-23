import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RecentViewsScreen() {
  const recentViews = [
    { id: '321', title: 'The Lost City', cat: 'Movie', rate: '9.2' },
    { id: '54', title: 'Undercurrents', cat: 'Anime', rate: '9.1' },
    { id: '670', title: 'Tales from the Underworld', cat: 'TV Show', rate: '9.0' },
    { id: '241', title: 'The Unseen World', cat: 'TV Show', rate: '8.9' },
    { id: '22', title: 'Redemption Road', cat: 'Movie', rate: '8.9' },
    { id: '123', title: 'Digital Dreams', cat: 'Movie', rate: '8.7' },
    { id: '456', title: 'Midnight Express', cat: 'TV Show', rate: '8.5' },
    { id: '789', title: 'Ocean Waves', cat: 'Movie', rate: '8.3' },
    { id: '101', title: 'City Lights', cat: 'TV Show', rate: '8.1' },
    { id: '112', title: 'Space Odyssey', cat: 'Movie', rate: '7.9' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#e50914" />
        </Pressable>
        <Text style={styles.headerTitle}>Recent Views</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your Recent Views</Text>
        <Text style={styles.sectionSubtitle}>All the content you've watched recently</Text>
        
        <View style={styles.tableHead}>
          <Text style={[styles.th, { flex: 0.6 }]}>ID</Text>
          <Text style={[styles.th, { flex: 3 }]}>TITLE</Text>
          <Text style={[styles.th, { flex: 2 }]}>CATEGORY</Text>
          <Text style={[styles.th, { flex: 1 }]}>RATING</Text>
        </View>
        
        {recentViews.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 0.6 }]}>{item.id}</Text>
            <Text style={[styles.td, { flex: 3 }]}>{item.title}</Text>
            <Text style={[styles.td, { flex: 2 }]}>{item.cat}</Text>
            <Text style={[styles.td, { flex: 1, color: '#ffd166', fontWeight: '700' }]}>{item.rate}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2b2b31' },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { width: 36, height: 36, borderWidth: 2, borderColor: '#e50914', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  placeholder: { width: 36 },

  // Content
  content: { padding: 16 },
  sectionTitle: { color: '#fff', fontSize: 24, fontWeight: '300', marginBottom: 8 },
  sectionSubtitle: { color: '#c7c7c7', fontSize: 14, marginBottom: 20 },

  // Table
  tableHead: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  th: { color: '#8e8e93', fontWeight: '700' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  td: { color: '#c7c7cc' },
});
