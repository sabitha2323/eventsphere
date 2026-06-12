import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function CheckinScannerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [activeScan, setActiveScan] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (eventData) setEvent(eventData);

      const { data: regs } = await supabase.from('registrations').select('*').eq('event_id', eventId);
      const { data: usersData } = await supabase.from('users').select('*');

      const matched = (regs || []).map((r: any) => {
        const user = (usersData || []).find((u: any) => u.id === r.user_id);
        return {
          regId: r.id,
          name: user?.name || 'Anonymous User',
          email: user?.email || 'no-email@eventsphere.com',
          checkedIn: !!r.checked_in,
        };
      });

      setAttendees(matched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = async (attendee: any) => {
    setActiveScan(true);
    setScanResult(null);

    // Simulate camera check-in scan delay (1 second)
    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('registrations')
          .update({ checked_in: true })
          .eq('id', attendee.regId);

        if (error) {
          Alert.alert('Scan Failed', error.message);
          setActiveScan(false);
        } else {
          setAttendees(attendees.map(a => 
            a.regId === attendee.regId ? { ...a, checkedIn: true } : a
          ));
          setScanResult({
            name: attendee.name,
            email: attendee.email,
            status: 'success',
            message: 'Checked In Successfully!',
          });
          setActiveScan(false);
        }
      } catch (e) {
        console.error(e);
        setActiveScan(false);
      }
    }, 1200);
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>QR Scanner Simulator</Text>
          {event && <Text style={styles.headerSubtitle} numberOfLines={1}>{event.title}</Text>}
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Viewfinder simulation */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.mockCameraBg}>
            <AppIcon name="camera.fill" size={32} tintColor="rgba(255,255,255,0.4)" />
            <Text style={styles.viewfinderText}>Simulated Lens View</Text>
            
            {/* Viewfinder corners styling */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Pulsing scan line */}
            <View style={styles.scanLine} />

            {activeScan && (
              <View style={styles.scanningOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.scanningLabel}>Reading QR code...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Scan Result Notice */}
        {scanResult && (
          <GlassView style={[styles.resultCard, { borderColor: Theme.colors.success + '44' }]} intensity="high">
            <AppIcon name="checkmark.circle.fill" size={26} tintColor={Theme.colors.success} />
            <View style={styles.resultDetails}>
              <Text style={styles.resultHeading}>{scanResult.message}</Text>
              <Text style={styles.resultName}>{scanResult.name}</Text>
              <Text style={styles.resultEmail}>{scanResult.email}</Text>
            </View>
            <TouchableOpacity onPress={() => setScanResult(null)} style={styles.closeResultBtn}>
              <AppIcon name="xmark" size={14} tintColor={Theme.colors.textMuted} />
            </TouchableOpacity>
          </GlassView>
        )}

        {/* List of attendees to simulate scanning */}
        <Text style={styles.sectionLabel}>Select Attendee to Simulate QR Scan</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        ) : (
          <View style={styles.attendeesList}>
            {attendees.length > 0 ? (
              attendees.map(item => (
                <TouchableOpacity
                  key={item.regId}
                  onPress={() => !item.checkedIn && !activeScan && handleSimulateScan(item)}
                  style={styles.simulateCard}
                  disabled={item.checkedIn || activeScan}
                >
                  <GlassView style={styles.simulateCardInner} intensity="low">
                    <View style={styles.simInfo}>
                      <Text style={styles.simName}>{item.name}</Text>
                      <Text style={styles.simEmail}>{item.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, item.checkedIn && styles.statusBadgeActive]}>
                      {item.checkedIn ? (
                        <AppIcon name="checkmark" size={12} tintColor="#fff" />
                      ) : (
                        <Text style={styles.statusBadgeText}>Scan QR</Text>
                      )}
                    </View>
                  </GlassView>
                </TouchableOpacity>
              ))
            ) : (
              <GlassView style={styles.emptyView} intensity="low">
                <Text style={styles.emptyText}>No registered attendees found.</Text>
              </GlassView>
            )}
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
    gap: 16,
  },
  viewfinderContainer: {
    alignItems: 'center',
    marginVertical: Theme.spacing.md,
  },
  mockCameraBg: {
    width: '100%',
    maxWidth: 320,
    height: 220,
    backgroundColor: '#1E293B',
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  viewfinderText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    marginTop: 8,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: Theme.colors.primary,
  },
  cornerTL: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: 'rgba(124, 58, 237, 0.7)',
    top: '50%',
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scanningLabel: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.md,
    borderWidth: 1,
  },
  resultDetails: {
    flex: 1,
  },
  resultHeading: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.success,
  },
  resultName: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginTop: 2,
  },
  resultEmail: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  closeResultBtn: {
    padding: 6,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  attendeesList: {
    gap: 8,
  },
  simulateCard: {
    width: '100%',
  },
  simulateCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  simInfo: {
    flex: 1,
  },
  simName: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  simEmail: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.primary + '15',
  },
  statusBadgeActive: {
    backgroundColor: Theme.colors.success,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  statusBadgeText: {
    color: Theme.colors.primary,
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  emptyView: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
});
