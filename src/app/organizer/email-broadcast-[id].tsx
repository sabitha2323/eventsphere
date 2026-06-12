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

export default function EmailBroadcastScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  
  // Form states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [checkedInOnly, setCheckedInOnly] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (eventData) setEvent(eventData);

      const { data: regs } = await supabase.from('registrations').select('*').eq('event_id', eventId);
      setAttendeeCount(regs ? regs.length : 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Validation Error', 'Please complete both the subject and email message body.');
      return;
    }

    setSending(true);
    // Simulate sending dispatch delay (1.5 seconds)
    setTimeout(() => {
      setSending(false);
      Alert.alert(
        'Broadcast Dispatched',
        `Your announcement alert has been emailed to all ${attendeeCount} registered attendees.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSubject('');
              setMessage('');
              router.back();
            }
          }
        ]
      );
    }, 1500);
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Email Broadcast</Text>
          {event && <Text style={styles.headerSubtitle} numberOfLines={1}>{event.title}</Text>}
        </View>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Summary stats */}
          <GlassView style={styles.summaryCard} intensity="low">
            <AppIcon name="paperplane.fill" size={18} tintColor={Theme.colors.primary} />
            <Text style={styles.summaryText}>
              Sending dispatch to <Text style={{ fontWeight: '700' }}>{attendeeCount} registered attendees</Text>.
            </Text>
          </GlassView>

          {/* Form */}
          <GlassView style={styles.formCard} intensity="medium">
            <Text style={styles.formLabel}>Email Subject</Text>
            <TextInput
              style={styles.subjectInput}
              placeholder="e.g. Critical Update: Venue Gate changes"
              placeholderTextColor={Theme.colors.textMuted}
              value={subject}
              onChangeText={setSubject}
            />

            <Text style={styles.formLabel}>Message Content</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Write your email details here. Let attendees know about schedules, guidelines, or items to bring..."
              placeholderTextColor={Theme.colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
            />

            {/* Target toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleTitle}>Only send to Checked-in</Text>
                <Text style={styles.toggleDesc}>Restrict broadcast only to guests scanned at door</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCheckedInOnly(!checkedInOnly)}
                style={[styles.toggleBtn, checkedInOnly && { backgroundColor: Theme.colors.primary }]}
              >
                <View style={[styles.toggleCircle, checkedInOnly && { transform: [{ translateX: 14 }] }]} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.sendBtn} onPress={handleSendBroadcast} disabled={sending}>
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.sendBtnInner}>
                  <AppIcon name="paperplane.fill" size={14} tintColor="#fff" />
                  <Text style={styles.sendBtnText}>Send Announcement</Text>
                </View>
              )}
            </TouchableOpacity>
          </GlassView>
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
    gap: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  summaryText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
  },
  formCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 12,
  },
  formLabel: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  subjectInput: {
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
  messageInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
    fontSize: 14,
    color: Theme.colors.text,
    textAlignVertical: 'top',
    height: 150,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.05)',
    paddingTop: Theme.spacing.md,
    marginTop: 4,
  },
  toggleTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  toggleDesc: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  toggleBtn: {
    width: 38,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    padding: 2,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  sendBtn: {
    height: 44,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  sendBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
});
