import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function WeatherRadarScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Real-Time Venue Weather Radar</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Temp Card */}
        <View style={styles.mainCard}>
          <AppIcon name="sun.max.fill" size={56} tintColor="#F59E0B" />
          <Text style={styles.tempText}>28°C</Text>
          <Text style={styles.conditionText}>Clear Skies & Pleasant Breeze</Text>
          <Text style={styles.venueText}>Lakefront Promenade Arena • Bangalore</Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.grid}>
          <View style={styles.gridBox}>
            <Text style={styles.gLabel}>RAIN PROBABILITY</Text>
            <Text style={styles.gVal}>5% Low</Text>
          </View>
          <View style={styles.gridBox}>
            <Text style={styles.gLabel}>HUMIDITY</Text>
            <Text style={styles.gVal}>54%</Text>
          </View>
          <View style={styles.gridBox}>
            <Text style={styles.gLabel}>WIND SPEED</Text>
            <Text style={styles.gVal}>12 km/h</Text>
          </View>
          <View style={styles.gridBox}>
            <Text style={styles.gLabel}>UV INDEX</Text>
            <Text style={styles.gVal}>Moderate (4)</Text>
          </View>
        </View>

        {/* Attire recommendation */}
        <View style={styles.tipCard}>
          <Text style={styles.tipHeader}>💡 Recommended Event Attire</Text>
          <Text style={styles.tipText}>Ideal weather for light breathable festival clothing, sunglasses, and comfortable footwear for outdoor concert dancing!</Text>
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
  mainCard: { backgroundColor: '#1C2541', padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F59E0B' },
  tempText: { fontSize: 44, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginTop: 8 },
  conditionText: { fontSize: 16, color: '#F59E0B', fontFamily: Theme.fonts.bold, marginTop: 2 },
  venueText: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  gridBox: { width: '48%', backgroundColor: '#1C2541', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  gLabel: { fontSize: 10, fontFamily: Theme.fonts.bold, color: '#94A3B8', letterSpacing: 0.5 },
  gVal: { fontSize: 16, fontFamily: Theme.fonts.bold, color: '#6FFFE9', marginTop: 4 },
  tipCard: { backgroundColor: '#1C2541', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#10B981' },
  tipHeader: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#10B981', marginBottom: 6 },
  tipText: { fontSize: 12, color: '#CBD5E1', lineHeight: 18 },
});
