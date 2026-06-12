import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/providers.dart';
import '../../services/auth_service.dart';
import '../../widgets/widgets.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _bottomNavIndex = 0;
  String? _selectedCity;

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: IndexedStack(
        index: _bottomNavIndex,
        children: const [
          _HomeTab(),
          _SearchTab(),
          _MuhurthamTab(),
          _FavoritesTab(),
          _ProfileTab(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _bottomNavIndex,
        onTap: (i) => setState(() => _bottomNavIndex = i),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search_outlined),
            activeIcon: Icon(Icons.search),
            label: 'Search',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_month_outlined),
            activeIcon: Icon(Icons.calendar_month),
            label: 'Muhurtham',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite_outlined),
            activeIcon: Icon(Icons.favorite),
            label: 'Favorites',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outlined),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class _HomeTab extends ConsumerWidget {
  const _HomeTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final popularHalls = ref.watch(popularHallsProvider);
    final authState = ref.watch(authStateProvider);
    final upcomingMuhurtham = ref.watch(upcomingMuhurthamProvider);

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 180,
          floating: false,
          pinned: true,
          backgroundColor: AppTheme.primaryColor,
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppTheme.primaryColor,
                    AppTheme.accentColor,
                  ],
                ),
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          authState.when(
                            data: (user) => Text(
                              'Hello, ${user?.displayName?.split(' ').first ?? 'User'} 👋',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                            loading: () => const SizedBox(),
                            error: (_, __) => const SizedBox(),
                          ),
                          IconButton(
                            onPressed: () => context.go('/notifications'),
                            icon: const Icon(Icons.notifications_outlined,
                                color: Colors.white),
                          ),
                        ],
                      ),
                      const Text(
                        'Find Your Perfect\nWedding Venue 🏛️',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),

        // Search Bar
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: GestureDetector(
              onTap: () => context.go('/search'),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Icon(Icons.search, color: Colors.grey[400]),
                    const SizedBox(width: 12),
                    Text(
                      'Search halls, city, district...',
                      style: TextStyle(
                        color: Colors.grey[400],
                        fontSize: 14,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.tune,
                          color: Colors.white, size: 16),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // City Selector
        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionHeader(
                title: 'Browse by City',
                subtitle: 'Tamil Nadu & Karnataka',
              ),
              SizedBox(
                height: 40,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: AppConstants.allCities.length,
                  itemBuilder: (context, index) {
                    final city = AppConstants.allCities[index];
                    return CityChip(
                      city: city,
                      isSelected: false,
                      onTap: () => context.go('/search',
                          extra: {'city': city}),
                    );
                  },
                ),
              ),
            ],
          ),
        ),

        // Upcoming Muhurtham
        SliverToBoxAdapter(
          child: upcomingMuhurtham.when(
            data: (dates) {
              if (dates.isEmpty) return const SizedBox.shrink();
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [
                            Color(0xFFFFF8E1),
                            Color(0xFFFFECB3)
                          ],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: AppTheme.secondaryColor.withOpacity(0.3)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Text('🪔',
                                  style: TextStyle(fontSize: 20)),
                              const SizedBox(width: 8),
                              const Text(
                                'Upcoming Muhurtham Dates',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              const Spacer(),
                              TextButton(
                                onPressed: () =>
                                    context.go('/muhurtham'),
                                child: const Text('View All',
                                    style: TextStyle(
                                        color: AppTheme.primaryColor,
                                        fontSize: 12)),
                              ),
                            ],
                          ),
                          ...dates.take(3).map((m) => Padding(
                                padding:
                                    const EdgeInsets.only(top: 8),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 4,
                                      height: 4,
                                      decoration: const BoxDecoration(
                                        color: AppTheme.secondaryColor,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      '${m.date.day}/${m.date.month}/${m.date.year} - ${m.day}',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: AppTheme.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      m.tamilMonth,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: AppTheme.secondaryColor,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              )),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ),

        // Popular Halls
        SliverToBoxAdapter(
          child: SectionHeader(
            title: 'Popular Venues',
            subtitle: 'Most booked marriage halls',
            onViewAll: () => context.go('/search'),
          ),
        ),

        SliverToBoxAdapter(
          child: popularHalls.when(
            data: (halls) {
              if (halls.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(
                    child: Text(
                      'No venues available yet',
                      style: TextStyle(color: AppTheme.textSecondary),
                    ),
                  ),
                );
              }
              return Column(
                children: halls
                    .map((hall) => HallCard(
                          hall: hall,
                          onTap: () =>
                              context.go('/hall/${hall.hallId}'),
                          isFavorite: false,
                        ))
                    .toList(),
              );
            },
            loading: () => Column(
              children: List.generate(
                  3, (_) => const ShimmerHallCard()),
            ),
            error: (e, _) => Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text('Error: $e'),
              ),
            ),
          ),
        ),

        // Quick Actions
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Quick Access',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _quickAction(
                      context,
                      '🛍️',
                      'Vendors',
                      'Find vendors',
                      () => context.go('/vendors'),
                    ),
                    const SizedBox(width: 12),
                    _quickAction(
                      context,
                      '📊',
                      'Compare',
                      'Compare halls',
                      () => context.go('/search'),
                    ),
                    const SizedBox(width: 12),
                    _quickAction(
                      context,
                      '📋',
                      'Bookings',
                      'My bookings',
                      () => context.go('/profile'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SliverPadding(padding: EdgeInsets.only(bottom: 80)),
      ],
    );
  }

  Widget _quickAction(BuildContext context, String emoji, String title,
      String subtitle, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withOpacity(0.06),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 28)),
              const SizedBox(height: 4),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 10,
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Stub tabs that navigate to actual screens
class _SearchTab extends StatelessWidget {
  const _SearchTab();
  @override
  Widget build(BuildContext context) => const SearchScreen();
}

class _MuhurthamTab extends StatelessWidget {
  const _MuhurthamTab();
  @override
  Widget build(BuildContext context) => const MuhurthamScreen();
}

class _FavoritesTab extends StatelessWidget {
  const _FavoritesTab();
  @override
  Widget build(BuildContext context) => const FavoritesScreen();
}

class _ProfileTab extends StatelessWidget {
  const _ProfileTab();
  @override
  Widget build(BuildContext context) => const ProfileScreen();
}

// Forward declarations (these are in their own files)
class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Navigator(
      onGenerateRoute: (_) => MaterialPageRoute(
        builder: (_) => const _SearchScreenContent(),
      ),
    );
  }
}

class _SearchScreenContent extends StatelessWidget {
  const _SearchScreenContent();
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Search Venues')),
      body: const Center(child: Text('Use Search tab')),
    );
  }
}

class MuhurthamScreen extends StatelessWidget {
  const MuhurthamScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Muhurtham Dates')),
      body: const Center(child: Text('Muhurtham dates will appear here')),
    );
  }
}

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Favorites')),
      body: const Center(child: Text('Your favorite halls')),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: const Center(child: Text('Your profile')),
    );
  }
}
