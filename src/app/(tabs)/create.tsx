import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

const CATEGORIES = [
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

export default function CreateEventScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [ticketPrice, setTicketPrice] = useState('');
  const [organizer, setOrganizer] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        if (user) {
          const { data } = await supabase
            .from('users')
            .select('name')
            .eq('id', user.id)
            .single();
          if (data) {
            setOrganizer(data.name);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    getProfile();
  }, []);

  const handleCreateEvent = async () => {
    const finalTitle = title.trim();
    const finalDescription = description.trim();
    let finalDate = date.trim();
    const finalTime = time.trim() || '18:00 - 20:00';
    const finalVenue = venue.trim() || 'Virtual Arena, Chennai';
    const finalOrganizer = organizer.trim() || 'Guest Organizer';

    // Robust field validation with web alert fallback
    if (!finalTitle) {
      if (Platform.OS === 'web') {
        alert('Validation Error: Please enter an Event Title.');
      } else {
        Alert.alert('Validation Error', 'Please enter an Event Title.');
      }
      return;
    }

    if (!finalDescription) {
      if (Platform.OS === 'web') {
        alert('Validation Error: Please enter an Event Description.');
      } else {
        Alert.alert('Validation Error', 'Please enter an Event Description.');
      }
      return;
    }

    // Default to today's date if empty or invalid YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!finalDate || !dateRegex.test(finalDate)) {
      finalDate = new Date().toISOString().split('T')[0];
    }

    let price = parseFloat(ticketPrice);
    if (isNaN(price) || price < 0) {
      price = 0; // Default to free entry if empty/invalid
    }

    setLoading(true);
    try {
      const finalImageUrl = imageUrl.trim() || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600';

      const { error } = await supabase.from('events').insert({
        title: finalTitle,
        description: finalDescription,
        category,
        date: finalDate,
        time: finalTime,
        venue: finalVenue,
        organizer: finalOrganizer,
        image_url: finalImageUrl,
        ticket_price: price,
        is_approved: true, // Approved immediately for live preview
        created_by: currentUser?.id || 'guest-user-uuid',
      });

      if (error) {
        if (Platform.OS === 'web') {
          alert('Database Error: ' + error.message);
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        // Successful creation
        setSuccess(true);
      }
    } catch (err: any) {
      const errMsg = err.message || 'An unexpected error occurred.';
      if (Platform.OS === 'web') {
        alert('Error: ' + errMsg);
      } else {
        Alert.alert('Error', errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setVenue('');
    setImageUrl('');
    setCategory(CATEGORIES[0]);
    setTicketPrice('');
    setSuccess(false);
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successWrapper}>
          <AppIcon name="checkmark.seal.fill" size={72} tintColor={Theme.colors.success} />
          <Text style={styles.successTitle}>Event Created!</Text>
          <Text style={styles.successText}>
            Your event has been successfully created and is now **live on the Explore feed** under your chosen category!
          </Text>
          <TouchableOpacity style={[styles.successBtn, { backgroundColor: Theme.colors.primary }]} onPress={handleReset}>
            <Text style={styles.successBtnText}>Create Another Event</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.successBtnSecondary} onPress={() => { handleReset(); router.push('/(tabs)'); }}>
            <Text style={styles.successBtnSecondaryText}>Go to Explore Feed</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.backgroundAccent1} />
        <View style={styles.backgroundAccent2} />

        <View style={styles.formWrapper}>
          <Text style={styles.headerTitle}>Host an Event</Text>
          <Text style={styles.headerSubtitle}>Share your festival or event with the EventSphere community</Text>

          <GlassView style={styles.card}>
            {/* Event Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Event Title</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Fusion Music Concert"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputFieldContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell people about your event..."
                  placeholderTextColor={Theme.colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Category selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catPill,
                        isSelected && { backgroundColor: Theme.colors.primary, borderColor: 'transparent' },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.catPillText, isSelected && { color: Theme.colors.white }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Date and Time Row */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="2026-06-25"
                    placeholderTextColor={Theme.colors.textMuted}
                    value={date}
                    onChangeText={setDate}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Time (e.g. 18:00)</Text>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="18:00 - 22:00"
                    placeholderTextColor={Theme.colors.textMuted}
                    value={time}
                    onChangeText={setTime}
                  />
                </View>
              </View>
            </View>

            {/* Venue / Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Venue Location</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Nehru Stadium, Chennai"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={venue}
                  onChangeText={setVenue}
                />
              </View>
            </View>

            {/* Organizer */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Organizer / Host Name</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Organizer name"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={organizer}
                  onChangeText={setOrganizer}
                />
              </View>
            </View>

            {/* Ticket Price */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ticket Price (₹) (Use 0 for Free)</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={ticketPrice}
                  onChangeText={setTicketPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Banner Image URL */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Banner Image URL (Optional)</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: Theme.colors.primary }]}
              onPress={handleCreateEvent}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Submit Event</Text>
              )}
            </TouchableOpacity>
          </GlassView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderLeftWidth: 1,
        borderRightWidth: 1,
      } as any,
    }),
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
  backgroundAccent1: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    filter: Platform.OS === 'web' ? 'blur(50px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: 200,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 194, 255, 0.07)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  formWrapper: {
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginBottom: Theme.spacing.lg,
  },
  card: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
  },
  inputContainer: {
    marginBottom: Theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputFieldContainer: {
    height: 48,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    justifyContent: 'center',
  },
  input: {
    height: '100%',
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  textAreaContainer: {
    height: 100,
    paddingVertical: Theme.spacing.sm,
  },
  textArea: {
    textAlignVertical: 'top',
    height: '100%',
  },
  catGrid: {
    gap: Theme.spacing.sm,
    paddingVertical: 4,
  },
  catPill: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.round,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  catPillText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
  },
  submitBtn: {
    height: 48,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: Theme.spacing.md,
  },
  submitBtnText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
  successWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  successText: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing.xl,
  },
  successBtn: {
    height: 48,
    width: '100%',
    maxWidth: 280,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  successBtnText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
  successBtnSecondary: {
    height: 48,
    width: '100%',
    maxWidth: 280,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    backgroundColor: 'rgba(15, 23, 42, 0.02)',
  },
  successBtnSecondaryText: {
    color: Theme.colors.text,
    fontSize: 15,
    fontFamily: Theme.fonts.medium,
  },
});
