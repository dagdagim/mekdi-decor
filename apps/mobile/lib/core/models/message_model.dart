class MessageModel {
  final String id;
  final String customerId;
  final String senderName;
  final String senderRole;
  final String messageText;
  final String createdAt;
  final bool isCustomer;

  MessageModel({
    required this.id,
    required this.customerId,
    required this.senderName,
    required this.senderRole,
    required this.messageText,
    required this.createdAt,
    required this.isCustomer,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    final role = json['senderRole'] ?? (json['isMe'] == true ? 'CUSTOMER' : 'CONCIERGE');
    return MessageModel(
      id: json['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
      customerId: json['customerId'] ?? 'cust-01',
      senderName: json['senderName'] ?? json['sender'] ?? 'Sara Tekle',
      senderRole: role,
      messageText: json['messageText'] ?? json['text'] ?? '',
      createdAt: json['createdAt'] ?? json['time'] ?? 'Just now',
      isCustomer: role == 'CUSTOMER' || json['isMe'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'senderName': senderName,
      'senderRole': senderRole,
      'messageText': messageText,
      'createdAt': createdAt,
    };
  }
}
