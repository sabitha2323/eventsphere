import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';
import { Image } from 'expo-image';

export default function OrganizerDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    totalTickets: 0,
    totalSales: 0,
  });

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const fetchOrganizerData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch events created by user
        const { data: userEvents } = await supabase
          .from('events')
          .select('*')
          .eq('created_by', user.id);
        
        let orgEvents = userEvents || [];

        // For demo/testing, if user hasn't created any events, let them manage all events
        if (orgEvents.length === 0) {
          const { data: allEvents } = await supabase.from('events').select('*');
          orgEvents = allEvents || [];
        }

        setEvents(orgEvents);

        // Fetch overall registrations and compute metrics
        const db = await supabase.from('registrations').select('*');
        const regs = db.data || [];
        
        let ticketCount = 0;
        let salesValue = 0;

        orgEvents.forEach((ev: any) => {
          const matchedRegs = regs.filter((r: any) => r.event_id === ev.id);
          ticketCount += matchedRegs.length;
          salesValue += matchedRegs.length * ev.ticket_price;
        });

        setMetrics({
          totalEvents: orgEvents.length,
          totalTickets: ticketCount,
          totalSales: salesValue,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AppIcon name="chevron.left" size={20} tintColor={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Organizer Console</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/create')}>
          <AppIcon name="plus.circle.fill" size={22} tintColor={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Metric Cards Row */}
        <View style={styles.metricsRow}>
          <GlassView style={styles.metricCard} intensity="low">
            <AppIcon name="calendar" size={20} tintColor={Theme.colors.primary} />
            <Text style={styles.metricValue}>{metrics.totalEvents}</Text>
            <Text style={styles.metricLabel}>Hosted Events</Text>
          </GlassView>
          <GlassView style={styles.metricCard} intensity="low">
            <AppIcon name="ticket" size={20} tintColor={Theme.colors.secondary} />
            <Text style={styles.metricValue}>{metrics.totalTickets}</Text>
            <Text style={styles.metricLabel}>Tickets Sold</Text>
          </GlassView>
          <GlassView style={styles.metricCard} intensity="low">
            <AppIcon name="indianrupeesign" size={20} tintColor={Theme.colors.success} />
            <Text style={styles.metricValue}>₹{metrics.totalSales}</Text>
            <Text style={styles.metricLabel}>Gross Sales</Text>
          </GlassView>
        </View>

        {/* Console Hub Navigation Options */}
        <View style={styles.hubContainer}>
          <TouchableOpacity onPress={() => router.push('/organizer/analytics' as any)} style={styles.hubBtn}>
            <GlassView style={styles.hubBtnInner} intensity="medium">
              <AppIcon name="chart.bar.xaxis" size={18} tintColor={Theme.colors.primary} />
              <Text style={styles.hubBtnText}>Sales Analytics</Text>
            </GlassView>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/organizer/promocodes' as any)} style={styles.hubBtn}>
            <GlassView style={styles.hubBtnInner} intensity="medium">
              <AppIcon name="tag" size={18} tintColor={Theme.colors.secondary} />
              <Text style={styles.hubBtnText}>Promo Coupons</Text>
            </GlassView>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/organizer/payouts' as any)} style={styles.hubBtn}>
            <GlassView style={styles.hubBtnInner} intensity="medium">
              <AppIcon name="creditcard" size={18} tintColor={Theme.colors.success} />
              <Text style={styles.hubBtnText}>Payout Settings</Text>
            </GlassView>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>My Hosted Events</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 20 }} />
        ) : events.length > 0 ? (
          events.map(item => {
            const catColor = (Theme.colors.categories as any)[item.category] || Theme.colors.primary;
            return (
              <GlassView key={item.id} style={styles.eventCard} intensity="low">
                <View style={styles.eventInfoRow}>
                  <Image source={{ uri: item.image_url }} style={styles.eventImage} contentFit="cover" />
                  <View style={styles.eventMainDetails}>
                    <Text style={[styles.eventCatText, { color: catColor }]}>{item.category}</Text>
                    <Text style={styles.eventTitleText} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.eventDateText}>{formatDate(item.date)} • {item.venue.split(',')[0]}</Text>
                  </View>
                </View>

                {/* Event Actions Quick Grid */}
                <View style={styles.actionsGrid}>
                  <TouchableOpacity
                    onPress={() => router.push(`/organizer/attendees-${item.id}` as any)}
                    style={styles.actionBtn}
                  >
                    <AppIcon name="person.3" size={14} tintColor={Theme.colors.textSecondary} />
                    <Text style={styles.actionBtnText}>Attendees</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/organizer/checkin-${item.id}` as any)}
                    style={styles.actionBtn}
                  >
                    <AppIcon name="qrcode.viewfinder" size={14} tintColor={Theme.colors.textSecondary} />
                    <Text style={styles.actionBtnText}>QR Check-in</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/organizer/ticket-types-${item.id}` as any)}
                    style={styles.actionBtn}
                  >
                    <AppIcon name="ticket" size={14} tintColor={Theme.colors.textSecondary} />
                    <Text style={styles.actionBtnText}>Tiers</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/organizer/email-broadcast-${item.id}` as any)}
                    style={styles.actionBtn}
                  >
                    <AppIcon name="envelope" size={14} tintColor={Theme.colors.textSecondary} />
                    <Text style={styles.actionBtnText}>Broadcast</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/organizer/edit-${item.id}` as any)}
                    style={styles.actionBtn}
                  >
                    <AppIcon name="pencil" size={14} tintColor={Theme.colors.textSecondary} />
                    <Text style={styles.actionBtnText}>Edit Info</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/organizer/collaborators-${item.id}` as any)}
                    style={styles.actionBtn}
                  >
                    <AppIcon name="person.badge.plus" size={14} tintColor={Theme.colors.textSecondary} />
                    <Text style={styles.actionBtnText}>Co-Hosts</Text>
                  </TouchableOpacity>
                </View>
              </GlassView>
            );
          })
        ) : (
          <GlassView style={styles.emptyCard} intensity="low">
            <Text style={styles.emptyText}>You haven't created any events yet.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(tabs)/create')}>
              <Text style={styles.createBtnText}>Create Event</Text>
            </TouchableOpacity>
          </GlassView>
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
  backgroundAccent1: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: 80,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 194, 255, 0.04)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Theme.spacing.lg,
  },
  metricCard: {
    flex: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
    textAlign: 'center',
  },
  hubContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Theme.spacing.xl,
  },
  hubBtn: {
    flex: 1,
  },
  hubBtnInner: {
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    gap: 6,
  },
  hubBtnText: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  eventInfoRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
    paddingBottom: Theme.spacing.sm,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: Theme.borderRadius.sm,
  },
  eventMainDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  eventCatText: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  eventTitleText: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginTop: 2,
  },
  eventDateText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: Theme.spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    width: '31%',
    flexGrow: 1,
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  emptyCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    gap: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
  createBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.primary,
  },
  createBtnText: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: '#fff',
  },
});
