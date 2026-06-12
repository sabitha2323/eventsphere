import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/models.dart';
import '../services/auth_service.dart';
import '../services/hall_service.dart';
import '../services/booking_service.dart';
import '../services/other_services.dart';

// ==================== AUTH PROVIDERS ====================
final userProfileProvider = FutureProvider.family<UserModel?, String>((ref, uid) async {
  return ref.read(authServiceProvider).getUserProfile(uid);
});

// ==================== HALL PROVIDERS ====================
final allHallsProvider = StreamProvider<List<HallModel>>((ref) {
  return ref.read(hallServiceProvider).getAllHalls();
});

final popularHallsProvider = FutureProvider<List<HallModel>>((ref) {
  return ref.read(hallServiceProvider).getPopularHalls();
});

final hallDetailProvider = FutureProvider.family<HallModel?, String>((ref, hallId) {
  return ref.read(hallServiceProvider).getHallById(hallId);
});

final hallsByOwnerProvider = StreamProvider.family<List<HallModel>, String>((ref, ownerId) {
  return ref.read(hallServiceProvider).getOwnerHalls(ownerId);
});

final hallsByCityProvider = FutureProvider.family<List<HallModel>, String>((ref, city) {
  return ref.read(hallServiceProvider).getHallsByCity(city);
});

final favoriteHallsProvider = FutureProvider.family<List<HallModel>, List<String>>((ref, hallIds) {
  return ref.read(hallServiceProvider).getFavoriteHalls(hallIds);
});

final bookedDatesProvider = FutureProvider.family<List<DateTime>, String>((ref, hallId) {
  return ref.read(hallServiceProvider).getBookedDates(hallId);
});

// ==================== SEARCH PROVIDERS ====================
final searchFilterProvider = StateProvider<SearchFilter>((ref) => const SearchFilter());

final searchResultsProvider = FutureProvider<List<HallModel>>((ref) {
  final filter = ref.watch(searchFilterProvider);
  return ref.read(hallServiceProvider).searchHalls(filter);
});

final availableHallsProvider = FutureProvider.family<List<HallModel>, Map<String, dynamic>>((ref, params) {
  final city = params['city'] as String;
  final date = params['date'] as DateTime;
  return ref.read(hallServiceProvider).getAvailableHalls(city, date);
});

// ==================== BOOKING PROVIDERS ====================
final userBookingsProvider = StreamProvider.family<List<BookingModel>, String>((ref, userId) {
  return ref.read(bookingServiceProvider).getUserBookings(userId);
});

final hallBookingsProvider = StreamProvider.family<List<BookingModel>, String>((ref, hallId) {
  return ref.read(bookingServiceProvider).getHallBookings(hallId);
});

final allBookingsProvider = StreamProvider<List<BookingModel>>((ref) {
  return ref.read(bookingServiceProvider).getAllBookings();
});

final bookingDetailProvider = FutureProvider.family<BookingModel?, String>((ref, bookingId) {
  return ref.read(bookingServiceProvider).getBookingById(bookingId);
});

// ==================== MUHURTHAM PROVIDERS ====================
final allMuhurthamProvider = StreamProvider<List<MuhurthamModel>>((ref) {
  return ref.read(muhurthamServiceProvider).getAllMuhurthamDates();
});

final upcomingMuhurthamProvider = FutureProvider<List<MuhurthamModel>>((ref) {
  return ref.read(muhurthamServiceProvider).getUpcomingMuhurthamDates();
});

final muhurthamByMonthProvider = FutureProvider.family<List<MuhurthamModel>, Map<String, int>>((ref, params) {
  return ref.read(muhurthamServiceProvider).getMuhurthamByMonthYear(
    params['month']!,
    params['year']!,
  );
});

// ==================== VENDOR PROVIDERS ====================
final vendorsProvider = StreamProvider.family<List<VendorModel>, Map<String, String?>>((ref, params) {
  return ref.read(vendorServiceProvider).getAllVendors(
    city: params['city'],
    category: params['category'],
  );
});

// ==================== REVIEW PROVIDERS ====================
final hallReviewsProvider = StreamProvider.family<List<ReviewModel>, String>((ref, hallId) {
  return ref.read(reviewServiceProvider).getHallReviews(hallId);
});

// ==================== UI STATE PROVIDERS ====================
final selectedCityProvider = StateProvider<String?>((ref) => null);
final selectedDateProvider = StateProvider<DateTime?>((ref) => null);
final compareHallsProvider = StateProvider<List<String>>((ref) => []);
final bottomNavIndexProvider = StateProvider<int>((ref) => 0);
