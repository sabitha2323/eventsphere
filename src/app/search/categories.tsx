import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

const CATEGORY_DETAILS = [
  { name: 'Music', description: 'Live concerts, EDM festivals, acoustic gigs, and band performances.', icon: 'music.note', color: '#EC4899' },
  { name: 'Cultural', description: 'Art expos, traditional performances, folk dances, and heritage fairs.', icon: 'globe', color: '#F59E0B' },
  { name: 'College', description: 'Inter-collegiate fests, debates, symposiums, and college events.', icon: 'graduationcap.fill', color: '#10B981' },
  { name: 'Sports', description: 'Tournaments, marathons, athletic meets, and outdoor matches.', icon: 'sportscourt.fill', color: '#3B82F6' },
  { name: 'Technology', description: 'Hackathons, coding challenges, tech talks, and tech exhibitions.', icon: 'cpu', color: '#8B5CF6' },
  { name: 'Food Festival', description: 'Culinary tours, street food truck stalls, and chef masterclasses.', icon: 'fork.knife', color: '#EF4444' },
  { name: 'Workshops', description: 'Interactive learning panels, writing groups, and seminars.', icon: 'hammer.fill', color: '#06B6D4' },
];

export default function CategoriesDirectoryScreen() {
  const router = useRouter();
  const [counts, setCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      const { data } = await supabase.from('events').select('category').eq('is_approved', true);
      if (data) {
        const countsMap = data.reduce((acc: any, curr: any) => {
          acc[curr.category] = (acc[curr.category] || 0) + 1;
          return acc;
        }, {});
        setCounts(countsMap);
      }
    } catch (e) {
      console.error(e);
    }
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
        <Text style={styles.headerTitle}>Categories Directory</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Browse events by category. Select a topic to explore upcoming shows, tournaments, and workshops.
        </Text>

        <View style={styles.grid}>
          {CATEGORY_DETAILS.map(cat => {
            const count = counts[cat.name] || 0;
            return (
              <TouchableOpacity
                key={cat.name}
                onPress={() => router.push(`/search/category-${cat.name.toLowerCase()}` as any)}
                style={styles.cardWrapper}
              >
                <GlassView style={[styles.card, { borderColor: cat.color + '22' }]} intensity="low">
                  <View style={[styles.iconContainer, { backgroundColor: cat.color + '15' }]}>
                    <AppIcon name={cat.icon as any} size={24} tintColor={cat.color} />
                  </View>
                  <Text style={styles.cardName}>{cat.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={3}>{cat.description}</Text>
                  <View style={styles.footerRow}>
                    <Text style={[styles.cardCount, { color: cat.color }]}>
                      {count} {count === 1 ? 'Event' : 'Events'}
                    </Text>
                    <AppIcon name="arrow.right" size={14} tintColor={cat.color} />
                  </View>
                </GlassView>
              </TouchableOpacity>
            );
          })}
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
  backgroundAccent1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: 80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 194, 255, 0.05)',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardWrapper: {
    width: '47%',
    flexGrow: 1,
    marginBottom: 8,
  },
  card: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    height: 200,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
    lineHeight: 15,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardCount: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
});
