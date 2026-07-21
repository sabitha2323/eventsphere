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
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function RootLoginPortalDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        showAlert('Authentication Failed', error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      showAlert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />
      <View style={styles.backgroundAccent3} />

      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.logoGroup}>
          <Text style={styles.logoText}>EventSphere</Text>
          <Text style={styles.logoTag}>Portal & Login Dashboard</Text>
        </View>

        <TouchableOpacity
          style={styles.exploreNavBtn}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.exploreNavBtnText}>Explore Dashboard →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroBadge}>✨ NEXT-GEN EVENT ECOSYSTEM PORTAL</Text>
          <Text style={styles.heroTitle}>Welcome to EventSphere</Text>
          <Text style={styles.heroSub}>
            Sign in to manage your tickets, access 3D Holographic VIP Passes, and explore 90+ live events!
          </Text>
        </View>

        {/* 2-Column Portal Dashboard */}
        <View style={styles.portalGrid}>
          {/* Left Column: Login Card */}
          <GlassView style={styles.loginCard} intensity="high">
            <Text style={styles.cardHeaderTitle}>🔑 Member & Admin Sign In</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="demo@eventsphere.com"
                placeholderTextColor={Theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                  <AppIcon name={showPassword ? 'eye.slash.fill' : 'eye.fill'} size={18} tintColor={Theme.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.signInBtn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.signInBtnText}>Sign In to Account</Text>}
            </TouchableOpacity>

            <View style={styles.demoGroup}>
              <Text style={styles.demoHeader}>OR 1-CLICK DEMO AUTHENTICATION</Text>

              <TouchableOpacity
                style={styles.demoUserBtn}
                onPress={() => {
                  setEmail('demo@eventsphere.com');
                  setPassword('password123');
                  router.replace('/(tabs)');
                }}
              >
                <Text style={styles.demoUserBtnText}>⚡ Demo User Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoAdminBtn}
                onPress={() => {
                  setEmail('admin@eventsphere.com');
                  setPassword('admin123');
                  router.replace('/(tabs)/admin' as any);
                }}
              >
                <Text style={styles.demoAdminBtnText}>👑 Demo Admin Sign In</Text>
              </TouchableOpacity>
            </View>
          </GlassView>

          {/* Right Column: Web App Overview & Direct Link */}
          <GlassView style={styles.overviewCard} intensity="high">
            <Text style={styles.cardHeaderTitle}>🌐 Main Web Application</Text>
            <Text style={styles.overviewDesc}>
              Experience our 1400px wide full desktop web application with 90+ events across 9 categories!
            </Text>

            <View style={styles.featureList}>
              {[
                { icon: 'creditcard.fill', title: 'Razorpay Pro Gateway', desc: 'UPI Apps, Cards & Instant Verification' },
                { icon: 'crown.fill', title: '3D Holographic VIP Pass', desc: 'Interactive metallic badges with QR Scanner' },
                { icon: 'sparkles', title: 'AI Event Concierge', desc: 'Smart Assistant for event recommendations' },
                { icon: 'ticket.fill', title: 'Interactive Seat Picker', desc: 'Stage map seat selection with tier pricing' },
              ].map((f, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <AppIcon name={f.icon} size={20} tintColor={Theme.colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureSub}>{f.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.enterAppBtn}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.enterAppBtnText}>Enter Main Web Application Dashboard →</Text>
            </TouchableOpacity>
          </GlassView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B19',
    ...Platform.select({
      web: {
        maxWidth: 1400,
        alignSelf: 'center',
        width: '100%',
      } as any,
    }),
  },
  backgroundAccent1: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(124, 58, 237, 0.35)',
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(6, 182, 212, 0.28)',
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined,
  },
  backgroundAccent3: {
    position: 'absolute',
    top: '40%',
    left: '35%',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(236, 72, 153, 0.20)',
    filter: Platform.OS === 'web' ? 'blur(110px)' : undefined,
  },
  navbar: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
  },
  logoGroup: {
    gap: 2,
  },
  logoText: {
    fontSize: 26,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  logoTag: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.medium,
  },
  exploreNavBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
  },
  exploreNavBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: Theme.spacing.xl,
    textAlign: 'center',
  },
  heroBadge: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    letterSpacing: 1,
    marginBottom: Theme.spacing.xs,
  },
  heroTitle: {
    fontSize: 36,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 15,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    maxWidth: 600,
    marginTop: Theme.spacing.xs,
    lineHeight: 22,
  },
  portalGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Theme.spacing.xl,
  },
  loginCard: {
    flex: 1,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  overviewCard: {
    flex: 1,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.15)',
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
    paddingBottom: Theme.spacing.sm,
  },
  inputGroup: {
    marginBottom: Theme.spacing.md,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  input: {
    height: 44,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 14,
    color: Theme.colors.text,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.md,
    paddingRight: 6,
  },
  signInBtn: {
    height: 48,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Theme.spacing.md,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
  },
  demoGroup: {
    gap: 8,
    marginTop: Theme.spacing.xs,
  },
  demoHeader: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  demoUserBtn: {
    height: 42,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoUserBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
  demoAdminBtn: {
    height: 42,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoAdminBtnText: {
    color: '#7C3AED',
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
  overviewDesc: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: Theme.spacing.lg,
  },
  featureList: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
    borderRadius: Theme.borderRadius.md,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  featureSub: {
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  enterAppBtn: {
    height: 50,
    backgroundColor: '#7C3AED',
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enterAppBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
  },
});
