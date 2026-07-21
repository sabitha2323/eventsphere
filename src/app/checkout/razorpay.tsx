import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function RazorpayCheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const eventTitle = (params.eventTitle as string) || 'Neon Beats Music Festival';
  const price = parseFloat((params.price as string) || '1499');
  const quantity = parseInt((params.quantity as string) || '1', 10);

  const subtotal = price * quantity;
  const convenienceFee = 50;
  const gst = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + convenienceFee + gst;

  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('sabitha123@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('421');

  const [processing, setProcessing] = useState(false);

  const handleProcessPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      const razorpayPaymentId = `pay_Rzp${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      setProcessing(false);

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`🎉 Razorpay Payment Successful!\nPayment ID: ${razorpayPaymentId}\nAmount Paid: ₹${totalAmount}`);
        router.replace(`/checkout/receipt/order-${Date.now()}` as any);
      } else {
        Alert.alert(
          'Payment Successful!',
          `Razorpay ID: ${razorpayPaymentId}\nAmount Paid: ₹${totalAmount}`,
          [{ text: 'View Ticket', onPress: () => router.replace('/ticket/reg-987654321' as any) }]
        );
      }
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Razorpay Header */}
      <View style={styles.razorHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.brandGroup}>
          <Text style={styles.brandTitle}>Razorpay Pro</Text>
          <Text style={styles.brandSub}>Secure 256-Bit Encrypted Payment</Text>
        </View>
        <View style={styles.secureBadge}>
          <AppIcon name="lock.fill" size={14} tintColor="#10B981" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Order Summary Box */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{eventTitle}</Text>
          <Text style={styles.summarySub}>{quantity} Ticket(s) @ ₹{price} each</Text>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Convenience Fee</Text>
            <Text style={styles.summaryValue}>₹{convenienceFee}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (18%)</Text>
            <Text style={styles.summaryValue}>₹{gst}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>
        </View>

        {/* Payment Methods Selector */}
        <Text style={styles.sectionHeader}>Select Payment Method</Text>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, paymentMode === 'UPI' && styles.tabItemActive]}
            onPress={() => setPaymentMode('UPI')}
          >
            <Text style={[styles.tabText, paymentMode === 'UPI' && styles.tabTextActive]}>⚡ UPI Apps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, paymentMode === 'CARD' && styles.tabItemActive]}
            onPress={() => setPaymentMode('CARD')}
          >
            <Text style={[styles.tabText, paymentMode === 'CARD' && styles.tabTextActive]}>💳 Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, paymentMode === 'NETBANKING' && styles.tabItemActive]}
            onPress={() => setPaymentMode('NETBANKING')}
          >
            <Text style={[styles.tabText, paymentMode === 'NETBANKING' && styles.tabTextActive]}>🏦 NetBanking</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Form according to active tab */}
        <GlassView style={styles.formCard}>
          {paymentMode === 'UPI' && (
            <View>
              <Text style={styles.formLabel}>Instant UPI Payment</Text>
              <View style={styles.upiGrid}>
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app, idx) => (
                  <TouchableOpacity key={idx} style={styles.upiAppBtn}>
                    <Text style={styles.upiAppText}>{app}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.formLabel, { marginTop: Theme.spacing.md }]}>Or enter VPA / UPI ID</Text>
              <TextInput
                style={styles.input}
                value={upiId}
                onChangeText={setUpiId}
                placeholder="mobileNumber@upi"
                placeholderTextColor={Theme.colors.textMuted}
              />
            </View>
          )}

          {paymentMode === 'CARD' && (
            <View>
              <Text style={styles.formLabel}>Credit or Debit Card</Text>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                placeholder="Card Number"
              />
              <View style={styles.inputRow}>
                <View style={styles.inputCol}>
                  <Text style={styles.subLabel}>Expiry (MM/YY)</Text>
                  <TextInput
                    style={styles.input}
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                    placeholder="MM/YY"
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.subLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    secureTextEntry
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}

          {paymentMode === 'NETBANKING' && (
            <View>
              <Text style={styles.formLabel}>Select Bank</Text>
              <View style={styles.bankGrid}>
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank'].map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.bankBtn, selectedBank === b && styles.bankBtnActive]}
                    onPress={() => setSelectedBank(b)}
                  >
                    <Text style={[styles.bankBtnText, selectedBank === b && styles.bankBtnTextActive]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </GlassView>

        {/* Razorpay Submit Button */}
        <TouchableOpacity
          style={styles.payBtn}
          onPress={handleProcessPayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.payBtnText}>Pay ₹{totalAmount} via Razorpay</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C1A2C',
  },
  razorHeader: {
    backgroundColor: '#0C2340',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'web' ? Theme.spacing.md : Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backBtn: {
    padding: Theme.spacing.xs,
    marginRight: Theme.spacing.md,
  },
  brandGroup: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  secureBadge: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  summarySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: Theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  summaryValue: {
    fontSize: 12,
    color: '#E2E8F0',
    fontFamily: Theme.fonts.medium,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    color: '#38BDF8',
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: '#E2E8F0',
    marginBottom: Theme.spacing.sm,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: Theme.borderRadius.md,
    padding: 4,
    marginBottom: Theme.spacing.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.sm,
  },
  tabItemActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: Theme.fonts.medium,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontFamily: Theme.fonts.bold,
  },
  formCard: {
    backgroundColor: '#1E293B',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formLabel: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    marginBottom: Theme.spacing.sm,
  },
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  upiAppBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  upiAppText: {
    fontSize: 12,
    color: '#F8FAFC',
    fontFamily: Theme.fonts.medium,
  },
  input: {
    height: 44,
    backgroundColor: '#0F172A',
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  inputCol: {
    flex: 1,
  },
  subLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  bankGrid: {
    gap: 8,
  },
  bankBtn: {
    padding: Theme.spacing.md,
    backgroundColor: '#0F172A',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bankBtnActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#1E3A8A',
  },
  bankBtnText: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  bankBtnTextActive: {
    color: '#FFFFFF',
    fontFamily: Theme.fonts.bold,
  },
  payBtn: {
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
  payBtnText: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
});
