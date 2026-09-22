import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/shimmer_loading.dart';

class DoctorEarningsScreen extends StatefulWidget {
  const DoctorEarningsScreen({super.key});

  @override
  State<DoctorEarningsScreen> createState() => _DoctorEarningsScreenState();
}

class _DoctorEarningsScreenState extends State<DoctorEarningsScreen> {
  Map<String, dynamic> _earnings = {};
  List<dynamic> _transactions = [];
  List<dynamic> _monthly = [];
  bool _loading = true;
  int _tabIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchEarnings());
  }

  Future<void> _fetchEarnings() async {
    try {
      final res = await ApiService.getDoctorEarnings();
      final data = res.data;
      setState(() {
        _earnings = {
          'totalEarnings': data['totalEarnings'] ?? 0,
          'thisMonth': data['thisMonth'] ?? 0,
          'paidAppointments': data['paidAppointments'] ?? 0,
          'avgPerAppointment': data['avgPerAppointment'] ?? 0,
        };
        _transactions = data['transactions'] ?? [];
        _monthly = data['monthlyEarnings'] ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Earnings'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _loading
          ? Padding(padding: const EdgeInsets.all(20), child: ShimmerList(itemCount: 5, itemHeight: 80))
          : RefreshIndicator(
              onRefresh: _fetchEarnings,
              color: AppColors.primary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(parent: ClampingScrollPhysics()),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Total earnings card
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
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('TOTAL EARNINGS', style: TextStyle(fontSize: 10, color: Colors.white.withValues(alpha: 0.7), fontWeight: FontWeight.w900, letterSpacing: 3)),
                          const SizedBox(height: 6),
                          Text(
                            'Rs. ${_earnings['totalEarnings'] ?? 0}',
                            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(duration: 300.ms),

                    const SizedBox(height: 16),

                    // Stats row
                    Row(
                      children: [
                        _buildMiniStat('This Month', 'Rs. ${_earnings['thisMonth'] ?? 0}', Iconsax.calendar_1, AppColors.primary),
                        const SizedBox(width: 10),
                        _buildMiniStat('Paid Visits', '${_earnings['paidAppointments'] ?? 0}', Iconsax.tick_circle, AppColors.success),
                        const SizedBox(width: 10),
                        _buildMiniStat('Avg/Visit', 'Rs. ${_earnings['avgPerAppointment'] ?? 0}', Iconsax.chart, AppColors.accent),
                      ],
                    ).animate().fadeIn(delay: 100.ms),

                    const SizedBox(height: 24),

                    // Tab toggle
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          _buildTab('Transactions', 0),
                          _buildTab('Monthly', 1),
                        ],
                      ),
                    ).animate().fadeIn(delay: 200.ms),

                    const SizedBox(height: 16),

                    if (_tabIndex == 0)
                      _buildTransactions()
                    else
                      _buildMonthly(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildMiniStat(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
          boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.2), blurRadius: 8)],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
            Text(label, style: TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String label, int index) {
    final isActive = _tabIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _tabIndex = index),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isActive ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 5)] : null,
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: isActive ? AppColors.primary : AppColors.textMuted,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTransactions() {
    if (_transactions.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border, width: 0.5),
        ),
        child: const Center(child: Text('No transactions yet', style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w500))),
      );
    }

    return Column(
      children: List.generate(
        _transactions.length,
        (i) {
          final tx = _transactions[i] as Map<String, dynamic>;
          final patient = tx['patient'] as Map<String, dynamic>? ?? {};
          String dateStr = '';
          try {
            dateStr = DateFormat('MMM dd, yyyy').format(DateTime.parse(tx['createdAt']));
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
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Iconsax.money_recive, size: 18, color: AppColors.success),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(patient['name'] ?? 'Patient', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      Text(dateStr, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    ],
                  ),
                ),
                Text(
                  '+Rs. ${tx['doctorEarning'] ?? tx['amount'] ?? 0}',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.success),
                ),
              ],
            ),
          ).animate().fadeIn(delay: Duration(milliseconds: 50 * i), duration: 300.ms);
        },
      ),
    );
  }

  Widget _buildMonthly() {
    if (_monthly.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border, width: 0.5),
        ),
        child: const Center(child: Text('No monthly data yet', style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w500))),
      );
    }

    final maxEarning = _monthly.fold<double>(0, (max, m) {
      final total = (m['total'] ?? 0).toDouble();
      return total > max ? total : max;
    });

    return Column(
      children: List.generate(
        _monthly.length,
        (i) {
          final m = _monthly[i] as Map<String, dynamic>;
          final total = (m['total'] ?? 0).toDouble();
          final count = m['count'] ?? 0;
          final progress = maxEarning > 0 ? total / maxEarning : 0.0;

          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(m['month'] ?? '', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    Text('Rs. ${total.toInt()}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.success)),
                  ],
                ),
                const SizedBox(height: 4),
                Text('$count appointments', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: AppColors.surface,
                    valueColor: const AlwaysStoppedAnimation(AppColors.success),
                    minHeight: 6,
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: Duration(milliseconds: 50 * i), duration: 300.ms);
        },
      ),
    );
  }
}
