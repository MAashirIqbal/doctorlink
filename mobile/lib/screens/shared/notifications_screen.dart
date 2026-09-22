import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/shimmer_loading.dart';
import '../../widgets/toast.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchNotifications());
  }

  Future<void> _fetchNotifications() async {
    try {
      final res = await ApiService.getMyNotifications();
      setState(() {
        _notifications = res.data['notifications'] ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _markAllRead() async {
    try {
      await ApiService.markAllNotificationsRead();
      setState(() {
        for (var n in _notifications) {
          n['isRead'] = true;
        }
      });
      if (mounted) AppToast.show(context, 'All marked as read', type: ToastType.success);
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to mark as read', type: ToastType.error);
    }
  }

  Future<void> _markRead(String id, int index) async {
    try {
      await ApiService.markNotificationRead(id);
      setState(() => _notifications[index]['isRead'] = true);
    } catch (_) {}
  }

  void _handleTap(Map<String, dynamic> notification, int index, bool isRead) {
    if (!isRead) _markRead(notification['_id'], index);
    final meta = notification['meta'] as Map<String, dynamic>? ?? {};
    final role = context.read<AuthProvider>().role;

    if (meta['appointmentId'] != null) {
      // Patient and doctor share appointment-detail route names; pick by role.
      if (role == 'doctor') {
        Navigator.pushNamed(context, '/doctor-appointment-detail', arguments: meta['appointmentId'].toString());
      } else {
        Navigator.pushNamed(context, '/appointment-detail', arguments: meta['appointmentId'].toString());
      }
      return;
    }
    if (meta['messageId'] != null) {
      Navigator.pushNamed(context, '/messages');
      return;
    }
    // No actionable payload — leave the user on the notifications screen.
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => n['isRead'] != true).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: const Text('Mark All Read', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
            ),
        ],
      ),
      body: _loading
          ? Padding(
              padding: const EdgeInsets.all(20),
              child: ShimmerList(itemCount: 6, itemHeight: 80),
            )
          : _notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Iconsax.notification, size: 64, color: AppColors.textMuted.withValues(alpha: 0.3)),
                      const SizedBox(height: 16),
                      const Text('No notifications', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
                      const SizedBox(height: 4),
                      const Text("You're all caught up!", style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchNotifications,
                  color: AppColors.primary,
                  child: ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(parent: ClampingScrollPhysics()),
                    padding: const EdgeInsets.all(20),
                    itemCount: _notifications.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 8),
                    itemBuilder: (context, i) => _buildNotificationCard(_notifications[i], i),
                  ),
                ),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> notification, int index) {
    final isRead = notification['isRead'] == true;
    final type = notification['type'] ?? 'info';
    final color = _getTypeColor(type);

    String timeAgo = '';
    try {
      final date = DateTime.parse(notification['createdAt']);
      final diff = DateTime.now().difference(date);
      if (diff.inMinutes < 60) {
        timeAgo = '${diff.inMinutes}m ago';
      } else if (diff.inHours < 24) {
        timeAgo = '${diff.inHours}h ago';
      } else if (diff.inDays < 7) {
        timeAgo = '${diff.inDays}d ago';
      } else {
        timeAgo = DateFormat('MMM dd').format(date);
      }
    } catch (_) {}

    return GestureDetector(
      onTap: () => _handleTap(notification, index, isRead),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isRead ? Colors.white : color.withValues(alpha: 0.04),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isRead ? AppColors.border.withValues(alpha: 0.5) : color.withValues(alpha: 0.2),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(_getTypeIcon(type), size: 18, color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification['title'] ?? '',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isRead ? FontWeight.w600 : FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      if (!isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification['message'] ?? '',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(timeAgo, style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 40 * index), duration: 300.ms);
  }

  Color _getTypeColor(String type) {
    return switch (type) {
      'success' => AppColors.success,
      'warning' => AppColors.warning,
      'error' => AppColors.error,
      'appointment' => AppColors.primary,
      'payment' => AppColors.success,
      _ => AppColors.primary,
    };
  }

  IconData _getTypeIcon(String type) {
    return switch (type) {
      'success' => Iconsax.tick_circle,
      'warning' => Iconsax.warning_2,
      'error' => Iconsax.close_circle,
      'appointment' => Iconsax.calendar_1,
      'payment' => Iconsax.money_recive,
      _ => Iconsax.notification,
    };
  }
}
