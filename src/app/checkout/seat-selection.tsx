import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import { GlassView } from '@/components/GlassView';
import { AppIcon } from '@/components/AppIcon';
import { supabase } from '@/lib/supabase';

interface Seat {
  id: string;
  row: string;
  number: string;
  type: 'vip' | 'gold' | 'general';
  price: number;
}

export default function StageSeatPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const eventTitle = (params.eventTitle as string) || 'Neon Beats Music Festival';

  // Seed list of booked/occupied seats for realism (as state)
  const [bookedSeatsList, setBookedSeatsList] = useState<string[]>([
    'A-03', 'A-05', 'B-04', 'C-02', 'C-07', 'D-05', 'E-03', 'E-09', 'F-06', 'F-11'
  ]);

  // Load dynamically booked seats from mock/live database
  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('seat_no');
        
        if (data) {
          const loadedSeats = data
            .map((r: any) => r.seat_no)
            .filter((s: any) => !!s);
            
          setBookedSeatsList(prev => {
            const merged = [...new Set([...prev, ...loadedSeats])];
            return merged;
          });
        }
      } catch (err) {
        console.error('Error fetching booked seats:', err);
      }
    };
    
    fetchBookedSeats();
  }, []);

  // Grid Configuration
  const rows = [
    { name: 'A', type: 'vip', seatsCount: 8, price: 5000 },
    { name: 'B', type: 'vip', seatsCount: 8, price: 5000 },
    { name: 'C', type: 'gold', seatsCount: 10, price: 3500 },
    { name: 'D', type: 'gold', seatsCount: 10, price: 3500 },
    { name: 'E', type: 'general', seatsCount: 12, price: 1500 },
    { name: 'F', type: 'general', seatsCount: 12, price: 1500 },
  ];

  const [selectedSeatNo, setSelectedSeatNo] = useState('A-07');
  const [selectedPrice, setSelectedPrice] = useState(5000);
  const [selectedTierName, setSelectedTierName] = useState('Front Stage VIP Lounge');

  const handleSelectSeat = (seatId: string, type: string, price: number) => {
    if (bookedSeatsList.includes(seatId)) return; // Don't allow booking occupied seats

    setSelectedSeatNo(seatId);
    setSelectedPrice(price);
    
    // Set appropriate display tier name
    const tier = type === 'vip' ? 'Front Stage VIP Lounge'
               : type === 'gold' ? 'Golden Circle Stand'
               : 'General Arena Entry';
    setSelectedTierName(tier);
  };

  const getSeatColor = (seatId: string, type: 'vip' | 'gold' | 'general') => {
    if (selectedSeatNo === seatId) {
      return '#8B5CF6'; // Selected: Violet
    }
    if (bookedSeatsList.includes(seatId)) {
      return '#EF4444'; // Booked/Occupied: Red
    }
    // Color code based on tier
    if (type === 'vip') return '#F59E0B'; // VIP: Gold/Amber
    if (type === 'gold') return '#06B6D4'; // Gold: Cyan
    return '#10B981'; // General: Green
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interactive Seating Chart</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stage Graphic Header */}
        <View style={styles.stageBox}>
          <View style={styles.stageArch}>
            <Text style={styles.stageText}>🎤 MAIN PERFORMANCE STAGE 🎸</Text>
          </View>
        </View>

        {/* Legend Key */}
        <GlassView style={styles.legendCard} intensity="low">
          <Text style={styles.legendTitle}>Seating Categories Key</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>VIP Rows A-B (₹5,000)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#06B6D4' }]} />
              <Text style={styles.legendText}>Gold Rows C-D (₹3,500)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>General Rows E-F (₹1,500)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Booked / Occupied</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.legendText}>Your Selection</Text>
            </View>
          </View>
        </GlassView>

        {/* Theater Seat Grid Container */}
        <GlassView style={styles.gridCard} intensity="high">
          <Text style={styles.gridTitle}>Select Your Seat</Text>
          
          <View style={styles.rowsContainer}>
            {rows.map((row) => {
              const seatArray = Array.from({ length: row.seatsCount }, (_, index) => {
                const seatNumber = (index + 1).toString().padStart(2, '0');
                return `${row.name}-${seatNumber}`;
              });

              return (
                <View key={row.name} style={styles.rowWrapper}>
                  {/* Row Identifier prefix */}
                  <View style={styles.rowLabelContainer}>
                    <Text style={styles.rowLabelText}>{row.name}</Text>
                  </View>

                  {/* Row Seats list */}
                  <View style={styles.rowSeats}>
                    {seatArray.map((seatId) => {
                      const isBooked = bookedSeatsList.includes(seatId);
                      const isSelected = selectedSeatNo === seatId;
                      const seatColor = getSeatColor(seatId, row.type as any);

                      return (
                        <TouchableOpacity
                          key={seatId}
                          style={[
                            styles.seatBtn,
                            { backgroundColor: seatColor },
                            isSelected && { borderColor: '#FFFFFF', borderWidth: 2 }
                          ]}
                          onPress={() => handleSelectSeat(seatId, row.type, row.price)}
                          disabled={isBooked}
                        >
                          <Text style={styles.seatText}>
                            {seatId.split('-')[1]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </GlassView>

        {/* Selected Seat Checkout Summary Card */}
        <GlassView style={styles.detailsSummaryCard} intensity="medium">
          <View style={styles.detailsHeader}>
            <View>
              <Text style={styles.summaryLabel}>SELECTED SEAT</Text>
              <Text style={styles.summarySeatVal}>{selectedSeatNo}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>TIER / PRICE</Text>
              <Text style={styles.summaryPriceVal}>₹{selectedPrice}</Text>
            </View>
          </View>
          <Text style={styles.summaryTierText}>{selectedTierName}</Text>
        </GlassView>

        {/* Proceed to Razorpay Payment */}
        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={() => router.push({
            pathname: '/checkout/razorpay',
            params: {
              eventTitle,
              price: selectedPrice.toString(),
              quantity: '1',
              tierName: selectedTierName,
              seatNo: selectedSeatNo,
            }
          } as any)}
        >
          <Text style={styles.proceedBtnText}>Confirm Seat {selectedSeatNo} • Pay ₹{selectedPrice} via Razorpay</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B19',
    ...Platform.select({
      web: {
        maxWidth: 1400,
        alignSelf: 'center',
        width: '100%',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderLeftWidth: 1,
        borderRightWidth: 1,
      } as any,
    }),
  },
  backgroundAccent1: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    filter: Platform.OS === 'web' ? 'blur(90px)' : undefined,
    zIndex: -1,
  },
  backgroundAccent2: {
    position: 'absolute',
    bottom: 80,
    left: -100,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: 'rgba(6, 182, 212, 0.20)',
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined,
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
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  stageBox: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  stageArch: {
    width: '100%',
    height: 48,
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stageText: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: '#38BDF8',
    letterSpacing: 1,
  },
  legendCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  legendTitle: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    marginBottom: Theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: '45%',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Theme.fonts.medium,
  },
  gridCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridTitle: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    marginBottom: Theme.spacing.md,
    textTransform: 'uppercase',
  },
  rowsContainer: {
    gap: Theme.spacing.md,
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabelContainer: {
    width: 20,
    alignItems: 'center',
  },
  rowLabelText: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
  },
  rowSeats: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  seatBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatText: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  detailsSummaryCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.xl,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    fontFamily: Theme.fonts.bold,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  summarySeatVal: {
    fontSize: 22,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    marginTop: 2,
  },
  summaryPriceVal: {
    fontSize: 22,
    fontFamily: Theme.fonts.bold,
    color: '#38BDF8',
    marginTop: 2,
  },
  summaryTierText: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: Theme.fonts.medium,
    marginTop: 6,
  },
  proceedBtn: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  proceedBtnText: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
});
