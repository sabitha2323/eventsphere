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

const MOCK_DISTANCES: any = {
  'Grand Arena Plaza, Chennai': 1.8,
  'State Exhibition Grounds, Bengaluru': 12.5,
  'Silicon Hub Innovation Center, Bengaluru': 8.2,
  'National Sports Complex, Chennai': 3.1,
  'Lakefront Promenade, Bengaluru': 15.0,
  'Central Library Auditorium, Chennai': 0.6,
};

const RADIUS_OPTIONS = [2, 5, 10, 20];

export default function NearbyScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [radius, setRadius] = useState(5); // Default 5 km
  const [currentLocation, setCurrentLocation] = useState('Central Chennai');

  useEffect(() => {
    fetchNearbyEvents();
  }, [radius, currentLocation]);

  const fetchNearbyEvents = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('events').select('*').eq('is_approved', true);
      if (data) {
        const withDistances = data.map((e: any, index: number) => {
          const baseDistance = MOCK_DISTANCES[e.venue] || (1.5 + (index * 2.7));
          // Adjust distance if location changes
          const factor = currentLocation.includes('Bengaluru') ? (e.venue.includes('Bengaluru') ? 0.4 : 3.5) : (e.venue.includes('Chennai') ? 0.5 : 4.0);
          return {
            ...e,
            distance: parseFloat((baseDistance * factor).toFixed(1)),
          };
        });

        // Filter by selected radius
        const filtered = withDistances.filter((e: any) => e.distance <= radius);
        // Sort by distance (closest first)
        filtered.sort((a: any, b: any) => a.distance - b.distance);
        setEvents(filtered);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleCity = () => {
    if (currentLocation.includes('Chennai')) {
      setCurrentLocation('M.G. Road, Bengaluru');
    } else {
      setCurrentLocation('Central Chennai');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        <Text style={styles.headerTitle}>Nearby Events</Text>
        <TouchableOpacity onPress={toggleCity}>
          <AppIcon name="location.fill" size={18} tintColor={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Current Location Card */}
        <GlassView style={styles.locationCard} intensity="medium">
          <View style={styles.locationLeft}>
            <View style={styles.markerCircle}>
              <AppIcon name="mappin.and.ellipse" size={16} tintColor="#fff" />
            </View>
            <View>
              <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
              <Text style={styles.locationValue}>{currentLocation}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={toggleCity} style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Switch City</Text>
          </TouchableOpacity>
        </GlassView>

        {/* Radius Slider Selector */}
        <Text style={styles.sectionLabel}>Search Radius</Text>
        <View style={styles.radiusRow}>
          {RADIUS_OPTIONS.map(rad => {
            const isSelected = radius === rad;
            return (
              <TouchableOpacity
                key={rad}
                onPress={() => setRadius(rad)}
                style={[styles.radiusBtn, isSelected && styles.radiusBtnSelected]}
              >
                <Text style={[styles.radiusBtnText, isSelected && styles.radiusBtnTextSelected]}>
                  {rad} km
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Nearby Events List */}
        <Text style={styles.sectionLabel}>Closest to you ({events.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 30 }} />
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
                      <View style={styles.distanceBadge}>
                        <Text style={styles.distanceText}>📍 {item.distance} km</Text>
                      </View>
                    </View>

                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.eventLocation} numberOfLines={1}>{item.venue}</Text>
                    
                    <View style={styles.bottomRow}>
                      <Text style={styles.eventDate}>{formatDate(item.date)} • {item.time.split(' ')[0]}</Text>
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
            <AppIcon name="location.slash" size={36} tintColor={Theme.colors.textMuted} />
            <Text style={styles.emptyText}>No events found within {radius} km.</Text>
            <TouchableOpacity style={styles.expandBtn} onPress={() => setRadius(20)}>
              <Text style={styles.expandBtnText}>Expand Search to 20 km</Text>
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
    backgroundColor: 'rgba(0, 194, 255, 0.04)',
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
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  locationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  markerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.textMuted,
  },
  locationValue: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
    marginTop: 2,
  },
  changeBtn: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
  },
  changeBtnText: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
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
  radiusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Theme.spacing.lg,
  },
  radiusBtn: {
    flex: 1,
    height: 36,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusBtnSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: 'transparent',
  },
  radiusBtnText: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
  },
  radiusBtnTextSelected: {
    color: Theme.colors.white,
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
  distanceBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  distanceText: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  eventLocation: {
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
    gap: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
  expandBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.primary,
    marginTop: 4,
  },
  expandBtnText: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: '#fff',
  },
});
