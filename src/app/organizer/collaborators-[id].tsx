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

export default function CollaboratorsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [emailSearch, setEmailSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (eventData) setEvent(eventData);

      // Simulate event collaborator list.
      // We will look for all admin users and add them as mock collaborators for representation,
      // and allow the user to add new ones.
      const { data: users } = await supabase.from('users').select('*');
      const allUsers = users || [];

      // Initially seed with Admin User as co-host
      const seededCollabs = allUsers.filter((u: any) => u.role === 'admin').map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: 'Co-Host',
      }));

      setCollaborators(seededCollabs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!emailSearch.trim()) {
      Alert.alert('Validation Error', 'Please enter a user email.');
      return;
    }

    setSubmitting(true);
    try {
      // Find user matching this email in our mock DB
      const { data: users } = await supabase.from('users').select('*');
      const targetUser = (users || []).find(
        (u: any) => u.email.toLowerCase() === emailSearch.trim().toLowerCase()
      );

      if (!targetUser) {
        Alert.alert('User Not Found', 'No EventSphere account matches this email address.');
        setSubmitting(false);
        return;
      }

      // Check if already a collaborator
      if (collaborators.some(c => c.email.toLowerCase() === targetUser.email.toLowerCase())) {
        Alert.alert('Duplicate', 'This user is already a collaborator for this event.');
        setSubmitting(false);
        return;
      }

      const newCollab = {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: 'Manager',
      };

      setCollaborators([...collaborators, newCollab]);
      setEmailSearch('');
      Alert.alert('Success', `"${newCollab.name}" is now a manager for this event.`);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveCollaborator = (collabId: string, name: string) => {
    Alert.alert(
      'Remove Collaborator',
      `Are you sure you want to revoke organizer access for "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: () => {
            setCollaborators(collaborators.filter(c => c.id !== collabId));
            Alert.alert('Access Revoked', `"${name}" no longer has editing rights for this event.`);
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Event Collaborators</Text>
          {event && <Text style={styles.headerSubtitle} numberOfLines={1}>{event.title}</Text>}
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Add collaborator Input */}
        <GlassView style={styles.formCard} intensity="medium">
          <Text style={styles.formTitle}>Add Co-Host / Editor</Text>
          <Text style={styles.formDesc}>
            Enter the registered email address of the user you wish to grant manager privileges to. They will be able to check in attendees and edit event details.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. cohost@eventsphere.com"
              placeholderTextColor={Theme.colors.textMuted}
              value={emailSearch}
              onChangeText={setEmailSearch}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddCollaborator} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addBtnText}>Invite</Text>
              )}
            </TouchableOpacity>
          </View>
        </GlassView>

        {/* Collaborators list */}
        <Text style={styles.sectionLabel}>Active Managers ({collaborators.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        ) : (
          <View style={styles.collabList}>
            {collaborators.map(item => (
              <GlassView key={item.id} style={styles.collabCard} intensity="low">
                <View style={styles.collabLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.collabName}>{item.name}</Text>
                    <Text style={styles.collabEmail}>{item.email}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{item.role}</Text>
                    </View>
                  </View>
                </View>

                {item.role !== 'Co-Host' && (
                  <TouchableOpacity
                    onPress={() => handleRemoveCollaborator(item.id, item.name)}
                    style={styles.removeBtn}
                  >
                    <AppIcon name="trash" size={16} tintColor={Theme.colors.danger} />
                  </TouchableOpacity>
                )}
              </GlassView>
            ))}
          </View>
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
  formCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 10,
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
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  textInput: {
    flex: 1,
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
  addBtn: {
    paddingHorizontal: Theme.spacing.md,
    height: 40,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  collabList: {
    gap: 10,
  },
  collabCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collabLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
  },
  collabName: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  collabEmail: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 1,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
  },
  removeBtn: {
    padding: 8,
  },
});
