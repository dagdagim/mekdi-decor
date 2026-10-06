import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/app_providers.dart';
import 'chapa_payment_sheet.dart';

class MobileEventDetailScreen extends ConsumerWidget {
  const MobileEventDetailScreen({super.key});

  void _showQuoteAndPaymentSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Consumer(
        builder: (context, ref, _) {
          final quoteState = ref.watch(quoteProvider);
          final quote = quoteState.quote;
          final isDepositPaid = quote?.status == 'APPROVED';

          final numberFormat = NumberFormat('#,###');

          return Container(
            height: MediaQuery.of(context).size.height * 0.88,
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Column(
              children: [
                // Modal Handle
                Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 8),
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),

                // Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            quote?.quoteNumber ?? 'MD-QT-2026-108',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.burgundyPrimary,
                              letterSpacing: 1,
                            ),
                          ),
                          const Text(
                            'Itemized Quotation',
                            style: TextStyle(
                              fontFamily: 'Playfair Display',
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: isDepositPaid
                              ? AppColors.botanicalGreen.withValues(alpha: 0.15)
                              : AppColors.goldAccent.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          isDepositPaid ? 'DEPOSIT CONFIRMED' : 'AWAITING DEPOSIT',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isDepositPaid ? AppColors.botanicalGreen : AppColors.goldDark,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const Divider(height: 1),

                // Itemized Breakdown List
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(20),
                    children: [
                      ...?quote?.items.map((item) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AppColors.creamSurface,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      item.title,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.charcoalText,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '${numberFormat.format(item.subtotal)} ETB',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.burgundyPrimary,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item.description,
                                style: const TextStyle(fontSize: 11, color: AppColors.charcoalMuted),
                              ),
                            ],
                          ),
                        );
                      }),

                      const SizedBox(height: 12),

                      // Totals Summary Box
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.burgundyDarkest,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Total Quotation', style: TextStyle(color: Colors.white70, fontSize: 13)),
                                Text(
                                  '${numberFormat.format(quote?.totalAmount ?? 205000)} ETB',
                                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Required 50% Deposit', style: TextStyle(color: AppColors.goldAccent, fontSize: 13, fontWeight: FontWeight.w600)),
                                Text(
                                  '${numberFormat.format(quote?.depositAmount ?? 102500)} ETB',
                                  style: const TextStyle(color: AppColors.goldAccent, fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Payment Method Selector
                      if (!isDepositPaid) ...[
                        const Text(
                          'Select Ethiopian Payment Gateway',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            _buildPaymentMethodOption(
                              label: 'Telebirr',
                              icon: Icons.phone_android,
                              isSelected: quoteState.selectedPaymentMethod == 'Telebirr',
                              onTap: () => ref.read(quoteProvider.notifier).setPaymentMethod('Telebirr'),
                            ),
                            const SizedBox(width: 8),
                            _buildPaymentMethodOption(
                              label: 'Chapa',
                              icon: Icons.credit_card,
                              isSelected: quoteState.selectedPaymentMethod == 'Chapa',
                              onTap: () => ref.read(quoteProvider.notifier).setPaymentMethod('Chapa'),
                            ),
                            const SizedBox(width: 8),
                            _buildPaymentMethodOption(
                              label: 'CBE Birr',
                              icon: Icons.account_balance,
                              isSelected: quoteState.selectedPaymentMethod == 'CBE Birr',
                              onTap: () => ref.read(quoteProvider.notifier).setPaymentMethod('CBE Birr'),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),

                // Bottom Action
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
                  child: isDepositPaid
                      ? Container(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: AppColors.botanicalGreen.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.check_circle, color: AppColors.botanicalGreen, size: 20),
                              SizedBox(width: 8),
                              Text(
                                'Deposit of ETB 102,500 Confirmed & Recorded',
                                style: TextStyle(
                                  color: AppColors.botanicalGreen,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        )
                      : SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: quoteState.isPaying
                                ? null
                                : () async {
                                    if (quoteState.selectedPaymentMethod == 'Chapa') {
                                      final currentUser = ref.read(currentUserProvider);
                                      final res = await ref.read(quoteProvider.notifier).initiateChapaPayment(
                                            customerName: currentUser.fullName,
                                            email: currentUser.email,
                                            phone: currentUser.phone,
                                          );
                                      if (res['success'] == true && context.mounted) {
                                        final checkoutUrl = res['checkoutUrl']?.toString() ?? '';
                                        final txRef = res['txRef']?.toString() ?? res['paymentReference']?.toString() ?? '';
                                        ChapaPaymentSheet.show(
                                          context: context,
                                          title: quoteState.quote?.eventTitle ?? "Sara & Michael's Luxury Wedding",
                                          amount: quoteState.quote?.depositAmount ?? 102500,
                                          quoteId: quoteState.quote?.id ?? 'q-108',
                                          checkoutUrl: checkoutUrl,
                                          txRef: txRef,
                                          onVerify: () => ref.read(quoteProvider.notifier).verifyChapaPayment(
                                                customerEmail: currentUser.email,
                                              ),
                                          onSuccess: () {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(
                                                backgroundColor: AppColors.botanicalGreen,
                                                content: Text('Chapa payment verified! Booking dates confirmed & registered.'),
                                              ),
                                            );
                                          },
                                        );
                                      }
                                    } else {
                                      final success = await ref.read(quoteProvider.notifier).processDeposit();
                                      if (success && context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            backgroundColor: AppColors.botanicalGreen,
                                            content: Text('Payment registered in database! Booking dates confirmed.'),
                                          ),
                                        );
                                      }
                                    }
                                  },
                            child: quoteState.isPaying
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                : Text('Authorize ${quoteState.selectedPaymentMethod} Deposit (ETB ${numberFormat.format(quote?.depositAmount ?? 102500)})'),
                          ),
                        ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPaymentMethodOption({
    required String label,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.burgundyPrimary.withValues(alpha: 0.08) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.burgundyPrimary : Colors.grey.shade300,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                size: 20,
                color: isSelected ? AppColors.burgundyPrimary : AppColors.charcoalMuted,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? AppColors.burgundyPrimary : AppColors.charcoalText,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final quoteState = ref.watch(quoteProvider);
    final isDepositPaid = quoteState.quote?.status == 'APPROVED';

    final progressSteps = [
      {'name': 'Consultation & Vision', 'done': true},
      {'name': 'Initial Styling Concepts', 'done': true},
      {'name': 'Itemized Proposal & Quote', 'done': true},
      {'name': '50% Deposit Authorization', 'done': isDepositPaid, 'current': !isDepositPaid},
      {'name': 'Floral Sourcing & Production', 'done': false, 'current': isDepositPaid},
      {'name': 'Event Day Installation & Styling', 'done': false},
    ];

    return Scaffold(
      backgroundColor: AppColors.creamSurface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.charcoalText),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'My Event Details',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Event Hero Photo
            Container(
              height: 220,
              width: double.infinity,
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage(
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
                  ),
                  fit: BoxFit.cover,
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          quoteState.quote?.eventTitle ?? "Sarah's Wedding",
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: isDepositPaid
                              ? AppColors.botanicalGreen.withValues(alpha: 0.15)
                              : AppColors.burgundyPrimary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          isDepositPaid ? 'CONFIRMED' : 'QUOTE READY',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isDepositPaid ? AppColors.botanicalGreen : AppColors.burgundyPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 13, color: AppColors.goldDark),
                      const SizedBox(width: 4),
                      Text(
                        quoteState.quote?.eventDate ?? 'Dec 18, 2026',
                        style: const TextStyle(fontSize: 12, color: AppColors.charcoalMuted),
                      ),
                      const SizedBox(width: 12),
                      const Icon(Icons.location_on, size: 13, color: AppColors.goldDark),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          quoteState.quote?.venueName ?? 'Skyline Event Hall, Hawassa',
                          style: const TextStyle(fontSize: 12, color: AppColors.charcoalMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Event Milestone Tracking Section
                  Text(
                    'Milestone Tracking',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 14),

                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: progressSteps.map((step) {
                        final isDone = step['done'] == true;
                        final isCurrent = step['current'] == true;

                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            children: [
                              Container(
                                width: 22,
                                height: 22,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: isDone
                                      ? AppColors.botanicalGreen
                                      : isCurrent
                                          ? AppColors.burgundyPrimary
                                          : Colors.grey.shade200,
                                ),
                                child: Center(
                                  child: isDone
                                      ? const Icon(Icons.check, size: 14, color: Colors.white)
                                      : isCurrent
                                          ? const Icon(Icons.arrow_forward, size: 12, color: AppColors.goldAccent)
                                          : null,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Text(
                                  step['name'] as String,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: isCurrent ? FontWeight.bold : FontWeight.w500,
                                    color: isDone || isCurrent
                                        ? AppColors.charcoalText
                                        : AppColors.charcoalMuted,
                                  ),
                                ),
                              ),
                              if (isDone)
                                const Icon(Icons.check, size: 16, color: AppColors.botanicalGreen),
                              if (isCurrent)
                                const Text(
                                  'Current',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: AppColors.burgundyPrimary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => context.go('/messages'),
                          icon: const Icon(Icons.chat_bubble_outline, size: 16),
                          label: const Text('Chat Concierge'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _showQuoteAndPaymentSheet(context, ref),
                          icon: const Icon(Icons.description_outlined, size: 16),
                          label: Text(isDepositPaid ? 'View Invoice' : 'View Quote & Pay'),
                        ),
                      ),
                    ],
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
