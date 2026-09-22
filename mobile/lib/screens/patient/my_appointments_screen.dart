import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/avatar_widget.dart';
import '../../widgets/shimmer_loading.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/toast.dart';

class MyAppointmentsScreen extends StatefulWidget {
  const MyAppointmentsScreen({super.key});

  @override
  State<MyAppointmentsScreen> createState() => _MyAppointmentsScreenState();
}

class _MyAppointmentsScreenState extends State<MyAppointmentsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _appointments = [];
  bool _loading = true;
  final _tabs = const ['All', 'Upcoming', 'Pending', 'Completed', 'Cancelled'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) _fetchAppointments();
    });
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchAppointments());
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String get _statusFilter {
    return switch (_tabController.index) {
      1 => 'confirmed',
      2 => 'pending',
      3 => 'completed',
      4 => 'cancelled',
      _ => '',
    };
  }

  Future<void> _fetchAppointments() async {
    setState(() => _loading = true);
    try {
      final params = _statusFilter.isNotEmpty ? {'status': _statusFilter} : null;
      final res = await ApiService.getMyAppointments(params: params);
      setState(() {
        _appointments = res.data['appointments'] ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _cancelAppointment(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Cancel Appointment', style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text('Are you sure you want to cancel this appointment?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Cancel It'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    try {
      await ApiService.cancelAppointment(id, data: {'reason': 'Cancelled by patient'});
      if (!mounted) return;
      AppToast.show(context, 'Appointment cancelled', type: ToastType.success);
      _fetchAppointments();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to cancel', type: ToastType.error);
    }
  }

  Future<void> _payAppointment(String id) async {
    try {
      final res = await ApiService.createCheckout(id);
      final url = res.data['url'] as String?;
      if (url == null || url.isEmpty) {
        if (mounted) AppToast.show(context, 'Could not start payment', type: ToastType.error);
        return;
      }
      final ok = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
      if (!mounted) return;
      if (ok) {
        AppToast.show(context, 'Complete payment in browser, then pull to refresh', type: ToastType.info);
      } else {
        AppToast.show(context, 'Could not open Stripe', type: ToastType.error);
      }
    } catch (e) {
      if (mounted) {
        final msg = (e as dynamic).response?.data?['message'] ?? 'Could not start payment';
        AppToast.show(context, msg, type: ToastType.error);
      }
    }
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
              child: const Text(
                'My Appointments',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.5),
              ).animate().fadeIn(duration: 300.ms),
            ),
            const SizedBox(height: 16),

            // Tabs
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              height: 42,
              child: TabBar(
                controller: _tabController,
                isScrollable: true,
                tabAlignment: TabAlignment.start,
                labelColor: Colors.white,
                unselectedLabelColor: AppColors.textSecondary,
                labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                unselectedLabelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                indicator: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                splashFactory: NoSplash.splashFactory,
                padding: EdgeInsets.zero,
                labelPadding: const EdgeInsets.symmetric(horizontal: 16),
                tabs: _tabs.map((t) => Tab(text: t)).toList(),
              ),
            ).animate().fadeIn(delay: 100.ms),

            const SizedBox(height: 16),

            // List
            Expanded(
              child: _loading
                  ? Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: ShimmerList(itemCount: 5, itemHeight: 110),
                    )
                  : _appointments.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Iconsax.calendar_remove, size: 56, color: AppColors.textMuted.withValues(alpha: 0.4)),
                              const SizedBox(height: 12),
                              const Text('No appointments found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _fetchAppointments,
                          color: AppColors.primary,
                          child: ListView.separated(
                            physics: const AlwaysScrollableScrollPhysics(parent: ClampingScrollPhysics()),
                            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                            itemCount: _appointments.length,
                            separatorBuilder: (_, _) => const SizedBox(height: 12),
                            itemBuilder: (context, i) => _buildCard(_appointments[i], i),
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(Map<String, dynamic> apt, int index) {
    final doctor = apt['doctor'] as Map<String, dynamic>? ?? {};
    final status = apt['status'] ?? 'pending';
    final dateStr = apt['date'] ?? '';
    final timeSlot = apt['timeSlot'] ?? '';
    final fee = apt['fee'] ?? 0;

    String formattedDate = '';
    try {
      formattedDate = DateFormat('MMM dd, yyyy').format(DateTime.parse(dateStr));
    } catch (_) {
      formattedDate = dateStr;
    }

    final canCancel = status == 'pending' || status == 'confirmed';
    final paymentStatus = apt['paymentStatus'] ?? 'pending';
    final canPay = paymentStatus == 'pending' && (status == 'pending' || status == 'confirmed');

    return GestureDetector(
      onTap: () async {
        await Navigator.pushNamed(context, '/appointment-detail', arguments: apt['_id']);
        _fetchAppointments();
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
          boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 10)],
        ),
        child: Column(
          children: [
            Row(
              children: [
                AvatarWidget(name: doctor['fullName'] ?? 'Doctor', imageUrl: doctor['avatar'], size: 52, fontSize: 20),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(doctor['fullName'] ?? 'Doctor', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      const SizedBox(height: 2),
                      Text(doctor['specialization'] ?? '', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMuted)),
                    ],
                  ),
                ),
                StatusBadge(status: status),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Flexible(child: _buildInfoChip(Iconsax.calendar_1, formattedDate)),
                  const SizedBox(width: 12),
                  Flexible(child: _buildInfoChip(Iconsax.clock, timeSlot)),
                  const SizedBox(width: 12),
                  Text('Rs. $fee', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.primary)),
                ],
              ),
            ),
            if (canCancel || canPay) ...[
              const SizedBox(height: 10),
              Row(
                children: [
                  const Spacer(),
                  if (canPay) ...[
                    GestureDetector(
                      onTap: () => _payAppointment(apt['_id']),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Iconsax.card, size: 12, color: Colors.white),
                            SizedBox(width: 6),
                            Text('Pay Now', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  if (canCancel)
                    GestureDetector(
                      onTap: () => _cancelAppointment(apt['_id']),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.error.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text('Cancel', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.error)),
                      ),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 40 * index), duration: 300.ms);
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.textMuted),
        const SizedBox(width: 5),
        Flexible(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
          ),
        ),
      ],
    );
  }
}
