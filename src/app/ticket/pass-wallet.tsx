import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function PassWalletScreen() {
  const router = useRouter();

  const [tier, setTier] = useState<'VIP' | 'STANDARD'>('VIP');
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 35, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        return { ...prev, seconds: 59, minutes: Math.max(0, prev.minutes - 1) };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDownload = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert('Digital VIP Pass saved to your device downloads!');
    } else {
      Alert.alert('Pass Exported', 'VIP Pass saved to Apple / Google Wallet!');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor={Theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Digital Wallet Pass</Text>
          <Text style={styles.headerSubtitle}>Official Gate Entry Pass</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tier Switcher */}
        <View style={styles.tierContainer}>
          <TouchableOpacity
            style={[styles.tierBtn, tier === 'VIP' && styles.tierBtnActive]}
            onPress={() => setTier('VIP')}
          >
            <Text style={[styles.tierBtnText, tier === 'VIP' && styles.tierBtnTextActive]}>⭐ VIP All-Access Pass</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tierBtn, tier === 'STANDARD' && styles.tierBtnActive]}
            onPress={() => setTier('STANDARD')}
          >
            <Text style={[styles.tierBtnText, tier === 'STANDARD' && styles.tierBtnTextActive]}>Standard Entry</Text>
          </TouchableOpacity>
        </View>

        {/* 3D Holographic Pass Card */}
        <GlassView style={styles.passCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.badgeLabel}>{tier === 'VIP' ? 'GOLD VIP PASS' : 'STANDARD TICKET'}</Text>
              <Text style={styles.eventName}>Neon Beats Music Festival</Text>
            </View>
            <View style={styles.statusDot} />
          </View>

          {/* Countdown Clock */}
          <View style={styles.countdownBox}>
            <Text style={styles.countdownLabel}>Event Starts In</Text>
            <View style={styles.timerRow}>
              <View style={styles.timeUnit}>
                <Text style={styles.timeNumber}>{String(timeLeft.days).padStart(2, '0')}</Text>
                <Text style={styles.timeText}>DAYS</Text>
              </View>
              <Text style={styles.timeColon}>:</Text>
              <View style={styles.timeUnit}>
                <Text style={styles.timeNumber}>{String(timeLeft.hours).padStart(2, '0')}</Text>
                <Text style={styles.timeText}>HRS</Text>
              </View>
              <Text style={styles.timeColon}>:</Text>
              <View style={styles.timeUnit}>
                <Text style={styles.timeNumber}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
                <Text style={styles.timeText}>MINS</Text>
              </View>
              <Text style={styles.timeColon}>:</Text>
              <View style={styles.timeUnit}>
                <Text style={styles.timeNumber}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
                <Text style={styles.timeText}>SECS</Text>
              </View>
            </View>
          </View>

          {/* Simulated Gate QR Code */}
          <View style={styles.qrSection}>
            <View style={styles.qrFrame}>
              <Text style={styles.qrMockCode}>[ QR GATE SCANNER ]</Text>
              <Text style={styles.qrSub}>Scan at Gate A - Turnstile #3</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.footerLabel}>HOLDER NAME</Text>
              <Text style={styles.footerValue}>Sabitha (VIP Guest)</Text>
            </View>
            <View>
              <Text style={styles.footerLabel}>TICKET ID</Text>
              <Text style={styles.footerValue}>#TKT-884920</Text>
            </View>
          </View>
        </GlassView>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <AppIcon name="arrow.down.doc.fill" size={18} tintColor={Theme.colors.white} />
          <Text style={styles.downloadBtnText}>Save Pass to Device Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/checkout/receipt/order-1')}>
          <Text style={styles.secondaryBtnText}>View Purchase Order Receipt</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'web' ? Theme.spacing.md : Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.glassBorder,
  },
  backBtn: {
    padding: Theme.spacing.xs,
    marginRight: Theme.spacing.md,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  tierContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.round,
    padding: 4,
    marginBottom: Theme.spacing.lg,
    width: '100%',
    maxWidth: 360,
  },
  tierBtn: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.round,
  },
  tierBtnActive: {
    backgroundColor: Theme.colors.primary,
  },
  tierBtnText: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
  },
  tierBtnTextActive: {
    color: Theme.colors.white,
    fontFamily: Theme.fonts.bold,
  },
  passCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.glassPrimaryBorder,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  badgeLabel: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    letterSpacing: 1,
  },
  eventName: {
    fontSize: 20,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.success,
  },
  countdownBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  countdownLabel: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: Theme.spacing.xs,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeUnit: {
    alignItems: 'center',
  },
  timeNumber: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  timeText: {
    fontSize: 9,
    color: Theme.colors.textMuted,
  },
  timeColon: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  qrFrame: {
    width: 200,
    height: 140,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.primaryLight,
    borderStyle: 'dashed',
  },
  qrMockCode: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    letterSpacing: 1,
  },
  qrSub: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.glassBorder,
    paddingTop: Theme.spacing.md,
  },
  footerLabel: {
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
  },
  footerValue: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.xs,
    width: '100%',
    maxWidth: 380,
    height: 48,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  downloadBtnText: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.white,
  },
  secondaryBtn: {
    padding: Theme.spacing.md,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.secondary,
  },
});
