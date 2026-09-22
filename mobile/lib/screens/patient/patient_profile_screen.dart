import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/avatar_widget.dart';
import '../../widgets/toast.dart';

class PatientProfileScreen extends StatefulWidget {
  const PatientProfileScreen({super.key});

  @override
  State<PatientProfileScreen> createState() => _PatientProfileScreenState();
}

class _PatientProfileScreenState extends State<PatientProfileScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _cityController = TextEditingController();
  final _addressController = TextEditingController();
  final _currentPwController = TextEditingController();
  final _newPwController = TextEditingController();
  final _confirmPwController = TextEditingController();
  bool _saving = false;
  bool _changingPw = false;
  bool _showPwSection = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    if (user != null) {
      _nameController.text = user['name'] ?? '';
      _emailController.text = user['email'] ?? '';
      _phoneController.text = user['phone'] ?? '';
      _cityController.text = user['city'] ?? '';
      _addressController.text = user['address'] ?? '';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    _addressController.dispose();
    _currentPwController.dispose();
    _newPwController.dispose();
    _confirmPwController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    setState(() => _saving = true);
    try {
      final res = await ApiService.updateProfile({
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim(),
        'city': _cityController.text.trim(),
        'address': _addressController.text.trim(),
      });
      if (mounted) {
        final user = res.data['user'];
        if (user != null) {
          context.read<AuthProvider>().updateUserLocal(Map<String, dynamic>.from(user));
        }
        AppToast.show(context, 'Profile updated', type: ToastType.success);
      }
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
        child: SingleChildScrollView(
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
                      decoration: BoxDecoration(
                        color: AppColors.error.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Iconsax.logout, size: 20, color: AppColors.error),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 28),

              // Avatar
              AvatarWidget(name: auth.userName, imageUrl: auth.userAvatar, size: 90, fontSize: 36),
              const SizedBox(height: 14),
              Text(auth.userName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              Text(auth.userEmail, style: const TextStyle(fontSize: 14, color: AppColors.textMuted)),

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
                    const Text('Personal Information', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                    const SizedBox(height: 18),
                    _buildField('Full Name', _nameController, Iconsax.user),
                    _buildField('Email', _emailController, Iconsax.sms, keyboardType: TextInputType.emailAddress),
                    _buildField('Phone', _phoneController, Iconsax.call, keyboardType: TextInputType.phone),
                    _buildField('City', _cityController, Iconsax.location),
                    _buildField('Address', _addressController, Iconsax.map, isLast: true),
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
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, IconData icon, {TextInputType? keyboardType, bool obscure = false, bool isLast = false}) {
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
