/**
 * Widget Tests – Authentication Screens
 * Covers: Login form validation, Registration form validation,
 * password toggle, forgot password flow, navigation links
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  Link: ({ children }: any) => children,
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { name: 'Test User' }, error: null }),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    }),
  },
}));

jest.mock('@/constants/theme', () => ({
  Theme: {
    colors: {
      primary: '#7C3AED',
      secondary: '#2563EB',
      background: '#FFFFFF',
      backgroundCard: '#F8FAFC',
      text: '#0F172A',
      textMuted: '#64748B',
      textSecondary: '#334155',
      white: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      glassBg: 'rgba(255,255,255,0.75)',
      glassBorder: 'rgba(15,23,42,0.08)',
    },
    fonts: { regular: 'sans-serif', medium: 'sans-serif', bold: 'sans-serif' },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    borderRadius: { sm: 6, md: 12, lg: 20, xl: 30, round: 9999 },
  },
}));

jest.mock('@/components/GlassView', () => ({
  GlassView: ({ children, style }: any) =>
    require('react-native').View({ style, children }),
}));

jest.mock('@/components/AppIcon', () => ({
  AppIcon: () => null,
}));

const { supabase } = require('@/lib/supabase');

// ─── LOGIN TESTS ──────────────────────────────────────────────────────────────
describe('LoginScreen', () => {
  let LoginScreen: any;

  beforeAll(async () => {
    const mod = await import('../../src/app/(auth)/login');
    LoginScreen = mod.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('renders login screen correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows error when fields are empty on submit', async () => {
    const { getByText } = render(<LoginScreen />);
    const loginBtn = getByText('Sign In');

    fireEvent.press(loginBtn);

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields.');
  });

  it('calls signInWithPassword with correct credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: {}, session: {} }, error: null });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'user@eventsphere.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@eventsphere.com',
        password: 'password123',
      });
    });
  });

  it('shows error message on failed login', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'wrong@test.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrongpass');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Authentication Failed', 'Invalid login credentials');
    });
  });

  it('shows alert when forgot password clicked without email', async () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Forgot Password?'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Email Required',
      expect.any(String)
    );
  });

  it('calls resetPasswordForEmail when forgot password with email', async () => {
    supabase.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'user@eventsphere.com');
    fireEvent.press(getByText('Forgot Password?'));

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@eventsphere.com',
        expect.any(Object)
      );
    });
  });
});

// ─── SIGNUP TESTS ─────────────────────────────────────────────────────────────
describe('SignupScreen', () => {
  let SignupScreen: any;

  beforeAll(async () => {
    const mod = await import('../../src/app/(auth)/signup');
    SignupScreen = mod.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('renders signup form correctly', () => {
    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    expect(getByPlaceholderText('John Doe')).toBeTruthy();
    expect(getByPlaceholderText('john.doe@example.com')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
  });

  it('shows validation error when fields are empty', () => {
    const { getByText } = render(<SignupScreen />);
    fireEvent.press(getByText('Create Account'));
    expect(Alert.alert).toHaveBeenCalledWith('Validation Error', 'Please fill in all fields.');
  });

  it('shows error when passwords do not match', () => {
    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('John Doe'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('john.doe@example.com'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('+91 98765 43210'), '9876543210');
    fireEvent.changeText(getByPlaceholderText('Min 6 characters'), 'password1');
    fireEvent.changeText(getByPlaceholderText('Repeat your password'), 'password2');
    fireEvent.press(getByText('Create Account'));
    expect(Alert.alert).toHaveBeenCalledWith('Validation Error', 'Passwords do not match.');
  });

  it('shows error when password is too short', () => {
    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('John Doe'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('john.doe@example.com'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('+91 98765 43210'), '9876543210');
    fireEvent.changeText(getByPlaceholderText('Min 6 characters'), '123');
    fireEvent.changeText(getByPlaceholderText('Repeat your password'), '123');
    fireEvent.press(getByText('Create Account'));
    expect(Alert.alert).toHaveBeenCalledWith('Validation Error', 'Password must be at least 6 characters long.');
  });

  it('calls signUp with correct data on successful form submit', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'new-user-id' }, session: { access_token: 'token' } },
      error: null,
    });
    supabase.from.mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    const { getByPlaceholderText, getByText } = render(<SignupScreen />);
    fireEvent.changeText(getByPlaceholderText('John Doe'), 'Test User');
    fireEvent.changeText(getByPlaceholderText('john.doe@example.com'), 'newuser@test.com');
    fireEvent.changeText(getByPlaceholderText('+91 98765 43210'), '9876543210');
    fireEvent.changeText(getByPlaceholderText('Min 6 characters'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Repeat your password'), 'password123');
    fireEvent.press(getByText('Create Account'));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'newuser@test.com' })
      );
    });
  });
});
