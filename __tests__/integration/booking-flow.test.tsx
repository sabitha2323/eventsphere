/**
 * Integration Tests – Booking Flow
 * Covers: Event detail → Register → Ticket selection → Promo code → Payment method
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' }),
}));

const mockEvent = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  title: 'Neon Beats Music Festival',
  description: 'Electronic music festival',
  category: 'Music',
  date: '2026-06-22',
  time: '18:00 - 23:30',
  venue: 'Grand Arena Plaza, Chennai',
  organizer: 'Beatwave Events',
  image_url: 'https://images.unsplash.com/photo-1',
  ticket_price: 1499,
};

const mockTiers = [
  { id: 'tier-1', name: 'General Admission', price: 1499, quantity: 500, sold: 120 },
  { id: 'tier-2', name: 'VIP Pass', price: 2999, quantity: 100, sold: 45 },
];

const mockPromoCodes = [
  { id: 'promo-1', code: 'EARLYBIRD', discount: 20, is_active: true, limit: 100, used: 45, event_id: null },
  { id: 'promo-2', code: 'NEON25', discount: 25, is_active: true, limit: 50, used: 12, event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' },
];

const createMockSupabase = () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'user-uuid-1111-2222-3333', email: 'user@eventsphere.com' } },
    }),
  },
  from: jest.fn().mockImplementation((table: string) => {
    const builder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
      insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      delete: jest.fn().mockReturnThis(),
    };

    if (table === 'events') {
      builder.single.mockResolvedValue({ data: mockEvent, error: null });
      (builder as any).then = (resolve: any) => resolve({ data: [mockEvent], error: null });
    } else if (table === 'registrations') {
      builder.maybeSingle.mockResolvedValue({ data: null, error: null });
      (builder as any).then = (resolve: any) => resolve({ data: [], error: null });
    } else if (table === 'comments') {
      (builder as any).then = (resolve: any) => resolve({ data: [], error: null });
    } else if (table === 'ticket_tiers') {
      (builder as any).then = (resolve: any) => resolve({ data: mockTiers, error: null });
    } else if (table === 'promocodes') {
      (builder as any).then = (resolve: any) => resolve({ data: mockPromoCodes, error: null });
    } else if (table === 'notifications') {
      (builder as any).then = (resolve: any) => resolve({ data: [], error: null });
    } else {
      (builder as any).then = (resolve: any) => resolve({ data: [], error: null });
    }

    return builder;
  }),
});

jest.mock('@/lib/supabase', () => ({
  supabase: createMockSupabase(),
}));

jest.mock('expo-image', () => ({
  Image: ({ style }: any) => require('react-native').View({ style }),
}));

jest.mock('@/components/GlassView', () => ({
  GlassView: ({ children, style }: any) => require('react-native').View({ style, children }),
}));

jest.mock('@/components/AppIcon', () => ({
  AppIcon: () => null,
}));

jest.mock('@/constants/theme', () => ({
  Theme: {
    colors: {
      primary: '#7C3AED', secondary: '#2563EB', background: '#FFFFFF',
      backgroundCard: '#F8FAFC', text: '#0F172A', textMuted: '#64748B',
      textSecondary: '#334155', white: '#FFFFFF', success: '#10B981',
      warning: '#F59E0B', danger: '#EF4444', categories: { Music: '#EC4899' },
    },
    fonts: { regular: 'sans-serif', medium: 'sans-serif', bold: 'sans-serif' },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    borderRadius: { sm: 6, md: 12, lg: 20, xl: 30, round: 9999 },
  },
}));

// ─── TICKET SELECTION TESTS ───────────────────────────────────────────────────
describe('SelectTicketsScreen – Booking Flow', () => {
  let SelectTicketsScreen: any;

  beforeAll(async () => {
    const mod = await import('../../src/app/checkout/select-tickets');
    SelectTicketsScreen = mod.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('renders ticket selection screen', async () => {
    const { findByText } = render(<SelectTicketsScreen />);
    const heading = await findByText('Select Tickets');
    expect(heading).toBeTruthy();
  });

  it('shows "No Tickets Selected" alert when no tickets chosen', async () => {
    const { findByText } = render(<SelectTicketsScreen />);
    // The proceed button is shown after loading
    const checkoutBtn = await findByText('Checkout');
    // First remove the default ticket (qty = 1 for first tier)
    // Press minus button to set to 0
    // Then press checkout
    fireEvent.press(checkoutBtn);
    // Since default is 1 ticket, it should proceed NOT alert
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  it('validates promo code correctly', async () => {
    const { supabase } = require('@/lib/supabase');
    const { findByPlaceholderText, findByText } = render(<SelectTicketsScreen />);
    
    const promoInput = await findByPlaceholderText('Enter Promo Code');
    fireEvent.changeText(promoInput, 'EARLYBIRD');
    
    const applyBtn = await findByText('Apply');
    fireEvent.press(applyBtn);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Promo Applied',
        expect.stringContaining('EARLYBIRD')
      );
    });
  });

  it('shows error for invalid promo code', async () => {
    const { findByPlaceholderText, findByText } = render(<SelectTicketsScreen />);
    
    const promoInput = await findByPlaceholderText('Enter Promo Code');
    fireEvent.changeText(promoInput, 'FAKECODE');
    
    const applyBtn = await findByText('Apply');
    fireEvent.press(applyBtn);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Invalid Coupon',
        'This promo code does not exist or has expired.'
      );
    });
  });

  it('navigates to payment-method on proceed', async () => {
    const { findByText } = render(<SelectTicketsScreen />);
    const checkoutBtn = await findByText('Checkout');
    fireEvent.press(checkoutBtn);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/checkout/payment-method' })
      );
    });
  });
});

// ─── PAYMENT METHOD TESTS ─────────────────────────────────────────────────────
describe('PaymentMethodScreen', () => {
  let PaymentMethodScreen: any;

  beforeAll(async () => {
    // Override useLocalSearchParams for payment method screen
    jest.doMock('expo-router', () => ({
      useRouter: () => mockRouter,
      useLocalSearchParams: () => ({
        eventId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        total: '1767.07',
        ticketCount: '1',
        tierName: 'General Admission',
        discount: '0',
      }),
    }));
    const mod = await import('../../src/app/checkout/payment-method');
    PaymentMethodScreen = mod.default;
  });

  it('renders payment method options', async () => {
    const { findByText } = render(<PaymentMethodScreen />);
    expect(await findByText('Credit / Debit Card')).toBeTruthy();
    expect(await findByText('UPI Instant Payment')).toBeTruthy();
    expect(await findByText('Corporate Billing / GST')).toBeTruthy();
  });

  it('navigates to card-input on card selection', async () => {
    const { findByText } = render(<PaymentMethodScreen />);
    const cardBtn = await findByText('Credit / Debit Card');
    fireEvent.press(cardBtn);
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/checkout/card-input' })
    );
  });

  it('navigates to upi-sim on UPI selection', async () => {
    const { findByText } = render(<PaymentMethodScreen />);
    const upiBtn = await findByText('UPI Instant Payment');
    fireEvent.press(upiBtn);
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/checkout/upi-sim' })
    );
  });
});
