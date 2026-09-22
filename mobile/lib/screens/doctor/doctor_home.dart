import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/theme.dart';
import 'doctor_dashboard.dart';
import 'doctor_appointments_screen.dart';
import 'doctor_schedule_screen.dart';
import 'doctor_profile_screen.dart';
import '../shared/messages_screen.dart';

class DoctorHome extends StatefulWidget {
  const DoctorHome({super.key});

  @override
  State<DoctorHome> createState() => _DoctorHomeState();
}

class _DoctorHomeState extends State<DoctorHome> {
  int _currentIndex = 0;

  final _screens = const [
    DoctorDashboard(),
    DoctorAppointmentsScreen(),
    DoctorScheduleScreen(),
    MessagesScreen(),
    DoctorProfileScreenDoc(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
            child: Row(
              children: [
                Expanded(child: _buildNavItem(Iconsax.home_2, 'Home', 0)),
                Expanded(child: _buildNavItem(Iconsax.calendar_1, 'Bookings', 1)),
                Expanded(child: _buildNavItem(Iconsax.clock, 'Schedule', 2)),
                Expanded(child: _buildNavItem(Iconsax.message, 'Chats', 3)),
                Expanded(child: _buildNavItem(Iconsax.user, 'Profile', 4)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    final isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        margin: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary.withValues(alpha: 0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 22, color: isActive ? AppColors.primary : AppColors.textMuted),
            const SizedBox(height: 4),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: isActive ? AppColors.primary : AppColors.textMuted,
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
