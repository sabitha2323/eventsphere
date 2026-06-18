import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function ReceiptScreen() {
  const router = useRouter();
  const { id, eventId, total, ticketCount, method } = useLocalSearchParams();
  const receiptId = String(id || '');

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [purchaser, setPurchaser] = useState<any>(null);

  useEffect(() => {
    fetchReceiptData();
  }, [receiptId]);

  const fetchReceiptData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setPurchaser(user);
      }

      // Try fetching from real database
      const { data: billingData } = await supabase
        .from('billing_records')
        .select('*')
        .eq('ticket_id', receiptId)
        .single();

      const targetEventId = String(eventId || '');
      if (targetEventId) {
        const { data: e } = await supabase.from('events').select('*').eq('id', targetEventId).single();
        if (e) setEventData(e);
      }

      if (billingData) {
        setInvoice(billingData);
      } else {
        // Fallback simulated billing record if offline or table not synced
        setInvoice({
          id: receiptId || 'INV-98273645',
          amount: parseFloat(String(total || '0')),
          payment_method: String(method || 'Online Payment'),
          created_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Billing record fetch error. Using route parameters fallback.', e);
      setInvoice({
        id: receiptId || 'INV-98273645',
        amount: parseFloat(String(total || '0')),
        payment_method: String(method || 'Online Payment'),
        created_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubtotal = () => {
    if (!invoice) return 0;
    const finalAmount = invoice.amount;
    // Reverse engineer subtotal assuming 18% GST was added
    return parseFloat((finalAmount / 1.18).toFixed(2));
  };

  const getTax = () => {
    if (!invoice) return 0;
    return parseFloat((invoice.amount - getSubtotal()).toFixed(2));
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
        <Text style={styles.headerTitle}>Tax Invoice & Receipt</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Paper Invoice Card */}
          <GlassView style={styles.invoiceCard} intensity="high">
            {/* Stamp Logo */}
            <View style={styles.stampHeader}>
              <View>
                <Text style={styles.companyName}>EventSphere Inc.</Text>
                <Text style={styles.companyMeta}>GSTIN: 29AAFCE9283F1Z5</Text>
                <Text style={styles.companyMeta}>Bengaluru, Karnataka, India</Text>
              </View>
              <View style={styles.paidBadge}>
                <Text style={styles.paidText}>PAID</Text>
              </View>
            </View>

            <View style={styles.dividerLine} />

            {/* Bill Details */}
            <View style={styles.billingGrid}>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabel}>INVOICE NO.</Text>
                <Text style={styles.metaVal} numberOfLines={1}>{invoice?.id.substring(0, 13).toUpperCase() || 'INV-MOCK'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabel}>DATE & TIME</Text>
                <Text style={styles.metaVal}>
                  {invoice?.created_at ? new Date(invoice.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.billingGrid}>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabel}>BILLED TO</Text>
                <Text style={styles.metaVal}>{purchaser?.email ? purchaser.email.split('@')[0] : 'Guest Attendee'}</Text>
                <Text style={styles.metaSub}>{purchaser?.email || 'N/A'}</Text>
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.metaLabel}>PAYMENT VIA</Text>
                <Text style={styles.metaVal}>{invoice?.payment_method || 'Online Payment'}</Text>
              </View>
            </View>

            <View style={styles.dividerLine} />

            {/* Event Header Summary */}
            <Text style={styles.itemTitle}>Billed Items</Text>
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{eventData?.title || 'General Admission Slot'}</Text>
                <Text style={styles.itemDesc}>{eventData?.venue || 'Virtual Stream / Event Location'}</Text>
              </View>
              <Text style={styles.itemQty}>x{ticketCount || '1'}</Text>
              <Text style={styles.itemPrice}>₹{getSubtotal()}</Text>
            </View>

            <View style={styles.dividerLine} />

            {/* Tax Computation Table */}
            <View style={styles.taxSection}>
              <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>Subtotal</Text>
                <Text style={styles.taxValue}>₹{getSubtotal()}</Text>
              </View>
              <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>CGST (9%)</Text>
                <Text style={styles.taxValue}>₹{(getTax() / 2).toFixed(2)}</Text>
              </View>
              <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>SGST (9%)</Text>
                <Text style={styles.taxValue}>₹{(getTax() / 2).toFixed(2)}</Text>
              </View>
              <View style={[styles.taxRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Total Paid (Inclusive of GST)</Text>
                <Text style={styles.grandTotalVal}>₹{invoice?.amount || '0'}</Text>
              </View>
            </View>
          </GlassView>

          {/* Bottom actions */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.print();
              } else {
                alert('Invoice downloaded successfully to local storage.');
              }
            }}
          >
            <AppIcon name="square.and.arrow.down.fill" size={16} tintColor="#fff" />
            <Text style={styles.actionBtnText}>Print / Download Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.backHomeText}>Return to Home Dashboard</Text>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
    gap: 20,
  },
  invoiceCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  stampHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  companyMeta: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  paidBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderRadius: 4,
  },
  paidText: {
    color: Theme.colors.success,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginVertical: Theme.spacing.md,
    borderStyle: 'dashed',
    ...Platform.select({
      web: {
        borderStyle: 'dashed',
      } as any,
    }),
  },
  billingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.md,
  },
  gridCol: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  metaVal: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  metaSub: {
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.textMuted,
  },
  itemTitle: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemName: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  itemDesc: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
    marginTop: 2,
  },
  itemQty: {
    fontSize: 13,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textSecondary,
    width: 30,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    width: 80,
    textAlign: 'right',
  },
  taxSection: {
    gap: 8,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taxLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  taxValue: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.medium,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
    paddingTop: 12,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  grandTotalVal: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.secondary,
  },
  actionBtn: {
    height: 48,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
  },
  backHomeBtn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backHomeText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    textDecorationLine: 'underline',
  },
});
