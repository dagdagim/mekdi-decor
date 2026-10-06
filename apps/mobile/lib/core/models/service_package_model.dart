class ServiceItemModel {
  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String featuredImage;
  final double startingPrice;
  final String currency;

  ServiceItemModel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.featuredImage,
    required this.startingPrice,
    this.currency = 'ETB',
  });

  factory ServiceItemModel.fromJson(Map<String, dynamic> json) {
    return ServiceItemModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      subtitle: json['subtitle']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      featuredImage: json['featuredImage']?.toString() ??
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      startingPrice: (json['startingPrice'] as num?)?.toDouble() ?? 25000.0,
      currency: json['currency']?.toString() ?? 'ETB',
    );
  }
}

class PackageItemModel {
  final String id;
  final String name;
  final String tierLabel;
  final String description;
  final double startingPrice;
  final String currency;
  final bool isFeatured;
  final List<String> includedServices;

  PackageItemModel({
    required this.id,
    required this.name,
    required this.tierLabel,
    required this.description,
    required this.startingPrice,
    this.currency = 'ETB',
    this.isFeatured = false,
    this.includedServices = const [],
  });

  factory PackageItemModel.fromJson(Map<String, dynamic> json) {
    return PackageItemModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      tierLabel: json['tierLabel']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      startingPrice: (json['startingPrice'] as num?)?.toDouble() ?? 65000.0,
      currency: json['currency']?.toString() ?? 'ETB',
      isFeatured: json['isFeatured'] == true,
      includedServices: (json['includedServices'] as List?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }
}
