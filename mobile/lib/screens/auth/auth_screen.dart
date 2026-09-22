import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:iconsax/iconsax.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/toast.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with SingleTickerProviderStateMixin {
  // Login controllers
  final _loginEmailController = TextEditingController();
  final _loginPasswordController = TextEditingController();
  bool _loginObscure = true;
  bool _isDoctor = false;

  // Register controllers
  final _regNameController = TextEditingController();
  final _regEmailController = TextEditingController();
  final _regPasswordController = TextEditingController();
  final _regConfirmController = TextEditingController();
  bool _regObscure = true;
  bool _regConfirmObscure = true;
  bool _agreed = false;

  bool _isLogin = true;
  bool _isLoading = false;

  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 400));
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic);
    _animController.value = 1.0;
  }

  @override
  void dispose() {
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    _regNameController.dispose();
    _regEmailController.dispose();
    _regPasswordController.dispose();
    _regConfirmController.dispose();
    _animController.dispose();
    super.dispose();
  }

  void _toggleAuth() {
    _animController.reverse().then((_) {
      setState(() => _isLogin = !_isLogin);
      _animController.forward();
    });
  }

  int get _passwordStrength {
    final p = _regPasswordController.text;
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

  Future<void> _handleLogin() async {
    final email = _loginEmailController.text.trim();
    final password = _loginPasswordController.text.trim();

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

  Future<void> _handleRegister() async {
    final name = _regNameController.text.trim();
    final email = _regEmailController.text.trim();
    final password = _regPasswordController.text.trim();
    final confirm = _regConfirmController.text.trim();

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
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Container(
        width: screenSize.width,
        height: screenSize.height,
        decoration: const BoxDecoration(gradient: AppColors.heroGradient),
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.only(bottom: bottomInset),
            child: SingleChildScrollView(
              physics: const ClampingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: screenSize.height - MediaQuery.of(context).padding.top - MediaQuery.of(context).padding.bottom),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 20),

                    // Logo + branding
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                      ),
                      child: const Center(
                        child: Icon(Icons.favorite_rounded, size: 30, color: Color(0xFF4ADE80)),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Animated title
                    FadeTransition(
                      opacity: _fadeAnim,
                      child: Column(
                        children: [
                          Text(
                            _isLogin ? 'Welcome Back' : 'Create Account',
                            style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -1),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _isLogin ? 'Ready to continue your health journey?' : 'Join the future of personalized care.',
                            style: TextStyle(fontSize: 13, color: const Color(0xFF4ADE80).withValues(alpha: 0.8), fontWeight: FontWeight.w700, fontStyle: FontStyle.italic),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Role toggle (only on login)
                    if (_isLogin)
                      Container(
                        padding: const EdgeInsets.all(3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                        ),
                        child: Row(
                          children: [
                            _buildRoleTab('Patient', !_isDoctor, () => setState(() => _isDoctor = false)),
                            _buildRoleTab('Doctor', _isDoctor, () => setState(() => _isDoctor = true)),
                          ],
                        ),
                      ),

                    if (_isLogin) const SizedBox(height: 20),

                    // Glass form card
                    FadeTransition(
                      opacity: _fadeAnim,
                      child: Container(
                        padding: const EdgeInsets.all(22),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(28),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                        ),
                        child: _isLogin ? _buildLoginForm() : _buildRegisterForm(),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Toggle link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _isLogin ? "Don't have an account? " : 'Already have an account? ',
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontWeight: FontWeight.w700, fontSize: 13),
                        ),
                        GestureDetector(
                          onTap: _toggleAuth,
                          child: Text(
                            _isLogin ? 'Sign Up Now' : 'Sign In',
                            style: const TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.w900, fontSize: 13),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Bottom branding
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(width: 4, height: 4, decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.4), shape: BoxShape.circle)),
                        const SizedBox(width: 8),
                        Text('SECURE MEDICAL PORTAL', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.15), letterSpacing: 3)),
                      ],
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Glow line
        Center(
          child: Container(
            width: 60,
            height: 2,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [Colors.transparent, const Color(0xFF10B981).withValues(alpha: 0.5), Colors.transparent]),
              borderRadius: BorderRadius.circular(1),
            ),
          ),
        ),
        const SizedBox(height: 20),

        Text('EMAIL ADDRESS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
        const SizedBox(height: 8),
        _buildGlassInput(controller: _loginEmailController, hint: 'name@example.com', icon: Iconsax.sms, keyboardType: TextInputType.emailAddress),

        const SizedBox(height: 18),

        Text('PASSWORD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
        const SizedBox(height: 8),
        _buildGlassInput(
          controller: _loginPasswordController,
          hint: '••••••••',
          icon: Iconsax.lock,
          obscure: _loginObscure,
          suffixIcon: GestureDetector(
            onTap: () => setState(() => _loginObscure = !_loginObscure),
            child: Icon(_loginObscure ? Iconsax.eye_slash : Iconsax.eye, color: Colors.white.withValues(alpha: 0.3), size: 18),
          ),
          onSubmitted: (_) => _handleLogin(),
        ),

        const SizedBox(height: 24),

        _buildSubmitButton('Sign In', _handleLogin),
      ],
    );
  }

  Widget _buildRegisterForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: Container(
            width: 60,
            height: 2,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [Colors.transparent, const Color(0xFF10B981).withValues(alpha: 0.5), Colors.transparent]),
              borderRadius: BorderRadius.circular(1),
            ),
          ),
        ),
        const SizedBox(height: 20),

        Text('FULL NAME', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
        const SizedBox(height: 8),
        _buildGlassInput(controller: _regNameController, hint: 'John Doe', icon: Iconsax.user),

        const SizedBox(height: 14),
        Text('EMAIL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
        const SizedBox(height: 8),
        _buildGlassInput(controller: _regEmailController, hint: 'j@example.com', icon: Iconsax.sms, keyboardType: TextInputType.emailAddress),

        const SizedBox(height: 14),
        Text('CHOOSE PASSWORD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
        const SizedBox(height: 8),
        _buildGlassInput(
          controller: _regPasswordController,
          hint: '••••••••',
          icon: Iconsax.lock,
          obscure: _regObscure,
          onChanged: (_) => setState(() {}),
          suffixIcon: GestureDetector(
            onTap: () => setState(() => _regObscure = !_regObscure),
            child: Icon(_regObscure ? Iconsax.eye_slash : Iconsax.eye, color: Colors.white.withValues(alpha: 0.3), size: 18),
          ),
        ),

        // Password strength
        if (_regPasswordController.text.isNotEmpty) ...[
          const SizedBox(height: 8),
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

        const SizedBox(height: 14),
        Text('CONFIRM PASSWORD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 3)),
        const SizedBox(height: 8),
        _buildGlassInput(
          controller: _regConfirmController,
          hint: '••••••••',
          icon: Iconsax.lock_1,
          obscure: _regConfirmObscure,
          onSubmitted: (_) => _handleRegister(),
          suffixIcon: GestureDetector(
            onTap: () => setState(() => _regConfirmObscure = !_regConfirmObscure),
            child: Icon(_regConfirmObscure ? Iconsax.eye_slash : Iconsax.eye, color: Colors.white.withValues(alpha: 0.3), size: 18),
          ),
        ),

        const SizedBox(height: 14),

        // Terms
        GestureDetector(
          onTap: () => setState(() => _agreed = !_agreed),
          child: Row(
            children: [
              Container(
                width: 20, height: 20,
                decoration: BoxDecoration(
                  color: _agreed ? const Color(0xFF10B981).withValues(alpha: 0.3) : Colors.white.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: _agreed ? const Color(0xFF10B981) : Colors.white.withValues(alpha: 0.15)),
                ),
                child: _agreed ? const Icon(Icons.check_rounded, size: 13, color: Color(0xFF4ADE80)) : null,
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

        const SizedBox(height: 20),

        _buildSubmitButton('Start Your Journey', _handleRegister),
      ],
    );
  }

  Widget _buildSubmitButton(String label, VoidCallback onPressed) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        onPressed: _isLoading ? null : onPressed,
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
                  Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                  const SizedBox(width: 8),
                  const Icon(Iconsax.arrow_right_3, size: 18),
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
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? Colors.white.withValues(alpha: 0.12) : Colors.transparent,
            borderRadius: BorderRadius.circular(11),
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
    ValueChanged<String>? onChanged,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(14),
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
