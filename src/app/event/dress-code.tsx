import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function DressCodeGuideScreen() {
  const router = useRouter();

  const stylesList = [
    { title: 'EDM & Cyber Neon Glow', desc: 'UV reflective neon jackets, LED wristbands, comfortable sneakers.', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600' },
    { title: 'Boho Chic Festival Fashion', desc: 'Fringe leather jackets, denim shorts, bohemian hats & boots.', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=600' },
    { title: 'Black Tie VIP Lounge', desc: 'Formal evening blazers, cocktail dresses, sleek footwear.', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Dress Code & Style Guide</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subTitle}>Recommended Style & Outfit Inspiration 👗✨</Text>

        <View style={styles.list}>
          {stylesList.map((s, idx) => (
            <View key={idx} style={styles.card}>
              <Image source={{ uri: s.img }} style={styles.img} contentFit="cover" />
              <View style={styles.info}>
                <Text style={styles.title}>{s.title}</Text>
                <Text style={styles.desc}>{s.desc}</Text>
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
  subTitle: { fontSize: 13, color: '#94A3B8', marginBottom: 16 },
  list: { gap: 16 },
  card: { backgroundColor: '#1C2541', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  img: { width: '100%', height: 160 },
  info: { padding: 14 },
  title: { fontSize: 16, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  desc: { fontSize: 12, color: '#CBD5E1', marginTop: 4, lineHeight: 18 },
});
