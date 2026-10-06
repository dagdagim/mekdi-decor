class QuoteItemModel {
  final String title;
  final String description;
  final double subtotal;

  QuoteItemModel({
    required this.title,
    required this.description,
    required this.subtotal,
  });

  factory QuoteItemModel.fromJson(Map<String, dynamic> json) {
    return QuoteItemModel(
      title: json['itemTitle'] ?? '',
      description: json['itemDescription'] ?? '',
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class QuoteModel {
  final String id;
  final String quoteNumber;
  final String eventTitle;
  final String eventDate;
  final String venueName;
  final int guestCount;
  final double subtotal;
  final double totalAmount;
  final double depositAmount;
  final String currency;
  final String status;
  final List<QuoteItemModel> items;

  QuoteModel({
    required this.id,
    required this.quoteNumber,
    required this.eventTitle,
    required this.eventDate,
    required this.venueName,
    required this.guestCount,
    required this.subtotal,
    required this.totalAmount,
    required this.depositAmount,
    required this.currency,
    required this.status,
    required this.items,
  });

  factory QuoteModel.fromJson(Map<String, dynamic> json) {
    var rawItems = json['items'] as List? ?? [];
    List<QuoteItemModel> parsedItems =
        rawItems.map((i) => QuoteItemModel.fromJson(i)).toList();

    double total = (json['totalAmount'] as num?)?.toDouble() ?? 0.0;
    double depositPercent = (json['depositPercentage'] as num?)?.toDouble() ?? 50.0;
    double deposit = (total * depositPercent) / 100;

    return QuoteModel(
      id: json['id'] ?? '',
      quoteNumber: json['quoteNumber'] ?? '',
      eventTitle: json['eventTitle'] ?? '',
      eventDate: json['eventDate'] ?? '',
      venueName: json['venueName'] ?? '',
      guestCount: json['guestCount'] ?? 100,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      totalAmount: total,
      depositAmount: deposit,
      currency: json['currency'] ?? 'ETB',
      status: json['status'] ?? 'SENT',
      items: parsedItems,
    );
  }
}
