import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/toast.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with TickerProviderStateMixin {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  bool _isDoctor = false;

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
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      AppToast.show(context, 'Please fill in all fields', type: ToastType.warning);
      return;
    }

    setState(() => _isLoading = true);

    final auth = context.read<AuthProvider>();
    final result = _isDoctor
        ? await auth.doctorLogin(email, password)
        : await auth.login(email, password);

    setState(() => _isLoading = false);

    if (!mounted) return;

    if (result['success'] == true) {
      AppToast.show(context, 'Welcome back!', type: ToastType.success);
      if (auth.role == 'doctor') {
        Navigator.pushReplacementNamed(context, '/doctor-home');
      } else {
        Navigator.pushReplacementNamed(context, '/patient-home');
      }
    } else {
      AppToast.show(context, result['message'] ?? 'Login failed', type: ToastType.error);
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
            // Ambient emerald blobs
            Positioned(
              left: -screenSize.width * 0.2,
              top: -screenSize.height * 0.1,
              child: Container(
                width: screenSize.width * 1.0,
                height: screenSize.width * 1.0,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: const Color(0xFF059669).withValues(alpha: 0.2), blurRadius: 120)],
                ),
              )
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .scale(begin: const Offset(1, 1), end: const Offset(1.2, 1.2), duration: 20.seconds)
                  .moveX(begin: 0, end: 50, duration: 20.seconds),
            ),
            Positioned(
              right: -screenSize.width * 0.3,
              bottom: -screenSize.height * 0.2,
              child: Container(
                width: screenSize.width * 1.2,
                height: screenSize.width * 1.2,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: const Color(0xFF15803D).withValues(alpha: 0.15), blurRadius: 150)],
                ),
              )
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .scale(begin: const Offset(1, 1), end: const Offset(1.3, 1.3), duration: 25.seconds)
                  .moveY(begin: 0, end: 80, duration: 25.seconds),
            ),

            // Content
            SafeArea(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  children: [
                    SizedBox(height: screenSize.height * 0.08),

                    // Glass logo
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(28),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                      ),
                      child: const Center(
                        child: Icon(Icons.favorite_rounded, size: 38, color: Color(0xFF4ADE80)),
                      ),
                    )
                        .animate()
                        .scale(begin: const Offset(0.5, 0.5), end: const Offset(1, 1), duration: 600.ms, curve: Curves.easeOutBack)
                        .fadeIn(duration: 400.ms),

                    const SizedBox(height: 28),

                    // Title
                    const Text(
                      'Welcome Back',
                      style: TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1),
                    ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2, end: 0, delay: 200.ms),

                    const SizedBox(height: 6),

                    Text(
                      'Ready to continue your health journey?',
                      style: TextStyle(fontSize: 14, color: const Color(0xFF4ADE80).withValues(alpha: 0.8), fontWeight: FontWeight.w700, fontStyle: FontStyle.italic),
                    ).animate().fadeIn(delay: 300.ms),

                    const SizedBox(height: 36),

                    // Role toggle — glass style
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                      ),
                      child: Row(
                        children: [
                          _buildRoleTab('Patient', !_isDoctor, () => setState(() => _isDoctor = false)),
                          _buildRoleTab('Doctor', _isDoctor, () => setState(() => _isDoctor = true)),
                        ],
                      ),
                    ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.15, end: 0, delay: 400.ms),

                    const SizedBox(height: 32),

                    // Glass form card
                    Container(
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(32),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 50, offset: const Offset(0, 25))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Top glow line
                          Center(
                            child: Container(
                              width: 80,
                              height: 2,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(colors: [Colors.transparent, const Color(0xFF10B981).withValues(alpha: 0.5), Colors.transparent]),
                                borderRadius: BorderRadius.circular(1),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Email
                          Text('EMAIL ADDRESS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
                          const SizedBox(height: 10),
                          _buildGlassInput(
                            controller: _emailController,
                            hint: 'name@example.com',
                            icon: Iconsax.sms,
                            keyboardType: TextInputType.emailAddress,
                          ),

                          const SizedBox(height: 22),

                          // Password
                          Text('PASSWORD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
                          const SizedBox(height: 10),
                          _buildGlassInput(
                            controller: _passwordController,
                            hint: '••••••••',
                            icon: Iconsax.lock,
                            obscure: _obscurePassword,
                            suffixIcon: GestureDetector(
                              onTap: () => setState(() => _obscurePassword = !_obscurePassword),
                              child: Icon(
                                _obscurePassword ? Iconsax.eye_slash : Iconsax.eye,
                                color: Colors.white.withValues(alpha: 0.3),
                                size: 18,
                              ),
                            ),
                            onSubmitted: (_) => _handleLogin(),
                          ),

                          const SizedBox(height: 30),

                          // Forgot password link
                          Align(
                            alignment: Alignment.centerRight,
                            child: GestureDetector(
                              onTap: () => Navigator.pushNamed(context, '/forgot-password'),
                              child: Text(
                                'Forgot password?',
                                style: TextStyle(
                                  color: Colors.white.withValues(alpha: 0.55),
                                  fontWeight: FontWeight.w800,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),

                          const SizedBox(height: 18),

                          // Sign in button
                          SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _handleLogin,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF16A34A),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                elevation: 0,
                                shadowColor: const Color(0xFF14532D).withValues(alpha: 0.4),
                              ),
                              child: _isLoading
                                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation(Colors.white)))
                                  : Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
                                        const SizedBox(width: 8),
                                        const Icon(Iconsax.arrow_right_3, size: 18),
                                      ],
                                    ),
                            ),
                          ),
                        ],
                      ),
                    )
                        .animate()
                        .fadeIn(delay: 500.ms, duration: 600.ms)
                        .slideY(begin: 0.12, end: 0, delay: 500.ms, duration: 600.ms, curve: Curves.easeOutCubic),

                    const SizedBox(height: 28),

                    // Register link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text("Don't have an account? ", style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontWeight: FontWeight.w700, fontSize: 13)),
                        GestureDetector(
                          onTap: () => Navigator.pushNamed(context, '/register'),
                          child: const Text('Sign Up Now', style: TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.w900, fontSize: 13)),
                        ),
                      ],
                    ).animate().fadeIn(delay: 700.ms),

                    const SizedBox(height: 32),

                    // Bottom branding
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(width: 5, height: 5, decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.4), shape: BoxShape.circle)),
                        const SizedBox(width: 8),
                        Text('SECURE MEDICAL PORTAL', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.15), letterSpacing: 3)),
                      ],
                    ).animate().fadeIn(delay: 900.ms),
                    const SizedBox(height: 14),
                    Center(
                      child: GestureDetector(
                        onTap: () => Navigator.pushNamed(context, '/server-settings'),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Iconsax.cloud_change, size: 11, color: Colors.white.withValues(alpha: 0.3)),
                            const SizedBox(width: 6),
                            Text('Configure server',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white.withValues(alpha: 0.4),
                                )),
                          ],
                        ),
                      ),
                    ).animate().fadeIn(delay: 1000.ms),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleTab(String label, bool isActive, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isActive ? Colors.white.withValues(alpha: 0.12) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: isActive ? Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)) : null,
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w900,
                color: isActive ? const Color(0xFF4ADE80) : Colors.white.withValues(alpha: 0.4),
              ),
            ),
          ),
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
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15),
        cursorColor: const Color(0xFF4ADE80),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.15), fontWeight: FontWeight.w600),
          prefixIcon: Icon(icon, color: const Color(0xFF10B981).withValues(alpha: 0.5), size: 20),
          suffixIcon: suffixIcon != null ? Padding(padding: const EdgeInsets.only(right: 12), child: suffixIcon) : null,
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
          filled: false,
        ),
      ),
    );
  }
}
