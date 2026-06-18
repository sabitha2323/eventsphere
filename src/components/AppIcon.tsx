/**
 * AppIcon - Cross-platform icon component.
 *
 * On iOS: renders the native SF Symbol via expo-symbols SymbolView.
 * On Android / Web: renders a unicode emoji / text fallback so that
 * the app never crashes in Expo Go on Android.
 *
 * FIX: The iOS branch previously called <AppIcon> recursively instead
 * of <SymbolView>, causing an infinite recursion / stack-overflow on iOS.
 */
import React from 'react';
import { Platform, Text, TextStyle, StyleProp, ColorValue } from 'react-native';
import { SymbolView } from 'expo-symbols';

// Map of SF Symbol names → unicode / emoji fallbacks for Android & Web
const SYMBOL_MAP: Record<string, string> = {
  // Navigation
  'chevron.left': '‹',
  'chevron.right': '›',
  'chevron.up': '⌃',
  'chevron.down': '⌄',
  'xmark': '✕',
  'xmark.circle.fill': '✕',
  'arrow.right': '→',
  'arrow.left': '←',
  'arrow.up': '↑',
  'arrow.down': '↓',
  // General UI
  'plus': '+',
  'plus.circle': '⊕',
  'plus.circle.fill': '⊕',
  'minus': '−',
  'checkmark': '✓',
  'checkmark.circle': '✓',
  'checkmark.circle.fill': '✓',
  'magnifyingglass': '🔍',
  'bell.fill': '🔔',
  'bell': '🔔',
  'bell.slash': '🔕',
  'gear': '⚙️',
  'gearshape': '⚙️',
  'gearshape.fill': '⚙️',
  'person.fill': '👤',
  'person.2.fill': '👥',
  'person.3.fill': '👥',
  'person.crop.circle': '👤',
  'person.crop.circle.fill': '👤',
  'envelope.fill': '✉️',
  'envelope': '✉️',
  'phone.fill': '📞',
  'lock.fill': '🔒',
  'lock.shield': '🛡',
  'lock.shield.fill': '🛡',
  'key.fill': '🔑',
  'eye': '👁',
  'eye.fill': '👁',
  'eye.slash': '🚫',
  'eye.slash.fill': '🚫',
  'star.fill': '★',
  'star': '☆',
  'heart.fill': '♥',
  'heart': '♡',
  'bookmark.fill': '🔖',
  'bookmark': '🔖',
  'square.and.arrow.up': '⬆',
  'square.and.pencil': '✏️',
  'trash.fill': '🗑',
  'trash': '🗑',
  'pencil': '✏️',
  'doc.text.fill': '📄',
  'doc.fill': '📄',
  'folder.fill': '📁',
  'tag': '🏷',
  'tag.fill': '🏷',
  'qrcode': '▦',
  'qrcode.viewfinder': '▦',
  'power': '⏻',
  // Maps & Location
  'map.fill': '🗺',
  'location.fill': '📍',
  'location': '📍',
  'mappin': '📍',
  'mappin.circle': '📍',
  'mappin.and.ellipse': '📍',
  // Charts & Analytics
  'chart.bar.fill': '📊',
  'chart.bar': '📊',
  'chart.line.uptrend.xyaxis': '📈',
  // Tickets & Money
  'ticket.fill': '🎫',
  'ticket': '🎫',
  'creditcard.fill': '💳',
  'creditcard': '💳',
  'banknote': '💵',
  'indianrupeesign': '₹',
  // Camera & Media
  'camera.fill': '📷',
  'camera': '📷',
  'photo.fill': '🖼',
  'photo': '🖼',
  'play.fill': '▶',
  'play.circle.fill': '▶',
  // Calendar
  'calendar': '📅',
  'calendar.badge.plus': '📅',
  'calendar.badge.exclamationmark': '📅',
  'clock.fill': '🕐',
  'clock': '🕐',
  // Social
  'bubble.left.fill': '💬',
  'bubble.left': '💬',
  'hand.raised.fill': '✋',
  'questionmark.circle.fill': '❓',
  // Status & Alerts
  'info.circle.fill': 'ℹ',
  'info.circle': 'ℹ',
  'exclamationmark.circle.fill': '❗',
  'checkmark.seal.fill': '✅',
  'wifi': '📶',
  'wifi.slash': '📵',
  // Misc
  'house.fill': '🏠',
  'house': '🏠',
  'building': '🏢',
  'building.2.fill': '🏢',
  'building.2': '🏢',
  'trophy.fill': '🏆',
  'flame.fill': '🔥',
  'sparkles': '✨',
  'crown.fill': '👑',
  'shield.fill': '🛡',
  'iphone': '📱',
};

interface AppIconProps {
  name: string;
  size?: number;
  tintColor?: ColorValue;
  style?: StyleProp<TextStyle>;
  // Pass-through for any other SymbolView props on iOS
  [key: string]: any;
}

export function AppIcon({ name, size = 20, tintColor, style, ...rest }: AppIconProps) {
  // ─── iOS: native SF Symbols via SymbolView ────────────────────────────────
  // FIXED: was previously calling <AppIcon> recursively causing infinite loop.
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={name as any}
        size={size}
        tintColor={tintColor as any}
        {...rest}
      />
    );
  }

  // ─── Android / Web: unicode / emoji text fallback ────────────────────────
  const fallback = SYMBOL_MAP[name] ?? '•';
  return (
    <Text
      style={[
        {
          fontSize: size,
          color: (tintColor as string) ?? '#0F172A',
          lineHeight: size + 4,
          textAlign: 'center',
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {fallback}
    </Text>
  );
}
