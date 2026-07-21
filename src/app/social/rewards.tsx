import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function RewardsHubScreen() {
  const router = useRouter();

  const handleRedeem = (points: number) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`🎉 Redeemed ${points} XP Points for ₹${points / 2} Ticket Voucher!`);
    } else {
      Alert.alert('Reward Redeemed', `You redeemed ${points} XP for a discount code!`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards & XP Badges Hub</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* XP Balance Card */}
        <GlassView style={styles.xpCard} intensity="high">
          <Text style={styles.xpLabel}>YOUR EVENT SPHERE REWARDS BALANCE</Text>
          <Text style={styles.xpVal}>1,250 XP</Text>
          <Text style={styles.xpSub}>Level 4 VIP Explorer • Next Tier at 1,500 XP</Text>
        </GlassView>

        {/* Badges Grid */}
        <Text style={styles.sectionHeader}>Unlocked Badges</Text>
        <View style={styles.badgeGrid}>
          {[
            { icon: 'crown.fill', title: 'VIP Pioneer', desc: 'Booked 5+ VIP passes' },
            { icon: 'star.fill', title: 'Music Fanatic', desc: 'Attended 10 music concerts' },
            { icon: 'flame.fill', title: 'Early Bird Master', desc: 'Bought passes 30 days ahead' },
            { icon: 'sparkles', title: 'Community Hero', desc: 'Left 15 event reviews' },
          ].map((b, idx) => (
            <View key={idx} style={styles.badgeBox}>
              <AppIcon name={b.icon} size={28} tintColor="#F59E0B" />
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.desc}</Text>
            </View>
          ))}
        </View>

        {/* Redeem Offers */}
        <Text style={styles.sectionHeader}>Redeem Rewards for Ticket Discounts</Text>
        <View style={styles.offersList}>
          {[
            { xp: 500, discount: '₹250 OFF', code: 'SPHERE500' },
            { xp: 1000, discount: '₹500 OFF', code: 'SPHERE1000' },
            { xp: 2000, discount: '₹1,200 OFF VIP', code: 'SPHEREVIP' },
          ].map((o, idx) => (
            <View key={idx} style={styles.offerRow}>
              <View>
                <Text style={styles.offerDisc}>{o.discount} Pass Voucher</Text>
                <Text style={styles.offerCode}>Cost: {o.xp} XP Points</Text>
              </View>
              <TouchableOpacity style={styles.redeemBtn} onPress={() => handleRedeem(o.xp)}>
                <Text style={styles.redeemBtnText}>Redeem</Text>
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
  xpCard: { padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 24, backgroundColor: '#1C2541' },
  xpLabel: { fontSize: 10, fontFamily: Theme.fonts.bold, color: '#94A3B8', letterSpacing: 1 },
  xpVal: { fontSize: 32, fontFamily: Theme.fonts.bold, color: '#6FFFE9', marginVertical: 4 },
  xpSub: { fontSize: 12, color: '#CBD5E1' },
  sectionHeader: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginBottom: 12 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  badgeBox: { width: '48%', backgroundColor: '#1C2541', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  badgeTitle: { fontSize: 13, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginTop: 8 },
  badgeDesc: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: 2 },
  offersList: { gap: 12 },
  offerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1C2541', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  offerDisc: { fontSize: 15, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  offerCode: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  redeemBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#2563EB', borderRadius: 8 },
  redeemBtnText: { fontSize: 12, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
});
