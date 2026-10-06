import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/botanical_logo.dart';
import '../../../core/providers/app_providers.dart';

class MobileAuthScreen extends ConsumerStatefulWidget {
  const MobileAuthScreen({super.key});

  @override
  ConsumerState<MobileAuthScreen> createState() => _MobileAuthScreenState();
}

class _MobileAuthScreenState extends ConsumerState<MobileAuthScreen> {
  bool _isSignUp = false;
  bool _isLoading = false;
  bool _obscurePassword = true;

  // Controllers
  final _nameController = TextEditingController(text: 'Sara Tekle');
  final _emailController = TextEditingController(text: 'sara.t@example.com');
  final _phoneController = TextEditingController(text: '+251 922 334 455');
  final _passwordController = TextEditingController(text: 'admin123');
  String _selectedOccasion = 'Wedding';

  final List<String> _occasions = [
    'Wedding',
    'Melse (መልስ)',
    'Milestone Birthday',
    'Graduation Dinner',
    'Corporate Gala',
    'Engagement',
  ];

  void _selectQuickAccount({
    required String name,
    required String email,
    required String phone,
    required String occasion,
  }) {
    setState(() {
      _nameController.text = name;
      _emailController.text = email;
      _phoneController.text = phone;
      _passwordController.text = 'admin123';
      _selectedOccasion = occasion;
    });
  }

  void _handleAuth() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your email address')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      if (_isSignUp) {
        final name = _nameController.text.trim();
        final phone = _phoneController.text.trim();
        await ref.read(currentUserProvider.notifier).register(
              email: email,
              password: password.isNotEmpty ? password : 'admin123',
              fullName: name.isNotEmpty ? name : email.split('@').first,
              phone: phone.isNotEmpty ? phone : null,
            );
      } else {
        await ref.read(currentUserProvider.notifier).login(
              email,
              password.isNotEmpty ? password : 'admin123',
            );
      }

      // Fetch user's actual bookings and requests from live database
      await ref.read(eventsProvider.notifier).loadEvents(email);

      if (mounted) {
        setState(() => _isLoading = false);
        context.go('/home');
      }
    } catch (e) {
      debugPrint('Auth error: $e');
      if (mounted) {
        setState(() => _isLoading = false);
        context.go('/home');
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.creamSurface,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Top Luxury Header Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.only(top: 56, bottom: 28, left: 24, right: 24),
              decoration: const BoxDecoration(
                color: AppColors.burgundyPrimary,
                borderRadius: BorderRadius.vertical(
                  bottom: Radius.circular(32),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.burgundyDeep,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.goldAccent.withValues(alpha: 0.5), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.goldAccent.withValues(alpha: 0.2),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: const MekdiBotanicalEmblem(size: 48, isLight: true),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'MEKDI DECOR',
                    style: TextStyle(
                      fontFamily: 'Playfair Display',
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: AppColors.creamLight,
                      letterSpacing: 3,
                    ),
                  ),
                  const SizedBox(height: 3),
                  const Text(
                    'Making Moments Unforgettable',
                    style: TextStyle(
                      fontFamily: 'Playfair Display',
                      fontStyle: FontStyle.italic,
                      fontSize: 12.5,
                      color: AppColors.goldLight,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  const SizedBox(height: 3),
                  const Text(
                    'Private Client Atelier & Event Portal',
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.creamLight,
                      fontWeight: FontWeight.w300,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),

            // Form Container
            Padding(
              padding: const EdgeInsets.all(22.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Tab Switcher: Sign In vs Sign Up
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
                            onTap: () => setState(() => _isSignUp = false),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: !_isSignUp ? AppColors.burgundyPrimary : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  'Sign In to Portal',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: !_isSignUp ? AppColors.creamLight : AppColors.charcoalText,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _isSignUp = true),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _isSignUp ? AppColors.burgundyPrimary : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  'Create VIP Account',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: _isSignUp ? AppColors.creamLight : AppColors.charcoalText,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Quick Switch / Demo Accounts for testing different logins
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.switch_account_outlined, size: 14, color: AppColors.goldDark),
                          SizedBox(width: 5),
                          Text(
                            'Quick Client Switch:',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppColors.goldDark,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _buildAccountChip(
                            label: 'Sara Tekle',
                            subtitle: 'Bride (Hawassa)',
                            isSelected: _emailController.text == 'sara.t@example.com',
                            onTap: () => _selectQuickAccount(
                              name: 'Sara Tekle',
                              email: 'sara.t@example.com',
                              phone: '+251 922 334 455',
                              occasion: 'Wedding',
                            ),
                          ),
                          _buildAccountChip(
                            label: 'Michael Kebede',
                            subtitle: 'Groom (Addis)',
                            isSelected: _emailController.text == 'michael.k@example.com',
                            onTap: () => _selectQuickAccount(
                              name: 'Michael Kebede',
                              email: 'michael.k@example.com',
                              phone: '+251 933 445 566',
                              occasion: 'Engagement',
                            ),
                          ),
                          _buildAccountChip(
                            label: 'Helen Girma',
                            subtitle: 'Gala Host (Bishoftu)',
                            isSelected: _emailController.text == 'helen.g@example.com',
                            onTap: () => _selectQuickAccount(
                              name: 'Helen Girma',
                              email: 'helen.g@example.com',
                              phone: '+251 944 556 677',
                              occasion: 'Corporate Gala',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 18),

                  // Sign Up Fields
                  if (_isSignUp) ...[
                    _buildTextField(
                      controller: _nameController,
                      label: 'Full Name',
                      icon: Icons.person_outline,
                      placeholder: 'e.g. Sara Tekle',
                    ),
                    const SizedBox(height: 14),
                    _buildTextField(
                      controller: _phoneController,
                      label: 'Ethiopian Phone Number',
                      icon: Icons.phone_outlined,
                      placeholder: '+251 911 000 000',
                    ),
                    const SizedBox(height: 14),
                    _buildOccasionDropdown(),
                    const SizedBox(height: 14),
                  ],

                  // Email
                  _buildTextField(
                    controller: _emailController,
                    label: 'Email Address',
                    icon: Icons.mail_outline,
                    placeholder: 'client@example.com',
                  ),
                  const SizedBox(height: 14),

                  // Password
                  _buildTextField(
                    controller: _passwordController,
                    label: 'Password',
                    icon: Icons.lock_outline,
                    placeholder: '••••••••',
                    isPassword: true,
                    obscureText: _obscurePassword,
                    onTogglePassword: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),

                  const SizedBox(height: 22),

                  // Submit Action Button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleAuth,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.burgundyPrimary,
                      foregroundColor: AppColors.creamLight,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                      elevation: 2,
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.creamLight,
                            ),
                          )
                        : Text(
                            _isSignUp ? 'REGISTER & ENTER ATELIER' : 'SIGN IN TO PORTAL',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                            ),
                          ),
                  ),

                  const SizedBox(height: 14),

                  // Guest Mode Access
                  OutlinedButton(
                    onPressed: () {
                      ref.read(currentUserProvider.notifier).logout();
                      ref.read(eventsProvider.notifier).loadEvents('');
                      context.go('/home');
                    },
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.creamBorder),
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                      backgroundColor: Colors.white,
                    ),
                    child: const Text(
                      'Explore Portfolio as Guest →',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.charcoalText,
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Security Badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.shield_outlined,
                        size: 14,
                        color: AppColors.botanicalGreen,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Direct Chapa & Telebirr Verified Encryption',
                        style: TextStyle(
                          fontSize: 10,
                          color: AppColors.charcoalMuted.withValues(alpha: 0.8),
                          fontWeight: FontWeight.w500,
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

  Widget _buildAccountChip({
    required String label,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.goldAccent.withValues(alpha: 0.22) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.goldDark : AppColors.creamBorder,
            width: isSelected ? 1.5 : 1.0,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.goldAccent.withValues(alpha: 0.2),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isSelected ? AppColors.burgundyPrimary : AppColors.charcoalText,
              ),
            ),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 9.5,
                color: isSelected ? AppColors.goldDark : AppColors.charcoalMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required String placeholder,
    bool isPassword = false,
    bool obscureText = false,
    VoidCallback? onTogglePassword,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: AppColors.charcoalText,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.creamBorder),
          ),
          child: TextField(
            controller: controller,
            obscureText: obscureText,
            style: const TextStyle(fontSize: 13, color: AppColors.charcoalText),
            decoration: InputDecoration(
              hintText: placeholder,
              hintStyle: const TextStyle(color: AppColors.charcoalMuted, fontSize: 13),
              prefixIcon: Icon(icon, color: AppColors.goldDark, size: 18),
              suffixIcon: isPassword
                  ? IconButton(
                      icon: Icon(
                        obscureText ? Icons.visibility_off : Icons.visibility,
                        color: AppColors.charcoalMuted,
                        size: 18,
                      ),
                      onPressed: onTogglePassword,
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOccasionDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Celebration Occasion',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: AppColors.charcoalText,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.creamBorder),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedOccasion,
              isExpanded: true,
              icon: const Icon(Icons.arrow_drop_down, color: AppColors.goldDark),
              items: _occasions.map((String occasion) {
                return DropdownMenuItem<String>(
                  value: occasion,
                  child: Text(
                    occasion,
                    style: const TextStyle(fontSize: 13, color: AppColors.charcoalText),
                  ),
                );
              }).toList(),
              onChanged: (String? newValue) {
                if (newValue != null) {
                  setState(() => _selectedOccasion = newValue);
                }
              },
            ),
          ),
        ),
      ],
    );
  }
}
