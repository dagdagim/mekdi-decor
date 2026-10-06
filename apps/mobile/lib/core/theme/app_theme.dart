import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const Color burgundyPrimary = Color(0xFF5B1424);
  static const Color burgundyDeep = Color(0xFF4A0E17);
  static const Color burgundyDarkest = Color(0xFF2E070D);

  static const Color goldAccent = Color(0xFFD4AF37);
  static const Color goldLight = Color(0xFFE5C365);
  static const Color goldDark = Color(0xFFA47E1B);

  static const Color creamBase = Color(0xFFFDFBF7);
  static const Color creamSurface = Color(0xFFFAF6F0);
  static const Color creamCard = Color(0xFFFFFFFF);
  static const Color creamBorder = Color(0xFFEFE8DD);
  static const Color creamLight = Color(0xFFFDFBF7);

  static const Color charcoalText = Color(0xFF1C1917);
  static const Color charcoalMuted = Color(0xFF6E6760);

  static const Color botanicalGreen = Color(0xFF3D5A45);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.creamSurface,
      colorScheme: const ColorScheme.light(
        primary: AppColors.burgundyPrimary,
        secondary: AppColors.goldAccent,
        surface: AppColors.creamCard,
        surfaceContainerLowest: AppColors.creamSurface,
        onPrimary: AppColors.creamBase,
        onSecondary: AppColors.burgundyPrimary,
        onSurface: AppColors.charcoalText,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.playfairDisplay(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: AppColors.charcoalText,
        ),
        headlineMedium: GoogleFonts.playfairDisplay(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: AppColors.charcoalText,
        ),
        titleMedium: GoogleFonts.plusJakartaSans(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.charcoalText,
        ),
        bodyMedium: GoogleFonts.plusJakartaSans(
          fontSize: 14,
          color: AppColors.charcoalText,
        ),
        bodySmall: GoogleFonts.plusJakartaSans(
          fontSize: 12,
          color: AppColors.charcoalMuted,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.burgundyPrimary,
          foregroundColor: AppColors.creamBase,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          textStyle: GoogleFonts.plusJakartaSans(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }
}
