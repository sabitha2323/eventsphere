import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function BudgetCalculatorScreen() {
  const router = useRouter();

  const [guestCount, setGuestCount] = useState('200');
  const [standardPrice, setStandardPrice] = useState('500');
  const [vipPrice, setVipPrice] = useState('1500');
  const [vipRatio, setVipRatio] = useState('20'); // 20% VIP guests

  const [venueCost, setVenueCost] = useState('25000');
  const [cateringPerGuest, setCateringPerGuest] = useState('150');
  const [avCost, setAvCost] = useState('15000');
  const [marketingCost, setMarketingCost] = useState('10000');
  const [otherCost, setOtherCost] = useState('5000');

  // Calculations
  const guests = parseInt(guestCount, 10) || 0;
  const stdPrice = parseFloat(standardPrice) || 0;
  const vPrice = parseFloat(vipPrice) || 0;
  const vRatio = (parseFloat(vipRatio) || 0) / 100;

  const vipGuests = Math.round(guests * vRatio);
  const stdGuests = Math.max(0, guests - vipGuests);

  const projectedRevenue = stdGuests * stdPrice + vipGuests * vPrice;

  const totalCatering = guests * (parseFloat(cateringPerGuest) || 0);
  const totalVenue = parseFloat(venueCost) || 0;
  const totalAV = parseFloat(avCost) || 0;
  const totalMarketing = parseFloat(marketingCost) || 0;
  const totalOther = parseFloat(otherCost) || 0;

  const totalExpense = totalVenue + totalCatering + totalAV + totalMarketing + totalOther;
  const netProfit = projectedRevenue - totalExpense;
  const profitMargin = projectedRevenue > 0 ? ((netProfit / projectedRevenue) * 100).toFixed(1) : '0';
  const costPerGuest = guests > 0 ? (totalExpense / guests).toFixed(0) : '0';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor={Theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Event Budget Calculator</Text>
          <Text style={styles.headerSubtitle}>Financial Projection & Profit Analysis</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Financial Overview Cards */}
        <View style={styles.metricsRow}>
          <GlassView style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Revenue</Text>
            <Text style={[styles.metricValue, { color: Theme.colors.success }]}>
              ₹{projectedRevenue.toLocaleString()}
            </Text>
            <Text style={styles.metricSubtext}>{guests} Attendees</Text>
          </GlassView>

          <GlassView style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Expense</Text>
            <Text style={[styles.metricValue, { color: Theme.colors.danger }]}>
              ₹{totalExpense.toLocaleString()}
            </Text>
            <Text style={styles.metricSubtext}>₹{costPerGuest}/guest</Text>
          </GlassView>
        </View>

        <GlassView style={styles.profitBanner}>
          <View>
            <Text style={styles.profitLabel}>Net Projected Profit</Text>
            <Text
              style={[
                styles.profitValue,
                { color: netProfit >= 0 ? Theme.colors.success : Theme.colors.danger },
              ]}
            >
              ₹{netProfit.toLocaleString()}
            </Text>
          </View>
          <View style={styles.marginBadge}>
            <Text style={styles.marginBadgeText}>{profitMargin}% Margin</Text>
          </View>
        </GlassView>

        {/* Inputs Form */}
        <Text style={styles.sectionHeader}>1. Capacity & Ticket Pricing</Text>
        <GlassView style={styles.card}>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Total Attendees</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={guestCount}
                onChangeText={setGuestCount}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>VIP Share (%)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={vipRatio}
                onChangeText={setVipRatio}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Standard Pass Price (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={standardPrice}
                onChangeText={setStandardPrice}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>VIP Pass Price (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={vipPrice}
                onChangeText={setVipPrice}
              />
            </View>
          </View>
        </GlassView>

        <Text style={styles.sectionHeader}>2. Event Cost Breakdown</Text>
        <GlassView style={styles.card}>
          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Venue Rental (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={venueCost}
                onChangeText={setVenueCost}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Catering / Guest (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={cateringPerGuest}
                onChangeText={setCateringPerGuest}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>AV & Lighting (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={avCost}
                onChangeText={setAvCost}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Marketing Budget (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={marketingCost}
                onChangeText={setMarketingCost}
              />
            </View>
          </View>
        </GlassView>

        {/* Visual Progress Breakdown */}
        <Text style={styles.sectionHeader}>3. Expense Distribution</Text>
        <GlassView style={styles.card}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Venue ({totalExpense > 0 ? ((totalVenue / totalExpense) * 100).toFixed(0) : 0}%)</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${totalExpense > 0 ? (totalVenue / totalExpense) * 100 : 0}%`,
                    backgroundColor: Theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Catering ({totalExpense > 0 ? ((totalCatering / totalExpense) * 100).toFixed(0) : 0}%)</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${totalExpense > 0 ? (totalCatering / totalExpense) * 100 : 0}%`,
                    backgroundColor: Theme.colors.secondary,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>AV & Sound ({totalExpense > 0 ? ((totalAV / totalExpense) * 100).toFixed(0) : 0}%)</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${totalExpense > 0 ? (totalAV / totalExpense) * 100 : 0}%`,
                    backgroundColor: Theme.colors.warning,
                  },
                ]}
              />
            </View>
          </View>
        </GlassView>
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
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  metricSubtext: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  profitBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: Theme.colors.glassPrimaryBorder,
    backgroundColor: Theme.colors.glassPrimaryBg,
  },
  profitLabel: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
  },
  profitValue: {
    fontSize: 26,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
  },
  marginBadge: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.round,
  },
  marginBadgeText: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.white,
  },
  sectionHeader: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
  card: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    height: 42,
    backgroundColor: Theme.colors.backgroundCard,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 14,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
  },
  progressRow: {
    marginBottom: Theme.spacing.sm,
  },
  progressLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
  barTrack: {
    height: 8,
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
