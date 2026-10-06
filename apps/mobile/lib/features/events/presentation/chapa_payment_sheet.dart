import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';

class ChapaPaymentSheet extends StatefulWidget {
  final String title;
  final double amount;
  final String quoteId;
  final String checkoutUrl;
  final String txRef;
  final Future<bool> Function() onVerify;
  final VoidCallback onSuccess;

  const ChapaPaymentSheet({
    super.key,
    required this.title,
    required this.amount,
    required this.quoteId,
    required this.checkoutUrl,
    required this.txRef,
    required this.onVerify,
    required this.onSuccess,
  });

  static Future<void> show({
    required BuildContext context,
    required String title,
    required double amount,
    required String quoteId,
    required String checkoutUrl,
    required String txRef,
    required Future<bool> Function() onVerify,
    required VoidCallback onSuccess,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ChapaPaymentSheet(
        title: title,
        amount: amount,
        quoteId: quoteId,
        checkoutUrl: checkoutUrl,
        txRef: txRef,
        onVerify: onVerify,
        onSuccess: onSuccess,
      ),
    );
  }

  @override
  State<ChapaPaymentSheet> createState() => _ChapaPaymentSheetState();
}

class _ChapaPaymentSheetState extends State<ChapaPaymentSheet> {
  bool _isVerifying = false;
  bool _isSuccess = false;
  String? _errorMessage;

  Future<void> _launchCheckout() async {
    try {
      final uri = Uri.parse(widget.checkoutUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri);
      }
    } catch (e) {
      debugPrint('Could not launch Chapa checkout URL: $e');
    }
  }

  Future<void> _handleVerify() async {
    setState(() {
      _isVerifying = true;
      _errorMessage = null;
    });

    final verified = await widget.onVerify();

    if (!mounted) return;

    if (verified) {
      setState(() {
        _isVerifying = false;
        _isSuccess = true;
      });
      HapticFeedback.mediumImpact();
      Future.delayed(const Duration(milliseconds: 1400), () {
        if (mounted) {
          Navigator.of(context).pop();
          widget.onSuccess();
        }
      });
    } else {
      setState(() {
        _isVerifying = false;
        _errorMessage = 'Chapa payment pending or not yet completed. Please finish checkout or try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###');

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 28,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 18),

          // Header with Chapa Branding
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF00A859).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF00A859), width: 1.2),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.shield_outlined, size: 14, color: Color(0xFF00A859)),
                        SizedBox(width: 4),
                        Text(
                          'CHAPA',
                          style: TextStyle(
                            color: Color(0xFF00A859),
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.2,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'National Payment Switch',
                    style: TextStyle(fontSize: 11, color: AppColors.charcoalMuted, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, size: 20, color: AppColors.charcoalMuted),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (_isSuccess) ...[
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF00A859).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle, color: Color(0xFF00A859), size: 56),
            ),
            const SizedBox(height: 16),
            const Text(
              'Chapa Deposit Confirmed!',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
            ),
            const SizedBox(height: 6),
            Text(
              'ETB ${currencyFormatter.format(widget.amount)} successfully authorized. Booking locked.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.charcoalMuted),
            ),
            const SizedBox(height: 20),
          ] else ...[
            // Amount Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.burgundyDarkest,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'ETB ${currencyFormatter.format(widget.amount)}',
                        style: const TextStyle(
                          color: AppColors.goldAccent,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white12,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          '50% DEPOSIT',
                          style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: Colors.white12, height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Reference:',
                        style: TextStyle(color: Colors.white60, fontSize: 11),
                      ),
                      GestureDetector(
                        onTap: () {
                          Clipboard.setData(ClipboardData(text: widget.txRef));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Transaction reference copied to clipboard'),
                              duration: Duration(seconds: 1),
                            ),
                          );
                        },
                        child: Row(
                          children: [
                            Text(
                              widget.txRef,
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace'),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.copy, size: 12, color: AppColors.goldAccent),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Instructional banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.creamSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.creamBorder),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, size: 16, color: AppColors.goldDark),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Pay securely using Telebirr, CBE Birr, Amole, or Ethiopian debit cards via Chapa.',
                      style: TextStyle(fontSize: 11, color: AppColors.charcoalMuted),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, size: 14, color: Colors.red),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(fontSize: 11, color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Action 1: Open Hosted Chapa Portal
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _launchCheckout,
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: Color(0xFF00A859), width: 1.4),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                icon: const Icon(Icons.open_in_new, size: 16, color: Color(0xFF00A859)),
                label: const Text(
                  'Open Chapa Checkout Portal',
                  style: TextStyle(
                    color: Color(0xFF00A859),
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),

            // Action 2: Verify Payment Status
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isVerifying ? null : _handleVerify,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.burgundyPrimary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                icon: _isVerifying
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.verified_user, size: 16, color: AppColors.goldAccent),
                label: Text(
                  _isVerifying ? 'Verifying with Chapa Gateway...' : 'I have Completed Payment — Verify Now',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
