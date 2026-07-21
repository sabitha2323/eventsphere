import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function SOSSafetyScreen() {
  const router = useRouter();

  const handleSOS = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert('🚨 SOS Alert Sent to Venue Security & Medical Team! Dispatching assistance to your location.');
    } else {
      Alert.alert('🚨 SOS DISPATCHED', 'Venue security & medical team notified!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS Emergency & Safety Desk</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Big SOS Button */}
        <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
          <AppIcon name="exclamationmark.shield.fill" size={48} tintColor="#FFFFFF" />
          <Text style={styles.sosText}>1-CLICK EMERGENCY SOS</Text>
          <Text style={styles.sosSub}>Alerts Venue Medical & Security Station Immediately</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>On-Site Safety Services</Text>
        <View style={styles.list}>
          {[
            { title: 'First Aid & Paramedic Tent', loc: 'Gate 2 & VIP Entrance', phone: '+91 98765 43210' },
            { title: 'Lost & Found Desk', loc: 'Central Information Pavilion', phone: '+91 98765 43211' },
            { title: 'Security Command Center', loc: 'Main Gate Control Tower', phone: '+91 98765 43212' },
          ].map((s, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.loc}>Location: {s.loc}</Text>
              <Text style={styles.phone}>Direct Hotline: {s.phone}</Text>
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
  sosBtn: { backgroundColor: '#EF4444', padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 24, shadowColor: '#EF4444', shadowRadius: 20, shadowOpacity: 0.5 },
  sosText: { fontSize: 18, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginTop: 12 },
  sosSub: { fontSize: 11, color: '#FEE2E2', marginTop: 4, textAlign: 'center' },
  sectionHeader: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginBottom: 12 },
  list: { gap: 12 },
  card: { backgroundColor: '#1C2541', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  title: { fontSize: 15, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  loc: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  phone: { fontSize: 12, color: '#10B981', marginTop: 2, fontFamily: Theme.fonts.bold },
});
