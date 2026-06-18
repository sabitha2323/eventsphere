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
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';
import { Image } from 'expo-image';

const LOCATIONS = ['All', 'Chennai', 'Bengaluru', 'Mumbai', 'Online'];
const PRICES = ['All', 'Free', 'Under ₹500', '₹500 - ₹1500', '₹1500+'];
const CATEGORIES = ['All', 'Music', 'Cultural', 'College', 'Sports', 'Technology', 'Food Festival', 'Workshops', 'Seminar', 'Hackathon'];
const SORTS = ['Date (Soonest)', 'Price (Low to High)', 'Price (High to Low)'];

export default function FiltersScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedLoc, setSelectedLoc] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Date (Soonest)');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('events').select('*').eq('is_approved', true);
      if (data) {
        setEvents(data);
        setFilteredEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    let results = [...events];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.venue.toLowerCase().includes(q) || 
        e.organizer.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCat !== 'All') {
      results = results.filter(e => e.category === selectedCat);
    }

    // Location filter
    if (selectedLoc !== 'All') {
      results = results.filter(e => 
        selectedLoc === 'Online' 
          ? e.venue.toLowerCase().includes('online') 
          : e.venue.toLowerCase().includes(selectedLoc.toLowerCase())
      );
    }

    // Price filter
    if (selectedPrice !== 'All') {
      if (selectedPrice === 'Free') {
        results = results.filter(e => e.ticket_price === 0);
      } else if (selectedPrice === 'Under ₹500') {
        results = results.filter(e => e.ticket_price > 0 && e.ticket_price < 500);
      } else if (selectedPrice === '₹500 - ₹1500') {
        results = results.filter(e => e.ticket_price >= 500 && e.ticket_price <= 1500);
      } else if (selectedPrice === '₹1500+') {
        results = results.filter(e => e.ticket_price > 1500);
      }
    }

    // Sort filter
    if (selectedSort === 'Date (Soonest)') {
      results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (selectedSort === 'Price (Low to High)') {
      results.sort((a, b) => a.ticket_price - b.ticket_price);
    } else if (selectedSort === 'Price (High to Low)') {
      results.sort((a, b) => b.ticket_price - a.ticket_price);
    }

    setFilteredEvents(results);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedCat('All');
    setSelectedLoc('All');
    setSelectedPrice('All');
    setSelectedSort('Date (Soonest)');
    setFilteredEvents(events);
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
        <Text style={styles.headerTitle}>Advanced Search</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Input */}
        <GlassView style={styles.searchBar} intensity="medium">
          <AppIcon name="magnifyingglass" size={18} tintColor={Theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, venues, topics..."
            placeholderTextColor={Theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleApply}
            clearButtonMode="while-editing"
          />
        </GlassView>

        {/* Category section */}
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsContainer} style={styles.tagsScroll}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCat(cat)}
                style={[styles.tagBtn, isSelected && { backgroundColor: Theme.colors.primary, borderColor: 'transparent' }]}
              >
                <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Location Section */}
        <Text style={styles.sectionLabel}>Location / Venue</Text>
        <View style={styles.gridContainer}>
          {LOCATIONS.map(loc => {
            const isSelected = selectedLoc === loc;
            return (
              <TouchableOpacity
                key={loc}
                onPress={() => setSelectedLoc(loc)}
                style={[styles.gridBtn, isSelected && { backgroundColor: Theme.colors.secondary, borderColor: 'transparent' }]}
              >
                <Text style={[styles.gridBtnText, isSelected && styles.tagTextSelected]}>{loc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price Section */}
        <Text style={styles.sectionLabel}>Price Range</Text>
        <View style={styles.gridContainer}>
          {PRICES.map(pr => {
            const isSelected = selectedPrice === pr;
            return (
              <TouchableOpacity
                key={pr}
                onPress={() => setSelectedPrice(pr)}
                style={[styles.gridBtn, isSelected && { backgroundColor: Theme.colors.primary, borderColor: 'transparent' }]}
              >
                <Text style={[styles.gridBtnText, isSelected && styles.tagTextSelected]}>{pr}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sort Section */}
        <Text style={styles.sectionLabel}>Sort By</Text>
        <View style={styles.sortContainer}>
          {SORTS.map(sort => {
            const isSelected = selectedSort === sort;
            return (
              <TouchableOpacity
                key={sort}
                onPress={() => setSelectedSort(sort)}
                style={styles.sortRow}
              >
                <AppIcon
                  name={isSelected ? 'checkmark.circle.fill' : 'circle'}
                  size={18}
                  tintColor={isSelected ? Theme.colors.secondary : Theme.colors.textMuted}
                />
                <Text style={[styles.sortLabel, isSelected && { fontWeight: '600', color: Theme.colors.text }]}>
                  {sort}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Apply Button */}
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>

        {/* Results Count Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Filtered Results ({filteredEvents.length})</Text>
        </View>

        {/* Result List */}
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 20 }} />
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map(item => (
            <TouchableOpacity key={item.id} onPress={() => router.push(`/event/${item.id}`)} style={styles.eventCard}>
              <GlassView style={styles.eventCardInner} intensity="low">
                <Image
                  source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=200' }}
                  style={styles.eventImage}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.eventDetails}>
                  <View style={styles.eventHeaderRow}>
                    <Text style={[styles.eventCategory, { color: (Theme.colors.categories as any)[item.category] || Theme.colors.primary }]}>
                      {item.category}
                    </Text>
                    <Text style={styles.eventPrice}>
                      {item.ticket_price === 0 ? 'Free' : `₹${item.ticket_price}`}
                    </Text>
                  </View>
                  <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.eventMeta}>{formatDate(item.date)} • {item.venue.split(',')[0]}</Text>
                </View>
              </GlassView>
            </TouchableOpacity>
          ))
        ) : (
          <GlassView style={styles.noEvents} intensity="low">
            <AppIcon name="calendar.badge.exclamationmark" size={32} tintColor={Theme.colors.textMuted} />
            <Text style={styles.noEventsText}>No matching events found.</Text>
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
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
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
  resetText: {
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
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
  sectionLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsScroll: {
    marginBottom: Theme.spacing.lg,
  },
  tagsContainer: {
    gap: Theme.spacing.sm,
    paddingRight: 10,
  },
  tagBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.round,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  tagText: {
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
  },
  tagTextSelected: {
    color: Theme.colors.white,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Theme.spacing.lg,
  },
  gridBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  gridBtnText: {
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textSecondary,
  },
  sortContainer: {
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    paddingVertical: 4,
  },
  sortLabel: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
  },
  applyBtn: {
    height: 48,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  applyBtnText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
  resultsHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
    paddingBottom: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  resultsTitle: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
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
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.sm,
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  eventCategory: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventPrice: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.secondary,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 2,
  },
  eventMeta: {
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
  },
  noEvents: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  noEventsText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
});
