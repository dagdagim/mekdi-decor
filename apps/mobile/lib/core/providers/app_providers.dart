import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/gallery_model.dart';
import '../models/quote_model.dart';
import '../models/message_model.dart';
import '../models/customer_model.dart';
import '../models/event_model.dart';
import '../models/service_package_model.dart';
import '../network/api_client.dart';

// --- API Client Provider ---
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient.instance);

// --- Gallery State & Notifier ---
class GalleryFilterState {
  final String selectedCategory;
  final List<GalleryItemModel> items;
  final bool isLoading;

  GalleryFilterState({
    required this.selectedCategory,
    required this.items,
    required this.isLoading,
  });

  GalleryFilterState copyWith({
    String? selectedCategory,
    List<GalleryItemModel>? items,
    bool? isLoading,
  }) {
    return GalleryFilterState(
      selectedCategory: selectedCategory ?? this.selectedCategory,
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class GalleryNotifier extends StateNotifier<GalleryFilterState> {
  final ApiClient _api;

  GalleryNotifier(this._api)
      : super(GalleryFilterState(selectedCategory: 'All', items: [], isLoading: true)) {
    loadGallery();
  }

  Future<void> loadGallery() async {
    state = state.copyWith(isLoading: true);
    final items = await _api.fetchGallery(
      type: state.selectedCategory == 'All' ? null : state.selectedCategory,
    );
    state = state.copyWith(items: items, isLoading: false);
  }

  void setCategory(String category) {
    state = state.copyWith(selectedCategory: category);
    loadGallery();
  }

  Future<void> toggleSave(String itemId) async {
    final updated = state.items.map((item) {
      if (item.id == itemId) {
        return item.copyWith(isSaved: !item.isSaved);
      }
      return item;
    }).toList();
    state = state.copyWith(items: updated);

    await _api.toggleInspiration(customerId: 'cust-01', galleryItemId: itemId);
  }
}

final galleryProvider =
    StateNotifierProvider<GalleryNotifier, GalleryFilterState>((ref) {
  return GalleryNotifier(ref.watch(apiClientProvider));
});

// --- Active Quote & Payment Provider ---
class QuoteState {
  final QuoteModel? quote;
  final bool isLoading;
  final bool isPaying;
  final bool isVerifyingChapa;
  final bool paymentSuccess;
  final String? selectedPaymentMethod;
  final String? chapaCheckoutUrl;
  final String? chapaTxRef;
  final bool chapaVerified;

  QuoteState({
    this.quote,
    this.isLoading = true,
    this.isPaying = false,
    this.isVerifyingChapa = false,
    this.paymentSuccess = false,
    this.selectedPaymentMethod = 'Telebirr',
    this.chapaCheckoutUrl,
    this.chapaTxRef,
    this.chapaVerified = false,
  });

  QuoteState copyWith({
    QuoteModel? quote,
    bool? isLoading,
    bool? isPaying,
    bool? isVerifyingChapa,
    bool? paymentSuccess,
    String? selectedPaymentMethod,
    String? chapaCheckoutUrl,
    String? chapaTxRef,
    bool? chapaVerified,
  }) {
    return QuoteState(
      quote: quote ?? this.quote,
      isLoading: isLoading ?? this.isLoading,
      isPaying: isPaying ?? this.isPaying,
      isVerifyingChapa: isVerifyingChapa ?? this.isVerifyingChapa,
      paymentSuccess: paymentSuccess ?? this.paymentSuccess,
      selectedPaymentMethod: selectedPaymentMethod ?? this.selectedPaymentMethod,
      chapaCheckoutUrl: chapaCheckoutUrl ?? this.chapaCheckoutUrl,
      chapaTxRef: chapaTxRef ?? this.chapaTxRef,
      chapaVerified: chapaVerified ?? this.chapaVerified,
    );
  }
}

class QuoteNotifier extends StateNotifier<QuoteState> {
  final ApiClient _api;
  final Ref _ref;

  QuoteNotifier(this._api, this._ref) : super(QuoteState()) {
    loadQuote('q-108');
  }

  Future<void> loadQuote(String quoteId) async {
    state = state.copyWith(isLoading: true);
    final q = await _api.fetchQuote(quoteId);
    state = state.copyWith(quote: q, isLoading: false);
  }

  void setPaymentMethod(String method) {
    state = state.copyWith(selectedPaymentMethod: method);
  }

  Future<Map<String, dynamic>> initiateChapaPayment({
    required String customerName,
    required String email,
    String? phone,
  }) async {
    if (state.quote == null) return {'success': false};
    state = state.copyWith(isPaying: true);

    final res = await _api.initiateChapaPayment(
      quoteId: state.quote!.id,
      amount: state.quote!.depositAmount,
      customerName: customerName,
      email: email,
      phone: phone,
      description: '50% Deposit for ${state.quote!.eventTitle}',
    );

    final checkoutUrl = res['checkoutUrl']?.toString();
    final txRef = res['txRef']?.toString() ?? res['paymentReference']?.toString();

    state = state.copyWith(
      isPaying: false,
      chapaCheckoutUrl: checkoutUrl,
      chapaTxRef: txRef,
    );

    return res;
  }

  Future<bool> verifyChapaPayment({String? customerEmail}) async {
    if (state.quote == null) return false;
    final txRef = state.chapaTxRef ?? 'CHAPA-TX-${DateTime.now().millisecondsSinceEpoch}';

    state = state.copyWith(isVerifyingChapa: true);

    final verifyRes = await _api.verifyChapaPayment(
      txRef: txRef,
      quoteId: state.quote!.id,
      customerEmail: customerEmail,
    );

    final isSuccess = verifyRes['verified'] == true || verifyRes['success'] == true;

    if (isSuccess) {
      final updatedQuote = QuoteModel(
        id: state.quote!.id,
        quoteNumber: state.quote!.quoteNumber,
        eventTitle: state.quote!.eventTitle,
        eventDate: state.quote!.eventDate,
        venueName: state.quote!.venueName,
        guestCount: state.quote!.guestCount,
        subtotal: state.quote!.subtotal,
        totalAmount: state.quote!.totalAmount,
        depositAmount: state.quote!.depositAmount,
        currency: state.quote!.currency,
        status: 'APPROVED',
        items: state.quote!.items,
      );
      state = state.copyWith(
        quote: updatedQuote,
        isVerifyingChapa: false,
        paymentSuccess: true,
        chapaVerified: true,
      );

      _ref.read(eventsProvider.notifier).loadEvents();
      return true;
    } else {
      state = state.copyWith(isVerifyingChapa: false);
      return false;
    }
  }

  Future<bool> processDeposit() async {
    if (state.quote == null) return false;
    state = state.copyWith(isPaying: true);

    final success = await _api.processDeposit(
      quoteId: state.quote!.id,
      provider: state.selectedPaymentMethod ?? 'Telebirr',
      amount: state.quote!.depositAmount,
    );

    if (success) {
      final updatedQuote = QuoteModel(
        id: state.quote!.id,
        quoteNumber: state.quote!.quoteNumber,
        eventTitle: state.quote!.eventTitle,
        eventDate: state.quote!.eventDate,
        venueName: state.quote!.venueName,
        guestCount: state.quote!.guestCount,
        subtotal: state.quote!.subtotal,
        totalAmount: state.quote!.totalAmount,
        depositAmount: state.quote!.depositAmount,
        currency: state.quote!.currency,
        status: 'APPROVED',
        items: state.quote!.items,
      );
      state = state.copyWith(
        quote: updatedQuote,
        isPaying: false,
        paymentSuccess: true,
      );

      // Refresh events so the confirmed booking appears immediately
      _ref.read(eventsProvider.notifier).loadEvents();

      return true;
    } else {
      state = state.copyWith(isPaying: false);
      return false;
    }
  }
}

final quoteProvider = StateNotifierProvider<QuoteNotifier, QuoteState>((ref) {
  return QuoteNotifier(ref.watch(apiClientProvider), ref);
});

// --- Concierge Messages Provider ---
class MessagesNotifier extends StateNotifier<List<MessageModel>> {
  final ApiClient _api;

  MessagesNotifier(this._api) : super([]) {
    loadMessages();
  }

  Future<void> loadMessages() async {
    final msgs = await _api.fetchMessages('cust-01');
    state = msgs;
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final customerMsg = MessageModel(
      id: 'local-${DateTime.now().millisecondsSinceEpoch}',
      customerId: 'cust-01',
      senderName: 'Sara Tekle',
      senderRole: 'CUSTOMER',
      messageText: text.trim(),
      createdAt: 'Just now',
      isCustomer: true,
    );

    state = [...state, customerMsg];

    // Post to persistent database
    await _api.sendMessage(
      customerId: 'cust-01',
      text: text.trim(),
      senderName: 'Sara Tekle',
      senderRole: 'CUSTOMER',
    );

    // Realistic automated concierge response simulation
    Future.delayed(const Duration(milliseconds: 1400), () async {
      final replyText = 'Thank you Sara! Our lead stylist reviewed: "${text.trim()}". We are preparing mockups for your review.';
      final conciergeMsg = MessageModel(
        id: 'reply-${DateTime.now().millisecondsSinceEpoch}',
        customerId: 'cust-01',
        senderName: 'Mekdi Decor Concierge',
        senderRole: 'CONCIERGE',
        messageText: replyText,
        createdAt: 'Just now',
        isCustomer: false,
      );
      state = [...state, conciergeMsg];
      await _api.sendMessage(
        customerId: 'cust-01',
        text: replyText,
        senderName: 'Mekdi Decor Concierge',
        senderRole: 'CONCIERGE',
      );
    });
  }
}

final messagesProvider =
    StateNotifierProvider<MessagesNotifier, List<MessageModel>>((ref) {
  return MessagesNotifier(ref.watch(apiClientProvider));
});

// --- Customer Profile & Current User Provider ---
class CurrentUserNotifier extends StateNotifier<CustomerModel> {
  final ApiClient _api;

  CurrentUserNotifier(this._api)
      : super(_api.currentCustomer ??
            CustomerModel(
              id: 'a0000000-0000-0000-0000-000000000002',
              fullName: 'Sara Tekle',
              email: 'sara.t@example.com',
              phone: '+251 922 334 455',
              city: 'Hawassa / Addis Ababa',
              vipTier: 'VIP Diamond Member',
              totalEvents: 1,
              totalSpend: 205000.0,
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            ));

  Future<bool> login(String email, String password) async {
    final customer = await _api.login(email: email, password: password);
    if (customer != null) {
      state = customer;
      return true;
    }
    return false;
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    final customer = await _api.register(
      email: email,
      password: password,
      fullName: fullName,
      phone: phone,
    );
    if (customer != null) {
      state = customer;
      return true;
    }
    return false;
  }

  void logout() {
    _api.logout();
    state = CustomerModel(
      id: 'guest',
      fullName: 'Atelier Guest',
      email: '',
      phone: '',
      city: 'Addis Ababa',
      vipTier: 'Private Client',
      totalEvents: 0,
      totalSpend: 0.0,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    );
  }
}

final currentUserProvider =
    StateNotifierProvider<CurrentUserNotifier, CustomerModel>((ref) {
  return CurrentUserNotifier(ref.watch(apiClientProvider));
});

// --- Customer Profile Provider ---
final customerProvider = FutureProvider<CustomerModel>((ref) async {
  final user = ref.watch(currentUserProvider);
  return user;
});

// --- Events List Provider ---
class EventsNotifier extends StateNotifier<List<EventModel>> {
  final ApiClient _api;

  EventsNotifier(this._api) : super([]) {
    loadEvents();
  }

  Future<void> loadEvents([String? email]) async {
    final list = await _api.fetchEvents(email: email);
    state = list;
  }

  void addEvent(EventModel event) {
    state = [event, ...state];
  }
}

final eventsProvider =
    StateNotifierProvider<EventsNotifier, List<EventModel>>((ref) {
  return EventsNotifier(ref.watch(apiClientProvider));
});

// --- Bespoke Services Provider ---
final servicesProvider = FutureProvider<List<ServiceItemModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  return api.fetchServices();
});

// --- Tailored Packages Provider ---
final packagesProvider = FutureProvider<List<PackageItemModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  return api.fetchPackages();
});
