import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function LivePollsScreen() {
  const router = useRouter();
  const [voted, setVoted] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Event Q&A & Audience Polls</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pollCard}>
          <Text style={styles.pollTag}>LIVE STAGE AUDIENCE POLL</Text>
          <Text style={styles.pollQuestion}>Which Encore Song should DJ Alok perform next?</Text>

          {['⚡ Cyber Pulse Remix (64%)', '🎸 Acoustic Symphony (24%)', '🔥 Midnight Bass drop (12%)'].map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.optBtn, voted === opt && styles.optBtnSelected]}
              onPress={() => { setVoted(opt); Alert.alert('Vote Cast!', 'Your vote was submitted live to the stage screen!'); }}
            >
              <Text style={styles.optText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>Ask Speaker / DJ a Question</Text>
        <TouchableOpacity style={styles.qaBtn} onPress={() => Alert.alert('Submit Question', 'Type your question for the DJ stage Q&A session!')}>
          <Text style={styles.qaBtnText}>+ Ask Question on Stage Screen</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B132B' },
  header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 30, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  pollCard: { backgroundColor: '#1C2541', padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#38BDF8' },
  pollTag: { fontSize: 10, fontFamily: Theme.fonts.bold, color: '#38BDF8', letterSpacing: 1 },
  pollQuestion: { fontSize: 16, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginVertical: 12 },
  optBtn: { padding: 14, backgroundColor: '#0B132B', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  optBtnSelected: { borderColor: '#38BDF8', backgroundColor: '#1E3A8A' },
  optText: { fontSize: 13, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  sectionHeader: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginBottom: 12 },
  qaBtn: { height: 48, backgroundColor: '#2563EB', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  qaBtnText: { fontSize: 13, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
});
