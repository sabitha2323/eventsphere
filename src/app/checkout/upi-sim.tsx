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

export default function UpiSimulatorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { eventId, total, ticketCount, tierName, discount } = params;

  const [upiId, setUpiId] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [processing, setProcessing] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (!requestSent) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          Alert.alert('Request Expired', 'UPI request validity window expired.');
          router.replace('/checkout/failed' as any);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [requestSent]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleSendRequest = () => {
    if (!upiId.trim() || !upiId.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid UPI ID (e.g. name@okaxis).');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setRequestSent(true);
    }, 800);
  };

  const handleSimulatePayment = async (status: 'approve' | 'decline') => {
    setProcessing(true);
    setTimeout(async () => {
      setProcessing(false);
      
      if (status === 'decline') {
        router.push({
          pathname: '/checkout/failed',
          params: { message: 'UPI transaction declined by user' }
        } as any);
        return;
      }

      // Success flow
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Register
          const { data: reg, error } = await supabase.from('registrations').insert({
            event_id: eventId,
            user_id: user.id,
          });

          if (error) {
            router.push({
              pathname: '/checkout/failed',
              params: { message: 'Failed to insert registration record' }
            } as any);
          } else {
            const regRecord = Array.isArray(reg) ? reg[0] : reg;
            // Bill receipt
            await supabase.from('billing_records').insert({
              user_id: user.id,
              ticket_id: regRecord?.id || 'mock-id',
              amount: parseFloat(String(total)),
              payment_method: 'UPI',
            });

            // Notification
            const { data: eventData } = await supabase.from('events').select('title').eq('id', eventId).single();
            await supabase.from('notifications').insert({
              user_id: user.id,
              title: 'UPI Payment Successful!',
              message: `Your booking for "${eventData?.title || 'Event'}" was processed via UPI ID ${upiId.trim()}.`,
            });

            // Redirect to Congrats screen
            router.push({
              pathname: '/checkout/congrats',
              params: {
                eventId,
                regId: regRecord?.id || 'REG-MOCK-UPI',
                total,
                ticketCount,
                method: 'UPI Instant Payment',
              }
            } as any);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 1500);
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
        <Text style={styles.headerTitle}>UPI Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cost Summary Card */}
        <GlassView style={styles.summaryCard} intensity="low">
          <Text style={styles.summaryLabel}>AMOUNT TO PAY</Text>
          <Text style={styles.summaryValue}>₹{total}</Text>
        </GlassView>

        {!requestSent ? (
          /* Input screen */
          <GlassView style={styles.formCard} intensity="medium">
            <Text style={styles.formTitle}>Enter UPI ID</Text>
            <Text style={styles.formDesc}>
              Enter your Virtual Payment Address (VPA / UPI ID) to request a payment notification.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>UPI ID (VPA)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. sutharsen@okaxis"
                placeholderTextColor={Theme.colors.textMuted}
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.actionBtn} onPress={handleSendRequest} disabled={processing}>
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionBtnText}>Send Payment Request</Text>
              )}
            </TouchableOpacity>
          </GlassView>
        ) : (
          /* Waiting Screen simulation */
          <View style={{ gap: 16 }}>
            <GlassView style={styles.timerCard} intensity="medium">
              <AppIcon name="hourglass" size={24} tintColor={Theme.colors.warning} />
              <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerDesc}>Waiting for payment approval from your UPI App...</Text>
            </GlassView>

            <GlassView style={styles.instructionCard} intensity="low">
              <Text style={styles.instructionHeading}>Follow these steps:</Text>
              <Text style={styles.stepText}>1. Open your UPI mobile app (Google Pay, PhonePe, etc.).</Text>
              <Text style={styles.stepText}>2. Look for a pending payment request of <Text style={{ fontWeight: '700' }}>₹{total}</Text> from EventSphere.</Text>
              <Text style={styles.stepText}>3. Enter your UPI PIN to approve the transaction.</Text>
            </GlassView>

            {/* Simulation controls */}
            <Text style={styles.simLabel}>UPI TESTING SIMULATION ACTIONS</Text>
            <View style={styles.simActionsRow}>
              <TouchableOpacity
                style={[styles.simBtn, { backgroundColor: Theme.colors.success }]}
                onPress={() => !processing && handleSimulatePayment('approve')}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.simBtnText}>Simulate Approval</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.simBtn, { backgroundColor: Theme.colors.danger }]}
                onPress={() => !processing && handleSimulatePayment('decline')}
                disabled={processing}
              >
                <Text style={styles.simBtnText}>Simulate Decline</Text>
              </TouchableOpacity>
            </View>
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
  summaryCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
  },
  summaryValue: {
    fontSize: 26,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.secondary,
    marginTop: 2,
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
  formDesc: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    lineHeight: 16,
  },
  inputGroup: {
    gap: 4,
    marginTop: 4,
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
  actionBtn: {
    height: 40,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  timerCard: {
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.xs,
  },
  timerValue: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.warning,
    marginTop: 4,
  },
  timerDesc: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.medium,
    textAlign: 'center',
  },
  instructionCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 6,
  },
  instructionHeading: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    lineHeight: 18,
  },
  simLabel: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 10,
  },
  simActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  simBtn: {
    flex: 1,
    height: 40,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
});
