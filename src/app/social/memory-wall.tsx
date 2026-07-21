import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function MemoryWallScreen() {
  const router = useRouter();

  const photos = [
    { id: '1', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600', author: 'Sabitha', likes: 142, tag: 'Neon Beats Fest' },
    { id: '2', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600', author: 'Rahul M.', likes: 98, tag: 'DJ Main Stage' },
    { id: '3', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=600', author: 'Ananya S.', likes: 215, tag: 'Laser Show' },
    { id: '4', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600', author: 'Karthik', likes: 76, tag: 'VIP Lounge' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Event Memory Wall</Text>
        <TouchableOpacity onPress={() => Alert.alert('Upload Photo', 'Select a photo from your gallery to share on the Memory Wall!')}>
          <AppIcon name="plus" size={20} tintColor="#38BDF8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subTitle}>Shared Moments from Live Attendees 📸</Text>

        <View style={styles.photoGrid}>
          {photos.map((p) => (
            <View key={p.id} style={styles.photoCard}>
              <Image source={{ uri: p.url }} style={styles.photoImg} contentFit="cover" />
              <View style={styles.photoInfo}>
                <Text style={styles.authorText}>Uploaded by {p.author}</Text>
                <View style={styles.likesRow}>
                  <AppIcon name="heart.fill" size={14} tintColor="#EC4899" />
                  <Text style={styles.likesText}>{p.likes} likes</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B132B' },
  header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 30, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  subTitle: { fontSize: 14, color: '#94A3B8', marginBottom: 16 },
  photoGrid: { gap: 16 },
  photoCard: { backgroundColor: '#1C2541', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  photoImg: { width: '100%', height: 220 },
  photoInfo: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorText: { fontSize: 12, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  likesRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likesText: { fontSize: 12, color: '#EC4899', fontFamily: Theme.fonts.medium },
});
