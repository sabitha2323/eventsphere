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
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';

export default function SavedEventsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  const fetchSavedEvents = async () => {
    setLoading(true);
    try {
      // Load saved IDs from storage
      let savedIds: string[] = [];
      const stored = Platform.OS === 'web'
        ? (typeof window !== 'undefined' ? window.localStorage.getItem('eventsphere_saved_events') : null)
        : await SecureStore.getItemAsync('eventsphere_saved_events');

      if (stored) {
        savedIds = JSON.parse(stored);
      }

      if (savedIds.length > 0) {
        // Query approved events matching saved IDs
        const { data } = await supabase.from('events').select('*').eq('is_approved', true);
        if (data) {
          const filtered = data.filter((e: any) => savedIds.includes(e.id));
          setEvents(filtered);
        }
      } else {
        setEvents([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (eventId: string, title: string) => {
    try {
      let savedIds: string[] = [];
      const stored = Platform.OS === 'web'
        ? (typeof window !== 'undefined' ? window.localStorage.getItem('eventsphere_saved_events') : null)
        : await SecureStore.getItemAsync('eventsphere_saved_events');

      if (stored) {
        savedIds = JSON.parse(stored);
      }

      const updated = savedIds.filter(id => id !== eventId);

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('eventsphere_saved_events', JSON.stringify(updated));
        }
      } else {
        await SecureStore.setItemAsync('eventsphere_saved_events', JSON.stringify(updated));
      }

      setEvents(events.filter(e => e.id !== eventId));
      Alert.alert('Removed', `"${title}" removed from your bookmarked list.`);
    } catch (e) {
      console.error(e);
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
        <Text style={styles.headerTitle}>My Bookmarks</Text>
        <Text style={styles.headerCount}>{events.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Your saved events and bookmarks. You will receive notifications when registration deadlines or events approach.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : events.length > 0 ? (
          events.map(item => {
            const catColor = (Theme.colors.categories as any)[item.category] || Theme.colors.primary;
            return (
              <GlassView key={item.id} style={styles.eventCardInner} intensity="low">
                <Image source={{ uri: item.image_url }} style={styles.eventImage} contentFit="cover" />
                <View style={styles.eventDetails}>
                  <View style={styles.topRow}>
                    <Text style={[styles.eventCategory, { color: catColor }]}>{item.category}</Text>
                    <TouchableOpacity onPress={() => handleUnsave(item.id, item.title)} style={styles.unsaveBtn}>
                      <AppIcon name="bookmark.fill" size={16} tintColor={Theme.colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => router.push(`/event/${item.id}`)}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.eventMeta} numberOfLines={1}>📍 {item.venue.split(',')[0]}</Text>

                  <View style={styles.bottomRow}>
                    <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
                    <Text style={styles.eventPrice}>
                      {item.ticket_price === 0 ? 'Free' : `₹${item.ticket_price}`}
                    </Text>
                  </View>
                </View>
              </GlassView>
            );
          })
        ) : (
          <GlassView style={styles.emptyCard} intensity="low">
            <AppIcon name="bookmark.slash.fill" size={40} tintColor={Theme.colors.textMuted} />
            <Text style={styles.emptyText}>You haven't saved any events yet.</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.exploreBtnText}>Browse Events</Text>
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
  headerCount: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.primary,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    lineHeight: 20,
    marginBottom: Theme.spacing.lg,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  eventCardInner: {
    flexDirection: 'row',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  eventImage: {
    width: 90,
    height: 90,
    borderRadius: Theme.borderRadius.sm,
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventCategory: {
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  unsaveBtn: {
    padding: 4,
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  eventMeta: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  eventPrice: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.secondary,
  },
  emptyCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.md,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
  exploreBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.primary,
  },
  exploreBtnText: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: '#fff',
  },
});
