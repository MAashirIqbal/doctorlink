import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/toast.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _isLoading = false;
  bool _agreed = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  int get _passwordStrength {
    final p = _passwordController.text;
    if (p.isEmpty) return 0;
    int score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (RegExp(r'[A-Z]').hasMatch(p)) score++;
    if (RegExp(r'[0-9]').hasMatch(p)) score++;
    if (RegExp(r'[^A-Za-z0-9]').hasMatch(p)) score++;
    if (score <= 2) return 1;
    if (score <= 3) return 2;
    return 3;
  }

  String get _strengthLabel => switch (_passwordStrength) { 1 => 'WEAK', 2 => 'NORMAL', 3 => 'STRONG', _ => '' };
  Color get _strengthColor => switch (_passwordStrength) { 1 => AppColors.error, 2 => AppColors.warning, 3 => const Color(0xFF4ADE80), _ => Colors.transparent };

  Future<void> _handleRegister() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final confirm = _confirmController.text.trim();

    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      AppToast.show(context, 'Please fill in all fields', type: ToastType.warning);
      return;
    }
    if (password.length < 6) {
      AppToast.show(context, 'Password must be at least 6 characters', type: ToastType.warning);
      return;
    }
    if (password != confirm) {
      AppToast.show(context, 'Passwords do not match', type: ToastType.warning);
      return;
    }
    if (!_agreed) {
      AppToast.show(context, 'Please agree to the Terms of Service', type: ToastType.warning);
      return;
    }

    setState(() => _isLoading = true);

    final auth = context.read<AuthProvider>();
    final result = await auth.register({'name': name, 'email': email, 'password': password, 'role': 'patient'});

    setState(() => _isLoading = false);
    if (!mounted) return;

    if (result['success'] == true) {
      AppToast.show(context, 'Account created successfully!', type: ToastType.success);
      Navigator.pushReplacementNamed(context, '/patient-home');
    } else {
      AppToast.show(context, result['message'] ?? 'Registration failed', type: ToastType.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    return Scaffold(
      body: Container(
        width: screenSize.width,
        height: screenSize.height,
        decoration: const BoxDecoration(gradient: AppColors.heroGradient),
        child: Stack(
          children: [
            // Ambient blobs
            Positioned(
              right: -screenSize.width * 0.3,
              top: -screenSize.height * 0.1,
              child: Container(
                width: screenSize.width * 1.0,
                height: screenSize.width * 1.0,
                decoration: BoxDecoration(shape: BoxShape.circle, boxShadow: [BoxShadow(color: const Color(0xFF059669).withValues(alpha: 0.18), blurRadius: 120)]),
              ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(begin: const Offset(1, 1), end: const Offset(1.2, 1.2), duration: 22.seconds),
            ),
            Positioned(
              left: -screenSize.width * 0.2,
              bottom: -screenSize.height * 0.15,
              child: Container(
                width: screenSize.width * 1.1,
                height: screenSize.width * 1.1,
                decoration: BoxDecoration(shape: BoxShape.circle, boxShadow: [BoxShadow(color: const Color(0xFF15803D).withValues(alpha: 0.12), blurRadius: 140)]),
              ).animate(onPlay: (c) => c.repeat(reverse: true)).scale(begin: const Offset(1, 1), end: const Offset(1.3, 1.3), duration: 26.seconds),
            ),

            SafeArea(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  children: [
                    SizedBox(height: screenSize.height * 0.05),

                    // Back button
                    Align(
                      alignment: Alignment.centerLeft,
                      child: GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                          ),
                          child: Icon(Iconsax.arrow_left_2, size: 18, color: Colors.white.withValues(alpha: 0.6)),
                        ),
                      ),
                    ).animate().fadeIn(duration: 300.ms),

                    const SizedBox(height: 24),

                    const Text('Create Account', style: TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1))
                        .animate().fadeIn(delay: 150.ms).slideY(begin: 0.2, end: 0, delay: 150.ms),
                    const SizedBox(height: 6),
                    Text('Join the future of personalized care.', style: TextStyle(fontSize: 14, color: const Color(0xFF4ADE80).withValues(alpha: 0.8), fontWeight: FontWeight.w700, fontStyle: FontStyle.italic))
                        .animate().fadeIn(delay: 250.ms),

                    const SizedBox(height: 28),

                    // Glass form
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(32),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 50, offset: const Offset(0, 25))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(child: Container(width: 80, height: 2, decoration: BoxDecoration(gradient: LinearGradient(colors: [Colors.transparent, const Color(0xFF10B981).withValues(alpha: 0.5), Colors.transparent]), borderRadius: BorderRadius.circular(1)))),
                          const SizedBox(height: 20),

                          Text('FULL NAME', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
                          const SizedBox(height: 8),
                          _buildGlassInput(controller: _nameController, hint: 'John Doe', icon: Iconsax.user),

                          const SizedBox(height: 18),
                          Text('EMAIL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
                          const SizedBox(height: 8),
                          _buildGlassInput(controller: _emailController, hint: 'j@example.com', icon: Iconsax.sms, keyboardType: TextInputType.emailAddress),

                          const SizedBox(height: 18),
                          Text('CHOOSE PASSWORD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
                          const SizedBox(height: 8),
                          _buildGlassInput(
                            controller: _passwordController,
                            hint: '••••••••',
                            icon: Iconsax.lock,
                            obscure: _obscurePassword,
                            onChanged: (_) => setState(() {}),
                            suffixIcon: GestureDetector(
                              onTap: () => setState(() => _obscurePassword = !_obscurePassword),
                              child: Icon(_obscurePassword ? Iconsax.eye_slash : Iconsax.eye, color: Colors.white.withValues(alpha: 0.3), size: 18),
                            ),
                          ),

                          // Password strength bar
                          if (_passwordController.text.isNotEmpty) ...[
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                ...List.generate(3, (i) => Expanded(
                                  child: Container(
                                    height: 3,
                                    margin: EdgeInsets.only(right: i < 2 ? 6 : 0),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(2),
                                      color: i < _passwordStrength ? _strengthColor : Colors.white.withValues(alpha: 0.1),
                                    ),
                                  ),
                                )),
                                const SizedBox(width: 10),
                                Text(_strengthLabel, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: _strengthColor, letterSpacing: 2)),
                              ],
                            ),
                          ],

                          const SizedBox(height: 18),
                          Text('CONFIRM PASSWORD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
                          const SizedBox(height: 8),
                          _buildGlassInput(
                            controller: _confirmController,
                            hint: '••••••••',
                            icon: Iconsax.lock_1,
                            obscure: _obscureConfirm,
                            onSubmitted: (_) => _handleRegister(),
                            suffixIcon: GestureDetector(
                              onTap: () => setState(() => _obscureConfirm = !_obscureConfirm),
                              child: Icon(_obscureConfirm ? Iconsax.eye_slash : Iconsax.eye, color: Colors.white.withValues(alpha: 0.3), size: 18),
                            ),
                          ),

                          const SizedBox(height: 18),

                          // Terms checkbox
                          GestureDetector(
                            onTap: () => setState(() => _agreed = !_agreed),
                            child: Row(
                              children: [
                                Container(
                                  width: 22, height: 22,
                                  decoration: BoxDecoration(
                                    color: _agreed ? const Color(0xFF10B981).withValues(alpha: 0.3) : Colors.white.withValues(alpha: 0.05),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: _agreed ? const Color(0xFF10B981) : Colors.white.withValues(alpha: 0.15)),
                                  ),
                                  child: _agreed ? const Icon(Icons.check_rounded, size: 14, color: Color(0xFF4ADE80)) : null,
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text.rich(
                                    TextSpan(children: [
                                      TextSpan(text: 'I agree to the ', style: TextStyle(color: Colors.white.withValues(alpha: 0.35), fontSize: 12, fontWeight: FontWeight.w700)),
                                      const TextSpan(text: 'Terms of Service', style: TextStyle(color: Color(0xFF4ADE80), fontSize: 12, fontWeight: FontWeight.w700, decoration: TextDecoration.underline)),
                                    ]),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 24),

                          SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _handleRegister,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF16A34A),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                elevation: 0,
                              ),
                              child: _isLoading
                                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation(Colors.white)))
                                  : Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Text('Start Your Journey', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                                        const SizedBox(width: 8),
                                        const Icon(Iconsax.arrow_right_3, size: 18),
                                      ],
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 350.ms, duration: 600.ms).slideY(begin: 0.1, end: 0, delay: 350.ms, duration: 600.ms, curve: Curves.easeOutCubic),

                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Already have an account? ', style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontWeight: FontWeight.w700, fontSize: 13)),
                        GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: const Text('Sign In', style: TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.w900, fontSize: 13)),
                        ),
                      ],
                    ).animate().fadeIn(delay: 600.ms),

                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(width: 5, height: 5, decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.4), shape: BoxShape.circle)),
                        const SizedBox(width: 8),
                        Text('HIPAA VERIFIED  •  AES-256 SECURE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.15), letterSpacing: 2)),
                      ],
                    ).animate().fadeIn(delay: 800.ms),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGlassInput({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    bool obscure = false,
    Widget? suffixIcon,
    ValueChanged<String>? onSubmitted,
    ValueChanged<String>? onChanged,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscure,
        onSubmitted: onSubmitted,
        onChanged: onChanged,
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14),
        cursorColor: const Color(0xFF4ADE80),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.15), fontWeight: FontWeight.w600),
          prefixIcon: Icon(icon, color: const Color(0xFF10B981).withValues(alpha: 0.5), size: 18),
          suffixIcon: suffixIcon != null ? Padding(padding: const EdgeInsets.only(right: 12), child: suffixIcon) : null,
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          filled: false,
        ),
      ),
    );
  }
}
