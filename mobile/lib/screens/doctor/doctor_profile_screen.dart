import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/avatar_widget.dart';
import '../../widgets/toast.dart';

class DoctorProfileScreenDoc extends StatefulWidget {
  const DoctorProfileScreenDoc({super.key});

  @override
  State<DoctorProfileScreenDoc> createState() => _DoctorProfileScreenDocState();
}

class _DoctorProfileScreenDocState extends State<DoctorProfileScreenDoc> {
  Map<String, dynamic>? _doctor;
  bool _loading = true;
  bool _saving = false;
  bool _showPwSection = false;
  bool _changingPw = false;

  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _locationController = TextEditingController();
  final _aboutController = TextEditingController();
  final _feeController = TextEditingController();
  final _currentPwController = TextEditingController();
  final _newPwController = TextEditingController();
  final _confirmPwController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchProfile());
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _locationController.dispose();
    _aboutController.dispose();
    _feeController.dispose();
    _currentPwController.dispose();
    _newPwController.dispose();
    _confirmPwController.dispose();
    super.dispose();
  }

  Future<void> _fetchProfile() async {
    try {
      final res = await ApiService.getDoctorProfile();
      final doctor = res.data['doctor'];
      setState(() {
        _doctor = doctor;
        _fullNameController.text = doctor['fullName'] ?? '';
        _phoneController.text = doctor['phone'] ?? '';
        _locationController.text = doctor['location'] ?? '';
        _aboutController.text = doctor['about'] ?? '';
        _feeController.text = '${doctor['fee'] ?? ''}';
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _saveProfile() async {
    setState(() => _saving = true);
    try {
      await ApiService.updateDoctorProfile({
        'fullName': _fullNameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'location': _locationController.text.trim(),
        'about': _aboutController.text.trim(),
        'fee': int.tryParse(_feeController.text.trim()) ?? _doctor?['fee'] ?? 0,
      });
      if (mounted) AppToast.show(context, 'Profile updated', type: ToastType.success);
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to update profile', type: ToastType.error);
    }
    setState(() => _saving = false);
  }

  Future<void> _changePassword() async {
    if (_newPwController.text.length < 6) {
      AppToast.show(context, 'Password must be at least 6 characters', type: ToastType.warning);
      return;
    }
    if (_newPwController.text != _confirmPwController.text) {
      AppToast.show(context, 'Passwords do not match', type: ToastType.warning);
      return;
    }
    setState(() => _changingPw = true);
    try {
      await ApiService.changePassword({
        'currentPassword': _currentPwController.text,
        'newPassword': _newPwController.text,
      });
      if (mounted) {
        _currentPwController.clear();
        _newPwController.clear();
        _confirmPwController.clear();
        setState(() => _showPwSection = false);
        AppToast.show(context, 'Password changed', type: ToastType.success);
      }
    } catch (e) {
      if (mounted) AppToast.show(context, 'Failed to change password', type: ToastType.error);
    }
    setState(() => _changingPw = false);
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Logout', style: TextStyle(fontWeight: FontWeight.w800)),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    await context.read<AuthProvider>().logout();
    if (mounted) Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : SingleChildScrollView(
                physics: const ClampingScrollPhysics(),
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('My Profile', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.5)),
                        GestureDetector(
                          onTap: _logout,
                          child: Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(color: AppColors.error.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                            child: const Icon(Iconsax.logout, size: 20, color: AppColors.error),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    AvatarWidget(name: _doctor?['fullName'] ?? auth.userName, imageUrl: _doctor?['avatar'], size: 90, fontSize: 36),
                    const SizedBox(height: 14),
                    Text(_doctor?['fullName'] ?? '', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    Text(_doctor?['specialization'] ?? '', style: const TextStyle(fontSize: 14, color: AppColors.primary, fontWeight: FontWeight.w700)),

                    const SizedBox(height: 8),

                    // Stats row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _miniStat('Rating', '${(_doctor?['rating'] ?? 0).toStringAsFixed(1)}'),
                        Container(width: 1, height: 24, color: AppColors.border, margin: const EdgeInsets.symmetric(horizontal: 16)),
                        _miniStat('Reviews', '${_doctor?['totalReviews'] ?? 0}'),
                        Container(width: 1, height: 24, color: AppColors.border, margin: const EdgeInsets.symmetric(horizontal: 16)),
                        _miniStat('Patients', '${_doctor?['totalPatients'] ?? 0}'),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Profile form
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Professional Information', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                          const SizedBox(height: 18),
                          _buildField('Full Name', _fullNameController, Iconsax.user),
                          _buildField('Phone', _phoneController, Iconsax.call, keyboardType: TextInputType.phone),
                          _buildField('Location', _locationController, Iconsax.location),
                          _buildField('Consultation Fee (Rs.)', _feeController, Iconsax.money_recive, keyboardType: TextInputType.number),
                          _buildField('About', _aboutController, Iconsax.note_1, maxLines: 3, isLast: true),
                          const SizedBox(height: 8),
                          SizedBox(
                            width: double.infinity,
                            height: 52,
                            child: ElevatedButton(
                              onPressed: _saving ? null : _saveProfile,
                              child: _saving
                                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.white)))
                                  : const Text('Save Changes'),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Password section
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          GestureDetector(
                            onTap: () => setState(() => _showPwSection = !_showPwSection),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Change Password', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                                Icon(_showPwSection ? Iconsax.arrow_up_2 : Iconsax.arrow_down_1, size: 20, color: AppColors.textMuted),
                              ],
                            ),
                          ),
                          if (_showPwSection) ...[
                            const SizedBox(height: 18),
                            _buildField('Current Password', _currentPwController, Iconsax.lock, obscure: true),
                            _buildField('New Password', _newPwController, Iconsax.lock_1, obscure: true),
                            _buildField('Confirm Password', _confirmPwController, Iconsax.lock_1, obscure: true, isLast: true),
                            const SizedBox(height: 8),
                            SizedBox(
                              width: double.infinity,
                              height: 52,
                              child: OutlinedButton(
                                onPressed: _changingPw ? null : _changePassword,
                                child: _changingPw
                                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2))
                                    : const Text('Update Password'),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Quick links
                    _buildQuickLink(Iconsax.notification, 'Notifications', () => Navigator.pushNamed(context, '/notifications')),
                    const SizedBox(height: 10),
                    _buildQuickLink(Iconsax.money_recive, 'Earnings', () => Navigator.pushNamed(context, '/doctor-earnings')),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _miniStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
        Text(label, style: TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w700)),
      ],
    );
  }

  Widget _buildField(String label, TextEditingController controller, IconData icon, {TextInputType? keyboardType, bool obscure = false, bool isLast = false, int maxLines = 1}) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
          const SizedBox(height: 6),
          TextField(
            controller: controller,
            keyboardType: keyboardType,
            obscureText: obscure,
            maxLines: maxLines,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
            decoration: InputDecoration(
              hintText: label,
              prefixIcon: Icon(icon, size: 20, color: AppColors.textMuted),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickLink(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, size: 20, color: AppColors.primary),
            ),
            const SizedBox(width: 14),
            Expanded(child: Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary))),
            const Icon(Iconsax.arrow_right_3, size: 18, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
