import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/avatar_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/toast.dart';

class DoctorAppointmentDetailScreen extends StatefulWidget {
  final String appointmentId;
  const DoctorAppointmentDetailScreen({super.key, required this.appointmentId});

  @override
  State<DoctorAppointmentDetailScreen> createState() => _DoctorAppointmentDetailScreenState();
}

class _DoctorAppointmentDetailScreenState extends State<DoctorAppointmentDetailScreen> {
  Map<String, dynamic>? _appointment;
  Map<String, dynamic>? _payment;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchDetail());
  }

  Future<void> _fetchDetail() async {
    try {
      final res = await ApiService.getAppointmentDetail(widget.appointmentId);
      setState(() {
        _appointment = res.data['appointment'];
        _payment = res.data['payment'];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _accept() async {
    try {
      await ApiService.acceptAppointment(widget.appointmentId);
      if (mounted) AppToast.show(context, 'Appointment accepted', type: ToastType.success);
      _fetchDetail();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to accept', type: ToastType.error);
    }
  }

  Future<void> _reject() async {
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
      await ApiService.rejectAppointment(widget.appointmentId);
      if (mounted) AppToast.show(context, 'Appointment rejected', type: ToastType.success);
      _fetchDetail();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to reject', type: ToastType.error);
    }
  }

  Future<void> _complete() async {
    try {
      await ApiService.completeAppointment(widget.appointmentId);
      if (mounted) AppToast.show(context, 'Appointment completed', type: ToastType.success);
      _fetchDetail();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to complete', type: ToastType.error);
    }
  }

  Future<void> _markNoShow() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Mark No-Show', style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text('Mark this patient as a no-show?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.warning),
            child: const Text('Mark No-Show'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    try {
      await ApiService.markNoShow(widget.appointmentId);
      if (mounted) AppToast.show(context, 'Marked as no-show', type: ToastType.success);
      _fetchDetail();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to mark no-show', type: ToastType.error);
    }
  }

  Future<void> _acceptReschedule() async {
    try {
      await ApiService.acceptReschedule(widget.appointmentId);
      if (mounted) AppToast.show(context, 'Reschedule accepted', type: ToastType.success);
      _fetchDetail();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to accept reschedule', type: ToastType.error);
    }
  }

  Future<void> _rejectReschedule() async {
    try {
      await ApiService.rejectReschedule(widget.appointmentId);
      if (mounted) AppToast.show(context, 'Reschedule rejected', type: ToastType.success);
      _fetchDetail();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to reject reschedule', type: ToastType.error);
    }
  }

  // ---- Prescription upload ----
  String? _rxPath;
  String? _rxName;
  final _rxNotesController = TextEditingController();
  bool _rxUploading = false;

  Future<void> _pickRxFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
        withData: false,
      );
      if (result != null && result.files.single.path != null) {
        setState(() {
          _rxPath = result.files.single.path;
          _rxName = result.files.single.name;
        });
      }
    } catch (e) {
      if (mounted) AppToast.show(context, 'Could not pick file', type: ToastType.error);
    }
  }

  Future<void> _uploadRx() async {
    if (_rxPath == null) {
      AppToast.show(context, 'Pick a file first', type: ToastType.warning);
      return;
    }
    setState(() => _rxUploading = true);
    try {
      await ApiService.uploadPrescription(widget.appointmentId, _rxPath!, notes: _rxNotesController.text.trim());
      if (mounted) AppToast.show(context, 'Prescription uploaded', type: ToastType.success);
      _rxPath = null;
      _rxName = null;
      _rxNotesController.clear();
      _fetchDetail();
    } catch (e) {
      if (mounted) AppToast.show(context, 'Upload failed', type: ToastType.error);
    }
    if (mounted) setState(() => _rxUploading = false);
  }

  // ---- Refer ----
  Future<void> _openReferralSheet() async {
    DateTime? selDate;
    final timeController = TextEditingController();
    final reasonController = TextEditingController();
    final searchController = TextEditingController();
    Map<String, dynamic>? selDoctor;
    List<Map<String, dynamic>> options = [];
    bool loadingList = true;
    bool sending = false;

    // Load doctors once
    Future<void> loadDoctors(StateSetter setSheet) async {
      try {
        final res = await ApiService.getDoctors(params: {'limit': 30});
        options = ((res.data['doctors'] as List?) ?? []).cast<Map<String, dynamic>>();
      } catch (_) {/* ignore */}
      setSheet(() => loadingList = false);
    }

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => StatefulBuilder(
        builder: (sheetCtx, setSheet) {
          if (loadingList && options.isEmpty) {
            loadDoctors(setSheet);
          }
          final filtered = options.where((d) {
            final q = searchController.text.toLowerCase();
            if (q.isEmpty) return true;
            return ((d['fullName'] ?? '') as String).toLowerCase().contains(q) ||
                ((d['specialization'] ?? '') as String).toLowerCase().contains(q);
          }).toList();
          return DraggableScrollableSheet(
            initialChildSize: 0.85,
            minChildSize: 0.5,
            maxChildSize: 0.95,
            expand: false,
            builder: (_, scrollController) => Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(20),
                children: [
                  Center(
                    child: Container(
                      width: 38, height: 4,
                      decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(99)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Refer to another doctor',
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  const Text('Pick a specialist, propose a slot, add a reason.',
                      style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600, fontSize: 12)),
                  const SizedBox(height: 16),
                  TextField(
                    controller: searchController,
                    onChanged: (_) => setSheet(() {}),
                    decoration: const InputDecoration(
                      hintText: 'Search by name or specialization',
                      prefixIcon: Icon(Iconsax.search_normal_1),
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (loadingList)
                    const Padding(
                      padding: EdgeInsets.all(20),
                      child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                    )
                  else if (filtered.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(16),
                      child: Center(child: Text('No matching doctors', style: TextStyle(color: AppColors.textMuted))),
                    )
                  else
                    ...filtered.take(12).map((d) {
                      final isSel = selDoctor?['_id'] == d['_id'];
                      return GestureDetector(
                        onTap: () => setSheet(() => selDoctor = d),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: isSel ? AppColors.primary.withValues(alpha: 0.1) : AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isSel ? AppColors.primary : AppColors.border.withValues(alpha: 0.4)),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 18,
                                backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                                child: Text(((d['fullName'] as String?) ?? '?').characters.first,
                                    style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w900)),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text((d['fullName'] as String?) ?? '',
                                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                                    Text((d['specialization'] as String?) ?? '',
                                        style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w700, fontSize: 11)),
                                  ],
                                ),
                              ),
                              if (isSel) const Icon(Iconsax.tick_circle, color: AppColors.primary, size: 18),
                            ],
                          ),
                        ),
                      );
                    }),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () async {
                            final picked = await showDatePicker(
                              context: sheetCtx,
                              initialDate: DateTime.now().add(const Duration(days: 1)),
                              firstDate: DateTime.now(),
                              lastDate: DateTime.now().add(const Duration(days: 60)),
                            );
                            if (picked != null) setSheet(() => selDate = picked);
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border.withValues(alpha: 0.4)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Iconsax.calendar_1, size: 16, color: AppColors.primary),
                                const SizedBox(width: 8),
                                Text(
                                  selDate == null ? 'Pick date' : DateFormat('MMM d, yyyy').format(selDate!),
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: timeController,
                          decoration: const InputDecoration(hintText: '10:00 AM'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: reasonController,
                    minLines: 2, maxLines: 4, maxLength: 300,
                    decoration: const InputDecoration(hintText: 'Reason for referral (optional)', counterText: ''),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity, height: 50,
                    child: ElevatedButton.icon(
                      onPressed: sending
                          ? null
                          : () async {
                              if (selDoctor == null || selDate == null || timeController.text.trim().isEmpty) {
                                AppToast.show(sheetCtx, 'Pick doctor, date, and time', type: ToastType.warning);
                                return;
                              }
                              setSheet(() => sending = true);
                              try {
                                await ApiService.referAppointment(widget.appointmentId, {
                                  'toDoctorId': selDoctor!['_id'],
                                  'date': selDate!.toIso8601String(),
                                  'timeSlot': timeController.text.trim(),
                                  'reason': reasonController.text.trim(),
                                });
                                if (mounted) {
                                  Navigator.pop(sheetCtx);
                                  AppToast.show(context, 'Referral sent', type: ToastType.success);
                                  _fetchDetail();
                                }
                              } catch (e) {
                                final msg = (e as dynamic).response?.data?['message'] ?? 'Referral failed';
                                AppToast.show(sheetCtx, msg, type: ToastType.error);
                              }
                              setSheet(() => sending = false);
                            },
                      icon: sending
                          ? const SizedBox(
                              width: 16, height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation(Colors.white)))
                          : const Icon(Iconsax.send_1, size: 16),
                      label: Text(sending ? 'Sending...' : 'Send Referral',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Appointment Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _appointment == null
              ? const Center(child: Text('Appointment not found'))
              : SingleChildScrollView(
                  physics: const ClampingScrollPhysics(),
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildStatusBanner().animate().fadeIn(duration: 300.ms),
                      const SizedBox(height: 20),
                      _buildPatientCard().animate().fadeIn(delay: 100.ms),
                      // Message Patient quick action
                      if (_appointment!['patient'] is Map &&
                          _appointment!['patient']['_id'] != null) ...[
                        const SizedBox(height: 10),
                        SizedBox(
                          width: double.infinity,
                          height: 44,
                          child: OutlinedButton.icon(
                            onPressed: () => Navigator.pushNamed(
                              context,
                              '/messages',
                              arguments: _appointment!['patient']['_id'].toString(),
                            ),
                            icon: const Icon(Iconsax.message, size: 16),
                            label: const Text('Message Patient', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.primary,
                              side: BorderSide(color: AppColors.primary.withValues(alpha: 0.4)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 16),
                      _buildInfoSection().animate().fadeIn(delay: 150.ms),
                      const SizedBox(height: 16),
                      if (_payment != null) _buildPaymentSection().animate().fadeIn(delay: 300.ms),

                      // Reschedule request
                      if (_appointment!['status'] == 'rescheduling' && _appointment!['pendingReschedule'] != null) ...[
                        const SizedBox(height: 16),
                        _buildRescheduleCard().animate().fadeIn(delay: 350.ms),
                      ],

                      // Prescription upload (only when completed)
                      if (_appointment!['status'] == 'completed') ...[
                        const SizedBox(height: 16),
                        _buildPrescriptionCard().animate().fadeIn(delay: 360.ms),
                      ],

                      const SizedBox(height: 24),
                      _buildActions().animate().fadeIn(delay: 400.ms),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatusBanner() {
    final status = _appointment!['status'] ?? 'pending';
    final color = _statusColor(status);
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Icon(_statusIcon(status), size: 28, color: color),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(status.toString().toUpperCase(), style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: color)),
                Text(_statusSubtitle(status), style: TextStyle(fontSize: 12, color: color.withValues(alpha: 0.7), fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPatientCard() {
    final patient = _appointment!['patient'] as Map<String, dynamic>? ?? {};
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 10)],
      ),
      child: Row(
        children: [
          AvatarWidget(name: patient['name'] ?? 'Patient', imageUrl: patient['avatar'], size: 56, fontSize: 22),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(patient['name'] ?? 'Patient', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                Text(patient['email'] ?? '', style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                if ((patient['phone'] ?? '').toString().isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(patient['phone'], style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection() {
    final dateStr = _appointment!['date'] ?? '';
    String formattedDate = '';
    try {
      formattedDate = DateFormat('EEEE, MMM dd, yyyy').format(DateTime.parse(dateStr));
    } catch (_) {
      formattedDate = dateStr;
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Appointment Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
          const SizedBox(height: 14),
          _detailRow(Iconsax.calendar_1, 'Date', formattedDate),
          _detailRow(Iconsax.clock, 'Time', _appointment!['timeSlot'] ?? ''),
          _detailRow(Iconsax.money_recive, 'Fee', 'Rs. ${_appointment!['fee'] ?? 0}'),
          if (_appointment!['notes'] != null && _appointment!['notes'].toString().isNotEmpty)
            _detailRow(Iconsax.note_1, 'Notes', _appointment!['notes']),
        ],
      ),
    );
  }

  Widget _buildPaymentSection() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Payment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
              StatusBadge(status: _payment!['status'] ?? 'pending'),
            ],
          ),
          const SizedBox(height: 14),
          _detailRow(Iconsax.money_recive, 'Amount', 'Rs. ${_payment!['amount'] ?? 0}'),
          if (_payment!['doctorEarning'] != null)
            _detailRow(Iconsax.wallet_1, 'Your Earning', 'Rs. ${_payment!['doctorEarning']}'),
        ],
      ),
    );
  }

  Widget _buildRescheduleCard() {
    final pending = _appointment!['pendingReschedule'] as Map<String, dynamic>? ?? {};
    String newDate = '';
    try {
      newDate = DateFormat('MMM dd, yyyy').format(DateTime.parse(pending['date']));
    } catch (_) {}

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFDBEAFE)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Iconsax.refresh, size: 20, color: Color(0xFF2563EB)),
              SizedBox(width: 8),
              Text('Reschedule Request', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF2563EB))),
            ],
          ),
          const SizedBox(height: 12),
          Text('New Date: $newDate', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          Text('New Time: ${pending['timeSlot'] ?? ''}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 42,
                  child: OutlinedButton(
                    onPressed: _rejectReschedule,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Reject', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: SizedBox(
                  height: 42,
                  child: ElevatedButton(
                    onPressed: _acceptReschedule,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Accept', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActions() {
    final status = _appointment!['status'] ?? '';
    return Column(
      children: [
        if (status == 'pending') ...[
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: OutlinedButton.icon(
                    onPressed: _reject,
                    icon: const Icon(Iconsax.close_circle, size: 18),
                    label: const Text('Reject'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 52,
                  child: ElevatedButton.icon(
                    onPressed: _accept,
                    icon: const Icon(Iconsax.tick_circle, size: 18),
                    label: const Text('Accept'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
        if (status == 'confirmed') ...[
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _complete,
              icon: const Icon(Iconsax.tick_square, size: 18),
              label: const Text('Mark Complete'),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _openReferralSheet,
              icon: const Icon(Iconsax.routing, size: 18),
              label: const Text('Refer to another doctor'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.info,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: OutlinedButton.icon(
              onPressed: _markNoShow,
              icon: const Icon(Iconsax.warning_2, size: 18),
              label: const Text('Mark No-Show'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.warning,
                side: const BorderSide(color: AppColors.warning),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildPrescriptionCard() {
    final rx = _appointment?['prescription'] as Map<String, dynamic>?;
    final hasUploaded = rx != null && (rx['url'] as String? ?? '').isNotEmpty;
    final url = hasUploaded ? rx['url'] as String : '';
    final fullUrl = url.startsWith('http') ? url : '${ApiService.baseUrl.replaceAll('/api', '')}$url';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Iconsax.document_text, color: AppColors.primaryDark, size: 18),
              const SizedBox(width: 8),
              const Text('Prescription',
                  style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.textPrimary, fontSize: 14)),
              const Spacer(),
              if (hasUploaded)
                GestureDetector(
                  onTap: () async {
                    final uri = Uri.parse(fullUrl);
                    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
                      if (mounted) AppToast.show(context, 'Could not open file', type: ToastType.error);
                    }
                  },
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('View', style: TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w900, fontSize: 12)),
                      SizedBox(width: 4),
                      Icon(Iconsax.export_3, size: 14, color: AppColors.primaryDark),
                    ],
                  ),
                ),
            ],
          ),
          if (hasUploaded) ...[
            const SizedBox(height: 6),
            const Text('A prescription is already attached. Re-upload below to replace.',
                style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600, fontSize: 11)),
          ],
          const SizedBox(height: 14),
          GestureDetector(
            onTap: _pickRxFile,
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
              ),
              child: Row(children: [
                const Icon(Iconsax.document_upload, color: AppColors.textMuted, size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    _rxName ?? 'Pick a PDF or image (max 5 MB)',
                    style: TextStyle(
                      color: _rxName == null ? AppColors.textSecondary : AppColors.textPrimary,
                      fontWeight: FontWeight.w700, fontSize: 12,
                    ),
                    maxLines: 1, overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (_rxName != null)
                  GestureDetector(
                    onTap: () => setState(() { _rxPath = null; _rxName = null; }),
                    child: const Icon(Iconsax.close_circle, color: AppColors.error, size: 16),
                  ),
              ]),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _rxNotesController,
            minLines: 2, maxLines: 3, maxLength: 500,
            decoration: const InputDecoration(hintText: 'Notes for the patient (optional)', counterText: ''),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton.icon(
              onPressed: _rxUploading ? null : _uploadRx,
              icon: _rxUploading
                  ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2.2, valueColor: AlwaysStoppedAnimation(Colors.white)))
                  : const Icon(Iconsax.cloud_add, size: 16),
              label: Text(_rxUploading ? 'Uploading...' : (hasUploaded ? 'Replace prescription' : 'Upload prescription'),
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(width: 12),
          Text('$label:', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textMuted)),
          const SizedBox(width: 8),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary), textAlign: TextAlign.right)),
        ],
      ),
    );
  }

  Color _statusColor(String s) => switch (s) {
    'confirmed' => AppColors.success,
    'pending' => AppColors.warning,
    'completed' => AppColors.primary,
    'cancelled' => AppColors.error,
    'no-show' => const Color(0xFFEA580C),
    'rescheduling' => const Color(0xFF2563EB),
    _ => AppColors.textMuted,
  };

  IconData _statusIcon(String s) => switch (s) {
    'confirmed' => Iconsax.tick_circle,
    'pending' => Iconsax.clock,
    'completed' => Iconsax.tick_square,
    'cancelled' => Iconsax.close_circle,
    'no-show' => Iconsax.warning_2,
    'rescheduling' => Iconsax.refresh,
    _ => Iconsax.info_circle,
  };

  String _statusSubtitle(String s) => switch (s) {
    'confirmed' => 'Appointment is confirmed',
    'pending' => 'Waiting for your confirmation',
    'completed' => 'This appointment is completed',
    'cancelled' => 'This appointment was cancelled',
    'no-show' => 'Patient did not attend',
    'rescheduling' => 'Reschedule request pending',
    _ => '',
  };
}
