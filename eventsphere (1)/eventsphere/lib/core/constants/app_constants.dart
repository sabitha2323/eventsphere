class AppConstants {
  // App Info
  static const String appName = 'EventSphere';
  static const String appVersion = '1.0.0';
  static const String appTagline = 'Your Perfect Wedding Venue Awaits';

  // Tamil Nadu Cities
  static const List<String> tamilNaduCities = [
    'Chennai',
    'Vellore',
    'Salem',
    'Dharmapuri',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Erode',
  ];

  // Karnataka Cities
  static const List<String> karnatakaCities = [
    'Bengaluru',
    'Mysuru',
  ];

  static List<String> get allCities => [...tamilNaduCities, ...karnatakaCities];

  // Venue Types
  static const List<String> venueTypes = [
    'Marriage Hall',
    'Convention Center',
    'Mandapam',
    'Resort',
    'Hotel Banquet',
    'Open Ground',
    'Community Hall',
  ];

  // Facilities
  static const List<String> facilities = [
    'AC',
    'Non-AC',
    'Parking',
    'Catering Kitchen',
    'Bridal Room',
    'Generator Backup',
    'CCTV',
    'Sound System',
    'Stage',
    'Guest Rooms',
    'Lawn',
    'Swimming Pool',
    'WiFi',
    'Valet Parking',
    'Elevator',
  ];

  // Vendor Categories
  static const List<String> vendorCategories = [
    'Photography',
    'Catering',
    'Decoration',
    'Makeup Artist',
    'DJ Services',
    'Band',
    'Mehendi Artist',
    'Event Planner',
    'Florist',
    'Invitation Cards',
  ];

  // Capacity Ranges
  static const List<Map<String, dynamic>> capacityRanges = [
    {'label': 'Small (< 200)', 'min': 0, 'max': 200},
    {'label': 'Medium (200-500)', 'min': 200, 'max': 500},
    {'label': 'Large (500-1000)', 'min': 500, 'max': 1000},
    {'label': 'Grand (1000+)', 'min': 1000, 'max': 99999},
  ];

  // Budget Ranges (in INR)
  static const List<Map<String, dynamic>> budgetRanges = [
    {'label': '< ₹50,000', 'min': 0, 'max': 50000},
    {'label': '₹50K - ₹1L', 'min': 50000, 'max': 100000},
    {'label': '₹1L - ₹2L', 'min': 100000, 'max': 200000},
    {'label': '₹2L - ₹5L', 'min': 200000, 'max': 500000},
    {'label': '₹5L+', 'min': 500000, 'max': 99999999},
  ];

  // Tamil Months
  static const List<String> tamilMonths = [
    'Chithirai',
    'Vaikasi',
    'Aani',
    'Aadi',
    'Aavani',
    'Purattasi',
    'Aippasi',
    'Karthigai',
    'Margazhi',
    'Thai',
    'Maasi',
    'Panguni',
  ];

  // User Roles
  static const String roleUser = 'user';
  static const String roleOwner = 'owner';
  static const String roleAdmin = 'admin';

  // Booking Status
  static const String bookingPending = 'pending';
  static const String bookingConfirmed = 'confirmed';
  static const String bookingRejected = 'rejected';
  static const String bookingCancelled = 'cancelled';
  static const String bookingCompleted = 'completed';

  // Hall Status
  static const String hallPending = 'pending';
  static const String hallVerified = 'verified';
  static const String hallRejected = 'rejected';
  static const String hallSuspended = 'suspended';

  // Firestore Collections
  static const String colUsers = 'users';
  static const String colHalls = 'halls';
  static const String colBookings = 'bookings';
  static const String colMuhurtham = 'muhurtham_dates';
  static const String colVendors = 'vendors';
  static const String colReviews = 'reviews';
  static const String colNotifications = 'notifications';
  static const String colComplaints = 'complaints';

  // Storage Paths
  static const String storageHalls = 'halls';
  static const String storageUsers = 'users';
  static const String storageVendors = 'vendors';

  // Google Maps
  static const String googleMapsApiKey = 'YOUR_GOOGLE_MAPS_API_KEY';

  // Pagination
  static const int pageSize = 10;

  // Cache Duration
  static const Duration cacheDuration = Duration(hours: 1);
}
