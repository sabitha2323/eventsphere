import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage adapter to handle both Native (SecureStore) and Web (localStorage)
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error('Error reading auth session from storage', e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error('Error writing auth session to storage', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error('Error removing auth session from storage', e);
    }
  },
};

// --- MOCK DATABASE FOR OFFLINE DEMO MODE ---

const isMockMode =
  !supabaseUrl ||
  supabaseUrl.includes('your-project-id') ||
  !supabaseAnonKey ||
  supabaseAnonKey.includes('your-supabase-anon-key');

// Seed Users
const seedUsers = [
  {
    id: 'admin-uuid-1111-2222-3333',
    name: 'Admin User',
    email: 'admin@eventsphere.com',
    password: 'password123',
    phone: '9876543210',
    role: 'admin',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user-uuid-1111-2222-3333',
    name: 'Regular User',
    email: 'user@eventsphere.com',
    password: 'password123',
    phone: '9876543210',
    role: 'user',
    created_at: new Date().toISOString(),
  },
];

// Seed Events
const seedEvents = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    title: 'Neon Beats Music Festival',
    description: 'Experience the ultimate electronic music festival featuring world-renowned DJs, stunning light shows, and an immersive audiovisual experience in the heart of the city.',
    category: 'Music',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '18:00 - 23:30',
    venue: 'Grand Arena Plaza, Chennai',
    organizer: 'Beatwave Events',
    image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
    ticket_price: 1499.00,
    is_approved: true,
    created_by: null,
  },
  {
    id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    title: 'Heritage & Roots Cultural Expo',
    description: 'A vibrant celebration of traditional dances, authentic regional cuisine, handcraft exhibitions, and live folklore performances representing our rich cultural legacy.',
    category: 'Cultural',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00 - 20:00',
    venue: 'State Exhibition Grounds, Bengaluru',
    organizer: 'Chams Cultural Forum',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=600',
    ticket_price: 0.00,
    is_approved: true,
    created_by: null,
  },
  {
    id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    title: 'TechPulse 2026 Hackathon',
    description: 'Join developers, designers, and innovators from across the country for a 36-hour hackathon. Build solutions for real-world problems using AI, Web3, and IoT.',
    category: 'Technology',
    date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:00 (Sat) - 21:00 (Sun)',
    venue: 'Silicon Hub Innovation Center, Bengaluru',
    organizer: 'TechPulse Lab',
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600',
    ticket_price: 250.00,
    is_approved: true,
    created_by: null,
  },
  {
    id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    title: 'Inter-Collegiate Sports Championship',
    description: 'The biggest college sports event of the season! Watch top universities compete in basketball, football, and athletics for the championship trophy.',
    category: 'Sports',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '08:00 - 18:00',
    venue: 'National Sports Complex, Chennai',
    organizer: 'University Sports Board',
    image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600',
    ticket_price: 100.00,
    is_approved: true,
    created_by: null,
  },
  {
    id: 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    title: 'Gourmet Street Food Festival',
    description: 'Indulge in a culinary journey featuring over 50 food trucks, artisanal desserts, masterclasses by celebrity chefs, and live acoustic sessions.',
    category: 'Food Festival',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '12:00 - 22:00',
    venue: 'Lakefront Promenade, Bengaluru',
    organizer: 'TasteBuds Co.',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600',
    ticket_price: 150.00,
    is_approved: true,
    created_by: null,
  },
  {
    id: 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
    title: 'Creative Writing & Storytelling Workshop',
    description: 'An intensive interactive workshop for aspiring writers. Learn the art of character development, plotting, and publishing from award-winning novelists.',
    category: 'Workshops',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00 - 17:30',
    venue: 'Central Library Auditorium, Chennai',
    organizer: 'Literary Society',
    image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600',
    ticket_price: 500.00,
    is_approved: true,
    created_by: null,
  },
  {
    id: 'g7h8i9j0-k1l2-3m4n-5o6p-7q8r9s0t1u2v',
    title: 'Campus Spark Inter-College Fest',
    description: 'The ultimate annual inter-collegiate fest showcasing talent across music, dance, dramatics, and fine arts. Battle it out with colleges from across the region to win cash prizes!',
    category: 'College',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:00 - 18:00',
    venue: 'Main Campus Quadrangle, Chennai',
    organizer: 'Student Council Association',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600',
    ticket_price: 150.00,
    is_approved: true,
    created_by: null,
  },
  {
    id: 'h8i9j0k1-l2m3-4n5o-6p7q-8r9s0t1u2v3w',
    title: 'Global AI & Sustainability Summit',
    description: 'A premium seminar featuring guest lectures from leading AI researchers and sustainability experts. Explore how machine learning is tackling climate change, clean energy, and resource conservation.',
    category: 'Seminar',
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00 - 16:30',
    venue: 'Tech Conference Center Hall A, Bengaluru',
    organizer: 'EcoTech Alliance',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600',
    ticket_price: 0.00,
    is_approved: true,
    created_by: null,
  },
  {
    id: 'i9j0k1l2-m3n4-5o6p-7q8r-9s0t1u2v3w4x',
    title: 'Fintech Frontiers Hackathon 2026',
    description: 'A high-stakes 48-hour coding hackathon to build the next generation of decentralized finance, micro-lending, and secure payment solutions. Win mentorship, funding, and career opportunities.',
    category: 'Hackathon',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '18:00 (Fri) - 18:00 (Sun)',
    venue: 'Innovation Sandbox Hub, Mumbai',
    organizer: 'Future Finance Labs',
    image_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600',
    ticket_price: 300.00,
    is_approved: true,
    created_by: null,
  },
];

// Seed Ticket Tiers
const seedTicketTiers = [
  { id: 'tier-1', event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', name: 'General Admission', price: 1499.00, quantity: 500, sold: 120 },
  { id: 'tier-2', event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', name: 'VIP Pass', price: 2999.00, quantity: 100, sold: 45 },
  { id: 'tier-3', event_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', name: 'Student Ticket', price: 150.00, quantity: 300, sold: 180 },
  { id: 'tier-4', event_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', name: 'General Entry', price: 250.00, quantity: 200, sold: 50 },
  { id: 'tier-5', event_id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', name: 'Participant Entry', price: 100.00, quantity: 1000, sold: 420 },
  { id: 'tier-6', event_id: 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', name: 'Standard Pass', price: 150.00, quantity: 800, sold: 320 },
  { id: 'tier-7', event_id: 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', name: 'General Entry', price: 500.00, quantity: 50, sold: 18 },
  { id: 'tier-8', event_id: 'g7h8i9j0-k1l2-3m4n-5o6p-7q8r9s0t1u2v', name: 'General Entry', price: 150.00, quantity: 1000, sold: 50 },
  { id: 'tier-9', event_id: 'g7h8i9j0-k1l2-3m4n-5o6p-7q8r9s0t1u2v', name: 'VIP Pass', price: 400.00, quantity: 100, sold: 10 },
  { id: 'tier-10', event_id: 'h8i9j0k1-l2m3-4n5o-6p7q-8r9s0t1u2v3w', name: 'Free Registration', price: 0.00, quantity: 500, sold: 220 },
  { id: 'tier-11', event_id: 'i9j0k1l2-m3n4-5o6p-7q8r-9s0t1u2v3w4x', name: 'Team Entry', price: 300.00, quantity: 150, sold: 80 },
];

// Seed Promo Codes
const seedPromoCodes = [
  { id: 'promo-1', code: 'EARLYBIRD', discount: 20, is_active: true, limit: 100, used: 45, event_id: null },
  { id: 'promo-2', code: 'NEON25', discount: 25, is_active: true, limit: 50, used: 12, event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' },
  { id: 'promo-3', code: 'TECH10', discount: 10, is_active: true, limit: 200, used: 80, event_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f' },
];

// Seed FAQs
const seedFaqs = [
  { id: 'faq-1', event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', question: 'Is re-entry allowed?', answer: 'Yes, with a valid wristband issued at checkout.', created_at: new Date().toISOString() },
  { id: 'faq-2', event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', question: 'Are outside food and drinks permitted?', answer: 'No, but there are multiple food stalls inside the venue offering water, meals, and snacks.', created_at: new Date().toISOString() },
  { id: 'faq-3', event_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', question: 'What hardware should I bring?', answer: 'Please bring your laptop, charger, and ID card. We will provide extension boxes, high-speed Wi-Fi, and meals.', created_at: new Date().toISOString() },
];

// Seed Polls
const seedPolls = [
  { id: 'poll-1', event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', question: 'Which genre are you most excited to hear tonight?', options: ['EDM / House', 'Trance / Techno', 'Dubstep / Bass', 'Hip-hop / Pop'], votes: [45, 30, 15, 10], created_at: new Date().toISOString() },
  { id: 'poll-2', event_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', question: 'Which project domain are you choosing?', options: ['Generative AI', 'Web3 / Blockchain', 'IoT / Robotics', 'Fintech solutions'], votes: [80, 20, 15, 35], created_at: new Date().toISOString() },
];

// Seed Reviews
const seedReviews = [
  { id: 'rev-1', event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', user_id: 'user-uuid-1111-2222-3333', user_name: 'Regular User', comment: 'Absolutely spectacular music and visuals. Can\'t wait for the next edition!', rating: 5, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'rev-2', event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', user_id: 'admin-uuid-1111-2222-3333', user_name: 'Admin User', comment: 'Well organized, sound setup was top-notch.', rating: 4, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

// Seed Support Tickets
const seedSupportTickets = [
  {
    id: 'ticket-1',
    user_id: 'user-uuid-1111-2222-3333',
    subject: 'Refund request for Music Festival',
    description: 'I accidentally bought two tickets for Neon Beats instead of one. Can I get a refund for the second ticket?',
    status: 'pending',
    messages: [
      { sender: 'user', message: 'I accidentally bought two tickets. Can I get a refund?', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      { sender: 'admin', message: 'Hi, we have received your request. We are reviewing the cancellation policy for Beatwave Events and will get back to you shortly.', created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() }
    ],
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

// Seed Audit Logs
const seedAuditLogs = [
  { id: 'log-1', admin_id: 'admin-uuid-1111-2222-3333', admin_name: 'Admin User', action: 'Approved event: Neon Beats Music Festival', ip: '192.168.1.45', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'log-2', admin_id: 'admin-uuid-1111-2222-3333', admin_name: 'Admin User', action: 'Approved event: Heritage & Roots Cultural Expo', ip: '192.168.1.45', created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
];

let mockDbInMemory: any = null;

async function getMockDb(): Promise<any> {
  if (mockDbInMemory) return mockDbInMemory;
  try {
    const data = await ExpoSecureStoreAdapter.getItem('eventsphere_mock_db');
    if (data) {
      mockDbInMemory = JSON.parse(data);
      // Verify all tables exist and merge new seed data
      if (!mockDbInMemory.users) {
        mockDbInMemory.users = seedUsers;
      }
      if (!mockDbInMemory.events) {
        mockDbInMemory.events = seedEvents;
      } else {
        seedEvents.forEach(se => {
          if (!mockDbInMemory.events.some((e: any) => e.id === se.id)) {
            mockDbInMemory.events.push(se);
          }
        });
      }
      if (!mockDbInMemory.registrations) mockDbInMemory.registrations = [];
      if (!mockDbInMemory.comments) mockDbInMemory.comments = [];
      if (!mockDbInMemory.notifications) mockDbInMemory.notifications = [];
      if (!mockDbInMemory.ticket_tiers) {
        mockDbInMemory.ticket_tiers = seedTicketTiers;
      } else {
        seedTicketTiers.forEach(st => {
          if (!mockDbInMemory.ticket_tiers.some((t: any) => t.id === st.id)) {
            mockDbInMemory.ticket_tiers.push(st);
          }
        });
      }
      if (!mockDbInMemory.promocodes) mockDbInMemory.promocodes = seedPromoCodes;
      if (!mockDbInMemory.billing_records) mockDbInMemory.billing_records = [];
      if (!mockDbInMemory.chats) mockDbInMemory.chats = [];
      if (!mockDbInMemory.faqs) mockDbInMemory.faqs = seedFaqs;
      if (!mockDbInMemory.polls) mockDbInMemory.polls = seedPolls;
      if (!mockDbInMemory.reviews) mockDbInMemory.reviews = seedReviews;
      if (!mockDbInMemory.support_tickets) mockDbInMemory.support_tickets = seedSupportTickets;
      if (!mockDbInMemory.audit_logs) mockDbInMemory.audit_logs = seedAuditLogs;
      
      await saveMockDb(mockDbInMemory);
      return mockDbInMemory;
    }
  } catch (e) {
    console.error('Error loading mock database', e);
  }

  // Initialize with seed data
  mockDbInMemory = {
    users: seedUsers,
    events: seedEvents,
    registrations: [],
    comments: [],
    notifications: [],
    ticket_tiers: seedTicketTiers,
    promocodes: seedPromoCodes,
    billing_records: [],
    chats: [],
    faqs: seedFaqs,
    polls: seedPolls,
    reviews: seedReviews,
    support_tickets: seedSupportTickets,
    audit_logs: seedAuditLogs,
  };
  await saveMockDb(mockDbInMemory);
  return mockDbInMemory;
}

async function saveMockDb(db: any): Promise<void> {
  mockDbInMemory = db;
  try {
    await ExpoSecureStoreAdapter.setItem('eventsphere_mock_db', JSON.stringify(db));
  } catch (e) {
    console.error('Error saving mock database', e);
  }
}

let currentSessionInMemory: any = null;
let isSessionLoaded = false;

async function getMockSession(): Promise<any> {
  if (isSessionLoaded) return currentSessionInMemory;
  try {
    const data = await ExpoSecureStoreAdapter.getItem('eventsphere_mock_session');
    if (data) {
      currentSessionInMemory = JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading mock session', e);
  }
  isSessionLoaded = true;
  return currentSessionInMemory;
}

async function saveMockSession(session: any): Promise<void> {
  currentSessionInMemory = session;
  isSessionLoaded = true;
  try {
    if (session) {
      await ExpoSecureStoreAdapter.setItem('eventsphere_mock_session', JSON.stringify(session));
    } else {
      await ExpoSecureStoreAdapter.removeItem('eventsphere_mock_session');
    }
  } catch (e) {
    console.error('Error saving mock session', e);
  }
}

const authListeners = new Set<(event: string, session: any) => void>();

function notifyAuthChange(event: string, session: any) {
  for (const listener of authListeners) {
    try {
      listener(event, session);
    } catch (e) {
      console.error('Error in auth listener', e);
    }
  }
}

class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderField?: string;
  private orderAscending?: boolean;
  private isSingle = false;
  private isMaybeSingle = false;
  private isCount = false;
  private operation?: 'insert' | 'update' | 'delete' | 'upsert';
  private operationData?: any;
  // For chained insert().select().single() patterns
  private postInsertSelect = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields?: string, options?: { count?: string; head?: boolean }) {
    if (options?.count || (fields && fields.includes('count'))) {
      this.isCount = true;
    }
    // If called after insert/upsert, mark a post-insert select
    if (this.operation === 'insert' || this.operation === 'upsert') {
      this.postInsertSelect = true;
    }
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push((item) => {
      return item[field] === value;
    });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  /**
   * maybeSingle — like single() but returns null (not an error) when no row matches.
   * FIXED: was missing, causing runtime crashes on event detail screen.
   */
  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  insert(rowOrRows: any) {
    this.operation = 'insert';
    this.operationData = rowOrRows;
    return this;
  }

  /**
   * upsert — insert or update on conflict.
   * FIXED: was missing, causing runtime crashes on signup flow.
   */
  upsert(rowOrRows: any) {
    this.operation = 'upsert';
    this.operationData = rowOrRows;
    return this;
  }

  update(updateData: any) {
    this.operation = 'update';
    this.operationData = updateData;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  // Thenable implementation to support await/promise
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute() {
    const db = await getMockDb();
    let data = [...(db[this.tableName] || [])];

    if (this.operation === 'insert') {
      const rowOrRows = this.operationData;
      const rows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
      const newRows = rows.map((row) => ({
        id: row.id || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
        ...row,
      }));
      if (!db[this.tableName]) db[this.tableName] = [];
      db[this.tableName].push(...newRows);
      await saveMockDb(db);
      data = newRows;
    } else if (this.operation === 'upsert') {
      // FIXED: upsert support — insert or update by id
      const rowOrRows = this.operationData;
      const rows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows];
      if (!db[this.tableName]) db[this.tableName] = [];
      const upsertedRows: any[] = [];
      for (const row of rows) {
        const existingIdx = db[this.tableName].findIndex((item: any) => item.id === row.id);
        if (existingIdx >= 0) {
          db[this.tableName][existingIdx] = { ...db[this.tableName][existingIdx], ...row };
          upsertedRows.push(db[this.tableName][existingIdx]);
        } else {
          const newRow = {
            id: row.id || Math.random().toString(36).substring(2, 15),
            created_at: new Date().toISOString(),
            ...row,
          };
          db[this.tableName].push(newRow);
          upsertedRows.push(newRow);
        }
      }
      await saveMockDb(db);
      data = upsertedRows;
    } else if (this.operation === 'update') {
      const updateData = this.operationData;
      let updatedCount = 0;
      const updatedRows: any[] = [];
      const updatedList = data.map((item) => {
        let matches = true;
        for (const filter of this.filters) {
          if (!filter(item)) {
            matches = false;
            break;
          }
        }
        if (matches) {
          updatedCount++;
          const updated = { ...item, ...updateData };
          updatedRows.push(updated);
          return updated;
        }
        return item;
      });
      db[this.tableName] = updatedList;
      await saveMockDb(db);
      data = updatedRows;
    } else if (this.operation === 'delete') {
      const remainingRows: any[] = [];
      const deletedRows: any[] = [];
      for (const item of data) {
        let matches = true;
        for (const filter of this.filters) {
          if (!filter(item)) {
            matches = false;
            break;
          }
        }
        if (matches) {
          deletedRows.push(item);
        } else {
          remainingRows.push(item);
        }
      }
      db[this.tableName] = remainingRows;
      await saveMockDb(db);
      data = deletedRows;
    } else {
      // Normal select operation
      // Apply filters
      for (const filter of this.filters) {
        data = data.filter(filter);
      }
    }

    // Apply ordering
    if (this.orderField) {
      data.sort((a, b) => {
        const valA = a[this.orderField!];
        const valB = b[this.orderField!];
        if (valA === valB) return 0;
        const comparison = valA > valB ? 1 : -1;
        return this.orderAscending ? comparison : -comparison;
      });
    }

    // Resolve Joins
    if (this.tableName === 'registrations') {
      data = data.map((reg) => {
        const event = db.events.find((e: any) => e.id === reg.event_id);
        return {
          ...reg,
          events: event || null,
        };
      });
    }

    if (this.tableName === 'comments') {
      data = data.map((comment) => {
        const user = db.users.find((u: any) => u.id === comment.user_id);
        const userObj = user
          ? { name: user.name, email: user.email }
          : { name: 'Demo User', email: 'demo@eventsphere.com' };
        return {
          ...comment,
          // Provide both `user` (old) and `users` (new, used in event detail screen)
          user: userObj,
          users: userObj,
        };
      });
    }

    if (this.isCount) {
      return { count: data.length, data: null, error: null };
    }

    // FIXED: maybeSingle returns null (not an error) when no row is found
    if (this.isMaybeSingle) {
      return { data: data[0] || null, error: null };
    }

    if (this.isSingle) {
      // For insert().select().single() chains, data is already the inserted rows
      if (this.postInsertSelect && data.length > 0) {
        // Resolve joins for the single returned row if needed
        const resolved = this._resolveJoins(db, data);
        return { data: resolved[0] || null, error: null };
      }
      return { data: data[0] || null, error: data[0] ? null : { message: 'Row not found' } };
    }

    return { data, error: null };
  }

  private _resolveJoins(db: any, data: any[]): any[] {
    if (this.tableName === 'registrations') {
      return data.map((reg) => {
        const event = db.events?.find((e: any) => e.id === reg.event_id);
        return { ...reg, events: event || null };
      });
    }
    if (this.tableName === 'comments') {
      return data.map((comment) => {
        const user = db.users?.find((u: any) => u.id === comment.user_id);
        return {
          ...comment,
          users: user ? { name: user.name, email: user.email } : { name: 'Demo User', email: 'demo@eventsphere.com' },
          user: user ? { name: user.name, email: user.email } : { name: 'Demo User', email: 'demo@eventsphere.com' },
        };
      });
    }
    return data;
  }
}

function createMockSupabaseClient() {
  console.log('🔌 [EventSphere] Running in offline demo/mock database mode.');

  const auth = {
    async getSession() {
      const session = await getMockSession();
      return { data: { session }, error: null };
    },
    async getUser() {
      const session = await getMockSession();
      return { data: { user: session?.user || null }, error: null };
    },
    async signInWithPassword({ email, password }: any) {
      const db = await getMockDb();
      const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!user || user.password !== password) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
      }

      const session = {
        access_token: 'mock-access-token-' + user.id,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token-' + user.id,
        user: {
          id: user.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: user.email,
          user_metadata: {
            name: user.name,
            phone: user.phone,
            role: user.role,
          },
        },
      };

      await saveMockSession(session);
      notifyAuthChange('SIGNED_IN', session);

      return { data: { user: session.user, session }, error: null };
    },
    async signUp({ email, password, options }: any) {
      const db = await getMockDb();
      const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return { data: { user: null, session: null }, error: { message: 'User already registered' } };
      }

      const newUser = {
        id: 'user-' + Math.random().toString(36).substring(2, 15),
        name: options?.data?.name || 'New User',
        email: email,
        password: password,
        phone: options?.data?.phone || null,
        role: options?.data?.role || 'user',
        created_at: new Date().toISOString(),
      };

      db.users.push(newUser);
      await saveMockDb(db);

      const session = {
        access_token: 'mock-access-token-' + newUser.id,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token-' + newUser.id,
        user: {
          id: newUser.id,
          aud: 'authenticated',
          role: 'authenticated',
          email: newUser.email,
          user_metadata: {
            name: newUser.name,
            phone: newUser.phone,
            role: newUser.role,
          },
        },
      };

      await saveMockSession(session);
      notifyAuthChange('SIGNED_IN', session);

      return { data: { user: session.user, session }, error: null };
    },
    async signOut() {
      await saveMockSession(null);
      notifyAuthChange('SIGNED_OUT', null);
      return { error: null };
    },
    onAuthStateChange(callback: (event: string, session: any) => void) {
      authListeners.add(callback);
      getMockSession().then((session) => {
        callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      });
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
    async resetPasswordForEmail(email: string, options?: any) {
      console.log('Mock password reset requested for:', email);
      return { data: {}, error: null };
    },
  };

  return {
    auth,
    from(tableName: string) {
      return new MockQueryBuilder(tableName);
    },
  };
}

const realSupabase = (isMockMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })) as any;

const mockSupabase = createMockSupabaseClient();

// Wrapped Supabase client with auto-fallback to Mock DB if network fetch fails
export const supabase = isMockMode
  ? mockSupabase
  : new Proxy(realSupabase, {
      get(target, prop) {
        if (prop === 'auth') {
          return new Proxy(target.auth, {
            get(authTarget, authProp) {
              const originalMethod = authTarget[authProp];
              if (typeof originalMethod === 'function') {
                return async (...args: any[]) => {
                  try {
                    const res = await originalMethod.apply(authTarget, args);
                    if (res?.error && (
                      res.error.message?.includes('fetch') ||
                      res.error.message?.includes('Failed to fetch') ||
                      res.error.message?.includes('NetworkError')
                    )) {
                      console.warn(`[Supabase] Network fetch failed on auth.${String(authProp)}. Falling back to offline demo database.`);
                      const mockMethod = (mockSupabase.auth as any)[authProp];
                      if (typeof mockMethod === 'function') {
                        return await mockMethod.apply(mockSupabase.auth, args);
                      }
                    }
                    return res;
                  } catch (err: any) {
                    console.warn(`[Supabase] Network error on auth.${String(authProp)}:`, err?.message || err);
                    console.warn(`[Supabase] Falling back to offline demo database.`);
                    const mockMethod = (mockSupabase.auth as any)[authProp];
                    if (typeof mockMethod === 'function') {
                      return await mockMethod.apply(mockSupabase.auth, args);
                    }
                    return { data: { user: null, session: null }, error: { message: err?.message || 'Network error' } };
                  }
                };
              }
              return originalMethod;
            },
          });
        }
        return target[prop];
      },
    });


