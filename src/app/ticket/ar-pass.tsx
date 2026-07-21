import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function ARHolographicPassScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const eventTitle = (params.title as string) || 'Neon Beats Music Festival';
  const attendee = (params.attendee as string) || 'Sabitha Sutharsen';
  const seat = (params.seat as string) || 'VIP Lounge Stage-A12';

  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleAppleWallet = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert('📱 Pass exported to Apple Wallet / Google Pay Pass!');
    } else {
      Alert.alert('Wallet Export', 'Pass successfully exported to your mobile wallet!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Ambient Glow Backdrop */}
      <View style={styles.holoGlow1} />
      <View style={styles.holoGlow2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>3D Holographic VIP Pass</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hologram Card Box */}
        <View style={styles.holoCardWrapper}>
          <View style={styles.holoCard}>
            {/* Shimmer Overlay */}
            <View style={styles.shimmerLine} />

            {/* Header Badge */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.vipBadge}>
                <AppIcon name="crown.fill" size={14} tintColor="#F59E0B" />
                <Text style={styles.vipBadgeText}>VIP HOLOGRAM PASS</Text>
              </View>
              <Text style={styles.securityTag}>SECURE QR 2.0</Text>
            </View>

            {/* Event Name */}
            <Text style={styles.eventTitleText}>{eventTitle}</Text>
            <Text style={styles.venueText}>Main Stage Arena • Bangalore</Text>

            {/* Middle Divider with Laser Scanner Line */}
            <View style={styles.scannerWrapper}>
              <View style={styles.laserBeam} />
              <View style={styles.qrBox}>
                <AppIcon name="qrcode" size={100} tintColor="#FFFFFF" />
              </View>
            </View>

            {/* Attendee Details */}
            <View style={styles.cardFooterRow}>
              <View>
                <Text style={styles.detailLabel}>PASS HOLDER</Text>
                <Text style={styles.detailVal}>{attendee}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.detailLabel}>ASSIGNED SEAT</Text>
                <Text style={styles.detailValHighlight}>{seat}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionsPanel}>
          <TouchableOpacity style={styles.walletBtn} onPress={handleAppleWallet}>
            <AppIcon name="creditcard.fill" size={18} tintColor="#FFFFFF" />
            <Text style={styles.walletBtnText}>Add to Apple / Google Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => router.push({
              pathname: '/checkout/razorpay',
              params: { eventTitle, price: '3500', quantity: '1' }
            } as any)}
          >
            <AppIcon name="ticket.fill" size={18} tintColor="#FFFFFF" />
            <Text style={styles.payBtnText}>Buy Additional VIP Pass via Razorpay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B19',
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
  holoGlow1: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined,
  },
  holoGlow2: {
    position: 'absolute',
    bottom: 40,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 194, 255, 0.2)',
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined,
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
    alignItems: 'center',
  },
  holoCardWrapper: {
    width: '100%',
    maxWidth: 360,
    marginVertical: Theme.spacing.lg,
  },
  holoCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: Theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    overflow: 'hidden',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  shimmerLine: {
    position: 'absolute',
    top: -50,
    left: -100,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    transform: [{ rotate: '45deg' }],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  vipBadgeText: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    color: '#FBFBFE',
  },
  securityTag: {
    fontSize: 10,
    fontFamily: Theme.fonts.medium,
    color: '#94A3B8',
  },
  eventTitleText: {
    fontSize: 20,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  venueText: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 2,
    marginBottom: Theme.spacing.md,
  },
  scannerWrapper: {
    alignItems: 'center',
    marginVertical: Theme.spacing.md,
    position: 'relative',
  },
  laserBeam: {
    position: 'absolute',
    top: 50,
    width: '100%',
    height: 2,
    backgroundColor: '#EC4899',
    shadowColor: '#EC4899',
    shadowRadius: 8,
    shadowOpacity: 1,
    zIndex: 10,
  },
  qrBox: {
    padding: Theme.spacing.md,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  detailLabel: {
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  detailVal: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    marginTop: 2,
  },
  detailValHighlight: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: '#F59E0B',
    marginTop: 2,
  },
  actionsPanel: {
    width: '100%',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  walletBtn: {
    height: 50,
    backgroundColor: '#2563EB',
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  walletBtnText: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  payBtn: {
    height: 50,
    backgroundColor: '#7C3AED',
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  payBtnText: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
});
