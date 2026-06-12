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

export default function FreeEventsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchFreeEvents();
  }, []);

  const fetchFreeEvents = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('ticket_price', 0)
        .eq('is_approved', true)
        .order('date', { ascending: true });

      if (data) {
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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
        <Text style={styles.headerTitle}>Free Entry Events</Text>
        <AppIcon name="sparkles" size={18} tintColor={Theme.colors.success} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Discover cultural exhibitions, guest webinars, sports matches, and local meetups that require zero ticket costs. Register to save your slot!
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : events.length > 0 ? (
          events.map(item => {
            const catColor = (Theme.colors.categories as any)[item.category] || Theme.colors.primary;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/event/${item.id}`)}
                style={styles.eventCard}
              >
                <GlassView style={styles.eventCardInner} intensity="low">
                  <Image source={{ uri: item.image_url }} style={styles.eventImage} contentFit="cover" />
                  <View style={styles.eventDetails}>
                    <View style={styles.topRow}>
                      <Text style={[styles.eventCategory, { color: catColor }]}>{item.category}</Text>
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>FREE</Text>
                      </View>
                    </View>

                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    
                    <View style={styles.metaRow}>
                      <AppIcon name="mappin" size={12} tintColor={Theme.colors.textMuted} />
                      <Text style={styles.metaText} numberOfLines={1}>{item.venue}</Text>
                    </View>

                    <View style={styles.bottomRow}>
                      <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
                      <View style={[styles.registerBtn, { backgroundColor: Theme.colors.success }]}>
                        <Text style={styles.registerBtnText}>Register Now</Text>
                      </View>
                    </View>
                  </View>
                </GlassView>
              </TouchableOpacity>
            );
          })
        ) : (
          <GlassView style={styles.emptyCard} intensity="low">
            <AppIcon name="tag.slash" size={40} tintColor={Theme.colors.textMuted} />
            <Text style={styles.emptyText}>No free events found.</Text>
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
    backgroundColor: 'rgba(16, 185, 129, 0.04)', // Success/Green accent
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
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
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
  eventCard: {
    marginBottom: Theme.spacing.sm,
  },
  eventCardInner: {
    flexDirection: 'row',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.md,
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
  freeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeBadgeText: {
    color: Theme.colors.success,
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
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
  registerBtn: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  registerBtnText: {
    fontSize: 11,
    color: '#fff',
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  emptyCard: {
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
