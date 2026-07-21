import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function EcoTrackerScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Carbon Offset & Eco Tracker</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <AppIcon name="leaf.fill" size={48} tintColor="#10B981" />
          <Text style={styles.title}>100% Certified Green Event 🌱</Text>
          <Text style={styles.sub}>Solar Powered Stage Lighting & Zero Single-Use Plastics</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.mVal}>-4.2 Tons</Text>
            <Text style={styles.mLabel}>CO2 Offset Saved</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.mVal}>1,500 Trees</Text>
            <Text style={styles.mLabel}>Planted by Attendees</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.plantBtn}
          onPress={() => Alert.alert('Tree Planted', '₹50 Carbon Offset added! A tree will be planted in your name!')}
        >
          <Text style={styles.plantBtnText}>Plant a Tree for ₹50 with your Ticket</Text>
        </TouchableOpacity>
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
  card: { backgroundColor: '#1C2541', padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#10B981' },
  title: { fontSize: 18, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginTop: 12 },
  sub: { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center' },
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  metricBox: { flex: 1, backgroundColor: '#1C2541', padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  mVal: { fontSize: 18, fontFamily: Theme.fonts.bold, color: '#6FFFE9' },
  mLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  plantBtn: { height: 50, backgroundColor: '#10B981', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  plantBtnText: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
});
