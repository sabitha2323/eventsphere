import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/models.dart';
import '../core/constants/app_constants.dart';

// ==================== MUHURTHAM SERVICE ====================
final muhurthamServiceProvider =
    Provider<MuhurthamService>((ref) => MuhurthamService());

class MuhurthamService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Get All Muhurtham Dates
  Stream<List<MuhurthamModel>> getAllMuhurthamDates() {
    return _firestore
        .collection(AppConstants.colMuhurtham)
        .orderBy('date')
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => MuhurthamModel.fromMap(d.data())).toList());
  }

  // Get Muhurtham Dates by Month/Year
  Future<List<MuhurthamModel>> getMuhurthamByMonthYear(
      int month, int year) async {
    final snapshot = await _firestore
        .collection(AppConstants.colMuhurtham)
        .where('month', isEqualTo: month)
        .where('year', isEqualTo: year)
        .orderBy('date')
        .get();

    return snapshot.docs
        .map((d) => MuhurthamModel.fromMap(d.data()))
        .toList();
  }

  // Get Upcoming Muhurtham Dates
  Future<List<MuhurthamModel>> getUpcomingMuhurthamDates(
      {int limit = 10}) async {
    final snapshot = await _firestore
        .collection(AppConstants.colMuhurtham)
        .where('date', isGreaterThanOrEqualTo: DateTime.now())
        .orderBy('date')
        .limit(limit)
        .get();

    return snapshot.docs
        .map((d) => MuhurthamModel.fromMap(d.data()))
        .toList();
  }

  // Add Muhurtham Date (Admin)
  Future<void> addMuhurthamDate(MuhurthamModel muhurtham) async {
    final docRef =
        _firestore.collection(AppConstants.colMuhurtham).doc();
    await docRef.set(muhurtham.copyWith(id: docRef.id).toMap());
  }

  // Delete Muhurtham Date (Admin)
  Future<void> deleteMuhurthamDate(String id) async {
    await _firestore
        .collection(AppConstants.colMuhurtham)
        .doc(id)
        .delete();
  }

  // Check if Date is Muhurtham
  Future<MuhurthamModel?> checkMuhurtham(DateTime date) async {
    final start = DateTime(date.year, date.month, date.day);
    final end = start.add(const Duration(days: 1));

    final snapshot = await _firestore
        .collection(AppConstants.colMuhurtham)
        .where('date', isGreaterThanOrEqualTo: start)
        .where('date', isLessThan: end)
        .get();

    if (snapshot.docs.isEmpty) return null;
    return MuhurthamModel.fromMap(snapshot.docs.first.data());
  }
}

extension MuhurthamModelCopyWith on MuhurthamModel {
  MuhurthamModel copyWith({
    String? id,
    DateTime? date,
    String? day,
    String? tamilMonth,
    int? month,
    int? year,
    String? notes,
    String? specialOccasion,
    bool? isAuspicious,
  }) {
    return MuhurthamModel(
      id: id ?? this.id,
      date: date ?? this.date,
      day: day ?? this.day,
      tamilMonth: tamilMonth ?? this.tamilMonth,
      month: month ?? this.month,
      year: year ?? this.year,
      notes: notes ?? this.notes,
      specialOccasion: specialOccasion ?? this.specialOccasion,
      isAuspicious: isAuspicious ?? this.isAuspicious,
    );
  }
}

// ==================== VENDOR SERVICE ====================
final vendorServiceProvider =
    Provider<VendorService>((ref) => VendorService());

class VendorService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Get All Vendors
  Stream<List<VendorModel>> getAllVendors({String? city, String? category}) {
    Query query = _firestore
        .collection(AppConstants.colVendors)
        .where('isVerified', isEqualTo: true);

    if (city != null && city.isNotEmpty) {
      query = query.where('city', isEqualTo: city);
    }
    if (category != null && category.isNotEmpty) {
      query = query.where('category', isEqualTo: category);
    }

    return query.snapshots().map((snap) =>
        snap.docs.map((d) => VendorModel.fromMap(d.data() as Map<String,dynamic>)).toList());
  }

  // Get Vendor by ID
  Future<VendorModel?> getVendorById(String vendorId) async {
    final doc = await _firestore
        .collection(AppConstants.colVendors)
        .doc(vendorId)
        .get();
    if (!doc.exists) return null;
    return VendorModel.fromMap(doc.data()!);
  }

  // Add Vendor
  Future<void> addVendor(VendorModel vendor) async {
    final docRef =
        _firestore.collection(AppConstants.colVendors).doc();
    final newVendor = VendorModel(
      vendorId: docRef.id,
      name: vendor.name,
      category: vendor.category,
      city: vendor.city,
      minPrice: vendor.minPrice,
      maxPrice: vendor.maxPrice,
      contactNumber: vendor.contactNumber,
      contactEmail: vendor.contactEmail,
      description: vendor.description,
      createdAt: DateTime.now(),
    );
    await docRef.set(newVendor.toMap());
  }
}

// ==================== REVIEW SERVICE ====================
final reviewServiceProvider =
    Provider<ReviewService>((ref) => ReviewService());

class ReviewService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Get Hall Reviews
  Stream<List<ReviewModel>> getHallReviews(String hallId) {
    return _firestore
        .collection(AppConstants.colReviews)
        .where('hallId', isEqualTo: hallId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => ReviewModel.fromMap(d.data())).toList());
  }

  // Add Review
  Future<void> addReview(ReviewModel review) async {
    final batch = _firestore.batch();

    // Add review
    final reviewRef =
        _firestore.collection(AppConstants.colReviews).doc();
    batch.set(reviewRef, review.copyWith(reviewId: reviewRef.id).toMap());

    // Update hall rating
    final hallRef =
        _firestore.collection(AppConstants.colHalls).doc(review.hallId);
    final reviews = await _firestore
        .collection(AppConstants.colReviews)
        .where('hallId', isEqualTo: review.hallId)
        .get();

    final totalRating = reviews.docs.fold<double>(
        0, (sum, d) => sum + (d.data()['rating'] as num).toDouble());
    final newCount = reviews.docs.length + 1;
    final newRating =
        (totalRating + review.rating) / newCount;

    batch.update(hallRef, {
      'rating': newRating,
      'reviewCount': newCount,
    });

    await batch.commit();
  }
}

extension ReviewModelCopyWith on ReviewModel {
  ReviewModel copyWith({
    String? reviewId,
    String? userId,
    String? userName,
    String? userImage,
    String? hallId,
    double? rating,
    String? comment,
    DateTime? createdAt,
    List<String>? imageUrls,
  }) {
    return ReviewModel(
      reviewId: reviewId ?? this.reviewId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userImage: userImage ?? this.userImage,
      hallId: hallId ?? this.hallId,
      rating: rating ?? this.rating,
      comment: comment ?? this.comment,
      createdAt: createdAt ?? this.createdAt,
      imageUrls: imageUrls ?? this.imageUrls,
    );
  }
}
