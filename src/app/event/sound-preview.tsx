import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function SoundPreviewScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>3D Acoustic & Surround Equalizer</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>SURROUND SOUND EXPERIENCE PREVIEW</Text>
          <Text style={styles.title}>Dolby Atmos 7.1 Stage Acoustic Simulation</Text>
          <View style={styles.eqBarRow}>
            {[80, 45, 95, 60, 100, 75, 50, 90, 65].map((h, idx) => (
              <View key={idx} style={[styles.eqBar, { height: h }]} />
            ))}
          </View>
        </View>

        <Text style={styles.sectionHeader}>Acoustic Zones</Text>
        <View style={styles.list}>
          {[
            { zone: 'Front Stage Bass Pit', dB: '115 dB (High Energy)', desc: 'Subwoofer sub-bass focus for EDM & Metal' },
            { zone: 'VIP Lounge Acoustic Tier', dB: '95 dB (Crystal Clear)', desc: 'Balanced hi-fi surround sound with zero distortion' },
            { zone: 'General Stand Rear', dB: '90 dB (Comfortable)', desc: 'Clear vocals and ambient crowd sound balance' },
          ].map((z, idx) => (
            <View key={idx} style={styles.zoneCard}>
              <Text style={styles.zName}>{z.zone}</Text>
              <Text style={styles.zDb}>{z.dB}</Text>
              <Text style={styles.zDesc}>{z.desc}</Text>
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
  card: { backgroundColor: '#1C2541', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#7C3AED' },
  label: { fontSize: 10, fontFamily: Theme.fonts.bold, color: '#7C3AED', letterSpacing: 1 },
  title: { fontSize: 16, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginVertical: 8, textAlign: 'center' },
  eqBarRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 110, marginTop: 12 },
  eqBar: { width: 14, backgroundColor: '#6FFFE9', borderRadius: 4 },
  sectionHeader: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginBottom: 12 },
  list: { gap: 12 },
  zoneCard: { backgroundColor: '#1C2541', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  zName: { fontSize: 15, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  zDb: { fontSize: 12, color: '#7C3AED', marginTop: 2, fontFamily: Theme.fonts.bold },
  zDesc: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
});
