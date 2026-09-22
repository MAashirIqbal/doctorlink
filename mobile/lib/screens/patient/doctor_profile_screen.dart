import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:iconsax/iconsax.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/avatar_widget.dart';

class DoctorProfileScreen extends StatefulWidget {
  final String doctorId;
  const DoctorProfileScreen({super.key, required this.doctorId});

  @override
  State<DoctorProfileScreen> createState() => _DoctorProfileScreenState();
}

class _DoctorProfileScreenState extends State<DoctorProfileScreen> {
  Map<String, dynamic>? _doctor;
  List<dynamic> _reviews = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchData());
  }

  Future<void> _fetchData() async {
    try {
      final res = await ApiService.getDoctor(widget.doctorId);
      final reviewRes = await ApiService.getDoctorReviews(widget.doctorId);
      setState(() {
        _doctor = res.data['doctor'];
        _reviews = reviewRes.data['reviews'] ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _doctor == null
              ? const Center(child: Text('Doctor not found'))
              : CustomScrollView(
                  physics: const ClampingScrollPhysics(),
                  slivers: [
                    // App bar with gradient
                    SliverAppBar(
                      expandedHeight: 320,
                      pinned: true,
                      backgroundColor: AppColors.primary,
                      leading: IconButton(
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.arrow_back_ios_new, size: 16, color: Colors.white),
                        ),
                        onPressed: () => Navigator.pop(context),
                      ),
                      flexibleSpace: FlexibleSpaceBar(
                        background: Container(
                          decoration: const BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Color(0xFF16A34A), Color(0xFF15803D)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                          ),
                          child: SafeArea(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const SizedBox(height: 44),
                                AvatarWidget(
                                  name: _doctor!['fullName'] ?? '',
                                  imageUrl: _doctor!['avatar'],
                                  size: 100,
                                  fontSize: 40,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  _doctor!['fullName'] ?? '',
                                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.3),
                                ).animate().fadeIn(delay: 200.ms),
                                const SizedBox(height: 5),
                                Text(
                                  _doctor!['specialization'] ?? '',
                                  style: TextStyle(fontSize: 16, color: Colors.white.withValues(alpha: 0.85), fontWeight: FontWeight.w700),
                                ).animate().fadeIn(delay: 300.ms),
                                const SizedBox(height: 14),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.star_rounded, size: 18, color: Colors.amber.shade300),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${(_doctor!['rating'] ?? 0).toStringAsFixed(1)} (${_doctor!['totalReviews'] ?? 0} reviews)',
                                      style: TextStyle(fontSize: 15, color: Colors.white.withValues(alpha: 0.9), fontWeight: FontWeight.w700),
                                    ),
                                  ],
                                ).animate().fadeIn(delay: 400.ms),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),

                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Stats row
                            Row(
                              children: [
                                _buildStat('Experience', '${_doctor!['experience'] ?? 0} yrs', Iconsax.briefcase),
                                const SizedBox(width: 12),
                                _buildStat('Patients', '${_doctor!['totalPatients'] ?? 0}', Iconsax.people),
                                const SizedBox(width: 12),
                                _buildStat('Fee', 'Rs. ${_doctor!['fee'] ?? 0}', Iconsax.money_recive),
                              ],
                            ).animate().fadeIn(delay: 150.ms),

                            const SizedBox(height: 24),

                            // About
                            if ((_doctor!['about'] ?? '').toString().isNotEmpty) ...[
                              const Text('About', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                              const SizedBox(height: 8),
                              Text(
                                _doctor!['about'],
                                style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6),
                              ),
                              const SizedBox(height: 24),
                            ],

                            // Info cards
                            _buildInfoCard([
                              _buildInfoRow(Iconsax.location, 'Location', _doctor!['location'] ?? 'N/A'),
                              _buildInfoRow(Iconsax.book_1, 'Degree', _doctor!['degree'] ?? 'N/A'),
                              _buildInfoRow(Iconsax.language_square, 'Languages', (_doctor!['languages'] as List?)?.join(', ') ?? 'N/A'),
                            ]).animate().fadeIn(delay: 300.ms),

                            const SizedBox(height: 24),

                            // Reviews
                            Text('Reviews (${_reviews.length})', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                            const SizedBox(height: 14),

                            if (_reviews.isEmpty)
                              Container(
                                padding: const EdgeInsets.all(24),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
                                ),
                                child: const Center(
                                  child: Text('No reviews yet', style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w800)),
                                ),
                              )
                            else
                              ...List.generate(
                                _reviews.length > 5 ? 5 : _reviews.length,
                                (i) => _buildReviewCard(_reviews[i], i),
                              ),

                            const SizedBox(height: 100),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
      bottomSheet: _doctor != null
          ? Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 20, offset: const Offset(0, -5))],
              ),
              child: Row(
                children: [
                  SizedBox(
                    height: 56,
                    width: 56,
                    child: OutlinedButton(
                      onPressed: () => Navigator.pushNamed(
                        context,
                        '/messages',
                        arguments: _doctor!['_id']?.toString(),
                      ),
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.zero,
                        side: BorderSide(color: AppColors.primary.withValues(alpha: 0.4)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Icon(Iconsax.message, color: AppColors.primary, size: 22),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SizedBox(
                      height: 56,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pushNamed(context, '/book-appointment', arguments: _doctor),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: const Text('Book Appointment', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                      ),
                    ),
                  ),
                ],
              ),
            )
          : null,
    );
  }

  Widget _buildStat(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
          boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 8)],
        ),
        child: Column(
          children: [
            Icon(icon, size: 22, color: AppColors.primary),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
            const SizedBox(height: 2),
            Text(label, style: TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
        boxShadow: [BoxShadow(color: AppColors.border.withValues(alpha: 0.3), blurRadius: 10)],
      ),
      child: Column(children: children),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(width: 12),
          Text('$label: ', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textMuted)),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary))),
        ],
      ),
    );
  }

  Widget _buildReviewCard(Map<String, dynamic> review, int index) {
    final patient = review['patient'] as Map<String, dynamic>? ?? {};
    final rating = (review['rating'] ?? 0).toDouble();
    String dateStr = '';
    try {
      dateStr = DateFormat('MMM dd, yyyy').format(DateTime.parse(review['createdAt']));
    } catch (_) {}

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
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
              AvatarWidget(name: patient['name'] ?? 'Patient', imageUrl: patient['avatar'], size: 36, fontSize: 14),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(patient['name'] ?? 'Patient', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    Text(dateStr, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  ],
                ),
              ),
              RatingBarIndicator(
                rating: rating,
                itemBuilder: (_, _) => Icon(Icons.star_rounded, color: Colors.amber.shade600),
                itemCount: 5,
                itemSize: 16,
              ),
            ],
          ),
          if ((review['comment'] ?? '').toString().isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(review['comment'], style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5)),
          ],
        ],
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: 400 + index * 80), duration: 300.ms);
  }
}
