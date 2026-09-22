import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/toast.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _loading = false;
  String? _resetUrl;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  String? _extractToken(String? url) {
    if (url == null || url.isEmpty) return null;
    final match = RegExp(r'/reset-password/([^/?#]+)').firstMatch(url);
    return match?.group(1);
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      AppToast.show(context, 'Enter your email', type: ToastType.warning);
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await ApiService.forgotPassword(email);
      final url = res.data is Map ? res.data['resetUrl'] as String? : null;
      setState(() => _resetUrl = url);
      if (!mounted) return;
      if (url == null || url.isEmpty) {
        AppToast.show(context, 'If that email exists, a reset link was generated.', type: ToastType.info);
      }
    } catch (e) {
      if (mounted) AppToast.show(context, 'Could not start reset. Please try again.', type: ToastType.error);
    }
    if (mounted) setState(() => _loading = false);
  }

  void _continueWithToken() {
    final token = _extractToken(_resetUrl);
    if (token == null) {
      AppToast.show(context, 'Reset link is invalid', type: ToastType.error);
      return;
    }
    Navigator.pushReplacementNamed(context, '/reset-password', arguments: token);
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
                  child: const Icon(Iconsax.shield_tick, size: 32, color: Color(0xFF4ADE80)),
                ),
                const SizedBox(height: 22),
                const Text(
                  'Forgot password?',
                  style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.8),
                ),
                const SizedBox(height: 8),
                Text(
                  'Enter the email you registered with and we\'ll generate a reset link.',
                  style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.6), fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 32),

                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                  child: TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                    cursorColor: const Color(0xFF4ADE80),
                    decoration: InputDecoration(
                      hintText: 'name@example.com',
                      hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.2), fontWeight: FontWeight.w600),
                      prefixIcon: const Icon(Iconsax.sms, color: Color(0xFF10B981), size: 20),
                      border: InputBorder.none,
                    ),
                  ),
                ),

                const SizedBox(height: 18),

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
                        : const Text('Send reset link', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                  ),
                ),

                if (_resetUrl != null && _resetUrl!.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Reset link generated.',
                            style: TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.w900, fontSize: 14)),
                        const SizedBox(height: 6),
                        Text('Tap below to choose a new password.',
                            style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontWeight: FontWeight.w600, fontSize: 12)),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity, height: 46,
                          child: ElevatedButton(
                            onPressed: _continueWithToken,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF16A34A),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              elevation: 0,
                            ),
                            child: const Text('Continue', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
