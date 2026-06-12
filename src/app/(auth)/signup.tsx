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

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    // Validations
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    // Phone validation (simple check)
    const phoneRegex = /^[0-9+\-\s()]{8,15}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up user via Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: fullName.trim(),
            phone: phone.trim(),
            role: 'user', // default user role
          },
        },
      });

      if (authError) {
        Alert.alert('Registration Failed', authError.message);
        return;
      }

      if (data?.user) {
        const userId = data.user.id;
        
        // 2. Perform fallback manual write to public.users (in case database trigger fails or is delayed)
        const { error: dbError } = await supabase.from('users').upsert({
          id: userId,
          name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role: 'user',
        });

        if (dbError) {
          console.warn('Profile write fallback error:', dbError.message);
        }

        // 3. Create a welcoming notification record
        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Welcome to EventSphere!',
          message: `Hey ${fullName.split(' ')[0]}, welcome to EventSphere! Plan, discover, and manage your events effortlessly.`,
          read: false,
        });

        // 4. Alert user about email verification if session is not immediately available
        if (data.session) {
          Alert.alert('Success', 'Account created successfully!');
          // Root layout will redirect automatically
        } else {
          Alert.alert(
            'Verification Required',
            'Please check your inbox for an email verification link to complete registration.',
            [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
          );
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
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
            <Text style={styles.taglineText}>Create your account to get started</Text>
          </View>

          <GlassView style={styles.card}>
            <Text style={styles.titleText}>Sign Up</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="john.doe@example.com"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min 6 characters"
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Repeat your password"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <AppIcon
                    name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    tintColor={Theme.colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
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
    paddingVertical: Theme.spacing.xxl,
  },
  backgroundAccent1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 194, 255, 0.12)',
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
    fontSize: 32,
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
  signupButton: {
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
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  signupButtonText: {
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
  loginLink: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.secondary,
    textDecorationLine: 'underline',
  },
});
