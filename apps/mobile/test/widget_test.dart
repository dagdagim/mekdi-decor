import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mekdi_decor_mobile/core/models/event_model.dart';
import 'package:mekdi_decor_mobile/core/theme/app_theme.dart';

void main() {
  test('EventModel accurately parses confirmed bookings and pending requests', () {
    // 1. Confirmed Booking Model
    final booking = EventModel.fromJson({
      'id': 'b-101',
      'bookingNumber': 'MD-BK-2026-108',
      'eventTitle': "Sara & Michael's Luxury Wedding",
      'venueName': 'Skyline Event Hall, Hawassa',
      'city': 'Hawassa',
      'guestCount': 350,
      'totalAmount': 205000,
      'depositAmount': 102500,
      'balanceAmount': 102500,
      'depositPaid': true,
      'progress': 80,
      'status': 'CONFIRMED',
    });

    expect(booking.isBooking, true);
    expect(booking.code, 'MD-BK-2026-108');
    expect(booking.depositPaid, true);
    expect(booking.progressPercentage, 80);
    expect(booking.totalAmount, 205000.0);
    expect(booking.depositAmount, 102500.0);

    // 2. Pending Event Request Model
    final request = EventModel.fromJson({
      'id': 'req-101',
      'referenceNumber': 'REQ-2026-001',
      'guestName': 'Sara Tekle',
      'eventType': 'Wedding',
      'venueName': 'Skyline Event Hall',
      'guestCount': 350,
      'status': 'CONSULTATION',
    });

    expect(request.isBooking, false);
    expect(request.code, 'REQ-2026-001');
    expect(request.title, "Sara Tekle's Wedding");
    expect(request.status, 'CONSULTATION');
  });

  test('AppColors luxury brand palette tokens are configured correctly', () {
    expect(AppColors.burgundyPrimary, const Color(0xFF5B1424));
    expect(AppColors.goldAccent, const Color(0xFFD4AF37));
    expect(AppColors.botanicalGreen, const Color(0xFF3D5A45));
    expect(AppColors.creamSurface, const Color(0xFFFAF6F0));
  });
}
