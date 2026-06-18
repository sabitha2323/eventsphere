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

export default function CheckoutFailedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { message } = params;

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Error Cross Ring Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconRingOuter}>
            <View style={styles.iconRingInner}>
              <AppIcon name="xmark" size={40} tintColor="#fff" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.subtitle}>
          We could not process your transaction. No funds were debited.
        </Text>

        {/* Error Details Card */}
        <GlassView style={styles.card} intensity="medium">
          <Text style={styles.cardTitle}>Reason for Failure</Text>
          <Text style={styles.errorText}>
            {message || 'Transaction was declined by the cardholder or UPI provider. Please verify your payment details, bank balance, or network connection.'}
          </Text>
        </GlassView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.back()}
          >
            <AppIcon name="arrow.counterclockwise" size={16} tintColor="#fff" />
            <Text style={styles.primaryBtnText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.secondaryBtnText}>Return to Home Dashboard</Text>
          </TouchableOpacity>
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
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: 80,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
    zIndex: -1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
    paddingBottom: 100,
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Theme.spacing.md,
  },
  iconRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRingInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.md,
    lineHeight: 20,
    marginTop: -8,
  },
  card: {
    width: '100%',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    gap: 12,
    marginVertical: Theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
    paddingBottom: 8,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginTop: Theme.spacing.md,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  secondaryBtn: {
    height: 48,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
});
