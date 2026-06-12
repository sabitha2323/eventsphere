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

export default function TrendingEventsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchTrendingEvents();
  }, []);

  const fetchTrendingEvents = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('events').select('*').eq('is_approved', true);
      if (data) {
        // Add a mock trending score and sort by it
        const withTrending = data.map((e: any, idx: number) => ({
          ...e,
          // Calculate mock score based on ticket price and id characters to remain stable
          score: 85 + (e.title.charCodeAt(0) % 15) - (idx * 2),
          views: 450 + (e.title.charCodeAt(1) % 50) * 8,
        }));
        withTrending.sort((a: any, b: any) => b.score - a.score);
        setEvents(withTrending);
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

  const getRankStyle = (index: number) => {
    if (index === 0) return { bg: '#F59E0B', text: '#fff', label: 'Gold' };
    if (index === 1) return { bg: '#94A3B8', text: '#fff', label: 'Silver' };
    if (index === 2) return { bg: '#B45309', text: '#fff', label: 'Bronze' };
    return { bg: 'rgba(15, 23, 42, 0.08)', text: Theme.colors.textSecondary, label: '' };
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
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Trending Now</Text>
          <AppIcon name="flame.fill" size={18} tintColor={Theme.colors.categories.Music} />
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          The most popular and highly anticipated events this week. Ranked by registration demand and view traffic.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : events.length > 0 ? (
          events.map((item, index) => {
            const rank = getRankStyle(index);
            const catColor = (Theme.colors.categories as any)[item.category] || Theme.colors.primary;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/event/${item.id}`)}
                style={styles.eventCard}
              >
                <GlassView style={styles.eventCardInner} intensity="low">
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: item.image_url }} style={styles.eventImage} contentFit="cover" />
                    {/* Rank Badge */}
                    <View style={[styles.rankBadge, { backgroundColor: rank.bg }]}>
                      <Text style={[styles.rankText, { color: rank.text }]}>#{index + 1}</Text>
                    </View>
                  </View>

                  <View style={styles.eventDetails}>
                    <View style={styles.topRow}>
                      <Text style={[styles.eventCategory, { color: catColor }]}>{item.category}</Text>
                      <View style={styles.scoreRow}>
                        <AppIcon name="sparkles" size={10} tintColor={Theme.colors.warning} />
                        <Text style={styles.scoreText}>{item.score}% Hot</Text>
                      </View>
                    </View>

                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.eventMeta}>{formatDate(item.date)} • {item.venue.split(',')[0]}</Text>

                    {/* Popularity bar */}
                    <View style={styles.popularityBarContainer}>
                      <View style={[styles.popularityBar, { width: `${item.score}%`, backgroundColor: catColor }]} />
                    </View>

                    <View style={styles.bottomRow}>
                      <Text style={styles.viewsCount}>🔥 {item.views} Views</Text>
                      <Text style={styles.eventPrice}>
                        {item.ticket_price === 0 ? 'Free' : `₹${item.ticket_price}`}
                      </Text>
                    </View>
                  </View>
                </GlassView>
              </TouchableOpacity>
            );
          })
        ) : (
          <GlassView style={styles.emptyCard} intensity="low">
            <Text style={styles.emptyText}>No approved events found.</Text>
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
    backgroundColor: 'rgba(236, 72, 153, 0.04)', // Pink/Music accent
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    marginBottom: Theme.spacing.md,
  },
  eventCardInner: {
    flexDirection: 'row',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.md,
  },
  imageWrapper: {
    position: 'relative',
  },
  eventImage: {
    width: 90,
    height: 95,
    borderRadius: Theme.borderRadius.sm,
  },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  rankText: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
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
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.warning,
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
    marginTop: 2,
  },
  eventMeta: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 1,
  },
  popularityBarContainer: {
    height: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  popularityBar: {
    height: '100%',
    borderRadius: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  viewsCount: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.medium,
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
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
});
