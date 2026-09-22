import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../core/api_service.dart';
import '../core/theme.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    _fadeController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _fadeAnim = CurvedAnimation(parent: _fadeController, curve: Curves.easeOut);
    _fadeController.forward();

    _initApp();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  Future<void> _initApp() async {
    final stopwatch = Stopwatch()..start();

    // First-launch gate: if the user hasn't picked a backend URL yet, send
    // them to the Server Settings screen before doing any auth check.
    final configured = await ApiService.isConfigured();

    final auth = context.read<AuthProvider>();
    if (configured) {
      await auth.init();
    }

    // Ensure branding is visible for at least 800ms, but no artificial padding
    final elapsed = stopwatch.elapsedMilliseconds;
    if (elapsed < 800) {
      await Future.delayed(Duration(milliseconds: 800 - elapsed));
    }
    if (!mounted) return;

    if (!configured) {
      Navigator.pushReplacementNamed(context, '/server-settings', arguments: 'firstRun');
      return;
    }

    if (auth.isAuthenticated) {
      if (auth.role == 'doctor') {
        Navigator.pushReplacementNamed(context, '/doctor-home');
      } else {
        Navigator.pushReplacementNamed(context, '/patient-home');
      }
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Scaffold(
      body: Container(
        width: size.width,
        height: size.height,
        decoration: const BoxDecoration(gradient: AppColors.heroGradient),
        child: Stack(
          children: [
            // Static ambient glow — no animation, just decoration
            Positioned(
              left: -size.width * 0.3,
              top: -size.height * 0.15,
              child: Container(
                width: size.width * 1.2,
                height: size.width * 1.2,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: const Color(0xFF059669).withValues(alpha: 0.12), blurRadius: 120)],
                ),
              ),
            ),
            Positioned(
              right: -size.width * 0.3,
              bottom: -size.height * 0.2,
              child: Container(
                width: size.width * 1.3,
                height: size.width * 1.3,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: const Color(0xFF15803D).withValues(alpha: 0.1), blurRadius: 140)],
                ),
              ),
            ),

            // Center content — single FadeTransition wraps everything
            Center(
              child: FadeTransition(
                opacity: _fadeAnim,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(36),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.2), width: 1.5),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.25), blurRadius: 40, offset: const Offset(0, 20)),
                          BoxShadow(color: const Color(0xFF10B981).withValues(alpha: 0.12), blurRadius: 30, spreadRadius: -10),
                        ],
                      ),
                      child: const Center(
                        child: Icon(Icons.favorite_rounded, size: 48, color: Colors.white),
                      ),
                    ),
                    const SizedBox(height: 40),
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, letterSpacing: -1.5, height: 1),
                        children: [
                          TextSpan(text: 'Doctor', style: TextStyle(color: Colors.white.withValues(alpha: 0.6))),
                          const TextSpan(text: 'Link', style: TextStyle(color: Colors.white)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'MEDICAL PORTAL',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF4ADE80).withValues(alpha: 0.7),
                        letterSpacing: 6,
                      ),
                    ),
                    const SizedBox(height: 56),
                    SizedBox(
                      width: 48,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          minHeight: 3,
                          backgroundColor: Colors.white.withValues(alpha: 0.1),
                          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF4ADE80)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom branding
            Positioned(
              bottom: 48,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(width: 5, height: 5, decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.5), shape: BoxShape.circle)),
                  const SizedBox(width: 8),
                  Text(
                    'NEXT-GEN HEALTHCARE',
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.2), letterSpacing: 4),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
