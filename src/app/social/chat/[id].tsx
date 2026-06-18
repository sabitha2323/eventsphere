import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function LiveChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchEventAndMessages();

    // Listen to live chat changes if connected to real Supabase
    const subscription = supabase
      .channel(`event-chat-${eventId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats', filter: `event_id=eq.${eventId}` }, (payload: any) => {
        setMessages(prev => [...prev, payload.new]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [eventId]);

  const fetchEventAndMessages = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }

      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (eventData) setEvent(eventData);

      const { data: chatData } = await supabase
        .from('chats')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      const fetchedMsgs = chatData || [];
      if (fetchedMsgs.length === 0) {
        // Seed default dummy messages for offline preview
        fetchedMsgs.push(
          { id: 'm1', user_name: 'Rahul Kumar', message: 'Hey guys! Super excited for this event!', created_at: new Date(Date.now() - 50000).toISOString(), user_id: 'other-1' },
          { id: 'm2', user_name: 'Pooja Sharma', message: 'Is anyone traveling from South Bengaluru? Wanna carpool?', created_at: new Date(Date.now() - 30000).toISOString(), user_id: 'other-2' },
          { id: 'm3', user_name: 'Vikram Singh', message: 'Sound check sounds massive! Get ready!', created_at: new Date(Date.now() - 10000).toISOString(), user_id: 'other-3' }
        );
      }

      setMessages(fetchedMsgs);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const msgText = inputMessage.trim();
    setInputMessage('');

    try {
      const uName = currentUser?.email ? currentUser.email.split('@')[0] : 'Guest';
      const newMsg = {
        event_id: eventId,
        user_id: currentUser?.id || 'mock-user-id',
        user_name: uName,
        message: msgText,
      };

      // Try inserting into database
      const { data, error } = await supabase.from('chats').insert(newMsg).select();

      if (error) {
        // Fallback for offline/mock insert
        const fallbackMsg = {
          id: String(Date.now()),
          ...newMsg,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, fallbackMsg]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      } else if (data) {
        // Handled by channel subscription, but add just in case subscription hasn't fired
        if (!messages.some(m => m.id === data[0].id)) {
          setMessages(prev => [...prev, data[0]]);
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <AppIcon name="chevron.left" size={20} tintColor={Theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {event?.title ? `${event.title} Chat` : 'Event Chat'}
          </Text>
          <Text style={styles.headerSubtitle}>Attendees Discussion Room</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatScroll}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(msg => {
              const isOwn = msg.user_id === currentUser?.id;
              return (
                <View
                  key={msg.id}
                  style={[styles.messageRow, isOwn ? styles.ownMessageRow : styles.otherMessageRow]}
                >
                  {!isOwn && <Text style={styles.senderName}>{msg.user_name}</Text>}
                  <GlassView
                    style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}
                    intensity="low"
                  >
                    <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
                      {msg.message}
                    </Text>
                  </GlassView>
                  <Text style={styles.messageTime}>
                    {new Date(msg.created_at || Date.now()).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Chat entry bar */}
          <GlassView style={styles.inputBar} intensity="medium">
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor={Theme.colors.textMuted}
              value={inputMessage}
              onChangeText={setInputMessage}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              {...Platform.select({
                web: { outlineStyle: 'none' } as any,
              })}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
              <AppIcon name="paperplane.fill" size={16} tintColor="#fff" />
            </TouchableOpacity>
          </GlassView>
        </View>
      )}
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 10,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  chatScroll: {
    padding: Theme.spacing.md,
    paddingBottom: 20,
    gap: Theme.spacing.md,
  },
  messageRow: {
    maxWidth: '75%',
    gap: 3,
  },
  ownMessageRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.md,
  },
  ownBubble: {
    backgroundColor: Theme.colors.primary,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(15, 23, 42, 0.05)',
    borderWidth: 1,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    lineHeight: 18,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: Theme.colors.text,
  },
  messageTime: {
    fontSize: 9,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
    marginTop: 2,
    marginHorizontal: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    gap: Theme.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : Theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: Theme.spacing.md,
    color: Theme.colors.text,
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
