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

export default function TicketTiersScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: eventData } = await supabase.from('events').select('*').eq('id', eventId).single();
      if (eventData) setEvent(eventData);

      const { data: tiersData } = await supabase.from('ticket_tiers').select('*').eq('event_id', eventId);
      setTiers(tiersData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTier = async () => {
    if (!name.trim() || !price || !quantity) {
      Alert.alert('Validation Error', 'Please complete all ticket tier fields.');
      return;
    }

    const priceNum = parseFloat(price);
    const qtyNum = parseInt(quantity);

    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Validation Error', 'Price must be a valid number.');
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 1) {
      Alert.alert('Validation Error', 'Ticket quantity must be a positive integer.');
      return;
    }

    setSubmitting(true);
    try {
      const newTier = {
        event_id: eventId,
        name: name.trim(),
        price: priceNum,
        quantity: qtyNum,
        sold: 0,
      };

      const { error } = await supabase.from('ticket_tiers').insert(newTier);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Tier Created', `Ticket tier "${newTier.name}" added successfully.`);
        setName('');
        setPrice('');
        setQuantity('');
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
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
          <Text style={styles.headerTitle}>Ticket Tiers & Pricing</Text>
          {event && <Text style={styles.headerSubtitle} numberOfLines={1}>{event.title}</Text>}
        </View>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Add Tier Form */}
        <GlassView style={styles.formCard} intensity="medium">
          <Text style={styles.formTitle}>Add New Ticket Tier</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tier Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. VIP Entrance Pass"
              placeholderTextColor={Theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Price (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2999"
                placeholderTextColor={Theme.colors.textMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Total Available</Text>
              <TextInput
                style={styles.textInput}
                placeholder="100"
                placeholderTextColor={Theme.colors.textMuted}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTier} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Create Ticket Tier</Text>
            )}
          </TouchableOpacity>
        </GlassView>

        {/* Existing Tiers progress listing */}
        <Text style={styles.sectionLabel}>Configured Tiers ({tiers.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        ) : (
          <View style={styles.tiersList}>
            {tiers.length > 0 ? (
              tiers.map(item => {
                const percent = Math.min(Math.round((item.sold / item.quantity) * 100), 100);
                return (
                  <GlassView key={item.id} style={styles.tierCard} intensity="low">
                    <View style={styles.tierHeaderRow}>
                      <View>
                        <Text style={styles.tierName}>{item.name}</Text>
                        <Text style={styles.tierSales}>
                          {item.sold} / {item.quantity} tickets claimed
                        </Text>
                      </View>
                      <Text style={styles.tierPrice}>₹{item.price}</Text>
                    </View>

                    {/* Progress sales bar */}
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${percent}%`, backgroundColor: Theme.colors.primary }]} />
                    </View>
                    
                    <View style={styles.tierFooter}>
                      <Text style={styles.percentText}>{percent}% Sold</Text>
                      <Text style={styles.revenueText}>Sales: ₹{item.sold * item.price}</Text>
                    </View>
                  </GlassView>
                );
              })
            ) : (
              <GlassView style={styles.emptyView} intensity="low">
                <Text style={styles.emptyText}>No ticket tiers configured. Standard event price applies.</Text>
              </GlassView>
            )}
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
    gap: 12,
  },
  formTitle: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  inputGroup: {
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  textInput: {
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
  submitBtn: {
    height: 40,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
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
  tiersList: {
    gap: 12,
  },
  tierCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 8,
  },
  tierHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tierName: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  tierSales: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  tierPrice: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.secondary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  tierFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  percentText: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
  },
  revenueText: {
    fontSize: 11,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
  },
  emptyView: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
});
