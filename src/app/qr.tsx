import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';

export default function QRScanScreen() {
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=exp%3A%2F%2Fpv6vqtm-sabithaaaa-8082.exp.direct";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>📱 Scan to Open EventSphere App</Text>
        <Text style={styles.subtitle}>Open the camera app on your mobile phone or the Expo Go app to scan this QR code.</Text>

        <Image
          source={{ uri: qrUrl }}
          style={styles.qrImage}
        />

        <Text style={styles.linkText}>exp://pv6vqtm-sabithaaaa-8082.exp.direct</Text>

        <View style={styles.steps}>
          <Text style={styles.stepsTitle}>💡 How to open:</Text>
          <Text style={styles.stepItem}>1. Download the Expo Go app on your phone.</Text>
          <Text style={styles.stepItem}>2. Scan this QR code or type the link above in Expo Go.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B19',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 18,
  },
  qrImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  linkText: {
    color: '#38BDF8',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    marginBottom: 24,
    textAlign: 'center',
  },
  steps: {
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  stepsTitle: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepItem: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
});
