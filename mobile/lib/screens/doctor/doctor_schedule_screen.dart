import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/shimmer_loading.dart';
import '../../widgets/toast.dart';

class DoctorScheduleScreen extends StatefulWidget {
  const DoctorScheduleScreen({super.key});

  @override
  State<DoctorScheduleScreen> createState() => _DoctorScheduleScreenState();
}

class _DoctorScheduleScreenState extends State<DoctorScheduleScreen> {
  List<Map<String, dynamic>> _schedule = [];
  bool _loading = true;
  bool _saving = false;

  final _days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  final _allSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchSchedule());
  }

  Future<void> _fetchSchedule() async {
    try {
      final res = await ApiService.getDoctorProfile();
      final doctor = res.data['doctor'] ?? {};
      final schedule = doctor['schedule'] as List? ?? [];
      setState(() {
        _schedule = _days.map((day) {
          final existing = schedule.firstWhere(
            (s) => s['day'] == day,
            orElse: () => null,
          );
          return {
            'day': day,
            'isActive': existing?['isActive'] ?? false,
            'slots': List<String>.from(existing?['slots'] ?? []),
          };
        }).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _saveSchedule() async {
    setState(() => _saving = true);
    try {
      final activeSchedule = _schedule.where((s) => s['isActive'] == true && (s['slots'] as List).isNotEmpty).toList();
      await ApiService.updateSchedule({'schedule': activeSchedule});
      if (mounted) AppToast.show(context, 'Schedule saved', type: ToastType.success);
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to save schedule', type: ToastType.error);
    }
    setState(() => _saving = false);
  }

  void _toggleDay(int index) {
    setState(() {
      _schedule[index]['isActive'] = !_schedule[index]['isActive'];
    });
  }

  void _toggleSlot(int dayIndex, String slot) {
    setState(() {
      final slots = _schedule[dayIndex]['slots'] as List<String>;
      if (slots.contains(slot)) {
        slots.remove(slot);
      } else {
        slots.add(slot);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('My Schedule', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.5)),
                  SizedBox(
                    height: 42,
                    child: ElevatedButton.icon(
                      onPressed: _saving ? null : _saveSchedule,
                      icon: _saving
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.white)))
                          : const Icon(Iconsax.tick_circle, size: 18),
                      label: Text(_saving ? 'Saving...' : 'Save'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 18),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 300.ms),

            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text('Set your available days and time slots', style: TextStyle(fontSize: 13, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
            ),

            const SizedBox(height: 16),

            Expanded(
              child: _loading
                  ? Padding(padding: const EdgeInsets.all(20), child: ShimmerList(itemCount: 5, itemHeight: 80))
                  : ListView.separated(
                      physics: const ClampingScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                      itemCount: _schedule.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 12),
                      itemBuilder: (context, i) => _buildDayCard(i),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDayCard(int index) {
    final day = _schedule[index];
    final isActive = day['isActive'] == true;
    final slots = day['slots'] as List<String>;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: isActive ? AppColors.primary.withValues(alpha: 0.3) : AppColors.border.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.2), blurRadius: 8)],
      ),
      child: Column(
        children: [
          // Day header
          GestureDetector(
            onTap: () => _toggleDay(index),
            child: Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: isActive ? AppColors.primary.withValues(alpha: 0.1) : AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        day['day'].toString().substring(0, 2),
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: isActive ? AppColors.primary : AppColors.textMuted,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(day['day'], style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: isActive ? AppColors.textPrimary : AppColors.textMuted)),
                        Text(
                          isActive ? '${slots.length} slots selected' : 'Unavailable',
                          style: TextStyle(fontSize: 12, color: isActive ? AppColors.primary : AppColors.textMuted, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                  Switch.adaptive(
                    value: isActive,
                    onChanged: (_) => _toggleDay(index),
                    activeTrackColor: AppColors.primary,
                    activeThumbColor: Colors.white,
                  ),
                ],
              ),
            ),
          ),

          // Slots
          if (isActive) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _allSlots.map((slot) {
                  final isSelected = slots.contains(slot);
                  return GestureDetector(
                    onTap: () => _toggleSlot(index, slot),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.surface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
                      ),
                      child: Text(
                        slot,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ],
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 40 * index), duration: 300.ms);
  }
}
