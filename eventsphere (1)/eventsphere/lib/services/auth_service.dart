import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/models.dart';
import '../core/constants/app_constants.dart';

final authServiceProvider = Provider<AuthService>((ref) => AuthService());

final authStateProvider = StreamProvider<User?>((ref) {
  return FirebaseAuth.instance.authStateChanges();
});

final currentUserProvider = FutureProvider<UserModel?>((ref) async {
  final authState = ref.watch(authStateProvider);
  return authState.when(
    data: (user) async {
      if (user == null) return null;
      return ref.read(authServiceProvider).getUserProfile(user.uid);
    },
    loading: () => null,
    error: (_, __) => null,
  );
});

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  User? get currentUser => _auth.currentUser;

  // Email Register
  Future<UserModel> registerWithEmail({
    required String email,
    required String password,
    required String name,
    required String phone,
    String role = 'user',
  }) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      await credential.user?.updateDisplayName(name);

      final user = UserModel(
        userId: credential.user!.uid,
        name: name,
        email: email,
        phone: phone,
        role: role,
        createdAt: DateTime.now(),
      );

      await _firestore
          .collection(AppConstants.colUsers)
          .doc(credential.user!.uid)
          .set(user.toMap());

      return user;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Email Login
  Future<UserModel> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = await getUserProfile(credential.user!.uid);
      if (user == null) throw Exception('User profile not found');
      return user;
    } on FirebaseAuthException catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Google Sign In
  Future<UserModel> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) throw Exception('Google sign in cancelled');

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      final firebaseUser = userCredential.userCredential!.user!;

      // Check if user exists in Firestore
      final existingUser = await getUserProfile(firebaseUser.uid);
      if (existingUser != null) return existingUser;

      // Create new user
      final user = UserModel(
        userId: firebaseUser.uid,
        name: firebaseUser.displayName ?? 'User',
        email: firebaseUser.email ?? '',
        phone: firebaseUser.phoneNumber ?? '',
        role: 'user',
        profileImage: firebaseUser.photoURL ?? '',
        createdAt: DateTime.now(),
      );

      await _firestore
          .collection(AppConstants.colUsers)
          .doc(firebaseUser.uid)
          .set(user.toMap());

      return user;
    } catch (e) {
      throw Exception('Google sign in failed: $e');
    }
  }

  // Get User Profile
  Future<UserModel?> getUserProfile(String uid) async {
    try {
      final doc = await _firestore
          .collection(AppConstants.colUsers)
          .doc(uid)
          .get();

      if (!doc.exists) return null;
      return UserModel.fromMap(doc.data()!);
    } catch (e) {
      return null;
    }
  }

  // Update User Profile
  Future<void> updateProfile(UserModel user) async {
    await _firestore
        .collection(AppConstants.colUsers)
        .doc(user.userId)
        .update(user.toMap());
  }

  // Forgot Password
  Future<void> forgotPassword(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email);
    } on FirebaseAuthException catch (e) {
      throw _handleAuthError(e);
    }
  }

  // Sign Out
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }

  // Toggle Favorite Hall
  Future<void> toggleFavoriteHall(String userId, String hallId) async {
    final userDoc =
        _firestore.collection(AppConstants.colUsers).doc(userId);
    final user = await userDoc.get();
    final favorites =
        List<String>.from(user.data()?['favoriteHalls'] ?? []);

    if (favorites.contains(hallId)) {
      favorites.remove(hallId);
    } else {
      favorites.add(hallId);
    }

    await userDoc.update({'favoriteHalls': favorites});
  }

  String _handleAuthError(FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No user found with this email.';
      case 'wrong-password':
        return 'Incorrect password. Please try again.';
      case 'email-already-in-use':
        return 'An account already exists with this email.';
      case 'weak-password':
        return 'Password should be at least 6 characters.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return e.message ?? 'Authentication failed. Please try again.';
    }
  }
}
