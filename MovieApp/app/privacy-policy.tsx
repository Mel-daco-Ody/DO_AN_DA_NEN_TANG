import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#e50914" />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: December 25, 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            FlixGo ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our 
            streaming service and mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>2. Information We Collect</Text>
          <Text style={styles.subsectionTitle}>Personal Information:</Text>
          <Text style={styles.paragraph}>
            • Name and email address{'\n'}
            • Payment information (processed securely by third-party providers){'\n'}
            • Profile information and preferences{'\n'}
            • Device information and usage data
          </Text>
          
          <Text style={styles.subsectionTitle}>Usage Information:</Text>
          <Text style={styles.paragraph}>
            • Content you watch, search for, and rate{'\n'}
            • Viewing history and watchlists{'\n'}
            • Device type, operating system, and browser information{'\n'}
            • IP address and location data
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use your information to:{'\n'}
            • Provide and improve our streaming service{'\n'}
            • Personalize content recommendations{'\n'}
            • Process payments and manage subscriptions{'\n'}
            • Communicate with you about your account{'\n'}
            • Analyze usage patterns to enhance user experience{'\n'}
            • Comply with legal obligations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>4. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your information with:{'\n'}
            • Service providers who assist in our operations{'\n'}
            • Legal authorities when required by law{'\n'}
            • Business partners with your explicit consent{'\n'}
            • In connection with a business transfer or merger
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your information, including:{'\n'}
            • Encryption of data in transit and at rest{'\n'}
            • Regular security audits and updates{'\n'}
            • Access controls and authentication{'\n'}
            • Secure payment processing
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:{'\n'}
            • Access and update your personal information{'\n'}
            • Delete your account and associated data{'\n'}
            • Opt-out of marketing communications{'\n'}
            • Request a copy of your data{'\n'}
            • Withdraw consent for data processing
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>7. Cookies and Tracking</Text>
          <Text style={styles.paragraph}>
            We use cookies and similar technologies to:{'\n'}
            • Remember your preferences and settings{'\n'}
            • Analyze website traffic and usage{'\n'}
            • Provide personalized content{'\n'}
            • Improve our service functionality
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our service is not intended for children under 13. We do not knowingly collect 
            personal information from children under 13. If we become aware of such collection, 
            we will take steps to delete the information promptly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>9. International Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your 
            own. We ensure appropriate safeguards are in place to protect your information 
            in accordance with this Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>10. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any 
            material changes by posting the new policy on our website and updating the 
            "Last updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us at:{'\n'}
            Email: privacy@flixgo.com{'\n'}
            Phone: +1 (555) 123-4567{'\n'}
            Address: 123 Entertainment St, Hollywood, CA 90210
          </Text>
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
  lastUpdated: { color: '#8e8e93', fontSize: 12, marginBottom: 24, textAlign: 'center' },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  subsectionTitle: { color: '#e50914', fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  paragraph: { color: '#c7c7c7', fontSize: 14, lineHeight: 22 },
});
