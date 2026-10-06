import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/botanical_logo.dart';

class OnboardingSlide {
  final String title;
  final String subtitle;
  final String description;
  final String imageUrl;
  final String tag;

  const OnboardingSlide({
    required this.title,
    required this.subtitle,
    required this.description,
    required this.imageUrl,
    required this.tag,
  });
}

class MobileOnboardingScreen extends StatefulWidget {
  const MobileOnboardingScreen({super.key});

  @override
  State<MobileOnboardingScreen> createState() => _MobileOnboardingScreenState();
}

class _MobileOnboardingScreenState extends State<MobileOnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingSlide> _slides = const [
    OnboardingSlide(
      title: 'Bespoke Visual Symphonies',
      subtitle: 'የተዋበ የሰርግ እና ድግስ ዲዛይን',
      description:
          'Transforming premier venues across Ethiopia into breathtaking royal wonderlands with custom velvet stages, cascading garden roses, and crystal chandeliers.',
      imageUrl:
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      tag: 'MASTER STAGECRAFT',
    ),
    OnboardingSlide(
      title: 'Royal Heritage & Modern Glamour',
      subtitle: 'ባህላዊ መልስ እና ዘመናዊ ዝግጅቶች',
      description:
          'Honoring Ethiopian traditional celebrations (Melse, Tilfi, & Mesob) seamlessly blended with contemporary architectural lighting and imported floral artistry.',
      imageUrl:
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
      tag: 'ETHIOPIAN TRADITIONS',
    ),
    OnboardingSlide(
      title: 'Seamless Digital Concierge',
      subtitle: 'ቀጥታ ክፍያ እና የዝግጅት ሂደት ክትትል',
      description:
          'Review itemized blueprints, authorize secure 50% deposits via Chapa or Telebirr, and track live production milestones directly with lead stylist Mekdes.',
      imageUrl:
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
      tag: 'CHAPA & TELEBIRR READY',
    ),
  ];

  void _onNext() {
    if (_currentPage < _slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      context.go('/auth');
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.creamSurface,
      body: Stack(
        children: [
          // Slides PageView
          PageView.builder(
            controller: _pageController,
            itemCount: _slides.length,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemBuilder: (context, index) {
              final slide = _slides[index];
              return Stack(
                fit: StackFit.expand,
                children: [
                  // Full bleed background image with luxury gradient
                  Image.network(
                    slide.imageUrl,
                    fit: BoxFit.cover,
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          AppColors.burgundyDarkest.withValues(alpha: 0.45),
                          AppColors.burgundyDarkest.withValues(alpha: 0.8),
                          AppColors.burgundyDarkest.withValues(alpha: 0.95),
                        ],
                        stops: const [0.0, 0.55, 0.85],
                      ),
                    ),
                  ),

                  // Slide content
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 28.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Spacer(),

                          // Category Pill
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.goldAccent.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppColors.goldAccent.withValues(alpha: 0.4),
                              ),
                            ),
                            child: Text(
                              slide.tag,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppColors.goldLight,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Heading
                          Text(
                            slide.title,
                            style: const TextStyle(
                              fontFamily: 'Playfair Display',
                              fontSize: 30,
                              fontWeight: FontWeight.bold,
                              color: AppColors.creamLight,
                              height: 1.15,
                            ),
                          ),
                          const SizedBox(height: 6),

                          // Amharic subtitle
                          Text(
                            slide.subtitle,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: AppColors.goldLight,
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Body
                          Text(
                            slide.description,
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.creamLight.withValues(alpha: 0.82),
                              height: 1.5,
                              fontWeight: FontWeight.w300,
                            ),
                          ),

                          const SizedBox(height: 140),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

          // Top Header (Brand & Skip)
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const MekdiBrandLogo(
                    axis: Axis.horizontal,
                    isLight: true,
                    emblemSize: 26,
                    titleSize: 13,
                    showTagline: false,
                  ),
                  TextButton(
                    onPressed: () => context.go('/auth'),
                    style: TextButton.styleFrom(
                      backgroundColor: Colors.black.withValues(alpha: 0.25),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(
                          color: Colors.white.withValues(alpha: 0.2),
                        ),
                      ),
                    ),
                    child: const Text(
                      'SKIP',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.creamLight,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Controls (Dots & Action Button)
          Positioned(
            bottom: 36,
            left: 28,
            right: 28,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Dots Indicator
                Row(
                  children: List.generate(
                    _slides.length,
                    (index) => AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.only(right: 6),
                      width: _currentPage == index ? 24 : 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: _currentPage == index
                            ? AppColors.goldAccent
                            : Colors.white.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),

                // Next / Get Started Button
                ElevatedButton(
                  onPressed: _onNext,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.goldAccent,
                    foregroundColor: AppColors.burgundyPrimary,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                    elevation: 4,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _currentPage == _slides.length - 1 ? 'GET STARTED' : 'CONTINUE',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(Icons.arrow_forward, size: 16),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
