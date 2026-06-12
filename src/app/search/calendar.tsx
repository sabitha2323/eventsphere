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

export default function CalendarScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('events').select('*').eq('is_approved', true);
      if (data) {
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Helper values for generating calendar grid
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // Generate date array
  const calendarDays = [];
  // Add empty slots for days of previous month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Add days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, currentDate.getMonth(), d));
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return isSameDay(eventDate, date);
    });
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AppIcon name="chevron.left" size={20} tintColor={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Calendar</Text>
        <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
          <Text style={styles.todayBtn}>Today</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Calendar Widget */}
        <GlassView style={styles.calendarCard} intensity="medium">
          {/* Month Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowBtn}>
              <AppIcon name="chevron.left" size={16} tintColor={Theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthName} {year}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.arrowBtn}>
              <AppIcon name="chevron.right" size={16} tintColor={Theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdaysRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <Text key={idx} style={styles.weekdayLabel}>{day}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((dayDate, idx) => {
              if (!dayDate) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }

              const isSelected = isSameDay(dayDate, selectedDate);
              const isToday = isSameDay(dayDate, new Date());
              const dateEvents = getEventsForDate(dayDate);
              const hasEvents = dateEvents.length > 0;

              return (
                <TouchableOpacity
                  key={`day-${idx}`}
                  onPress={() => setSelectedDate(dayDate)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isToday && !isSelected && { color: Theme.colors.primary, fontWeight: '700' }
                    ]}
                  >
                    {dayDate.getDate()}
                  </Text>
                  
                  {/* Event Indicator dot */}
                  {hasEvents && (
                    <View
                      style={[
                        styles.indicatorDot,
                        isSelected ? { backgroundColor: '#fff' } : { backgroundColor: Theme.colors.primary }
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassView>

        {/* Selected Date Summary Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          <Text style={styles.sectionCount}>{selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'Event' : 'Events'}</Text>
        </View>

        {/* Event List on Selected Date */}
        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 20 }} />
        ) : selectedDateEvents.length > 0 ? (
          selectedDateEvents.map(item => {
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
                    <View style={styles.eventHeaderRow}>
                      <Text style={[styles.eventCategory, { color: catColor }]}>{item.category}</Text>
                      <Text style={styles.eventTime}>{item.time.split(' ')[0]}</Text>
                    </View>
                    <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.eventLocation} numberOfLines={1}>📍 {item.venue.split(',')[0]}</Text>
                  </View>
                </GlassView>
              </TouchableOpacity>
            );
          })
        ) : (
          <GlassView style={styles.emptyCard} intensity="low">
            <AppIcon name="calendar.badge.plus" size={32} tintColor={Theme.colors.textMuted} />
            <Text style={styles.emptyText}>No events scheduled on this day.</Text>
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
  todayBtn: {
    fontSize: 14,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.primary,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  calendarCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.xl,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  arrowBtn: {
    padding: 8,
  },
  monthLabel: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
    position: 'relative',
  },
  dayCellSelected: {
    backgroundColor: Theme.colors.primary,
  },
  dayCellToday: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  dayText: {
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textSecondary,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  indicatorDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
    paddingBottom: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
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
  eventTime: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
  },
  emptyCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.xs,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
  },
});
