import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function LineupMusicPlayerScreen() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('Neon Dreams - DJ Alok Live');

  const tracks = [
    { title: 'Neon Dreams (Extended Festival Mix)', artist: 'DJ Alok', duration: '4:15' },
    { title: 'Acoustic Horizon (Live Version)', artist: 'Anirudh Ravichander', duration: '3:45' },
    { title: 'Cyber Pulse Techno Symphony', artist: 'Charlotte de Witte', duration: '5:10' },
    { title: 'Midnight Basslines', artist: 'Skrillex & Friends', duration: '3:58' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Artist Lineup Preview Player</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Player Widget */}
        <View style={styles.playerCard}>
          <Text style={styles.nowPlayingLabel}>NOW PLAYING LINEUP SAMPLE</Text>
          <Text style={styles.trackTitle}>{currentTrack}</Text>
          <View style={styles.waveBar} />

          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.playBtn}>
              <AppIcon name={isPlaying ? 'pause.fill' : 'play.fill'} size={24} tintColor="#0B132B" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Headliner Tracks</Text>
        <View style={styles.trackList}>
          {tracks.map((t, idx) => (
            <TouchableOpacity key={idx} style={styles.trackRow} onPress={() => { setCurrentTrack(t.title); setIsPlaying(true); }}>
              <View>
                <Text style={styles.tTitle}>{t.title}</Text>
                <Text style={styles.tArtist}>{t.artist}</Text>
              </View>
              <Text style={styles.tDuration}>{t.duration}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  playerCard: { backgroundColor: '#1C2541', padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#38BDF8' },
  nowPlayingLabel: { fontSize: 10, fontFamily: Theme.fonts.bold, color: '#38BDF8', letterSpacing: 1 },
  trackTitle: { fontSize: 18, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginVertical: 12, textAlign: 'center' },
  waveBar: { width: '80%', height: 4, backgroundColor: '#38BDF8', borderRadius: 2, marginVertical: 12 },
  controlsRow: { marginTop: 8 },
  playBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#6FFFE9', justifyContent: 'center', alignItems: 'center' },
  sectionHeader: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginBottom: 12 },
  trackList: { gap: 10 },
  trackRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#1C2541', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  tTitle: { fontSize: 13, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  tArtist: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  tDuration: { fontSize: 12, color: '#38BDF8', fontFamily: Theme.fonts.medium },
});
