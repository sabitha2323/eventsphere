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
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';

export default function AnalyticsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sales: 0,
    tickets: 0,
    checkInRate: 78,
    promoDiscount: 2450,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const { data: events } = await supabase.from('events').select('*');
      const { data: regs } = await supabase.from('registrations').select('*');

      const evs = events || [];
      const registrations = regs || [];

      let totalSales = 0;
      evs.forEach((e: any) => {
        const count = registrations.filter((r: any) => r.event_id === e.id).length;
        totalSales += count * e.ticket_price;
      });

      setStats({
        sales: totalSales,
        tickets: registrations.length,
        checkInRate: registrations.length > 0 ? 82 : 0,
        promoDiscount: registrations.length * 50, // simulated
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <AppIcon name="chart.bar.fill" size={18} tintColor={Theme.colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Overall Indicators */}
        <GlassView style={styles.overallStatsCard} intensity="medium">
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>ESTIMATED REVENUE</Text>
            <Text style={styles.statMainValue}>₹{stats.sales}</Text>
          </View>
          <View style={styles.statRight}>
            <Text style={styles.trendingText}>+14.2%</Text>
            <Text style={styles.trendingLabel}>vs last month</Text>
          </View>
        </GlassView>

        {loading ? (
          <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={{ gap: 16 }}>
            {/* Visual Simulated SVG Chart */}
            <GlassView style={styles.chartCard} intensity="low">
              <Text style={styles.chartTitle}>Ticket Sales Trend</Text>
              
              {/* Graphic Chart representation */}
              <View style={styles.visualChart}>
                <View style={styles.chartLineContainer}>
                  {/* Grid Lines */}
                  <View style={styles.chartGridLine} />
                  <View style={styles.chartGridLine} />
                  <View style={styles.chartGridLine} />
                  
                  {/* Simulated SVG Graph Path */}
                  <View style={styles.simulatedPathContainer}>
                    {/* Simulated bars/path using layout elements to be cross-platform */}
                    <View style={[styles.barColumn, { height: '35%', backgroundColor: Theme.colors.primaryLight }]} />
                    <View style={[styles.barColumn, { height: '55%', backgroundColor: Theme.colors.primaryLight }]} />
                    <View style={[styles.barColumn, { height: '40%', backgroundColor: Theme.colors.primaryLight }]} />
                    <View style={[styles.barColumn, { height: '75%', backgroundColor: Theme.colors.primaryLight }]} />
                    <View style={[styles.barColumn, { height: '90%', backgroundColor: Theme.colors.primary }]} />
                    <View style={[styles.barColumn, { height: '85%', backgroundColor: Theme.colors.primary }]} />
                  </View>
                </View>

                {/* X Axis Labels */}
                <View style={styles.chartXLabels}>
                  <Text style={styles.chartXLabel}>Jan</Text>
                  <Text style={styles.chartXLabel}>Feb</Text>
                  <Text style={styles.chartXLabel}>Mar</Text>
                  <Text style={styles.chartXLabel}>Apr</Text>
                  <Text style={styles.chartXLabel}>May</Text>
                  <Text style={styles.chartXLabel}>Jun</Text>
                </View>
              </View>
            </GlassView>

            {/* Metric Details list */}
            <View style={styles.gridRow}>
              <GlassView style={styles.smallCard} intensity="low">
                <Text style={styles.smallCardLabel}>Tickets Issued</Text>
                <Text style={styles.smallCardValue}>{stats.tickets}</Text>
                <Text style={styles.smallCardSub}>Active registrations</Text>
              </GlassView>

              <GlassView style={styles.smallCard} intensity="low">
                <Text style={styles.smallCardLabel}>Check-in Rate</Text>
                <Text style={styles.smallCardValue}>{stats.checkInRate}%</Text>
                <Text style={styles.smallCardSub}>Scan rate at door</Text>
              </GlassView>
            </View>

            <View style={styles.gridRow}>
              <GlassView style={styles.smallCard} intensity="low">
                <Text style={styles.smallCardLabel}>Coupon Savings</Text>
                <Text style={styles.smallCardValue}>₹{stats.promoDiscount}</Text>
                <Text style={styles.smallCardSub}>Promo deductions</Text>
              </GlassView>

              <GlassView style={styles.smallCard} intensity="low">
                <Text style={styles.smallCardLabel}>Net Earnings</Text>
                <Text style={styles.smallCardValue}>₹{stats.sales - stats.promoDiscount}</Text>
                <Text style={styles.smallCardSub}>After promo deductions</Text>
              </GlassView>
            </View>

            {/* Category Performance Breakdown */}
            <GlassView style={styles.categoryReportCard} intensity="low">
              <Text style={styles.chartTitle}>Registrations by Category</Text>
              
              <View style={styles.catPerformanceList}>
                <View style={styles.catPerformanceItem}>
                  <View style={styles.catLabelRow}>
                    <Text style={styles.catName}>Technology</Text>
                    <Text style={styles.catPercent}>45%</Text>
                  </View>
                  <View style={styles.catProgressBarContainer}>
                    <View style={[styles.catProgressBar, { width: '45%', backgroundColor: Theme.colors.categories.Technology }]} />
                  </View>
                </View>

                <View style={styles.catPerformanceItem}>
                  <View style={styles.catLabelRow}>
                    <Text style={styles.catName}>Music</Text>
                    <Text style={styles.catPercent}>30%</Text>
                  </View>
                  <View style={styles.catProgressBarContainer}>
                    <View style={[styles.catProgressBar, { width: '30%', backgroundColor: Theme.colors.categories.Music }]} />
                  </View>
                </View>

                <View style={styles.catPerformanceItem}>
                  <View style={styles.catLabelRow}>
                    <Text style={styles.catName}>Workshops</Text>
                    <Text style={styles.catPercent}>15%</Text>
                  </View>
                  <View style={styles.catProgressBarContainer}>
                    <View style={[styles.catProgressBar, { width: '15%', backgroundColor: Theme.colors.categories.Workshops }]} />
                  </View>
                </View>
              </View>
            </GlassView>
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
  overallStatsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
  },
  statInfo: {
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.textMuted,
  },
  statMainValue: {
    fontSize: 26,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  statRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  trendingText: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    fontWeight: '700',
    color: Theme.colors.success,
  },
  trendingLabel: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  chartCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  chartTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  visualChart: {
    height: 150,
    gap: 8,
  },
  chartGridLine: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    width: '100%',
  },
  chartLineContainer: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
    paddingBottom: 4,
  },
  simulatedPathContainer: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  barColumn: {
    width: '10%',
    borderRadius: 4,
  },
  chartXLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  chartXLabel: {
    fontSize: 10,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.textMuted,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallCard: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: 4,
  },
  smallCardLabel: {
    fontSize: 11,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textMuted,
  },
  smallCardValue: {
    fontSize: 20,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  smallCardSub: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.regular,
  },
  categoryReportCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  catPerformanceList: {
    gap: 12,
  },
  catPerformanceItem: {
    gap: 6,
  },
  catLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.textSecondary,
  },
  catPercent: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
  },
  catProgressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.04)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
