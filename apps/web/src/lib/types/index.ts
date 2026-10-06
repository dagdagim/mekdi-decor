// ==============================================================================
// MEKDI DECOR — CORE DOMAIN TYPES & INTERFACES
// ==============================================================================

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'MANAGER';

export type EventStatus =
  | 'REQUESTED'
  | 'CONSULTATION'
  | 'QUOTE_SENT'
  | 'QUOTE_ACCEPTED'
  | 'DEPOSIT_PENDING'
  | 'CONFIRMED'
  | 'DESIGN_PHASE'
  | 'PREPARATION'
  | 'EVENT_DAY'
  | 'COMPLETED'
  | 'CANCELLED';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REVISION_REQUESTED' | 'DECLINED' | 'EXPIRED';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'CHAPA' | 'TELEBIRR' | 'CBE_BIRR' | 'BANK_TRANSFER' | 'CASH';

export type EventType =
  | 'Wedding'
  | 'Graduation'
  | 'Birthday'
  | 'Engagement'
  | 'Corporate'
  | 'Private Event'
  | 'Other';

export type VenueType = 'Indoor' | 'Outdoor' | 'Hotel' | 'Hall' | 'Home' | 'Other';

export type DecorationStyle =
  | 'Luxury'
  | 'Romantic'
  | 'Modern'
  | 'Minimal'
  | 'Traditional'
  | 'Floral'
  | 'Custom';

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  featuredImage: string;
  startingPrice: number;
  currency: string;
  isActive: boolean;
  displayOrder: number;
}

export interface PackageItem {
  id: string;
  slug: string;
  name: string;
  tierLabel?: string;
  tagline: string;
  description: string;
  startingPrice: number;
  currency: string;
  isFeatured: boolean;
  includedServices: string[];
  displayOrder: number;
}

export interface GalleryProject {
  id: string;
  slug: string;
  title: string;
  eventType: EventType;
  venueName: string;
  locationCity: string;
  guestCount: number;
  decorationStyle: DecorationStyle;
  heroImage: string;
  beforeImage?: string;
  afterImage?: string;
  videoUrl?: string;
  description: string;
  colorPalette: string[];
  estimatedPriceRange: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  servicesUsed: string[];
  isFeatured: boolean;
  displayOrder: number;
}

export interface EventRequestPayload {
  id?: string;
  requestNumber?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  eventType: EventType;
  eventDate: string;
  guestCount: number | string;
  venueType: VenueType;
  venueName?: string;
  stylePreference: DecorationStyle;
  colorPalette: string[];
  selectedServices: string[];
  budgetRange?: string;
  specialNotes?: string;
  inspirationProjectId?: string;
  bookingId?: string;
  status?: 'NEW' | 'REVIEWED' | 'QUOTE_CREATED' | 'CONFIRMED_BOOKING' | 'CONVERTED' | 'ARCHIVED';
  createdAt?: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  serviceId?: string;
  itemTitle: string;
  itemDescription?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  displayOrder: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  eventId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventTitle: string;
  eventType: EventType;
  eventDate: string;
  venueName: string;
  guestCount: number;
  decorationStyle: DecorationStyle;
  title: string;
  status: QuoteStatus;
  validityDate: string;
  depositPercentage: number;
  items: QuoteItem[];
  subtotal: number;
  transportCost: number;
  installationCost: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  termsAndConditions: string;
  notes?: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  eventId: string;
  quoteId: string;
  depositAmount: number;
  balanceAmount: number;
  depositPaid: boolean;
  balancePaid?: boolean;
  balanceDueDate: string;
  contractSigned: boolean;
  contractSignedAt?: string;
  status?: EventStatus;
  progress?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  eventTitle?: string;
  eventType?: EventType;
  eventDate?: string;
  venueName?: string;
  guestCount?: number;
  totalAmount?: number;
  currency?: string;
  decorationStyle?: string;
  items?: QuoteItem[];
  colorPalette?: string[];
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  paymentReference: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  provider: PaymentMethod;
  status: PaymentStatus;
  paymentType: 'DEPOSIT' | 'BALANCE' | 'FULL' | 'EXTRA';
  quoteId?: string;
  customerEmail?: string;
  customerPhone?: string;
  checkoutUrl?: string;
  providerTransactionId?: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CustomerCRM {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
  vipStatus: boolean;
  lifetimeValue: number;
  eventsCount: number;
  notes?: string;
  recentActivity: string;
  telegramUserId?: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  telegramPhotoUrl?: string;
  telegramLanguageCode?: string;
  telegramLinkedAt?: string;
  createdAt: string;
}

export interface MessageItem {
  id: string;
  eventId: string;
  senderName: string;
  senderRole: 'CUSTOMER' | 'ADMIN' | 'CONCIERGE';
  content: string;
  timestamp: string;
  isRead: boolean;
  quoteReferenceId?: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  eventType: string;
  rating: number;
  reviewText: string;
  venue: string;
  photoUrl?: string;
  isVerified: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'MANAGER';
  avatarUrl?: string;
  telegramUserId?: string;
  telegramUsername?: string;
  telegramFirstName?: string;
  telegramLastName?: string;
  telegramPhotoUrl?: string;
  telegramLanguageCode?: string;
  telegramLinkedAt?: string;
  isActive: boolean;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  verificationCode?: string;
  verificationCodeExpiresAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    role: string;
    telegramUserId?: string;
    telegramUsername?: string;
    emailVerifiedAt?: string | null;
  };
  token: string;
}

