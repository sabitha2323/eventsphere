import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function BillingDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { eventId, total, ticketCount, tierName, discount } = params;

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingEmail, setBillingEmail] = useState('');

  const handleSaveBilling = () => {
    if (!companyName.trim() || !gstin.trim() || !billingAddress.trim()) {
      Alert.alert('Validation Error', 'Please fill in Company Name, GSTIN, and Billing Address.');
      return;
    }

    // Basic GSTIN validation format check (15 chars)
    if (gstin.trim().length !== 15) {
      Alert.alert('Invalid GSTIN', 'A valid GSTIN number must be exactly 15 characters long.');
      return;
    }

    Alert.alert(
      'Billing Saved',
      'Corporate GST details registered successfully. Your invoice will be generated with these details.',
      [
        {
          text: 'Proceed to Payment',
          onPress: () => {
            // Redirect back to select payment methods carrying along updated billing details if needed
            router.push({
              pathname: '/checkout/payment-method',
              params: {
                eventId,
                total,
                ticketCount,
                tierName,
                discount,
                billingRegistered: 'true',
                companyName: companyName.trim(),
              }
            } as any);
          }
        }
      ]
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
        <Text style={styles.headerTitle}>Corporate Billing</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Help Info card */}
        <GlassView style={styles.infoCard} intensity="low">
          <AppIcon name="building.2.fill" size={18} tintColor={Theme.colors.secondary} />
          <Text style={styles.infoText}>
            Claim tax credits by registering your business GSTIN. Invoices will automatically be dispatched to your billing email post-transaction.
          </Text>
        </GlassView>

        {/* Billing Form */}
        <GlassView style={styles.formCard} intensity="medium">
          <Text style={styles.formTitle}>Business GST Invoice Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Company Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Beatwave Solutions Private Limited"
              placeholderTextColor={Theme.colors.textMuted}
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GSTIN (15-Digit Number) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 33AAAAA0000A1Z1"
              placeholderTextColor={Theme.colors.textMuted}
              value={gstin}
              onChangeText={setGstin}
              autoCapitalize="characters"
              maxLength={15}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Registered Office Address *</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Company Billing Address"
              placeholderTextColor={Theme.colors.textMuted}
              value={billingAddress}
              onChangeText={setBillingAddress}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Billing Email Address (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="billing@company.com"
              placeholderTextColor={Theme.colors.textMuted}
              value={billingEmail}
              onChangeText={setBillingEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBilling}>
            <Text style={styles.saveBtnText}>Save & Proceed</Text>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    lineHeight: 16,
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
  multilineInput: {
    height: 60,
    paddingVertical: 6,
    textAlignVertical: 'top',
  },
  saveBtn: {
    height: 40,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
});
