import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpCenterScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "How do I create an account?",
      answer: "To create an account, click on 'Sign Up' on the home screen, enter your email and password, and follow the verification steps. You'll receive a confirmation email to activate your account."
    },
    {
      id: 2,
      question: "How can I change my subscription plan?",
      answer: "Go to your Profile → Subscription tab, select your desired plan, and click the action button. Changes will take effect immediately for upgrades or at the next billing cycle for downgrades."
    },
    {
      id: 3,
      question: "Why is my video buffering?",
      answer: "Buffering can be caused by slow internet connection, device performance, or server issues. Try: 1) Check your internet speed, 2) Close other apps, 3) Restart the app, 4) Try a different video quality setting."
    },
    {
      id: 4,
      question: "Can I download content for offline viewing?",
      answer: "Yes! Premium and Cinematic subscribers can download content for offline viewing. Look for the download icon on movie/TV show pages. Downloads expire after 30 days or when your subscription ends."
    },
    {
      id: 5,
      question: "How do I cancel my subscription?",
      answer: "Go to Profile → Subscription → Current Plan, and click 'Cancel Subscription'. You'll continue to have access until the end of your current billing period."
    },
    {
      id: 6,
      question: "What devices can I use?",
      answer: "FlixGo works on smartphones, tablets, computers, smart TVs, and gaming consoles. You can use up to 4 devices simultaneously with a Premium subscription."
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#e50914" />
        </Pressable>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#8e8e93" style={styles.searchIcon} />
          <TextInput
            placeholder="Search for help..."
            placeholderTextColor="#8e8e93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.sectionSubtitle}>Find answers to common questions</Text>

        {/* FAQ List */}
        {filteredFAQs.map((faq) => (
          <View key={faq.id} style={styles.faqItem}>
            <Pressable
              style={({ pressed }) => [styles.faqQuestion, pressed && { opacity: 0.8 }]}
              onPress={() => toggleFAQ(faq.id)}
            >
              <Text style={styles.faqQuestionText}>{faq.question}</Text>
              <Ionicons
                name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"}
                size={20}
                color="#e50914"
              />
            </Pressable>
            {expandedFAQ === faq.id && (
              <View style={styles.faqAnswer}>
                <Text style={styles.faqAnswerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSubtitle}>Our support team is here to assist you</Text>
          
          <Pressable style={({ pressed }) => [styles.contactBtn, pressed && { opacity: 0.9 }]}>
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.contactBtnText}>Contact Support</Text>
          </Pressable>
          
          <Pressable style={({ pressed }) => [styles.contactBtn, styles.contactBtnSecondary, pressed && { opacity: 0.9 }]}>
            <Ionicons name="call" size={20} color="#e50914" />
            <Text style={[styles.contactBtnText, styles.contactBtnTextSecondary]}>Call Us</Text>
          </Pressable>
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

  // Search
  searchContainer: { padding: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#14141b', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#e50914' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },

  // Content
  content: { padding: 16 },
  sectionTitle: { color: '#fff', fontSize: 24, fontWeight: '300', marginBottom: 8 },
  sectionSubtitle: { color: '#c7c7c7', fontSize: 14, marginBottom: 20 },

  // FAQ
  faqItem: { marginBottom: 12, backgroundColor: '#121219', borderRadius: 12, overflow: 'hidden' },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  faqQuestionText: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, marginRight: 12 },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16 },
  faqAnswerText: { color: '#c7c7c7', fontSize: 14, lineHeight: 20 },

  // Contact
  contactSection: { marginTop: 24, padding: 20, backgroundColor: '#121219', borderRadius: 12, alignItems: 'center' },
  contactTitle: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 8 },
  contactSubtitle: { color: '#c7c7c7', fontSize: 14, marginBottom: 20, textAlign: 'center' },
  contactBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e50914', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginBottom: 12, minWidth: 200 },
  contactBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#e50914' },
  contactBtnText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  contactBtnTextSecondary: { color: '#e50914' },
});
