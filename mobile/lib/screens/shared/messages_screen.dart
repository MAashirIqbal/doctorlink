import 'dart:async';
import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/avatar_widget.dart';

class MessagesScreen extends StatefulWidget {
  /// Optional auto-open: pass `withId` to jump straight into a thread.
  /// `withId` = doctorProfileId for patient role, patientUserId for doctor role.
  final String? withId;
  const MessagesScreen({super.key, this.withId});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  List<Map<String, dynamic>> _conversations = [];
  Map<String, dynamic>? _activeConvo;
  String? _activeId;
  List<Map<String, dynamic>> _thread = [];
  final _draftController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _pollTimer;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _activeId = widget.withId;
    _refresh(initial: true);
    _pollTimer = Timer.periodic(const Duration(seconds: 8), (_) => _refresh());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _draftController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _refresh({bool initial = false}) async {
    try {
      final res = await ApiService.listConversations();
      final list = ((res.data?['conversations'] as List?) ?? [])
          .cast<Map<String, dynamic>>();
      if (!mounted) return;
      setState(() {
        _conversations = list;
        if (_activeId != null && _activeConvo == null) {
          _activeConvo = list.firstWhere(
            (c) =>
                (c['doctorProfileId']?.toString() == _activeId) ||
                (c['otherUserId']?.toString() == _activeId),
            orElse: () => <String, dynamic>{},
          );
          if (_activeConvo!.isEmpty) _activeConvo = null;
        }
      });
      if (_activeId != null) await _loadThread(_activeId!);
    } catch (_) {/* ignore */}
  }

  Future<void> _loadThread(String id) async {
    try {
      final res = await ApiService.getMessageThread(id);
      final list =
          ((res.data?['messages'] as List?) ?? []).cast<Map<String, dynamic>>();
      if (!mounted) return;
      setState(() => _thread = list);
      // mark thread read (silent)
      try {
        await ApiService.markThreadRead(id);
      } catch (_) {/* ignore */}
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
        }
      });
    } catch (_) {/* ignore */}
  }

  void _openConversation(Map<String, dynamic> c) {
    final role = context.read<AuthProvider>().role;
    final id = role == 'patient'
        ? c['doctorProfileId']?.toString()
        : c['otherUserId']?.toString();
    if (id == null) return;
    setState(() {
      _activeId = id;
      _activeConvo = c;
      _thread = [];
    });
    _loadThread(id);
  }

  Future<void> _send() async {
    final body = _draftController.text.trim();
    if (body.isEmpty || _activeId == null) return;
    setState(() => _sending = true);
    try {
      await ApiService.sendMessage(_activeId!, body);
      _draftController.clear();
      await _loadThread(_activeId!);
      _refresh();
    } catch (_) {/* ignore */}
    if (mounted) setState(() => _sending = false);
  }

  @override
  Widget build(BuildContext context) {
    final role = context.watch<AuthProvider>().role;
    final myUserId = context.watch<AuthProvider>().user?['_id']?.toString();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
        leading: _activeId != null
            ? IconButton(
                icon: const Icon(Iconsax.arrow_left),
                onPressed: () => setState(() {
                  _activeId = null;
                  _activeConvo = null;
                  _thread = [];
                }),
              )
            : null,
      ),
      body: _activeId == null
          ? _buildList(role)
          : _buildThread(role, myUserId),
    );
  }

  Widget _buildList(String? role) {
    if (_conversations.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Iconsax.message, size: 56, color: AppColors.textMuted),
              const SizedBox(height: 14),
              Text('No conversations yet',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 6),
              Text(
                role == 'patient'
                    ? 'Tap a doctor profile and Send Message to start.'
                    : 'Patients you treat will appear here when they message you.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => _refresh(),
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _conversations.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, i) {
          final c = _conversations[i];
          final unread = (c['unread'] ?? 0) as int;
          return Material(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            child: InkWell(
              borderRadius: BorderRadius.circular(18),
              onTap: () => _openConversation(c),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                child: Row(
                  children: [
                    Builder(builder: (_) {
                      final url = resolveAvatarUrl(c['avatar'] as String?);
                      return CircleAvatar(
                        radius: 24,
                        backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                        backgroundImage: url.isNotEmpty ? NetworkImage(url) : null,
                        child: url.isEmpty
                            ? Text(
                                ((c['displayName'] as String?) ?? '?').characters.first.toUpperCase(),
                                style: const TextStyle(
                                    color: AppColors.primaryDark, fontWeight: FontWeight.w900),
                              )
                            : null,
                      );
                    }),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  (c['displayName'] as String?) ?? 'User',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 15,
                                    color: AppColors.textPrimary,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (unread > 0)
                                Container(
                                  margin: const EdgeInsets.only(left: 8),
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(99),
                                  ),
                                  child: Text(
                                    '$unread',
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w900),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 3),
                          Text(
                            (c['lastMessage'] as String?) ?? '',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildThread(String? role, String? myUserId) {
    return Column(
      children: [
        // Counterpart header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: AppColors.border.withValues(alpha: 0.4))),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                child: Text(
                  ((_activeConvo?['displayName'] as String?) ?? '?').characters.first.toUpperCase(),
                  style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w900),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      (_activeConvo?['displayName'] as String?) ?? 'Conversation',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
                    ),
                    if (_activeConvo?['displaySubtitle'] != null)
                      Text(
                        _activeConvo!['displaySubtitle'],
                        style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w700, fontSize: 11),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: _thread.isEmpty
              ? Center(
                  child: Text('Send the first message',
                      style: Theme.of(context).textTheme.bodyMedium))
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: _thread.length,
                  itemBuilder: (context, i) {
                    final m = _thread[i];
                    final mine = m['sender']?.toString() == myUserId;
                    return Align(
                      alignment: mine ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
                        decoration: BoxDecoration(
                          color: mine ? AppColors.primary : Colors.white,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16),
                            topRight: const Radius.circular(16),
                            bottomLeft: Radius.circular(mine ? 16 : 4),
                            bottomRight: Radius.circular(mine ? 4 : 16),
                          ),
                          border: mine
                              ? null
                              : Border.all(color: AppColors.border.withValues(alpha: 0.5)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              (m['body'] as String?) ?? '',
                              style: TextStyle(
                                color: mine ? Colors.white : AppColors.textPrimary,
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                                height: 1.35,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _formatTime(m['createdAt']?.toString()),
                              style: TextStyle(
                                color: mine ? Colors.white.withValues(alpha: 0.7) : AppColors.textMuted,
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        SafeArea(
          top: false,
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.border.withValues(alpha: 0.4))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _draftController,
                    maxLength: 2000,
                    minLines: 1,
                    maxLines: 4,
                    textCapitalization: TextCapitalization.sentences,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      counterText: '',
                      filled: true,
                      fillColor: AppColors.surface,
                      contentPadding:
                          const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Material(
                  color: AppColors.primary,
                  shape: const CircleBorder(),
                  child: InkWell(
                    customBorder: const CircleBorder(),
                    onTap: _sending ? null : _send,
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: _sending
                          ? const SizedBox(
                              width: 18, height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                valueColor: AlwaysStoppedAnimation(Colors.white),
                              ),
                            )
                          : const Icon(Iconsax.send_1, color: Colors.white, size: 20),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _formatTime(String? iso) {
    if (iso == null) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      final h = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final m = dt.minute.toString().padLeft(2, '0');
      final ampm = dt.hour < 12 ? 'AM' : 'PM';
      return '$h:$m $ampm';
    } catch (_) {
      return '';
    }
  }
}
