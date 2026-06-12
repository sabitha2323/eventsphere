import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';
import { Image } from 'expo-image';

const { width: screenWidth } = Dimensions.get('window');

// Mock Map Coordinates for visual representation
const COORDINATES: any = {
  'Grand Arena Plaza, Chennai': { x: 120, y: 150 },
  'State Exhibition Grounds, Bengaluru': { x: 80, y: 220 },
  'Silicon Hub Innovation Center, Bengaluru': { x: 160, y: 200 },
  'National Sports Complex, Chennai': { x: 200, y: 140 },
  'Lakefront Promenade, Bengaluru': { x: 100, y: 250 },
  'Central Library Auditorium, Chennai': { x: 220, y: 180 },
};

export default function MapScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await supabase.from('events').select('*').eq('is_approved', true);
      if (data) {
        // Assign default coords if not present
        const mapped = data.map((e: any, index: number) => {
          const coords = COORDINATES[e.venue] || {
            x: 50 + (index * 40) % 250,
            y: 100 + (index * 50) % 300,
          };
          return { ...e, coords };
        });
        setEvents(mapped);
        if (mapped.length > 0) setSelectedEvent(mapped[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    const index = events.findIndex(e => e.id === event.id);
    if (index !== -1 && listRef.current) {
      listRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderEventItem = ({ item }: { item: any }) => {
    const isSelected = selectedEvent?.id === item.id;
    return (
      <TouchableOpacity
        onPress={() => router.push(`/event/${item.id}`)}
        style={[styles.carouselCard, isSelected && styles.carouselCardSelected]}
      >
        <GlassView style={styles.cardInner} intensity="high">
          <Image source={{ uri: item.image_url }} style={styles.cardImage} contentFit="cover" />
          <View style={styles.cardDetails}>
            <Text style={styles.cardCategory} numberOfLines={1}>{item.category.toUpperCase()}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.cardMetaRow}>
              <AppIcon name="calendar" size={12} tintColor={Theme.colors.textMuted} />
              <Text style={styles.cardMetaText}>{formatDate(item.date)}</Text>
              <Text style={styles.bullet}>•</Text>
              <AppIcon name="mappin" size={12} tintColor={Theme.colors.textMuted} />
              <Text style={styles.cardMetaText} numberOfLines={1}>{item.venue.split(',')[0]}</Text>
            </View>
          </View>
        </GlassView>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Visual Simulated Map Background */}
      <View style={styles.mapCanvas}>
        {/* Mock Map Grid lines & styling */}
        <View style={styles.gridLineH1} />
        <View style={styles.gridLineH2} />
        <View style={styles.gridLineV1} />
        <View style={styles.gridLineV2} />
        <View style={styles.mockLake} />
        <View style={styles.mockPark} />

        {/* Event Pins */}
        {filteredEvents.map(e => {
          const isSelected = selectedEvent?.id === e.id;
          const catColor = (Theme.colors.categories as any)[e.category] || Theme.colors.primary;
          return (
            <TouchableOpacity
              key={e.id}
              style={[
                styles.pinWrapper,
                { left: e.coords.x, top: e.coords.y }
              ]}
              onPress={() => handleSelectEvent(e)}
            >
              {isSelected && <View style={[styles.pinPulse, { backgroundColor: catColor }]} />}
              <View style={[styles.pinDot, { backgroundColor: catColor }, isSelected && styles.pinDotSelected]}>
                <AppIcon
                  name={e.category === 'Music' ? 'music.note' : e.category === 'Sports' ? 'sportscourt' : 'calendar'}
                  size={12}
                  tintColor="#fff"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Header */}
      <GlassView style={styles.floatingHeader} intensity="medium">
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <AppIcon name="chevron.left" size={18} tintColor={Theme.colors.text} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchBarInput}
          placeholder="Search map location or event..."
          placeholderTextColor={Theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <AppIcon name="magnifyingglass" size={18} tintColor={Theme.colors.textMuted} />
      </GlassView>

      {/* Floating Carousel */}
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          snapToInterval={screenWidth * 0.82 + 16}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.carouselContainer}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / (screenWidth * 0.82 + 16));
            if (filteredEvents[index]) {
              setSelectedEvent(filteredEvents[index]);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0', // Map background color
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#EDF2F7',
  },
  gridLineH1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  gridLineH2: {
    position: 'absolute',
    top: '70%',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  gridLineV1: {
    position: 'absolute',
    left: '30%',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  gridLineV2: {
    position: 'absolute',
    left: '70%',
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  mockLake: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    width: 120,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(191, 219, 254, 0.6)',
  },
  mockPark: {
    position: 'absolute',
    bottom: '20%',
    left: '10%',
    width: 100,
    height: 120,
    borderRadius: 20,
    backgroundColor: 'rgba(209, 250, 229, 0.6)',
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: Theme.spacing.md,
    right: Theme.spacing.md,
    height: 48,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    zIndex: 10,
    maxWidth: 600,
    alignSelf: 'center',
    width: '90%',
  },
  headerBtn: {
    marginRight: Theme.spacing.sm,
  },
  searchBarInput: {
    flex: 1,
    height: '100%',
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  pinWrapper: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pinDotSelected: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  pinPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.3,
  },
  carouselWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  carouselContainer: {
    paddingHorizontal: Theme.spacing.md,
    gap: 16,
  },
  carouselCard: {
    width: screenWidth * 0.82,
    maxWidth: 320,
  },
  carouselCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  cardInner: {
    flexDirection: 'row',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.md,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: Theme.borderRadius.sm,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cardCategory: {
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.primary,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetaText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  bullet: {
    color: Theme.colors.textMuted,
    fontSize: 8,
  },
});
