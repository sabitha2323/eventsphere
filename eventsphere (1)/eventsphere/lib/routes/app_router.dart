import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../screens/auth/splash_screen.dart';
import '../screens/auth/onboarding_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/search/search_screen.dart';
import '../screens/hall_details/hall_details_screen.dart';
import '../screens/booking/booking_screen.dart';
import '../screens/booking/booking_confirmation_screen.dart';
import '../screens/muhurtham/muhurtham_screen.dart';
import '../screens/favorites/favorites_screen.dart';
import '../screens/vendor/vendor_marketplace_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/owner/owner_dashboard_screen.dart';
import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/screens.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final user = FirebaseAuth.instance.currentUser;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register' ||
          state.matchedLocation == '/splash' ||
          state.matchedLocation == '/onboarding';

      if (user == null && !isAuthRoute) {
        return '/login';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return SearchScreen(initialFilter: extra);
        },
      ),
      GoRoute(
        path: '/hall/:hallId',
        builder: (context, state) {
          final hallId = state.pathParameters['hallId']!;
          return HallDetailsScreen(hallId: hallId);
        },
      ),
      GoRoute(
        path: '/booking/:hallId',
        builder: (context, state) {
          final hallId = state.pathParameters['hallId']!;
          final extra = state.extra as Map<String, dynamic>?;
          return BookingScreen(hallId: hallId, extra: extra);
        },
      ),
      GoRoute(
        path: '/booking-confirmation/:bookingId',
        builder: (context, state) {
          final bookingId = state.pathParameters['bookingId']!;
          return BookingConfirmationScreen(bookingId: bookingId);
        },
      ),
      GoRoute(
        path: '/muhurtham',
        builder: (context, state) => const MuhurthamScreen(),
      ),
      GoRoute(
        path: '/favorites',
        builder: (context, state) => const FavoritesScreen(),
      ),
      GoRoute(
        path: '/vendors',
        builder: (context, state) => const VendorMarketplaceScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/owner-dashboard',
        builder: (context, state) => const OwnerDashboardScreen(),
      ),
      GoRoute(
        path: '/admin-dashboard',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/checkout/select-tickets/:hallId',
        builder: (context, state) {
          final hallId = state.pathParameters['hallId']!;
          return SelectTicketsScreen(hallId: hallId);
        },
      ),
      GoRoute(
        path: '/checkout/billing-details',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return BillingDetailsScreen(bookingData: extra);
        },
      ),
      GoRoute(
        path: '/checkout/payment-method',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return PaymentMethodScreen(billingData: extra);
        },
      ),
      GoRoute(
        path: '/checkout/card-input',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return CardInputScreen(paymentData: extra);
        },
      ),
      GoRoute(
        path: '/checkout/upi-sim',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return UpiSimScreen(paymentData: extra);
        },
      ),
      GoRoute(
        path: '/checkout/success',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return SuccessScreen(bookingData: extra);
        },
      ),
      GoRoute(
        path: '/checkout/failed',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>;
          return FailedScreen(bookingData: extra);
        },
      ),
      GoRoute(
        path: '/checkout/receipt/:bookingId',
        builder: (context, state) {
          final bookingId = state.pathParameters['bookingId']!;
          final extra = state.extra as Map<String, dynamic>?;
          return ReceiptScreen(bookingId: bookingId, bookingData: extra);
        },
      ),
      GoRoute(
        path: '/organizer/analytics',
        builder: (context, state) => const OrganizerAnalyticsScreen(),
      ),
      GoRoute(
        path: '/organizer/attendees/:hallId',
        builder: (context, state) {
          final hallId = state.pathParameters['hallId']!;
          return OrganizerAttendeesScreen(hallId: hallId);
        },
      ),
      GoRoute(
        path: '/organizer/checkin/:hallId',
        builder: (context, state) {
          final hallId = state.pathParameters['hallId']!;
          return OrganizerCheckInScreen(hallId: hallId);
        },
      ),
      GoRoute(
        path: '/organizer/promocodes',
        builder: (context, state) => const OrganizerPromoCodesScreen(),
      ),
      GoRoute(
        path: '/social/chat/:hallId',
        builder: (context, state) {
          final hallId = state.pathParameters['hallId']!;
          return SocialChatScreen(hallId: hallId);
        },
      ),
      GoRoute(
        path: '/ticket/refund/:bookingId',
        builder: (context, state) {
          final bookingId = state.pathParameters['bookingId']!;
          return TicketRefundScreen(bookingId: bookingId);
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.error}'),
      ),
    ),
  );
});
