import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_providers.dart';
import '../../../core/widgets/botanical_logo.dart';

class MobileHomeScreen extends ConsumerStatefulWidget {
  const MobileHomeScreen({super.key});

  @override
  ConsumerState<MobileHomeScreen> createState() => _MobileHomeScreenState();
}

class _MobileHomeScreenState extends ConsumerState<MobileHomeScreen> {
  bool _showAfterTransformation = true;

  @override
  Widget build(BuildContext context) {
    final events = ref.watch(eventsProvider);
    final activeEvent = events.isNotEmpty ? events.first : null;
    final galleryState = ref.watch(galleryProvider);
    final quoteState = ref.watch(quoteProvider);
    final servicesAsync = ref.watch(servicesProvider);
    final packagesAsync = ref.watch(packagesProvider);

    final currencyFormat = NumberFormat('#,###');

    return Scaffold(
      backgroundColor: AppColors.creamSurface,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Brand Header with Official Brand Logo matching the web photo
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const MekdiBrandLogo(
                    axis: Axis.horizontal,
                    isLight: false,
                    emblemSize: 34,
                    titleSize: 16,
                    taglineSize: 9.5,
                  ),
                  IconButton(
                    onPressed: () => context.go('/messages'),
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: AppColors.creamBorder),
                      ),
                    ),
                    icon: const Icon(Icons.chat_bubble_outline, color: AppColors.burgundyPrimary, size: 20),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Customer Header (Replaced Welcome and Name with Private Atelier Celebrations Header)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'ATELIER CELEBRATIONS',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppColors.goldDark,
                            letterSpacing: 1.8,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'Bespoke Celebrations',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                color: AppColors.charcoalText,
                                fontWeight: FontWeight.bold,
                                fontSize: 22,
                              ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Curating your bespoke celebration milestones.',
                          style: TextStyle(fontSize: 12, color: AppColors.charcoalMuted),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.goldAccent.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.goldDark.withValues(alpha: 0.3)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.diamond, size: 12, color: AppColors.goldDark),
                        SizedBox(width: 4),
                        Text(
                          'VIP Diamond',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.burgundyPrimary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Active Event Hero Card
              if (activeEvent != null)
                GestureDetector(
                  onTap: () => context.push('/event-detail'),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.burgundyDarkest,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.burgundyPrimary.withValues(alpha: 0.25),
                          blurRadius: 18,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                activeEvent.title,
                                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.burgundyPrimary,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.goldAccent.withValues(alpha: 0.4)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.calendar_today, size: 11, color: AppColors.goldAccent),
                                  const SizedBox(width: 4),
                                  Text(
                                    activeEvent.eventDate,
                                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),

                        // Progress bar & %
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Design & Booking Milestone',
                              style: TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                            Text(
                              '${activeEvent.progressPercentage}% Complete',
                              style: const TextStyle(
                                color: AppColors.goldAccent,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: (activeEvent.progressPercentage) / 100,
                            backgroundColor: Colors.white24,
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.goldAccent),
                            minHeight: 8,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Action button inside hero card
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.goldAccent,
                              foregroundColor: AppColors.burgundyDarkest,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            onPressed: () => context.push('/event-detail'),
                            child: Text(
                              quoteState.quote?.status == 'APPROVED' ? 'View Confirmed Invoice' : 'Review Quote & Pay Deposit',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                GestureDetector(
                  onTap: () => context.push('/plan-event'),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.burgundyDarkest,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.burgundyPrimary.withValues(alpha: 0.25),
                          blurRadius: 18,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Expanded(
                              child: Text(
                                'Begin Your Celebration Journey',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 17,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.burgundyPrimary,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.goldAccent.withValues(alpha: 0.4)),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.auto_awesome, size: 12, color: AppColors.goldAccent),
                                  SizedBox(width: 4),
                                  Text(
                                    'Atelier Booking',
                                    style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        const Text(
                          'Ready to design an unforgettable wedding, gala, or milestone celebration? Let Mekdi Decor bring your vision to life.',
                          style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                        ),
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.goldAccent,
                              foregroundColor: AppColors.burgundyDarkest,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                            icon: const Icon(Icons.add_circle_outline, size: 16),
                            label: const Text(
                              'Plan Your Event With Mekdi Decor',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            onPressed: () => context.push('/plan-event'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 22),

              // Quick Actions Row
              Row(
                children: [
                  Expanded(
                    child: _buildActionTile(
                      context,
                      icon: Icons.auto_awesome,
                      title: 'Plan Event',
                      subtitle: 'Bespoke intake',
                      onTap: () => context.push('/plan-event'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildActionTile(
                      context,
                      icon: Icons.support_agent,
                      title: 'Concierge',
                      subtitle: 'Chat stylist',
                      onTap: () => context.go('/messages'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildActionTile(
                      context,
                      icon: Icons.photo_library,
                      title: 'Gallery',
                      subtitle: 'Browse styles',
                      onTap: () => context.go('/explore'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // ==========================================
              // 1. FEATURED TRANSFORMATION SECTION
              // ==========================================
              _buildSectionHeader(
                context,
                eyebrow: 'FEATURED TRANSFORMATION',
                title: 'From Empty Space to Unforgettable',
                subtitle: 'Toggle between the raw banquet hall and Mekdi Decor\'s breathtaking luxury metamorphosis.',
              ),
              const SizedBox(height: 14),

              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(color: AppColors.creamBorder),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image with Toggle Overlay
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
                          child: AnimatedCrossFade(
                            duration: const Duration(milliseconds: 350),
                            crossFadeState: _showAfterTransformation
                                ? CrossFadeState.showSecond
                                : CrossFadeState.showFirst,
                            firstChild: Image.network(
                              'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
                              height: 200,
                              width: double.infinity,
                              fit: BoxFit.cover,
                            ),
                            secondChild: Image.network(
                              'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
                              height: 200,
                              width: double.infinity,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        // State Badge
                        Positioned(
                          top: 12,
                          left: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: _showAfterTransformation
                                  ? AppColors.burgundyPrimary.withValues(alpha: 0.9)
                                  : Colors.black.withValues(alpha: 0.75),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: _showAfterTransformation ? AppColors.goldAccent : Colors.white24,
                                width: 1,
                              ),
                            ),
                            child: Text(
                              _showAfterTransformation ? 'AFTER: MEKDI DECOR' : 'BEFORE: RAW HALL',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: _showAfterTransformation ? AppColors.goldLight : Colors.white,
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    // Toggle Bar & Details
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Skyline Event Hall, Hawassa',
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.charcoalText,
                                      ),
                                    ),
                                    SizedBox(height: 2),
                                    Text(
                                      'Imperial Velvet & Crystal Arch • 450 Guests',
                                      style: TextStyle(fontSize: 11, color: AppColors.charcoalMuted),
                                    ),
                                  ],
                                ),
                              ),
                              // Interactive Before / After Pill Switch
                              Container(
                                decoration: BoxDecoration(
                                  color: AppColors.creamSurface,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: AppColors.creamBorder),
                                ),
                                child: Row(
                                  children: [
                                    GestureDetector(
                                      onTap: () => setState(() => _showAfterTransformation = false),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: !_showAfterTransformation ? AppColors.charcoalText : Colors.transparent,
                                          borderRadius: BorderRadius.circular(18),
                                        ),
                                        child: Text(
                                          'Before',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: !_showAfterTransformation ? Colors.white : AppColors.charcoalMuted,
                                          ),
                                        ),
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: () => setState(() => _showAfterTransformation = true),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: _showAfterTransformation ? AppColors.burgundyPrimary : Colors.transparent,
                                          borderRadius: BorderRadius.circular(18),
                                        ),
                                        child: Text(
                                          'After',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: _showAfterTransformation ? AppColors.goldLight : AppColors.charcoalMuted,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'We enclosed the concrete walls with acoustic velvet drapery, elevated the couple podium with 400 fresh Ecuadorian roses, and installed warm Chauvet pinspot lighting.',
                            style: TextStyle(fontSize: 11.5, color: AppColors.charcoalText, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              // ==========================================
              // 2. OUR BESPOKE SERVICES SECTION
              // ==========================================
              _buildSectionHeader(
                context,
                eyebrow: 'ARTISTRY & EXECUTION',
                title: 'Our Bespoke Services',
                subtitle: 'From structural stage carpentry to delicate fresh florals, we craft every layer with intention.',
                actionText: 'View All',
                onAction: () => context.go('/explore'),
              ),
              const SizedBox(height: 14),

              servicesAsync.when(
                data: (services) => SizedBox(
                  height: 220,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: services.length,
                    itemBuilder: (context, index) {
                      final item = services[index];
                      return Container(
                        width: 200,
                        margin: const EdgeInsets.only(right: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.creamBorder),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                              child: Image.network(
                                item.featuredImage,
                                height: 110,
                                width: 200,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.title,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.charcoalText,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    item.subtitle,
                                    style: const TextStyle(fontSize: 10, color: AppColors.charcoalMuted),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text('STARTING FROM', style: TextStyle(fontSize: 8, color: AppColors.charcoalMuted, letterSpacing: 0.8)),
                                          Text(
                                            'ETB ${currencyFormat.format(item.startingPrice)}',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.burgundyPrimary,
                                            ),
                                          ),
                                        ],
                                      ),
                                      GestureDetector(
                                        onTap: () => context.push('/plan-event'),
                                        child: Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: AppColors.burgundyPrimary.withValues(alpha: 0.1),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(Icons.arrow_forward, size: 14, color: AppColors.burgundyPrimary),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: CircularProgressIndicator(color: AppColors.burgundyPrimary),
                  ),
                ),
                error: (err, _) => const Text('Could not load services', style: TextStyle(color: AppColors.charcoalMuted)),
              ),
              const SizedBox(height: 30),

              // ==========================================
              // 3. TAILORED DECORATION PACKAGES SECTION
              // ==========================================
              _buildSectionHeader(
                context,
                eyebrow: 'CURATED EXPERIENCES',
                title: 'Tailored Decoration Packages',
                subtitle: 'Transparent starting tiers designed to match your celebration scale.',
              ),
              const SizedBox(height: 14),

              packagesAsync.when(
                data: (packages) => Column(
                  children: packages.map((pkg) {
                    final isFeatured = pkg.isFeatured;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: isFeatured ? AppColors.burgundyDarkest : Colors.white,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(
                          color: isFeatured ? AppColors.goldAccent : AppColors.creamBorder,
                          width: isFeatured ? 1.8 : 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: isFeatured
                                ? AppColors.burgundyPrimary.withValues(alpha: 0.25)
                                : Colors.black.withValues(alpha: 0.04),
                            blurRadius: 14,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Stack(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      pkg.tierLabel.toUpperCase(),
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: isFeatured ? AppColors.goldAccent : AppColors.goldDark,
                                        letterSpacing: 1.2,
                                      ),
                                    ),
                                    if (isFeatured)
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: AppColors.goldAccent,
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: const Row(
                                          children: [
                                            Icon(Icons.star, size: 11, color: AppColors.burgundyDarkest),
                                            SizedBox(width: 4),
                                            Text(
                                              'MOST POPULAR',
                                              style: TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.burgundyDarkest,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  pkg.name,
                                  style: TextStyle(
                                    fontFamily: 'Playfair Display',
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: isFeatured ? Colors.white : AppColors.charcoalText,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  pkg.description,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isFeatured ? Colors.white70 : AppColors.charcoalMuted,
                                    height: 1.4,
                                  ),
                                ),
                                const SizedBox(height: 14),

                                // Starting price
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.baseline,
                                  textBaseline: TextBaseline.alphabetic,
                                  children: [
                                    Text(
                                      'ETB ${currencyFormat.format(pkg.startingPrice)}',
                                      style: TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.bold,
                                        color: isFeatured ? AppColors.goldAccent : AppColors.burgundyPrimary,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'starting tier',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: isFeatured ? Colors.white54 : AppColors.charcoalMuted,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                const Divider(height: 1, color: Colors.black12),
                                const SizedBox(height: 14),

                                // Included Features
                                ...pkg.includedServices.map((srv) {
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 6),
                                    child: Row(
                                      children: [
                                        Icon(
                                          Icons.check_circle,
                                          size: 15,
                                          color: isFeatured ? AppColors.goldAccent : AppColors.botanicalGreen,
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            srv,
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: isFeatured ? Colors.white.withValues(alpha: 0.9) : AppColors.charcoalText,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }),
                                const SizedBox(height: 16),

                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: isFeatured ? AppColors.goldAccent : AppColors.burgundyPrimary,
                                      foregroundColor: isFeatured ? AppColors.burgundyDarkest : Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 12),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                    ),
                                    onPressed: () => context.push('/plan-event'),
                                    child: const Text('Customize This Package', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: CircularProgressIndicator(color: AppColors.burgundyPrimary),
                  ),
                ),
                error: (err, _) => const Text('Could not load packages', style: TextStyle(color: AppColors.charcoalMuted)),
              ),
              const SizedBox(height: 30),

              // ==========================================
              // 4. HOW IT WORKS SECTION
              // ==========================================
              _buildSectionHeader(
                context,
                eyebrow: 'SEAMLESS JOURNEY',
                title: 'How It Works',
                subtitle: 'We eliminate event planning stress with a refined four-step process.',
              ),
              const SizedBox(height: 14),

              _buildHowItWorksCard(
                step: '01',
                title: 'Tell Us Your Vision',
                description: 'Submit your date, guest count, venue, and preferred colors using our interactive mobile intake wizard.',
                icon: Icons.explore_outlined,
              ),
              const SizedBox(height: 12),
              _buildHowItWorksCard(
                step: '02',
                title: 'Create Your Design',
                description: 'Our atelier crafts a 3D moodboard, stage blueprints, and botanical recipes customized specifically to your venue.',
                icon: Icons.palette_outlined,
              ),
              const SizedBox(height: 12),
              _buildHowItWorksCard(
                step: '03',
                title: 'Approve Your Quote',
                description: 'Receive an itemized digital quotation. Lock your reservation with seamless Ethiopian payment (Telebirr, CBE Birr, or Chapa).',
                icon: Icons.verified_outlined,
              ),
              const SizedBox(height: 12),
              _buildHowItWorksCard(
                step: '04',
                title: 'Celebrate Your Moment',
                description: 'On event day, our master florists and carpenters execute the transformation 12 hours prior so you walk into pure magic.',
                icon: Icons.wine_bar_outlined,
              ),
              const SizedBox(height: 30),

              // ==========================================
              // 5. FEATURED CONCEPTS (GALLERY CAROUSEL)
              // ==========================================
              _buildSectionHeader(
                context,
                eyebrow: 'EDITORIAL PORTFOLIO',
                title: 'Featured Concepts',
                subtitle: 'Authentic Ethiopian luxury venues styled by Mekdi Decor.',
                actionText: 'View Gallery',
                onAction: () => context.go('/explore'),
              ),
              const SizedBox(height: 14),

              SizedBox(
                height: 220,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: galleryState.items.length,
                  itemBuilder: (context, index) {
                    final item = galleryState.items[index];
                    return GestureDetector(
                      onTap: () => context.go('/explore'),
                      child: Container(
                        width: 185,
                        margin: const EdgeInsets.only(right: 14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: AppColors.creamBorder),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                              child: Image.network(
                                item.imageUrl,
                                height: 115,
                                width: 185,
                                fit: BoxFit.cover,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(10),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        item.category.toUpperCase(),
                                        style: const TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.burgundyPrimary,
                                        ),
                                      ),
                                      Text(
                                        item.city,
                                        style: const TextStyle(fontSize: 9, color: AppColors.charcoalMuted),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    item.title,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.charcoalText,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item.venue,
                                    style: const TextStyle(fontSize: 10, color: AppColors.charcoalMuted),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(
    BuildContext context, {
    required String eyebrow,
    required String title,
    required String subtitle,
    String? actionText,
    VoidCallback? onAction,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.auto_awesome, size: 12, color: AppColors.goldDark),
                const SizedBox(width: 5),
                Text(
                  eyebrow,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.goldDark,
                    letterSpacing: 1.5,
                  ),
                ),
              ],
            ),
            if (actionText != null && onAction != null)
              TextButton(
                onPressed: onAction,
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  actionText,
                  style: const TextStyle(
                    color: AppColors.burgundyPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontSize: 19,
                fontWeight: FontWeight.bold,
                fontFamily: 'Playfair Display',
                color: AppColors.charcoalText,
              ),
        ),
        const SizedBox(height: 3),
        Text(
          subtitle,
          style: const TextStyle(fontSize: 12, color: AppColors.charcoalMuted, height: 1.35),
        ),
      ],
    );
  }

  Widget _buildHowItWorksCard({
    required String step,
    required String title,
    required String description,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.creamBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.burgundyPrimary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.goldAccent.withValues(alpha: 0.3)),
            ),
            child: Center(
              child: Icon(icon, color: AppColors.burgundyPrimary, size: 22),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.charcoalText,
                      ),
                    ),
                    Text(
                      step,
                      style: TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.goldDark.withValues(alpha: 0.5),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(fontSize: 11.5, color: AppColors.charcoalMuted, height: 1.35),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.creamBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.burgundyPrimary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AppColors.burgundyPrimary, size: 20),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 10, color: AppColors.charcoalMuted),
            ),
          ],
        ),
      ),
    );
  }
}
