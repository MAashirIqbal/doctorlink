import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/toast.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;
  bool _saving = false;

  @override
  void dispose() {
    _currentController.dispose();
    _newController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final current = _currentController.text;
    final next = _newController.text;
    final confirm = _confirmController.text;

    if (current.isEmpty || next.isEmpty) {
      AppToast.show(context, 'All fields are required', type: ToastType.warning);
      return;
    }
    if (next.length < 6) {
      AppToast.show(context, 'New password must be at least 6 characters', type: ToastType.warning);
      return;
    }
    if (next != confirm) {
      AppToast.show(context, 'Passwords do not match', type: ToastType.warning);
      return;
    }

    setState(() => _saving = true);
    try {
      await ApiService.changePassword({'currentPassword': current, 'newPassword': next});
      if (!mounted) return;
      AppToast.show(context, 'Password changed', type: ToastType.success);
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      final msg = (e as dynamic).response?.data?['message'] ?? 'Could not change password';
      AppToast.show(context, msg, type: ToastType.error);
    }
    if (mounted) setState(() => _saving = false);
  }

  Widget _passwordField({
    required TextEditingController controller,
    required String label,
    required bool obscure,
    required VoidCallback onToggle,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: AppColors.textSecondary, letterSpacing: 0.4)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: obscure,
          autocorrect: false,
          decoration: InputDecoration(
            prefixIcon: const Icon(Iconsax.lock_1, size: 18),
            suffixIcon: IconButton(
              icon: Icon(obscure ? Iconsax.eye_slash : Iconsax.eye, size: 18),
              onPressed: onToggle,
            ),
            hintText: '••••••••',
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Change Password')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.15)),
                ),
                child: const Row(
                  children: [
                    Icon(Iconsax.shield_tick, size: 16, color: AppColors.primary),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Use at least 6 characters and don\'t reuse a password from another site.',
                        style: TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w700, fontSize: 12, height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),
              _passwordField(
                controller: _currentController,
                label: 'CURRENT PASSWORD',
                obscure: _obscureCurrent,
                onToggle: () => setState(() => _obscureCurrent = !_obscureCurrent),
              ),
              const SizedBox(height: 16),
              _passwordField(
                controller: _newController,
                label: 'NEW PASSWORD',
                obscure: _obscureNew,
                onToggle: () => setState(() => _obscureNew = !_obscureNew),
              ),
              const SizedBox(height: 16),
              _passwordField(
                controller: _confirmController,
                label: 'CONFIRM NEW PASSWORD',
                obscure: _obscureConfirm,
                onToggle: () => setState(() => _obscureConfirm = !_obscureConfirm),
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: _saving ? null : _save,
                  icon: _saving
                      ? const SizedBox(
                          width: 16, height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2.4, valueColor: AlwaysStoppedAnimation(Colors.white)),
                        )
                      : const Icon(Iconsax.tick_circle, size: 18),
                  label: Text(_saving ? 'Saving...' : 'Change password',
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
