# Mekdi Decor — System Architecture & Implementation Plan

**"Making Moments Unforgettable"**
*Premium Event Decoration Platform (Web, Customer Mobile App, Admin Dashboard, Backend API, PostgreSQL)*

---

## 1. System Overview & Architecture

```
                                      +------------------------------------+
                                      |        MEKDI DECOR PLATFORM        |
                                      +------------------------------------+
                                                        |
            +-------------------------------------------+-----------------------------------------+
            |                                           |                                         |
            v                                           v                                         v
+-----------------------+                   +-----------------------+                 +-----------------------+
|     PUBLIC WEB        |                   |      ADMIN CRM        |                 |     CUSTOMER APP      |
|  Next.js + Tailwind   |                   |   Enterprise Portal   |                 |     Flutter / Dart    |
| - Editorial Showcase  |                   | - Lead & Quote Mgmt   |                 | - Clean Architecture  |
| - Multi-step Planner  |                   | - Event Scheduling    |                 | - Riverpod + GoRouter |
| - Gallery & Stories   |                   | - Payment Tracking    |                 | - Event Milestones    |
| - Quote Review & Pay  |                   | - Analytics & Reports |                 | - Inspiration Board   |
+-----------------------+                   +-----------------------+                 +-----------------------+
            |                                           |                                         |
            +-------------------------------------------+-----------------------------------------+
                                                        |
                                                        v
                                    +---------------------------------------+
                                    |         REST API / BACKEND            |
                                    | - Domain Modules & DTO Validation     |
                                    | - JWT Auth & Role-Based Access        |
                                    | - Ethiopian Payment Gateway Adapter   |
                                    | - Notification & Messaging Pipeline   |
                                    +---------------------------------------+
                                                        |
                                                        v
                                    +---------------------------------------+
                                    |       POSTGRESQL DATABASE             |
                                    | - 22+ Normalized Tables (UUID)        |
                                    | - Foreign Keys, Audit Logs, Indexes   |
                                    | - Seeded with Real Ethiopian Data     |
                                    +---------------------------------------+
```

---

## 2. Visual Identity & Design System

### Color Palette (Curated Luxury)
| Token | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| **Burgundy Deep** | `#4A0E17` / `#5B1424` | Primary Luxury | Hero overlays, headers, primary buttons, branding |
| **Burgundy Rich** | `#320B10` | Dark Accents | Dark backgrounds, footer, navigation contrast |
| **Champagne Gold**| `#D4AF37` / `#C59B27` | Accent & Glow | Badges, borders, subtle highlights, rating stars |
| **Warm Cream**    | `#FDFBF7` / `#FAF6F0` | Canvas / Base | Primary website background, soft surfaces |
| **Soft White**    | `#FFFFFF` | Card & Island | Content cards, modal sheets, input fields |
| **Warm Charcoal** | `#1C1917` / `#2B2828` | Typography | Headings, high-contrast readable text |
| **Muted Botanical**| `#3D5A45` / `#E8EFE9`| Subtle Accent | Floral badge accents, success indicators |

### Typography
- **Headings & Editorial**: `Playfair Display`, `Cormorant Garamond` (Serif, elegant, dignified)
- **Body & Controls**: `Plus Jakarta Sans`, `Inter` (Clean geometric sans-serif, high legibility)

---

## 3. Database Schema (PostgreSQL)

The platform is backed by a fully normalized PostgreSQL relational schema:
1. `users`: Credentials, roles (`CUSTOMER`, `ADMIN`, `STAFF`, `MANAGER`), email, phone, avatar
2. `customers`: Extended CRM profile, VIP tier, preferred event styles, notes, lifetime value
3. `event_requests`: Multi-step intake submissions (guest count, venue type, colors, budget, services)
4. `events`: Confirmed event records with dates, venue address, status lifecycle
5. `services`: Catalog of 12+ decor services (Stage, Floral, Lighting, Backdrops, etc.)
6. `packages`: Tiered packages (`Essential`, `Elegance`, `Signature`, `Royal Custom`) with ETB pricing
7. `gallery_projects`: High-res portfolio with tags, before/after images, venue, guest count
8. `quotes`: Formal quotations with validity period, deposit required (e.g. 50%), balance due date
9. `quote_items`: Granular itemized lines with quantity, unit price, and subtotal
10. `bookings`: Booking contracts and milestone timeline states
11. `payments`: Payment records with gateway abstraction (Chapa, Telebirr, CBE Birr, Cash/Bank Transfer)
12. `messages`: Client-staff event chat with attachments and read receipts
13. `notifications`: In-app, push, and email status alerts
14. `reviews`: Customer verified feedback with ratings and photos
15. `inspiration_boards`: Customer saved designs and moodboards
16. `calendar_events`: Admin schedule & installation tracking with double-booking prevention

---

## 4. Implementation Phases

- **Phase 1**: Monorepo structure, design tokens, database schema & seed scripts, shared types.
- **Phase 2**: Next.js Web App with full Tailwind CSS theme, responsive luxury layout, Hero, Category Cards, Interactive Before/After slider, Services, Editorial Projects, Packages, Multi-step "Design Your Event" wizard, and Quote Review page.
- **Phase 3**: Complete Admin CRM & Management Portal (Requests, Quotes builder, Bookings timeline, Calendar, Payments, Gallery editor, Analytics).
- **Phase 4**: Production REST API endpoints with persistent data store and Ethiopian payment simulation.
- **Phase 5**: Flutter Customer Mobile App (Clean Architecture, Riverpod, GoRouter, Event Milestones, Inspiration Board, Chat).
- **Phase 6**: Verification, responsiveness testing across mobile/tablet/desktop, and visual QA.
