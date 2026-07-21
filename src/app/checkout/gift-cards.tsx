import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function GiftCardsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Event Gift Cards</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subTitle}>Gift an Unforgettable Concert & Festival Experience 🎁</Text>

        <View style={styles.grid}>
          {[
            { amount: '₹1,000', title: 'Bronze Pass Voucher' },
            { amount: '₹2,500', title: 'Silver Pass Voucher' },
            { amount: '₹5,000', title: 'Gold VIP Pass Voucher' },
          ].map((g, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.cardAmt}>{g.amount}</Text>
              <Text style={styles.cardTitle}>{g.title}</Text>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => router.push({ pathname: '/checkout/razorpay', params: { eventTitle: `Gift Card ${g.amount}`, price: g.amount.replace(/[^0-9]/g, ''), quantity: '1' } } as any)}
              >
                <Text style={styles.btnText}>Send Gift Card via Razorpay</Text>
              </TouchableOpacity>
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
  grid: { gap: 16 },
  card: { backgroundColor: '#1C2541', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#38BDF8' },
  cardAmt: { fontSize: 32, fontFamily: Theme.fonts.bold, color: '#6FFFE9' },
  cardTitle: { fontSize: 14, color: '#FFFFFF', marginVertical: 8, fontFamily: Theme.fonts.bold },
  btn: { width: '100%', height: 44, backgroundColor: '#2563EB', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnText: { fontSize: 13, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
});
