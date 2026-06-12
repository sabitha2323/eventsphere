import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../providers/providers.dart';
import '../../services/auth_service.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

class SearchScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic>? initialFilter;
  const SearchScreen({super.key, this.initialFilter});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _searchController = TextEditingController();
  String? _selectedCity;
  String? _selectedVenueType;
  double? _minPrice;
  double? _maxPrice;
  int? _minCapacity;
  bool? _hasAC;
  bool? _hasParking;
  DateTime? _selectedDate;
  String _sortBy = 'rating';

  @override
  void initState() {
    super.initState();
    if (widget.initialFilter != null) {
      _selectedCity = widget.initialFilter!['city'];
      _applyFilters();
    }
  }

  void _applyFilters() {
    ref.read(searchFilterProvider.notifier).state = SearchFilter(
      query: _searchController.text.isEmpty ? null : _searchController.text,
      city: _selectedCity,
      venueType: _selectedVenueType,
      minCapacity: _minCapacity,
      hasAC: _hasAC,
      hasParking: _hasParking,
      date: _selectedDate,
      sortBy: _sortBy,
    );
  }

  @override
  Widget build(BuildContext context) {
    final searchResults = ref.watch(searchResultsProvider);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Search Venues'),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search halls, city, district...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _applyFilters();
                        },
                      )
                    : null,
              ),
              onChanged: (_) => _applyFilters(),
            ),
          ),

          // City chips
          SizedBox(
            height: 40,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: AppConstants.allCities.length + 1,
              itemBuilder: (context, index) {
                if (index == 0) {
                  return CityChip(
                    city: 'All Cities',
                    isSelected: _selectedCity == null,
                    onTap: () {
                      setState(() => _selectedCity = null);
                      _applyFilters();
                    },
                  );
                }
                final city = AppConstants.allCities[index - 1];
                return CityChip(
                  city: city,
                  isSelected: _selectedCity == city,
                  onTap: () {
                    setState(() => _selectedCity = city);
                    _applyFilters();
                  },
                );
              },
            ),
          ),

          // Active filters
          if (_hasAC != null || _hasParking != null || _selectedDate != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Wrap(
                spacing: 8,
                children: [
                  if (_hasAC == true)
                    _filterTag('AC', () {
                      setState(() => _hasAC = null);
                      _applyFilters();
                    }),
                  if (_hasParking == true)
                    _filterTag('Parking', () {
                      setState(() => _hasParking = null);
                      _applyFilters();
                    }),
                  if (_selectedDate != null)
                    _filterTag(
                        '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}',
                        () {
                      setState(() => _selectedDate = null);
                      _applyFilters();
                    }),
                ],
              ),
            ),

          const SizedBox(height: 8),

          // Results
          Expanded(
            child: searchResults.when(
              data: (halls) {
                if (halls.isEmpty) {
                  return EmptyState(
                    icon: Icons.search_off,
                    title: 'No Venues Found',
                    subtitle: 'Try adjusting your filters or search in a different city',
                    buttonLabel: 'Clear Filters',
                    onButton: () {
                      setState(() {
                        _selectedCity = null;
                        _hasAC = null;
                        _hasParking = null;
                        _selectedDate = null;
                        _searchController.clear();
                      });
                      _applyFilters();
                    },
                  );
                }
                return ListView.builder(
                  itemCount: halls.length,
                  itemBuilder: (context, index) {
                    final hall = halls[index];
                    return HallCard(
                      hall: hall,
                      onTap: () => context.go('/hall/${hall.hallId}'),
                      isFavorite: false,
                    );
                  },
                );
              },
              loading: () => ListView.builder(
                itemCount: 3,
                itemBuilder: (_, __) => const ShimmerHallCard(),
              ),
              error: (e, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: AppTheme.errorColor),
                    const SizedBox(height: 16),
                    Text('Error loading venues'),
                    TextButton(
                      onPressed: () => ref.invalidate(searchResultsProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterTag(String label, VoidCallback onRemove) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.primaryColor)),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onRemove,
            child: const Icon(Icons.close, size: 14, color: AppTheme.primaryColor),
          ),
        ],
      ),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Filters',
                    style:
                        TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _hasAC = null;
                      _hasParking = null;
                      _selectedDate = null;
                      _minCapacity = null;
                    });
                    _applyFilters();
                    Navigator.pop(ctx);
                  },
                  child: const Text('Reset All'),
                ),
              ],
            ),
            const Divider(),
            const SizedBox(height: 8),
            const Text('Facilities',
                style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            Row(
              children: [
                _filterChip('Air Conditioning', _hasAC == true, () {
                  setState(() => _hasAC = _hasAC == true ? null : true);
                }),
                const SizedBox(width: 8),
                _filterChip('Parking', _hasParking == true, () {
                  setState(() =>
                      _hasParking = _hasParking == true ? null : true);
                }),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Sort By',
                style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _filterChip('Highest Rated', _sortBy == 'rating', () {
                  setState(() => _sortBy = 'rating');
                }),
                _filterChip('Price: Low', _sortBy == 'price_asc', () {
                  setState(() => _sortBy = 'price_asc');
                }),
                _filterChip('Price: High', _sortBy == 'price_desc', () {
                  setState(() => _sortBy = 'price_desc');
                }),
                _filterChip('Capacity', _sortBy == 'capacity', () {
                  setState(() => _sortBy = 'capacity');
                }),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  _applyFilters();
                  Navigator.pop(ctx);
                },
                child: const Text('Apply Filters'),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _filterChip(String label, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primaryColor : AppTheme.cardLight,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? AppTheme.primaryColor : AppTheme.dividerColor,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : AppTheme.textSecondary,
            fontSize: 13,
            fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
