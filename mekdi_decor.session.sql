-- ==============================================================================
-- MEKDI DECOR — ACTIVE POSTGRESQL SESSION
-- Database: mekdi_decor @ localhost:5432 (User: postgres)
-- ==============================================================================

-- 1. View all tables in public schema
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Services List
SELECT id, slug, title, starting_price, currency, is_active 
FROM services 
ORDER BY display_order;

-- 3. Packages
SELECT id, slug, name, tier_label, starting_price, currency, is_featured 
FROM packages 
ORDER BY display_order;

-- 4. Gallery Projects
SELECT id, slug, title, event_type, venue_name, location_city, estimated_price_range 
FROM gallery_projects 
ORDER BY display_order;

-- 5. Active Events & Customer Details
SELECT e.id, e.event_code, e.title, e.event_type, e.event_date, e.venue_name, e.status, 
       u.full_name AS customer_name, u.phone, u.email
FROM events e
JOIN customers c ON e.customer_id = c.id
JOIN users u ON c.user_id = u.id;

-- 6. Quotes with Line Items
SELECT q.quote_number, q.title, q.status, q.total_amount, q.currency,
       qi.item_title, qi.quantity, qi.unit_price, qi.subtotal
FROM quotes q
JOIN quote_items qi ON q.id = qi.quote_id;

-- 7. Bookings and Payments Status
SELECT b.booking_number, b.deposit_amount, b.balance_amount, b.deposit_paid,
       p.payment_reference, p.provider, p.status AS payment_status, p.amount
FROM bookings b
LEFT JOIN payments p ON b.id = p.booking_id;
