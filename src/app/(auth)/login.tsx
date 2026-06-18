import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Web-safe alert helper — Alert.alert is a no-op on web in some Expo versions
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
      console.log('[Login] Attempting sign-in for:', email.trim());
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('[Login] Auth error:', error.message);
        showAlert('Authentication Failed', error.message);
      } else if (data?.session) {
        console.log('[Login] Success — session obtained, redirecting...');
        // Explicitly navigate to tabs on success
        router.replace('/(tabs)');
      } else {
        console.warn('[Login] Sign-in returned no error but also no session.');
        showAlert('Login Issue', 'Sign-in succeeded but no session was returned. Please try again.');
      }
    } catch (err: any) {
      console.error('[Login] Unexpected error:', err);
      showAlert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showAlert(
        'Email Required',
        'Please enter your email address in the email field first, then tap Forgot Password.'
      );
      return;
    }

    // Safely resolve the redirect URL — Platform.select evaluates all branches in the
    // object literal form, so accessing window.location on native would throw a
    // ReferenceError. Compute the URL lazily instead.
    const getRedirectUrl = () => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return window.location.origin + '/reset-password';
      }
      return 'eventsphere://reset-password';
    };

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getRedirectUrl(),
      });

      if (error) {
        showAlert('Error', error.message);
      } else {
        showAlert(
          'Reset Link Sent',
          'A password reset link has been sent to your email.'
        );
      }
    } catch (err: any) {
      showAlert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.backgroundAccent1} />
        <View style={styles.backgroundAccent2} />

        <View style={styles.formWrapper}>
          <View style={styles.headerContainer}>
            <Text style={styles.logoText}>EventSphere</Text>
            <Text style={styles.taglineText}>
              Plan, Discover and Manage Events Effortlessly
            </Text>
          </View>

          <GlassView style={styles.card}>
            <Text style={styles.titleText}>Sign In</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <AppIcon
                    name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    tintColor={Theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </GlassView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  backgroundAccent1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124, 58, 237, 0.2)', // translucent purple
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 194, 255, 0.15)', // translucent cyan/blue
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  logoText: {
    fontSize: 36,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.primary,
    letterSpacing: 1,
    marginBottom: Theme.spacing.sm,
    ...Platform.select({
      web: {
        backgroundClip: 'text',
        backgroundImage: `linear-gradient(135deg, ${Theme.colors.primary}, ${Theme.colors.secondary})`,
        color: 'transparent',
      } as any,
    }),
  },
  taglineText: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  card: {
    width: '100%',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
  },
  titleText: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
  },
  input: {
    flex: 1,
    height: '100%',
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  eyeIcon: {
    padding: Theme.spacing.xs,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: Theme.spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.secondary,
  },
  loginButton: {
    height: 48,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Theme.spacing.lg,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.white,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
  },
  signUpLink: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.secondary,
    textDecorationLine: 'underline',
  },
});
