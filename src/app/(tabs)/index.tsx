import { AppIcon } from '@/components/AppIcon';
import { GlassView } from '@/components/GlassView';
import { Theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const CATEGORIES = [
  'All',
  'Music',
  'Cultural',
  'College',
  'Sports',
  'Technology',
  'Food Festival',
  'Workshops',
  'Seminar',
  'Hackathon',
];

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  image_url: string;
  ticket_price: number;
}

export default function HomeScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_approved', true)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error.message);
      } else {
        setEvents(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredEvents = events.slice(0, 3); // Seed/Mock first 3 as featured

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const renderCategoryItem = ({ item }: { item: string }) => {
    const isSelected = selectedCategory === item;
    return (
      <TouchableOpacity
        style={[
          styles.categoryBtn,
          isSelected && styles.categoryBtnSelected,
          isSelected && { backgroundColor: Theme.colors.primary },
        ]}
        onPress={() => setSelectedCategory(item)}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextSelected,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFeaturedCard = ({ item }: { item: Event }) => {
    // Dynamic border color based on category
    const catColor = (Theme.colors.categories as any)[item.category] || Theme.colors.primary;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/event/${item.id}`)}
        style={[styles.featuredCard, { borderColor: catColor + '33' }]}
      >
        <Image
          source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600' }}
          style={styles.featuredImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={300}
        />
        <View style={styles.featuredTagContainer}>
          <Text style={[styles.featuredTagText, { backgroundColor: catColor }]}>
            {item.category}
          </Text>
        </View>
        <GlassView style={styles.featuredMeta} intensity="high">
          <Text style={styles.featuredTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.featuredRow}>
            <View style={styles.metaItem}>
              <AppIcon name="calendar" size={14} tintColor={Theme.colors.secondary} />
              <Text style={styles.metaText}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.metaItem}>
              <AppIcon name="mappin.circle" size={14} tintColor={Theme.colors.secondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.venue.split(',')[0]}
              </Text>
            </View>
          </View>
        </GlassView>
      </TouchableOpacity>
    );
  };

  const renderEventItem = ({ item }: { item: Event }) => {
    const catColor = (Theme.colors.categories as any)[item.category] || Theme.colors.primary;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/event/${item.id}`)}
        style={styles.eventCard}
      >
        <GlassView style={styles.eventCardInner} intensity="low">
          <Image
            source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600' }}
            style={styles.eventImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={300}
          />
          <View style={styles.eventDetails}>
            <View style={styles.eventHeaderRow}>
              <Text style={[styles.eventCategory, { color: catColor }]}>
                {item.category}
              </Text>
              <Text style={styles.eventPrice}>
                {item.ticket_price === 0 ? 'Free' : `₹${item.ticket_price}`}
              </Text>
            </View>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.eventMetaRow}>
              <AppIcon name="calendar" size={12} tintColor={Theme.colors.textMuted} />
              <Text style={styles.eventMetaText}>{formatDate(item.date)}</Text>
              <Text style={styles.bullet}>•</Text>
              <AppIcon name="clock" size={12} tintColor={Theme.colors.textMuted} />
              <Text style={styles.eventMetaText}>{item.time.split(' ')[0]}</Text>
            </View>
            <View style={styles.eventLocationRow}>
              <AppIcon name="mappin" size={12} tintColor={Theme.colors.textMuted} />
              <Text style={styles.eventMetaText} numberOfLines={1}>
                {item.venue}
              </Text>
            </View>
          </View>
        </GlassView>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      {/* Static Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>EventSphere</Text>
          <Text style={styles.taglineText}>Plan, Discover and Manage Events Effortlessly</Text>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
        }
        contentContainerStyle={styles.scrollList}
        ListHeaderComponent={
          <View>
            {/* AI Concierge Shortcut Banner */}
            <TouchableOpacity
              style={styles.aiBanner}
              onPress={() => router.push('/ai-assistant')}
            >
              <GlassView style={styles.aiBannerInner}>
                <View style={styles.aiBannerTextGroup}>
                  <Text style={styles.aiBannerTitle}>✨ AI Event Concierge Assistant</Text>
                  <Text style={styles.aiBannerSub}>Ask AI for instant event recommendations, venues & ticketing</Text>
                </View>
                <AppIcon name="chevron.right" size={18} tintColor={Theme.colors.primary} />
              </GlassView>
            </TouchableOpacity>

            {/* Premium Features Quick Navigation Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginVertical: Theme.spacing.sm }}>
              <TouchableOpacity
                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(124, 58, 237, 0.12)', borderRadius: 10, borderWidth: 1, borderColor: '#7C3AED', alignItems: 'center' }}
                onPress={() => router.push('/ticket/ar-pass')}
              >
                <Text style={{ fontSize: 11, fontFamily: Theme.fonts.bold, color: '#7C3AED' }}>💎 3D VIP Pass</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(37, 99, 235, 0.12)', borderRadius: 10, borderWidth: 1, borderColor: '#2563EB', alignItems: 'center' }}
                onPress={() => router.push('/checkout/seat-selection')}
              >
                <Text style={{ fontSize: 11, fontFamily: Theme.fonts.bold, color: '#2563EB' }}>💺 Seat Picker</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(16, 185, 129, 0.12)', borderRadius: 10, borderWidth: 1, borderColor: '#10B981', alignItems: 'center' }}
                onPress={() => router.push('/checkout/razorpay')}
              >
                <Text style={{ fontSize: 11, fontFamily: Theme.fonts.bold, color: '#10B981' }}>💳 Razorpay Pro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(245, 158, 11, 0.12)', borderRadius: 10, borderWidth: 1, borderColor: '#F59E0B', alignItems: 'center' }}
                onPress={() => router.push('/social/rewards')}
              >
                <Text style={{ fontSize: 11, fontFamily: Theme.fonts.bold, color: '#F59E0B' }}>🏆 Rewards Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(236, 72, 153, 0.12)', borderRadius: 10, borderWidth: 1, borderColor: '#EC4899', alignItems: 'center' }}
                onPress={() => router.push('/social/memory-wall')}
              >
                <Text style={{ fontSize: 11, fontFamily: Theme.fonts.bold, color: '#EC4899' }}>📸 Memory Wall</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(56, 189, 248, 0.12)', borderRadius: 10, borderWidth: 1, borderColor: '#38BDF8', alignItems: 'center' }}
                onPress={() => router.push('/event/music-player')}
              >
                <Text style={{ fontSize: 11, fontFamily: Theme.fonts.bold, color: '#38BDF8' }}>🎧 Music Player</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(16, 185, 129, 0.12)', borderRadius: 10, borderWidth: 1, borderColor: '#10B981', alignItems: 'center' }}
                onPress={() => router.push('/checkout/rideshare')}
              >
                <Text style={{ fontSize: 11, fontFamily: Theme.fonts.bold, color: '#10B981' }}>🚘 Cab Partner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(245, 158, 11, 0.12)', borderRadius: 10, borderWidth: 1, borderColor: '#F59E0B', alignItems: 'center' }}
                onPress={() => router.push('/checkout/hotels')}
              >
                <Text style={{ fontSize: 11, fontFamily: Theme.fonts.bold, color: '#F59E0B' }}>🏨 Hotel Finder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(239, 68, 68, 0.12)', borderRadius: 10, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' }}
                onPress={() => router.push('/event/sos-safety')}
              >
                <Text style={{ fontSize: 11, fontFamily: Theme.fonts.bold, color: '#EF4444' }}>🚨 SOS Desk</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Search Bar */}
            <GlassView style={styles.searchBarContainer} intensity="medium">
              <AppIcon name="magnifyingglass" size={20} tintColor={Theme.colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search events, venues, organizers..."
                placeholderTextColor={Theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                autoCapitalize="none"
              />
            </GlassView>

            {/* Categories Scroll */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.categoriesContainer}
              style={styles.categoriesStyle}
            />

            {/* Featured Section */}
            {searchQuery === '' && selectedCategory === 'All' && featuredEvents.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Featured Festivals</Text>
                  <AppIcon name="star.fill" size={16} tintColor={Theme.colors.warning} />
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  data={featuredEvents}
                  renderItem={renderFeaturedCard}
                  keyExtractor={(item) => 'feat-' + item.id}
                  contentContainerStyle={styles.featuredList}
                />
              </View>
            )}

            {/* List Heading */}
            <View style={styles.sectionHeaderMain}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <Text style={styles.resultsCount}>
                ({filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'})
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
          ) : (
            <GlassView style={styles.noEventsCard} intensity="low">
              <AppIcon name="calendar.badge.exclamationmark" size={48} tintColor={Theme.colors.textMuted} />
              <Text style={styles.noEventsText}>No events found matching your filter.</Text>
            </GlassView>
          )
        }
      />
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
      } as any,
    }),
  },
  backgroundAccent1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 194, 255, 0.08)',
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
    zIndex: -1,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 26,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.primary,
    ...Platform.select({
      web: {
        backgroundClip: 'text',
        backgroundImage: `linear-gradient(135deg, ${Theme.colors.primary}, ${Theme.colors.secondary})`,
        color: 'transparent',
      } as any,
    }),
  },
  taglineText: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  scrollList: {
    paddingBottom: 100,
    paddingHorizontal: Theme.spacing.lg,
  },
  aiBanner: {
    marginBottom: Theme.spacing.md,
  },
  aiBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderColor: Theme.colors.glassPrimaryBorder,
    borderWidth: 1,
    backgroundColor: Theme.colors.glassPrimaryBg,
  },
  aiBannerTextGroup: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  aiBannerSub: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    marginLeft: Theme.spacing.sm,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  categoriesStyle: {
    marginBottom: Theme.spacing.lg,
  },
  categoriesContainer: {
    paddingRight: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  categoryBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.round,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  categoryBtnSelected: {
    borderColor: 'transparent',
  },
  categoryText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: Theme.colors.white,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Theme.spacing.md,
  },
  sectionHeaderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  resultsCount: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  featuredList: {
    gap: Theme.spacing.md,
    paddingRight: Theme.spacing.lg,
  },
  featuredCard: {
    width: screenWidth * 0.7,
    maxWidth: 280,
    height: 180,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredTagContainer: {
    position: 'absolute',
    top: Theme.spacing.sm,
    left: Theme.spacing.sm,
    zIndex: 2,
  },
  featuredTagText: {
    color: Theme.colors.white,
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
    textTransform: 'uppercase',
  },
  featuredMeta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Theme.spacing.md,
    borderBottomLeftRadius: Theme.borderRadius.lg - 1,
    borderBottomRightRadius: Theme.borderRadius.lg - 1,
    borderWidth: 0,
  },
  featuredTitle: {
    color: Theme.colors.white,
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    marginBottom: 4,
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Theme.colors.textSecondary,
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    maxWidth: 100,
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
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: Theme.borderRadius.sm,
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventCategory: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventPrice: {
    color: Theme.colors.secondary,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  eventTitle: {
    color: Theme.colors.text,
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    lineHeight: 18,
    marginVertical: 4,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
  },
  bullet: {
    color: Theme.colors.textMuted,
    fontSize: 10,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsCard: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    gap: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.lg,
  },
  noEventsText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontFamily: Theme.fonts.medium,
    textAlign: 'center',
  },
});
