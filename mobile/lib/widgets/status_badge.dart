import 'package:flutter/material.dart';
import '../core/theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final double fontSize;

  const StatusBadge({super.key, required this.status, this.fontSize = 11});

  @override
  Widget build(BuildContext context) {
    final config = _getConfig(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: config.bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: config.border, width: 0.5),
      ),
      child: Text(
        config.label,
        style: TextStyle(
          color: config.text,
          fontSize: fontSize,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  _StatusConfig _getConfig(String status) {
    return switch (status.toLowerCase()) {
      'confirmed' => _StatusConfig('Confirmed', AppColors.success, AppColors.success.withValues(alpha: 0.1), AppColors.success.withValues(alpha: 0.2)),
      'pending' => _StatusConfig('Pending', AppColors.warning, AppColors.warning.withValues(alpha: 0.1), AppColors.warning.withValues(alpha: 0.2)),
      'completed' => _StatusConfig('Completed', AppColors.primary, AppColors.primary.withValues(alpha: 0.1), AppColors.primary.withValues(alpha: 0.2)),
      'cancelled' => _StatusConfig('Cancelled', AppColors.error, AppColors.error.withValues(alpha: 0.1), AppColors.error.withValues(alpha: 0.2)),
      'no-show' => _StatusConfig('No-Show', const Color(0xFFEA580C), const Color(0xFFFFF7ED), const Color(0xFFFFEDD5)),
      'rescheduling' => _StatusConfig('Rescheduling', const Color(0xFF2563EB), const Color(0xFFEFF6FF), const Color(0xFFDBEAFE)),
      'expired' => _StatusConfig('Expired', AppColors.textMuted, const Color(0xFFF3F4F6), const Color(0xFFE5E7EB)),
      'paid' => _StatusConfig('Paid', AppColors.success, AppColors.success.withValues(alpha: 0.1), AppColors.success.withValues(alpha: 0.2)),
      'refunded' => _StatusConfig('Refunded', const Color(0xFF2563EB), const Color(0xFFEFF6FF), const Color(0xFFDBEAFE)),
      'approved' => _StatusConfig('Approved', AppColors.success, AppColors.success.withValues(alpha: 0.1), AppColors.success.withValues(alpha: 0.2)),
      'rejected' => _StatusConfig('Rejected', AppColors.error, AppColors.error.withValues(alpha: 0.1), AppColors.error.withValues(alpha: 0.2)),
      _ => _StatusConfig(status, AppColors.textSecondary, AppColors.divider, AppColors.border),
    };
  }
}

class _StatusConfig {
  final String label;
  final Color text;
  final Color bg;
  final Color border;
  _StatusConfig(this.label, this.text, this.bg, this.border);
}
