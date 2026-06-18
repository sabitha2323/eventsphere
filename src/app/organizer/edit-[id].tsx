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
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

const CATEGORIES = ['Music', 'Cultural', 'College', 'Sports', 'Technology', 'Food Festival', 'Workshops', 'Seminar', 'Hackathon'];

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Music');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (error) {
        Alert.alert('Error', 'Failed to retrieve event details.');
        router.back();
      } else if (data) {
        setTitle(data.title);
        setDescription(data.description || '');
        setCategory(data.category);
        setDate(data.date);
        setTime(data.time);
        setVenue(data.venue);
        setOrganizer(data.organizer);
        setPrice(String(data.ticket_price));
        setImageUrl(data.image_url || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!title.trim() || !category || !date || !time || !venue || !organizer || price === '') {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Validation Error', 'Price must be a valid number (0 for Free).');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          category,
          date,
          time,
          venue: venue.trim(),
          organizer: organizer.trim(),
          ticket_price: priceNum,
          image_url: imageUrl.trim() || null,
        })
        .eq('id', eventId);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Event details updated successfully.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
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
        <Text style={styles.headerTitle}>Edit Event</Text>
        <TouchableOpacity onPress={handleSaveChanges} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={Theme.colors.primary} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <GlassView style={styles.formCard} intensity="medium">
            
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Title *</Text>
              <TextInput style={styles.textInput} value={title} onChangeText={setTitle} placeholder="Event Name" placeholderTextColor={Theme.colors.textMuted} />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                {CATEGORIES.map(cat => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[styles.catBtn, isSelected && styles.catBtnActive]}
                    >
                      <Text style={[styles.catBtnText, isSelected && { color: '#fff' }]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Details about the event, timelines, guidelines..."
                placeholderTextColor={Theme.colors.textMuted}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Date & Time */}
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Date *</Text>
                <TextInput style={styles.textInput} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={Theme.colors.textMuted} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Time *</Text>
                <TextInput style={styles.textInput} value={time} onChangeText={setTime} placeholder="e.g. 10:00 - 17:00" placeholderTextColor={Theme.colors.textMuted} />
              </View>
            </View>

            {/* Venue & Organizer */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Venue Address *</Text>
              <TextInput style={styles.textInput} value={venue} onChangeText={setVenue} placeholder="Building, City" placeholderTextColor={Theme.colors.textMuted} />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.inputLabel}>Host / Organizer *</Text>
                <TextInput style={styles.textInput} value={organizer} onChangeText={setOrganizer} placeholder="Company or College Club" placeholderTextColor={Theme.colors.textMuted} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Price (₹) *</Text>
                <TextInput style={styles.textInput} value={price} onChangeText={setPrice} placeholder="0 for Free" placeholderTextColor={Theme.colors.textMuted} keyboardType="numeric" />
              </View>
            </View>

            {/* Image URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Image Cover URL</Text>
              <TextInput style={styles.textInput} value={imageUrl} onChangeText={setImageUrl} placeholder="https://unsplash.com/..." placeholderTextColor={Theme.colors.textMuted} />
            </View>

          </GlassView>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSaveChanges} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
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
  saveBtnText: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    fontSize: 15,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
    gap: 16,
  },
  formCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 14,
  },
  inputGroup: {
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  textInput: {
    height: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.sm,
    fontSize: 14,
    color: Theme.colors.text,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  multilineInput: {
    height: 80,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  catScroll: {
    gap: 8,
    alignItems: 'center',
    height: 40,
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  catBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: 'transparent',
  },
  catBtnText: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textSecondary,
  },
  submitBtn: {
    height: 44,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
});
