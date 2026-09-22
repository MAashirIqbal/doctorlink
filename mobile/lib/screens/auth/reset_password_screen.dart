import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/toast.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String token;
  const ResetPasswordScreen({super.key, required this.token});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _obscure = true;
  bool _loading = false;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final pw = _passwordController.text;
    final confirm = _confirmController.text;
    if (pw.length < 6) {
      AppToast.show(context, 'Password must be at least 6 characters', type: ToastType.warning);
      return;
    }
    if (pw != confirm) {
      AppToast.show(context, 'Passwords do not match', type: ToastType.warning);
      return;
    }
    setState(() => _loading = true);
    try {
      await ApiService.resetPassword(widget.token, pw);
      if (!mounted) return;
      AppToast.show(context, 'Password reset. You can sign in now.', type: ToastType.success);
      Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
    } catch (e) {
      if (!mounted) return;
      AppToast.show(context, 'Reset link is invalid or expired.', type: ToastType.error);
    }
    if (mounted) setState(() => _loading = false);
  }

  Widget _input(TextEditingController c, String label, {bool obscure = false, Widget? suffix}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: TextField(
        controller: c,
        obscureText: obscure,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
        cursorColor: const Color(0xFF4ADE80),
        decoration: InputDecoration(
          hintText: label,
          hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.2), fontWeight: FontWeight.w600),
          prefixIcon: const Icon(Iconsax.lock, color: Color(0xFF10B981), size: 20),
          suffixIcon: suffix != null ? Padding(padding: const EdgeInsets.only(right: 12), child: suffix) : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.heroGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Iconsax.arrow_left, color: Colors.white),
                ),
                const SizedBox(height: 16),
                Container(
                  width: 70, height: 70,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                  ),
                  child: const Icon(Iconsax.lock, size: 32, color: Color(0xFF4ADE80)),
                ),
                const SizedBox(height: 22),
                const Text(
                  'Set new password',
                  style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.8),
                ),
                const SizedBox(height: 8),
                Text(
                  'At least 6 characters. Choose something memorable.',
                  style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.6), fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 32),
                _input(
                  _passwordController,
                  'New password',
                  obscure: _obscure,
                  suffix: GestureDetector(
                    onTap: () => setState(() => _obscure = !_obscure),
                    child: Icon(_obscure ? Iconsax.eye_slash : Iconsax.eye, color: Colors.white.withValues(alpha: 0.3), size: 18),
                  ),
                ),
                const SizedBox(height: 14),
                _input(_confirmController, 'Confirm password', obscure: _obscure),
                const SizedBox(height: 22),
                SizedBox(
                  width: double.infinity, height: 54,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF16A34A),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: _loading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation(Colors.white)))
                        : const Text('Reset password', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
