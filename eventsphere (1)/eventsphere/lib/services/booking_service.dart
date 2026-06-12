import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../models/models.dart';
import '../core/constants/app_constants.dart';

final bookingServiceProvider =
    Provider<BookingService>((ref) => BookingService());

class BookingService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final _uuid = const Uuid();

  // Create Booking
  Future<BookingModel> createBooking({
    required String userId,
    required String hallId,
    required String hallName,
    required String userName,
    required String userPhone,
    required DateTime eventDate,
    required double totalAmount,
    String bookingType = 'full_day',
    String? notes,
    bool isMuhurtham = false,
    String? muhurthamNote,
  }) async {
    // Check availability first
    final isAvailable = await _checkAvailability(hallId, eventDate);
    if (!isAvailable) {
      throw Exception(
          'Hall is not available on this date. Please choose another date.');
    }

    final bookingId = _uuid.v4();
    final qrData =
        'EVENTSPHERE-$bookingId-$hallId-${eventDate.toIso8601String()}';

    final booking = BookingModel(
      bookingId: bookingId,
      userId: userId,
      hallId: hallId,
      hallName: hallName,
      userName: userName,
      userPhone: userPhone,
      eventDate: eventDate,
      bookingStatus: AppConstants.bookingPending,
      totalAmount: totalAmount,
      bookingType: bookingType,
      createdAt: DateTime.now(),
      qrCode: qrData,
      notes: notes,
      isMuhurtham: isMuhurtham,
      muhurthamNote: muhurthamNote,
    );

    await _firestore
        .collection(AppConstants.colBookings)
        .doc(bookingId)
        .set(booking.toMap());

    return booking;
  }

  // Check availability
  Future<bool> _checkAvailability(String hallId, DateTime date) async {
    final start = DateTime(date.year, date.month, date.day);
    final end = start.add(const Duration(days: 1));

    final snapshot = await _firestore
        .collection(AppConstants.colBookings)
        .where('hallId', isEqualTo: hallId)
        .where('eventDate',
            isGreaterThanOrEqualTo: Timestamp.fromDate(start))
        .where('eventDate', isLessThan: Timestamp.fromDate(end))
        .where('bookingStatus', whereIn: ['pending', 'confirmed'])
        .get();

    return snapshot.docs.isEmpty;
  }

  // Get User Bookings
  Stream<List<BookingModel>> getUserBookings(String userId) {
    return _firestore
        .collection(AppConstants.colBookings)
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => BookingModel.fromMap(d.data())).toList());
  }

  // Get Hall Bookings (Owner)
  Stream<List<BookingModel>> getHallBookings(String hallId) {
    return _firestore
        .collection(AppConstants.colBookings)
        .where('hallId', isEqualTo: hallId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => BookingModel.fromMap(d.data())).toList());
  }

  // Get All Bookings (Admin)
  Stream<List<BookingModel>> getAllBookings() {
    return _firestore
        .collection(AppConstants.colBookings)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => BookingModel.fromMap(d.data())).toList());
  }

  // Update Booking Status
  Future<void> updateBookingStatus(
      String bookingId, String status) async {
    await _firestore
        .collection(AppConstants.colBookings)
        .doc(bookingId)
        .update({'bookingStatus': status});
  }

  // Cancel Booking
  Future<void> cancelBooking(String bookingId) async {
    await updateBookingStatus(
        bookingId, AppConstants.bookingCancelled);
  }

  // Get Booking by ID
  Future<BookingModel?> getBookingById(String bookingId) async {
    final doc = await _firestore
        .collection(AppConstants.colBookings)
        .doc(bookingId)
        .get();
    if (!doc.exists) return null;
    return BookingModel.fromMap(doc.data()!);
  }
}
