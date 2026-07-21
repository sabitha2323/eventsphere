import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function HotelFinderScreen() {
  const router = useRouter();

  const hotels = [
    { name: 'The Grand Hyatt Lakefront', dist: '0.8 km from venue', price: '₹4,500/night', rating: '4.9 ★', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600' },
    { name: 'Marriott Executive Suites', dist: '1.2 km from venue', price: '₹3,800/night', rating: '4.8 ★', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600' },
    { name: 'Boutique Festival Inn', dist: '1.5 km from venue', price: '₹2,200/night', rating: '4.6 ★', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Hotels & Stays</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subTitle}>Verified Partner Stays Near Festival Venue</Text>

        <View style={styles.list}>
          {hotels.map((h, idx) => (
            <View key={idx} style={styles.card}>
              <Image source={{ uri: h.img }} style={styles.img} contentFit="cover" />
              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={styles.name}>{h.name}</Text>
                  <Text style={styles.rating}>{h.rating}</Text>
                </View>
                <Text style={styles.dist}>{h.dist}</Text>
                <View style={styles.rowBottom}>
                  <Text style={styles.price}>{h.price}</Text>
                  <TouchableOpacity style={styles.btn} onPress={() => Alert.alert('Stay Reserved', `${h.name} reserved with festival discount rate!`)}>
                    <Text style={styles.btnText}>Reserve Room</Text>
                  </TouchableOpacity>
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
  subTitle: { fontSize: 13, color: '#94A3B8', marginBottom: 16 },
  list: { gap: 16 },
  card: { backgroundColor: '#1C2541', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  img: { width: '100%', height: 160 },
  info: { padding: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  rating: { fontSize: 13, color: '#F59E0B', fontFamily: Theme.fonts.bold },
  dist: { fontSize: 11, color: '#94A3B8', marginVertical: 4 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 16, fontFamily: Theme.fonts.bold, color: '#6FFFE9' },
  btn: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#2563EB', borderRadius: 8 },
  btnText: { fontSize: 12, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
});
