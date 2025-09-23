import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LatestReviewsScreen() {
  const latestReviews = [
    { id: '126', item: 'I Dream in Another Language', author: 'Jackson Brown', rate: '7.2' },
    { id: '125', item: 'Benched', author: 'Quang', rate: '6.3' },
    { id: '124', item: 'Whitney', author: 'Brian Cranston', rate: '8.4' },
    { id: '123', item: 'Blindspotting', author: 'Ketut', rate: '9.0' },
    { id: '122', item: 'I Dream in Another Language', author: 'Eliza Josceline', rate: '7.7' },
    { id: '121', item: 'The Lost City', author: 'Sarah Wilson', rate: '8.1' },
    { id: '120', item: 'Undercurrents', author: 'Mike Johnson', rate: '7.5' },
    { id: '119', item: 'Redemption Road', author: 'Emma Davis', rate: '8.8' },
    { id: '118', item: 'Tales from the Underworld', author: 'Alex Chen', rate: '7.9' },
    { id: '117', item: 'Voices from the Other Side', author: 'Lisa Park', rate: '8.2' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#e50914" />
        </Pressable>
        <Text style={styles.headerTitle}>Latest Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your Latest Reviews</Text>
        <Text style={styles.sectionSubtitle}>All the reviews you've written recently</Text>
        
        <View style={styles.tableHead}>
          <Text style={[styles.th, { flex: 0.8 }]}>ID</Text>
          <Text style={[styles.th, { flex: 3 }]}>ITEM</Text>
          <Text style={[styles.th, { flex: 2 }]}>AUTHOR</Text>
          <Text style={[styles.th, { flex: 1 }]}>RATING</Text>
        </View>
        
        {latestReviews.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 0.8 }]}>{item.id}</Text>
            <Text style={[styles.td, { flex: 3 }]}>{item.item}</Text>
            <Text style={[styles.td, { flex: 2 }]}>{item.author}</Text>
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
