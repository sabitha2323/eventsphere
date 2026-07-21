import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function GroupDiscountScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Discount & Bulk Saver</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subTitle}>Save Big when Booking Passes with Friends 👥</Text>

        <View style={styles.list}>
          {[
            { group: 'Squad Pass (4 Tickets)', disc: 'Save 15% Instant Discount', total: '₹5,100', original: '₹6,000', qty: '4' },
            { group: 'Mega Group (10 Tickets)', disc: 'Save 25% Mega Discount', total: '₹11,250', original: '₹15,000', qty: '10' },
          ].map((g, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.groupName}>{g.group}</Text>
              <Text style={styles.discText}>{g.disc}</Text>
              <View style={styles.row}>
                <Text style={styles.price}>{g.total} <Text style={styles.orig}>{g.original}</Text></Text>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => router.push({ pathname: '/checkout/razorpay', params: { eventTitle: g.group, price: '1275', quantity: g.qty } } as any)}
                >
                  <Text style={styles.btnText}>Book Group Pass</Text>
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
  list: { gap: 16 },
  card: { backgroundColor: '#1C2541', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#10B981' },
  groupName: { fontSize: 16, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  discText: { fontSize: 12, color: '#10B981', marginVertical: 4, fontFamily: Theme.fonts.bold },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  price: { fontSize: 18, fontFamily: Theme.fonts.bold, color: '#6FFFE9' },
  orig: { fontSize: 13, color: '#94A3B8', textDecorationLine: 'line-through' },
  btn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#2563EB', borderRadius: 8 },
  btnText: { fontSize: 12, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
});
