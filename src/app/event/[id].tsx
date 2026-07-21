import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

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

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
  users: {
    name: string;
  };
}

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  // useLocalSearchParams returns string | string[] — ensure we always work with a scalar.
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [registered, setRegistered] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // New comment state
  const [rating, setRating] = useState(5);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Editing comment state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingRating, setEditingRating] = useState(5);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. Fetch Event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError || !eventData) {
        Alert.alert('Error', 'Event not found.');
        router.back();
        return;
      }
      setEvent(eventData);

      // 2. Fetch User Session
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // 3. Check Registration Status
        const { data: regData } = await supabase
          .from('registrations')
          .select('id')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        setRegistered(!!regData);
      }

      // 4. Fetch Comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, users(name)')
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);
    } catch (err) {
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRegister = async () => {
    if (!currentUser) {
      Alert.alert('Auth Required', 'Please log in to register for events.');
      return;
    }

    setRegLoading(true);
    try {
      if (registered) {
        // Cancel registration
        const { error } = await supabase
          .from('registrations')
          .delete()
          .eq('event_id', id)
          .eq('user_id', currentUser.id);

        if (error) {
          Alert.alert('Error', error.message);
        } else {
          setRegistered(false);
          Alert.alert('Cancelled', 'Your registration has been cancelled.');
        }
      } else {
        // Register for event
        const { error } = await supabase
          .from('registrations')
          .insert({
            event_id: id,
            user_id: currentUser.id,
          });

        if (error) {
          Alert.alert('Registration Failed', error.message);
        } else {
          setRegistered(true);

          // Add System Notification
          await supabase.from('notifications').insert({
            user_id: currentUser.id,
            title: 'Registration Successful!',
            message: `You are registered for "${event?.title}". Get ready!`,
            read: false,
          });

          Alert.alert('Success!', `You are registered for ${event?.title}!`);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Check out this event: "${event.title}" on ${formatDate(event.date)} at ${event.venue}! Organized by ${event.organizer}.`,
        title: event.title,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;

    const eventTitle = encodeURIComponent(event.title);
    const eventLocation = encodeURIComponent(event.venue);
    const eventDetails = encodeURIComponent(event.description.substring(0, 200));
    const cleanDate = event.date.replace(/-/g, '');
    const startDate = `${cleanDate}T100000Z`;
    const endDate = `${cleanDate}T180000Z`;

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDate}/${endDate}&details=${eventDetails}&location=${eventLocation}`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(googleCalUrl, '_blank');
      window.alert(`📅 "${event.title}" synced to your Google & iCal Calendar!`);
    } else {
      Alert.alert(
        'Calendar Event Synced',
        `"${event.title}" on ${event.date} has been added to your calendar!`
      );
    }
  };

  const submitComment = async () => {
    if (!currentUser) {
      Alert.alert('Auth Required', 'Please log in to leave a review.');
      return;
    }

    if (!newCommentText.trim()) {
      Alert.alert('Review Required', 'Please type a comment.');
      return;
    }

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          event_id: id,
          user_id: currentUser.id,
          comment: newCommentText.trim(),
          rating: rating,
        })
        .select('*, users(name)')
        .single();

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setComments([data, ...comments]);
        setNewCommentText('');
        setRating(5);
        Alert.alert('Review Added', 'Thank you for your feedback!');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.comment);
    setEditingRating(comment.rating);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
  };

  const saveEditComment = async (commentId: string) => {
    if (!editingText.trim()) {
      Alert.alert('Validation Error', 'Comment content cannot be empty.');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          comment: editingText.trim(),
          rating: editingRating,
        })
        .eq('id', commentId);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setComments(
          comments.map((c) =>
            c.id === commentId
              ? { ...c, comment: editingText.trim(), rating: editingRating }
              : c
          )
        );
        setEditingCommentId(null);
        Alert.alert('Success', 'Comment updated successfully.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    }
  };

  const deleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete your review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

              if (error) {
                Alert.alert('Error', error.message);
              } else {
                setComments(comments.filter((c) => c.id !== commentId));
                Alert.alert('Deleted', 'Your review has been removed.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (!event) return null;

  const catColor = (Theme.colors.categories as any)[event.category] || Theme.colors.primary;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800' }}
            style={styles.bannerImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={400}
          />
          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
            <AppIcon name="chevron.left" size={24} tintColor={Theme.colors.white} />
          </TouchableOpacity>

          {/* Category Tag overlay */}
          <Text style={[styles.categoryTag, { backgroundColor: catColor }]}>
            {event.category}
          </Text>
        </View>

        {/* Content Container */}
        <View style={styles.infoWrapper}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.organizerText}>Organized by {event.organizer}</Text>

          {/* Event Quick Details Glass card */}
          <GlassView style={styles.metaCard}>
            <View style={styles.metaRow}>
              <View style={styles.metaIcon}>
                <AppIcon name="calendar" size={20} tintColor={Theme.colors.secondary} />
              </View>
              <View style={styles.metaInfo}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaIcon}>
                <AppIcon name="clock" size={20} tintColor={Theme.colors.secondary} />
              </View>
              <View style={styles.metaInfo}>
                <Text style={styles.metaLabel}>Time</Text>
                <Text style={styles.metaValue}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaIcon}>
                <AppIcon name="mappin.and.ellipse" size={20} tintColor={Theme.colors.secondary} />
              </View>
              <View style={styles.metaInfo}>
                <Text style={styles.metaLabel}>Venue</Text>
                <Text style={styles.metaValue}>{event.venue}</Text>
              </View>
            </View>

            <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
              <View style={styles.metaIcon}>
                <AppIcon name="ticket" size={20} tintColor={Theme.colors.secondary} />
              </View>
              <View style={styles.metaInfo}>
                <Text style={styles.metaLabel}>Ticket Price</Text>
                <Text style={styles.metaValue}>
                  {event.ticket_price === 0 ? 'Free Entry' : `₹${event.ticket_price}`}
                </Text>
              </View>
            </View>
          </GlassView>

          {/* Actions panel */}
          <View style={styles.actionsPanel}>
            <TouchableOpacity
              style={[
                styles.registerButton,
                registered && styles.registeredButton,
                !registered && { backgroundColor: Theme.colors.primary },
              ]}
              onPress={handleRegister}
              disabled={regLoading}
            >
              {regLoading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <>
                  <AppIcon
                    name={registered ? 'checkmark.circle.fill' : 'ticket.fill'}
                    size={18}
                    tintColor={Theme.colors.white}
                  />
                  <Text style={styles.registerButtonText}>
                    {registered ? 'Registered' : 'Register Now'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.subActionsRow}>
              <TouchableOpacity style={styles.actionIconBtn} onPress={handleAddToCalendar}>
                <AppIcon name="calendar.badge.plus" size={20} tintColor={Theme.colors.text} />
                <Text style={styles.actionIconLabel}>Add Calendar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionIconBtn} onPress={handleShare}>
                <AppIcon name="square.and.arrow.up" size={20} tintColor={Theme.colors.text} />
                <Text style={styles.actionIconLabel}>Share Event</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About The Event</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>

          {/* Comments/Reviews Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comments & Reviews</Text>

            {/* Comment Form */}
            {currentUser ? (
              <GlassView style={styles.commentFormCard} intensity="low">
                <Text style={styles.commentFormHeading}>Write a Review</Text>
                
                {/* Rating selection */}
                <View style={styles.ratingSelectRow}>
                  <Text style={styles.ratingSelectLabel}>Your Rating: </Text>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <AppIcon
                        name={star <= rating ? 'star.fill' : 'star'}
                        size={24}
                        tintColor={star <= rating ? Theme.colors.warning : Theme.colors.textMuted}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Comment Text Input */}
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your thoughts about this event..."
                  placeholderTextColor={Theme.colors.textMuted}
                  value={newCommentText}
                  onChangeText={setNewCommentText}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />

                <TouchableOpacity
                  style={[styles.submitCommentBtn, { backgroundColor: Theme.colors.primary }]}
                  onPress={submitComment}
                  disabled={submittingComment}
                >
                  {submittingComment ? (
                    <ActivityIndicator size="small" color={Theme.colors.white} />
                  ) : (
                    <Text style={styles.submitCommentText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </GlassView>
            ) : (
              <GlassView style={styles.loginToCommentCard} intensity="low">
                <Text style={styles.loginToCommentText}>
                  Please sign in to write comments and reviews.
                </Text>
              </GlassView>
            )}

            {/* Comments List */}
            <View style={styles.commentsList}>
              {comments.length > 0 ? (
                comments.map((item) => {
                  const isOwner = currentUser?.id === item.user_id;
                  const isEditing = editingCommentId === item.id;

                  return (
                    <GlassView key={item.id} style={styles.commentItem} intensity="low">
                      <View style={styles.commentHeader}>
                        <View>
                          <Text style={styles.commentUserName}>
                            {item.users?.name || 'Anonymous User'}
                          </Text>
                          <Text style={styles.commentDate}>
                            {new Date(item.created_at).toLocaleDateString()}
                          </Text>
                        </View>

                        {/* Stars */}
                        <View style={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <AppIcon
                              key={star}
                              name={
                                star <= (isEditing ? editingRating : item.rating)
                                  ? 'star.fill'
                                  : 'star'
                              }
                              size={14}
                              tintColor={
                                star <= (isEditing ? editingRating : item.rating)
                                  ? Theme.colors.warning
                                  : Theme.colors.textMuted
                              }
                              style={{ marginRight: 2 }}
                            />
                          ))}
                        </View>
                      </View>

                      {/* Comment body */}
                      {isEditing ? (
                        <View style={styles.editCommentWrapper}>
                          {/* Rating select for edit */}
                          <View style={styles.ratingSelectRowSmall}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <TouchableOpacity key={star} onPress={() => setEditingRating(star)}>
                                <AppIcon
                                  name={star <= editingRating ? 'star.fill' : 'star'}
                                  size={18}
                                  tintColor={star <= editingRating ? Theme.colors.warning : Theme.colors.textMuted}
                                />
                              </TouchableOpacity>
                            ))}
                          </View>
                          <TextInput
                            style={styles.commentEditInput}
                            value={editingText}
                            onChangeText={setEditingText}
                            multiline
                          />
                          <View style={styles.editActionsRow}>
                            <TouchableOpacity
                              style={[styles.editBtnSave, { backgroundColor: Theme.colors.primary }]}
                              onPress={() => saveEditComment(item.id)}
                            >
                              <Text style={styles.editBtnText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editBtnCancel} onPress={cancelEditComment}>
                              <Text style={styles.editBtnText}>Cancel</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.commentContent}>{item.comment}</Text>
                      )}

                      {/* Actions for owner */}
                      {isOwner && !isEditing && (
                        <View style={styles.commentActions}>
                          <TouchableOpacity onPress={() => startEditComment(item)}>
                            <Text style={styles.actionText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteComment(item.id)}>
                            <Text style={[styles.actionText, { color: Theme.colors.danger }]}>
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </GlassView>
                  );
                })
              ) : (
                <Text style={styles.noCommentsText}>No reviews yet. Be the first to add one!</Text>
              )}
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: Theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTag: {
    position: 'absolute',
    bottom: Theme.spacing.md,
    left: Theme.spacing.lg,
    color: Theme.colors.white,
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    textTransform: 'uppercase',
  },
  infoWrapper: {
    padding: Theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
    lineHeight: 30,
  },
  organizerText: {
    fontSize: 14,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
    marginTop: 6,
    marginBottom: Theme.spacing.lg,
  },
  metaCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  metaInfo: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: Theme.fonts.medium,
  },
  metaValue: {
    fontSize: 14,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  actionsPanel: {
    marginBottom: Theme.spacing.xl,
  },
  registerButton: {
    height: 48,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Theme.spacing.md,
  },
  registeredButton: {
    backgroundColor: Theme.colors.success,
  },
  registerButtonText: {
    color: Theme.colors.white,
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
  subActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  actionIconBtn: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionIconLabel: {
    color: Theme.colors.text,
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textSecondary,
    lineHeight: 22,
  },
  commentFormCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
  },
  commentFormHeading: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  ratingSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    gap: 6,
  },
  ratingSelectLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: Theme.fonts.medium,
  },
  commentInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
    color: Theme.colors.text,
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    textAlignVertical: 'top',
    height: 72,
    marginBottom: Theme.spacing.md,
  },
  submitCommentBtn: {
    height: 38,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitCommentText: {
    color: Theme.colors.white,
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
  loginToCommentCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  loginToCommentText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
  },
  commentsList: {
    gap: Theme.spacing.md,
  },
  commentItem: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  commentUserName: {
    color: Theme.colors.text,
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
  commentDate: {
    color: Theme.colors.textMuted,
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
  },
  commentContent: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: Theme.spacing.sm,
  },
  actionText: {
    color: Theme.colors.secondary,
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
  },
  noCommentsText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
    textAlign: 'center',
    paddingVertical: 10,
  },
  // Edit comment sub-elements
  editCommentWrapper: {
    marginTop: Theme.spacing.xs,
    width: '100%',
  },
  ratingSelectRowSmall: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.sm,
    gap: 4,
  },
  commentEditInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
    color: Theme.colors.text,
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    height: 60,
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Theme.spacing.sm,
    justifyContent: 'flex-end',
  },
  editBtnSave: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
  },
  editBtnCancel: {
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
  },
  editBtnText: {
    color: Theme.colors.white,
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
  },
});
