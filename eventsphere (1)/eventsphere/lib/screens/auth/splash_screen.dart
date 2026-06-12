import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_theme.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigate();
  }

  Future<void> _navigate() async {
    await Future.delayed(const Duration(seconds: 3));
    if (!mounted) return;

    final prefs = await SharedPreferences.getInstance();
    final onboardingDone = prefs.getBool('onboarding_done') ?? false;
    final user = FirebaseAuth.instance.currentUser;

    if (!mounted) return;

    if (user != null) {
      context.go('/home');
    } else if (!onboardingDone) {
      context.go('/onboarding');
    } else {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Center(
                child: Text('🎊', style: TextStyle(fontSize: 60)),
              ),
            )
                .animate()
                .scale(
                  duration: const Duration(milliseconds: 600),
                  curve: Curves.elasticOut,
                )
                .fadeIn(),
            const SizedBox(height: 24),
            const Text(
              'EventSphere',
              style: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                letterSpacing: 1,
              ),
            )
                .animate()
                .slideY(
                  begin: 0.3,
                  duration: const Duration(milliseconds: 600),
                  delay: const Duration(milliseconds: 300),
                )
                .fadeIn(
                  delay: const Duration(milliseconds: 300),
                ),
            const SizedBox(height: 8),
            const Text(
              'Your Perfect Wedding Venue Awaits',
              style: TextStyle(
                fontSize: 14,
                color: Colors.white70,
                letterSpacing: 0.5,
              ),
            )
                .animate()
                .fadeIn(
                  delay: const Duration(milliseconds: 600),
                  duration: const Duration(milliseconds: 500),
                ),
            const SizedBox(height: 60),
            const SizedBox(
              width: 40,
              height: 40,
              child: CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2,
              ),
            ).animate().fadeIn(
                  delay: const Duration(milliseconds: 800),
                ),
          ],
        ),
      ),
    );
  }
}
