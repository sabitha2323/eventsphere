# EventSphere – Smart Wedding Hall & Event Venue Booking Platform
### For Tamil Nadu & Karnataka

---

## 📱 Complete Setup Guide

This guide will take you from zero to a working Flutter app on your iPhone step-by-step.

---

## 🔧 STEP 1: Install Required Tools

### 1.1 Install Flutter
```bash
# Download Flutter SDK
https://docs.flutter.dev/get-started/install/macos

# Add to PATH (in ~/.zshrc or ~/.bash_profile)
export PATH="$PATH:[PATH_TO_FLUTTER]/flutter/bin"

# Verify installation
flutter doctor
```

### 1.2 Install Xcode (for iPhone)
- Download Xcode from Mac App Store
- Open Xcode → Preferences → Locations → Set Command Line Tools
- Accept license: `sudo xcodebuild -license`

### 1.3 Install CocoaPods
```bash
sudo gem install cocoapods
```

### 1.4 Install VS Code or Android Studio
- VS Code: https://code.visualstudio.com
- Install Flutter extension in VS Code

---

## 🔥 STEP 2: Firebase Setup

### 2.1 Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name it: `EventSphere`
4. Enable Google Analytics (optional)

### 2.2 Enable Firebase Services
In Firebase Console, enable these services:
- **Authentication** → Sign-in Methods → Enable: Email/Password, Google
- **Cloud Firestore** → Create database → Start in test mode
- **Firebase Storage** → Get started
- **Cloud Messaging** → Already enabled

### 2.3 Add iOS App to Firebase
1. Firebase Console → Project Settings → Add App → iOS
2. iOS Bundle ID: `com.eventsphere.app`
3. Download `GoogleService-Info.plist`
4. Place it in: `ios/Runner/GoogleService-Info.plist`

### 2.4 Add Android App to Firebase
1. Firebase Console → Add App → Android
2. Android package name: `com.eventsphere.app`
3. Download `google-services.json`
4. Place it in: `android/app/google-services.json`

### 2.5 Run FlutterFire Configure
```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# In your project folder
flutterfire configure --project=YOUR_FIREBASE_PROJECT_ID
```
This auto-generates `lib/firebase/firebase_options.dart` with your real config.

---

## 🗺️ STEP 3: Google Maps Setup

1. Go to https://console.cloud.google.com
2. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
   - Places API
3. Create API Key → Copy it
4. Replace `YOUR_GOOGLE_MAPS_API_KEY` in:
   - `ios/Runner/Info.plist`
   - `android/app/src/main/AndroidManifest.xml`
   - `lib/core/constants/app_constants.dart`

---

## 📦 STEP 4: Run the App

### 4.1 Install Dependencies
```bash
# Navigate to project folder
cd eventsphere

# Get all packages
flutter pub get
```

### 4.2 iOS Setup
```bash
# Install CocoaPods dependencies
cd ios
pod install
cd ..
```

### 4.3 Connect iPhone
1. Connect iPhone via USB cable
2. Trust the computer on your iPhone
3. In Xcode → open `ios/Runner.xcworkspace`
4. Select your iPhone as target device
5. Sign in with Apple ID in Xcode → Preferences → Accounts
6. Set Team in Runner → Signing & Capabilities

### 4.4 Run on iPhone
```bash
# List available devices
flutter devices

# Run on iPhone
flutter run -d [DEVICE_ID]

# Or run in release mode
flutter run --release
```

---

## 🌱 STEP 5: Add Sample Data

### 5.1 Install Node.js
Download from: https://nodejs.org

### 5.2 Download Service Account Key
1. Firebase Console → Project Settings → Service accounts
2. Generate new private key → Download JSON
3. Rename to `serviceAccountKey.json`
4. Place in project root

### 5.3 Run Seed Script
```bash
npm install firebase-admin
node seed_data.js
```

---

## 🔐 STEP 6: Firestore Security Rules

1. Firebase Console → Firestore → Rules
2. Copy content from `firestore.rules` file
3. Paste and click Publish

### 6.1 Firestore Indexes
1. Firebase Console → Firestore → Indexes
2. Or run: `firebase deploy --only firestore:indexes`
   (requires Firebase CLI: `npm install -g firebase-tools`)

---

## 👤 STEP 7: Create Admin Account

1. Register in the app with any email
2. Go to Firebase Console → Firestore → users collection
3. Find your user document
4. Change `role` field from `"user"` to `"admin"`
5. Login again → You'll be redirected to Admin Dashboard

---

## 📐 Database Structure

```
Firestore
├── users/
│   └── {userId}/
│       ├── userId: string
│       ├── name: string
│       ├── email: string
│       ├── phone: string
│       ├── role: "user" | "owner" | "admin"
│       ├── profileImage: string
│       ├── favoriteHalls: string[]
│       └── createdAt: timestamp
│
├── halls/
│   └── {hallId}/
│       ├── hallId: string
│       ├── hallName: string
│       ├── city: string
│       ├── district: string
│       ├── state: string
│       ├── address: string
│       ├── capacity: number
│       ├── pricePerDay: number
│       ├── pricePerHalf: number
│       ├── description: string
│       ├── latitude: number
│       ├── longitude: number
│       ├── rating: number
│       ├── reviewCount: number
│       ├── ownerId: string
│       ├── imageUrls: string[]
│       ├── facilities: string[]
│       ├── venueType: string
│       ├── hasAC: boolean
│       ├── hasParking: boolean
│       ├── contactPhone: string
│       ├── contactEmail: string
│       ├── status: "pending" | "verified" | "rejected"
│       └── isVerified: boolean
│
├── bookings/
│   └── {bookingId}/
│       ├── bookingId: string
│       ├── userId: string
│       ├── hallId: string
│       ├── hallName: string
│       ├── userName: string
│       ├── userPhone: string
│       ├── eventDate: timestamp
│       ├── bookingStatus: "pending" | "confirmed" | "rejected" | "cancelled"
│       ├── totalAmount: number
│       ├── bookingType: "full_day" | "half_day"
│       ├── qrCode: string
│       └── createdAt: timestamp
│
├── muhurtham_dates/
│   └── {id}/
│       ├── id: string
│       ├── date: timestamp
│       ├── day: string
│       ├── tamilMonth: string
│       ├── month: number
│       ├── year: number
│       ├── notes: string
│       └── specialOccasion: string
│
├── vendors/
│   └── {vendorId}/
│       ├── vendorId: string
│       ├── name: string
│       ├── category: string
│       ├── city: string
│       ├── minPrice: number
│       ├── maxPrice: number
│       ├── rating: number
│       ├── contactNumber: string
│       └── isVerified: boolean
│
└── reviews/
    └── {reviewId}/
        ├── reviewId: string
        ├── userId: string
        ├── userName: string
        ├── hallId: string
        ├── rating: number
        ├── comment: string
        └── createdAt: timestamp
```

---

## 🚀 Build for App Store (iOS)

```bash
# Build IPA
flutter build ipa

# Open in Xcode and upload to App Store Connect
open build/ios/archive/Runner.xcarchive
```

---

## 🤖 Build for Play Store (Android)

```bash
# Build App Bundle
flutter build appbundle --release

# APK for testing
flutter build apk --release
```

---

## ⚠️ Common Issues & Fixes

### CocoaPods error
```bash
sudo gem install cocoapods --pre
pod repo update
```

### Firebase not initialized
- Make sure `GoogleService-Info.plist` is in `ios/Runner/`
- Make sure file is added in Xcode → Runner → Copy Bundle Resources

### Google Sign-In not working on iOS
- Add `REVERSED_CLIENT_ID` from `GoogleService-Info.plist` to `Info.plist` URL Schemes

### Maps not showing
- Make sure Google Maps API key is correct
- Enable Maps SDK for iOS/Android in Google Cloud Console

---

## 📞 Project Structure

```
lib/
├── core/
│   ├── constants/app_constants.dart  → App config, cities, categories
│   └── theme/app_theme.dart          → Colors, fonts, UI theme
├── models/models.dart                 → Data models (User, Hall, Booking...)
├── services/
│   ├── auth_service.dart             → Firebase Auth
│   ├── hall_service.dart             → Hall CRUD operations
│   ├── booking_service.dart          → Booking creation & management
│   └── other_services.dart           → Muhurtham, Vendor, Review services
├── providers/providers.dart           → Riverpod state management
├── routes/app_router.dart             → GoRouter navigation
├── screens/
│   ├── auth/                         → Splash, Onboarding, Login, Register
│   ├── home/home_screen.dart          → Main home with bottom nav
│   ├── search/search_screen.dart      → Search with filters
│   ├── hall_details/                  → Hall details, availability, reviews
│   ├── booking/                       → Booking form + QR confirmation
│   ├── muhurtham/                     → Muhurtham calendar
│   ├── favorites/                     → Saved halls
│   ├── vendor/                        → Vendor marketplace
│   ├── profile/                       → User profile & booking history
│   ├── owner/                         → Hall owner dashboard
│   ├── admin/                         → Admin dashboard
│   └── notifications/                 → Push notifications
├── widgets/widgets.dart               → Reusable UI components
└── main.dart                          → App entry point
```

---

## 🎓 Final Year Project Report Notes

**Title:** EventSphere – Smart Wedding Hall & Event Venue Booking Platform

**Technology Stack:**
- Frontend: Flutter 3.x (Dart)
- Backend: Firebase (BaaS)
- Database: Cloud Firestore (NoSQL)
- Auth: Firebase Authentication
- Storage: Firebase Storage
- Notifications: Firebase Cloud Messaging
- Maps: Google Maps SDK
- State Management: Riverpod
- Architecture: Clean Architecture + MVVM

**Key Features:**
1. Multi-role authentication (User, Hall Owner, Admin)
2. Smart hall search with filters (city, capacity, price, AC, parking)
3. Muhurtham date calendar with Tamil month details
4. Real-time availability checking
5. QR code booking confirmation
6. Vendor marketplace (photography, catering, decoration...)
7. Push notifications
8. Admin dashboard with analytics
9. Hall owner management panel
10. Responsive UI for iOS, Android & Web

**Coverage:** Tamil Nadu (Chennai, Coimbatore, Madurai, Salem, Vellore, Tiruchirappalli, Erode, Dharmapuri) + Karnataka (Bengaluru, Mysuru)
