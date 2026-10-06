# MEKDI DECOR — Making Moments Unforgettable
*Production Digital Platform for Premier Event & Wedding Decoration*

---

## 🌟 Executive Overview

**Mekdi Decor** is a world-class digital platform designed specifically for a premier event decoration atelier operating in Ethiopia (Addis Ababa, Hawassa, Bishoftu, Adama) and internationally.

This repository is built as a complete commercial enterprise product containing:
1. **Public Luxury Website** (`apps/web`): Next.js 14, TypeScript, Tailwind CSS, Editorial Layouts, Interactive Draggable Before/After Slider, Services Catalog, Curated Packages, and Customer Testimonials.
2. **Interactive Event Designer** (`/plan-event`): Multi-step event intake wizard with guest count pills, venue settings, signature color palettes, itemized element selector, and budget preferences.
3. **Quotation & Booking Portal** (`/quotes/[id]`): Itemized quotation generator, status milestone progress bar, and payment modal with Ethiopian payment providers (**Chapa**, **Telebirr**, and **CBE Birr**).
4. **Enterprise Admin CRM** (`/admin`): Deep burgundy executive dashboard, lead intake manager (`/admin/requests`), quotation builder (`/admin/quotes`), production lifecycle tracker (`/admin/bookings`), customer dossier CRM (`/admin/customers`), master scheduling calendar with conflict prevention (`/admin/calendar`), and financial transactions ledger (`/admin/payments`).
5. **Customer Mobile App** (`apps/mobile`): Flutter & Dart project built with Clean Architecture, Riverpod, and GoRouter.
6. **Live Mobile Simulator** (`/mobile-preview`): An in-browser interactive iPhone simulator replicating the native mobile app screens shown in the design specification.
7. **PostgreSQL Database** (`packages/database`): Fully normalized relational schema with 22+ tables, UUID primary keys, foreign constraints, indexes, and realistic Ethiopian seed data.
8. **REST API Backend** (`apps/web/src/app/api`): Clean domain routes with DTO validation for services, packages, gallery, intake requests, quotes, payments, and messaging.

---

## 🎨 Visual Identity & Brand Design Tokens

- **Deep Burgundy**: `#5B1424` (Hero overlays, headers, primary buttons, branding)
- **Champagne Gold**: `#D4AF37` / `#C59B27` (Accents, badges, rating stars, borders)
- **Warm Cream**: `#FDFBF7` / `#FAF6F0` (Base canvas background, soft cards)
- **Warm Charcoal**: `#1C1917` / `#2B2828` (Editorial typography, high-contrast text)
- **Muted Botanical**: `#3D5A45` (Floral accents, success badges)
- **Typography**: `Playfair Display` (Headings) + `Plus Jakarta Sans` / `Inter` (Body & Controls)

---

## 🚀 Quick Start Guide

### 1. Requirements
- Node.js 18+ (tested on Node v24.9)
- npm 10+
- (Optional for native mobile build): Flutter SDK 3.0+

### 2. Install & Start Local Web Platform
```bash
# Clone the repository
git clone <repo-url> "mekdi decor"
cd "mekdi decor"

# Install dependencies (utilizes npm workspaces)
npm install

# Start development server
npm run dev
```

The application will be live at:
- **Public Website**: [http://localhost:3000](http://localhost:3000) (or `http://localhost:3002`)
- **Event Planner Wizard**: [http://localhost:3000/plan-event](http://localhost:3000/plan-event)
- **Sample Live Quotation**: [http://localhost:3000/quotes/q-108](http://localhost:3000/quotes/q-108)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Interactive Mobile Simulator**: [http://localhost:3000/mobile-preview](http://localhost:3000/mobile-preview)
- **Filterable Gallery**: [http://localhost:3000/gallery](http://localhost:3000/gallery)

### 3. Run Flutter Customer Mobile App
```bash
cd apps/mobile
flutter pub get
flutter run
```

---

## 🗄️ Database Setup (PostgreSQL)

The schema and seed files are located in `packages/database/`:
- `packages/database/schema.sql`: 22+ tables, enums, triggers, and query-optimized indexes.
- `packages/database/seed.sql`: Realistic Ethiopian & international luxury event setups, services, packages, quotes, and CRM records.

To import into your PostgreSQL instance:
```bash
# Create database
createdb -U postgres mekdi_decor

# Execute schema & seed
psql -U postgres -d mekdi_decor -f packages/database/schema.sql
psql -U postgres -d mekdi_decor -f packages/database/seed.sql
```

---

## 💳 Ethiopian Payment Gateway Abstraction

Located in `apps/web/src/lib/payment/index.ts`:
- **Chapa**: Debit/credit cards and mobile banking integration via standard REST initialization.
- **Telebirr**: USSD and QR push integration for mobile payments.
- **CBE Birr**: Direct merchant shortcode transfer reference tracking.

---

## 🧪 Testing

Run the automated test suite:
```bash
node --test apps/web/test/system.test.mjs
```

---

## 📱 Architecture Diagram

```
/mekdi-decor
├── apps/
│   ├── web/                     # Next.js 14 Web App, Admin CRM & REST API
│   │   ├── src/
│   │   │   ├── app/             # App Router pages & API routes
│   │   │   ├── components/      # UI, layout, home sections, before/after slider
│   │   │   ├── lib/             # Data models, payment providers, utilities
│   │   └── tailwind.config.ts   # Design tokens & color system
│   └── mobile/                  # Production Flutter application
│       ├── lib/
│       │   ├── core/            # Theme, router, constants
│       │   └── features/        # Home, events, inspiration, messages, profile
│       └── pubspec.yaml
├── packages/
│   └── database/
│       ├── schema.sql           # PostgreSQL normalized schema
│       └── seed.sql             # Ethiopian event seed data
├── .env.example                 # Environment variable templates
└── package.json                 # Monorepo workspaces config
```
