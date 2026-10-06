class GalleryItemModel {
  final String id;
  final String title;
  final String category;
  final String eventType;
  final String style;
  final String imageUrl;
  final String venue;
  final String city;
  final List<String> colorPalette;
  final bool isFeatured;
  final bool isSaved;
  final String description;
  final int guestCount;
  final String estimatedPriceRange;
  final List<String> servicesUsed;
  final String? beforeImage;
  final String? afterImage;

  GalleryItemModel({
    required this.id,
    required this.title,
    required this.category,
    required this.eventType,
    required this.style,
    required this.imageUrl,
    required this.venue,
    required this.city,
    required this.colorPalette,
    this.isFeatured = false,
    this.isSaved = false,
    this.description = '',
    this.guestCount = 200,
    this.estimatedPriceRange = 'ETB 120,000 – 220,000',
    this.servicesUsed = const ['Stage Architecture', 'Bespoke Florals', 'Ambient Lighting'],
    this.beforeImage,
    this.afterImage,
  });

  factory GalleryItemModel.fromJson(Map<String, dynamic> json) {
    return GalleryItemModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      category: json['category'] ?? json['eventType'] ?? 'Wedding',
      eventType: json['eventType'] ?? json['category'] ?? 'Wedding',
      style: json['style'] ?? json['decorationStyle'] ?? 'Luxury Modern',
      imageUrl: json['imageUrl'] ?? json['heroImage'] ?? 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      venue: json['venue'] ?? json['venueName'] ?? 'Skyline Hall',
      city: json['city'] ?? json['locationCity'] ?? 'Addis Ababa',
      colorPalette: (json['colorPalette'] as List?)?.map((e) => e.toString()).toList() ?? ['#5B1424', '#D4AF37'],
      isFeatured: json['isFeatured'] ?? false,
      isSaved: json['isSaved'] ?? false,
      description: json['description'] ?? 'Bespoke luxury styling crafted with imported blooms, opulent drapery, and custom stage architecture.',
      guestCount: int.tryParse(json['guestCount']?.toString() ?? '200') ?? 200,
      estimatedPriceRange: json['estimatedPriceRange'] ?? 'ETB 120,000 – 220,000',
      servicesUsed: (json['servicesUsed'] as List?)?.map((e) => e.toString()).toList() ?? ['Stage Architecture', 'Bespoke Florals', 'Ambient Lighting'],
      beforeImage: json['beforeImage'],
      afterImage: json['afterImage'],
    );
  }

  GalleryItemModel copyWith({
    bool? isSaved,
    String? title,
    String? category,
    String? eventType,
    String? style,
    String? imageUrl,
    String? venue,
    String? city,
    List<String>? colorPalette,
    bool? isFeatured,
    String? description,
    int? guestCount,
    String? estimatedPriceRange,
    List<String>? servicesUsed,
    String? beforeImage,
    String? afterImage,
  }) {
    return GalleryItemModel(
      id: id,
      title: title ?? this.title,
      category: category ?? this.category,
      eventType: eventType ?? this.eventType,
      style: style ?? this.style,
      imageUrl: imageUrl ?? this.imageUrl,
      venue: venue ?? this.venue,
      city: city ?? this.city,
      colorPalette: colorPalette ?? this.colorPalette,
      isFeatured: isFeatured ?? this.isFeatured,
      isSaved: isSaved ?? this.isSaved,
      description: description ?? this.description,
      guestCount: guestCount ?? this.guestCount,
      estimatedPriceRange: estimatedPriceRange ?? this.estimatedPriceRange,
      servicesUsed: servicesUsed ?? this.servicesUsed,
      beforeImage: beforeImage ?? this.beforeImage,
      afterImage: afterImage ?? this.afterImage,
    );
  }
}
