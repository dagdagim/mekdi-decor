import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/event_model.dart';
import '../../../core/providers/app_providers.dart';
import 'chapa_payment_sheet.dart';

class ColorThemeItem {
  final String name;
  final List<Color> colors;
  const ColorThemeItem({required this.name, required this.colors});
}

class DecorServiceOption {
  final String id;
  final String label;
  final String desc;
  final double basePrice;
  const DecorServiceOption({
    required this.id,
    required this.label,
    required this.desc,
    required this.basePrice,
  });
}

class MobilePlanEventScreen extends ConsumerStatefulWidget {
  const MobilePlanEventScreen({super.key});

  @override
  ConsumerState<MobilePlanEventScreen> createState() => _MobilePlanEventScreenState();
}

class _MobilePlanEventScreenState extends ConsumerState<MobilePlanEventScreen> {
  int _currentStep = 1; // 1 to 6
  bool _isSubmitting = false;
  bool _isProcessingDeposit = false;
  String _referenceNumber = '';
  bool _submitted = false;

  // Step 1: Event Basics
  String _eventType = 'Wedding';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 75));
  String _guestCount = '200';
  String _venueType = 'Hotel';
  final _venueNameController = TextEditingController(text: 'Skyline Event Hall, Hawassa');

  final List<String> _eventTypes = [
    'Wedding',
    'Birthday',
    'Graduation',
    'Engagement',
    'Corporate',
    'Other',
  ];

  final List<String> _guestCounts = ['50', '100', '200', '350', '500+'];

  final List<String> _venueTypes = [
    'Hotel',
    'Hall',
    'Indoor',
    'Outdoor',
    'Home',
    'Other',
  ];

  // Step 2: Style & Atmosphere
  String _stylePreference = 'Luxury';
  final List<String> _styleOptions = [
    'Luxury',
    'Romantic',
    'Modern',
    'Minimal',
    'Traditional',
    'Floral',
    'Custom',
  ];

  final List<ColorThemeItem> _colorThemes = const [
    ColorThemeItem(
      name: 'Royal Burgundy & Champagne Gold',
      colors: [Color(0xFF5B1424), Color(0xFFD4AF37), Color(0xFFFAF6F0)],
    ),
    ColorThemeItem(
      name: 'Emerald Forest & Polished Brass',
      colors: [Color(0xFF1F3A2B), Color(0xFFD4AF37), Color(0xFFFFFFFF)],
    ),
    ColorThemeItem(
      name: 'Blush Rose & Warm Ivory',
      colors: [Color(0xFFF5D0C5), Color(0xFFFAF6F0), Color(0xFFD4AF37)],
    ),
    ColorThemeItem(
      name: 'Imperial Crimson & Black Tie',
      colors: [Color(0xFF8E1730), Color(0xFF1C1917), Color(0xFFE5C365)],
    ),
    ColorThemeItem(
      name: 'Lakeside Botanical & Cream',
      colors: [Color(0xFF3D5A45), Color(0xFFFDFBF7), Color(0xFFC49A6C)],
    ),
  ];
  late String _selectedThemeName;

  // Step 3: Elements & Services Checklist
  final List<DecorServiceOption> _availableServices = const [
    DecorServiceOption(id: 'stage', label: 'Stage Decoration', desc: 'Podium, backdrop & floral arches', basePrice: 45000),
    DecorServiceOption(id: 'entrance', label: 'Grand Entrance', desc: 'Tunnel arches & mirrored welcome', basePrice: 30000),
    DecorServiceOption(id: 'tables', label: 'Tables & Styling', desc: 'Linens, chargers & cutlery', basePrice: 25000),
    DecorServiceOption(id: 'chairs', label: 'Chairs & Ribbons', desc: 'Chiavari, Dior & velvet covers', basePrice: 20000),
    DecorServiceOption(id: 'centerpieces', label: 'Floral Centerpieces', desc: 'Tall urns & low lush arrangements', basePrice: 35000),
    DecorServiceOption(id: 'backdrop', label: 'Photo Backdrops', desc: '3D floral & custom neon monograms', basePrice: 20000),
    DecorServiceOption(id: 'flowers', label: 'Fresh Flower Installations', desc: 'Imported roses & local blooms', basePrice: 40000),
    DecorServiceOption(id: 'lighting', label: 'Ambient & Mood Lighting', desc: 'Uplights, chandeliers & spotlights', basePrice: 25000),
    DecorServiceOption(id: 'photo-area', label: 'Selfie / Media Wall', desc: 'Studio ring lights & props', basePrice: 15000),
    DecorServiceOption(id: 'ceiling', label: 'Ceiling Draping', desc: 'Silk clouds & fairy light canopies', basePrice: 35000),
  ];

  final Set<String> _selectedServices = {'stage', 'entrance', 'tables', 'flowers', 'lighting'};

  // Step 4: Budget Range
  String _budgetRange = 'ETB 200,000 – 350,000';
  final List<String> _budgetRanges = [
    'Under ETB 100,000',
    'ETB 100,000 – 200,000',
    'ETB 200,000 – 350,000',
    'ETB 350,000+',
    'I prefer discussing budget during consultation',
  ];

  // Step 5: Contact Info
  final _nameController = TextEditingController(text: 'Sara Tekle');
  final _phoneController = TextEditingController(text: '+251 922 334 455');
  final _emailController = TextEditingController(text: 'sara.t@example.com');
  final _notesController = TextEditingController(text: 'We want dramatic chandeliers, deep burgundy velvet draping, and champagne rose floral runners.');

  @override
  void initState() {
    super.initState();
    _selectedThemeName = _colorThemes.first.name;
  }

  @override
  void dispose() {
    _venueNameController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  double _calculateEstimatedCost() {
    double total = 0;
    for (final srv in _availableServices) {
      if (_selectedServices.contains(srv.id)) {
        total += srv.basePrice;
      }
    }
    // Scale slightly by guest count
    final count = int.tryParse(_guestCount.replaceAll('+', '')) ?? 200;
    if (count > 300) total *= 1.25;
    return total;
  }

  Future<void> _submitRequest() async {
    setState(() => _isSubmitting = true);

    final api = ref.read(apiClientProvider);
    final payload = {
      'guestName': _nameController.text.trim(),
      'guestEmail': _emailController.text.trim(),
      'guestPhone': _phoneController.text.trim(),
      'eventType': _eventType,
      'eventDate': DateFormat('yyyy-MM-dd').format(_selectedDate),
      'venueType': _venueType,
      'venueName': _venueNameController.text.trim(),
      'guestCount': int.tryParse(_guestCount.replaceAll('+', '')) ?? 200,
      'stylePreference': '$_stylePreference ($_selectedThemeName)',
      'selectedServices': _selectedServices.toList(),
      'budgetRange': _budgetRange,
      'specialNotes': _notesController.text.trim(),
    };

    final result = await api.submitEventRequest(payload);
    setState(() => _isSubmitting = false);

    final refNum = result['referenceNumber'] ?? 'REQ-2026-9821';
    setState(() {
      _referenceNumber = refNum;
      _submitted = true;
    });

    // Add to local state so user sees it in My Events right away
    ref.read(eventsProvider.notifier).addEvent(
          EventModel(
            id: 'ev-${DateTime.now().millisecondsSinceEpoch}',
            code: refNum,
            title: '${_nameController.text}\'s $_eventType',
            eventType: _eventType,
            eventDate: DateFormat('MMMM dd, yyyy').format(_selectedDate),
            venueName: _venueNameController.text.trim(),
            city: 'Hawassa / Addis Ababa',
            guestCount: int.tryParse(_guestCount.replaceAll('+', '')) ?? 200,
            decorationStyle: '$_stylePreference ($_selectedThemeName)',
            progressPercentage: 20,
            status: 'CONSULTATION',
            totalAmount: _calculateEstimatedCost(),
            depositPaid: false,
            isBooking: false,
          ),
        );
  }

  Future<void> _handlePayDeposit() async {
    setState(() => _isProcessingDeposit = true);
    final api = ref.read(apiClientProvider);
    final chapaRes = await api.initiateChapaPayment(
      quoteId: _referenceNumber,
      amount: 50000.0,
      customerName: _nameController.text.trim().isEmpty ? 'Sara Tekle' : _nameController.text.trim(),
      email: _emailController.text.trim().isEmpty ? 'sara.t@example.com' : _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      description: 'Priority Date Lock for $_eventType on ${DateFormat('MMM dd, yyyy').format(_selectedDate)}',
    );
    setState(() => _isProcessingDeposit = false);

    if (chapaRes['success'] == true && mounted) {
      final checkoutUrl = chapaRes['checkoutUrl']?.toString() ?? '';
      final txRef = chapaRes['txRef']?.toString() ?? chapaRes['paymentReference']?.toString() ?? '';
      ChapaPaymentSheet.show(
        context: context,
        title: 'Priority Date Lock • $_eventType',
        amount: 50000.0,
        quoteId: _referenceNumber,
        checkoutUrl: checkoutUrl,
        txRef: txRef,
        onVerify: () async {
          final res = await api.verifyChapaPayment(
            txRef: txRef,
            quoteId: _referenceNumber,
            customerEmail: _emailController.text.trim(),
          );
          return res['verified'] == true || res['success'] == true;
        },
        onSuccess: () {
          ref.read(eventsProvider.notifier).loadEvents();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: AppColors.botanicalGreen,
              content: Text('Chapa payment verified! Date officially locked in schedule.'),
            ),
          );
          context.go('/events');
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat('#,###');

    return Scaffold(
      backgroundColor: AppColors.creamSurface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.charcoalText),
          onPressed: () {
            if (_submitted) {
              context.go('/events');
            } else if (_currentStep > 1) {
              setState(() => _currentStep--);
            } else {
              context.pop();
            }
          },
        ),
        title: Text(
          _submitted ? 'Request Received' : 'Design Your Event (Step $_currentStep of 6)',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.charcoalText),
        ),
      ),
      body: _submitted
          ? _buildSuccessView(currencyFormat)
          : Column(
              children: [
                // Step Progress Bar (Matching Web)
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildStepHeaderLabel(1, '1. Basics'),
                          _buildStepHeaderLabel(2, '2. Style'),
                          _buildStepHeaderLabel(3, '3. Services'),
                          _buildStepHeaderLabel(4, '4. Budget'),
                          _buildStepHeaderLabel(5, '5. Contact'),
                          _buildStepHeaderLabel(6, '6. Review'),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: _currentStep / 6.0,
                          backgroundColor: AppColors.creamBorder,
                          valueColor: const AlwaysStoppedAnimation<Color>(AppColors.goldAccent),
                          minHeight: 5,
                        ),
                      ),
                    ],
                  ),
                ),

                // Step Body
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: _buildStepContent(currencyFormat),
                  ),
                ),

                // Bottom Buttons
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, -3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      if (_currentStep > 1) ...[
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                            side: const BorderSide(color: AppColors.creamBorder),
                          ),
                          onPressed: () => setState(() => _currentStep--),
                          child: const Text('Previous', style: TextStyle(color: AppColors.charcoalText)),
                        ),
                        const SizedBox(width: 12),
                      ],
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _currentStep == 6 ? AppColors.goldAccent : AppColors.burgundyPrimary,
                            foregroundColor: _currentStep == 6 ? AppColors.burgundyDarkest : Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          onPressed: _isSubmitting
                              ? null
                              : () {
                                  if (_currentStep < 6) {
                                    setState(() => _currentStep++);
                                  } else {
                                    _submitRequest();
                                  }
                                },
                          child: _isSubmitting
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : Text(
                                  _currentStep == 6 ? 'Submit Event Request to Atelier' : 'Continue',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildStepHeaderLabel(int stepNum, String title) {
    final isActive = _currentStep >= stepNum;
    return Text(
      title,
      style: TextStyle(
        fontSize: 10,
        fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
        color: isActive ? AppColors.burgundyPrimary : AppColors.charcoalMuted,
      ),
    );
  }

  Widget _buildStepContent(NumberFormat currencyFormat) {
    switch (_currentStep) {
      case 1:
        return _buildStep1EventBasics();
      case 2:
        return _buildStep2StyleAndPalette();
      case 3:
        return _buildStep3ElementsAndServices(currencyFormat);
      case 4:
        return _buildStep4BudgetAndEstimate(currencyFormat);
      case 5:
        return _buildStep5ContactInfo();
      case 6:
        return _buildStep6ReviewAndSubmit(currencyFormat);
      default:
        return const SizedBox.shrink();
    }
  }

  // STEP 1: EVENT BASICS
  Widget _buildStep1EventBasics() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Event Basics',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
        ),
        const SizedBox(height: 4),
        const Text('What type of event are you hosting and where will it be held?', style: TextStyle(fontSize: 12.5, color: AppColors.charcoalMuted)),
        const SizedBox(height: 20),

        // Event Type
        const Text('EVENT TYPE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.charcoalText, letterSpacing: 1)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _eventTypes.map((type) {
            final isSelected = _eventType == type;
            return ChoiceChip(
              label: Text(type),
              selected: isSelected,
              selectedColor: AppColors.burgundyPrimary,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : AppColors.charcoalText,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
              backgroundColor: Colors.white,
              onSelected: (val) {
                if (val) setState(() => _eventType = type);
              },
            );
          }).toList(),
        ),
        const SizedBox(height: 24),

        // Event Date Picker
        const Text('EVENT DATE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.charcoalText, letterSpacing: 1)),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: _selectedDate,
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 730)),
            );
            if (picked != null) setState(() => _selectedDate = picked);
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.creamBorder),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('MMMM dd, yyyy').format(_selectedDate),
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
                ),
                const Icon(Icons.calendar_today, size: 16, color: AppColors.burgundyPrimary),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Guest Count
        const Text('ESTIMATED GUEST COUNT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.charcoalText, letterSpacing: 1)),
        const SizedBox(height: 8),
        Row(
          children: _guestCounts.map((count) {
            final isSelected = _guestCount == count;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _guestCount = count),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.burgundyPrimary : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isSelected ? AppColors.goldAccent : AppColors.creamBorder),
                  ),
                  child: Center(
                    child: Text(
                      count,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.white : AppColors.charcoalText,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 24),

        // Venue Setting
        const Text('VENUE SETTING', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.charcoalText, letterSpacing: 1)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _venueTypes.map((v) {
            final isSelected = _venueType == v;
            return ChoiceChip(
              label: Text(v),
              selected: isSelected,
              selectedColor: AppColors.burgundyPrimary,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : AppColors.charcoalText,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
              backgroundColor: Colors.white,
              onSelected: (val) {
                if (val) setState(() => _venueType = v);
              },
            );
          }).toList(),
        ),
        const SizedBox(height: 16),

        // Venue Name Input
        TextField(
          controller: _venueNameController,
          decoration: InputDecoration(
            labelText: 'Venue Name or City',
            hintText: 'e.g. Skyline Event Hall, Hawassa or Sheraton Addis',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.creamBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.creamBorder)),
          ),
        ),
      ],
    );
  }

  // STEP 2: STYLE & PALETTE (Circular Color Swatches)
  Widget _buildStep2StyleAndPalette() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Style & Atmosphere',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
        ),
        const SizedBox(height: 4),
        const Text('Choose the design personality and color harmonies you envision.', style: TextStyle(fontSize: 12.5, color: AppColors.charcoalMuted)),
        const SizedBox(height: 20),

        const Text('AESTHETIC DIRECTION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.charcoalText, letterSpacing: 1)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _styleOptions.map((style) {
            final isSelected = _stylePreference == style;
            return ChoiceChip(
              label: Text(style),
              selected: isSelected,
              selectedColor: AppColors.burgundyPrimary,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : AppColors.charcoalText,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
              backgroundColor: Colors.white,
              onSelected: (val) {
                if (val) setState(() => _stylePreference = style);
              },
            );
          }).toList(),
        ),
        const SizedBox(height: 24),

        const Text('SIGNATURE COLOR HARMONIES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.charcoalText, letterSpacing: 1)),
        const SizedBox(height: 10),
        ..._colorThemes.map((theme) {
          final isSelected = _selectedThemeName == theme.name;
          return GestureDetector(
            onTap: () => setState(() => _selectedThemeName = theme.name),
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.burgundyPrimary.withValues(alpha: 0.04) : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: isSelected ? AppColors.burgundyPrimary : AppColors.creamBorder,
                  width: isSelected ? 1.8 : 1,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      theme.name,
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? AppColors.burgundyPrimary : AppColors.charcoalText,
                      ),
                    ),
                  ),
                  Row(
                    children: theme.colors.map((c) {
                      return Container(
                        margin: const EdgeInsets.only(left: 6),
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          color: c,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.black12, width: 1.2),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4, offset: const Offset(0, 1)),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // STEP 3: ELEMENTS & SERVICES (Checklist)
  Widget _buildStep3ElementsAndServices(NumberFormat currencyFormat) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'What elements do you need?',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
        ),
        const SizedBox(height: 4),
        const Text('Select all areas of the venue you would like Mekdi Decor to curate.', style: TextStyle(fontSize: 12.5, color: AppColors.charcoalMuted)),
        const SizedBox(height: 18),

        ..._availableServices.map((srv) {
          final isChecked = _selectedServices.contains(srv.id);
          return GestureDetector(
            onTap: () {
              setState(() {
                if (isChecked) {
                  _selectedServices.remove(srv.id);
                } else {
                  _selectedServices.add(srv.id);
                }
              });
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isChecked ? AppColors.burgundyDarkest : Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: isChecked ? AppColors.goldAccent : AppColors.creamBorder,
                  width: isChecked ? 1.5 : 1,
                ),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 3)),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: isChecked ? AppColors.goldAccent : Colors.transparent,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: isChecked ? AppColors.goldAccent : AppColors.charcoalMuted),
                    ),
                    child: isChecked
                        ? const Center(child: Icon(Icons.check, size: 16, color: AppColors.burgundyDarkest))
                        : null,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          srv.label,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: isChecked ? Colors.white : AppColors.charcoalText,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          srv.desc,
                          style: TextStyle(
                            fontSize: 11,
                            color: isChecked ? Colors.white70 : AppColors.charcoalMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '+ETB ${currencyFormat.format(srv.basePrice)}',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isChecked ? AppColors.goldAccent : AppColors.burgundyPrimary,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // STEP 4: BUDGET & LIVE ESTIMATE
  Widget _buildStep4BudgetAndEstimate(NumberFormat currencyFormat) {
    final liveEst = _calculateEstimatedCost();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Investment Range',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
        ),
        const SizedBox(height: 4),
        const Text('Sharing an approximate budget helps us recommend the highest-impact elements.', style: TextStyle(fontSize: 12.5, color: AppColors.charcoalMuted)),
        const SizedBox(height: 20),

        // Live Dynamic Estimation Card
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.burgundyDarkest,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.goldAccent.withValues(alpha: 0.6)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.auto_awesome, size: 14, color: AppColors.goldAccent),
                  SizedBox(width: 6),
                  Text(
                    'LIVE ATELIER ESTIMATE',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.goldAccent, letterSpacing: 1.2),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'ETB ${currencyFormat.format(liveEst)}',
                style: const TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Based on ${_selectedServices.length} chosen elements for $_guestCount guests.',
                style: const TextStyle(fontSize: 11, color: Colors.white70),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        const Text('TARGET BUDGET TIER', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.charcoalText, letterSpacing: 1)),
        const SizedBox(height: 10),
        ..._budgetRanges.map((range) {
          final isSelected = _budgetRange == range;
          return GestureDetector(
            onTap: () => setState(() => _budgetRange = range),
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.burgundyPrimary : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isSelected ? AppColors.goldAccent : AppColors.creamBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      range,
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        color: isSelected ? Colors.white : AppColors.charcoalText,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: isSelected ? AppColors.goldAccent : AppColors.charcoalMuted, width: 2),
                      color: isSelected ? AppColors.goldAccent : Colors.transparent,
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // STEP 5: CONTACT INFORMATION
  Widget _buildStep5ContactInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Contact Details',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
        ),
        const SizedBox(height: 4),
        const Text('Where should we send your itemized proposal and 3D preview?', style: TextStyle(fontSize: 12.5, color: AppColors.charcoalMuted)),
        const SizedBox(height: 20),

        TextField(
          controller: _nameController,
          decoration: InputDecoration(
            labelText: 'Full Name *',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.creamBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.creamBorder)),
          ),
        ),
        const SizedBox(height: 14),

        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: InputDecoration(
            labelText: 'Phone Number (or Telegram) *',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.creamBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.creamBorder)),
          ),
        ),
        const SizedBox(height: 14),

        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(
            labelText: 'Email Address *',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.creamBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.creamBorder)),
          ),
        ),
        const SizedBox(height: 14),

        TextField(
          controller: _notesController,
          maxLines: 4,
          decoration: InputDecoration(
            labelText: 'Special Requests or Inspiration Notes',
            hintText: 'Tell us about specific flower varieties, wedding colors, or surprise reveals...',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.creamBorder)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.creamBorder)),
          ),
        ),
      ],
    );
  }

  // STEP 6: REVIEW & SUBMIT
  Widget _buildStep6ReviewAndSubmit(NumberFormat currencyFormat) {
    final liveEst = _calculateEstimatedCost();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Review Your Event Request',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
        ),
        const SizedBox(height: 4),
        const Text('Confirm your details before our atelier begins drafting your quotation.', style: TextStyle(fontSize: 12.5, color: AppColors.charcoalMuted)),
        const SizedBox(height: 20),

        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.creamBorder),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 4)),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildReviewRow('Occasion', _eventType),
              const Divider(height: 20, color: AppColors.creamBorder),
              _buildReviewRow('Date', DateFormat('MMMM dd, yyyy').format(_selectedDate)),
              const Divider(height: 20, color: AppColors.creamBorder),
              _buildReviewRow('Venue & Guests', '${_venueNameController.text} • $_guestCount Guests'),
              const Divider(height: 20, color: AppColors.creamBorder),
              _buildReviewRow('Style & Palette', '$_stylePreference ($_selectedThemeName)'),
              const Divider(height: 20, color: AppColors.creamBorder),
              _buildReviewRow('Requested Services', '${_selectedServices.length} elements selected'),
              const Divider(height: 20, color: AppColors.creamBorder),
              _buildReviewRow('Estimated Cost', 'ETB ${currencyFormat.format(liveEst)}'),
              const Divider(height: 20, color: AppColors.creamBorder),
              _buildReviewRow('Client Contact', '${_nameController.text} (${_phoneController.text})'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildReviewRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.charcoalMuted)),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
          ),
        ),
      ],
    );
  }

  // SUBMITTED CONFIRMATION VIEW
  Widget _buildSuccessView(NumberFormat currencyFormat) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppColors.botanicalGreen.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle, color: AppColors.botanicalGreen, size: 48),
          ),
          const SizedBox(height: 18),
          const Text(
            'We\'re Excited to Create Magic!',
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'Playfair Display', fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.charcoalText),
          ),
          const SizedBox(height: 8),
          const Text(
            'Your luxury event inquiry has been saved directly to the database.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: AppColors.charcoalMuted),
          ),
          const SizedBox(height: 20),

          // Reference Code Pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.goldAccent),
            ),
            child: Column(
              children: [
                const Text('OFFICIAL REFERENCE NUMBER', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.charcoalMuted, letterSpacing: 1.2)),
                const SizedBox(height: 4),
                Text(
                  _referenceNumber,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.burgundyPrimary, letterSpacing: 2),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Priority Date Lock Card (Chapa 50,000 ETB Deposit)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.goldAccent, width: 1.5),
              boxShadow: [
                BoxShadow(color: AppColors.goldAccent.withValues(alpha: 0.15), blurRadius: 14, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              children: [
                const Text(
                  'PRIORITY DATE LOCK • CHAPA',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.goldDark, letterSpacing: 1.2),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Lock In Your Event Date Now',
                  style: TextStyle(fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Text(
                  'Pay the initial 50,000 ETB reservation deposit to officially lock ${DateFormat('MMM dd, yyyy').format(_selectedDate)} in our production schedule.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 11.5, color: AppColors.charcoalMuted, height: 1.35),
                ),
                const SizedBox(height: 16),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.goldAccent,
                      foregroundColor: AppColors.burgundyDarkest,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: _isProcessingDeposit ? null : _handlePayDeposit,
                    child: _isProcessingDeposit
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.burgundyDarkest),
                          )
                        : const Text('Pay 50,000 ETB Deposit via Chapa →', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Track in My Events
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.burgundyPrimary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () => context.go('/events'),
              child: const Text('Track Request in My Celebrations', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
