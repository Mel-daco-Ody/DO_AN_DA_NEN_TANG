import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutUsScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#e50914" />
        </Pressable>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Welcome to FlixGo</Text>
        <Text style={styles.sectionSubtitle}>Your Ultimate Entertainment Destination</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Our Story</Text>
          <Text style={styles.paragraph}>
            FlixGo was founded in 2020 with a simple mission: to bring the best movies and TV shows 
            to audiences worldwide. We believe that entertainment should be accessible, affordable, 
            and of the highest quality.
          </Text>
          <Text style={styles.paragraph}>
            Starting as a small streaming service, we've grown into a global platform serving 
            millions of users across 50+ countries. Our curated library features thousands of 
            movies and TV series, from blockbuster hits to indie gems.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Our Mission</Text>
          <Text style={styles.paragraph}>
            To provide exceptional entertainment experiences through cutting-edge technology, 
            personalized recommendations, and a commitment to quality content that brings 
            people together.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>What We Offer</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="play-circle" size={20} color="#e50914" />
              <Text style={styles.featureText}>Unlimited streaming of movies and TV shows</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="phone-portrait" size={20} color="#e50914" />
              <Text style={styles.featureText}>Watch on any device, anywhere</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star" size={20} color="#e50914" />
              <Text style={styles.featureText}>Personalized recommendations</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="download" size={20} color="#e50914" />
              <Text style={styles.featureText}>Offline viewing capabilities</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color="#e50914" />
              <Text style={styles.featureText}>Multiple user profiles</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Our Team</Text>
          <Text style={styles.paragraph}>
            FlixGo is powered by a passionate team of engineers, designers, content curators, 
            and entertainment enthusiasts. We're constantly working to improve your viewing 
            experience and bring you the latest and greatest in entertainment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Contact Information</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#e50914" />
              <Text style={styles.contactText}>support@flixgo.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color="#e50914" />
              <Text style={styles.contactText}>+1 (555) 123-4567</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={16} color="#e50914" />
              <Text style={styles.contactText}>123 Entertainment St, Hollywood, CA 90210</Text>
            </View>
          </View>
        </View>
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
  sectionTitle: { color: '#fff', fontSize: 28, fontWeight: '300', marginBottom: 8, textAlign: 'center' },
  sectionSubtitle: { color: '#c7c7c7', fontSize: 16, marginBottom: 24, textAlign: 'center' },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 12 },
  paragraph: { color: '#c7c7c7', fontSize: 14, lineHeight: 22, marginBottom: 12 },

  // Features
  featureList: { marginTop: 8 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { color: '#c7c7c7', fontSize: 14, marginLeft: 12, flex: 1 },

  // Contact
  contactInfo: { marginTop: 8 },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  contactText: { color: '#c7c7c7', fontSize: 14, marginLeft: 12 },
});
