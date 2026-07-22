import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';
import { GlassView } from '@/components/GlassView';

export default function RideshareBookingScreen() {
  const router = useRouter();

  // Booking process states
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedFare, setSelectedFare] = useState<string>('');
  
  // Form fields
  const [riderName, setRiderName] = useState('Sabitha');
  const [riderAge, setRiderAge] = useState('21');
  const [riderGender, setRiderGender] = useState<'Male' | 'Female'>('Female');
  const [pickupLocation, setPickupLocation] = useState('Central Residency, Indiranagar');
  const [dropLocation, setDropLocation] = useState('Lakefront Promenade Arena, Bangalore');
  const [rideAccess, setRideAccess] = useState<'moto' | 'auto' | 'go' | 'premier'>('go');
  
  // Submit state
  const [bookingProgress, setBookingProgress] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const handleStartBooking = (provider: string, fare: string) => {
    setSelectedProvider(provider);
    setSelectedFare(fare);
  };

  const handleConfirmRide = () => {
    if (!riderName.trim()) {
      if (Platform.OS === 'web') alert('Please enter rider name');
      return;
    }
    if (!riderAge.trim()) {
      if (Platform.OS === 'web') alert('Please enter rider age');
      return;
    }

    setBookingProgress(true);
    setTimeout(() => {
      setBookingProgress(false);
      setConfirmedBooking({
        driverName: 'Ramesh Kumar',
        vehicleNo: 'KA-03-EX-8841',
        rating: '4.8 ⭐',
        eta: '4 mins',
        accessLabel: rideAccess === 'moto' ? 'Uber Moto (Fastest Ride)' 
                     : rideAccess === 'auto' ? 'Uber Auto (Economical)'
                     : rideAccess === 'go' ? 'Uber Go Sedan (Standard)'
                     : 'Uber Premier (Luxury)',
      });
    }, 1500);
  };

  const handleCancelBooking = () => {
    setSelectedProvider(null);
    setConfirmedBooking(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundAccent1} />
      <View style={styles.backgroundAccent2} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Venue Rideshare & Cab Partner</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!selectedProvider ? (
          <>
            {/* Destination Info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>DESTINATION VENUE</Text>
              <Text style={styles.venueName}>Lakefront Promenade Arena, Bangalore</Text>
              <Text style={styles.etaText}>Estimated Transit Time: 22 mins from Current Location</Text>
            </View>

            <Text style={styles.sectionHeader}>Available Rideshare Options</Text>
            <View style={styles.ridesList}>
              {[
                { name: 'Uber Cab Services', eta: '4 mins away', fare: '₹280', desc: 'Affordable compact sedan for 4 passengers' },
                { name: 'Uber XL Premier SUV', eta: '6 mins away', fare: '₹450', desc: 'Spacious 6-seater SUV for festival groups' },
                { name: 'Ola Cab Mini Services', eta: '3 mins away', fare: '₹260', desc: 'Fast city pickup' },
              ].map((r, idx) => (
                <View key={idx} style={styles.rideRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rideName}>{r.name}</Text>
                    <Text style={styles.rideDesc}>{r.desc}</Text>
                    <Text style={styles.rideEta}>{r.eta}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={styles.rideFare}>{r.fare}</Text>
                    <TouchableOpacity style={styles.bookBtn} onPress={() => handleStartBooking(r.name, r.fare)}>
                      <Text style={styles.bookBtnText}>Book Ride</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : confirmedBooking ? (
          /* Confirmation Success Screen */
          <GlassView style={styles.successCard} intensity="high">
            <View style={styles.successIcon}>
              <AppIcon name="checkmark.circle.fill" size={48} tintColor="#10B981" />
            </View>
            <Text style={styles.successTitle}>Ride Booked Successfully!</Text>
            <Text style={styles.successSub}>Your {confirmedBooking.accessLabel} is on its way</Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Driver Name</Text>
              <Text style={styles.infoVal}>{confirmedBooking.driverName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle Number</Text>
              <Text style={styles.infoVal}>{confirmedBooking.vehicleNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Driver Rating</Text>
              <Text style={styles.infoVal}>{confirmedBooking.rating}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Arrival</Text>
              <Text style={styles.infoValHighlight}>{confirmedBooking.eta}</Text>
            </View>

            <TouchableOpacity style={styles.cancelRideBtn} onPress={handleCancelBooking}>
              <Text style={styles.cancelRideBtnText}>Cancel Booking</Text>
            </TouchableOpacity>
          </GlassView>
        ) : (
          /* Cab Booking Form Screen */
          <GlassView style={styles.formCard} intensity="high">
            <Text style={styles.formTitle}>Book {selectedProvider}</Text>
            <Text style={styles.formSub}>Confirm your passenger & route details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rider Full Name</Text>
              <TextInput
                style={styles.input}
                value={riderName}
                onChangeText={setRiderName}
                placeholder="Enter rider name"
                placeholderTextColor={Theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Rider Age</Text>
                <TextInput
                  style={styles.input}
                  value={riderAge}
                  onChangeText={setRiderAge}
                  keyboardType="numeric"
                  placeholder="e.g. 21"
                  placeholderTextColor={Theme.colors.textMuted}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    style={[styles.genderBtn, riderGender === 'Male' && styles.genderBtnActive]}
                    onPress={() => setRiderGender('Male')}
                  >
                    <Text style={[styles.genderBtnText, riderGender === 'Male' && styles.genderBtnTextActive]}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderBtn, riderGender === 'Female' && styles.genderBtnActive]}
                    onPress={() => setRiderGender('Female')}
                  >
                    <Text style={[styles.genderBtnText, riderGender === 'Female' && styles.genderBtnTextActive]}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pick Up Point</Text>
              <TextInput
                style={styles.input}
                value={pickupLocation}
                onChangeText={setPickupLocation}
                placeholder="Enter pickup point"
                placeholderTextColor={Theme.colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Drop Destination</Text>
              <TextInput
                style={styles.input}
                value={dropLocation}
                onChangeText={setDropLocation}
                placeholder="Enter drop destination"
                placeholderTextColor={Theme.colors.textMuted}
              />
            </View>

            <Text style={styles.inputLabel}>Fastest Ride Access Type</Text>
            <View style={styles.accessGrid}>
              {[
                { id: 'moto', label: '🏍️ Uber Moto', desc: 'Fastest solo ride' },
                { id: 'auto', label: '🛺 Uber Auto', desc: 'Quick economical' },
                { id: 'go', label: '🚗 Uber Go', desc: 'Standard sedan' },
                { id: 'premier', label: '⭐ Uber Premier', desc: 'Premium luxury' },
              ].map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.accessCard, rideAccess === acc.id && styles.accessCardActive]}
                  onPress={() => setRideAccess(acc.id as any)}
                >
                  <Text style={[styles.accessLabelText, rideAccess === acc.id && styles.accessLabelTextActive]}>{acc.label}</Text>
                  <Text style={styles.accessDesc}>{acc.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelBooking}>
                <Text style={styles.cancelBtnText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmRide} disabled={bookingProgress}>
                {bookingProgress ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirm Booking • {selectedFare}</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassView>
        )}
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 16,
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
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: Theme.fonts.bold,
    color: '#38BDF8',
    letterSpacing: 1,
  },
  venueName: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    marginTop: 4,
  },
  etaText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  ridesList: {
    gap: 12,
  },
  rideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rideName: {
    fontSize: 15,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  rideDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  rideEta: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 4,
    fontFamily: Theme.fonts.medium,
  },
  rideFare: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    color: '#6FFFE9',
  },
  bookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  bookBtnText: {
    fontSize: 12,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: 20,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  formSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: '#E2E8F0',
    marginBottom: 6,
    fontFamily: Theme.fonts.medium,
  },
  input: {
    height: 44,
    backgroundColor: '#0F172A',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    height: 44,
  },
  genderBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  genderBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  genderBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
  },
  genderBtnTextActive: {
    color: '#FFFFFF',
  },
  accessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  accessCard: {
    width: '48%',
    padding: 10,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  accessCardActive: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  accessLabelText: {
    fontSize: 13,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
  },
  accessLabelTextActive: {
    color: '#38BDF8',
  },
  accessDesc: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#E2E8F0',
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
  },
  confirmBtn: {
    flex: 2.2,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
  },
  successCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: Theme.fonts.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: Theme.fonts.regular,
  },
  infoVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
  },
  infoValHighlight: {
    color: '#10B981',
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
  },
  cancelRideBtn: {
    width: '100%',
    height: 44,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  cancelRideBtnText: {
    color: '#FFFFFF',
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
  },
});
