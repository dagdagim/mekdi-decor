import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/gallery_model.dart';
import '../../../core/providers/app_providers.dart';

Color _parseHex(String hex) {
  try {
    final clean = hex.replaceAll('#', '');
    return Color(int.parse('FF$clean', radix: 16));
  } catch (_) {
    return AppColors.burgundyPrimary;
  }
}

String _getColorName(String hex) {
  final lower = hex.toUpperCase();
  if (lower.contains('5B1424') || lower.contains('4A0E17')) return 'Imperial Burgundy';
  if (lower.contains('D4AF37') || lower.contains('E5C365')) return 'Burnished Gold';
  if (lower.contains('FAF6F0') || lower.contains('FDFBF7') || lower.contains('FFFFFF')) return 'Ivory Silk';
  if (lower.contains('2E4F3E') || lower.contains('3D5A45')) return 'Botanical Sage';
  if (lower.contains('1C1917') || lower.contains('000000')) return 'Midnight Onyx';
  if (lower.contains('2563EB')) return 'Royal Sapphire';
  return 'Bespoke Accent';
}

class MobileInspirationScreen extends ConsumerStatefulWidget {
  const MobileInspirationScreen({super.key});

  @override
  ConsumerState<MobileInspirationScreen> createState() => _MobileInspirationScreenState();
}

class _MobileInspirationScreenState extends ConsumerState<MobileInspirationScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isGridView = false;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<String> _categories = [
    'All',
    'Wedding',
    'Melse',
    'Engagement',
    'Birthday',
    'Corporate',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _showDesignDetailSheet(BuildContext context, GalleryItemModel item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AtelierBlueprintSheet(item: item),
    );
  }

  void _shareBoard(List<GalleryItemModel> savedItems) {
    final titles = savedItems.map((e) => e.title).join(', ');
    Clipboard.setData(ClipboardData(
      text: 'Mekdi Decor Moodboard: Check out my curated celebration designs ($titles) on Mekdi Decor Atelier!',
    ));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: AppColors.burgundyPrimary,
        content: Text('Moodboard link copied to clipboard! Ready to share.'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final galleryState = ref.watch(galleryProvider);
    final allItems = galleryState.items;
    final savedItems = allItems.where((i) => i.isSaved).toList();

    final filteredItems = allItems.where((item) {
      if (_searchQuery.trim().isEmpty) return true;
      final query = _searchQuery.toLowerCase();
      return item.title.toLowerCase().contains(query) ||
          item.venue.toLowerCase().contains(query) ||
          item.city.toLowerCase().contains(query) ||
          item.style.toLowerCase().contains(query) ||
          item.category.toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.creamSurface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppColors.goldAccent,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                const Text(
                  'ATELIER MOODBOARD',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.5,
                    color: AppColors.goldDark,
                  ),
                ),
              ],
            ),
            const Text(
              'Spatial Inspirations',
              style: TextStyle(
                fontFamily: 'Playfair Display',
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.charcoalText,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: _isGridView ? 'Editorial View' : 'Grid View',
            icon: Icon(
              _isGridView ? Icons.view_agenda_outlined : Icons.grid_view_rounded,
              color: AppColors.burgundyPrimary,
              size: 22,
            ),
            onPressed: () => setState(() => _isGridView = !_isGridView),
          ),
          IconButton(
            tooltip: 'Share Moodboard',
            icon: const Icon(Icons.share_outlined, color: AppColors.charcoalText, size: 20),
            onPressed: () => _shareBoard(savedItems),
          ),
          const SizedBox(width: 6),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TabBar(
              controller: _tabController,
              indicatorColor: AppColors.burgundyPrimary,
              indicatorWeight: 2.5,
              labelColor: AppColors.burgundyPrimary,
              unselectedLabelColor: AppColors.charcoalMuted,
              labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
              tabs: [
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.auto_awesome, size: 15),
                      const SizedBox(width: 6),
                      Text('Atelier Concepts (${allItems.length})'),
                    ],
                  ),
                ),
                Tab(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        savedItems.isNotEmpty ? Icons.favorite : Icons.favorite_border,
                        size: 15,
                        color: savedItems.isNotEmpty ? Colors.red : null,
                      ),
                      const SizedBox(width: 6),
                      Text('My Board (${savedItems.length})'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // TAB 1: ATELIER GALLERY
          _buildGalleryTab(context, galleryState, filteredItems),

          // TAB 2: MY PERSONAL MOODBOARD
          _buildPersonalBoardTab(context, savedItems),
        ],
      ),
    );
  }

  // --- TAB 1: ATELIER GALLERY ---
  Widget _buildGalleryTab(
    BuildContext context,
    GalleryFilterState galleryState,
    List<GalleryItemModel> items,
  ) {
    return Column(
      children: [
        // Category Filter Chips
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: SizedBox(
            height: 38,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = galleryState.selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cat),
                    selected: isSelected,
                    selectedColor: AppColors.burgundyPrimary,
                    backgroundColor: AppColors.creamSurface,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                      side: BorderSide(
                        color: isSelected ? AppColors.burgundyPrimary : AppColors.creamBorder,
                      ),
                    ),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.charcoalText,
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    ),
                    onSelected: (_) {
                      ref.read(galleryProvider.notifier).setCategory(cat);
                    },
                  ),
                );
              },
            ),
          ),
        ),

        // Search Bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
          child: Container(
            height: 42,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.creamBorder),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Search by venue, theme, or city (e.g. Sheraton, Melse)...',
                hintStyle: const TextStyle(fontSize: 12, color: AppColors.charcoalMuted),
                prefixIcon: const Icon(Icons.search, size: 18, color: AppColors.goldDark),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 16),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
        ),

        // Content
        Expanded(
          child: galleryState.isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.burgundyPrimary),
                )
              : items.isEmpty
                  ? _buildEmptySearchState()
                  : _isGridView
                      ? _buildMasonryGrid(items)
                      : _buildEditorialList(items),
        ),
      ],
    );
  }

  // --- TAB 2: MY PERSONAL BOARD ---
  Widget _buildPersonalBoardTab(BuildContext context, List<GalleryItemModel> savedItems) {
    if (savedItems.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.burgundyPrimary.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.favorite_border, color: AppColors.burgundyPrimary, size: 38),
              ),
              const SizedBox(height: 18),
              const Text(
                'Your Moodboard is Empty',
                style: TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.charcoalText,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Explore our curated atelier collections and tap the heart icon on designs you love to build your bespoke celebration vision.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.charcoalMuted, height: 1.4),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => _tabController.animateTo(0),
                icon: const Icon(Icons.auto_awesome, size: 16),
                label: const Text('Explore Atelier Concepts'),
              ),
            ],
          ),
        ),
      );
    }

    // Extract all distinct colors from saved boards
    final distinctColors = <String>{};
    for (final it in savedItems) {
      distinctColors.addAll(it.colorPalette);
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Board Overview Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.burgundyDarkest,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.goldAccent.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'CURATED CELEBRATION PALETTE',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: AppColors.goldAccent,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                    Text(
                      '${savedItems.length} Concepts',
                      style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Your Bespoke Event Story',
                  style: TextStyle(
                    fontFamily: 'Playfair Display',
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Harmonized color story and spatial elements gathered for your upcoming celebration.',
                  style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.3),
                ),
                const SizedBox(height: 16),

                // Composite Palette Swatches
                Row(
                  children: distinctColors.take(6).map((hex) {
                    return Container(
                      margin: const EdgeInsets.only(right: 8),
                      width: 26,
                      height: 26,
                      decoration: BoxDecoration(
                        color: _parseHex(hex),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 4),
                        ],
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                // Request Quote for this board
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      context.push('/plan-event');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.goldAccent,
                      foregroundColor: AppColors.burgundyDarkest,
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.event_available, size: 16),
                    label: const Text(
                      'Request Quote For My Board',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text(
            'Saved Concepts (${savedItems.length})',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.charcoalText,
            ),
          ),
          const SizedBox(height: 12),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: savedItems.length,
            itemBuilder: (context, index) {
              final item = savedItems[index];
              return _buildEditorialCard(item);
            },
          ),
        ],
      ),
    );
  }

  // --- EDITORIAL VIEW ---
  Widget _buildEditorialList(List<GalleryItemModel> items) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return _buildEditorialCard(item);
      },
    );
  }

  Widget _buildEditorialCard(GalleryItemModel item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.creamBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 14,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Image with Badges
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                child: CachedNetworkImage(
                  imageUrl: item.imageUrl,
                  height: 220,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(
                    height: 220,
                    color: Colors.grey.shade200,
                    child: const Center(
                      child: CircularProgressIndicator(color: AppColors.burgundyPrimary, strokeWidth: 2),
                    ),
                  ),
                  errorWidget: (context, url, error) => Container(
                    height: 220,
                    color: AppColors.burgundyDarkest,
                    child: const Icon(Icons.image, color: Colors.white38, size: 48),
                  ),
                ),
              ),

              // Gradient Shade at bottom
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.1),
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.7),
                      ],
                      stops: const [0.0, 0.5, 1.0],
                    ),
                  ),
                ),
              ),

              // Top Badges
              Positioned(
                top: 14,
                left: 14,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.burgundyDarkest.withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.goldAccent.withValues(alpha: 0.6), width: 1),
                      ),
                      child: Text(
                        item.eventType.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.bold,
                          color: AppColors.goldAccent,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.45),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        item.style,
                        style: const TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Heart / Save Button
              Positioned(
                top: 14,
                right: 14,
                child: GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    ref.read(galleryProvider.notifier).toggleSave(item.id);
                  },
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.9),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 6),
                      ],
                    ),
                    child: Icon(
                      item.isSaved ? Icons.favorite : Icons.favorite_border,
                      size: 18,
                      color: item.isSaved ? Colors.red : AppColors.charcoalText,
                    ),
                  ),
                ),
              ),

              // Venue Tag bottom of image
              Positioned(
                bottom: 12,
                left: 14,
                right: 14,
                child: Row(
                  children: [
                    const Icon(Icons.location_on, size: 14, color: AppColors.goldAccent),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        '${item.venue} • ${item.city}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          shadows: [Shadow(color: Colors.black54, blurRadius: 4)],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Card Body
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  item.title,
                  style: const TextStyle(
                    fontFamily: 'Playfair Display',
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AppColors.charcoalText,
                  ),
                ),
                const SizedBox(height: 6),

                // Description
                Text(
                  item.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 12, color: AppColors.charcoalMuted, height: 1.4),
                ),
                const SizedBox(height: 14),

                // Palette Swatches Row
                Row(
                  children: [
                    const Text(
                      'Palette: ',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
                    ),
                    const SizedBox(width: 4),
                    ...item.colorPalette.map((hex) {
                      final col = _parseHex(hex);
                      return Container(
                        margin: const EdgeInsets.only(right: 6),
                        width: 18,
                        height: 18,
                        decoration: BoxDecoration(
                          color: col,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.black12, width: 1.5),
                        ),
                      );
                    }),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.creamSurface,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.creamBorder),
                      ),
                      child: Text(
                        '~${item.guestCount} Guests',
                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: AppColors.charcoalMuted),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Services tags
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: item.servicesUsed.take(3).map((srv) {
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.burgundyPrimary.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.star, size: 10, color: AppColors.goldDark),
                          const SizedBox(width: 3),
                          Text(
                            srv,
                            style: const TextStyle(fontSize: 10, color: AppColors.burgundyPrimary, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),

                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _showDesignDetailSheet(context, item),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 11),
                          side: const BorderSide(color: AppColors.burgundyPrimary, width: 1.2),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: const Text(
                          'Inspect Blueprint',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.burgundyPrimary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          context.push('/plan-event');
                        },
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 11),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        child: const Text(
                          'Plan with This Look',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
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
  }

  // --- MASONRY / COMPACT GRID VIEW ---
  Widget _buildMasonryGrid(List<GalleryItemModel> items) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.68,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return GestureDetector(
          onTap: () => _showDesignDetailSheet(context, item),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.creamBorder),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                        child: CachedNetworkImage(
                          imageUrl: item.imageUrl,
                          width: double.infinity,
                          height: double.infinity,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(color: Colors.grey.shade200),
                          errorWidget: (_, __, ___) => Container(color: AppColors.burgundyDarkest),
                        ),
                      ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: GestureDetector(
                          onTap: () => ref.read(galleryProvider.notifier).toggleSave(item.id),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.85),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              item.isSaved ? Icons.favorite : Icons.favorite_border,
                              size: 15,
                              color: item.isSaved ? Colors.red : AppColors.charcoalMuted,
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 6,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            item.eventType.toUpperCase(),
                            style: const TextStyle(color: AppColors.goldAccent, fontSize: 8.5, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.charcoalText,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.venue,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 10, color: AppColors.charcoalMuted),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: item.colorPalette.take(3).map((hex) {
                          return Container(
                            margin: const EdgeInsets.only(right: 4),
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: _parseHex(hex),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.black12),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptySearchState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.search_off, size: 48, color: AppColors.charcoalMuted),
            const SizedBox(height: 12),
            const Text(
              'No Designs Found',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
            ),
            const SizedBox(height: 4),
            Text(
              'No concepts match "$_searchQuery". Try searching for "Sheraton" or "Melse".',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: AppColors.charcoalMuted),
            ),
          ],
        ),
      ),
    );
  }
}

// --- IMMERSIVE ATELIER BLUEPRINT SHEET ---
class _AtelierBlueprintSheet extends ConsumerWidget {
  final GalleryItemModel item;
  const _AtelierBlueprintSheet({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final galleryState = ref.watch(galleryProvider);
    final currentSaved = galleryState.items.firstWhere(
      (e) => e.id == item.id,
      orElse: () => item,
    ).isSaved;

    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            children: [
              // Sheet Header
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: EdgeInsets.zero,
                  children: [
                    // Hero Image Banner
                    Stack(
                      children: [
                        CachedNetworkImage(
                          imageUrl: item.imageUrl,
                          height: 280,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                        Positioned.fill(
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.black.withValues(alpha: 0.3),
                                  Colors.transparent,
                                  Colors.black.withValues(alpha: 0.8),
                                ],
                              ),
                            ),
                          ),
                        ),
                        // Close button
                        Positioned(
                          top: 16,
                          right: 16,
                          child: GestureDetector(
                            onTap: () => Navigator.of(context).pop(),
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.5),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.close, color: Colors.white, size: 20),
                            ),
                          ),
                        ),
                        // Category & Style on Image
                        Positioned(
                          bottom: 16,
                          left: 20,
                          right: 20,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.goldAccent,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      item.eventType.toUpperCase(),
                                      style: const TextStyle(
                                        color: AppColors.burgundyDarkest,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 10,
                                        letterSpacing: 1,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    item.style,
                                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                item.title,
                                style: const TextStyle(
                                  fontFamily: 'Playfair Display',
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.location_on, size: 14, color: AppColors.goldAccent),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${item.venue} • ${item.city}',
                                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    // Body
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Overview
                          const Text(
                            'Design Vision & Atmosphere',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            item.description,
                            style: const TextStyle(fontSize: 13, color: AppColors.charcoalMuted, height: 1.5),
                          ),
                          const SizedBox(height: 24),

                          // Color Palette Breakdown
                          const Text(
                            'Harmonized Atelier Color Palette',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: item.colorPalette.map((hex) {
                              final col = _parseHex(hex);
                              final name = _getColorName(hex);
                              return Expanded(
                                child: Container(
                                  margin: const EdgeInsets.only(right: 8),
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: AppColors.creamSurface,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: AppColors.creamBorder),
                                  ),
                                  child: Column(
                                    children: [
                                      Container(
                                        width: 32,
                                        height: 32,
                                        decoration: BoxDecoration(
                                          color: col,
                                          shape: BoxShape.circle,
                                          border: Border.all(color: Colors.black12, width: 2),
                                          boxShadow: [
                                            BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        name,
                                        textAlign: TextAlign.center,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
                                      ),
                                      Text(
                                        hex,
                                        style: const TextStyle(fontSize: 8.5, color: AppColors.charcoalMuted, fontFamily: 'monospace'),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 24),

                          // Floral & Architectural Elements Recipe
                          const Text(
                            'Curated Inclusions & Florals',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
                          ),
                          const SizedBox(height: 10),
                          ...item.servicesUsed.map((srv) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(
                                      color: AppColors.goldAccent.withValues(alpha: 0.18),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.check, size: 12, color: AppColors.goldDark),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      srv,
                                      style: const TextStyle(fontSize: 13, color: AppColors.charcoalText, fontWeight: FontWeight.w500),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                          const SizedBox(height: 20),

                          // Investment & Capacity Box
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.creamSurface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.creamBorder),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Estimated Investment', style: TextStyle(fontSize: 11, color: AppColors.charcoalMuted)),
                                    const SizedBox(height: 2),
                                    Text(
                                      item.estimatedPriceRange,
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.burgundyPrimary),
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    const Text('Venue Capacity', style: TextStyle(fontSize: 11, color: AppColors.charcoalMuted)),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${item.guestCount} Guests',
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Sticky Bottom Action Bar
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    // Save Button
                    IconButton.filledTonal(
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        ref.read(galleryProvider.notifier).toggleSave(item.id);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppColors.burgundyPrimary,
                            duration: const Duration(seconds: 1),
                            content: Text(
                              !currentSaved
                                  ? 'Added "${item.title}" to your moodboard!'
                                  : 'Removed from your moodboard.',
                            ),
                          ),
                        );
                      },
                      style: IconButton.styleFrom(
                        backgroundColor: currentSaved
                            ? Colors.red.withValues(alpha: 0.1)
                            : AppColors.creamSurface,
                        foregroundColor: currentSaved ? Colors.red : AppColors.charcoalText,
                        padding: const EdgeInsets.all(14),
                      ),
                      icon: Icon(currentSaved ? Icons.favorite : Icons.favorite_border),
                    ),
                    const SizedBox(width: 12),

                    // Primary Plan CTA
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.of(context).pop();
                          context.push('/plan-event');
                        },
                        icon: const Icon(Icons.design_services, size: 16),
                        label: const Text('Design My Event With This Look'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
