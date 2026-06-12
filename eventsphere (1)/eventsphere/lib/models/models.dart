import 'package:cloud_firestore/cloud_firestore.dart';

// ==================== USER MODEL ====================
class UserModel {
  final String userId;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String profileImage;
  final List<String> favoriteHalls;
  final DateTime createdAt;
  final bool isActive;

  const UserModel({
    required this.userId,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.profileImage = '',
    this.favoriteHalls = const [],
    required this.createdAt,
    this.isActive = true,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      userId: map['userId'] ?? '',
      name: map['name'] ?? '',
      email: map['email'] ?? '',
      phone: map['phone'] ?? '',
      role: map['role'] ?? 'user',
      profileImage: map['profileImage'] ?? '',
      favoriteHalls: List<String>.from(map['favoriteHalls'] ?? []),
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      isActive: map['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'profileImage': profileImage,
      'favoriteHalls': favoriteHalls,
      'createdAt': Timestamp.fromDate(createdAt),
      'isActive': isActive,
    };
  }

  UserModel copyWith({
    String? userId,
    String? name,
    String? email,
    String? phone,
    String? role,
    String? profileImage,
    List<String>? favoriteHalls,
    DateTime? createdAt,
    bool? isActive,
  }) {
    return UserModel(
      userId: userId ?? this.userId,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      profileImage: profileImage ?? this.profileImage,
      favoriteHalls: favoriteHalls ?? this.favoriteHalls,
      createdAt: createdAt ?? this.createdAt,
      isActive: isActive ?? this.isActive,
    );
  }
}

// ==================== HALL MODEL ====================
class HallModel {
  final String hallId;
  final String hallName;
  final String city;
  final String district;
  final String state;
  final String address;
  final int capacity;
  final double pricePerDay;
  final double? pricePerHalf;
  final String description;
  final double latitude;
  final double longitude;
  final double rating;
  final int reviewCount;
  final String ownerId;
  final List<String> imageUrls;
  final List<String> facilities;
  final String venueType;
  final bool hasAC;
  final bool hasParking;
  final String contactPhone;
  final String contactEmail;
  final String status;
  final DateTime createdAt;
  final bool isVerified;
  final String? ownerName;

  const HallModel({
    required this.hallId,
    required this.hallName,
    required this.city,
    required this.district,
    required this.state,
    required this.address,
    required this.capacity,
    required this.pricePerDay,
    this.pricePerHalf,
    required this.description,
    required this.latitude,
    required this.longitude,
    this.rating = 0.0,
    this.reviewCount = 0,
    required this.ownerId,
    this.imageUrls = const [],
    this.facilities = const [],
    required this.venueType,
    this.hasAC = false,
    this.hasParking = false,
    required this.contactPhone,
    this.contactEmail = '',
    this.status = 'pending',
    required this.createdAt,
    this.isVerified = false,
    this.ownerName,
  });

  factory HallModel.fromMap(Map<String, dynamic> map) {
    return HallModel(
      hallId: map['hallId'] ?? '',
      hallName: map['hallName'] ?? '',
      city: map['city'] ?? '',
      district: map['district'] ?? '',
      state: map['state'] ?? '',
      address: map['address'] ?? '',
      capacity: map['capacity'] ?? 0,
      pricePerDay: (map['pricePerDay'] ?? 0).toDouble(),
      pricePerHalf: map['pricePerHalf']?.toDouble(),
      description: map['description'] ?? '',
      latitude: (map['latitude'] ?? 0).toDouble(),
      longitude: (map['longitude'] ?? 0).toDouble(),
      rating: (map['rating'] ?? 0).toDouble(),
      reviewCount: map['reviewCount'] ?? 0,
      ownerId: map['ownerId'] ?? '',
      imageUrls: List<String>.from(map['imageUrls'] ?? []),
      facilities: List<String>.from(map['facilities'] ?? []),
      venueType: map['venueType'] ?? '',
      hasAC: map['hasAC'] ?? false,
      hasParking: map['hasParking'] ?? false,
      contactPhone: map['contactPhone'] ?? '',
      contactEmail: map['contactEmail'] ?? '',
      status: map['status'] ?? 'pending',
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      isVerified: map['isVerified'] ?? false,
      ownerName: map['ownerName'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'hallId': hallId,
      'hallName': hallName,
      'city': city,
      'district': district,
      'state': state,
      'address': address,
      'capacity': capacity,
      'pricePerDay': pricePerDay,
      'pricePerHalf': pricePerHalf,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
      'rating': rating,
      'reviewCount': reviewCount,
      'ownerId': ownerId,
      'imageUrls': imageUrls,
      'facilities': facilities,
      'venueType': venueType,
      'hasAC': hasAC,
      'hasParking': hasParking,
      'contactPhone': contactPhone,
      'contactEmail': contactEmail,
      'status': status,
      'createdAt': Timestamp.fromDate(createdAt),
      'isVerified': isVerified,
      'ownerName': ownerName,
    };
  }

  HallModel copyWith({
    String? hallId,
    String? hallName,
    String? city,
    String? district,
    String? state,
    String? address,
    int? capacity,
    double? pricePerDay,
    double? pricePerHalf,
    String? description,
    double? latitude,
    double? longitude,
    double? rating,
    int? reviewCount,
    String? ownerId,
    List<String>? imageUrls,
    List<String>? facilities,
    String? venueType,
    bool? hasAC,
    bool? hasParking,
    String? contactPhone,
    String? contactEmail,
    String? status,
    DateTime? createdAt,
    bool? isVerified,
    String? ownerName,
  }) {
    return HallModel(
      hallId: hallId ?? this.hallId,
      hallName: hallName ?? this.hallName,
      city: city ?? this.city,
      district: district ?? this.district,
      state: state ?? this.state,
      address: address ?? this.address,
      capacity: capacity ?? this.capacity,
      pricePerDay: pricePerDay ?? this.pricePerDay,
      pricePerHalf: pricePerHalf ?? this.pricePerHalf,
      description: description ?? this.description,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      ownerId: ownerId ?? this.ownerId,
      imageUrls: imageUrls ?? this.imageUrls,
      facilities: facilities ?? this.facilities,
      venueType: venueType ?? this.venueType,
      hasAC: hasAC ?? this.hasAC,
      hasParking: hasParking ?? this.hasParking,
      contactPhone: contactPhone ?? this.contactPhone,
      contactEmail: contactEmail ?? this.contactEmail,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      isVerified: isVerified ?? this.isVerified,
      ownerName: ownerName ?? this.ownerName,
    );
  }
}

// ==================== BOOKING MODEL ====================
class BookingModel {
  final String bookingId;
  final String userId;
  final String hallId;
  final String hallName;
  final String userName;
  final String userPhone;
  final DateTime eventDate;
  final String bookingStatus;
  final double totalAmount;
  final String bookingType; // full_day, half_day
  final DateTime createdAt;
  final String? qrCode;
  final String? notes;
  final bool isMuhurtham;
  final String? muhurthamNote;

  const BookingModel({
    required this.bookingId,
    required this.userId,
    required this.hallId,
    required this.hallName,
    required this.userName,
    required this.userPhone,
    required this.eventDate,
    required this.bookingStatus,
    required this.totalAmount,
    this.bookingType = 'full_day',
    required this.createdAt,
    this.qrCode,
    this.notes,
    this.isMuhurtham = false,
    this.muhurthamNote,
  });

  factory BookingModel.fromMap(Map<String, dynamic> map) {
    return BookingModel(
      bookingId: map['bookingId'] ?? '',
      userId: map['userId'] ?? '',
      hallId: map['hallId'] ?? '',
      hallName: map['hallName'] ?? '',
      userName: map['userName'] ?? '',
      userPhone: map['userPhone'] ?? '',
      eventDate: (map['eventDate'] as Timestamp?)?.toDate() ?? DateTime.now(),
      bookingStatus: map['bookingStatus'] ?? 'pending',
      totalAmount: (map['totalAmount'] ?? 0).toDouble(),
      bookingType: map['bookingType'] ?? 'full_day',
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      qrCode: map['qrCode'],
      notes: map['notes'],
      isMuhurtham: map['isMuhurtham'] ?? false,
      muhurthamNote: map['muhurthamNote'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'bookingId': bookingId,
      'userId': userId,
      'hallId': hallId,
      'hallName': hallName,
      'userName': userName,
      'userPhone': userPhone,
      'eventDate': Timestamp.fromDate(eventDate),
      'bookingStatus': bookingStatus,
      'totalAmount': totalAmount,
      'bookingType': bookingType,
      'createdAt': Timestamp.fromDate(createdAt),
      'qrCode': qrCode,
      'notes': notes,
      'isMuhurtham': isMuhurtham,
      'muhurthamNote': muhurthamNote,
    };
  }
}

// ==================== MUHURTHAM MODEL ====================
class MuhurthamModel {
  final String id;
  final DateTime date;
  final String day;
  final String tamilMonth;
  final int month;
  final int year;
  final String notes;
  final String specialOccasion;
  final bool isAuspicious;

  const MuhurthamModel({
    required this.id,
    required this.date,
    required this.day,
    required this.tamilMonth,
    required this.month,
    required this.year,
    this.notes = '',
    this.specialOccasion = '',
    this.isAuspicious = true,
  });

  factory MuhurthamModel.fromMap(Map<String, dynamic> map) {
    return MuhurthamModel(
      id: map['id'] ?? '',
      date: (map['date'] as Timestamp?)?.toDate() ?? DateTime.now(),
      day: map['day'] ?? '',
      tamilMonth: map['tamilMonth'] ?? '',
      month: map['month'] ?? 1,
      year: map['year'] ?? DateTime.now().year,
      notes: map['notes'] ?? '',
      specialOccasion: map['specialOccasion'] ?? '',
      isAuspicious: map['isAuspicious'] ?? true,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'date': Timestamp.fromDate(date),
      'day': day,
      'tamilMonth': tamilMonth,
      'month': month,
      'year': year,
      'notes': notes,
      'specialOccasion': specialOccasion,
      'isAuspicious': isAuspicious,
    };
  }
}

// ==================== VENDOR MODEL ====================
class VendorModel {
  final String vendorId;
  final String name;
  final String category;
  final String city;
  final double minPrice;
  final double maxPrice;
  final double rating;
  final int reviewCount;
  final String contactNumber;
  final String contactEmail;
  final String description;
  final List<String> imageUrls;
  final bool isVerified;
  final DateTime createdAt;

  const VendorModel({
    required this.vendorId,
    required this.name,
    required this.category,
    required this.city,
    required this.minPrice,
    required this.maxPrice,
    this.rating = 0.0,
    this.reviewCount = 0,
    required this.contactNumber,
    this.contactEmail = '',
    required this.description,
    this.imageUrls = const [],
    this.isVerified = false,
    required this.createdAt,
  });

  factory VendorModel.fromMap(Map<String, dynamic> map) {
    return VendorModel(
      vendorId: map['vendorId'] ?? '',
      name: map['name'] ?? '',
      category: map['category'] ?? '',
      city: map['city'] ?? '',
      minPrice: (map['minPrice'] ?? 0).toDouble(),
      maxPrice: (map['maxPrice'] ?? 0).toDouble(),
      rating: (map['rating'] ?? 0).toDouble(),
      reviewCount: map['reviewCount'] ?? 0,
      contactNumber: map['contactNumber'] ?? '',
      contactEmail: map['contactEmail'] ?? '',
      description: map['description'] ?? '',
      imageUrls: List<String>.from(map['imageUrls'] ?? []),
      isVerified: map['isVerified'] ?? false,
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'vendorId': vendorId,
      'name': name,
      'category': category,
      'city': city,
      'minPrice': minPrice,
      'maxPrice': maxPrice,
      'rating': rating,
      'reviewCount': reviewCount,
      'contactNumber': contactNumber,
      'contactEmail': contactEmail,
      'description': description,
      'imageUrls': imageUrls,
      'isVerified': isVerified,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}

// ==================== REVIEW MODEL ====================
class ReviewModel {
  final String reviewId;
  final String userId;
  final String userName;
  final String userImage;
  final String hallId;
  final double rating;
  final String comment;
  final DateTime createdAt;
  final List<String> imageUrls;

  const ReviewModel({
    required this.reviewId,
    required this.userId,
    required this.userName,
    this.userImage = '',
    required this.hallId,
    required this.rating,
    required this.comment,
    required this.createdAt,
    this.imageUrls = const [],
  });

  factory ReviewModel.fromMap(Map<String, dynamic> map) {
    return ReviewModel(
      reviewId: map['reviewId'] ?? '',
      userId: map['userId'] ?? '',
      userName: map['userName'] ?? '',
      userImage: map['userImage'] ?? '',
      hallId: map['hallId'] ?? '',
      rating: (map['rating'] ?? 0).toDouble(),
      comment: map['comment'] ?? '',
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      imageUrls: List<String>.from(map['imageUrls'] ?? []),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'reviewId': reviewId,
      'userId': userId,
      'userName': userName,
      'userImage': userImage,
      'hallId': hallId,
      'rating': rating,
      'comment': comment,
      'createdAt': Timestamp.fromDate(createdAt),
      'imageUrls': imageUrls,
    };
  }
}

// ==================== SEARCH FILTER MODEL ====================
class SearchFilter {
  final String? city;
  final String? venueType;
  final int? minCapacity;
  final int? maxCapacity;
  final double? minPrice;
  final double? maxPrice;
  final bool? hasAC;
  final bool? hasParking;
  final DateTime? date;
  final String? query;
  final String sortBy; // price_asc, price_desc, rating, capacity

  const SearchFilter({
    this.city,
    this.venueType,
    this.minCapacity,
    this.maxCapacity,
    this.minPrice,
    this.maxPrice,
    this.hasAC,
    this.hasParking,
    this.date,
    this.query,
    this.sortBy = 'rating',
  });

  SearchFilter copyWith({
    String? city,
    String? venueType,
    int? minCapacity,
    int? maxCapacity,
    double? minPrice,
    double? maxPrice,
    bool? hasAC,
    bool? hasParking,
    DateTime? date,
    String? query,
    String? sortBy,
  }) {
    return SearchFilter(
      city: city ?? this.city,
      venueType: venueType ?? this.venueType,
      minCapacity: minCapacity ?? this.minCapacity,
      maxCapacity: maxCapacity ?? this.maxCapacity,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      hasAC: hasAC ?? this.hasAC,
      hasParking: hasParking ?? this.hasParking,
      date: date ?? this.date,
      query: query ?? this.query,
      sortBy: sortBy ?? this.sortBy,
    );
  }
}

// ==================== NOTIFICATION MODEL ====================
class NotificationModel {
  final String id;
  final String userId;
  final String title;
  final String body;
  final String type;
  final Map<String, dynamic> data;
  final bool isRead;
  final DateTime createdAt;

  const NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.body,
    required this.type,
    this.data = const {},
    this.isRead = false,
    required this.createdAt,
  });

  factory NotificationModel.fromMap(Map<String, dynamic> map) {
    return NotificationModel(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      title: map['title'] ?? '',
      body: map['body'] ?? '',
      type: map['type'] ?? '',
      data: Map<String, dynamic>.from(map['data'] ?? {}),
      isRead: map['isRead'] ?? false,
      createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'body': body,
      'type': type,
      'data': data,
      'isRead': isRead,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
