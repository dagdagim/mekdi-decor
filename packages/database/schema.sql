-- ==============================================================================
-- MEKDI DECOR — POSTGRESQL PRODUCTION DATABASE SCHEMA
-- "Making Moments Unforgettable"
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ==============================================================================
-- 1. AUTHENTICATION & ACCESS CONTROL
-- ==============================================================================

CREATE TYPE user_role_type AS ENUM ('CUSTOMER', 'ADMIN', 'STAFF', 'MANAGER');
CREATE TYPE event_status_type AS ENUM (
    'REQUESTED',
    'CONSULTATION',
    'QUOTE_SENT',
    'QUOTE_ACCEPTED',
    'DEPOSIT_PENDING',
    'CONFIRMED',
    'DESIGN_PHASE',
    'PREPARATION',
    'EVENT_DAY',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE quote_status_type AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REVISION_REQUESTED', 'DECLINED', 'EXPIRED');
CREATE TYPE payment_status_type AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE payment_method_type AS ENUM ('CHAPA', 'TELEBIRR', 'CBE_BIRR', 'BANK_TRANSFER', 'CASH', 'OTHER');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role user_role_type NOT NULL DEFAULT 'CUSTOMER',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Customer Profile Details (CRM)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alternate_phone VARCHAR(32),
    city VARCHAR(64) DEFAULT 'Addis Ababa',
    address TEXT,
    notes TEXT,
    vip_status BOOLEAN DEFAULT false,
    lifetime_value NUMERIC(14, 2) DEFAULT 0.00,
    preferred_language VARCHAR(8) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. SERVICES & PACKAGES
-- ==============================================================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(128) NOT NULL,
    subtitle VARCHAR(256),
    description TEXT NOT NULL,
    icon_name VARCHAR(64),
    featured_image TEXT NOT NULL,
    starting_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(4) NOT NULL DEFAULT 'ETB',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    tier_label VARCHAR(64), -- e.g. "Most Popular", "Signature Luxury"
    tagline VARCHAR(256),
    description TEXT NOT NULL,
    starting_price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(4) NOT NULL DEFAULT 'ETB',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE package_services (
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    notes VARCHAR(256),
    PRIMARY KEY (package_id, service_id)
);

-- ==============================================================================
-- 3. GALLERY & PORTFOLIO
-- ==============================================================================

CREATE TABLE gallery_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(128) UNIQUE NOT NULL,
    title VARCHAR(256) NOT NULL,
    event_type VARCHAR(64) NOT NULL, -- Wedding, Graduation, Birthday, Engagement, Corporate
    venue_name VARCHAR(256) NOT NULL,
    location_city VARCHAR(128) NOT NULL DEFAULT 'Addis Ababa',
    guest_count INT,
    decoration_style VARCHAR(64), -- Luxury, Romantic, Modern, Traditional
    hero_image TEXT NOT NULL,
    before_image TEXT,
    after_image TEXT,
    video_url TEXT,
    description TEXT NOT NULL,
    color_palette JSONB DEFAULT '[]'::jsonb, -- array of hex strings
    estimated_price_range VARCHAR(64),
    testimonial_quote TEXT,
    testimonial_author VARCHAR(128),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES gallery_projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption VARCHAR(256),
    aspect_ratio VARCHAR(16) DEFAULT '16:9',
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. EVENT PLANNING & INTAKE REQUESTS
-- ==============================================================================

CREATE TABLE event_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(32) UNIQUE NOT NULL, -- e.g. MD-REQ-2026-0042
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    guest_name VARCHAR(128) NOT NULL,
    guest_email CITEXT NOT NULL,
    guest_phone VARCHAR(32) NOT NULL,
    event_type VARCHAR(64) NOT NULL, -- Wedding, Birthday, Graduation, etc.
    event_date DATE NOT NULL,
    guest_count INT NOT NULL,
    venue_type VARCHAR(64) NOT NULL, -- Indoor, Outdoor, Hotel, Hall, Home, Other
    venue_name VARCHAR(256),
    style_preference VARCHAR(64), -- Luxury, Romantic, Modern, Minimal, Traditional, Floral, Custom
    color_palette JSONB DEFAULT '[]'::jsonb,
    selected_services JSONB DEFAULT '[]'::jsonb, -- ['Stage', 'Entrance', 'Backdrop', ...]
    budget_range VARCHAR(64), -- e.g. '150,000 - 300,000 ETB'
    special_notes TEXT,
    inspiration_project_id UUID REFERENCES gallery_projects(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW', -- NEW, REVIEWED, QUOTE_CREATED, ARCHIVED
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. EVENTS & BOOKINGS
-- ==============================================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_code VARCHAR(32) UNIQUE NOT NULL, -- MD-EVT-2026-018
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    event_request_id UUID REFERENCES event_requests(id) ON DELETE SET NULL,
    title VARCHAR(256) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    event_date DATE NOT NULL,
    setup_start_time TIMESTAMP WITH TIME ZONE,
    event_end_time TIMESTAMP WITH TIME ZONE,
    venue_name VARCHAR(256) NOT NULL,
    venue_address TEXT,
    guest_count INT NOT NULL,
    decoration_style VARCHAR(64),
    status event_status_type NOT NULL DEFAULT 'REQUESTED',
    progress_percentage INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. QUOTATIONS & ITEMS
-- ==============================================================================

CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_number VARCHAR(32) UNIQUE NOT NULL, -- MD-QT-2026-108
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    title VARCHAR(256) NOT NULL,
    status quote_status_type NOT NULL DEFAULT 'SENT',
    validity_date DATE NOT NULL,
    deposit_percentage NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    transport_cost NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    installation_cost NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(4) NOT NULL DEFAULT 'ETB',
    terms_and_conditions TEXT,
    notes TEXT,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    item_title VARCHAR(256) NOT NULL,
    item_description TEXT,
    quantity NUMERIC(8, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    display_order INT NOT NULL DEFAULT 0
);

-- Bookings associated with accepted quotes
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(32) UNIQUE NOT NULL, -- MD-BK-2026-056
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE RESTRICT,
    deposit_amount NUMERIC(14, 2) NOT NULL,
    balance_amount NUMERIC(14, 2) NOT NULL,
    deposit_paid BOOLEAN NOT NULL DEFAULT false,
    balance_due_date DATE,
    contract_signed BOOLEAN NOT NULL DEFAULT false,
    contract_signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. PAYMENTS & TRANSACTIONS
-- ==============================================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_reference VARCHAR(64) UNIQUE NOT NULL, -- e.g. CHAPA-TX-982347
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(4) NOT NULL DEFAULT 'ETB',
    provider payment_method_type NOT NULL DEFAULT 'CHAPA',
    status payment_status_type NOT NULL DEFAULT 'PENDING',
    payment_type VARCHAR(32) NOT NULL DEFAULT 'DEPOSIT', -- DEPOSIT, BALANCE, FULL, EXTRA
    provider_transaction_id VARCHAR(128),
    receipt_url TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. MESSAGING, ATTACHMENTS & NOTIFICATIONS
-- ==============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    quote_reference_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(256) NOT NULL,
    file_type VARCHAR(64),
    file_size_bytes BIGINT
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL, -- QUOTE_RECEIVED, PAYMENT_RECEIVED, MILESTONE_UPDATED
    title VARCHAR(256) NOT NULL,
    body TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 9. INSPIRATION BOARDS & REVIEWS
-- ==============================================================================

CREATE TABLE inspiration_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL DEFAULT 'My Dream Event Inspiration',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE inspiration_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID NOT NULL REFERENCES inspiration_boards(id) ON DELETE CASCADE,
    project_id UUID REFERENCES gallery_projects(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    customer_name VARCHAR(128) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    photo_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT true,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. CALENDAR & AUDIT
-- ==============================================================================

CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(64) NOT NULL, -- CONSULTATION, SETUP, EVENT, BREAKDOWN
    location VARCHAR(256),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity_name VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    payload JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ==============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_events_customer ON events(customer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_quotes_event ON quotes(event_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_reference ON payments(payment_reference);
CREATE INDEX idx_gallery_featured ON gallery_projects(is_featured);
CREATE INDEX idx_messages_event ON messages(event_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
