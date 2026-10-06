import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_providers.dart';

class MobileEventsScreen extends ConsumerStatefulWidget {
  const MobileEventsScreen({super.key});

  @override
  ConsumerState<MobileEventsScreen> createState() => _MobileEventsScreenState();
}

class _MobileEventsScreenState extends ConsumerState<MobileEventsScreen> {
  int _selectedTabIndex = 0; // 0 = Confirmed Bookings, 1 = Pending Requests

  @override
  Widget build(BuildContext context) {
    final allEvents = ref.watch(eventsProvider);
    final bookings = allEvents.where((e) => e.isBooking).toList();
    final requests = allEvents.where((e) => !e.isBooking).toList();

    final numberFormat = NumberFormat('#,###');

    return Scaffold(
      backgroundColor: AppColors.creamSurface,
      appBar: AppBar(
        title: Text(
          'My Celebrations',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                fontFamily: 'Playfair Display',
                fontSize: 18,
              ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: AppColors.burgundyPrimary),
            tooltip: 'New Event Request',
            onPressed: () => context.push('/plan-event'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(eventsProvider.notifier).loadEvents(),
        color: AppColors.burgundyPrimary,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Segmented Tab Selector
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.creamBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTabIndex = 0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _selectedTabIndex == 0
                              ? AppColors.burgundyPrimary
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            'Bookings (${bookings.length})',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: _selectedTabIndex == 0
                                  ? AppColors.creamLight
                                  : AppColors.charcoalText,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTabIndex = 1),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _selectedTabIndex == 1
                              ? AppColors.burgundyPrimary
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Text(
                            'Requests (${requests.length})',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: _selectedTabIndex == 1
                                  ? AppColors.creamLight
                                  : AppColors.charcoalText,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Tab 0: Confirmed Bookings
            if (_selectedTabIndex == 0) ...[
              if (bookings.isEmpty)
                Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.creamBorder),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.event_available, color: AppColors.goldDark, size: 48),
                      SizedBox(height: 12),
                      Text(
                        'No Confirmed Bookings Yet',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      SizedBox(height: 6),
                      Text(
                        'Authorize your 50% deposit on any pending request to secure your date in the production calendar.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: AppColors.charcoalMuted),
                      ),
                    ],
                  ),
                )
              else
                ...bookings.map((booking) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: GestureDetector(
                      onTap: () => context.push('/event-detail'),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                          border: Border.all(color: AppColors.goldAccent.withValues(alpha: 0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(14),
                                  child: Image.network(
                                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=80',
                                    width: 70,
                                    height: 70,
                                    fit: BoxFit.cover,
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
                                          Expanded(
                                            child: Text(
                                              booking.title,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14,
                                                color: AppColors.charcoalText,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: AppColors.botanicalGreen.withValues(alpha: 0.12),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: const Text(
                                              'CONFIRMED',
                                              style: TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.botanicalGreen,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${booking.eventDate} • ${booking.venueName}',
                                        style: const TextStyle(fontSize: 11, color: AppColors.charcoalMuted),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: ClipRRect(
                                              borderRadius: BorderRadius.circular(4),
                                              child: LinearProgressIndicator(
                                                value: booking.progressPercentage / 100,
                                                backgroundColor: Colors.grey.shade200,
                                                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.goldDark),
                                                minHeight: 5,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            '${booking.progressPercentage}%',
                                            style: const TextStyle(
                                              fontSize: 10,
                                              color: AppColors.burgundyPrimary,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 20),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.check_circle, color: AppColors.botanicalGreen, size: 14),
                                    const SizedBox(width: 4),
                                    Text(
                                      '50% Deposit Paid (${numberFormat.format(booking.depositAmount)} ETB)',
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.botanicalGreen,
                                      ),
                                    ),
                                  ],
                                ),
                                const Row(
                                  children: [
                                    Text(
                                      'View Blueprint',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.burgundyPrimary,
                                      ),
                                    ),
                                    Icon(Icons.chevron_right, size: 16, color: AppColors.burgundyPrimary),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
            ] else ...[
              // Tab 1: Pending Requests
              if (requests.isEmpty)
                Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.creamBorder),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.inbox, color: AppColors.charcoalMuted, size: 48),
                      SizedBox(height: 12),
                      Text(
                        'No Pending Requests',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      SizedBox(height: 6),
                      Text(
                        'All your celebrations are approved or converted to confirmed bookings.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 12, color: AppColors.charcoalMuted),
                      ),
                    ],
                  ),
                )
              else
                ...requests.map((request) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
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
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              request.code,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: AppColors.charcoalMuted,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.goldAccent.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                request.status,
                                style: const TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.goldDark,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          request.title,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: AppColors.charcoalText,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${request.eventDate} • ${request.venueName} (${request.guestCount} guests)',
                          style: const TextStyle(fontSize: 11, color: AppColors.charcoalMuted),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () => context.push('/messages'),
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  side: const BorderSide(color: AppColors.creamBorder),
                                ),
                                child: const Text('Chat with Stylist', style: TextStyle(fontSize: 11)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => context.push('/event-detail'),
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  backgroundColor: AppColors.burgundyPrimary,
                                ),
                                child: const Text('Review & Pay 50%', style: TextStyle(fontSize: 11, color: AppColors.creamLight)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
            ],

            const SizedBox(height: 12),

            // Plan New Event Prompt Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.creamBase,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.goldAccent.withValues(alpha: 0.4)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.add_circle_outline, color: AppColors.burgundyPrimary, size: 36),
                  const SizedBox(height: 8),
                  const Text(
                    'Planning Another Special Moment?',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Graduation, wedding, Melse, or VIP celebration.',
                    style: TextStyle(fontSize: 12, color: AppColors.charcoalMuted),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => context.push('/plan-event'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.burgundyPrimary,
                      foregroundColor: AppColors.creamLight,
                    ),
                    child: const Text('Start New Event Request'),
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
