-- ==============================================================================
-- MEKDI DECOR — REALISTIC SEED DATA (DEVELOPMENT & DEMO)
-- Currency: ETB (Ethiopian Birr)
-- All demo content clearly structured for Mekdi Decor showcase
-- ==============================================================================

-- 1. USERS & ADMINS
INSERT INTO users (id, email, phone, password_hash, full_name, role, avatar_url, is_active)
VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@mekdidecor.com', '+251911234567', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpEwW6d6mCqK6C', 'Mekdes Tadesse (Founder & Lead Designer)', 'ADMIN', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', true),
('a0000000-0000-0000-0000-000000000002', 'sara.t@example.com', '+251922334455', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpEwW6d6mCqK6C', 'Sara Tekle', 'CUSTOMER', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', true),
('a0000000-0000-0000-0000-000000000003', 'michael.k@example.com', '+251933445566', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpEwW6d6mCqK6C', 'Michael Kebede', 'CUSTOMER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', true),
('a0000000-0000-0000-0000-000000000004', 'helen.g@example.com', '+251944556677', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpEwW6d6mCqK6C', 'Helen Girma', 'CUSTOMER', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', true)
ON CONFLICT (email) DO NOTHING;

-- 2. CUSTOMER PROFILES (CRM)
INSERT INTO customers (id, user_id, alternate_phone, city, address, vip_status, lifetime_value)
VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '+251911998877', 'Hawassa', 'Lake View Residence, Hawassa', true, 205000.00),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', '+251911443322', 'Addis Ababa', 'Bole Atlas, Addis Ababa', false, 140000.00),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', '+251911776655', 'Bishoftu', 'Kuriftu Lake Area, Bishoftu', true, 320000.00)
ON CONFLICT DO NOTHING;

-- 3. SERVICES (12 Core Offerings)
INSERT INTO services (id, slug, title, subtitle, description, icon_name, featured_image, starting_price, currency, display_order)
VALUES
('00000001-0000-0000-0000-000000000001', 'stage-decoration', 'Stage Decoration', 'The focal point of your unforgettable day', 'Grand floral backdrops, architectural arches, tiered podiums, bespoke velvet drapery, and theatrical illumination.', 'Crown', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 35000.00, 'ETB', 1),
('00000001-0000-0000-0000-000000000002', 'floral-design', 'Floral Design & Centerpieces', 'Artisanal blooms with botanical grandeur', 'Imported Ecuadorian roses, local Ethiopian garden blooms, cascading orchids, and handcrafted tablescape arrangements.', 'Flower', 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80', 25000.00, 'ETB', 2),
('00000001-0000-0000-0000-000000000003', 'venue-transformation', 'Venue Decoration & Draping', 'Complete metamorphosis of raw halls', 'Floor-to-ceiling silk ceiling swags, ballroom wraps, perimeter uplighting, and custom floor carpeting.', 'Sparkles', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80', 45000.00, 'ETB', 3),
('00000001-0000-0000-0000-000000000004', 'table-styling', 'Table & Chair Styling', 'Intimate dining with royal presentation', 'Fine chargers, brushed gold cutlery, customized linen napkins, crystal glassware, and Chiavari or Dior seating.', 'Utensils', 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80', 20000.00, 'ETB', 4),
('00000001-0000-0000-0000-000000000005', 'entrance-decoration', 'Grand Entrance & Welcome Arches', 'Captivating first impressions', 'Monumental floral gates, mirrored welcome signage with calligraphy, warm lanterns, and rose petal runways.', 'DoorOpen', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80', 18000.00, 'ETB', 5),
('00000001-0000-0000-0000-000000000006', 'photo-backdrops', 'Photo Backdrops & Media Walls', 'Picture-perfect memory capsules', '3D floral living walls, custom neon monograms, acrylic framing, and studio-grade selfie lighting zones.', 'Camera', 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80', 15000.00, 'ETB', 6),
('00000001-0000-0000-0000-000000000007', 'ambient-lighting', 'Architectural & Ambient Lighting', 'Crafting romantic nocturnal ambiance', 'Warm amber pin-spots, crystal chandeliers, fairy light canopies, moving heads, and synchronized mood lights.', 'Lightbulb', 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80', 15000.00, 'ETB', 7),
('00000001-0000-0000-0000-000000000008', 'ceiling-installations', 'Ceiling Suspensions & Chandeliers', 'Dramatic airborne elegance', 'Floating floral clouds, cascading wisteria vines, suspended crystal pendants, and fairy light waterfalls.', 'CloudRain', 'https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=1200&q=80', 28000.00, 'ETB', 8)
ON CONFLICT (slug) DO NOTHING;

-- 4. PACKAGES (4 Strategic Tiers)
INSERT INTO packages (id, slug, name, tier_label, tagline, description, starting_price, currency, is_featured, display_order)
VALUES
('00000002-0000-0000-0000-000000000001', 'essential-celebration', 'Essential', 'Intimate Occasions', 'Refined elegance for birthdays and intimate dinners', 'Curated table settings for up to 80 guests, sleek photo backdrop with custom typography, welcome easel, and warm perimeter lighting.', 65000.00, 'ETB', false, 1),
('00000002-0000-0000-0000-000000000002', 'elegance-experience', 'Elegance', 'Most Popular', 'The quintessential luxury package for memorable weddings & engagements', 'Grand floral arch stage, 15 floral centerpiece tablescapes, entrance floral pathway, ambient uplighting, guest book zone, and seating styling for 200 guests.', 135000.00, 'ETB', true, 2),
('00000002-0000-0000-0000-000000000003', 'signature-royale', 'Signature Royale', 'Grand Luxury', 'A breathtaking full-venue transformation for landmark galas and royal weddings', 'Monumental 12-meter floral stage, suspended chandeliers, luxury floral tunnel entrance, premium linen & gold cutlery for 350+ guests, 3D photo backdrop, and lighting director.', 245000.00, 'ETB', false, 3),
('00000002-0000-0000-0000-000000000004', 'bespoke-custom', 'Bespoke Atelier', 'Completely Tailored', 'Unconstrained artistic vision designed exclusively for your dream', 'Every element individually architecturalized from 3D renders to rare botanical imports, custom stage carpentry, and multi-venue coordination.', 380000.00, 'ETB', false, 4)
ON CONFLICT (slug) DO NOTHING;

-- 5. GALLERY PROJECTS (High-End Real Portfolio Showcase)
INSERT INTO gallery_projects (
    id, slug, title, event_type, venue_name, location_city, guest_count, decoration_style,
    hero_image, before_image, after_image, description, color_palette, estimated_price_range,
    testimonial_quote, testimonial_author, is_featured, display_order
)
VALUES
(
    '00000003-0000-0000-0000-000000000001',
    'luxury-wedding-hawassa',
    'Sarah & Michael''s Lakeside Royal Wedding',
    'Wedding',
    'Skyline Event Hall, Lake View',
    'Hawassa',
    350,
    'Luxury',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    'A breathtaking celebration featuring a majestic 10-meter white and blush rose stage, crystal pendant chandeliers, candle-lined mirrored walkway, and lavish floral centerpieces for 350 guests.',
    '["#5B1424", "#D4AF37", "#FAF6F0", "#F5D0C5"]'::jsonb,
    'ETB 200,000 - 280,000',
    'Mekdi Decor made our wedding day truly magical. The transformation of Skyline Hall was beyond what we ever dreamed possible.',
    'Sara & Michael',
    true,
    1
),
(
    '00000003-0000-0000-0000-000000000002',
    'grand-graduation-sheraton-addis',
    'Dr. Helen Girma''s Golden Honors Graduation Gala',
    'Graduation',
    'Sheraton Addis Ballroom',
    'Addis Ababa',
    180,
    'Modern Luxury',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=85',
    'A sophisticated gold and emerald celebration featuring bespoke laser-cut insignia, cascading white florals, gold geometric towers, and illuminated stage podiums.',
    '["#1F3A2B", "#D4AF37", "#FFFFFF", "#2B2828"]'::jsonb,
    'ETB 120,000 - 170,000',
    'Every single guest was mesmerized as they entered. Mekdi Decor has set the highest standard of elegance in Addis.',
    'Dr. Helen & Family',
    true,
    2
),
(
    '00000003-0000-0000-0000-000000000003',
    'romantic-engagement-kuriftu-bishoftu',
    'Blen & Dawit''s Lakeside Sunset Engagement',
    'Engagement',
    'Kuriftu Resort & Spa Waterfront',
    'Bishoftu',
    120,
    'Romantic Botanical',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
    'Open-air waterfront pavilion enriched with bohemian floral canopies, fairy light drapery, velvet lounge seating, and an arch of fresh garden roses against lake waters.',
    '["#4A0E17", "#D4AF37", "#FDFBF7", "#C49A6C"]'::jsonb,
    'ETB 95,000 - 145,000',
    'The romantic lighting and floral scent created an unforgettable atmosphere that we will cherish for the rest of our lives.',
    'Blen & Dawit',
    true,
    3
),
(
    '00000003-0000-0000-0000-000000000004',
    'velvet-crimson-birthday-adama',
    'Selamawit''s 30th Velvet & Gold Birthday Soirée',
    'Birthday',
    'Imperial Palace Hotel',
    'Adama',
    85,
    'Chic Glamour',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=85',
    'Rich crimson drapery, gold mirror tables, customized neon backdrop for photos, champagne tower styling, and ambient jazz illumination.',
    '["#5B1424", "#000000", "#D4AF37", "#E5C365"]'::jsonb,
    'ETB 75,000 - 110,000',
    'The most stylish birthday party our friends have ever attended. Mekdi''s team took care of every small detail with pure love.',
    'Selamawit T.',
    true,
    4
)
ON CONFLICT (slug) DO NOTHING;

-- 6. DEMO EVENT & ACTIVE QUOTATION (Sarah's Wedding Matching UI Mockup)
INSERT INTO events (
    id, event_code, customer_id, title, event_type, event_date,
    venue_name, venue_address, guest_count, decoration_style, status, progress_percentage
)
VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'MD-EVT-2026-018',
    'c0000000-0000-0000-0000-000000000001',
    'Sarah''s Wedding',
    'Wedding',
    '2026-12-18',
    'Skyline Event Hall',
    'Lake View Avenue, Hawassa',
    350,
    'Luxury',
    'DESIGN_PHASE',
    80
)
ON CONFLICT (event_code) DO NOTHING;

-- Quotation matching prompt image (ETB 205,000 total)
INSERT INTO quotes (
    id, quote_number, event_id, customer_id, title, status, validity_date, deposit_percentage,
    subtotal, transport_cost, installation_cost, discount_amount, tax_amount, total_amount, currency,
    terms_and_conditions
)
VALUES
(
    '00000005-0000-0000-0000-000000000001',
    'MD-QT-2026-108',
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Bespoke Wedding Decoration — Skyline Hall Hawassa',
    'SENT',
    '2026-11-30',
    50.00,
    195000.00,
    10000.00,
    0.00,
    0.00,
    0.00,
    205000.00,
    'ETB',
    '1. 50% deposit secures the reserved date in Mekdi Decor production calendar.\n2. Final balance due 7 calendar days before event date.\n3. Setup begins 12 hours prior to guest arrival.\n4. All custom botanical and structural elements remain property of Mekdi Decor unless specified.'
)
ON CONFLICT (quote_number) DO NOTHING;

-- Line items exactly matching the user screenshot:
-- Decoration Package: ETB 120,000
-- Stage Decoration: ETB 35,000
-- Flowers & Centerpieces: ETB 25,000
-- Lighting: ETB 15,000
-- Transport & Installation: ETB 10,000
-- Total: ETB 205,000
INSERT INTO quote_items (quote_id, item_title, item_description, quantity, unit_price, subtotal, display_order)
VALUES
('00000005-0000-0000-0000-000000000001', 'Decoration Package', 'Comprehensive luxury venue transformation, chair covers, and linens', 1, 120000.00, 120000.00, 1),
('00000005-0000-0000-0000-000000000001', 'Stage Decoration', 'Custom 10-meter white and champagne backdrop with crystal chandelier fixtures', 1, 35000.00, 35000.00, 2),
('00000005-0000-0000-0000-000000000001', 'Flowers & Centerpieces', 'Fresh imported and local garden roses, hydrangeas and high floral urns (25 tables)', 1, 25000.00, 25000.00, 3),
('00000005-0000-0000-0000-000000000001', 'Lighting', 'Amber perimeter uplighting, spotlighting for cake and stage, warm fairy tunnel', 1, 15000.00, 15000.00, 4),
('00000005-0000-0000-0000-000000000001', 'Transport & Installation', 'Dedicated transport logistics to Hawassa, 8-person crew installation and breakdown', 1, 10000.00, 10000.00, 5)
ON CONFLICT DO NOTHING;

-- 7. BOOKINGS & PAYMENTS
INSERT INTO bookings (
    id, booking_number, event_id, quote_id, deposit_amount, balance_amount, deposit_paid, balance_due_date, contract_signed
)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'MD-BK-2026-056',
    'e0000000-0000-0000-0000-000000000001',
    '00000005-0000-0000-0000-000000000001',
    102500.00,
    102500.00,
    true,
    '2026-12-11',
    true
)
ON CONFLICT (booking_number) DO NOTHING;

INSERT INTO payments (
    id, payment_reference, booking_id, customer_id, amount, currency, provider, status, payment_type, provider_transaction_id
)
VALUES
(
    '00000007-0000-0000-0000-000000000001',
    'CHAPA-TX-782109',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    102500.00,
    'ETB',
    'CHAPA',
    'SUCCESS',
    'DEPOSIT',
    'chp_live_938172901'
)
ON CONFLICT (payment_reference) DO NOTHING;
