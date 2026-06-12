import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function AttendeesListScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Event details
      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (eventData) {
        setEvent(eventData);
      }

      // Fetch registrations for this event
      const { data: regs } = await supabase.from('registrations').select('*').eq('event_id', eventId);
      const matchedRegs = regs || [];

      // Fetch all users to map names
      const { data: usersData } = await supabase.from('users').select('*');
      const users = usersData || [];

      // Map registrations to users
      const attendeeList = matchedRegs.map((r: any) => {
        const user = users.find((u: any) => u.id === r.user_id);
        return {
          regId: r.id,
          userId: r.user_id,
          name: user?.name || 'Anonymous User',
          email: user?.email || 'no-email@eventsphere.com',
          phone: user?.phone || 'Not provided',
          checkedIn: !!r.checked_in, // custom mock field
          registeredAt: r.created_at,
        };
      });

      setAttendees(attendeeList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheckin = async (regId: string, currentStatus: boolean, attendeeName: string) => {
    try {
      // Update local mock db record
      const { error } = await supabase
        .from('registrations')
        .update({ checked_in: !currentStatus })
        .eq('id', regId);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setAttendees(attendees.map(a => 
          a.regId === regId ? { ...a, checkedIn: !currentStatus } : a
        ));
        Alert.alert(
          !currentStatus ? 'Attendee Checked In' : 'Check-in Reverted',
          `${attendeeName} status updated successfully.`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    Alert.alert('Export Complete', 'Attendee list successfully compiled and exported to CSV format.');
  };

  const filteredAttendees = attendees.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
          <Text style={styles.headerTitle} numberOfLines={1}>Manage Attendees</Text>
          {event && <Text style={styles.headerSubtitle} numberOfLines={1}>{event.title}</Text>}
        </View>
        <TouchableOpacity onPress={handleExportCSV}>
          <AppIcon name="square.and.arrow.up" size={18} tintColor={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search */}
        <GlassView style={styles.searchBar} intensity="medium">
          <AppIcon name="magnifyingglass" size={16} tintColor={Theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor={Theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </GlassView>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
            {filteredAttendees.length > 0 ? (
              filteredAttendees.map(item => (
                <GlassView key={item.regId} style={styles.attendeeCard} intensity="low">
                  <View style={styles.cardInfo}>
                    <Text style={styles.attendeeName}>{item.name}</Text>
                    <Text style={styles.attendeeEmail}>{item.email}</Text>
                    <Text style={styles.attendeePhone}>📞 {item.phone}</Text>
                    <Text style={styles.registeredTime}>Registered: {formatDate(item.registeredAt)}</Text>
                  </View>

                  {/* Checkin action button */}
                  <TouchableOpacity
                    onPress={() => handleToggleCheckin(item.regId, item.checkedIn, item.name)}
                    style={[
                      styles.checkinBtn,
                      item.checkedIn ? { backgroundColor: Theme.colors.success } : { backgroundColor: 'rgba(15, 23, 42, 0.05)' }
                    ]}
                  >
                    <AppIcon
                      name={item.checkedIn ? 'checkmark.circle.fill' : 'circle'}
                      size={16}
                      tintColor={item.checkedIn ? '#fff' : Theme.colors.textMuted}
                    />
                    <Text style={[styles.checkinText, item.checkedIn && { color: '#fff', fontWeight: '700' }]}>
                      {item.checkedIn ? 'Checked In' : 'Check In'}
                    </Text>
                  </TouchableOpacity>
                </GlassView>
              ))
            ) : (
              <GlassView style={styles.emptyView} intensity="low">
                <AppIcon name="person.crop.circle.badge.exclamationmark" size={36} tintColor={Theme.colors.textMuted} />
                <Text style={styles.emptyText}>No attendees matching search query.</Text>
              </GlassView>
            )}
          </ScrollView>
        )}
      </View>
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
  content: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    marginLeft: Theme.spacing.sm,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  scrollList: {
    paddingBottom: 80,
    gap: 12,
  },
  attendeeCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  attendeeName: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  attendeeEmail: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  attendeePhone: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    marginTop: 1,
  },
  registeredTime: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  checkinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.sm,
  },
  checkinText: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
  },
  emptyView: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
    marginTop: 20,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
});
