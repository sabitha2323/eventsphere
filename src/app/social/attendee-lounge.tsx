import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function AttendeeLoungeScreen() {
  const router = useRouter();

  const attendees = [
    { name: 'Sabitha Sutharsen', role: 'UX Designer & Music Lover', seat: 'VIP Lounge A12', handle: '@sabitha_design' },
    { name: 'Vikram Mehta', role: 'Fintech Founder & Tech Speaker', seat: 'VIP Lounge B04', handle: '@vikram_tech' },
    { name: 'Priya Sharma', role: 'Creative Director', seat: 'Gold Circle C19', handle: '@priya_art' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendee Networking Lounge</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subTitle}>Connect & Network with Fellow Confirmed VIP Attendees 🤝</Text>

        <View style={styles.list}>
          {attendees.map((a, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Text style={styles.name}>{a.name}</Text>
                  <Text style={styles.role}>{a.role}</Text>
                  <Text style={styles.seat}>Assigned: {a.seat}</Text>
                </View>
                <TouchableOpacity style={styles.btn} onPress={() => Alert.alert('Connection Sent', `Connect request sent to ${a.name} (${a.handle})!`)}>
                  <Text style={styles.btnText}>Connect</Text>
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
  subTitle: { fontSize: 13, color: '#94A3B8', marginBottom: 16 },
  list: { gap: 12 },
  card: { backgroundColor: '#1C2541', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  role: { fontSize: 12, color: '#38BDF8', marginTop: 2 },
  seat: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  btn: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#7C3AED', borderRadius: 8 },
  btnText: { fontSize: 12, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
});
