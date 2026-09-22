import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/avatar_widget.dart';
import '../../widgets/shimmer_loading.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/toast.dart';

class DoctorAppointmentsScreen extends StatefulWidget {
  const DoctorAppointmentsScreen({super.key});

  @override
  State<DoctorAppointmentsScreen> createState() => _DoctorAppointmentsScreenState();
}

class _DoctorAppointmentsScreenState extends State<DoctorAppointmentsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<dynamic> _appointments = [];
  bool _loading = true;
  final _tabs = const ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

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
      1 => 'pending',
      2 => 'confirmed',
      3 => 'completed',
      4 => 'cancelled',
      _ => '',
    };
  }

  Future<void> _fetchAppointments() async {
    setState(() => _loading = true);
    try {
      final params = _statusFilter.isNotEmpty ? {'status': _statusFilter} : null;
      final res = await ApiService.getDoctorAppointments(params: params);
      setState(() {
        _appointments = res.data['appointments'] ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _acceptAppointment(String id) async {
    try {
      await ApiService.acceptAppointment(id);
      if (mounted) AppToast.show(context, 'Appointment accepted', type: ToastType.success);
      _fetchAppointments();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to accept', type: ToastType.error);
    }
  }

  Future<void> _rejectAppointment(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Reject Appointment', style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text('Are you sure you want to reject this appointment?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Reject'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    try {
      await ApiService.rejectAppointment(id);
      if (mounted) AppToast.show(context, 'Appointment rejected', type: ToastType.success);
      _fetchAppointments();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to reject', type: ToastType.error);
    }
  }

  Future<void> _completeAppointment(String id) async {
    try {
      await ApiService.completeAppointment(id);
      if (mounted) AppToast.show(context, 'Appointment completed', type: ToastType.success);
      _fetchAppointments();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to complete', type: ToastType.error);
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
                'Appointments',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.5),
              ).animate().fadeIn(duration: 300.ms),
            ),
            const SizedBox(height: 16),

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
                indicator: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(12)),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                splashFactory: NoSplash.splashFactory,
                padding: EdgeInsets.zero,
                labelPadding: const EdgeInsets.symmetric(horizontal: 16),
                tabs: _tabs.map((t) => Tab(text: t)).toList(),
              ),
            ).animate().fadeIn(delay: 100.ms),

            const SizedBox(height: 16),

            Expanded(
              child: _loading
                  ? Padding(padding: const EdgeInsets.symmetric(horizontal: 20), child: ShimmerList(itemCount: 5, itemHeight: 130))
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
    final patient = apt['patient'] as Map<String, dynamic>? ?? {};
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

    return GestureDetector(
      onTap: () async {
        await Navigator.pushNamed(context, '/doctor-appointment-detail', arguments: apt['_id']);
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
                AvatarWidget(name: patient['name'] ?? 'Patient', imageUrl: patient['avatar'], size: 48, fontSize: 18),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(patient['name'] ?? 'Patient', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      const SizedBox(height: 2),
                      Text(patient['email'] ?? '', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                    ],
                  ),
                ),
                StatusBadge(status: status),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14)),
              child: Row(
                children: [
                  _infoChip(Iconsax.calendar_1, formattedDate),
                  const SizedBox(width: 14),
                  _infoChip(Iconsax.clock, timeSlot),
                  const Spacer(),
                  Text('Rs. $fee', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.primary)),
                ],
              ),
            ),
            // Action buttons
            if (status == 'pending') ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 40,
                      child: OutlinedButton(
                        onPressed: () => _rejectAppointment(apt['_id']),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.error,
                          side: const BorderSide(color: AppColors.error),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: EdgeInsets.zero,
                        ),
                        child: const Text('Reject', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: SizedBox(
                      height: 40,
                      child: ElevatedButton(
                        onPressed: () => _acceptAppointment(apt['_id']),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.success,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: EdgeInsets.zero,
                        ),
                        child: const Text('Accept', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
            if (status == 'confirmed') ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 40,
                child: ElevatedButton(
                  onPressed: () => _completeAppointment(apt['_id']),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Mark Complete', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
                ),
              ),
            ],
          ],
        ),
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 40 * index), duration: 300.ms);
  }

  Widget _infoChip(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.textMuted),
        const SizedBox(width: 5),
        Text(text, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
      ],
    );
  }
}
