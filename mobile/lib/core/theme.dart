import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Emerald Wellness Palette — matching web frontend
  static const Color primary = Color(0xFF16A34A);       // emerald-600
  static const Color primaryLight = Color(0xFF4ADE80);  // emerald-400
  static const Color primaryDark = Color(0xFF15803D);   // emerald-700
  static const Color primaryDeep = Color(0xFF14532D);   // emerald-900
  static const Color primaryBg = Color(0xFFF0FDF4);     // emerald-50
  static const Color primary100 = Color(0xFFDCFCE7);    // emerald-100
  static const Color primary200 = Color(0xFFBBF7D0);    // emerald-200

  // Accent — amber/gold
  static const Color accent = Color(0xFFD97706);        // amber-600
  static const Color accentLight = Color(0xFFFEF3C7);   // amber-100

  // Semantic
  static const Color success = Color(0xFF059669);        // emerald-600 darker
  static const Color warning = Color(0xFFF59E0B);        // amber-500
  static const Color error = Color(0xFFEF4444);          // red-500
  static const Color info = Color(0xFF3B82F6);           // blue-500

  // Surfaces
  static const Color surface = Color(0xFFFAFAFA);
  static const Color card = Colors.white;
  static const Color darkBg = Color(0xFF0A1A15);         // dark emerald bg
  static const Color darkCard = Color(0x0DFFFFFF);       // white/5
  static const Color darkBorder = Color(0x1AFFFFFF);     // white/10

  // Text
  static const Color textPrimary = Color(0xFF111827);    // gray-900
  static const Color textSecondary = Color(0xFF6B7280);  // gray-500
  static const Color textMuted = Color(0xFF9CA3AF);      // gray-400
  static const Color border = Color(0xFFE5E7EB);         // gray-200
  static const Color divider = Color(0xFFF3F4F6);        // gray-100

  // Shimmer
  static const Color shimmerBase = Color(0xFFE5E7EB);
  static const Color shimmerHighlight = Color(0xFFF9FAFB);

  // Gradients
  static const LinearGradient emeraldGradient = LinearGradient(
    colors: [Color(0xFF059669), Color(0xFF10B981)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const LinearGradient darkEmeraldGradient = LinearGradient(
    colors: [Color(0xFF15803D), Color(0xFF14532D)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF0A1A15), Color(0xFF061410)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.surface,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.accent,
        surface: AppColors.surface,
        error: AppColors.error,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -1.0),
        displayMedium: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.5),
        headlineLarge: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
        headlineMedium: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
        titleLarge: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
        titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        bodyLarge: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
        bodyMedium: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textSecondary),
        bodySmall: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textMuted),
        labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primary),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: AppColors.border.withValues(alpha: 0.6), width: 0.5),
        ),
        margin: EdgeInsets.zero,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          shadowColor: AppColors.primaryDark.withValues(alpha: 0.4),
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w800),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary200),
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w800),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.primaryBg.withValues(alpha: 0.5),
        floatingLabelBehavior: FloatingLabelBehavior.never,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: AppColors.border.withValues(alpha: 0.5))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: AppColors.border.withValues(alpha: 0.5))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: AppColors.primary.withValues(alpha: 0.5), width: 1.5)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.error)),
        hintStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textMuted),
        labelStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      dividerTheme: const DividerThemeData(color: AppColors.divider, thickness: 1, space: 0),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.primaryBg,
        labelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        side: const BorderSide(color: AppColors.primary100),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),
      dialogTheme: DialogThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
      ),
    );
  }
}
