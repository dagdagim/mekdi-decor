import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_providers.dart';

class MobileProfileScreen extends ConsumerWidget {
  const MobileProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customerAsync = ref.watch(customerProvider);
    final galleryState = ref.watch(galleryProvider);
    final savedCount = galleryState.items.where((i) => i.isSaved).length;

    return Scaffold(
      backgroundColor: AppColors.creamSurface,
      appBar: AppBar(
        title: Text(
          'Profile & Concierge',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: customerAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.burgundyPrimary)),
        error: (err, _) => Center(child: Text('Error loading profile: $err')),
        data: (customer) {
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              // VIP User Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundImage: NetworkImage(customer.avatarUrl),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            customer.fullName,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            customer.phone,
                            style: const TextStyle(color: AppColors.charcoalMuted, fontSize: 12),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.goldAccent.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              customer.vipTier,
                              style: const TextStyle(
                                color: AppColors.goldDark,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Quick Stats Counter
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          Text(
                            '$savedCount',
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.burgundyPrimary),
                          ),
                          const SizedBox(height: 4),
                          const Text('Saved Designs', style: TextStyle(fontSize: 11, color: AppColors.charcoalMuted)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          Text(
                            '${customer.totalEvents}',
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.burgundyPrimary),
                          ),
                          const SizedBox(height: 4),
                          const Text('Active Events', style: TextStyle(fontSize: 11, color: AppColors.charcoalMuted)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Options Menu
              _buildSettingTile(
                icon: Icons.switch_account_outlined,
                title: 'Switch Account / Sign In',
                subtitle: 'Log in with a different client or couple profile',
                onTap: () => context.go('/auth'),
              ),
              _buildSettingTile(
                icon: Icons.bookmark_border,
                title: 'Saved Inspirations',
                subtitle: '$savedCount concepts bookmarked',
                onTap: () => context.go('/explore'),
              ),
              _buildSettingTile(
                icon: Icons.add_circle_outline,
                title: 'Plan New Event',
                subtitle: 'Submit celebration request to database',
                onTap: () => context.push('/plan-event'),
              ),
              _buildSettingTile(
                icon: Icons.language_outlined,
                title: 'Language / ቋንቋ',
                subtitle: 'English (Amharic available)',
                onTap: () {},
              ),
              _buildSettingTile(
                icon: Icons.support_agent_outlined,
                title: 'Hawassa & Shashemene Atelier Concierge',
                subtitle: '+251 967 698 460 / +251 900 454 238',
                onTap: () => context.go('/messages'),
              ),

              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.burgundyPrimary,
                    side: BorderSide(color: AppColors.burgundyPrimary.withValues(alpha: 0.3)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    backgroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.logout, size: 18),
                  label: const Text(
                    'Sign Out / Change Account',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  onPressed: () {
                    ref.read(currentUserProvider.notifier).logout();
                    ref.read(eventsProvider.notifier).loadEvents('');
                    context.go('/auth');
                  },
                ),
              ),

              const SizedBox(height: 24),
              Center(
                child: Text(
                  'MEKDI DECOR V1.0 • Making Moments Unforgettable',
                  style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.burgundyPrimary.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.burgundyPrimary, size: 20),
        ),
        title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.charcoalMuted)),
        trailing: const Icon(Icons.chevron_right, size: 18, color: AppColors.charcoalMuted),
        onTap: onTap,
      ),
    );
  }
}
