import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';

import '../../core/theme/app_theme.dart';
import '../../providers/providers.dart';
import '../../services/auth_service.dart';
import '../../services/booking_service.dart';
import '../../widgets/widgets.dart';
import '../../models/models.dart';

class BookingScreen extends ConsumerStatefulWidget {
  final String hallId;
  final Map<String, dynamic>? extra;
  const BookingScreen({super.key, required this.hallId, this.extra});

  @override
  ConsumerState<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends ConsumerState<BookingScreen> {
  DateTime? _selectedDate;
  String _bookingType = 'full_day';
  final _notesController = TextEditingController();
  bool _isLoading = false;
  List<DateTime> _bookedDates = [];

  @override
  void initState() {
    super.initState();
    if (widget.extra?['date'] != null) {
      _selectedDate = DateTime.parse(widget.extra!['date']);
    }
    _loadBookedDates();
  }

  Future<void> _loadBookedDates() async {
    final dates = await ref.read(bookingServiceProvider)
        .getUserBookings('').first
        .then((_) => ref.read(hallServiceProvider).getBookedDates(widget.hallId));
    setState(() => _bookedDates = dates);
  }

  @override
  Widget build(BuildContext context) {
    final hallAsync = ref.watch(hallDetailProvider(widget.hallId));

    return hallAsync.when(
      data: (hall) {
        if (hall == null) return const Scaffold(body: Center(child: Text('Hall not found')));
        return _buildBookingForm(hall);
      },
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(body: Center(child: Text('Error: $e'))),
    );
  }

  Widget _buildBookingForm(HallModel hall) {
    final bookedSet = _bookedDates.map((d) => DateTime(d.year, d.month, d.day)).toSet();
    final price = _bookingType == 'full_day'
        ? hall.pricePerDay
        : (hall.pricePerHalf ?? hall.pricePerDay / 2);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(title: Text('Book ${hall.hallName}')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hall summary card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.dividerColor),
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
                    child: const Icon(Icons.celebration, color: AppTheme.primaryColor, size: 32),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(hall.hallName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                        Text('${hall.city}, ${hall.district}', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                        Text('Capacity: ${hall.capacity} guests', style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Booking type
            const Text('Booking Duration', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _bookingTypeCard(
                    'Full Day',
                    'All Day Event',
                    '₹${NumberFormat('#,##,###').format(hall.pricePerDay)}',
                    _bookingType == 'full_day',
                    () => setState(() => _bookingType = 'full_day'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _bookingTypeCard(
                    'Half Day',
                    'AM or PM Session',
                    '₹${NumberFormat('#,##,###').format(hall.pricePerHalf ?? hall.pricePerDay / 2)}',
                    _bookingType == 'half_day',
                    () => setState(() => _bookingType = 'half_day'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Date picker
            const Text('Select Event Date', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.dividerColor),
              ),
              child: TableCalendar(
                firstDay: DateTime.now(),
                lastDay: DateTime.now().add(const Duration(days: 365 * 2)),
                focusedDay: _selectedDate ?? DateTime.now(),
                selectedDayPredicate: (day) => isSameDay(_selectedDate, day),
                onDaySelected: (selectedDay, focusedDay) {
                  final normalized = DateTime(selectedDay.year, selectedDay.month, selectedDay.day);
                  if (!bookedSet.contains(normalized)) {
                    setState(() => _selectedDate = selectedDay);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('This date is already booked. Please select another date.'),
                        backgroundColor: AppTheme.errorColor,
                      ),
                    );
                  }
                },
                enabledDayPredicate: (day) {
                  final normalized = DateTime(day.year, day.month, day.day);
                  return !bookedSet.contains(normalized);
                },
                calendarStyle: CalendarStyle(
                  selectedDecoration: const BoxDecoration(
                    color: AppTheme.primaryColor,
                    shape: BoxShape.circle,
                  ),
                  todayDecoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.3),
                    shape: BoxShape.circle,
                  ),
                  disabledTextStyle: const TextStyle(color: Colors.red),
                  disabledDecoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                ),
                headerStyle: const HeaderStyle(
                  formatButtonVisible: false,
                  titleCentered: true,
                  titleTextStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ),

            if (_selectedDate != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.successColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.successColor.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: AppTheme.successColor, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'Selected: ${DateFormat('EEEE, dd MMMM yyyy').format(_selectedDate!)}',
                      style: const TextStyle(color: AppTheme.successColor, fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 20),

            // Notes
            const Text('Special Notes (Optional)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(hintText: 'Any special requirements...'),
            ),
            const SizedBox(height: 20),

            // Price summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.cardLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.dividerColor),
              ),
              child: Column(
                children: [
                  _summaryRow('Hall Booking (${_bookingType == 'full_day' ? 'Full Day' : 'Half Day'})', price),
                  const Divider(height: 16),
                  _summaryRow('Total Amount', price, isBold: true, isHighlight: true),
                ],
              ),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading || _selectedDate == null ? null : () => _confirmBooking(hall, price),
                child: _isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Confirm Booking'),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _bookingTypeCard(String title, String subtitle, String price, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primaryColor.withOpacity(0.05) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? AppTheme.primaryColor : AppTheme.dividerColor,
            width: selected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(selected ? Icons.radio_button_checked : Icons.radio_button_off,
                color: selected ? AppTheme.primaryColor : Colors.grey, size: 20),
            const SizedBox(height: 8),
            Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: selected ? AppTheme.primaryColor : AppTheme.textPrimary)),
            Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
            const SizedBox(height: 4),
            Text(price, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, double amount, {bool isBold = false, bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: 14, fontWeight: isBold ? FontWeight.bold : FontWeight.normal, color: AppTheme.textSecondary)),
        Text(
          '₹${NumberFormat('#,##,###').format(amount)}',
          style: TextStyle(
            fontSize: isBold ? 16 : 14,
            fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            color: isHighlight ? AppTheme.primaryColor : AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }

  Future<void> _confirmBooking(HallModel hall, double price) async {
    setState(() => _isLoading = true);
    try {
      final authState = ref.read(authStateProvider);
      String? userId;
      authState.whenData((user) => userId = user?.uid);

      if (userId == null) {
        context.go('/login');
        return;
      }

      final userProfile = await ref.read(authServiceProvider).getUserProfile(userId!);

      final booking = await ref.read(bookingServiceProvider).createBooking(
        userId: userId!,
        hallId: hall.hallId,
        hallName: hall.hallName,
        userName: userProfile?.name ?? 'User',
        userPhone: userProfile?.phone ?? '',
        eventDate: _selectedDate!,
        totalAmount: price,
        bookingType: _bookingType,
        notes: _notesController.text.isEmpty ? null : _notesController.text,
      );

      if (mounted) {
        context.go('/booking-confirmation/${booking.bookingId}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: AppTheme.errorColor),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}
