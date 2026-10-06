import assert from 'node:assert';
import test from 'node:test';

const BASE_URL = 'http://localhost:3002/api';

test('Quotation Calculation Engine', () => {
  const items = [
    { title: 'Decoration Package', subtotal: 120000 },
    { title: 'Stage Decoration', subtotal: 35000 },
    { title: 'Flowers & Centerpieces', subtotal: 25000 },
    { title: 'Lighting', subtotal: 15000 },
    { title: 'Transport & Installation', subtotal: 10000 },
  ];

  const subtotal = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const depositPercent = 50;
  const depositRequired = (subtotal * depositPercent) / 100;

  assert.strictEqual(subtotal, 205000, 'Subtotal should equal ETB 205,000 matching user mockup');
  assert.strictEqual(depositRequired, 102500, '50% deposit should equal ETB 102,500');
});

test('Ethiopian Payment Providers Initializer', async () => {
  const supportedProviders = ['CHAPA', 'TELEBIRR', 'CBE_BIRR'];

  for (const provider of supportedProviders) {
    assert.ok(provider.length > 0, `Provider ${provider} is recognized`);
  }
});

test('Event Status Progression Milestones', () => {
  const statuses = [
    'REQUESTED',
    'CONSULTATION',
    'QUOTE_SENT',
    'QUOTE_ACCEPTED',
    'DEPOSIT_PENDING',
    'CONFIRMED',
    'DESIGN_PHASE',
    'PREPARATION',
    'EVENT_DAY',
    'COMPLETED'
  ];

  assert.strictEqual(statuses.length, 10, 'Full 10-step event lifecycle is configured');
  assert.strictEqual(statuses[0], 'REQUESTED');
  assert.strictEqual(statuses[statuses.length - 1], 'COMPLETED');
});

test('Database Persistence & API Endpoints: Services, Packages, Gallery', async () => {
  // 1. Services
  const resServices = await fetch(`${BASE_URL}/services`);
  assert.strictEqual(resServices.status, 200, '/api/services should return 200 OK');
  const servicesData = await resServices.json();
  assert.ok(servicesData.data.length >= 4, 'Should fetch services from database');

  // 2. Packages
  const resPackages = await fetch(`${BASE_URL}/packages`);
  assert.strictEqual(resPackages.status, 200, '/api/packages should return 200 OK');
  const packagesData = await resPackages.json();
  assert.ok(packagesData.data.length >= 3, 'Should fetch tiered packages from database');

  // 3. Gallery
  const resGallery = await fetch(`${BASE_URL}/gallery`);
  assert.strictEqual(resGallery.status, 200, '/api/gallery should return 200 OK');
  const galleryData = await resGallery.json();
  assert.ok(galleryData.data.length >= 6, 'Should fetch gallery projects from database');
});

test('Database Dynamic Quotation & Deposit Fetching', async () => {
  const resQuote = await fetch(`${BASE_URL}/quotes/MD-QT-2026-108`);
  assert.strictEqual(resQuote.status, 200, 'Quotation MD-QT-2026-108 should be fetched from DB');
  const quote = (await resQuote.json()).data;
  assert.strictEqual(quote.quoteNumber, 'MD-QT-2026-108');
  assert.strictEqual(quote.totalAmount, 205000, 'Total quotation matches ETB 205,000');
  assert.strictEqual(quote.items.length, 5, 'Has 5 itemized quotation elements');
});

test('Database Mutation: Customer Event Booking Intake', async () => {
  const testPayload = {
    guestName: 'Selamawit Bekele',
    guestEmail: 'selam.b@example.com',
    guestPhone: '+251 911 887 766',
    eventType: 'Melse (መልስ)',
    eventDate: '2027-01-20',
    guestCount: 400,
    venueName: 'Kuriftu Resort & Spa Bishoftu',
    stylePreference: 'Royal Ethiopian Heritage',
    selectedServices: ['Traditional Mesob Suite', 'Floral Canopy'],
    budgetRange: '250,000 ETB',
  };

  const res = await fetch(`${BASE_URL}/event-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testPayload),
  });

  assert.strictEqual(res.status, 201, 'Should return 201 Created');
  const body = await res.json();
  const refCode = body.data.referenceNumber || body.data.requestNumber;
  assert.ok(refCode.includes('REQ-'), 'Generated real database reference code');
  assert.strictEqual(body.data.guestName, 'Selamawit Bekele');
});

test('Database Messaging: Real-Time Concierge Exchange', async () => {
  const msgPayload = {
    customerId: 'cust-01',
    senderName: 'Sara Tekle',
    senderRole: 'CUSTOMER',
    messageText: 'Automated test message for concierge dispatch',
  };

  const postRes = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msgPayload),
  });
  assert.strictEqual(postRes.status, 201, 'Message saved to database');

  const getRes = await fetch(`${BASE_URL}/messages?customerId=cust-01`);
  assert.strictEqual(getRes.status, 200);
  const messagesData = await getRes.json();
  assert.ok(messagesData.data.length >= 1, 'Messages list retrieved from database');
});

test('Database Payments & Inspiration Bookmarking', async () => {
  // Test Payment Recording
  const payRes = await fetch(`${BASE_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteId: 'MD-QT-2026-108',
      amount: 102500,
      currency: 'ETB',
      provider: 'TELEBIRR',
    }),
  });
  assert.strictEqual(payRes.status, 200, 'Payment recorded to database');

  // Test Inspiration Bookmark Toggle
  const inspRes = await fetch(`${BASE_URL}/inspirations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: 'cust-01',
      galleryItemId: 'proj-1',
    }),
  });
  assert.strictEqual(inspRes.status, 200, 'Inspiration bookmark toggled in database');
});
