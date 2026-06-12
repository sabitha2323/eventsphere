import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  image_url: string;
}

interface Registration {
  id: string;
  event_id: string;
  events: Event; // Supabase FK many-to-one returns a single object
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function UserDashboardScreen() {
  const [activeTab, setActiveTab] = useState<'profile' | 'registrations' | 'notifications' | 'settings'>('profile');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const router = useRouter();

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile({
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone || '',
          });
          setEditName(profileData.name);
          setEditPhone(profileData.phone || '');
        }

        // 2. Fetch Registrations
        const { data: regsData } = await supabase
          .from('registrations')
          .select('id, event_id, events(*)')
          .eq('user_id', user.id);
        
        const formattedRegs: Registration[] = (regsData || []).map((reg: any) => ({
          id: reg.id,
          event_id: reg.event_id,
          events: Array.isArray(reg.events) ? reg.events[0] : reg.events,
        })).filter((reg: any) => reg.events !== null && reg.events !== undefined);
        
        setRegistrations(formattedRegs);

        // 3. Fetch Notifications
        const { data: notifsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setNotifications(notifsData || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    setUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editName.trim(),
          phone: editPhone.trim(),
        })
        .eq('id', currentUser.id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setProfile((prev) => ({
          ...prev,
          name: editName.trim(),
          phone: editPhone.trim(),
        }));
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        console.error(error.message);
      } else {
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(error.message);
      } else {
        setNotifications(notifications.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelRegistration = (regId: string, eventTitle: string, eventId: string) => {
    Alert.alert(
      'Cancel Registration',
      `Are you sure you want to cancel your registration for "${eventTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('registrations')
                .delete()
                .eq('id', regId);

              if (error) {
                Alert.alert('Error', error.message);
              } else {
                setRegistrations(registrations.filter((r) => r.id !== regId));
                Alert.alert('Registration Cancelled', `You are no longer registered for ${eventTitle}.`);
              }
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          // Root Layout listener will handle redirection to Login Screen
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=7C3AED&color=ffffff&size=120&font-size=0.4` }}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileEmail}>{profile.email}</Text>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.tabActive]}
          onPress={() => setActiveTab('profile')}
        >
          <AppIcon
            name="person.crop.circle"
            size={18}
            tintColor={activeTab === 'profile' ? Theme.colors.secondary : Theme.colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'registrations' && styles.tabActive]}
          onPress={() => setActiveTab('registrations')}
        >
          <AppIcon
            name="ticket"
            size={18}
            tintColor={activeTab === 'registrations' ? Theme.colors.secondary : Theme.colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'registrations' && styles.tabLabelActive]}>
            Tickets
          </Text>
          {registrations.length > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>{registrations.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'notifications' && styles.tabActive]}
          onPress={() => setActiveTab('notifications')}
        >
          <AppIcon
            name="bell"
            size={18}
            tintColor={activeTab === 'notifications' ? Theme.colors.secondary : Theme.colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'notifications' && styles.tabLabelActive]}>
            Inbox
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.badgeCount, { backgroundColor: Theme.colors.danger }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <AppIcon
            name="gearshape"
            size={18}
            tintColor={activeTab === 'settings' ? Theme.colors.secondary : Theme.colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Tab Screen Content */}
      <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <GlassView style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Account Details</Text>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text style={styles.editBtn}>Edit Profile</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.detailInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your Full Name"
                  placeholderTextColor={Theme.colors.textMuted}
                />
              ) : (
                <Text style={styles.detailValue}>{profile.name}</Text>
              )}
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={[styles.detailValue, { color: Theme.colors.textMuted }]}>
                {profile.email}
              </Text>
            </View>

            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.detailInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor={Theme.colors.textMuted}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.detailValue}>{profile.phone || 'Not provided'}</Text>
              )}
            </View>

            {isEditing && (
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: Theme.colors.primary }]}
                  onPress={handleUpdateProfile}
                  disabled={updatingProfile}
                >
                  {updatingProfile ? (
                    <ActivityIndicator size="small" color={Theme.colors.white} />
                  ) : (
                    <Text style={styles.btnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                  <Text style={[styles.btnText, { color: Theme.colors.text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassView>
        )}

        {/* REGISTRATIONS TAB */}
        {activeTab === 'registrations' && (
          <View style={styles.listWrapper}>
            {registrations.length > 0 ? (
              registrations.map((item) => (
                <GlassView key={item.id} style={styles.regCard} intensity="low">
                  <Image
                    source={{ uri: item.events.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=200' }}
                    style={styles.regImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                  <View style={styles.regDetails}>
                    <Text style={styles.regTitle} numberOfLines={2}>
                      {item.events.title}
                    </Text>
                    <Text style={styles.regMeta}>
                      {formatDate(item.events.date)} • {item.events.time.split(' ')[0]}
                    </Text>
                    <Text style={styles.regLocation} numberOfLines={1}>
                      {item.events.venue}
                    </Text>
                    <View style={styles.regActions}>
                      <TouchableOpacity
                        style={[styles.regBtn, { backgroundColor: Theme.colors.primary }]}
                        onPress={() => router.push(`/event/${item.event_id}`)}
                      >
                        <Text style={styles.regBtnText}>Details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.regBtnDanger}
                        onPress={() =>
                          handleCancelRegistration(item.id, item.events.title, item.event_id)
                        }
                      >
                        <Text style={styles.regBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassView>
              ))
            ) : (
              <GlassView style={styles.emptyCard} intensity="low">
                <AppIcon name="ticket" size={40} tintColor={Theme.colors.textMuted} />
                <Text style={styles.emptyCardText}>No active registrations found.</Text>
                <TouchableOpacity
                  style={[styles.emptyBtn, { backgroundColor: Theme.colors.primary }]}
                  onPress={() => router.push('/(tabs)')}
                >
                  <Text style={styles.emptyBtnText}>Explore Events</Text>
                </TouchableOpacity>
              </GlassView>
            )}
          </View>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <View style={styles.listWrapper}>
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <GlassView
                  key={item.id}
                  style={[styles.notifCard, !item.read && styles.notifUnread]}
                  intensity={item.read ? 'low' : 'high'}
                >
                  <TouchableOpacity
                    style={styles.notifMain}
                    onPress={() => markNotificationRead(item.id)}
                  >
                    <View style={styles.notifHeaderRow}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMsg}>{item.message}</Text>
                    <Text style={styles.notifTime}>
                      {new Date(item.created_at).toLocaleDateString()} at{' '}
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.notifDeleteBtn}
                    onPress={() => deleteNotification(item.id)}
                  >
                    <AppIcon name="trash" size={16} tintColor={Theme.colors.danger} />
                  </TouchableOpacity>
                </GlassView>
              ))
            ) : (
              <GlassView style={styles.emptyCard} intensity="low">
                <AppIcon name="bell.slash" size={40} tintColor={Theme.colors.textMuted} />
                <Text style={styles.emptyCardText}>No notifications yet.</Text>
              </GlassView>
            )}
          </View>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <View style={styles.listWrapper}>
            <GlassView style={styles.card}>
              <Text style={styles.cardTitle}>App Information</Text>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Version</Text>
                <Text style={styles.settingsValue}>1.0.0 (Expo SDK 56)</Text>
              </View>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Theme Configuration</Text>
                <Text style={styles.settingsValue}>Vibrant Light theme (Purple/Blue/White)</Text>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.settingsLabel}>Low-code AI Generation</Text>
                <Text style={styles.settingsValue}>Production Ready</Text>
              </View>
            </GlassView>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
              <AppIcon name="power" size={16} tintColor={Theme.colors.danger} />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  backgroundAccent1: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 194, 255, 0.08)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
    zIndex: -1,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    paddingBottom: Theme.spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    marginBottom: Theme.spacing.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 20,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.02)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    gap: 6,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
  },
  tabLabelActive: {
    color: Theme.colors.secondary,
    fontWeight: '600',
  },
  badgeCount: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: Theme.colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Theme.colors.white,
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  tabContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 120,
  },
  listWrapper: {
    gap: Theme.spacing.md,
  },
  card: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  editBtn: {
    color: Theme.colors.secondary,
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
  },
  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
    paddingVertical: Theme.spacing.md,
  },
  detailLabel: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
  },
  detailInput: {
    fontSize: 15,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Theme.spacing.lg,
  },
  saveBtn: {
    flex: 1,
    height: 40,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: Theme.colors.white,
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
  regCard: {
    flexDirection: 'row',
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.md,
  },
  regImage: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.sm,
  },
  regDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  regTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  regMeta: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  regLocation: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  regActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Theme.spacing.sm,
  },
  regBtn: {
    flex: 1,
    height: 28,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regBtnDanger: {
    flex: 1,
    height: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regBtnText: {
    color: Theme.colors.white,
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
  },
  emptyCard: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: 20,
  },
  emptyCardText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontFamily: Theme.fonts.medium,
  },
  emptyBtn: {
    height: 38,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  emptyBtnText: {
    color: Theme.colors.white,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
  notifCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  notifUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Theme.colors.primary,
  },
  notifMain: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    color: Theme.colors.text,
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.secondary,
  },
  notifMsg: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
    marginTop: 4,
    lineHeight: 18,
  },
  notifTime: {
    color: Theme.colors.textMuted,
    fontSize: 10,
    fontFamily: Theme.fonts.regular,
    marginTop: 6,
  },
  notifDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.05)',
  },
  settingsLabel: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.medium,
  },
  settingsValue: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  logoutBtn: {
    height: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: Theme.spacing.lg,
  },
  logoutBtnText: {
    color: Theme.colors.danger,
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
  },
});
