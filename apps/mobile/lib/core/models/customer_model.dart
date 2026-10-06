class CustomerModel {
  final String id;
  final String fullName;
  final String email;
  final String phone;
  final String city;
  final String vipTier;
  final int totalEvents;
  final double totalSpend;
  final String avatarUrl;

  CustomerModel({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.city,
    required this.vipTier,
    required this.totalEvents,
    required this.totalSpend,
    required this.avatarUrl,
  });

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: json['id'] ?? 'cust-01',
      fullName: json['fullName'] ?? 'Sara Tekle',
      email: json['email'] ?? 'sara.t@example.com',
      phone: json['phone'] ?? '+251 922 334 455',
      city: json['city'] ?? 'Hawassa',
      vipTier: json['vipTier'] ?? 'VIP Diamond',
      totalEvents: json['totalEvents'] ?? 2,
      totalSpend: (json['totalSpend'] as num?)?.toDouble() ?? 245000.0,
      avatarUrl: json['avatarUrl'] ??
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    );
  }

  CustomerModel copyWith({
    String? id,
    String? fullName,
    String? email,
    String? phone,
    String? city,
    String? vipTier,
    int? totalEvents,
    double? totalSpend,
    String? avatarUrl,
  }) {
    return CustomerModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      city: city ?? this.city,
      vipTier: vipTier ?? this.vipTier,
      totalEvents: totalEvents ?? this.totalEvents,
      totalSpend: totalSpend ?? this.totalSpend,
      avatarUrl: avatarUrl ?? this.avatarUrl,
    );
  }
}
