import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:io';

import '../models/models.dart';
import '../core/constants/app_constants.dart';

final hallServiceProvider = Provider<HallService>((ref) => HallService());

class HallService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;

  // Get All Verified Halls
  Stream<List<HallModel>> getAllHalls() {
    return _firestore
        .collection(AppConstants.colHalls)
        .where('status', isEqualTo: AppConstants.hallVerified)
        .where('isVerified', isEqualTo: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => HallModel.fromMap(d.data())).toList());
  }

  // Get Hall by ID
  Future<HallModel?> getHallById(String hallId) async {
    final doc = await _firestore
        .collection(AppConstants.colHalls)
        .doc(hallId)
        .get();
    if (!doc.exists) return null;
    return HallModel.fromMap(doc.data()!);
  }

  // Search Halls with Filters
  Future<List<HallModel>> searchHalls(SearchFilter filter) async {
    Query query = _firestore
        .collection(AppConstants.colHalls)
        .where('status', isEqualTo: AppConstants.hallVerified)
        .where('isVerified', isEqualTo: true);

    if (filter.city != null && filter.city!.isNotEmpty) {
      query = query.where('city', isEqualTo: filter.city);
    }
    if (filter.hasAC != null) {
      query = query.where('hasAC', isEqualTo: filter.hasAC);
    }
    if (filter.hasParking != null) {
      query = query.where('hasParking', isEqualTo: filter.hasParking);
    }
    if (filter.minCapacity != null) {
      query =
          query.where('capacity', isGreaterThanOrEqualTo: filter.minCapacity);
    }
    if (filter.maxCapacity != null) {
      query =
          query.where('capacity', isLessThanOrEqualTo: filter.maxCapacity);
    }

    final snapshot = await query.get();
    List<HallModel> halls =
        snapshot.docs.map((d) => HallModel.fromMap(d.data() as Map<String,dynamic>)).toList();

    // Client side filters
    if (filter.minPrice != null) {
      halls = halls
          .where((h) => h.pricePerDay >= filter.minPrice!)
          .toList();
    }
    if (filter.maxPrice != null) {
      halls = halls
          .where((h) => h.pricePerDay <= filter.maxPrice!)
          .toList();
    }
    if (filter.query != null && filter.query!.isNotEmpty) {
      final q = filter.query!.toLowerCase();
      halls = halls
          .where((h) =>
              h.hallName.toLowerCase().contains(q) ||
              h.city.toLowerCase().contains(q) ||
              h.address.toLowerCase().contains(q))
          .toList();
    }

    // Sort
    switch (filter.sortBy) {
      case 'price_asc':
        halls.sort((a, b) => a.pricePerDay.compareTo(b.pricePerDay));
        break;
      case 'price_desc':
        halls.sort((a, b) => b.pricePerDay.compareTo(a.pricePerDay));
        break;
      case 'capacity':
        halls.sort((a, b) => b.capacity.compareTo(a.capacity));
        break;
      default:
        halls.sort((a, b) => b.rating.compareTo(a.rating));
    }

    return halls;
  }

  // Get Hall Bookings by Date
  Future<List<BookingModel>> getHallBookingsForDate(
      String hallId, DateTime date) async {
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

    return snapshot.docs
        .map((d) => BookingModel.fromMap(d.data()))
        .toList();
  }

  // Check Hall Availability
  Future<bool> isHallAvailable(String hallId, DateTime date) async {
    final bookings = await getHallBookingsForDate(hallId, date);
    return bookings.isEmpty;
  }

  // Get Available Halls for Date in City
  Future<List<HallModel>> getAvailableHalls(
      String city, DateTime date) async {
    final allHalls = await searchHalls(SearchFilter(city: city));
    final availableHalls = <HallModel>[];

    for (final hall in allHalls) {
      final available = await isHallAvailable(hall.hallId, date);
      if (available) availableHalls.add(hall);
    }

    return availableHalls;
  }

  // Get Booked Dates for a Hall
  Future<List<DateTime>> getBookedDates(String hallId) async {
    final snapshot = await _firestore
        .collection(AppConstants.colBookings)
        .where('hallId', isEqualTo: hallId)
        .where('bookingStatus', whereIn: ['pending', 'confirmed'])
        .get();

    return snapshot.docs
        .map((d) => (d.data()['eventDate'] as Timestamp).toDate())
        .toList();
  }

  // Add Hall
  Future<HallModel> addHall(HallModel hall) async {
    final docRef =
        _firestore.collection(AppConstants.colHalls).doc();
    final newHall = hall.copyWith(hallId: docRef.id);
    await docRef.set(newHall.toMap());
    return newHall;
  }

  // Update Hall
  Future<void> updateHall(HallModel hall) async {
    await _firestore
        .collection(AppConstants.colHalls)
        .doc(hall.hallId)
        .update(hall.toMap());
  }

  // Upload Hall Images
  Future<List<String>> uploadHallImages(
      String hallId, List<File> imageFiles) async {
    final urls = <String>[];
    for (int i = 0; i < imageFiles.length; i++) {
      final ref = _storage
          .ref()
          .child('${AppConstants.storageHalls}/$hallId/image_$i.jpg');
      await ref.putFile(imageFiles[i]);
      final url = await ref.getDownloadURL();
      urls.add(url);
    }
    return urls;
  }

  // Get Owner Halls
  Stream<List<HallModel>> getOwnerHalls(String ownerId) {
    return _firestore
        .collection(AppConstants.colHalls)
        .where('ownerId', isEqualTo: ownerId)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => HallModel.fromMap(d.data())).toList());
  }

  // Get Favorite Halls
  Future<List<HallModel>> getFavoriteHalls(List<String> hallIds) async {
    if (hallIds.isEmpty) return [];
    final futures = hallIds.map((id) => getHallById(id));
    final results = await Future.wait(futures);
    return results.whereType<HallModel>().toList();
  }

  // Verify Hall (Admin)
  Future<void> verifyHall(String hallId, bool approved) async {
    await _firestore.collection(AppConstants.colHalls).doc(hallId).update({
      'status': approved
          ? AppConstants.hallVerified
          : AppConstants.hallRejected,
      'isVerified': approved,
    });
  }

  // Get Popular Halls
  Future<List<HallModel>> getPopularHalls({int limit = 5}) async {
    final snapshot = await _firestore
        .collection(AppConstants.colHalls)
        .where('isVerified', isEqualTo: true)
        .orderBy('rating', descending: true)
        .limit(limit)
        .get();

    return snapshot.docs
        .map((d) => HallModel.fromMap(d.data()))
        .toList();
  }

  // Get Halls by City
  Future<List<HallModel>> getHallsByCity(String city) async {
    final snapshot = await _firestore
        .collection(AppConstants.colHalls)
        .where('city', isEqualTo: city)
        .where('isVerified', isEqualTo: true)
        .get();

    return snapshot.docs
        .map((d) => HallModel.fromMap(d.data()))
        .toList();
  }
}
