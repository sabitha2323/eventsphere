/**
 * Unit Tests – MockQueryBuilder (src/lib/supabase.ts)
 * Tests cover: select, eq, insert, upsert, update, delete, single, maybeSingle, ordering
 */

// We import supabase which in test env will be in mock mode (no .env real keys set)
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android', select: (obj: any) => obj.android ?? obj.default },
}));

describe('MockQueryBuilder – CRUD Operations', () => {
  let supabase: any;

  beforeAll(async () => {
    // Dynamic import so mocks are applied first
    const mod = await import('../../src/lib/supabase');
    supabase = mod.supabase;
    // Reset mock DB by resetting in-memory
  });

  // ─── SELECT ───────────────────────────────────────────────────────────────
  describe('select()', () => {
    it('should return all events', async () => {
      const { data, error } = await supabase.from('events').select('*');
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should return all seed users', async () => {
      const { data, error } = await supabase.from('users').select('*');
      expect(error).toBeNull();
      expect(data.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ─── EQ FILTER ────────────────────────────────────────────────────────────
  describe('eq()', () => {
    it('should filter events by id', async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe('Neon Beats Music Festival');
    });

    it('should filter users by email (case insensitive not tested – eq is exact)', async () => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@eventsphere.com');
      expect(data).toHaveLength(1);
      expect(data[0].role).toBe('admin');
    });
  });

  // ─── SINGLE ───────────────────────────────────────────────────────────────
  describe('single()', () => {
    it('should return single event', async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
        .single();
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data.title).toBe('Neon Beats Music Festival');
    });

    it('should return error when row not found', async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', 'non-existent-id')
        .single();
      expect(data).toBeNull();
      expect(error).not.toBeNull();
    });
  });

  // ─── MAYBE SINGLE (FIXED) ─────────────────────────────────────────────────
  describe('maybeSingle() [FIXED]', () => {
    it('should return data when row found', async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
        .maybeSingle();
      expect(error).toBeNull();
      expect(data).not.toBeNull();
    });

    it('should return null data (no error) when row not found', async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', 'non-existent')
        .eq('user_id', 'non-existent')
        .maybeSingle();
      // CRITICAL FIX: was crashing here before fix
      expect(error).toBeNull();
      expect(data).toBeNull();
    });
  });

  // ─── INSERT ───────────────────────────────────────────────────────────────
  describe('insert()', () => {
    it('should insert a new registration', async () => {
      const { error } = await supabase.from('registrations').insert({
        event_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        user_id: 'user-uuid-1111-2222-3333',
      });
      expect(error).toBeNull();
    });

    it('should insert a notification', async () => {
      const { error } = await supabase.from('notifications').insert({
        user_id: 'user-uuid-1111-2222-3333',
        title: 'Test Notification',
        message: 'This is a test',
        read: false,
      });
      expect(error).toBeNull();
    });
  });

  // ─── UPSERT (FIXED) ──────────────────────────────────────────────────────
  describe('upsert() [FIXED]', () => {
    it('should insert user if not exists', async () => {
      const testId = 'test-upsert-user-999';
      const { error } = await supabase.from('users').upsert({
        id: testId,
        name: 'Test Upsert',
        email: 'upsert@test.com',
        phone: '1234567890',
        role: 'user',
      });
      // CRITICAL FIX: was crashing here before fix
      expect(error).toBeNull();

      const { data } = await supabase.from('users').select('*').eq('id', testId).single();
      expect(data).not.toBeNull();
      expect(data.name).toBe('Test Upsert');
    });

    it('should update existing user on upsert', async () => {
      const { error } = await supabase.from('users').upsert({
        id: 'user-uuid-1111-2222-3333',
        name: 'Updated Regular User',
        email: 'user@eventsphere.com',
        phone: '9876543210',
        role: 'user',
      });
      expect(error).toBeNull();
    });
  });

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update a user name', async () => {
      const { error } = await supabase
        .from('users')
        .update({ name: 'Admin Updated' })
        .eq('id', 'admin-uuid-1111-2222-3333');
      expect(error).toBeNull();
    });

    it('should approve an event', async () => {
      const { error } = await supabase
        .from('events')
        .update({ is_approved: true })
        .eq('id', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d');
      expect(error).toBeNull();
    });
  });

  // ─── DELETE ───────────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('should delete a notification', async () => {
      // Insert first
      await supabase.from('notifications').insert({
        id: 'notif-to-delete',
        user_id: 'user-uuid-1111-2222-3333',
        title: 'Delete Me',
        message: 'Delete test',
        read: false,
      });

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', 'notif-to-delete');
      expect(error).toBeNull();
    });
  });

  // ─── ORDER ────────────────────────────────────────────────────────────────
  describe('order()', () => {
    it('should order events by date ascending', async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      expect(data[0].date <= data[data.length - 1].date).toBe(true);
    });
  });
});
