import React, { useState } from 'react';
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

export default function CardInputScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { eventId, total, ticketCount, tierName, discount } = params;

  // Card inputs
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const matched = cleaned.match(/.{1,4}/g);
    return matched ? matched.join(' ') : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setNumber(formatted.slice(0, 19)); // Max 16 digits + 3 spaces
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiry(text);
    setExpiry(formatted.slice(0, 5));
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setCvv(cleaned.slice(0, 3));
  };

  const handlePay = async () => {
    if (number.length < 19 || !name.trim() || expiry.length < 5 || cvv.length < 3) {
      Alert.alert('Validation Error', 'Please complete all credit card details correctly.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Create registration in mock DB
        const { data: reg, error } = await supabase.from('registrations').insert({
          event_id: eventId,
          user_id: user.id,
        });

        if (error) {
          // If already registered, simulate refund or failed
          Alert.alert('Transaction Failed', 'You are already registered for this event.');
          router.push({
            pathname: '/checkout/failed',
            params: { message: 'Duplicate registration record' }
          } as any);
        } else {
          // Insert simulated billing receipt
          const regRecord = Array.isArray(reg) ? reg[0] : reg;
          await supabase.from('billing_records').insert({
            user_id: user.id,
            ticket_id: regRecord?.id || 'mock-id',
            amount: parseFloat(String(total)),
            payment_method: 'Credit Card',
          });

          // Dispatched notification alert
          const { data: eventData } = await supabase.from('events').select('title').eq('id', eventId).single();
          await supabase.from('notifications').insert({
            user_id: user.id,
            title: 'Ticket Booked Successfully!',
            message: `You have booked ${ticketCount} slot(s) for "${eventData?.title || 'Event'}" via Credit Card.`,
          });

          // Go to Congrats screen
          router.push({
            pathname: '/checkout/congrats',
            params: {
              eventId,
              regId: regRecord?.id || 'REG-MOCK-CARD',
              total,
              ticketCount,
              method: 'Credit / Debit Card',
            }
          } as any);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
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
        <Text style={styles.headerTitle}>Card Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Visual Simulated Credit Card Overlay */}
        <View style={styles.cardContainer}>
          <View style={styles.creditCardVisual}>
            <View style={styles.cardHeader}>
              <AppIcon name="creditcard.fill" size={24} tintColor="#fff" />
              <Text style={styles.cardBrand}>PayPass</Text>
            </View>
            <Text style={styles.cardVisualNumber}>
              {number || '•••• •••• •••• ••••'}
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.cardFooterLeft}>
                <Text style={styles.cardVisualLabel}>CARD HOLDER</Text>
                <Text style={styles.cardVisualValue} numberOfLines={1}>
                  {name.toUpperCase() || 'YOUR NAME'}
                </Text>
              </View>
              <View style={styles.cardFooterRight}>
                <Text style={styles.cardVisualLabel}>EXPIRES</Text>
                <Text style={styles.cardVisualValue}>
                  {expiry || 'MM/YY'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Inputs */}
        <GlassView style={styles.formCard} intensity="medium">
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={Theme.colors.textMuted}
              value={number}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Holder Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Cardholder name"
              placeholderTextColor={Theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="MM/YY"
                placeholderTextColor={Theme.colors.textMuted}
                value={expiry}
                onChangeText={handleExpiryChange}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV Code</Text>
              <TextInput
                style={styles.textInput}
                placeholder="000"
                placeholderTextColor={Theme.colors.textMuted}
                value={cvv}
                onChangeText={handleCvvChange}
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payBtnText}>Pay ₹{total} Secures Pass</Text>
            )}
          </TouchableOpacity>
        </GlassView>
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
  cardContainer: {
    alignItems: 'center',
    marginVertical: Theme.spacing.sm,
  },
  creditCardVisual: {
    width: '100%',
    maxWidth: 320,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#312E81', // Metallic Indigo gradient bg
    padding: Theme.spacing.md,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    ...Platform.select({
      web: {
        backgroundImage: 'linear-gradient(135deg, #4F46E5, #312E81)',
      } as any,
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
  },
  cardVisualNumber: {
    color: '#fff',
    fontSize: 20,
    fontFamily: Theme.fonts.medium,
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterLeft: {
    flex: 1,
    paddingRight: Theme.spacing.md,
  },
  cardFooterRight: {
    alignItems: 'flex-end',
  },
  cardVisualLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 8,
    fontFamily: Theme.fonts.bold,
  },
  cardVisualValue: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    marginTop: 2,
  },
  formCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
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
  payBtn: {
    height: 44,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
});
