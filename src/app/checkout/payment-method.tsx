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

export default function PaymentMethodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { eventId, total, ticketCount, tierName, discount } = params;

  const handleSelectMethod = (method: 'card' | 'upi' | 'billing') => {
    // Navigate forward carrying along the parameters
    const nextPath = method === 'card' 
      ? '/checkout/card-input' 
      : method === 'upi' 
      ? '/checkout/upi-sim'
      : '/checkout/billing-details';

    router.push({
      pathname: nextPath,
      params: {
        eventId,
        total,
        ticketCount,
        tierName,
        discount,
      }
    } as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AppIcon name="chevron.left" size={20} tintColor={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Payment Method</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cost Summary Sheet */}
        <GlassView style={styles.summaryCard} intensity="medium">
          <View>
            <Text style={styles.summaryLabel}>TOTAL AMOUNT DUE</Text>
            <Text style={styles.summaryValue}>₹{total}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryTickets}>{ticketCount} {Number(ticketCount) === 1 ? 'Pass' : 'Passes'}</Text>
            <Text style={styles.summaryTier}>{tierName}</Text>
          </View>
        </GlassView>

        <Text style={styles.sectionLabel}>Secure Payment Methods</Text>

        {/* Payment Choices */}
        <View style={styles.choicesList}>
          {/* Card option */}
          <TouchableOpacity onPress={() => handleSelectMethod('card')} style={styles.choiceCard}>
            <GlassView style={styles.choiceCardInner} intensity="low">
              <View style={styles.choiceLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(124, 58, 237, 0.08)' }]}>
                  <AppIcon name="creditcard" size={20} tintColor={Theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.choiceTitle}>Credit / Debit Card</Text>
                  <Text style={styles.choiceDesc}>Visa, Mastercard, RuPay, Maestro</Text>
                </View>
              </View>
              <AppIcon name="chevron.right" size={16} tintColor={Theme.colors.textMuted} />
            </GlassView>
          </TouchableOpacity>

          {/* UPI Option */}
          <TouchableOpacity onPress={() => handleSelectMethod('upi')} style={styles.choiceCard}>
            <GlassView style={styles.choiceCardInner} intensity="low">
              <View style={styles.choiceLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(37, 99, 235, 0.08)' }]}>
                  <AppIcon name="iphone" size={20} tintColor={Theme.colors.secondary} />
                </View>
                <View>
                  <Text style={styles.choiceTitle}>UPI Instant Payment</Text>
                  <Text style={styles.choiceDesc}>Google Pay, PhonePe, Paytm, BHIM</Text>
                </View>
              </View>
              <AppIcon name="chevron.right" size={16} tintColor={Theme.colors.textMuted} />
            </GlassView>
          </TouchableOpacity>

          {/* Corporate billing Option */}
          <TouchableOpacity onPress={() => handleSelectMethod('billing')} style={styles.choiceCard}>
            <GlassView style={styles.choiceCardInner} intensity="low">
              <View style={styles.choiceLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
                  <AppIcon name="building" size={20} tintColor={Theme.colors.success} />
                </View>
                <View>
                  <Text style={styles.choiceTitle}>Corporate Billing / GST</Text>
                  <Text style={styles.choiceDesc}>Add company name, GSTIN details</Text>
                </View>
              </View>
              <AppIcon name="chevron.right" size={16} tintColor={Theme.colors.textMuted} />
            </GlassView>
          </TouchableOpacity>
        </View>

        {/* Security assurance */}
        <View style={styles.securityInfo}>
          <AppIcon name="lock.shield.fill" size={14} tintColor={Theme.colors.textMuted} />
          <Text style={styles.securityText}>256-bit SSL Secure encrypted transaction</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    ...Platform.select({
      web: {
        maxWidth: 800,
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
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: 80,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 194, 255, 0.04)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
    gap: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.textMuted,
  },
  summaryValue: {
    fontSize: 26,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.secondary,
    marginTop: 2,
  },
  summaryRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  summaryTickets: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  summaryTier: {
    fontSize: 11,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  choicesList: {
    gap: 12,
  },
  choiceCard: {
    width: '100%',
  },
  choiceCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  choiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  choiceDesc: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginTop: Theme.spacing.xl,
  },
  securityText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
});
