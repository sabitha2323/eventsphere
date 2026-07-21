import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  recommendations?: Array<{
    id: string;
    title: string;
    category: string;
    price: string;
    route: string;
  }>;
}

export default function AIAssistantScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Hello! I am your EventSphere AI Concierge 🤖. Ask me for event recommendations, venue budgeting, or planning advice!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendations: [
        { id: 'rec-1', title: 'Neon Beats Music Festival', category: 'Music', price: '₹1,499', route: '/event/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' },
        { id: 'rec-2', title: 'Heritage & Roots Cultural Expo', category: 'Cultural', price: 'FREE', route: '/event/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' },
      ],
    },
  ]);

  const quickPrompts = [
    '💎 View 3D Holographic VIP Pass',
    '💺 Open Stage Seat Picker',
    '💳 Pay via Razorpay Gateway',
    '🎵 Recommend popular music fests',
    '🎉 Find free cultural events near me',
    '💻 Show top tech hackathons this month',
    '💰 Help me plan a venue budget',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    setTimeout(() => {
      let responseText = 'Here are the best events matching your preference:';
      let recs: any[] = [];

      const lower = query.toLowerCase();
      if (lower.includes('music') || lower.includes('fest')) {
        responseText = 'Based on your music interest, here are top-rated upcoming concerts:';
        recs = [
          { id: 'r-1', title: 'Neon Beats Music Festival', category: 'Music', price: '₹1,499', route: '/event/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' },
          { id: 'r-2', title: 'Gourmet Street Food & Music Fest', category: 'Food Festival', price: '₹150', route: '/event/e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b' },
        ];
      } else if (lower.includes('free') || lower.includes('cultural')) {
        responseText = 'Here are verified free events with open entry:';
        recs = [
          { id: 'r-3', title: 'Heritage & Roots Cultural Expo', category: 'Cultural', price: 'FREE', route: '/event/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' },
          { id: 'r-4', title: 'Global AI & Sustainability Summit', category: 'Seminar', price: 'FREE', route: '/event/h8i9j0k1-l2m3-4n5o-6p7q-8r9s0t1u2v3w' },
        ];
      } else if (lower.includes('tech') || lower.includes('hack')) {
        responseText = 'Check out these top developer hackathons & tech summits:';
        recs = [
          { id: 'r-5', title: 'TechPulse 2026 Hackathon', category: 'Technology', price: '₹250', route: '/event/c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f' },
          { id: 'r-6', title: 'Fintech Frontiers Hackathon 2026', category: 'Hackathon', price: '₹300', route: '/event/i9j0k1l2-m3n4-5o6p-7q8r-9s0t1u2v3w4x' },
        ];
      } else if (lower.includes('budget') || lower.includes('plan')) {
        responseText = 'I recommend trying our specialized Organizer Event Budget Calculator to project venue costs, catering, and ticket revenue!';
        recs = [
          { id: 'r-7', title: 'Launch Budget Calculator', category: 'Organizer Utility', price: 'Tools', route: '/organizer/budget-calculator' },
        ];
      } else {
        responseText = `I found several exciting choices for "${query}":`;
        recs = [
          { id: 'r-8', title: 'Campus Spark Inter-College Fest', category: 'College', price: '₹150', route: '/event/g7h8i9j0-k1l2-3m4n-5o6p-7q8r9s0t1u2v' },
          { id: 'r-9', title: 'Creative Writing & Storytelling Workshop', category: 'Workshops', price: '₹500', route: '/event/f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c' },
        ];
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: recs,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor={Theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>AI Event Concierge</Text>
          <Text style={styles.headerSubtitle}>Smart Assistant & Recommendations</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.chatList} keyboardShouldPersistTaps="handled">
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.msgContainer,
              m.sender === 'user' ? styles.userMsgContainer : styles.aiMsgContainer,
            ]}
          >
            <GlassView style={[styles.msgBubble, m.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.msgText, m.sender === 'user' ? styles.userMsgText : styles.aiMsgText]}>
                {m.text}
              </Text>
              <Text style={styles.timeText}>{m.timestamp}</Text>
            </GlassView>

            {m.recommendations && m.recommendations.length > 0 && (
              <View style={styles.recContainer}>
                {m.recommendations.map((rec) => (
                  <TouchableOpacity
                    key={rec.id}
                    style={styles.recCard}
                    onPress={() => router.push(rec.route as any)}
                  >
                    <View style={styles.recHeader}>
                      <Text style={styles.recCategory}>{rec.category}</Text>
                      <Text style={styles.recPrice}>{rec.price}</Text>
                    </View>
                    <Text style={styles.recTitle}>{rec.title}</Text>
                    <Text style={styles.recAction}>View Details & Register →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Theme.colors.primary} />
            <Text style={styles.loadingText}>AI is finding best options...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickPromptsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsContent}>
          {quickPrompts.map((p, idx) => (
            <TouchableOpacity key={idx} style={styles.promptChip} onPress={() => handleSend(p)}>
              <Text style={styles.promptChipText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask for events, budgets, or recommendations..."
          placeholderTextColor={Theme.colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
          <AppIcon name="paperplane.fill" size={18} tintColor={Theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'web' ? Theme.spacing.md : Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.glassBorder,
  },
  backBtn: {
    padding: Theme.spacing.xs,
    marginRight: Theme.spacing.md,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
  },
  chatList: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  msgContainer: {
    marginBottom: Theme.spacing.md,
    maxWidth: '85%',
  },
  userMsgContainer: {
    alignSelf: 'flex-end',
  },
  aiMsgContainer: {
    alignSelf: 'flex-start',
  },
  msgBubble: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
  },
  userBubble: {
    backgroundColor: Theme.colors.primary,
  },
  aiBubble: {
    backgroundColor: Theme.colors.backgroundCard,
    borderColor: Theme.colors.glassBorder,
    borderWidth: 1,
  },
  msgText: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    lineHeight: 20,
  },
  userMsgText: {
    color: Theme.colors.white,
  },
  aiMsgText: {
    color: Theme.colors.text,
  },
  timeText: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  recContainer: {
    marginTop: Theme.spacing.sm,
    gap: Theme.spacing.xs,
  },
  recCard: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.glassPrimaryBorder,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recCategory: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
  },
  recPrice: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.success,
  },
  recTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  recAction: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.secondary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
    paddingVertical: Theme.spacing.sm,
  },
  loadingText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  quickPromptsRow: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.glassBorder,
    paddingVertical: Theme.spacing.sm,
  },
  promptsContent: {
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  promptChip: {
    backgroundColor: Theme.colors.glassPrimaryBg,
    borderColor: Theme.colors.glassPrimaryBorder,
    borderWidth: 1,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.round,
  },
  promptChipText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.medium,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.glassBorder,
    backgroundColor: Theme.colors.white,
    gap: Theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.round,
    paddingHorizontal: Theme.spacing.md,
    color: Theme.colors.text,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
