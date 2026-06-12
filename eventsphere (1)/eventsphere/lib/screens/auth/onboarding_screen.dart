import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_theme.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _currentPage = 0;

  final List<OnboardingData> _pages = [
    OnboardingData(
      emoji: '🏛️',
      title: 'Find Your Dream Venue',
      subtitle:
          'Explore hundreds of marriage halls, mandapams and convention centers across Tamil Nadu and Karnataka',
      color: const Color(0xFFB5341C),
    ),
    OnboardingData(
      emoji: '🪔',
      title: 'Check Muhurtham Dates',
      subtitle:
          'View auspicious wedding dates with Tamil month details and check hall availability instantly',
      color: const Color(0xFFD4A017),
    ),
    OnboardingData(
      emoji: '📅',
      title: 'Easy Booking',
      subtitle:
          'Book your venue in minutes, get a QR code confirmation, and compare prices across multiple venues',
      color: const Color(0xFF8B1A1A),
    ),
    OnboardingData(
      emoji: '🛍️',
      title: 'All-in-One Platform',
      subtitle:
          'Connect with photographers, caterers, decorators and more — your complete wedding planning solution',
      color: const Color(0xFF2E7D32),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: _finish,
                child: const Text(
                  'Skip',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _pages.length,
                onPageChanged: (i) => setState(() => _currentPage = i),
                itemBuilder: (context, index) {
                  final page = _pages[index];
                  return Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 160,
                          height: 160,
                          decoration: BoxDecoration(
                            color: page.color.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              page.emoji,
                              style: const TextStyle(fontSize: 80),
                            ),
                          ),
                        ).animate(key: ValueKey(index)).scale(
                              duration: const Duration(milliseconds: 500),
                              curve: Curves.elasticOut,
                            ),
                        const SizedBox(height: 48),
                        Text(
                          page.title,
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: page.color,
                          ),
                          textAlign: TextAlign.center,
                        ).animate(key: ValueKey('t$index')).fadeIn(
                              duration: const Duration(milliseconds: 400),
                              delay: const Duration(milliseconds: 200),
                            ),
                        const SizedBox(height: 16),
                        Text(
                          page.subtitle,
                          style: const TextStyle(
                            fontSize: 15,
                            color: AppTheme.textSecondary,
                            height: 1.6,
                          ),
                          textAlign: TextAlign.center,
                        ).animate(key: ValueKey('s$index')).fadeIn(
                              duration: const Duration(milliseconds: 400),
                              delay: const Duration(milliseconds: 300),
                            ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  SmoothPageIndicator(
                    controller: _controller,
                    count: _pages.length,
                    effect: WormEffect(
                      dotColor: AppTheme.dividerColor,
                      activeDotColor: AppTheme.primaryColor,
                      dotHeight: 8,
                      dotWidth: 8,
                    ),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        if (_currentPage < _pages.length - 1) {
                          _controller.nextPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        } else {
                          _finish();
                        }
                      },
                      child: Text(
                        _currentPage < _pages.length - 1
                            ? 'Next'
                            : 'Get Started',
                      ),
                    ),
                  ),
                  if (_currentPage == _pages.length - 1) ...[
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => context.go('/login'),
                      child: const Text(
                        'Already have an account? Login',
                        style: TextStyle(color: AppTheme.primaryColor),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_done', true);
    if (mounted) context.go('/login');
  }
}

class OnboardingData {
  final String emoji;
  final String title;
  final String subtitle;
  final Color color;

  OnboardingData({
    required this.emoji,
    required this.title,
    required this.subtitle,
    required this.color,
  });
}
