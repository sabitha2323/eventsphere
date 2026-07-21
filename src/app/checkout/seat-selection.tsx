import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

interface SeatTier {
  id: string;
  name: string;
  price: number;
  perks: string;
  badgeColor: string;
  available: number;
}

export default function StageSeatPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const eventTitle = (params.eventTitle as string) || 'Neon Beats Music Festival';

  const tiers: SeatTier[] = [
    { id: 'vip', name: 'Front Stage VIP Lounge', price: 5000, perks: 'Free Cocktails & Priority Meet & Greet', badgeColor: '#F59E0B', available: 14 },
    { id: 'gold', name: 'Golden Circle Stand', price: 3500, perks: 'Closest Center Stage Standing View', badgeColor: '#38BDF8', available: 32 },
    { id: 'exec', name: 'Executive Terrace Seating', price: 2500, perks: 'Elevated Covered Seating & Lounge Access', badgeColor: '#8B5CF6', available: 65 },
    { id: 'gen', name: 'General Arena Entry', price: 1500, perks: 'Standard Festival Arena Access', badgeColor: '#10B981', available: 120 },
  ];

  const [selectedTier, setSelectedTier] = useState<SeatTier>(tiers[0]);
  const [selectedSeatNo, setSelectedSeatNo] = useState('A-07');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interactive Stage Seat Picker</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stage Graphic Header */}
        <View style={styles.stageBox}>
          <View style={styles.stageArch}>
            <Text style={styles.stageText}>🎤 MAIN PERFORMANCE STAGE 🎸</Text>
          </View>
        </View>

        {/* Visual Seat Grid */}
        <View style={styles.gridCard}>
          <Text style={styles.gridTitle}>Stage Seat Map (Section A)</Text>
          <View style={styles.seatsRow}>
            {['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'A-06', 'A-07', 'A-08'].map((seatId) => (
              <TouchableOpacity
                key={seatId}
                style={[
                  styles.seatBtn,
                  selectedSeatNo === seatId && { backgroundColor: selectedTier.badgeColor, borderColor: '#FFFFFF' }
                ]}
                onPress={() => setSelectedSeatNo(seatId)}
              >
                <Text style={styles.seatText}>{seatId}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tier Selector List */}
        <Text style={styles.sectionHeader}>Select Tier Category</Text>

        <View style={styles.tierList}>
          {tiers.map((t) => {
            const isSelected = selectedTier.id === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.tierCard, isSelected && { borderColor: t.badgeColor, borderWidth: 2 }]}
                onPress={() => setSelectedTier(t)}
              >
                <GlassView style={styles.tierInner} intensity="high">
                  <View style={styles.tierHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.colorDot, { backgroundColor: t.badgeColor }]} />
                      <Text style={styles.tierName}>{t.name}</Text>
                    </View>
                    <Text style={styles.tierPrice}>₹{t.price}</Text>
                  </View>
                  <Text style={styles.tierPerks}>{t.perks}</Text>
                  <Text style={styles.tierAvail}>{t.available} seats left in this tier</Text>
                </GlassView>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Proceed to Razorpay Payment */}
        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={() => router.push({
            pathname: '/checkout/razorpay',
            params: {
              eventTitle,
              price: selectedTier.price.toString(),
              quantity: '1',
            }
          } as any)}
        >
          <Text style={styles.proceedBtnText}>Confirm Seat {selectedSeatNo} • Pay ₹{selectedTier.price} via Razorpay</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
    ...Platform.select({
      web: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderLeftWidth: 1,
        borderRightWidth: 1,
      } as any,
    }),
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  stageBox: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  stageArch: {
    width: '100%',
    height: 48,
    backgroundColor: '#1C2541',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A506B',
  },
  stageText: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: '#6FFFE9',
    letterSpacing: 1,
  },
  gridCard: {
    backgroundColor: '#1C2541',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridTitle: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    marginBottom: Theme.spacing.md,
  },
  seatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  seatBtn: {
    width: 60,
    height: 36,
    backgroundColor: '#0B132B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A506B',
  },
  seatText: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    marginBottom: Theme.spacing.sm,
  },
  tierList: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  tierCard: {
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  tierInner: {
    padding: Theme.spacing.md,
    backgroundColor: '#1C2541',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tierName: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  tierPrice: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    color: '#6FFFE9',
  },
  tierPerks: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  tierAvail: {
    fontSize: 10,
    color: '#F59E0B',
    marginTop: 6,
    fontFamily: Theme.fonts.medium,
  },
  proceedBtn: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  proceedBtnText: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
});
