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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function DigitalTicketScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const ticketId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [purchaser, setPurchaser] = useState<any>(null);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setPurchaser(user);
      }

      // Try fetching from public database
      const { data: reg, error } = await supabase
        .from('registrations')
        .select('*, events(*)')
        .eq('id', ticketId)
        .single();

      if (reg) {
        setTicket(reg);
        setEvent(reg.events);
      } else {
        // Fallback for mock/offline validation
        setTicket({
          id: ticketId || 'reg-987654321',
          created_at: new Date().toISOString(),
        });
        setEvent({
          title: 'Neon Beats Music Festival',
          category: 'Music',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          time: '18:00 - 23:30',
          venue: 'Grand Arena Plaza, Chennai',
          organizer: 'Beatwave Events',
          ticket_price: 1499.00,
        });
      }
    } catch (err) {
      console.warn('Failed to load ticket from database, using placeholder fallback.', err);
      setTicket({
        id: ticketId || 'reg-987654321',
        created_at: new Date().toISOString(),
      });
      setEvent({
        title: 'Neon Beats Music Festival',
        category: 'Music',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        time: '18:00 - 23:30',
        venue: 'Grand Arena Plaza, Chennai',
        organizer: 'Beatwave Events',
        ticket_price: 1499.00,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}>
          <AppIcon name="chevron.left" size={20} tintColor={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Event Pass</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Main Ticket Layout */}
          <GlassView style={styles.ticketCard} intensity="high">
            {/* Header info */}
            <View style={styles.ticketHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{event?.category?.toUpperCase() || 'EVENT'}</Text>
              </View>
              <Text style={styles.organizerText}>Presented by {event?.organizer || 'Organizers'}</Text>
            </View>

            <Text style={styles.eventTitle}>{event?.title || 'Unknown Event'}</Text>

            <View style={styles.dividerLine} />

            {/* Info details */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <AppIcon name="calendar" size={14} tintColor={Theme.colors.primary} />
                <View>
                  <Text style={styles.detailLabel}>DATE</Text>
                  <Text style={styles.detailValue}>
                    {event?.date ? new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <AppIcon name="clock" size={14} tintColor={Theme.colors.primary} />
                <View>
                  <Text style={styles.detailLabel}>TIME</Text>
                  <Text style={styles.detailValue}>{event?.time || 'N/A'}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.detailItem, { marginTop: 14 }]}>
              <AppIcon name="mappin.and.ellipse" size={14} tintColor={Theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>VENUE</Text>
                <Text style={styles.detailValue} numberOfLines={2}>{event?.venue || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.dividerLine} />

            {/* Tear-off Ticket Stub section */}
            <View style={styles.stubContainer}>
              {/* Simulated QR/Barcode visual */}
              <View style={styles.barcodeBox}>
                <View style={styles.simulatedBarcode}>
                  {/* Generate stripes of barcode */}
                  <View style={[styles.barcodeLine, { width: 3 }]} />
                  <View style={[styles.barcodeLine, { width: 1 }]} />
                  <View style={[styles.barcodeLine, { width: 4 }]} />
                  <View style={[styles.barcodeLine, { width: 2 }]} />
                  <View style={[styles.barcodeLine, { width: 1 }]} />
                  <View style={[styles.barcodeLine, { width: 3 }]} />
                  <View style={[styles.barcodeLine, { width: 2 }]} />
                  <View style={[styles.barcodeLine, { width: 1 }]} />
                  <View style={[styles.barcodeLine, { width: 4 }]} />
                  <View style={[styles.barcodeLine, { width: 2 }]} />
                  <View style={[styles.barcodeLine, { width: 1 }]} />
                  <View style={[styles.barcodeLine, { width: 3 }]} />
                  <View style={[styles.barcodeLine, { width: 1 }]} />
                  <View style={[styles.barcodeLine, { width: 4 }]} />
                  <View style={[styles.barcodeLine, { width: 2 }]} />
                  <View style={[styles.barcodeLine, { width: 1 }]} />
                  <View style={[styles.barcodeLine, { width: 3 }]} />
                  <View style={[styles.barcodeLine, { width: 2 }]} />
                </View>
                <Text style={styles.ticketNumber}>
                  TICKET ID: {ticketId.substring(0, 18).toUpperCase() || 'MOCK-REG-STUB'}
                </Text>
              </View>

              <View style={styles.attendeeDetails}>
                <Text style={styles.attendeeLabel}>ATTENDEE</Text>
                <Text style={styles.attendeeName}>{purchaser?.email ? purchaser.email.split('@')[0].toUpperCase() : 'EVENT SPHERE VISITOR'}</Text>
              </View>
            </View>

          </GlassView>

          {/* Digital Pass Wallet Shortcut */}
          <TouchableOpacity
            style={styles.walletBtn}
            onPress={() => router.push('/ticket/pass-wallet')}
          >
            <AppIcon name="qrcode.viewfinder" size={16} tintColor={Theme.colors.white} />
            <Text style={styles.walletText}>Open Interactive 3D Digital Wallet Pass</Text>
          </TouchableOpacity>

          {/* Refund Trigger & Home buttons */}
          <TouchableOpacity
            style={styles.refundBtn}
            onPress={() => router.push(`/ticket/refund/${ticketId}` as any)}
          >
            <AppIcon name="arrow.uturn.left.circle" size={16} tintColor={Theme.colors.danger} />
            <Text style={styles.refundText}>Cancel Ticket & Request Refund</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.homeText}>Back to Dashboard</Text>
          </TouchableOpacity>

        </ScrollView>
      )}
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
    gap: 16,
    alignItems: 'center',
  },
  ticketCard: {
    width: '100%',
    maxWidth: 360,
    padding: Theme.spacing.lg,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Theme.colors.primary + '15',
    borderRadius: Theme.borderRadius.sm,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
  },
  organizerText: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  eventTitle: {
    fontSize: 20,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    lineHeight: 26,
    marginBottom: Theme.spacing.md,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginVertical: Theme.spacing.md,
    borderStyle: 'dashed',
    ...Platform.select({
      web: {
        borderStyle: 'dashed',
      } as any,
    }),
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 8,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  stubContainer: {
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
  },
  barcodeBox: {
    alignItems: 'center',
    gap: 6,
  },
  simulatedBarcode: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'stretch',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    paddingHorizontal: 8,
  },
  barcodeLine: {
    backgroundColor: '#0f172a',
    marginHorizontal: 1,
  },
  ticketNumber: {
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  attendeeDetails: {
    alignItems: 'center',
    gap: 2,
  },
  attendeeLabel: {
    fontSize: 8,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
  },
  attendeeName: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 360,
    height: 44,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    marginTop: 12,
  },
  walletText: {
    color: Theme.colors.white,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
  refundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    marginTop: 12,
  },
  refundText: {
    color: Theme.colors.danger,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
  homeBtn: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    textDecorationLine: 'underline',
  },
});
