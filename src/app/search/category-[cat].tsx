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
import { Image } from 'expo-image';

const CATEGORY_META: any = {
  music: { title: 'Music Festivals & Gigs', desc: 'Find live concerts, DJ tours, EDM stages, and acoustic nights.', icon: 'music.note', color: '#EC4899', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800' },
  cultural: { title: 'Cultural Exhibitions & Fairs', desc: 'Explore regional folklore, traditional arts, craft markets, and food fests.', icon: 'globe', color: '#F59E0B', cover: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800' },
  college: { title: 'College symposiums & Fests', desc: 'Interact with student competitions, sports matches, and cultural fests.', icon: 'graduationcap.fill', color: '#10B981', cover: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800' },
  sports: { title: 'Sports Matches & Runs', desc: 'Track tournaments, athletic runs, football cups, and team matches.', icon: 'sportscourt.fill', color: '#3B82F6', cover: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800' },
  technology: { title: 'Tech Talks & Hackathons', desc: 'Join hackathons, AI workshops, developer meetups, and gadgets expos.', icon: 'cpu', color: '#8B5CF6', cover: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800' },
  'food festival': { title: 'Food & Gourmet Festivals', desc: 'Indulge in street food crawls, gourmet trucks, baking and culinary expos.', icon: 'fork.knife', color: '#EF4444', cover: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800' },
  workshops: { title: 'Interactive Learning Workshops', desc: 'Hone your writing, arts, business skills, or design methodologies.', icon: 'hammer.fill', color: '#06B6D4', cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800' },
};

export default function CategoryScreen() {
  const router = useRouter();
  const { cat } = useLocalSearchParams();
  const categoryKey = String(cat || '').toLowerCase();
  
  const meta = CATEGORY_META[categoryKey] || {
    title: String(cat || 'Category'),
    desc: 'Explore upcoming community events in this category.',
    icon: 'calendar',
    color: Theme.colors.primary,
    cover: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800',
  };

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [categoryKey]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Find category database mapping
      const categoryName = Object.keys(Theme.colors.categories).find(
        key => key.toLowerCase() === categoryKey
      ) || categoryKey;

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('category', categoryName)
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
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Banner */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: meta.cover }} style={styles.coverImage} contentFit="cover" />
          <View style={styles.overlay} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <AppIcon name="chevron.left" size={20} tintColor="#fff" />
          </TouchableOpacity>
          <View style={styles.metaContainer}>
            <View style={[styles.iconContainer, { backgroundColor: meta.color }]}>
              <AppIcon name={meta.icon} size={20} tintColor="#fff" />
            </View>
            <Text style={styles.coverTitle}>{meta.title}</Text>
            <Text style={styles.coverDesc}>{meta.desc}</Text>
          </View>
        </View>

        {/* Event List */}
        <View style={styles.listWrapper}>
          <Text style={styles.sectionTitle}>Upcoming Activities ({events.length})</Text>

          {loading ? (
            <ActivityIndicator size="large" color={meta.color} style={{ marginTop: 40 }} />
          ) : events.length > 0 ? (
            events.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/event/${item.id}`)}
                style={styles.eventCard}
              >
                <GlassView style={styles.eventCardInner} intensity="low">
                  <Image source={{ uri: item.image_url }} style={styles.eventImage} contentFit="cover" />
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.eventOrganizer}>Hosted by {item.organizer}</Text>
                    
                    <View style={styles.metaRow}>
                      <AppIcon name="calendar" size={12} tintColor={Theme.colors.textMuted} />
                      <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                      <Text style={styles.bullet}>•</Text>
                      <AppIcon name="mappin" size={12} tintColor={Theme.colors.textMuted} />
                      <Text style={styles.metaText} numberOfLines={1}>{item.venue.split(',')[0]}</Text>
                    </View>

                    <View style={styles.bottomRow}>
                      <Text style={[styles.eventPrice, { color: meta.color }]}>
                        {item.ticket_price === 0 ? 'Free' : `₹${item.ticket_price}`}
                      </Text>
                      <View style={[styles.actionBadge, { backgroundColor: meta.color + '15' }]}>
                        <Text style={[styles.actionBadgeText, { color: meta.color }]}>Join</Text>
                      </View>
                    </View>
                  </View>
                </GlassView>
              </TouchableOpacity>
            ))
          ) : (
            <GlassView style={styles.emptyCard} intensity="low">
              <AppIcon name="calendar.badge.exclamationmark" size={40} tintColor={Theme.colors.textMuted} />
              <Text style={styles.emptyText}>No events in this category yet.</Text>
            </GlassView>
          )}
        </View>
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
  scrollContent: {
    paddingBottom: 100,
  },
  coverWrapper: {
    height: 250,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: Theme.spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaContainer: {
    padding: Theme.spacing.lg,
    gap: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  coverTitle: {
    fontSize: 22,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: '#fff',
  },
  coverDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Theme.fonts.regular,
    lineHeight: 16,
  },
  listWrapper: {
    padding: Theme.spacing.lg,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  eventCard: {
    marginBottom: 8,
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
  eventTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  eventOrganizer: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  bullet: {
    color: Theme.colors.textMuted,
    fontSize: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  eventPrice: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  actionBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.round,
  },
  actionBadgeText: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  emptyCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    gap: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: 20,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
});
