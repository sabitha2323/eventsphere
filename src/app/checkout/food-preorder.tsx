import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { AppIcon } from '@/components/AppIcon';

export default function FoodPreorderScreen() {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  const menu = [
    { name: 'Gourmet Artisanal Burger & Fries', price: 350, cat: 'Snacks' },
    { name: 'Craft IPA Beer Pass (2 Pint Tokens)', price: 600, cat: 'Beverages' },
    { name: 'Wood-fired Pepperoni Pizza Slice', price: 250, cat: 'Snacks' },
    { name: 'Fresh Tropical Fruit Smoothie', price: 180, cat: 'Beverages' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <AppIcon name="chevron.left" size={20} tintColor="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>In-Venue Food & Drinks Pre-Order</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🍔 Skip-The-Line Food Pickup</Text>
          <Text style={styles.bannerSub}>Pre-order food & beverages and pickup using your QR VIP Pass!</Text>
        </View>

        <Text style={styles.sectionHeader}>Festival Menu Items</Text>
        <View style={styles.menuList}>
          {menu.map((item, idx) => (
            <View key={idx} style={styles.menuRow}>
              <View>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCat}>{item.cat}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => { setCartCount(cartCount + 1); Alert.alert('Added to Pre-Order', `${item.name} added to cart!`); }}>
                <Text style={styles.addBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push({ pathname: '/checkout/razorpay', params: { eventTitle: 'Food Pre-Order Pass', price: '600', quantity: cartCount || 1 } } as any)}
        >
          <Text style={styles.checkoutBtnText}>Checkout Pre-Order ({cartCount} Items) via Razorpay</Text>
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
  banner: { padding: 16, backgroundColor: '#1C2541', borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#EC4899' },
  bannerTitle: { fontSize: 16, fontFamily: Theme.fonts.bold, color: '#EC4899' },
  bannerSub: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  sectionHeader: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#FFFFFF', marginBottom: 12 },
  menuList: { gap: 12, marginBottom: 24 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1C2541', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  itemName: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  itemCat: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  itemPrice: { fontSize: 15, fontFamily: Theme.fonts.bold, color: '#6FFFE9', marginTop: 4 },
  addBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#2563EB', borderRadius: 8 },
  addBtnText: { fontSize: 12, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
  checkoutBtn: { height: 50, backgroundColor: '#10B981', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  checkoutBtnText: { fontSize: 14, fontFamily: Theme.fonts.bold, color: '#FFFFFF' },
});
