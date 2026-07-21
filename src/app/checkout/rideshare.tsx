import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function RideshareBookingScreen() {
  const router = useRouter();

  const handleBookCab = (provider: string, fare: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`🚗 ${provider} Cab booked to Event Venue! Estimated Fare: ${fare}`);
    } else {
      Alert.alert('Cab Booked', `${provider} ride confirmed to venue! Fare: ${fare}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Venue Rideshare & Cab Partner</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DESTINATION VENUE</Text>
          <Text style={styles.venueName}>Lakefront Promenade Arena, Bangalore</Text>
          <Text style={styles.etaText}>Estimated Transit Time: 22 mins from Current Location</Text>
        </View>

        <Text style={styles.sectionHeader}>Available Rideshare Options</Text>
        <View style={styles.ridesList}>
          {[
            { name: 'Uber Go Sedan', eta: '4 mins away', fare: '₹280', desc: 'Affordable compact sedan for 4 passengers' },
            { name: 'Uber XL Premier SUV', eta: '6 mins away', fare: '₹450', desc: 'Spacious 6-seater SUV for festival groups' },
            { name: 'Ola Cab Mini', eta: '3 mins away', fare: '₹260', desc: 'Fast city pickup' },
          ].map((r, idx) => (
            <View key={idx} style={styles.rideRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rideName}>{r.name}</Text>
                <Text style={styles.rideDesc}>{r.desc}</Text>
                <Text style={styles.rideEta}>{r.eta}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={styles.rideFare}>{r.fare}</Text>
                <TouchableOpacity style={styles.bookBtn} onPress={() => handleBookCab(r.name, r.fare)}>
                  <Text style={styles.bookBtnText}>Book Ride</Text>
                </TouchableOpacity>
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
  card: { padding: 16, backgroundColor: '#1C2541', borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#38BDF8' },
  cardTitle: { fontSize: 10, fontFamily: Theme.fonts.bold, color: '#38BDF8', letterSpacing: 1 },
  venueName: { fontSize: 16, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginTop: 4 },
  etaText: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  sectionHeader: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginBottom: 12 },
  ridesList: { gap: 12 },
  rideRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#1C2541', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rideName: { fontSize: 15, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  rideDesc: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  rideEta: { fontSize: 10, color: '#10B981', marginTop: 4, fontFamily: Theme.fonts.medium },
  rideFare: { fontSize: 16, fontFamily: Theme.fonts.bold, color: '#6FFFE9' },
  bookBtn: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#2563EB', borderRadius: 8 },
  bookBtnText: { fontSize: 12, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
});
