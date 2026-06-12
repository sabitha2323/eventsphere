// ==================== MUHURTHAM SCREEN ====================
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';

import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/providers.dart';
import '../../services/auth_service.dart';
import '../../services/other_services.dart';
import '../../services/booking_service.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

class MuhurthamScreen extends ConsumerStatefulWidget {
  const MuhurthamScreen({super.key});
  @override
  ConsumerState<MuhurthamScreen> createState() => _MuhurthamScreenState();
}

class _MuhurthamScreenState extends ConsumerState<MuhurthamScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  int _selectedMonth = DateTime.now().month;
  int _selectedYear = DateTime.now().year;

  @override
  Widget build(BuildContext context) {
    final muhurthamAsync = ref.watch(muhurthamByMonthProvider({'month': _selectedMonth, 'year': _selectedYear}));

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Muhurtham Dates 🪔'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          // Month/Year selector
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left),
                  onPressed: () {
                    setState(() {
                      if (_selectedMonth == 1) {
                        _selectedMonth = 12;
                        _selectedYear--;
                      } else {
                        _selectedMonth--;
                      }
                    });
                  },
                ),
                Text(
                  DateFormat('MMMM yyyy').format(DateTime(_selectedYear, _selectedMonth)),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: () {
                    setState(() {
                      if (_selectedMonth == 12) {
                        _selectedMonth = 1;
                        _selectedYear++;
                      } else {
                        _selectedMonth++;
                      }
                    });
                  },
                ),
              ],
            ),
          ),

          Expanded(
            child: muhurthamAsync.when(
              data: (muhurthamDates) {
                final muhurthamSet = muhurthamDates.map((m) => DateTime(m.date.year, m.date.month, m.date.day)).toSet();

                return Column(
                  children: [
                    // Calendar
                    Container(
                      color: Colors.white,
                      child: TableCalendar(
                        firstDay: DateTime(2020),
                        lastDay: DateTime(2030),
                        focusedDay: DateTime(_selectedYear, _selectedMonth),
                        calendarFormat: CalendarFormat.month,
                        headerVisible: false,
                        selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
                        onDaySelected: (selected, focused) {
                          setState(() {
                            _selectedDay = selected;
                            _focusedDay = focused;
                          });
                        },
                        calendarBuilders: CalendarBuilders(
                          defaultBuilder: (context, day, focusedDay) {
                            final normalized = DateTime(day.year, day.month, day.day);
                            if (muhurthamSet.contains(normalized)) {
                              return Container(
                                margin: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: [Color(0xFFD4A017), Color(0xFFB5341C)]),
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text('${day.day}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                      const Text('🪔', style: TextStyle(fontSize: 8)),
                                    ],
                                  ),
                                ),
                              );
                            }
                            return null;
                          },
                        ),
                        calendarStyle: const CalendarStyle(
                          selectedDecoration: BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle),
                          todayDecoration: BoxDecoration(color: Color(0x33B5341C), shape: BoxShape.circle),
                        ),
                      ),
                    ),

                    // Legend
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        children: [
                          Container(width: 16, height: 16, decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFFD4A017), Color(0xFFB5341C)]), shape: BoxShape.circle)),
                          const SizedBox(width: 8),
                          const Text('Muhurtham Date', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                        ],
                      ),
                    ),
                    const Divider(height: 1),

                    // List of muhurtham dates for selected month
                    Expanded(
                      child: muhurthamDates.isEmpty
                          ? const EmptyState(
                              icon: Icons.calendar_today,
                              title: 'No Muhurtham Dates',
                              subtitle: 'No auspicious dates this month',
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: muhurthamDates.length,
                              itemBuilder: (context, index) {
                                final m = muhurthamDates[index];
                                return _MuhurthamCard(muhurtham: m);
                              },
                            ),
                    ),
                  ],
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }
}

class _MuhurthamCard extends StatelessWidget {
  final MuhurthamModel muhurtham;
  const _MuhurthamCard({required this.muhurtham});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFFFFF8E1), Color(0xFFFFF3CD)]),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD4A017).withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFFD4A017), Color(0xFFB5341C)]),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('${muhurtham.date.day}', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                Text(DateFormat('MMM').format(muhurtham.date), style: const TextStyle(color: Colors.white70, fontSize: 10)),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(muhurtham.day, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD4A017).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(muhurtham.tamilMonth, style: const TextStyle(fontSize: 11, color: Color(0xFFD4A017), fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
                if (muhurtham.specialOccasion.isNotEmpty)
                  Text(muhurtham.specialOccasion, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                if (muhurtham.notes.isNotEmpty)
                  Text(muhurtham.notes, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          TextButton(
            onPressed: () => context.go('/search', extra: {'date': muhurtham.date.toIso8601String()}),
            child: const Text('Find Hall', style: TextStyle(color: AppTheme.primaryColor, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}

// ==================== FAVORITES SCREEN ====================
class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(title: const Text('Favorites ❤️'), automaticallyImplyLeading: false),
      body: authState.when(
        data: (user) {
          if (user == null) {
            return EmptyState(
              icon: Icons.favorite_border,
              title: 'Sign in to View Favorites',
              subtitle: 'Login to save and view your favorite venues',
              buttonLabel: 'Login',
              onButton: () => context.go('/login'),
            );
          }
          return _FavoritesList(userId: user.uid);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Error loading')),
      ),
    );
  }
}

class _FavoritesList extends ConsumerWidget {
  final String userId;
  const _FavoritesList({required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userProfileProvider(userId));

    return userAsync.when(
      data: (user) {
        if (user == null || user.favoriteHalls.isEmpty) {
          return const EmptyState(
            icon: Icons.favorite_border,
            title: 'No Favorites Yet',
            subtitle: 'Start exploring venues and save your favorites!',
          );
        }
        final favoritesAsync = ref.watch(favoriteHallsProvider(user.favoriteHalls));
        return favoritesAsync.when(
          data: (halls) => ListView.builder(
            itemCount: halls.length,
            itemBuilder: (context, index) => HallCard(
              hall: halls[index],
              onTap: () => context.go('/hall/${halls[index].hallId}'),
              isFavorite: true,
            ),
          ),
          loading: () => ListView.builder(itemCount: 3, itemBuilder: (_, __) => const ShimmerHallCard()),
          error: (e, _) => Center(child: Text('Error: $e')),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }
}

// ==================== VENDOR MARKETPLACE SCREEN ====================
class VendorMarketplaceScreen extends ConsumerStatefulWidget {
  const VendorMarketplaceScreen({super.key});
  @override
  ConsumerState<VendorMarketplaceScreen> createState() => _VendorMarketplaceScreenState();
}

class _VendorMarketplaceScreenState extends ConsumerState<VendorMarketplaceScreen> {
  String? _selectedCategory;
  String? _selectedCity;

  @override
  Widget build(BuildContext context) {
    final vendorsAsync = ref.watch(vendorsProvider({'city': _selectedCity, 'category': _selectedCategory}));

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(title: const Text('Vendor Marketplace')),
      body: Column(
        children: [
          // Category filter
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: AppConstants.vendorCategories.length + 1,
              itemBuilder: (context, i) {
                if (i == 0) {
                  return CityChip(city: 'All', isSelected: _selectedCategory == null, onTap: () => setState(() => _selectedCategory = null));
                }
                final cat = AppConstants.vendorCategories[i - 1];
                return CityChip(city: cat, isSelected: _selectedCategory == cat, onTap: () => setState(() => _selectedCategory = cat));
              },
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: vendorsAsync.when(
              data: (vendors) => vendors.isEmpty
                  ? const EmptyState(icon: Icons.storefront, title: 'No Vendors Found', subtitle: 'No vendors available for the selected category')
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: vendors.length,
                      itemBuilder: (context, i) => _VendorCard(vendor: vendors[i]),
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }
}

class _VendorCard extends StatelessWidget {
  final VendorModel vendor;
  const _VendorCard({required this.vendor});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: AppTheme.primaryColor.withOpacity(0.06), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(child: Text(_categoryEmoji(vendor.category), style: const TextStyle(fontSize: 28))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(vendor.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15))),
                    if (vendor.isVerified) const Icon(Icons.verified, color: AppTheme.successColor, size: 16),
                  ],
                ),
                Text(vendor.category, style: const TextStyle(fontSize: 12, color: AppTheme.primaryColor, fontWeight: FontWeight.w500)),
                Text(vendor.city, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                const SizedBox(height: 4),
                Text(
                  '₹${NumberFormat('#,##,###').format(vendor.minPrice)} - ₹${NumberFormat('#,##,###').format(vendor.maxPrice)}',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.phone, color: AppTheme.primaryColor),
            onPressed: () async {
              final uri = Uri.parse('tel:${vendor.contactNumber}');
              if (await canLaunchUrl(uri)) launchUrl(uri);
            },
          ),
        ],
      ),
    );
  }

  String _categoryEmoji(String category) {
    switch (category) {
      case 'Photography': return '📸';
      case 'Catering': return '🍽️';
      case 'Decoration': return '🌸';
      case 'Makeup Artist': return '💄';
      case 'DJ Services': return '🎵';
      case 'Band': return '🎶';
      case 'Mehendi Artist': return '🖐️';
      case 'Event Planner': return '📋';
      case 'Florist': return '💐';
      default: return '🛍️';
    }
  }
}

// ==================== PROFILE SCREEN ====================
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('My Profile'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authServiceProvider).signOut();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: authState.when(
        data: (user) {
          if (user == null) {
            return EmptyState(
              icon: Icons.person_outline,
              title: 'Not Logged In',
              subtitle: 'Login to view your profile',
              buttonLabel: 'Login',
              onButton: () => context.go('/login'),
            );
          }
          return _ProfileContent(uid: user.uid);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('Error')),
      ),
    );
  }
}

class _ProfileContent extends ConsumerWidget {
  final String uid;
  const _ProfileContent({required this.uid});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userProfileProvider(uid));
    final bookingsAsync = ref.watch(userBookingsProvider(uid));

    return userAsync.when(
      data: (user) {
        if (user == null) return const Center(child: Text('Profile not found'));
        return SingleChildScrollView(
          child: Column(
            children: [
              // Profile header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [AppTheme.primaryColor, AppTheme.accentColor]),
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 48,
                      backgroundColor: Colors.white,
                      backgroundImage: user.profileImage.isNotEmpty ? NetworkImage(user.profileImage) : null,
                      child: user.profileImage.isEmpty
                          ? Text(user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                              style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppTheme.primaryColor))
                          : null,
                    ),
                    const SizedBox(height: 12),
                    Text(user.name, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                    Text(user.email, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    if (user.phone.isNotEmpty)
                      Text(user.phone, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        user.role.toUpperCase(),
                        style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),

              // Bookings section
              const SizedBox(height: 16),
              const SectionHeader(title: 'My Bookings'),
              bookingsAsync.when(
                data: (bookings) {
                  if (bookings.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.all(24),
                      child: Text('No bookings yet', style: TextStyle(color: AppTheme.textSecondary)),
                    );
                  }
                  return ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: bookings.length,
                    itemBuilder: (context, i) {
                      final booking = bookings[i];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.dividerColor),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(booking.hallName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15), maxLines: 1, overflow: TextOverflow.ellipsis),
                                ),
                                BookingStatusBadge(status: booking.bookingStatus),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(DateFormat('EEEE, dd MMM yyyy').format(booking.eventDate), style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
                            Text('₹${NumberFormat('#,##,###').format(booking.totalAmount)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                            if (booking.bookingStatus == 'pending' || booking.bookingStatus == 'confirmed')
                              Align(
                                alignment: Alignment.centerRight,
                                child: TextButton(
                                  onPressed: () => context.go('/booking-confirmation/${booking.bookingId}'),
                                  child: const Text('View QR Code', style: TextStyle(color: AppTheme.primaryColor)),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Error: $e')),
              ),
              const SizedBox(height: 80),
            ],
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }
}

// ==================== OWNER DASHBOARD ====================
class OwnerDashboardScreen extends ConsumerWidget {
  const OwnerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return authState.when(
      data: (user) {
        if (user == null) return const Scaffold(body: Center(child: Text('Not logged in')));
        final hallsAsync = ref.watch(hallsByOwnerProvider(user.uid));
        final bookingsStream = ref.watch(allBookingsProvider);

        return Scaffold(
          backgroundColor: AppTheme.backgroundLight,
          appBar: AppBar(
            title: const Text('Owner Dashboard'),
            actions: [
              IconButton(icon: const Icon(Icons.add), onPressed: () => _showAddHallDialog(context, ref, user.uid)),
              IconButton(
                icon: const Icon(Icons.logout),
                onPressed: () async {
                  await ref.read(authServiceProvider).signOut();
                  if (context.mounted) context.go('/login');
                },
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Stats
                hallsAsync.when(
                  data: (halls) => Row(
                    children: [
                      _statCard('My Halls', '${halls.length}', Icons.business, AppTheme.primaryColor),
                      const SizedBox(width: 12),
                      _statCard('Verified', '${halls.where((h) => h.isVerified).length}', Icons.verified, AppTheme.successColor),
                      const SizedBox(width: 12),
                      _statCard('Pending', '${halls.where((h) => h.status == 'pending').length}', Icons.pending, AppTheme.warningColor),
                    ],
                  ),
                  loading: () => const SizedBox(height: 80, child: Center(child: CircularProgressIndicator())),
                  error: (e, _) => Text('Error: $e'),
                ),
                const SizedBox(height: 20),

                const Text('My Halls', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                hallsAsync.when(
                  data: (halls) => halls.isEmpty
                      ? EmptyState(
                          icon: Icons.business,
                          title: 'No Halls Added',
                          subtitle: 'Add your first hall to start receiving bookings',
                          buttonLabel: 'Add Hall',
                          onButton: () => _showAddHallDialog(context, ref, user.uid),
                        )
                      : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: halls.length,
                          itemBuilder: (ctx, i) => _OwnerHallCard(hall: halls[i]),
                        ),
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Text('Error: $e'),
                ),
              ],
            ),
          ),
        );
      },
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (_, __) => const Scaffold(body: Center(child: Text('Error'))),
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
          ],
        ),
      ),
    );
  }

  void _showAddHallDialog(BuildContext context, WidgetRef ref, String ownerId) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Add Hall feature - connect to full form screen')),
    );
  }
}

class _OwnerHallCard extends StatelessWidget {
  final HallModel hall;
  const _OwnerHallCard({required this.hall});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(hall.hallName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
              BookingStatusBadge(status: hall.status),
            ],
          ),
          const SizedBox(height: 4),
          Text('${hall.city} • ${hall.capacity} guests', style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary)),
          Text('₹${NumberFormat('#,##,###').format(hall.pricePerDay)}/day', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.star, size: 14, color: AppTheme.secondaryColor),
              const SizedBox(width: 4),
              Text('${hall.rating.toStringAsFixed(1)} (${hall.reviewCount} reviews)', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
              const Spacer(),
              TextButton(
                onPressed: () => context.go('/hall/${hall.hallId}'),
                child: const Text('View', style: TextStyle(color: AppTheme.primaryColor, fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ==================== ADMIN DASHBOARD ====================
class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hallsAsync = ref.watch(allHallsProvider);
    final bookingsAsync = ref.watch(allBookingsProvider);
    final muhurthamAsync = ref.watch(allMuhurthamProvider);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authServiceProvider).signOut();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Overview', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),

            // Stats grid
            GridView(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.5,
              ),
              children: [
                hallsAsync.when(
                  data: (halls) => _adminStatCard('Total Halls', '${halls.length}', Icons.business, AppTheme.primaryColor),
                  loading: () => _adminStatCard('Total Halls', '...', Icons.business, AppTheme.primaryColor),
                  error: (_, __) => _adminStatCard('Total Halls', 'N/A', Icons.business, AppTheme.primaryColor),
                ),
                bookingsAsync.when(
                  data: (bookings) => _adminStatCard('Total Bookings', '${bookings.length}', Icons.book_online, AppTheme.successColor),
                  loading: () => _adminStatCard('Total Bookings', '...', Icons.book_online, AppTheme.successColor),
                  error: (_, __) => _adminStatCard('Total Bookings', 'N/A', Icons.book_online, AppTheme.successColor),
                ),
                hallsAsync.when(
                  data: (halls) => _adminStatCard('Pending Approval', '${halls.where((h) => h.status == 'pending').length}', Icons.pending_actions, AppTheme.warningColor),
                  loading: () => _adminStatCard('Pending', '...', Icons.pending_actions, AppTheme.warningColor),
                  error: (_, __) => _adminStatCard('Pending', 'N/A', Icons.pending_actions, AppTheme.warningColor),
                ),
                muhurthamAsync.when(
                  data: (dates) => _adminStatCard('Muhurtham Dates', '${dates.length}', Icons.calendar_month, AppTheme.secondaryColor),
                  loading: () => _adminStatCard('Muhurtham', '...', Icons.calendar_month, AppTheme.secondaryColor),
                  error: (_, __) => _adminStatCard('Muhurtham', 'N/A', Icons.calendar_month, AppTheme.secondaryColor),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Pending halls section
            const Text('Halls Pending Approval', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            hallsAsync.when(
              data: (halls) {
                final pending = halls.where((h) => h.status == 'pending').toList();
                if (pending.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('No pending halls', style: TextStyle(color: AppTheme.textSecondary)),
                  );
                }
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: pending.length,
                  itemBuilder: (ctx, i) => _AdminHallCard(hall: pending[i], ref: ref),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e'),
            ),

            const SizedBox(height: 24),
            const Text('Recent Bookings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            bookingsAsync.when(
              data: (bookings) {
                final recent = bookings.take(5).toList();
                if (recent.isEmpty) return const Text('No bookings yet', style: TextStyle(color: AppTheme.textSecondary));
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: recent.length,
                  itemBuilder: (ctx, i) => _AdminBookingCard(booking: recent[i], ref: ref),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _adminStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _AdminHallCard extends StatelessWidget {
  final HallModel hall;
  final WidgetRef ref;
  const _AdminHallCard({required this.hall, required this.ref});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.dividerColor)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(hall.hallName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          Text('${hall.city} • ${hall.capacity} guests • ₹${NumberFormat('#,##,###').format(hall.pricePerDay)}/day', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _verifyHall(context, hall.hallId, true),
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.successColor),
                  child: const Text('Approve'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _verifyHall(context, hall.hallId, false),
                  style: OutlinedButton.styleFrom(foregroundColor: AppTheme.errorColor, side: const BorderSide(color: AppTheme.errorColor)),
                  child: const Text('Reject'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _verifyHall(BuildContext context, String hallId, bool approved) async {
    await ref.read(hallServiceProvider).verifyHall(hallId, approved);
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(approved ? 'Hall approved!' : 'Hall rejected'),
          backgroundColor: approved ? AppTheme.successColor : AppTheme.errorColor,
        ),
      );
    }
  }
}

class _AdminBookingCard extends StatelessWidget {
  final BookingModel booking;
  final WidgetRef ref;
  const _AdminBookingCard({required this.booking, required this.ref});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.dividerColor)),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(booking.hallName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                Text(booking.userName, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                Text(DateFormat('dd MMM yyyy').format(booking.eventDate), style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              BookingStatusBadge(status: booking.bookingStatus),
              const SizedBox(height: 4),
              Text('₹${NumberFormat('#,##,###').format(booking.totalAmount)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor, fontSize: 13)),
            ],
          ),
        ],
      ),
    );
  }
}

// ==================== NOTIFICATIONS SCREEN ====================
class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(title: const Text('Notifications 🔔')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _NotificationCard(
            icon: Icons.check_circle,
            color: AppTheme.successColor,
            title: 'Booking Confirmed',
            subtitle: 'Your booking at Sri Venkateswara Hall has been confirmed for 15 Jan 2026.',
            time: '2 hours ago',
          ),
          _NotificationCard(
            icon: Icons.calendar_today,
            color: AppTheme.secondaryColor,
            title: 'Muhurtham Alert 🪔',
            subtitle: 'Auspicious date coming up: 22 Jan 2026 - Maasi month. Check hall availability!',
            time: '1 day ago',
          ),
          _NotificationCard(
            icon: Icons.star,
            color: Colors.amber,
            title: 'Rate Your Experience',
            subtitle: 'You recently visited Laxmi Mahal. Share your review!',
            time: '3 days ago',
          ),
        ],
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final String time;
  const _NotificationCard({required this.icon, required this.color, required this.title, required this.subtitle, required this.time});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.dividerColor),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.4)),
                const SizedBox(height: 4),
                Text(time, style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Needed imports for url_launcher in _VendorCard
import 'package:url_launcher/url_launcher.dart';
