import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ContactsScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !subject || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    Alert.alert(
      'Message Sent',
      'Thank you for contacting us! We\'ll get back to you within 24 hours.',
      [{ text: 'OK', onPress: () => {
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }}]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#e50914" />
        </Pressable>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        <Text style={styles.sectionSubtitle}>We'd love to hear from you</Text>

        {/* Contact Information */}
        <View style={styles.contactInfo}>
          <View style={styles.contactCard}>
            <Ionicons name="mail" size={24} color="#e50914" />
            <Text style={styles.contactTitle}>Email</Text>
            <Text style={styles.contactText}>support@flixgo.com</Text>
            <Text style={styles.contactSubtext}>We'll respond within 24 hours</Text>
          </View>

          <View style={styles.contactCard}>
            <Ionicons name="call" size={24} color="#e50914" />
            <Text style={styles.contactTitle}>Phone</Text>
            <Text style={styles.contactText}>+1 (555) 123-4567</Text>
            <Text style={styles.contactSubtext}>Mon-Fri 9AM-6PM PST</Text>
          </View>

          <View style={styles.contactCard}>
            <Ionicons name="location" size={24} color="#e50914" />
            <Text style={styles.contactTitle}>Address</Text>
            <Text style={styles.contactText}>123 Entertainment St</Text>
            <Text style={styles.contactSubtext}>Hollywood, CA 90210</Text>
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Send us a Message</Text>
          
          <TextInput
            placeholder="Your Name"
            placeholderTextColor="#8e8e93"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#8e8e93"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          
          <TextInput
            placeholder="Subject"
            placeholderTextColor="#8e8e93"
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
          />
          
          <TextInput
            placeholder="Your Message"
            placeholderTextColor="#8e8e93"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={[styles.input, styles.textArea]}
          />
          
          <Pressable style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.9 }]} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Send Message</Text>
          </Pressable>
        </View>

        {/* Social Media */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialLinks}>
            <Pressable style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.8 }]}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              <Text style={styles.socialText}>Facebook</Text>
            </Pressable>
            
            <Pressable style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.8 }]}>
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              <Text style={styles.socialText}>Twitter</Text>
            </Pressable>
            
            <Pressable style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.8 }]}>
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              <Text style={styles.socialText}>Instagram</Text>
            </Pressable>
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

  // Contact Info
  contactInfo: { marginBottom: 24 },
  contactCard: { backgroundColor: '#121219', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16 },
  contactTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  contactText: { color: '#e50914', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  contactSubtext: { color: '#c7c7c7', fontSize: 14, textAlign: 'center' },

  // Form
  formSection: { marginBottom: 24 },
  formTitle: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 16 },
  input: { backgroundColor: '#14141b', borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: '#e50914' },
  textArea: { height: 120, paddingTop: 12 },
  submitBtn: { backgroundColor: '#e50914', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Social
  socialSection: { alignItems: 'center' },
  socialTitle: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 16 },
  socialLinks: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  socialBtn: { alignItems: 'center', padding: 16 },
  socialText: { color: '#c7c7c7', fontSize: 14, marginTop: 8 },
});
