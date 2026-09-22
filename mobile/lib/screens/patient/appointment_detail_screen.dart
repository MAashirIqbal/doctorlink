import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/avatar_widget.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/toast.dart';

class AppointmentDetailScreen extends StatefulWidget {
  final String appointmentId;
  const AppointmentDetailScreen({super.key, required this.appointmentId});

  @override
  State<AppointmentDetailScreen> createState() => _AppointmentDetailScreenState();
}

class _AppointmentDetailScreenState extends State<AppointmentDetailScreen> {
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

  Future<void> _cancelAppointment() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Cancel Appointment', style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text('Are you sure you want to cancel?'),
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
      await ApiService.cancelAppointment(widget.appointmentId, data: {'reason': 'Cancelled by patient'});
      if (mounted) {
        AppToast.show(context, 'Appointment cancelled', type: ToastType.success);
        _fetchDetail();
      }
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to cancel', type: ToastType.error);
    }
  }

  void _showRatingDialog() {
    double rating = 5;
    final commentController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 20),
              const Text('Rate Your Experience', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              const SizedBox(height: 20),
              RatingBar.builder(
                initialRating: rating,
                minRating: 1,
                itemCount: 5,
                itemSize: 40,
                glow: false,
                unratedColor: AppColors.border,
                itemBuilder: (_, _) => Icon(Icons.star_rounded, color: Colors.amber.shade600),
                onRatingUpdate: (v) => setModalState(() => rating = v),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: commentController,
                maxLines: 3,
                decoration: const InputDecoration(hintText: 'Write a review (optional)'),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () async {
                    try {
                      await ApiService.createReview({
                        'doctor': _appointment!['doctor']['_id'],
                        'appointment': widget.appointmentId,
                        'rating': rating.toInt(),
                        'comment': commentController.text.trim(),
                      });
                      if (!ctx.mounted) return;
                      Navigator.pop(ctx);
                      if (!mounted) return;
                      AppToast.show(context, 'Review submitted!', type: ToastType.success);
                    } catch (e) {
                      if (mounted) AppToast.show(context, 'Failed to submit review', type: ToastType.error);
                    }
                  },
                  child: const Text('Submit Review'),
                ),
              ),
            ],
          ),
        ),
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
                      // Status banner
                      _buildStatusBanner().animate().fadeIn(duration: 300.ms),
                      const SizedBox(height: 20),

                      // Doctor card
                      _buildDoctorCard().animate().fadeIn(delay: 100.ms),
                      const SizedBox(height: 16),

                      // Appointment info
                      _buildInfoSection().animate().fadeIn(delay: 150.ms),
                      const SizedBox(height: 16),

                      // Prescription (only after completion)
                      if (_appointment!['status'] == 'completed' &&
                          _appointment!['prescription'] != null &&
                          (_appointment!['prescription']['url'] ?? '').toString().isNotEmpty)
                        _buildPrescriptionSection().animate().fadeIn(delay: 175.ms),
                      if (_appointment!['status'] == 'completed' &&
                          _appointment!['prescription'] != null &&
                          (_appointment!['prescription']['url'] ?? '').toString().isNotEmpty)
                        const SizedBox(height: 16),

                      // Referral notice
                      if (_appointment!['referredFrom'] != null &&
                          _appointment!['referredFrom']['appointment'] != null)
                        _buildReferralNotice().animate().fadeIn(delay: 180.ms),
                      if (_appointment!['referredFrom'] != null &&
                          _appointment!['referredFrom']['appointment'] != null)
                        const SizedBox(height: 16),

                      // Get directions (when confirmed and clinic geocoded)
                      if (_appointment!['status'] == 'confirmed' &&
                          _appointment!['doctor'] is Map &&
                          _appointment!['doctor']['latitude'] != null &&
                          _appointment!['doctor']['longitude'] != null)
                        _buildDirectionsButton().animate().fadeIn(delay: 185.ms),
                      if (_appointment!['status'] == 'confirmed' &&
                          _appointment!['doctor'] is Map &&
                          _appointment!['doctor']['latitude'] != null &&
                          _appointment!['doctor']['longitude'] != null)
                        const SizedBox(height: 16),

                      // Payment info
                      if (_payment != null) _buildPaymentSection().animate().fadeIn(delay: 200.ms),
                      const SizedBox(height: 20),

                      // Actions
                      _buildActions().animate().fadeIn(delay: 400.ms),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStatusBanner() {
    final status = _appointment!['status'] ?? 'pending';
    final config = _getStatusConfig(status);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: config.bg,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: config.border),
      ),
      child: Row(
        children: [
          Icon(config.icon, size: 28, color: config.color),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(config.title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: config.color)),
                const SizedBox(height: 2),
                Text(config.subtitle, style: TextStyle(fontSize: 12, color: config.color.withValues(alpha: 0.7), fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDoctorCard() {
    final doctor = _appointment!['doctor'] as Map<String, dynamic>? ?? {};
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
          AvatarWidget(name: doctor['fullName'] ?? 'Doctor', imageUrl: doctor['avatar'], size: 56, fontSize: 22),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(doctor['fullName'] ?? 'Doctor', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                Text(doctor['specialization'] ?? '', style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Iconsax.location, size: 13, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(doctor['location'] ?? '', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
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
          _buildDetailRow(Iconsax.calendar_1, 'Date', formattedDate),
          _buildDetailRow(Iconsax.clock, 'Time', _appointment!['timeSlot'] ?? ''),
          _buildDetailRow(Iconsax.money_recive, 'Fee', 'Rs. ${_appointment!['fee'] ?? 0}'),
          _buildDetailRow(Iconsax.status_up, 'Status', (_appointment!['status'] ?? 'pending').toString().toUpperCase()),
          if (_appointment!['notes'] != null && _appointment!['notes'].toString().isNotEmpty)
            _buildDetailRow(Iconsax.note_1, 'Notes', _appointment!['notes']),
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
          _buildDetailRow(Iconsax.money_recive, 'Amount', 'Rs. ${_payment!['amount'] ?? 0}'),
          _buildDetailRow(Iconsax.card, 'Method', (_payment!['method'] ?? 'N/A').toString().toUpperCase()),
        ],
      ),
    );
  }

  Widget _buildPrescriptionSection() {
    final rx = _appointment!['prescription'] as Map<String, dynamic>;
    final url = rx['url'] as String? ?? '';
    final notes = rx['notes'] as String? ?? '';
    final uploadedAt = rx['uploadedAt'] as String?;
    final fullUrl = url.startsWith('http') ? url : '${ApiService.baseUrl.replaceAll('/api', '')}$url';

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFECFDF5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFA7F3D0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Iconsax.document_text, color: AppColors.primaryDark, size: 20),
              const SizedBox(width: 10),
              const Expanded(
                child: Text('Prescription available',
                    style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.primaryDark, fontSize: 15)),
              ),
              if (uploadedAt != null)
                Text(
                  DateFormat('d MMM').format(DateTime.tryParse(uploadedAt)?.toLocal() ?? DateTime.now()),
                  style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w700, fontSize: 11),
                ),
            ],
          ),
          if (notes.isNotEmpty) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(notes,
                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 13)),
            ),
          ],
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton.icon(
              onPressed: () async {
                final uri = Uri.parse(fullUrl);
                if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
                  if (mounted) AppToast.show(context, 'Could not open file', type: ToastType.error);
                }
              },
              icon: const Icon(Iconsax.import_1, size: 16),
              label: const Text('Open prescription', style: TextStyle(fontWeight: FontWeight.w900)),
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

  Widget _buildReferralNotice() {
    final ref = _appointment!['referredFrom'] as Map<String, dynamic>;
    final reason = ref['reason'] as String? ?? '';
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFBFDBFE)),
      ),
      child: Row(
        children: [
          const Icon(Iconsax.routing_2, color: Color(0xFF1D4ED8), size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              reason.isNotEmpty
                  ? 'This appointment was created via a referral: $reason'
                  : 'This appointment was created via a doctor referral.',
              style: const TextStyle(color: Color(0xFF1E40AF), fontWeight: FontWeight.w700, fontSize: 12, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDirectionsButton() {
    final doc = _appointment!['doctor'] as Map<String, dynamic>;
    final lat = doc['latitude'];
    final lon = doc['longitude'];
    final location = doc['location'] as String? ?? '';
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
      ),
      child: Row(
        children: [
          const Icon(Iconsax.location, color: AppColors.primary, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  location.isNotEmpty ? location : 'Clinic location',
                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w800, fontSize: 13),
                  maxLines: 1, overflow: TextOverflow.ellipsis,
                ),
                const Text('Open turn-by-turn directions',
                    style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600, fontSize: 11)),
              ],
            ),
          ),
          ElevatedButton.icon(
            onPressed: () async {
              final url = 'https://www.google.com/maps/dir/?api=1&destination=$lat,$lon';
              final uri = Uri.parse(url);
              if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
                if (mounted) AppToast.show(context, 'Could not open Maps', type: ToastType.error);
              }
            },
            icon: const Icon(Iconsax.routing, size: 14),
            label: const Text('Directions', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions() {
    final status = _appointment!['status'] ?? '';
    final canCancel = status == 'pending' || status == 'confirmed';
    final canReschedule = (status == 'confirmed' || status == 'no-show') &&
        ((_appointment!['rescheduleCount'] ?? 0) < (_appointment!['maxReschedules'] ?? 2));
    final canReview = status == 'completed';

    return Column(
      children: [
        if (canReschedule) ...[
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _showRescheduleSheet,
              icon: const Icon(Iconsax.refresh_circle, size: 18),
              label: const Text('Reschedule'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
          const SizedBox(height: 12),
        ],
        if (canCancel)
          SizedBox(
            width: double.infinity,
            height: 52,
            child: OutlinedButton.icon(
              onPressed: _cancelAppointment,
              icon: const Icon(Iconsax.close_circle, size: 18),
              label: const Text('Cancel Appointment'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.error,
                side: const BorderSide(color: AppColors.error),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        if (canReview) ...[
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _showRatingDialog,
              icon: const Icon(Icons.star_rounded, size: 20),
              label: const Text('Rate & Review'),
            ),
          ),
        ],
      ],
    );
  }

  Future<void> _showRescheduleSheet() async {
    DateTime? selDate;
    final timeController = TextEditingController();
    bool sending = false;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => StatefulBuilder(
        builder: (sheetCtx, setSheet) => Container(
          padding: EdgeInsets.only(
            left: 20, right: 20, top: 16,
            bottom: MediaQuery.of(sheetCtx).viewInsets.bottom + 20,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 38, height: 4,
                  decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(99)),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Request reschedule',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.textPrimary)),
              const SizedBox(height: 4),
              Text(
                'Pick a new date and time. Your doctor needs to accept it.',
                style: const TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600, fontSize: 12),
              ),
              const SizedBox(height: 16),
              GestureDetector(
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
              const SizedBox(height: 12),
              TextField(
                controller: timeController,
                decoration: const InputDecoration(
                  hintText: 'Time slot, e.g. 10:00 AM',
                  prefixIcon: Icon(Iconsax.clock),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity, height: 50,
                child: ElevatedButton.icon(
                  onPressed: sending
                      ? null
                      : () async {
                          if (selDate == null || timeController.text.trim().isEmpty) {
                            AppToast.show(sheetCtx, 'Pick date and time', type: ToastType.warning);
                            return;
                          }
                          setSheet(() => sending = true);
                          try {
                            await ApiService.rescheduleAppointment(widget.appointmentId, {
                              'date': DateFormat('yyyy-MM-dd').format(selDate!),
                              'timeSlot': timeController.text.trim(),
                            });
                            if (mounted) {
                              Navigator.pop(sheetCtx);
                              AppToast.show(context, 'Reschedule requested', type: ToastType.success);
                              _fetchDetail();
                            }
                          } catch (e) {
                            final msg = (e as dynamic).response?.data?['message'] ?? 'Reschedule failed';
                            AppToast.show(sheetCtx, msg, type: ToastType.error);
                            setSheet(() => sending = false);
                          }
                        },
                  icon: sending
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2.4, valueColor: AlwaysStoppedAnimation(Colors.white)))
                      : const Icon(Iconsax.send_1, size: 16),
                  label: Text(sending ? 'Sending...' : 'Submit request',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
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

  _StatusBannerConfig _getStatusConfig(String status) {
    return switch (status) {
      'confirmed' => _StatusBannerConfig('Confirmed', 'Your appointment is confirmed', AppColors.success, AppColors.success.withValues(alpha: 0.1), AppColors.success.withValues(alpha: 0.2), Iconsax.tick_circle),
      'pending' => _StatusBannerConfig('Pending', 'Waiting for doctor confirmation', AppColors.warning, AppColors.warning.withValues(alpha: 0.1), AppColors.warning.withValues(alpha: 0.2), Iconsax.clock),
      'completed' => _StatusBannerConfig('Completed', 'This appointment has been completed', AppColors.primary, AppColors.primary.withValues(alpha: 0.1), AppColors.primary.withValues(alpha: 0.2), Iconsax.tick_square),
      'cancelled' => _StatusBannerConfig('Cancelled', 'This appointment was cancelled', AppColors.error, AppColors.error.withValues(alpha: 0.1), AppColors.error.withValues(alpha: 0.2), Iconsax.close_circle),
      'no-show' => _StatusBannerConfig('No-Show', 'You missed this appointment', const Color(0xFFEA580C), const Color(0xFFFFF7ED), const Color(0xFFFFEDD5), Iconsax.warning_2),
      'rescheduling' => _StatusBannerConfig('Rescheduling', 'Reschedule request pending', const Color(0xFF2563EB), const Color(0xFFEFF6FF), const Color(0xFFDBEAFE), Iconsax.refresh),
      _ => _StatusBannerConfig('Unknown', 'Status unknown', AppColors.textMuted, AppColors.divider, AppColors.border, Iconsax.info_circle),
    };
  }
}

class _StatusBannerConfig {
  final String title, subtitle;
  final Color color, bg, border;
  final IconData icon;
  _StatusBannerConfig(this.title, this.subtitle, this.color, this.bg, this.border, this.icon);
}
