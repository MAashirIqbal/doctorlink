import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/avatar_widget.dart';
import '../../widgets/shimmer_loading.dart';
import '../../widgets/status_badge.dart';

class DoctorDashboard extends StatefulWidget {
  const DoctorDashboard({super.key});

  @override
  State<DoctorDashboard> createState() => _DoctorDashboardState();
}

class _DoctorDashboardState extends State<DoctorDashboard> {
  Map<String, dynamic> _stats = {};
  List<dynamic> _todayAppointments = [];
  List<dynamic> _recentReviews = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchData());
  }

  Future<void> _fetchData() async {
    try {
      final res = await ApiService.getDoctorDashboard();
      final data = res.data;
      setState(() {
        _stats = {
          'totalAppointments': data['totalAppointments'] ?? 0,
          'todayAppointments': data['todayAppointments'] ?? 0,
          'totalPatients': data['totalPatients'] ?? 0,
          'totalEarnings': data['totalEarnings'] ?? 0,
          'pendingAppointments': data['pendingAppointments'] ?? 0,
        };
        _todayAppointments = data['todaySchedule'] ?? [];
        _loading = false;
      });

      // Fetch reviews
      final doctorId = data['doctorId'];
      if (doctorId != null) {
        try {
          final reviewRes = await ApiService.getDoctorReviews(doctorId);
          setState(() => _recentReviews = (reviewRes.data['reviews'] ?? []).take(3).toList());
        } catch (_) {}
      }
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchData,
          color: AppColors.primary,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(parent: ClampingScrollPhysics()),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_getGreeting().toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.textMuted, letterSpacing: 2)),
                          const SizedBox(height: 6),
                          Text(
                            'Dr. ${auth.userName}',
                            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.5),
                          ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.pushNamed(context, '/notifications'),
                      child: Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border.withValues(alpha: 0.6)),
                          boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 10)],
                        ),
                        child: const Icon(Iconsax.notification, size: 20, color: AppColors.textSecondary),
                      ),
                    ),
                  ],
                ).animate().fadeIn(duration: 300.ms),

                const SizedBox(height: 28),

                // Earnings card
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF059669), Color(0xFF10B981)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [BoxShadow(color: const Color(0xFF059669).withValues(alpha: 0.3), blurRadius: 25, offset: const Offset(0, 12))],
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('TOTAL EARNINGS', style: TextStyle(fontSize: 10, color: Colors.white.withValues(alpha: 0.7), fontWeight: FontWeight.w900, letterSpacing: 3)),
                            const SizedBox(height: 6),
                            Text(
                              'Rs. ${_stats['totalEarnings'] ?? 0}',
                              style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(Iconsax.money_recive, size: 28, color: Colors.white),
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 100.ms, duration: 300.ms),

                const SizedBox(height: 20),

                // Stats
                if (_loading)
                  const ShimmerList(itemCount: 2, itemHeight: 80)
                else
                  GridView.count(
                    crossAxisCount: 3,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 1.1,
                    children: [
                      _buildStatCard('Today', '${_stats['todayAppointments'] ?? 0}', Iconsax.calendar_tick, AppColors.primary, 0),
                      _buildStatCard('Pending', '${_stats['pendingAppointments'] ?? 0}', Iconsax.clock, AppColors.warning, 1),
                      GestureDetector(
                        onTap: () => Navigator.pushNamed(context, '/doctor-patients'),
                        child: _buildStatCard('Patients', '${_stats['totalPatients'] ?? 0}', Iconsax.people, AppColors.accent, 2),
                      ),
                    ],
                  ),

                const SizedBox(height: 28),

                // Today's schedule
                const Text("Today's Schedule", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                const SizedBox(height: 14),

                if (_loading)
                  const ShimmerList(itemCount: 3, itemHeight: 90)
                else if (_todayAppointments.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: AppColors.primaryBg, shape: BoxShape.circle),
                          child: Icon(Iconsax.calendar_remove, size: 36, color: AppColors.primary.withValues(alpha: 0.5)),
                        ),
                        const SizedBox(height: 12),
                        const Text('No appointments today', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      ],
                    ),
                  ).animate().fadeIn(delay: 400.ms)
                else
                  ...List.generate(
                    _todayAppointments.length > 5 ? 5 : _todayAppointments.length,
                    (i) => _buildAppointmentCard(_todayAppointments[i], i),
                  ),

                // Recent reviews
                if (_recentReviews.isNotEmpty) ...[
                  const SizedBox(height: 28),
                  const Text('Recent Reviews', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                  const SizedBox(height: 14),
                  ...List.generate(_recentReviews.length, (i) => _buildReviewCard(_recentReviews[i], i)),
                ],

                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color, int index) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 8)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(9)),
            child: Icon(icon, size: 16, color: color),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
              Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 150 + index * 60), duration: 300.ms);
  }

  Widget _buildAppointmentCard(Map<String, dynamic> apt, int index) {
    final patient = apt['patient'] as Map<String, dynamic>? ?? {};
    final status = apt['status'] ?? 'pending';
    final timeSlot = apt['timeSlot'] ?? '';

    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/doctor-appointment-detail', arguments: apt['_id']),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
          boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 10)],
        ),
        child: Row(
          children: [
            AvatarWidget(name: patient['name'] ?? 'Patient', imageUrl: patient['avatar'], size: 48, fontSize: 18),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(patient['name'] ?? 'Patient', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Iconsax.clock, size: 13, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Text(timeSlot, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                    ],
                  ),
                ],
              ),
            ),
            StatusBadge(status: status),
          ],
        ),
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 250 + index * 60), duration: 300.ms);
  }

  Widget _buildReviewCard(Map<String, dynamic> review, int index) {
    final patient = review['patient'] as Map<String, dynamic>? ?? {};
    final rating = (review['rating'] ?? 0).toDouble();
    String dateStr = '';
    try {
      dateStr = DateFormat('MMM dd').format(DateTime.parse(review['createdAt']));
    } catch (_) {}

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AvatarWidget(name: patient['name'] ?? '', imageUrl: patient['avatar'], size: 36, fontSize: 14),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(patient['name'] ?? 'Patient', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textPrimary))),
                    ...List.generate(5, (i) => Icon(Icons.star_rounded, size: 14, color: i < rating ? Colors.amber.shade600 : AppColors.border)),
                  ],
                ),
                if ((review['comment'] ?? '').toString().isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(review['comment'], style: const TextStyle(fontSize: 12, color: AppColors.textSecondary), maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
                const SizedBox(height: 2),
                Text(dateStr, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 600 + index * 80), duration: 300.ms);
  }
}
