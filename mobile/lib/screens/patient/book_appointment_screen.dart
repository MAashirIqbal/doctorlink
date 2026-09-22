import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/avatar_widget.dart';
import '../../widgets/toast.dart';

class BookAppointmentScreen extends StatefulWidget {
  final Map<String, dynamic> doctor;
  const BookAppointmentScreen({super.key, required this.doctor});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  DateTime? _selectedDate;
  String? _selectedSlot;
  List<String> _availableSlots = [];
  bool _loadingSlots = false;
  bool _loadingSchedule = true;
  bool _booking = false;
  final List<Map<String, dynamic>> _availableDates = [];
  List<dynamic> _schedule = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchSchedule());
  }

  Future<void> _fetchSchedule() async {
    try {
      final res = await ApiService.getDoctorSlots(widget.doctor['_id']);
      _schedule = res.data['schedule'] ?? [];
      _generateAvailableDates();
    } catch (e) {
      // Fallback: generate all 14 days
      _generateFallbackDates();
    }
    if (mounted) setState(() => _loadingSchedule = false);
  }

  void _generateAvailableDates() {
    // Dart weekday: 1=Monday..7=Sunday
    final days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    final now = DateTime.now();
    _availableDates.clear();

    for (int i = 0; i < 14 && _availableDates.length < 7; i++) {
      final d = now.add(Duration(days: i));
      final dayName = days[d.weekday];
      final sched = _schedule.firstWhere(
        (s) => s['day'] == dayName,
        orElse: () => null,
      );
      if (sched != null && sched['isActive'] != false) {
        final slots = List<String>.from(sched['slots'] ?? []);
        final filtered = _filterPastSlots(slots, d);
        if (filtered.isEmpty) continue;
        _availableDates.add({
          'date': d,
          'dayName': dayName,
          'allSlots': filtered,
        });
      }
    }
  }

  void _generateFallbackDates() {
    final now = DateTime.now();
    _availableDates.clear();
    for (int i = 0; i < 7; i++) {
      final d = now.add(Duration(days: i));
      _availableDates.add({
        'date': d,
        'dayName': DateFormat('EEEE').format(d),
        'allSlots': <String>[],
      });
    }
  }

  List<String> _filterPastSlots(List<String> slots, DateTime date) {
    final now = DateTime.now();
    if (date.year != now.year || date.month != now.month || date.day != now.day) {
      return slots;
    }
    // For today, filter out past slots
    return slots.where((slot) {
      try {
        final parsed = DateFormat('hh:mm a').parse(slot);
        final slotTime = DateTime(now.year, now.month, now.day, parsed.hour, parsed.minute);
        return slotTime.isAfter(now);
      } catch (_) {
        return true;
      }
    }).toList();
  }

  Future<void> _fetchSlots(DateTime date, List<String> daySlots) async {
    setState(() {
      _loadingSlots = true;
      _selectedSlot = null;
      _availableSlots = [];
    });
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(date);
      final res = await ApiService.getDoctorSlots(widget.doctor['_id'], params: {'date': dateStr});
      final bookedSlots = List<String>.from(res.data['bookedSlots'] ?? []);
      setState(() {
        _availableSlots = daySlots.where((s) => !bookedSlots.contains(s)).toList();
        _loadingSlots = false;
      });
    } catch (e) {
      // Fallback: show all day slots
      setState(() {
        _availableSlots = daySlots;
        _loadingSlots = false;
      });
    }
  }

  Future<void> _bookAppointment() async {
    if (_selectedDate == null || _selectedSlot == null) {
      AppToast.show(context, 'Please select a date and time slot', type: ToastType.warning);
      return;
    }
    setState(() => _booking = true);

    // Step 1: create the appointment row (status=pending, paymentStatus=pending)
    String? appointmentId;
    try {
      final res = await ApiService.createAppointment({
        'doctorId': widget.doctor['_id'],
        'date': DateFormat('yyyy-MM-dd').format(_selectedDate!),
        'timeSlot': _selectedSlot,
      });
      appointmentId = res.data['appointment']?['_id']?.toString();
    } catch (e) {
      if (mounted) {
        final msg = (e as dynamic).response?.data?['message'] ?? 'Failed to book appointment';
        AppToast.show(context, msg, type: ToastType.error);
      }
      setState(() => _booking = false);
      return;
    }

    if (appointmentId == null) {
      if (mounted) AppToast.show(context, 'Could not create appointment', type: ToastType.error);
      setState(() => _booking = false);
      return;
    }

    // Step 2: ask the backend for a Stripe checkout session URL
    String? checkoutUrl;
    try {
      final res = await ApiService.createCheckout(appointmentId);
      checkoutUrl = res.data['url'] as String?;
    } catch (e) {
      // Appointment was created but Stripe init failed — let the user retry from
      // the appointments list rather than losing the booking.
      if (mounted) {
        AppToast.show(context, 'Booking saved. Pay from My Appointments.', type: ToastType.warning);
        Navigator.pop(context, true);
      }
      setState(() => _booking = false);
      return;
    }

    setState(() => _booking = false);

    if (checkoutUrl == null || checkoutUrl.isEmpty) {
      if (mounted) {
        AppToast.show(context, 'Stripe URL missing. Pay from My Appointments.', type: ToastType.warning);
        Navigator.pop(context, true);
      }
      return;
    }

    if (!mounted) return;

    // Step 3: launch Stripe checkout in the device browser. The backend's
    // success_url redirects back to /patient/appointments?payment=success&
    // session_id=... which the web frontend uses; on mobile the Stripe webhook
    // updates DB in the background, so we just close this screen and let the
    // appointments list refresh on next view.
    final launched = await launchUrl(
      Uri.parse(checkoutUrl),
      mode: LaunchMode.externalApplication,
    );

    if (!mounted) return;
    if (launched) {
      // Show a quick info sheet so the user knows what's happening.
      await showDialog(
        context: context,
        builder: (_) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Complete payment in browser', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
          content: const Text(
            'You\'ve been taken to Stripe to pay. After payment, return to the app — your appointment will show as confirmed in My Appointments within a few seconds.',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, height: 1.5),
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Got it'),
            ),
          ],
        ),
      );
      if (mounted) Navigator.pop(context, true);
    } else {
      AppToast.show(context, 'Could not open Stripe. Try paying from My Appointments.', type: ToastType.error);
      Navigator.pop(context, true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final doctor = widget.doctor;
    final fee = doctor['fee'] ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Appointment'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        physics: const ClampingScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Doctor info card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
                boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 10)],
              ),
              child: Row(
                children: [
                  AvatarWidget(name: doctor['fullName'] ?? '', imageUrl: doctor['avatar'], size: 56, fontSize: 22),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(doctor['fullName'] ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                        Text(doctor['specialization'] ?? '', style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 4),
                        Text('Consultation Fee: Rs. $fee', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.success)),
                      ],
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 300.ms),

            const SizedBox(height: 28),

            // Select Date
            const Text('Select Date', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
            const SizedBox(height: 14),

            if (_loadingSchedule)
              const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator(color: AppColors.primary)))
            else if (_availableDates.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.border, width: 0.5),
                ),
                child: Column(
                  children: [
                    Icon(Iconsax.calendar_remove, size: 36, color: AppColors.textMuted.withValues(alpha: 0.4)),
                    const SizedBox(height: 8),
                    const Text('No available dates', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                    const Text('Doctor has no schedule set up', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
              )
            else
              SizedBox(
                height: 90,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _availableDates.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 10),
                  itemBuilder: (context, i) {
                    final dateInfo = _availableDates[i];
                    final date = dateInfo['date'] as DateTime;
                    final isSelected = _selectedDate != null &&
                        date.year == _selectedDate!.year &&
                        date.month == _selectedDate!.month &&
                        date.day == _selectedDate!.day;
                    final now = DateTime.now();
                    final isToday = date.year == now.year && date.month == now.month && date.day == now.day;

                    return GestureDetector(
                      onTap: () {
                        setState(() => _selectedDate = date);
                        _fetchSlots(date, List<String>.from(dateInfo['allSlots']));
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 68,
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary : Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: isSelected ? AppColors.primary : AppColors.border,
                            width: isSelected ? 2 : 1,
                          ),
                          boxShadow: isSelected
                              ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4))]
                              : null,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              isToday ? 'Today' : DateFormat('EEE').format(date),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: isSelected ? Colors.white70 : AppColors.textMuted,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              DateFormat('dd').format(date),
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: isSelected ? Colors.white : AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              DateFormat('MMM').format(date),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: isSelected ? Colors.white70 : AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ).animate().fadeIn(delay: 100.ms),

            const SizedBox(height: 28),

            // Select Time
            const Text('Select Time', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
            const SizedBox(height: 14),

            if (_selectedDate == null)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.border, width: 0.5),
                ),
                child: const Center(
                  child: Text('Please select a date first', style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w500)),
                ),
              )
            else if (_loadingSlots)
              const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator(color: AppColors.primary)))
            else if (_availableSlots.isEmpty)
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppColors.border, width: 0.5),
                ),
                child: Column(
                  children: [
                    Icon(Iconsax.clock, size: 40, color: AppColors.textMuted.withValues(alpha: 0.4)),
                    const SizedBox(height: 8),
                    const Text('No available slots', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                    const Text('Try another date', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
              )
            else
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: _availableSlots.map((slot) {
                  final isSelected = _selectedSlot == slot;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedSlot = slot),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                        ),
                        boxShadow: isSelected
                            ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.2), blurRadius: 8, offset: const Offset(0, 3))]
                            : null,
                      ),
                      child: Text(
                        slot,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

            const SizedBox(height: 32),

            // Summary
            if (_selectedDate != null && _selectedSlot != null)
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.15)),
                ),
                child: Column(
                  children: [
                    _buildSummaryRow('Doctor', doctor['fullName'] ?? ''),
                    _buildSummaryRow('Date', DateFormat('EEEE, MMM dd, yyyy').format(_selectedDate!)),
                    _buildSummaryRow('Time', _selectedSlot!),
                    _buildSummaryRow('Fee', 'Rs. $fee'),
                  ],
                ),
              ).animate().fadeIn(duration: 300.ms),

            const SizedBox(height: 24),

            // Book button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: (_selectedDate != null && _selectedSlot != null && !_booking) ? _bookAppointment : null,
                child: _booking
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation(Colors.white)))
                    : const Text('Confirm Booking', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
              ),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textMuted)),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
