import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function SelectTicketsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  
  // Promo state
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (eventData) setEvent(eventData);

      const { data: tiersData } = await supabase.from('ticket_tiers').select('*').eq('event_id', eventId);
      const fetchedTiers = tiersData || [];
      
      // If no tiers exist, seed a standard mock tier
      if (fetchedTiers.length === 0 && eventData) {
        fetchedTiers.push({
          id: 'standard-tier',
          name: 'General Admission',
          price: eventData.ticket_price,
          quantity: 200,
          sold: 12,
        });
      }

      setTiers(fetchedTiers);

      const initialQtys = fetchedTiers.reduce((acc: any, t: any) => {
        acc[t.id] = 0;
        return acc;
      }, {});
      // Default set 1 ticket for the first tier
      if (fetchedTiers.length > 0) {
        initialQtys[fetchedTiers[0].id] = 1;
      }
      setQuantities(initialQtys);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateQty = (tierId: string, delta: number) => {
    const current = quantities[tierId] || 0;
    const next = Math.max(0, current + delta);
    setQuantities({ ...quantities, [tierId]: next });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const { data } = await supabase.from('promocodes').select('*');
      const match = (data || []).find(
        (p: any) => p.code.toLowerCase() === promoCode.trim().toLowerCase() && p.is_active
      );

      if (match) {
        // Validate if coupon is bound to this event
        if (match.event_id && match.event_id !== eventId) {
          Alert.alert('Invalid Coupon', 'This promo code is not valid for this specific event.');
          return;
        }

        setDiscountPercent(match.discount);
        setAppliedPromo(match.code.toUpperCase());
        Alert.alert('Promo Applied', `"${match.code}" applied! You saved ${match.discount}% on ticket costs.`);
      } else {
        Alert.alert('Invalid Coupon', 'This promo code does not exist or has expired.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compute values
  const selectedTiersInfo = tiers.map(t => ({
    id: t.id,
    name: t.name,
    price: t.price,
    qty: quantities[t.id] || 0,
  })).filter(t => t.qty > 0);

  const subtotal = selectedTiersInfo.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const discountAmount = parseFloat((subtotal * (discountPercent / 100)).toFixed(2));
  const tax = parseFloat(((subtotal - discountAmount) * 0.18).toFixed(2)); // 18% GST simulation
  const total = parseFloat((subtotal - discountAmount + tax).toFixed(2));
  const totalTickets = selectedTiersInfo.reduce((acc, curr) => acc + curr.qty, 0);

  const handleProceed = () => {
    if (totalTickets === 0) {
      Alert.alert('No Tickets Selected', 'Please select at least 1 ticket to proceed.');
      return;
    }

    // Pass data forward to payment gateway simulation
    router.push({
      pathname: '/checkout/payment-method',
      params: {
        eventId,
        total: String(total),
        ticketCount: String(totalTickets),
        tierName: selectedTiersInfo[0]?.name || 'Standard Pass',
        discount: String(discountAmount),
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
        <Text style={styles.headerTitle}>Select Tickets</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Event Header Summary */}
            {event && (
              <GlassView style={styles.summaryCard} intensity="low">
                <Text style={styles.eventCatText} numberOfLines={1}>{event.category.toUpperCase()}</Text>
                <Text style={styles.eventTitleText} numberOfLines={1}>{event.title}</Text>
                <Text style={styles.eventDateText}>{event.venue.split(',')[0]}</Text>
              </GlassView>
            )}

            <Text style={styles.sectionLabel}>Available Ticket Classes</Text>

            {/* Tiers counters */}
            <View style={styles.tiersContainer}>
              {tiers.map(tier => {
                const count = quantities[tier.id] || 0;
                return (
                  <GlassView key={tier.id} style={styles.tierCard} intensity="medium">
                    <View style={styles.tierLeft}>
                      <Text style={styles.tierName}>{tier.name}</Text>
                      <Text style={styles.tierPrice}>
                        {tier.price === 0 ? 'Free' : `₹${tier.price}`}
                      </Text>
                    </View>

                    <View style={styles.counterRow}>
                      <TouchableOpacity onPress={() => updateQty(tier.id, -1)} style={styles.counterBtn}>
                        <AppIcon name="minus" size={14} tintColor={Theme.colors.textSecondary} />
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{count}</Text>
                      <TouchableOpacity onPress={() => updateQty(tier.id, 1)} style={styles.counterBtn}>
                        <AppIcon name="plus" size={14} tintColor={Theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </GlassView>
                );
              })}
            </View>

            {/* Promo Code Counter */}
            <Text style={styles.sectionLabel}>Promo Coupon</Text>
            <View style={styles.promoRow}>
              <GlassView style={styles.promoInputContainer} intensity="low">
                <AppIcon name="tag" size={16} tintColor={Theme.colors.textMuted} />
                <TextInput
                  style={styles.promoInput}
                  placeholder="Enter Promo Code"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                  editable={!appliedPromo}
                />
              </GlassView>
              <TouchableOpacity
                style={[styles.promoApplyBtn, appliedPromo && { backgroundColor: Theme.colors.success }]}
                onPress={handleApplyPromo}
                disabled={!!appliedPromo}
              >
                <Text style={styles.promoApplyText}>{appliedPromo ? 'Applied' : 'Apply'}</Text>
              </TouchableOpacity>
            </View>

            {/* Receipt Summary details */}
            <GlassView style={styles.receiptCard} intensity="low">
              <Text style={styles.receiptTitle}>Order Summary</Text>
              
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Base Subtotal</Text>
                <Text style={styles.receiptValue}>₹{subtotal}</Text>
              </View>

              {discountAmount > 0 && (
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: Theme.colors.success }]}>
                    Discount ({appliedPromo})
                  </Text>
                  <Text style={[styles.receiptValue, { color: Theme.colors.success }]}>-₹{discountAmount}</Text>
                </View>
              )}

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>GST (18%)</Text>
                <Text style={styles.receiptValue}>₹{tax}</Text>
              </View>

              <View style={[styles.receiptRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>₹{total}</Text>
              </View>
            </GlassView>

          </ScrollView>

          {/* Bottom Sticky Proceed Sheet */}
          <GlassView style={styles.bottomSheet} intensity="high">
            <View style={styles.bottomLeft}>
              <Text style={styles.bottomLabel}>{totalTickets} Tickets selected</Text>
              <Text style={styles.bottomPrice}>Total: ₹{total}</Text>
            </View>
            <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
              <Text style={styles.proceedText}>Checkout</Text>
              <AppIcon name="arrow.right" size={14} tintColor="#fff" />
            </TouchableOpacity>
          </GlassView>
        </View>
      )}
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
    paddingBottom: 150,
    gap: 16,
  },
  summaryCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 2,
  },
  eventCatText: {
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  eventTitleText: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  eventDateText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tiersContainer: {
    gap: 10,
  },
  tierCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  tierLeft: {
    gap: 2,
  },
  tierName: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    fontWeight: '600',
  },
  tierPrice: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.secondary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: Theme.borderRadius.sm,
    padding: 4,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    width: 20,
    textAlign: 'center',
  },
  promoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.sm,
  },
  promoInput: {
    flex: 1,
    height: '100%',
    color: Theme.colors.text,
    fontSize: 14,
    marginLeft: Theme.spacing.sm,
    fontFamily: Theme.fonts.regular,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  promoApplyBtn: {
    width: 80,
    height: 40,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.sm,
  },
  promoApplyText: {
    color: '#fff',
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
  },
  receiptCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 10,
    marginTop: Theme.spacing.sm,
  },
  receiptTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
    paddingBottom: 6,
    marginBottom: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  receiptValue: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.bold,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.05)',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.secondary,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    gap: 2,
  },
  bottomLabel: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.medium,
  },
  bottomPrice: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.secondary,
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.sm,
  },
  proceedText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
});
