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
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function PromocodesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [promos, setPromos] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  // Form states
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [limit, setLimit] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('All');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: promoData } = await supabase.from('promocodes').select('*');
      setPromos(promoData || []);

      const { data: eventData } = await supabase.from('events').select('*');
      setEvents(eventData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async () => {
    if (!code.trim() || !discount || !limit) {
      Alert.alert('Validation Error', 'Please fill in all coupon fields.');
      return;
    }

    const discNum = parseInt(discount);
    const limitNum = parseInt(limit);

    if (isNaN(discNum) || discNum < 1 || discNum > 100) {
      Alert.alert('Validation Error', 'Discount must be a percentage between 1 and 100.');
      return;
    }
    if (isNaN(limitNum) || limitNum < 1) {
      Alert.alert('Validation Error', 'Limit must be a positive integer.');
      return;
    }

    setSubmitting(true);
    try {
      const newPromo = {
        code: code.trim().toUpperCase(),
        discount: discNum,
        limit: limitNum,
        used: 0,
        is_active: true,
        event_id: selectedEventId === 'All' ? null : selectedEventId,
      };

      const { error } = await supabase.from('promocodes').insert(newPromo);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Coupon Created', `Promo code "${newPromo.code}" is now active.`);
        setCode('');
        setDiscount('');
        setLimit('');
        setSelectedEventId('All');
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePromo = async (promoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promocodes')
        .update({ is_active: !currentStatus })
        .eq('id', promoId);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setPromos(promos.map(p => 
          p.id === promoId ? { ...p, is_active: !currentStatus } : p
        ));
      }
    } catch (e) {
      console.error(e);
    }
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
        <Text style={styles.headerTitle}>Promo Coupons</Text>
        <AppIcon name="tag.fill" size={18} tintColor={Theme.colors.secondary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Coupon creation form */}
        <GlassView style={styles.formCard} intensity="medium">
          <Text style={styles.formTitle}>Generate Promo Coupon</Text>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.inputLabel}>Coupon Code</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. SUMMER50"
                placeholderTextColor={Theme.colors.textMuted}
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Discount (%)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="20"
                placeholderTextColor={Theme.colors.textMuted}
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Usage Limit</Text>
              <TextInput
                style={styles.textInput}
                placeholder="100"
                placeholderTextColor={Theme.colors.textMuted}
                value={limit}
                onChangeText={setLimit}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.inputLabel}>Applies To Event</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dropdownScroll}>
                <TouchableOpacity
                  onPress={() => setSelectedEventId('All')}
                  style={[styles.dropdownOption, selectedEventId === 'All' && styles.dropdownOptionActive]}
                >
                  <Text style={[styles.dropdownText, selectedEventId === 'All' && { color: '#fff' }]}>All Events</Text>
                </TouchableOpacity>
                {events.map(e => (
                  <TouchableOpacity
                    key={e.id}
                    onPress={() => setSelectedEventId(e.id)}
                    style={[styles.dropdownOption, selectedEventId === e.id && styles.dropdownOptionActive]}
                  >
                    <Text style={[styles.dropdownText, selectedEventId === e.id && { color: '#fff' }]} numberOfLines={1}>
                      {e.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleCreatePromo} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Generate Active Promo</Text>
            )}
          </TouchableOpacity>
        </GlassView>

        {/* Existing Promo Coupons list */}
        <Text style={styles.sectionLabel}>Active Coupons ({promos.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        ) : (
          <View style={styles.promoList}>
            {promos.length > 0 ? (
              promos.map(item => {
                const eventName = events.find(e => e.id === item.event_id)?.title || 'All Events';
                return (
                  <GlassView key={item.id} style={[styles.promoCard, !item.is_active && { opacity: 0.6 }]} intensity="low">
                    <View style={styles.promoCardLeft}>
                      <View style={styles.couponTag}>
                        <Text style={styles.couponCodeText}>{item.code}</Text>
                      </View>
                      <Text style={styles.promoDiscountText}>{item.discount}% Off Ticket Cost</Text>
                      <Text style={styles.promoLimitText}>Limit: {item.used} / {item.limit} claims</Text>
                      <Text style={styles.promoEventText} numberOfLines={1}>Applies to: {eventName}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleTogglePromo(item.id, item.is_active)}
                      style={[
                        styles.toggleBtn,
                        item.is_active ? { backgroundColor: Theme.colors.success } : { backgroundColor: Theme.colors.danger }
                      ]}
                    >
                      <Text style={styles.toggleBtnText}>{item.is_active ? 'Active' : 'Disabled'}</Text>
                    </TouchableOpacity>
                  </GlassView>
                );
              })
            ) : (
              <GlassView style={styles.emptyView} intensity="low">
                <Text style={styles.emptyText}>No promo coupons created yet.</Text>
              </GlassView>
            )}
          </View>
        )}
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
  formCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 12,
  },
  formTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  textInput: {
    height: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.sm,
    fontSize: 14,
    color: Theme.colors.text,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  dropdownScroll: {
    gap: 8,
    alignItems: 'center',
    height: 40,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    justifyContent: 'center',
    maxWidth: 150,
  },
  dropdownOptionActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: 'transparent',
  },
  dropdownText: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textSecondary,
  },
  submitBtn: {
    height: 40,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promoList: {
    gap: 12,
  },
  promoCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  promoCardLeft: {
    flex: 1,
    gap: 2,
  },
  couponTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  couponCodeText: {
    color: Theme.colors.secondary,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    fontSize: 12,
  },
  promoDiscountText: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  promoLimitText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
  },
  promoEventText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
  },
  toggleBtnText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  emptyView: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
});
