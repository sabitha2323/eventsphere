import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_theme.dart';
import '../../providers/providers.dart';
import '../../services/auth_service.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

class HallDetailsScreen extends ConsumerStatefulWidget {
  final String hallId;
  const HallDetailsScreen({super.key, required this.hallId});

  @override
  ConsumerState<HallDetailsScreen> createState() => _HallDetailsScreenState();
}

class _HallDetailsScreenState extends ConsumerState<HallDetailsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _currentImageIndex = 0;
  bool _isFavorite = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hallAsync = ref.watch(hallDetailProvider(widget.hallId));
    final reviewsAsync = ref.watch(hallReviewsProvider(widget.hallId));
    final bookedDatesAsync = ref.watch(bookedDatesProvider(widget.hallId));

    return hallAsync.when(
      data: (hall) {
        if (hall == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Venue Details')),
            body: const Center(child: Text('Venue not found')),
          );
        }
        return _buildHallDetails(hall, reviewsAsync, bookedDatesAsync);
      },
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Venue Details')),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: const Text('Venue Details')),
        body: Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildHallDetails(
    HallModel hall,
    AsyncValue<List<ReviewModel>> reviewsAsync,
    AsyncValue<List<DateTime>> bookedDatesAsync,
  ) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: CustomScrollView(
        slivers: [
          // Image Carousel App Bar
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AppTheme.primaryColor,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 8),
                  ],
                ),
                child: const Icon(Icons.arrow_back_ios, size: 16, color: AppTheme.primaryColor),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            actions: [
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 8),
                    ],
                  ),
                  child: Icon(
                    _isFavorite ? Icons.favorite : Icons.favorite_border,
                    size: 16,
                    color: _isFavorite ? AppTheme.primaryColor : Colors.grey,
                  ),
                ),
                onPressed: () {
                  setState(() => _isFavorite = !_isFavorite);
                  final authState = ref.read(authStateProvider);
                  authState.whenData((user) {
                    if (user != null) {
                      ref.read(authServiceProvider).toggleFavoriteHall(user.uid, hall.hallId);
                    }
                  });
                },
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                children: [
                  hall.imageUrls.isNotEmpty
                      ? CarouselSlider(
                          options: CarouselOptions(
                            height: 320,
                            viewportFraction: 1.0,
                            enableInfiniteScroll: true,
                            autoPlay: true,
                            onPageChanged: (i, _) =>
                                setState(() => _currentImageIndex = i),
                          ),
                          items: hall.imageUrls.map((url) {
                            return CachedNetworkImage(
                              imageUrl: url,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (ctx, url) =>
                                  const ShimmerBox(height: 320),
                              errorWidget: (ctx, url, e) => Container(
                                color: AppTheme.cardLight,
                                child: const Icon(Icons.celebration, size: 64, color: AppTheme.primaryColor),
                              ),
                            );
                          }).toList(),
                        )
                      : Container(
                          color: AppTheme.cardLight,
                          child: const Center(
                            child: Icon(Icons.celebration, size: 80, color: AppTheme.primaryColor),
                          ),
                        ),
                  // Gradient overlay
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 80,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Colors.transparent, Colors.black.withOpacity(0.5)],
                        ),
                      ),
                    ),
                  ),
                  // Image indicators
                  if (hall.imageUrls.length > 1)
                    Positioned(
                      bottom: 12,
                      left: 0,
                      right: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: hall.imageUrls.asMap().entries.map((e) {
                          return Container(
                            width: _currentImageIndex == e.key ? 16 : 6,
                            height: 6,
                            margin: const EdgeInsets.only(right: 4),
                            decoration: BoxDecoration(
                              color: _currentImageIndex == e.key
                                  ? Colors.white
                                  : Colors.white.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(3),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Hall Info
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              hall.hallName,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on, size: 14, color: AppTheme.primaryColor),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    '${hall.address}, ${hall.city}',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      if (hall.isVerified)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.successColor,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.verified, color: Colors.white, size: 14),
                              SizedBox(width: 4),
                              Text('Verified', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Rating row
                  Row(
                    children: [
                      RatingBarIndicator(
                        rating: hall.rating,
                        itemBuilder: (context, _) => const Icon(Icons.star, color: AppTheme.secondaryColor),
                        itemCount: 5,
                        itemSize: 18,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${hall.rating.toStringAsFixed(1)} (${hall.reviewCount} reviews)',
                        style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Key info cards
                  Row(
                    children: [
                      _infoCard('👥', 'Capacity', '${hall.capacity} Guests'),
                      const SizedBox(width: 12),
                      _infoCard('💰', 'Price/Day', '₹${NumberFormat('#,##,###').format(hall.pricePerDay)}'),
                      const SizedBox(width: 12),
                      _infoCard('🏢', 'Type', hall.venueType),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Tabs
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.cardLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: TabBar(
                      controller: _tabController,
                      indicatorSize: TabBarIndicatorSize.tab,
                      indicator: BoxDecoration(
                        color: AppTheme.primaryColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      labelColor: Colors.white,
                      unselectedLabelColor: AppTheme.textSecondary,
                      tabs: const [
                        Tab(text: 'Details'),
                        Tab(text: 'Availability'),
                        Tab(text: 'Reviews'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Tab content
          SliverToBoxAdapter(
            child: SizedBox(
              height: 500,
              child: TabBarView(
                controller: _tabController,
                children: [
                  _DetailsTab(hall: hall),
                  _AvailabilityTab(hall: hall, bookedDatesAsync: bookedDatesAsync),
                  _ReviewsTab(hallId: hall.hallId, reviewsAsync: reviewsAsync),
                ],
              ),
            ),
          ),
          const SliverPadding(padding: EdgeInsets.only(bottom: 120)),
        ],
      ),

      // Bottom booking bar
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 16, offset: const Offset(0, -4)),
          ],
        ),
        child: Row(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '₹${NumberFormat('#,##,###').format(hall.pricePerDay)}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor,
                  ),
                ),
                const Text('per day', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => context.go('/booking/${hall.hallId}', extra: {'hall': hall.toMap()}),
                icon: const Icon(Icons.calendar_today, size: 18),
                label: const Text('Book Now'),
              ),
            ),
            const SizedBox(width: 12),
            OutlinedButton(
              onPressed: () => _callHall(hall.contactPhone),
              child: const Icon(Icons.phone, color: AppTheme.primaryColor),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoCard(String emoji, String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.dividerColor),
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 20)),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  void _callHall(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) launchUrl(uri);
  }
}

class _DetailsTab extends StatelessWidget {
  final HallModel hall;
  const _DetailsTab({required this.hall});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('About', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(hall.description, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.6)),
          const SizedBox(height: 16),
          const Text('Facilities', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (hall.hasAC) _facilityChip('❄️ Air Conditioning'),
              if (hall.hasParking) _facilityChip('🅿️ Parking'),
              ...hall.facilities.map((f) => _facilityChip('✓ $f')),
            ],
          ),
          const SizedBox(height: 16),
          const Text('Contact', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          _contactRow(Icons.phone, hall.contactPhone),
          if (hall.contactEmail.isNotEmpty) _contactRow(Icons.email, hall.contactEmail),
          _contactRow(Icons.location_on, hall.address),
          if (hall.pricePerHalf != null) ...[
            const SizedBox(height: 16),
            const Text('Pricing', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _pricingRow('Full Day', hall.pricePerDay),
            _pricingRow('Half Day', hall.pricePerHalf!),
          ],
        ],
      ),
    );
  }

  Widget _facilityChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.cardLight,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.dividerColor),
      ),
      child: Text(label, style: const TextStyle(fontSize: 12)),
    );
  }

  Widget _contactRow(IconData icon, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.primaryColor),
          const SizedBox(width: 8),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary))),
        ],
      ),
    );
  }

  Widget _pricingRow(String label, double price) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary)),
          Text(
            '₹${NumberFormat('#,##,###').format(price)}',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
          ),
        ],
      ),
    );
  }
}

class _AvailabilityTab extends ConsumerWidget {
  final HallModel hall;
  final AsyncValue<List<DateTime>> bookedDatesAsync;
  const _AvailabilityTab({required this.hall, required this.bookedDatesAsync});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return bookedDatesAsync.when(
      data: (bookedDates) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Check Availability', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text(
                'Tap a date to check availability. Red dates are already booked.',
                style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 16),
              _buildCalendar(context, bookedDates),
              const SizedBox(height: 16),
              Row(
                children: [
                  _legend(Colors.green, 'Available'),
                  const SizedBox(width: 16),
                  _legend(AppTheme.errorColor, 'Booked'),
                  const SizedBox(width: 16),
                  _legend(AppTheme.primaryColor, 'Selected'),
                ],
              ),
            ],
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }

  Widget _buildCalendar(BuildContext context, List<DateTime> bookedDates) {
    final now = DateTime.now();
    final bookedSet = bookedDates.map((d) => DateTime(d.year, d.month, d.day)).toSet();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.dividerColor),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              DateFormat('MMMM yyyy').format(now),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              childAspectRatio: 1,
            ),
            itemCount: 35,
            itemBuilder: (ctx, index) {
              final day = index - now.weekday + 1;
              if (day < 1 || day > 31) return const SizedBox();
              final date = DateTime(now.year, now.month, day);
              final isBooked = bookedSet.contains(date);
              final isPast = date.isBefore(DateTime(now.year, now.month, now.day));

              return GestureDetector(
                onTap: isBooked || isPast ? null : () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('${DateFormat('dd MMM yyyy').format(date)} is available!'),
                      backgroundColor: AppTheme.successColor,
                      action: SnackBarAction(
                        label: 'Book',
                        textColor: Colors.white,
                        onPressed: () => context.go('/booking/${hall.hallId}', extra: {'date': date.toIso8601String()}),
                      ),
                    ),
                  );
                },
                child: Container(
                  margin: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: isBooked
                        ? AppTheme.errorColor.withOpacity(0.15)
                        : isPast
                            ? Colors.grey.withOpacity(0.1)
                            : Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isBooked
                          ? AppTheme.errorColor.withOpacity(0.3)
                          : isPast
                              ? Colors.transparent
                              : Colors.green.withOpacity(0.3),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      '$day',
                      style: TextStyle(
                        fontSize: 12,
                        color: isBooked
                            ? AppTheme.errorColor
                            : isPast
                                ? Colors.grey
                                : Colors.green[700],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _legend(Color color, String label) {
    return Row(
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
      ],
    );
  }
}

class _ReviewsTab extends ConsumerStatefulWidget {
  final String hallId;
  final AsyncValue<List<ReviewModel>> reviewsAsync;
  const _ReviewsTab({required this.hallId, required this.reviewsAsync});

  @override
  ConsumerState<_ReviewsTab> createState() => _ReviewsTabState();
}

class _ReviewsTabState extends ConsumerState<_ReviewsTab> {
  final _commentController = TextEditingController();
  double _userRating = 5.0;

  @override
  Widget build(BuildContext context) {
    return widget.reviewsAsync.when(
      data: (reviews) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Write a Review', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              RatingBar.builder(
                initialRating: _userRating,
                minRating: 1,
                itemBuilder: (context, _) => const Icon(Icons.star, color: AppTheme.secondaryColor),
                onRatingUpdate: (r) => setState(() => _userRating = r),
                itemSize: 28,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _commentController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Share your experience...',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton(
                  onPressed: _submitReview,
                  child: const Text('Submit Review'),
                ),
              ),
              const Divider(height: 24),
              Text('${reviews.length} Reviews', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              if (reviews.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Text('No reviews yet. Be the first!', style: TextStyle(color: AppTheme.textSecondary)),
                  ),
                )
              else
                ...reviews.map((review) => _ReviewCard(review: review)),
            ],
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }

  void _submitReview() {
    if (_commentController.text.isEmpty) return;
    // Submit review logic here
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Review submitted!'), backgroundColor: AppTheme.successColor),
    );
    _commentController.clear();
    setState(() => _userRating = 5.0);
  }
}

class _ReviewCard extends StatelessWidget {
  final ReviewModel review;
  const _ReviewCard({required this.review});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
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
              CircleAvatar(
                radius: 20,
                backgroundColor: AppTheme.primaryColor.withOpacity(0.1),
                child: Text(
                  review.userName.isNotEmpty ? review.userName[0].toUpperCase() : 'U',
                  style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(review.userName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    Text(
                      DateFormat('dd MMM yyyy').format(review.createdAt),
                      style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
              ),
              RatingBarIndicator(
                rating: review.rating,
                itemBuilder: (_, __) => const Icon(Icons.star, color: AppTheme.secondaryColor),
                itemCount: 5,
                itemSize: 14,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(review.comment, style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.5)),
        ],
      ),
    );
  }
}
