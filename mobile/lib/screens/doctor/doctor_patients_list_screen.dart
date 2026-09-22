import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/avatar_widget.dart';
import '../../widgets/shimmer_loading.dart';

class DoctorPatientsListScreen extends StatefulWidget {
  const DoctorPatientsListScreen({super.key});

  @override
  State<DoctorPatientsListScreen> createState() => _DoctorPatientsListScreenState();
}

class _DoctorPatientsListScreenState extends State<DoctorPatientsListScreen> {
  List<Map<String, dynamic>> _patients = [];
  bool _loading = true;
  String _search = '';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetch());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.getDoctorPatients();
      final list = (res.data['patients'] as List?) ?? [];
      setState(() {
        _patients = list.cast<Map<String, dynamic>>();
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  List<Map<String, dynamic>> get _filtered {
    if (_search.isEmpty) return _patients;
    final q = _search.toLowerCase();
    return _patients.where((p) {
      final name = (p['name'] ?? '').toString().toLowerCase();
      final email = (p['email'] ?? '').toString().toLowerCase();
      final city = (p['city'] ?? '').toString().toLowerCase();
      return name.contains(q) || email.contains(q) || city.contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Patients'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: TextField(
              controller: _searchController,
              onChanged: (v) => setState(() => _search = v),
              decoration: InputDecoration(
                hintText: 'Search patients by name, city, or email',
                prefixIcon: const Icon(Iconsax.search_normal_1),
                suffixIcon: _search.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Iconsax.close_circle, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _search = '');
                        },
                      )
                    : null,
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const ShimmerList(itemCount: 5, itemHeight: 90)
                : _filtered.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Iconsax.profile_2user, size: 56, color: AppColors.textMuted),
                              const SizedBox(height: 14),
                              Text(_search.isEmpty ? 'No patients yet' : 'No patients match your search',
                                  style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 6),
                              Text(
                                _search.isEmpty
                                    ? 'Patients you see will appear here after their first completed appointment.'
                                    : 'Try a different search term.',
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _fetch,
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                          itemCount: _filtered.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (context, i) => _patientCard(_filtered[i], i),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _patientCard(Map<String, dynamic> p, int index) {
    final lastVisit = p['lastVisit']?.toString();
    String formattedLast = '—';
    if (lastVisit != null && lastVisit.isNotEmpty) {
      try {
        formattedLast = DateFormat('MMM d, yyyy').format(DateTime.parse(lastVisit));
      } catch (_) {/* keep — */}
    }
    final totalAppts = p['totalAppointments'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.2), blurRadius: 10, offset: const Offset(0, 3))],
      ),
      child: Row(
        children: [
          AvatarWidget(name: p['name'] ?? 'Patient', imageUrl: p['avatar'], size: 50, fontSize: 18),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(p['name'] ?? 'Patient',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                Row(
                  children: [
                    if ((p['city'] ?? '').toString().isNotEmpty) ...[
                      const Icon(Iconsax.location, size: 11, color: AppColors.textMuted),
                      const SizedBox(width: 3),
                      Text(p['city'],
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
                      const SizedBox(width: 10),
                    ],
                    const Icon(Iconsax.calendar_1, size: 11, color: AppColors.textMuted),
                    const SizedBox(width: 3),
                    Text('$totalAppts visit${totalAppts == 1 ? '' : 's'}',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
                  ],
                ),
                const SizedBox(height: 3),
                Text('Last: $formattedLast',
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primaryDark)),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Message',
            onPressed: () {
              final id = p['_id']?.toString();
              if (id != null) {
                Navigator.pushNamed(context, '/messages', arguments: id);
              }
            },
            icon: const Icon(Iconsax.message, color: AppColors.primary),
          ),
        ],
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 40 * index));
  }
}
