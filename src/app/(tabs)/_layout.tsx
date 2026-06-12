import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { AppIcon } from '@/components/AppIcon';

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (data && data.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };

    checkUserRole();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.secondary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: Theme.colors.backgroundCard,
          borderTopColor: 'rgba(15, 23, 42, 0.08)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          ...Platform.select({
            web: {
              height: 64,
              paddingBottom: 10,
              maxWidth: 800,
              alignSelf: 'center',
              borderRadius: Theme.borderRadius.lg,
              bottom: 16,
              left: '50%',
              transform: [{ translateX: -400 }] as any,
              borderWidth: 1,
              borderColor: 'rgba(15, 23, 42, 0.08)',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 10,
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: Theme.fonts.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'sparkles' : 'sparkles'}
              size={22}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'plus.circle.fill' : 'plus.circle'}
              size={22}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'person.crop.circle.fill' : 'person.crop.circle'}
              size={22}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          // Show the admin tab. Inside admin.tsx, we will restrict it.
          // This keeps routing consistent.
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name={focused ? 'lock.shield.fill' : 'lock.shield'}
              size={22}
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
