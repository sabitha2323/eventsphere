import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  category: string;
  venue: string;
  organizer: string;
  is_approved: boolean;
  ticket_price: number;
}

export default function AdminScreen() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'approvals' | 'events' | 'users'>('stats');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    totalRegistrations: 0,
    avgRating: 0,
  });

  // Lists
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [approvedEventsList, setApprovedEventsList] = useState<Event[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const checkAdminRole = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (data && data.role === 'admin') {
          setIsAdmin(true);
          await fetchAdminData();
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Error checking admin role:', err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // 1. Fetch Users
      const { data: users, error: uError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      const fetchedUsers = users || [];
      setUsersList(fetchedUsers);

      // 2. Fetch Events
      const { data: events, error: eError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      const fetchedEvents: Event[] = events || [];
      const approved = fetchedEvents.filter((e) => e.is_approved);
      const pending = fetchedEvents.filter((e) => !e.is_approved);

      setApprovedEventsList(approved);
      setPendingEvents(pending);

      // 3. Fetch Registrations Count
      const { count: regCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });

      // 4. Fetch Average Comment Rating
      const { data: comments } = await supabase
        .from('comments')
        .select('rating');

      let avg = 0;
      if (comments && comments.length > 0) {
        const sum = comments.reduce((acc: number, c: any) => acc + (c.rating || 0), 0);
        avg = sum / comments.length;
      }

      setStats({
        totalUsers: fetchedUsers.length,
        totalEvents: fetchedEvents.length,
        approvedEvents: approved.length,
        pendingEvents: pending.length,
        totalRegistrations: regCount || 0,
        avgRating: parseFloat(avg.toFixed(1)),
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    checkAdminRole();
  }, []);

  const handleMakeMeAdmin = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', currentUser.id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setIsAdmin(true);
        Alert.alert('Success', "You are now an Administrator! Unlocking Dashboard.");
        await fetchAdminData();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_approved: true })
        .eq('id', eventId);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Approved', `"${title}" has been approved.`);
        // Find approved event and update state lists
        const approvedEvent = pendingEvents.find((e) => e.id === eventId);
        if (approvedEvent) {
          setPendingEvents(pendingEvents.filter((e) => e.id !== eventId));
          setApprovedEventsList([...approvedEventsList, { ...approvedEvent, is_approved: true }]);
          setStats((prev) => ({
            ...prev,
            pendingEvents: prev.pendingEvents - 1,
            approvedEvents: prev.approvedEvents + 1,
          }));
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    Alert.alert('Delete Event', `Are you sure you want to permanently delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('events').delete().eq('id', eventId);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Deleted', 'Event has been deleted.');
              setPendingEvents(pendingEvents.filter((e) => e.id !== eventId));
              setApprovedEventsList(approvedEventsList.filter((e) => e.id !== eventId));
              setStats((prev) => ({
                ...prev,
                totalEvents: prev.totalEvents - 1,
                approvedEvents: approvedEventsList.some((e) => e.id === eventId)
                  ? prev.approvedEvents - 1
                  : prev.approvedEvents,
                pendingEvents: pendingEvents.some((e) => e.id === eventId)
                  ? prev.pendingEvents - 1
                  : prev.pendingEvents,
              }));
            }
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  // ACCESS DENIED VIEW FOR NON-ADMINS
  if (isAdmin === false) {
    return (
      <View style={styles.container}>
        <View style={styles.deniedWrapper}>
          <View style={styles.deniedIconContainer}>
            <AppIcon name="lock.shield" size={64} tintColor={Theme.colors.primary} />
          </View>
          <Text style={styles.deniedTitle}>Admin Access Restricted</Text>
          <Text style={styles.deniedText}>
            This control panel is restricted to EventSphere administrators. Organizers and users can create and register for events via the other tabs.
          </Text>
          
          <GlassView style={styles.testCard} intensity="low">
            <Text style={styles.testCardTitle}>Testing Admin Features?</Text>
            <Text style={styles.testCardText}>
              Elevate your account role instantly to test approvals, user management, and view app stats.
            </Text>
            <TouchableOpacity style={[styles.testBtn, { backgroundColor: Theme.colors.primary }]} onPress={handleMakeMeAdmin}>
              <Text style={styles.testBtnText}>Make me Admin</Text>
            </TouchableOpacity>
          </GlassView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>System administration and statistics</Text>
      </View>

      {/* Sub tabs */}
      <View style={styles.subTabBar}>
        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'stats' && styles.subTabActive]}
          onPress={() => setActiveSubTab('stats')}
        >
          <Text style={[styles.subTabLabel, activeSubTab === 'stats' && styles.subTabActiveLabel]}>
            Stats
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'approvals' && styles.subTabActive]}
          onPress={() => setActiveSubTab('approvals')}
        >
          <Text style={[styles.subTabLabel, activeSubTab === 'approvals' && styles.subTabActiveLabel]}>
            Approvals ({pendingEvents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'events' && styles.subTabActive]}
          onPress={() => setActiveSubTab('events')}
        >
          <Text style={[styles.subTabLabel, activeSubTab === 'events' && styles.subTabActiveLabel]}>
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'users' && styles.subTabActive]}
          onPress={() => setActiveSubTab('users')}
        >
          <Text style={[styles.subTabLabel, activeSubTab === 'users' && styles.subTabActiveLabel]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* STATS VIEW */}
        {activeSubTab === 'stats' && (
          <View style={styles.statsWrapper}>
            <View style={styles.statsRow}>
              {/* Card 1 */}
              <GlassView style={styles.statCard} intensity="low">
                <AppIcon name="person.3.fill" size={24} tintColor={Theme.colors.secondary} />
                <Text style={styles.statNumber}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </GlassView>

              {/* Card 2 */}
              <GlassView style={styles.statCard} intensity="low">
                <AppIcon name="calendar" size={24} tintColor={Theme.colors.secondary} />
                <Text style={styles.statNumber}>{stats.totalEvents}</Text>
                <Text style={styles.statLabel}>Total Events</Text>
              </GlassView>
            </View>

            <View style={styles.statsRow}>
              {/* Card 3 */}
              <GlassView style={styles.statCard} intensity="low">
                <AppIcon name="ticket.fill" size={24} tintColor={Theme.colors.secondary} />
                <Text style={styles.statNumber}>{stats.totalRegistrations}</Text>
                <Text style={styles.statLabel}>Registrations</Text>
              </GlassView>

              {/* Card 4 */}
              <GlassView style={styles.statCard} intensity="low">
                <AppIcon name="star.fill" size={24} tintColor={Theme.colors.warning} />
                <Text style={styles.statNumber}>{stats.avgRating} / 5</Text>
                <Text style={styles.statLabel}>Avg Review Rating</Text>
              </GlassView>
            </View>

            <GlassView style={styles.broadCard} intensity="low">
              <Text style={styles.broadTitle}>Event Approvals Pipeline</Text>
              <View style={styles.pipelineRow}>
                <View style={styles.pipelineItem}>
                  <Text style={[styles.pipelineNumber, { color: Theme.colors.success }]}>
                    {stats.approvedEvents}
                  </Text>
                  <Text style={styles.pipelineLabel}>Approved & Live</Text>
                </View>
                <View style={[styles.pipelineItem, { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)' }]}>
                  <Text style={[styles.pipelineNumber, { color: Theme.colors.warning }]}>
                    {stats.pendingEvents}
                  </Text>
                  <Text style={styles.pipelineLabel}>Pending Approval</Text>
                </View>
              </View>
            </GlassView>
          </View>
        )}

        {/* PENDING APPROVALS LIST */}
        {activeSubTab === 'approvals' && (
          <View style={styles.listContainer}>
            {pendingEvents.length > 0 ? (
              pendingEvents.map((item) => (
                <GlassView key={item.id} style={styles.itemCard} intensity="low">
                  <View style={styles.itemMain}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMeta}>
                      Category: {item.category} • Organizer: {item.organizer}
                    </Text>
                    <Text style={styles.itemLocation}>Venue: {item.venue}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={[styles.approveBtn, { backgroundColor: Theme.colors.success }]}
                      onPress={() => handleApproveEvent(item.id, item.title)}
                    >
                      <Text style={styles.btnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteEvent(item.id, item.title)}
                    >
                      <Text style={styles.deleteBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </GlassView>
              ))
            ) : (
              <GlassView style={styles.emptyView} intensity="low">
                <AppIcon name="checkmark.circle" size={40} tintColor={Theme.colors.success} />
                <Text style={styles.emptyText}>No events pending approval.</Text>
              </GlassView>
            )}
          </View>
        )}

        {/* EVENTS LIST (LIVE) */}
        {activeSubTab === 'events' && (
          <View style={styles.listContainer}>
            {approvedEventsList.length > 0 ? (
              approvedEventsList.map((item) => (
                <GlassView key={item.id} style={styles.itemCard} intensity="low">
                  <View style={styles.itemMain}>
                    <View style={styles.liveBadgeRow}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <View style={styles.liveBadge}>
                        <Text style={styles.liveBadgeText}>Live</Text>
                      </View>
                    </View>
                    <Text style={styles.itemMeta}>
                      Category: {item.category} • Organizer: {item.organizer}
                    </Text>
                    <Text style={styles.itemLocation}>Price: ₹{item.ticket_price}</Text>
                  </View>
                  <View style={styles.itemActionsSingle}>
                    <TouchableOpacity
                      style={[styles.deleteBtn, { width: '100%' }]}
                      onPress={() => handleDeleteEvent(item.id, item.title)}
                    >
                      <Text style={styles.deleteBtnText}>Delete Event</Text>
                    </TouchableOpacity>
                  </View>
                </GlassView>
              ))
            ) : (
              <GlassView style={styles.emptyView} intensity="low">
                <Text style={styles.emptyText}>No live events found.</Text>
              </GlassView>
            )}
          </View>
        )}

        {/* USERS LIST */}
        {activeSubTab === 'users' && (
          <View style={styles.listContainer}>
            {usersList.map((item) => (
              <GlassView key={item.id} style={styles.userCard} intensity="low">
                <View style={styles.userMain}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userMeta}>Email: {item.email}</Text>
                  {item.phone && <Text style={styles.userMeta}>Phone: {item.phone}</Text>}
                </View>
                <View style={[styles.roleBadge, item.role === 'admin' && styles.roleAdmin]}>
                  <Text style={styles.roleBadgeText}>{item.role}</Text>
                </View>
              </GlassView>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    ...Platform.select({
      web: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
        borderColor: 'rgba(15, 23, 42, 0.08)',
        borderLeftWidth: 1,
        borderRightWidth: 1,
      } as any,
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  backgroundAccent1: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 194, 255, 0.08)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    paddingBottom: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  subTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
    paddingHorizontal: 8,
  },
  subTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabActive: {
    borderBottomColor: Theme.colors.secondary,
  },
  subTabLabel: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.medium,
  },
  subTabActiveLabel: {
    color: Theme.colors.secondary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 120,
  },
  statsWrapper: {
    gap: Theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.medium,
    textAlign: 'center',
  },
  broadCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.sm,
  },
  broadTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  pipelineRow: {
    flexDirection: 'row',
  },
  pipelineItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  pipelineNumber: {
    fontSize: 26,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    marginBottom: 4,
  },
  pipelineLabel: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.medium,
  },
  listContainer: {
    gap: Theme.spacing.md,
  },
  itemCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  itemMain: {
    marginBottom: Theme.spacing.md,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveBadgeText: {
    color: Theme.colors.success,
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
    flex: 1,
  },
  itemMeta: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    marginTop: 4,
  },
  itemLocation: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  itemActionsSingle: {
    width: '100%',
  },
  approveBtn: {
    flex: 1,
    height: 36,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    height: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    // Used for Approve button (solid green bg → white text)
    // For delete/reject buttons use deleteBtnText below
    color: Theme.colors.white,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
  deleteBtnText: {
    color: Theme.colors.danger,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
  emptyView: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    gap: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontFamily: Theme.fonts.medium,
  },
  userCard: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userMain: {
    flex: 1,
    gap: 2,
  },
  userName: {
    color: Theme.colors.text,
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
  userMeta: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
  },
  roleBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleAdmin: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  roleBadgeText: {
    color: Theme.colors.text,
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    textTransform: 'uppercase',
  },
  // Denied styles
  deniedWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  deniedIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  deniedTitle: {
    fontSize: 22,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  deniedText: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing.xxl,
  },
  testCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  testCardTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  testCardText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Theme.spacing.md,
  },
  testBtn: {
    height: 38,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testBtnText: {
    color: Theme.colors.white,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
});
