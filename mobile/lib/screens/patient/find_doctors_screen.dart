import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/avatar_widget.dart';
import '../../widgets/shimmer_loading.dart';

class FindDoctorsScreen extends StatefulWidget {
  const FindDoctorsScreen({super.key});

  @override
  State<FindDoctorsScreen> createState() => _FindDoctorsScreenState();
}

class _FindDoctorsScreenState extends State<FindDoctorsScreen> {
  List<dynamic> _doctors = [];
  bool _loading = true;
  String _searchQuery = '';
  String _selectedSpecialization = 'All';
  final _searchController = TextEditingController();

  final _specializations = [
    'All', 'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist',
    'Orthopedic', 'Pediatrician', 'Psychiatrist', 'Gynecologist', 'ENT Specialist',
    'Ophthalmologist', 'Urologist', 'Dentist',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchDoctors());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchDoctors() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.getDoctors();
      setState(() {
        _doctors = res.data['doctors'] ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  List<dynamic> get _filteredDoctors {
    return _doctors.where((d) {
      final name = (d['fullName'] ?? '').toString().toLowerCase();
      final spec = (d['specialization'] ?? '').toString().toLowerCase();
      final matchesSearch = name.contains(_searchQuery.toLowerCase()) ||
          spec.contains(_searchQuery.toLowerCase());
      final matchesSpec = _selectedSpecialization == 'All' ||
          (d['specialization'] ?? '') == _selectedSpecialization;
      return matchesSearch && matchesSpec;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header + Search
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Find Doctors',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.5),
                  ).animate().fadeIn(duration: 300.ms),
                  const SizedBox(height: 4),
                  Text(
                    'Book appointments with top specialists',
                    style: TextStyle(fontSize: 13, color: AppColors.textMuted, fontWeight: FontWeight.w600),
                  ).animate().fadeIn(delay: 100.ms),
                  const SizedBox(height: 16),

                  // Search bar
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 10)],
                    ),
                    child: TextField(
                      controller: _searchController,
                      onChanged: (v) => setState(() => _searchQuery = v),
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                      decoration: InputDecoration(
                        hintText: 'Search by name or specialty...',
                        prefixIcon: const Icon(Iconsax.search_normal_1, size: 20, color: AppColors.textMuted),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.close, size: 18),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() => _searchQuery = '');
                                },
                              )
                            : null,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      ),
                    ),
                  ).animate().fadeIn(delay: 100.ms),

                  const SizedBox(height: 14),

                  // Specialization chips
                  SizedBox(
                    height: 38,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _specializations.length,
                      separatorBuilder: (_, _) => const SizedBox(width: 8),
                      itemBuilder: (context, i) {
                        final spec = _specializations[i];
                        final isActive = spec == _selectedSpecialization;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedSpecialization = spec),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: isActive ? AppColors.primary : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: isActive ? AppColors.primary : AppColors.border.withValues(alpha: 0.6)),
                            ),
                            child: Center(
                              child: Text(
                                spec,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: isActive ? Colors.white : AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ).animate().fadeIn(delay: 300.ms),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Doctor list
            Expanded(
              child: _loading
                  ? Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: ShimmerList(itemCount: 5, itemHeight: 120),
                    )
                  : _filteredDoctors.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Iconsax.search_status, size: 56, color: AppColors.textMuted.withValues(alpha: 0.4)),
                              const SizedBox(height: 12),
                              const Text('No doctors found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _fetchDoctors,
                          color: AppColors.primary,
                          child: ListView.separated(
                            physics: const AlwaysScrollableScrollPhysics(parent: ClampingScrollPhysics()),
                            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                            itemCount: _filteredDoctors.length,
                            separatorBuilder: (_, _) => const SizedBox(height: 12),
                            itemBuilder: (context, i) => _buildDoctorCard(_filteredDoctors[i], i),
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDoctorCard(Map<String, dynamic> doctor, int index) {
    final rating = (doctor['rating'] ?? 0).toDouble();
    final reviews = doctor['totalReviews'] ?? 0;
    final fee = doctor['fee'] ?? 0;

    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, '/doctor-profile', arguments: doctor['_id']),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
          boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 10)],
        ),
        child: Row(
          children: [
            AvatarWidget(
              name: doctor['fullName'] ?? 'Doctor',
              imageUrl: doctor['avatar'],
              size: 64,
              fontSize: 24,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    doctor['fullName'] ?? 'Doctor',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    doctor['specialization'] ?? '',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.star_rounded, size: 16, color: Colors.amber.shade600),
                      const SizedBox(width: 3),
                      Text(
                        rating.toStringAsFixed(1),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                      ),
                      Text(
                        ' ($reviews)',
                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                      ),
                      const SizedBox(width: 12),
                      Icon(Iconsax.location, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 3),
                      Expanded(
                        child: Text(
                          doctor['location'] ?? '',
                          style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Rs. $fee',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.success),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'Book Now',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 40 * index), duration: 300.ms);
  }
}
