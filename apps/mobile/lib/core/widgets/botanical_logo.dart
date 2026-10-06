import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// The official hand-crafted botanical lotus emblem of Mekdi Decor.
/// Matches the web Logo component and official brand identity.
class MekdiBotanicalEmblem extends StatelessWidget {
  final double size;
  final bool isLight;
  final Color? customPetalColor;
  final Color? customLeavesColor;
  final Color? customBudColor;
  final Color? customPedestalColor;

  const MekdiBotanicalEmblem({
    super.key,
    this.size = 48,
    this.isLight = false,
    this.customPetalColor,
    this.customLeavesColor,
    this.customBudColor,
    this.customPedestalColor,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _BotanicalEmblemPainter(
          isLight: isLight,
          petalColor: customPetalColor,
          leavesColor: customLeavesColor,
          budColor: customBudColor,
          pedestalColor: customPedestalColor,
        ),
      ),
    );
  }
}

class _BotanicalEmblemPainter extends CustomPainter {
  final bool isLight;
  final Color? petalColor;
  final Color? leavesColor;
  final Color? budColor;
  final Color? pedestalColor;

  _BotanicalEmblemPainter({
    required this.isLight,
    this.petalColor,
    this.leavesColor,
    this.budColor,
    this.pedestalColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.width / 100.0;
    canvas.scale(scale, scale);

    // Exact brand colors matching the web SVG:
    // When isLight is false (on light surface):
    //   - Center petal: Deep Burgundy #5B1424
    //   - Side leaves: Warm Gold #D4AF37 (opacity 0.88)
    //   - Core bud: Pure Ivory #FDFBF7
    //   - Pedestal: Warm Gold #D4AF37
    // When isLight is true (on dark burgundy surface):
    //   - Center petal: Warm Ivory #F5EFEB
    //   - Side leaves: Rich Gold #D4AF37 (opacity 0.95)
    //   - Core bud: Deep Burgundy #5B1424
    //   - Pedestal: Rich Gold #D4AF37
    final resolvedPetalColor = petalColor ?? (isLight ? const Color(0xFFF5EFEB) : const Color(0xFF5B1424));
    final resolvedLeavesColor = leavesColor ?? (isLight ? const Color(0xFFD4AF37).withValues(alpha: 0.95) : const Color(0xFFD4AF37).withValues(alpha: 0.88));
    final resolvedBudColor = budColor ?? (isLight ? const Color(0xFF5B1424) : const Color(0xFFFDFBF7));
    final resolvedPedestalColor = pedestalColor ?? const Color(0xFFD4AF37);

    final petalPaint = Paint()
      ..color = resolvedPetalColor
      ..style = PaintingStyle.fill;

    final leavesPaint = Paint()
      ..color = resolvedLeavesColor
      ..style = PaintingStyle.fill;

    final budPaint = Paint()
      ..color = resolvedBudColor
      ..style = PaintingStyle.fill;

    final pedestalPaint = Paint()
      ..color = resolvedPedestalColor
      ..style = PaintingStyle.fill;

    // 1. Central Burgundy Lotus / Petal
    // SVG: M50 15C50 15 32 36 32 58C32 68 40 76 50 76C60 76 68 68 68 58C68 36 50 15 50 15Z
    final centerPetal = Path()
      ..moveTo(50, 15)
      ..cubicTo(50, 15, 32, 36, 32, 58)
      ..cubicTo(32, 68, 40, 76, 50, 76)
      ..cubicTo(60, 76, 68, 68, 68, 58)
      ..cubicTo(68, 36, 50, 15, 50, 15)
      ..close();
    canvas.drawPath(centerPetal, petalPaint);

    // 2. Left Flank Gold Leaf
    // SVG: M32 46C20 48 12 59 15 70C17 76 23 80 30 80C39 80 43 72 41 62C40 57 36 50 32 46Z
    final leftLeaf = Path()
      ..moveTo(32, 46)
      ..cubicTo(20, 48, 12, 59, 15, 70)
      ..cubicTo(17, 76, 23, 80, 30, 80)
      ..cubicTo(39, 80, 43, 72, 41, 62)
      ..cubicTo(40, 57, 36, 50, 32, 46)
      ..close();
    canvas.drawPath(leftLeaf, leavesPaint);

    // 3. Right Flank Gold Leaf
    // SVG: M68 46C80 48 88 59 85 70C83 76 77 80 70 80C61 80 57 72 59 62C60 57 64 50 68 46Z
    final rightLeaf = Path()
      ..moveTo(68, 46)
      ..cubicTo(80, 48, 88, 59, 85, 70)
      ..cubicTo(83, 76, 77, 80, 70, 80)
      ..cubicTo(61, 80, 57, 72, 59, 62)
      ..cubicTo(60, 57, 64, 50, 68, 46)
      ..close();
    canvas.drawPath(rightLeaf, leavesPaint);

    // 4. Core Ivory Bud Slit
    // SVG: M50 32C46 44 45 56 50 68C55 56 54 44 50 32Z
    final bud = Path()
      ..moveTo(50, 32)
      ..cubicTo(46, 44, 45, 56, 50, 68)
      ..cubicTo(55, 56, 54, 44, 50, 32)
      ..close();
    canvas.drawPath(bud, budPaint);

    // 5. Foundation Gold Pedestal
    // SVG: M26 84C38 88 62 88 74 84C70 81 30 81 26 84Z
    final pedestal = Path()
      ..moveTo(26, 84)
      ..cubicTo(38, 88, 62, 88, 74, 84)
      ..cubicTo(70, 81, 30, 81, 26, 84)
      ..close();
    canvas.drawPath(pedestal, pedestalPaint);
  }

  @override
  bool shouldRepaint(covariant _BotanicalEmblemPainter oldDelegate) {
    return oldDelegate.isLight != isLight ||
        oldDelegate.petalColor != petalColor ||
        oldDelegate.leavesColor != leavesColor ||
        oldDelegate.budColor != budColor ||
        oldDelegate.pedestalColor != pedestalColor;
  }
}

/// Full official brand lockup matching the web photo:
/// [Emblem] + MEKDI DECOR + *Making Moments Unforgettable*
class MekdiBrandLogo extends StatelessWidget {
  final Axis axis;
  final bool isLight;
  final double emblemSize;
  final double? titleSize;
  final double? taglineSize;
  final bool showTagline;

  const MekdiBrandLogo({
    super.key,
    this.axis = Axis.horizontal,
    this.isLight = false,
    this.emblemSize = 40,
    this.titleSize,
    this.taglineSize,
    this.showTagline = true,
  });

  @override
  Widget build(BuildContext context) {
    final titleColor = isLight ? AppColors.creamLight : AppColors.burgundyPrimary;
    final taglineColor = isLight ? AppColors.goldLight : const Color(0xFFC59B27);

    final resolvedTitleSize = titleSize ?? (axis == Axis.horizontal ? 18.0 : 24.0);
    final resolvedTaglineSize = taglineSize ?? (axis == Axis.horizontal ? 10.5 : 12.0);

    final textColumn = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: axis == Axis.horizontal ? CrossAxisAlignment.start : CrossAxisAlignment.center,
      children: [
        Text(
          'MEKDI DECOR',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: resolvedTitleSize,
            fontWeight: FontWeight.bold,
            color: titleColor,
            letterSpacing: 2.4,
            height: 1.1,
          ),
        ),
        if (showTagline) ...[
          const SizedBox(height: 2),
          Text(
            'Making Moments Unforgettable',
            style: TextStyle(
              fontFamily: 'Playfair Display',
              fontSize: resolvedTaglineSize,
              fontStyle: FontStyle.italic,
              fontWeight: FontWeight.w500,
              color: taglineColor,
              letterSpacing: 0.6,
            ),
          ),
        ],
      ],
    );

    if (axis == Axis.horizontal) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          MekdiBotanicalEmblem(size: emblemSize, isLight: isLight),
          const SizedBox(width: 12),
          textColumn,
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        MekdiBotanicalEmblem(size: emblemSize, isLight: isLight),
        const SizedBox(height: 14),
        textColumn,
      ],
    );
  }
}

/// Backwards compatibility alias
typedef MekdiBotanicalLogo = MekdiBotanicalEmblem;
