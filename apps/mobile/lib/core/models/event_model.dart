class EventModel {
  final String id;
  final String code;
  final String title;
  final String eventType;
  final String eventDate;
  final String venueName;
  final String city;
  final int guestCount;
  final String decorationStyle;
  final int progressPercentage;
  final String status;
  final double totalAmount;
  final double depositAmount;
  final double balanceAmount;
  final bool depositPaid;
  final bool balancePaid;
  final bool isBooking;
  final String? quoteId;

  EventModel({
    required this.id,
    required this.code,
    required this.title,
    required this.eventType,
    required this.eventDate,
    required this.venueName,
    required this.city,
    required this.guestCount,
    required this.decorationStyle,
    required this.progressPercentage,
    required this.status,
    required this.totalAmount,
    this.depositAmount = 0.0,
    this.balanceAmount = 0.0,
    required this.depositPaid,
    this.balancePaid = false,
    this.isBooking = false,
    this.quoteId,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    // Check if it's a Booking or an EventRequest
    final isBooking = json.containsKey('bookingNumber') || json['isBooking'] == true;
    final total = (json['totalAmount'] as num?)?.toDouble() ?? 
                  ((json['depositAmount'] as num?)?.toDouble() ?? 0.0) + ((json['balanceAmount'] as num?)?.toDouble() ?? 0.0);
    final deposit = (json['depositAmount'] as num?)?.toDouble() ?? (total * 0.5);
    final balance = (json['balanceAmount'] as num?)?.toDouble() ?? (total - deposit);

    final title = json['title'] ?? 
                  json['eventTitle'] ?? 
                  (json['customerName'] != null ? "${json['customerName']}'s ${json['eventType'] ?? 'Event'}" : null) ??
                  (json['guestName'] != null ? "${json['guestName']}'s ${json['eventType'] ?? 'Event'}" : "Sara & Michael's Luxury Wedding");

    return EventModel(
      id: json['id'] ?? '',
      code: json['bookingNumber'] ?? json['requestNumber'] ?? json['referenceNumber'] ?? json['code'] ?? 'MD-EV-2026',
      title: title,
      eventType: json['eventType'] ?? 'Wedding',
      eventDate: json['eventDate'] ?? 'December 18, 2026',
      venueName: json['venueName'] ?? 'Skyline Event Hall, Hawassa',
      city: json['city'] ?? 'Hawassa',
      guestCount: (json['guestCount'] as num?)?.toInt() ?? 350,
      decorationStyle: json['decorationStyle'] ?? json['stylePreference'] ?? 'Imperial Velvet & Gold',
      progressPercentage: (json['progress'] as num?)?.toInt() ?? 
                          (json['progressPercentage'] as num?)?.toInt() ?? 
                          (isBooking ? 80 : 25),
      status: json['status'] ?? (isBooking ? 'CONFIRMED' : 'SUBMITTED'),
      totalAmount: total > 0 ? total : 205000.0,
      depositAmount: deposit,
      balanceAmount: balance,
      depositPaid: json['depositPaid'] ?? isBooking,
      balancePaid: json['balancePaid'] ?? false,
      isBooking: isBooking,
      quoteId: json['quoteId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'title': title,
      'eventType': eventType,
      'eventDate': eventDate,
      'venueName': venueName,
      'city': city,
      'guestCount': guestCount,
      'decorationStyle': decorationStyle,
      'progressPercentage': progressPercentage,
      'status': status,
      'totalAmount': totalAmount,
      'depositAmount': depositAmount,
      'balanceAmount': balanceAmount,
      'depositPaid': depositPaid,
      'balancePaid': balancePaid,
      'isBooking': isBooking,
      'quoteId': quoteId,
    };
  }
}
