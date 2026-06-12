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

export default function PayoutsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [holderName, setHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [ifsc, setIfsc] = useState('');

  // Mock payout history
  const payoutHistory = [
    { id: 'pay-1', amount: 24500, date: '2026-05-20', acc: 'xxxx4512', status: 'completed' },
    { id: 'pay-2', amount: 15400, date: '2026-04-15', acc: 'xxxx4512', status: 'completed' },
    { id: 'pay-3', amount: 8900, date: '2026-03-10', acc: 'xxxx9821', status: 'completed' },
  ];

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    setLoading(true);
    // Simulate loading saved bank account details
    setTimeout(() => {
      setHolderName('Beatwave Events Private Limited');
      setBankName('HDFC Bank');
      setAccountNum('50100452189421');
      setIfsc('HDFC0000241');
      setLoading(false);
    }, 800);
  };

  const handleSaveDetails = () => {
    if (!holderName.trim() || !bankName.trim() || !accountNum.trim() || !ifsc.trim()) {
      Alert.alert('Validation Error', 'Please complete all banking input fields.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Success', 'Payout banking configurations saved successfully.');
    }, 1000);
  };

  const handleRequestPayout = () => {
    Alert.alert(
      'Payout Requested',
      'Your pending balance of ₹12,450 has been queued for transfer. Standard processing completes in 2-3 business days.'
    );
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
        <Text style={styles.headerTitle}>Bank Payouts</Text>
        <AppIcon name="creditcard.fill" size={18} tintColor={Theme.colors.success} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Earnings summary card */}
          <GlassView style={styles.earningsCard} intensity="medium">
            <View>
              <Text style={styles.earningsLabel}>PENDING BALANCE</Text>
              <Text style={styles.earningsValue}>₹12,450</Text>
            </View>
            <TouchableOpacity style={styles.payoutBtn} onPress={handleRequestPayout}>
              <Text style={styles.payoutBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </GlassView>

          {/* Form */}
          <GlassView style={styles.formCard} intensity="low">
            <Text style={styles.formTitle}>Banking Settings</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Holder Name</Text>
              <TextInput
                style={styles.textInput}
                value={holderName}
                onChangeText={setHolderName}
                placeholder="Full Name as in Bank Record"
                placeholderTextColor={Theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bank Name</Text>
              <TextInput
                style={styles.textInput}
                value={bankName}
                onChangeText={setBankName}
                placeholder="e.g. State Bank of India"
                placeholderTextColor={Theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.inputLabel}>Account Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={accountNum}
                  onChangeText={setAccountNum}
                  placeholder="Account Number"
                  placeholderTextColor={Theme.colors.textMuted}
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>IFSC Code</Text>
                <TextInput
                  style={styles.textInput}
                  value={ifsc}
                  onChangeText={setIfsc}
                  placeholder="IFSC Code"
                  placeholderTextColor={Theme.colors.textMuted}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveDetails} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Account Settings</Text>
              )}
            </TouchableOpacity>
          </GlassView>

          {/* History */}
          <Text style={styles.sectionLabel}>Payout History</Text>
          <View style={styles.historyList}>
            {payoutHistory.map(item => (
              <GlassView key={item.id} style={styles.historyCard} intensity="low">
                <View>
                  <Text style={styles.historyAmount}>₹{item.amount}</Text>
                  <Text style={styles.historyMeta}>
                    Transferred on {item.date} to {item.acc}
                  </Text>
                </View>
                <View style={styles.successBadge}>
                  <Text style={styles.successBadgeText}>Completed</Text>
                </View>
              </GlassView>
            ))}
          </View>
        </ScrollView>
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
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
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
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
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
  earningsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
  },
  earningsLabel: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.textMuted,
  },
  earningsValue: {
    fontSize: 26,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    marginTop: 2,
  },
  payoutBtn: {
    backgroundColor: Theme.colors.success,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.sm,
  },
  payoutBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
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
  saveBtn: {
    height: 40,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
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
  historyList: {
    gap: 10,
  },
  historyCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyAmount: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  historyMeta: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  successBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  successBadgeText: {
    fontSize: 10,
    color: Theme.colors.success,
    fontFamily: Theme.fonts.bold,
  },
});
