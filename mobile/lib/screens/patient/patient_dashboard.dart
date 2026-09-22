import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

class PatientDashboard extends StatefulWidget {
  const PatientDashboard({super.key});

  @override
  State<PatientDashboard> createState() => _PatientDashboardState();
}

class _PatientDashboardState extends State<PatientDashboard> {
  Map<String, dynamic> _stats = {};
  List<dynamic> _upcoming = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ));
    // Render UI first (shimmer), then fetch data off the main thread
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchData());
  }

  Future<void> _fetchData() async {
    try {
      final res = await ApiService.getPatientDashboard();
      final data = res.data as Map<String, dynamic>? ?? {};
      // Backend shape: { stats: { totalAppointments, completedAppointments,
      // upcomingAppointments, doctorsConsulted }, upcomingAppointments: [...],
      // recentDoctors: [...] }. The "upcomingAppointments" key is overloaded
      // as both a stat int and the list — read the int from stats, not root.
      final stats = (data['stats'] as Map<String, dynamic>?) ?? {};
      final upcomingList = data['upcomingAppointments'];
      setState(() {
        _stats = {
          'totalAppointments': stats['totalAppointments'] ?? 0,
          'completedAppointments': stats['completedAppointments'] ?? 0,
          'upcomingAppointments': stats['upcomingAppointments'] ?? 0,
          'doctorsConsulted': stats['doctorsConsulted'] ?? 0,
        };
        _upcoming = (upcomingList is List) ? List<Map<String, dynamic>>.from(upcomingList) : [];
        _loading = false;
      });
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
      backgroundColor: AppColors.surface,
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
                // Header — matching web's font-black style
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _getGreeting(),
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.textMuted, letterSpacing: 2),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            auth.userName.isNotEmpty ? auth.userName : 'Patient',
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

                const SizedBox(height: 24),

                // Hero gradient card — emerald gradient matching web
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF16A34A), Color(0xFF15803D)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: [
                      BoxShadow(color: const Color(0xFF16A34A).withValues(alpha: 0.3), blurRadius: 25, offset: const Offset(0, 12)),
                    ],
                  ),
                  child: Stack(
                    children: [
                      // Decorative blur circle
                      Positioned(top: -20, right: -20, child: Container(width: 100, height: 100, decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.08)))),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(14)),
                                child: const Icon(Iconsax.health, size: 22, color: Colors.white),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Find a Doctor', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white)),
                                    const SizedBox(height: 2),
                                    Text('Book your appointment today', style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.7), fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 18),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () => Navigator.pushNamed(context, '/find-doctors'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: const Color(0xFF15803D),
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Text('Search Doctors', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                                  const SizedBox(width: 6),
                                  const Icon(Iconsax.arrow_right_3, size: 16),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ).animate().fadeIn(delay: 100.ms, duration: 300.ms),

                const SizedBox(height: 24),

                // Stats — 2x2 grid for breathing room
                if (_loading)
                  const ShimmerList(itemCount: 1, itemHeight: 80)
                else
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 1.85,
                    children: [
                      _buildStatCard('Total Visits', '${_stats['totalAppointments'] ?? 0}', Iconsax.calendar_tick, const Color(0xFF3B82F6), 0),
                      _buildStatCard('Completed', '${_stats['completedAppointments'] ?? 0}', Iconsax.tick_circle, const Color(0xFF059669), 1),
                      _buildStatCard('Upcoming', '${_stats['upcomingAppointments'] ?? 0}', Iconsax.clock, const Color(0xFFF59E0B), 2),
                      _buildStatCard('Doctors', '${_stats['doctorsConsulted'] ?? 0}', Iconsax.user_octagon, const Color(0xFF8B5CF6), 3),
                    ],
                  ),

                const SizedBox(height: 22),

                // Symptom Analyzer banner
                GestureDetector(
                  onTap: () => Navigator.pushNamed(context, '/symptom-analyzer'),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
                        begin: Alignment.topLeft, end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(22),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF8B5CF6).withValues(alpha: 0.25), blurRadius: 18, offset: const Offset(0, 10)),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 46, height: 46,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Iconsax.magic_star, color: Colors.white, size: 22),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(children: [
                                Text('Symptom Analyzer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15)),
                                SizedBox(width: 6),
                                Text('AI', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 9, letterSpacing: 1.3)),
                              ]),
                              SizedBox(height: 3),
                              Text('Describe what you feel — get matched specialists',
                                  style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w700, fontSize: 11, height: 1.35)),
                            ],
                          ),
                        ),
                        const Icon(Iconsax.arrow_right_3, color: Colors.white, size: 18),
                      ],
                    ),
                  ),
                ).animate().fadeIn(delay: 180.ms).slideY(begin: 0.1, end: 0),

                const SizedBox(height: 28),

                // Upcoming Appointments header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Upcoming Appointments', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.3)),
                    GestureDetector(
                      onTap: () {},
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text('See All', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.primary)),
                      ),
                    ),
                  ],
                ).animate().fadeIn(delay: 200.ms),

                const SizedBox(height: 14),

                if (_loading)
                  const ShimmerList(itemCount: 3, itemHeight: 100)
                else if (_upcoming.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: AppColors.border.withValues(alpha: 0.4)),
                    ),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.06),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Icon(Iconsax.calendar_remove, size: 32, color: AppColors.primary.withValues(alpha: 0.4)),
                        ),
                        const SizedBox(height: 16),
                        const Text('No upcoming appointments', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                        const SizedBox(height: 4),
                        Text('Book a doctor to get started', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textMuted)),
                      ],
                    ),
                  ).animate().fadeIn(delay: 250.ms)
                else
                  ...List.generate(
                    _upcoming.length > 3 ? 3 : _upcoming.length,
                    (i) => _buildAppointmentCard(_upcoming[i], i),
                  ),

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
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withValues(alpha: 0.15)),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(value,
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: color, letterSpacing: -0.5),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(label,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 150 + index * 50), duration: 300.ms);
  }

  Widget _buildAppointmentCard(Map<String, dynamic> apt, int index) {
    final doctor = apt['doctor'] as Map<String, dynamic>? ?? {};
    final dateStr = apt['date'] ?? '';
    final timeSlot = apt['timeSlot'] ?? '';
    final status = apt['status'] ?? 'pending';

    String formattedDate = '';
    try {
      final date = DateTime.parse(dateStr);
      formattedDate = DateFormat('MMM dd, yyyy').format(date);
    } catch (_) {
      formattedDate = dateStr;
    }

    final statusColor = switch (status) {
      'confirmed' => const Color(0xFF059669),
      'pending' => const Color(0xFFF59E0B),
      'completed' => const Color(0xFF3B82F6),
      _ => AppColors.textMuted,
    };

    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/appointment-detail', arguments: apt['_id']),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border.withValues(alpha: 0.3)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: Row(
          children: [
            // Left color accent bar
            Container(
              width: 4,
              height: 52,
              decoration: BoxDecoration(
                color: statusColor,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(width: 14),
            AvatarWidget(name: doctor['fullName'] ?? 'Doctor', imageUrl: doctor['avatar'], size: 46, fontSize: 17),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(doctor['fullName'] ?? 'Doctor', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  const SizedBox(height: 2),
                  Text(doctor['specialization'] ?? '', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMuted)),
                  const SizedBox(height: 6),
                  // Wrap so chips flow to a second line on narrow screens
                  // instead of overflowing horizontally next to the status badge.
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Iconsax.calendar_1, size: 11, color: AppColors.textMuted),
                            const SizedBox(width: 4),
                            Text(formattedDate, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Iconsax.clock, size: 11, color: AppColors.textMuted),
                            const SizedBox(width: 4),
                            Text(timeSlot, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            StatusBadge(status: status),
          ],
        ),
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 250 + index * 50), duration: 300.ms);
  }
}
