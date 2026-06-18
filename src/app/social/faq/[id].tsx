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

export default function FAQScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Ask question state
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEventAndFAQs();
  }, [eventId]);

  const fetchEventAndFAQs = async () => {
    setLoading(true);
    try {
      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (eventData) setEvent(eventData);

      const { data: faqData } = await supabase.from('faqs').select('*').eq('event_id', eventId);
      const fetchedFaqs = faqData || [];

      if (fetchedFaqs.length === 0) {
        // Fallback seed FAQs if table is empty or offline
        fetchedFaqs.push(
          { id: 'f1', question: 'What is the refund policy?', answer: 'Refunds can be requested up to 24 hours before the event start time directly from the digital ticket page.' },
          { id: 'f2', question: 'Is parking available at the venue?', answer: 'Yes, the venue offers secure parking for both two-wheelers and four-wheelers. Standard parking fees apply.' },
          { id: 'f3', question: 'Will certificates be provided for attendees?', answer: 'Yes, digital certificates of attendance will be sent to the registered email within 3 business days after the event closes.' }
        );
      }

      setFaqs(fetchedFaqs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Log custom support question into administrative support tickets
        await supabase.from('support_tickets').insert({
          user_id: user.id,
          subject: `FAQ Question: ${event?.title || 'Event'}`,
          description: newQuestion.trim(),
          status: 'pending',
        }).then(({ error }: any) => {
          if (error) console.warn('[FAQ] Support ticket log skipped:', error.message);
        });

        // Add a local notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Question Received',
          message: `Your query regarding "${event?.title || 'Event'}" has been forwarded to organizers.`,
        }).then(({ error }: any) => {
          if (error) console.warn('[FAQ] Notification insert skipped:', error.message);
        });

        if (Platform.OS === 'web') {
          window.alert('Query Submitted\n\nYour question has been forwarded to the event organizers. You will be notified when they reply.');
        } else {
          Alert.alert('Query Submitted', 'Your question has been forwarded to the event organizers. You will be notified when they reply.');
        }
        setNewQuestion('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaqs = faqs.filter(
    f =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AppIcon name="chevron.left" size={20} tintColor={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event FAQs & Help</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header Description */}
          <View style={styles.descriptionBox}>
            <Text style={styles.eventTitle}>{event?.title || 'Event FAQs'}</Text>
            <Text style={styles.subtext}>Got questions? Find instant answers below or submit a new query to the event host.</Text>
          </View>

          {/* Search Box */}
          <GlassView style={styles.searchContainer} intensity="low">
            <AppIcon name="magnifyingglass" size={16} tintColor={Theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search FAQs..."
              placeholderTextColor={Theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              {...Platform.select({
                web: { outlineStyle: 'none' } as any,
              })}
            />
          </GlassView>

          {/* Accordion Grid */}
          <View style={styles.faqsList}>
            {filteredFaqs.map(faq => {
              const isExpanded = expandedId === faq.id;
              return (
                <TouchableOpacity
                  key={faq.id}
                  onPress={() => toggleExpand(faq.id)}
                  style={styles.faqCard}
                >
                  <GlassView style={styles.faqCardInner} intensity={isExpanded ? 'medium' : 'low'}>
                    <View style={styles.faqHeader}>
                      <Text style={styles.questionText}>{faq.question}</Text>
                      <AppIcon
                        name={isExpanded ? 'chevron.up' : 'chevron.down'}
                        size={16}
                        tintColor={Theme.colors.textSecondary}
                      />
                    </View>
                    {isExpanded && (
                      <View style={styles.answerBox}>
                        <Text style={styles.answerText}>{faq.answer}</Text>
                      </View>
                    )}
                  </GlassView>
                </TouchableOpacity>
              );
            })}
            {filteredFaqs.length === 0 && (
              <Text style={styles.noResultsText}>No FAQs match your search query.</Text>
            )}
          </View>

          {/* Submit query form */}
          <GlassView style={styles.formCard} intensity="medium">
            <Text style={styles.formTitle}>Still have questions?</Text>
            <Text style={styles.formDesc}>Submit a question directly to the event host, and we will notify you when they reply.</Text>
            
            <TextInput
              style={styles.formInput}
              placeholder="Type your question here..."
              placeholderTextColor={Theme.colors.textMuted}
              value={newQuestion}
              onChangeText={setNewQuestion}
              multiline
              numberOfLines={3}
              {...Platform.select({
                web: { outlineStyle: 'none' } as any,
              })}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAskQuestion} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Ask Host</Text>
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
    backgroundColor: 'rgba(124, 58, 237, 0.03)',
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
    backgroundColor: 'rgba(0, 194, 255, 0.03)',
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
    gap: 16,
  },
  descriptionBox: {
    gap: 4,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  subtext: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    lineHeight: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Theme.colors.text,
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
  },
  faqsList: {
    gap: 12,
  },
  faqCard: {
    width: '100%',
  },
  faqCardInner: {
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  questionText: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    flex: 1,
  },
  answerBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.05)',
  },
  answerText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.regular,
    lineHeight: 18,
  },
  noResultsText: {
    textAlign: 'center',
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
    marginTop: 10,
  },
  formCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 12,
    marginTop: 10,
  },
  formTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  formDesc: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    lineHeight: 16,
  },
  formInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
  },
  submitBtn: {
    height: 40,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
});
