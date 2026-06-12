// seed_data.js
// Run this script with Node.js to populate sample data in Firestore
// Usage: node seed_data.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ==================== SAMPLE HALLS ====================
const halls = [
  {
    hallId: 'hall_001',
    hallName: 'Sri Venkateswara Marriage Hall',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    address: '42, Anna Nagar Main Road, Chennai - 600040',
    capacity: 500,
    pricePerDay: 75000,
    pricePerHalf: 40000,
    description: 'A grand marriage hall with world-class amenities, perfect for large weddings and events. Features modern décor, premium catering services, and ample parking space.',
    latitude: 13.0827,
    longitude: 80.2707,
    rating: 4.5,
    reviewCount: 28,
    ownerId: 'owner_001',
    imageUrls: [],
    facilities: ['Bridal Room', 'Generator Backup', 'CCTV', 'Sound System', 'Stage', 'Lawn'],
    venueType: 'Marriage Hall',
    hasAC: true,
    hasParking: true,
    contactPhone: '9876543210',
    contactEmail: 'info@srivenkateswara.com',
    status: 'verified',
    isVerified: true,
    createdAt: admin.firestore.Timestamp.now(),
    ownerName: 'Rajesh Kumar'
  },
  {
    hallId: 'hall_002',
    hallName: 'Mahalakshmi Convention Centre',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    address: '15, T Nagar, Chennai - 600017',
    capacity: 1000,
    pricePerDay: 150000,
    pricePerHalf: 80000,
    description: 'Premium convention centre in the heart of T Nagar. Ideal for grand weddings, corporate events, and large gatherings.',
    latitude: 13.0418,
    longitude: 80.2341,
    rating: 4.8,
    reviewCount: 45,
    ownerId: 'owner_002',
    imageUrls: [],
    facilities: ['Bridal Room', 'Guest Rooms', 'Generator Backup', 'Catering Kitchen', 'Stage', 'Lawn', 'Valet Parking'],
    venueType: 'Convention Center',
    hasAC: true,
    hasParking: true,
    contactPhone: '9876543211',
    contactEmail: 'info@mahalakshmi.com',
    status: 'verified',
    isVerified: true,
    createdAt: admin.firestore.Timestamp.now(),
    ownerName: 'Suresh Babu'
  },
  {
    hallId: 'hall_003',
    hallName: 'Lakshmi Mandapam',
    city: 'Madurai',
    district: 'Madurai',
    state: 'Tamil Nadu',
    address: '88, Simakkal, Madurai - 625001',
    capacity: 300,
    pricePerDay: 45000,
    pricePerHalf: 25000,
    description: 'Traditional mandapam with a touch of culture. Perfect for traditional Tamil weddings with all modern facilities.',
    latitude: 9.9252,
    longitude: 78.1198,
    rating: 4.2,
    reviewCount: 18,
    ownerId: 'owner_003',
    imageUrls: [],
    facilities: ['Stage', 'Sound System', 'Generator Backup'],
    venueType: 'Mandapam',
    hasAC: false,
    hasParking: true,
    contactPhone: '9876543212',
    contactEmail: '',
    status: 'verified',
    isVerified: true,
    createdAt: admin.firestore.Timestamp.now(),
    ownerName: 'Murugan'
  },
  {
    hallId: 'hall_004',
    hallName: 'Royal Garden Palace',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    address: '12, Whitefield Road, Bengaluru - 560066',
    capacity: 800,
    pricePerDay: 200000,
    pricePerHalf: 110000,
    description: 'Luxurious wedding palace with lush gardens, top-tier catering, and elegant interiors. The perfect venue for royal weddings.',
    latitude: 12.9716,
    longitude: 77.5946,
    rating: 4.9,
    reviewCount: 62,
    ownerId: 'owner_004',
    imageUrls: [],
    facilities: ['Bridal Room', 'Guest Rooms', 'Generator Backup', 'CCTV', 'Sound System', 'Stage', 'Lawn', 'Swimming Pool', 'WiFi', 'Valet Parking'],
    venueType: 'Resort',
    hasAC: true,
    hasParking: true,
    contactPhone: '9876543213',
    contactEmail: 'info@royalgarden.com',
    status: 'verified',
    isVerified: true,
    createdAt: admin.firestore.Timestamp.now(),
    ownerName: 'Ramesh Shetty'
  },
  {
    hallId: 'hall_005',
    hallName: 'Kaveri Kalyana Mandapam',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    address: '34, RS Puram, Coimbatore - 641002',
    capacity: 400,
    pricePerDay: 55000,
    pricePerHalf: 30000,
    description: 'A beautiful mandapam by the Kaveri riverside. Elegant setting for traditional and modern weddings alike.',
    latitude: 11.0168,
    longitude: 76.9558,
    rating: 4.3,
    reviewCount: 22,
    ownerId: 'owner_005',
    imageUrls: [],
    facilities: ['Bridal Room', 'Stage', 'Sound System', 'Generator Backup', 'Catering Kitchen'],
    venueType: 'Marriage Hall',
    hasAC: true,
    hasParking: true,
    contactPhone: '9876543214',
    contactEmail: '',
    status: 'verified',
    isVerified: true,
    createdAt: admin.firestore.Timestamp.now(),
    ownerName: 'Senthilkumar'
  },
];

// ==================== MUHURTHAM DATES (2025-2026) ====================
const muhurthamDates = [
  { id: 'm001', date: new Date('2026-01-15'), day: 'Thursday', tamilMonth: 'Thai', month: 1, year: 2026, notes: 'Highly auspicious - Pongal season', specialOccasion: 'Pongal Month', isAuspicious: true },
  { id: 'm002', date: new Date('2026-01-22'), day: 'Thursday', tamilMonth: 'Thai', month: 1, year: 2026, notes: 'Auspicious Thursday', specialOccasion: '', isAuspicious: true },
  { id: 'm003', date: new Date('2026-02-12'), day: 'Thursday', tamilMonth: 'Maasi', month: 2, year: 2026, notes: 'Auspicious date', specialOccasion: '', isAuspicious: true },
  { id: 'm004', date: new Date('2026-02-19'), day: 'Thursday', tamilMonth: 'Maasi', month: 2, year: 2026, notes: '', specialOccasion: '', isAuspicious: true },
  { id: 'm005', date: new Date('2026-03-05'), day: 'Thursday', tamilMonth: 'Panguni', month: 3, year: 2026, notes: 'Panguni Uthiram - Very auspicious', specialOccasion: 'Panguni Uthiram', isAuspicious: true },
  { id: 'm006', date: new Date('2026-04-14'), day: 'Tuesday', tamilMonth: 'Chithirai', month: 4, year: 2026, notes: 'Tamil New Year - Highly auspicious', specialOccasion: 'Tamil New Year', isAuspicious: true },
  { id: 'm007', date: new Date('2026-04-23'), day: 'Thursday', tamilMonth: 'Chithirai', month: 4, year: 2026, notes: '', specialOccasion: '', isAuspicious: true },
  { id: 'm008', date: new Date('2026-05-07'), day: 'Thursday', tamilMonth: 'Vaikasi', month: 5, year: 2026, notes: 'Vaikasi Visakam', specialOccasion: 'Vaikasi Visakam', isAuspicious: true },
  { id: 'm009', date: new Date('2026-05-21'), day: 'Thursday', tamilMonth: 'Vaikasi', month: 5, year: 2026, notes: '', specialOccasion: '', isAuspicious: true },
  { id: 'm010', date: new Date('2026-06-04'), day: 'Thursday', tamilMonth: 'Aani', month: 6, year: 2026, notes: '', specialOccasion: '', isAuspicious: true },
];

// ==================== VENDORS ====================
const vendors = [
  {
    vendorId: 'v001',
    name: 'Pixel Perfect Photography',
    category: 'Photography',
    city: 'Chennai',
    minPrice: 25000,
    maxPrice: 75000,
    rating: 4.7,
    reviewCount: 35,
    contactNumber: '9876543220',
    contactEmail: 'info@pixelperfect.com',
    description: 'Professional wedding photography and videography. Candid and traditional shots.',
    imageUrls: [],
    isVerified: true,
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    vendorId: 'v002',
    name: 'Royal Feast Catering',
    category: 'Catering',
    city: 'Chennai',
    minPrice: 350,
    maxPrice: 800,
    rating: 4.5,
    reviewCount: 50,
    contactNumber: '9876543221',
    contactEmail: 'info@royalfeast.com',
    description: 'Traditional South Indian wedding catering. Authentic flavors, hygienic preparation.',
    imageUrls: [],
    isVerified: true,
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    vendorId: 'v003',
    name: 'Floral Dreams Decoration',
    category: 'Decoration',
    city: 'Chennai',
    minPrice: 20000,
    maxPrice: 150000,
    rating: 4.8,
    reviewCount: 28,
    contactNumber: '9876543222',
    contactEmail: '',
    description: 'Stunning floral decorations for weddings and events. Custom themes available.',
    imageUrls: [],
    isVerified: true,
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    vendorId: 'v004',
    name: 'Glam Studio Makeup',
    category: 'Makeup Artist',
    city: 'Madurai',
    minPrice: 8000,
    maxPrice: 25000,
    rating: 4.6,
    reviewCount: 42,
    contactNumber: '9876543223',
    contactEmail: '',
    description: 'Bridal makeup and styling. Traditional and modern looks.',
    imageUrls: [],
    isVerified: true,
    createdAt: admin.firestore.Timestamp.now(),
  },
];

async function seedData() {
  console.log('🌱 Starting data seed...');

  // Seed halls
  console.log('Adding halls...');
  for (const hall of halls) {
    await db.collection('halls').doc(hall.hallId).set(hall);
    console.log(`✅ Hall: ${hall.hallName}`);
  }

  // Seed muhurtham dates
  console.log('Adding muhurtham dates...');
  for (const date of muhurthamDates) {
    await db.collection('muhurtham_dates').doc(date.id).set({
      ...date,
      date: admin.firestore.Timestamp.fromDate(date.date),
    });
    console.log(`✅ Muhurtham: ${date.day} ${date.date.toDateString()}`);
  }

  // Seed vendors
  console.log('Adding vendors...');
  for (const vendor of vendors) {
    await db.collection('vendors').doc(vendor.vendorId).set(vendor);
    console.log(`✅ Vendor: ${vendor.name}`);
  }

  console.log('');
  console.log('🎉 Seed data added successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Create an admin user in Firebase Auth');
  console.log('2. Set role to "admin" in Firestore users collection');
  console.log('3. Login as admin to manage the platform');
  process.exit(0);
}

seedData().catch(console.error);
