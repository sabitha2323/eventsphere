import React from 'react';
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

export default function RegistrationCongratsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const eventTitle = (params.eventTitle as string) || 'Neon Beats Music Festival';
  const regId = (params.regId as string) || `REG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const total = (params.total as string) || '1499';
  const method = (params.method as string) || 'Razorpay Pro Gateway';

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Animated Celebration Banner */}
        <View style={styles.iconContainer}>
          <View style={styles.iconRingOuter}>
            <View style={styles.iconRingInner}>
              <AppIcon name="checkmark" size={44} tintColor="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.congratsHeading}>🎉 Congratulations!</Text>
        <Text style={styles.congratsSub}>🎉 You Have Booked a Ticket!</Text>
        <Text style={styles.descriptionText}>
          Your seat and pass have been locked in. Payment was verified via {method}.
        </Text>

        {/* Confirmation Details Card */}
        <GlassView style={styles.detailsCard} intensity="high">
          <Text style={styles.cardHeader}>Booking Confirmation Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Registration ID</Text>
            <Text style={styles.valueHighlight}>{regId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Event Title</Text>
            <Text style={styles.value}>{eventTitle}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>{method}</Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </GlassView>

        {/* Action Buttons */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/ticket/pass-wallet')}
          >
            <AppIcon name="ticket.fill" size={18} tintColor="#FFFFFF" />
            <Text style={styles.primaryBtnText}>View Interactive 3D VIP Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push(`/checkout/receipt/${regId}` as any)}
          >
            <AppIcon name="doc.text.fill" size={16} tintColor={Theme.colors.primary} />
            <Text style={styles.secondaryBtnText}>View Tax Invoice Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.homeBtnText}>Return to Main Web Dashboard</Text>
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
        maxWidth: 1400,
        alignSelf: 'center',
        width: '100%',
        borderColor: 'rgba(15, 23, 42, 0.08)',
        borderLeftWidth: 1,
        borderRightWidth: 1,
      } as any,
    }),
  },
  backgroundAccent1: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    filter: Platform.OS === 'web' ? 'blur(90px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: 80,
    left: -100,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(6, 182, 212, 0.20)',
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined,
    zIndex: -1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 80 : 40,
    paddingBottom: 100,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Theme.spacing.md,
  },
  iconRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRingInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  congratsHeading: {
    fontSize: 26,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  congratsSub: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.success,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.md,
  },
  detailsCard: {
    width: '100%',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.glassPrimaryBorder,
  },
  cardHeader: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.glassBorder,
    paddingBottom: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  label: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.medium,
  },
  value: {
    fontSize: 13,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.bold,
  },
  valueHighlight: {
    fontSize: 13,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.bold,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.glassBorder,
    paddingTop: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.secondary,
  },
  actionsGroup: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  secondaryBtn: {
    height: 48,
    backgroundColor: Theme.colors.glassPrimaryBg,
    borderColor: Theme.colors.glassPrimaryBorder,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
  },
  homeBtn: {
    padding: Theme.spacing.md,
    alignItems: 'center',
  },
  homeBtnText: {
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
    textDecorationLine: 'underline',
  },
});
