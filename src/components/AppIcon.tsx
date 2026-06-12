/**
 * AppIcon - Cross-platform icon component.
 *
 * On iOS: renders the native SF Symbol via expo-symbols SymbolView.
 * On Android / Web: renders a unicode emoji / text fallback so that
 * the app never crashes in Expo Go on Android.
 */
import React from 'react';
import { Platform, Text, TextStyle, StyleProp, ColorValue } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';

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
  'minus': '−',
  'checkmark': '✓',
  'checkmark.circle.fill': '✓',
  'magnifyingglass': '🔍',
  'bell.fill': '🔔',
  'bell': '🔔',
  'gear': '⚙️',
  'gearshape.fill': '⚙️',
  'person.fill': '👤',
  'person.2.fill': '👥',
  'person.crop.circle': '👤',
  'person.crop.circle.fill': '👤',
  'envelope.fill': '✉️',
  'envelope': '✉️',
  'phone.fill': '📞',
  'lock.fill': '🔒',
  'key.fill': '🔑',
  'eye': '👁',
  'eye.slash': '🚫',
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
  // Maps & Location
  'map.fill': '🗺',
  'location.fill': '📍',
  'location': '📍',
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
  'clock.fill': '🕐',
  'clock': '🕐',
  // Social
  'bubble.left.fill': '💬',
  'bubble.left': '💬',
  'hand.raised.fill': '✋',
  'questionmark.circle.fill': '❓',
  // Status & Alerts
  'info.circle.fill': '🛈',
  'info.circle': '🛈',
  'exclamationmark.circle.fill': '❗',
  'checkmark.seal.fill': '✅',
  'wifi': '📶',
  'wifi.slash': '📵',
  // Misc
  'house.fill': '🏠',
  'house': '🏠',
  'building.2.fill': '🏢',
  'trophy.fill': '🏆',
  'flame.fill': '🔥',
  'sparkles': '✨',
  'crown.fill': '👑',
  'shield.fill': '🛡',
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
  if (Platform.OS === 'ios') {
    return (
      <AppIcon
        name={name as any}
        size={size}
        tintColor={tintColor}
        {...rest}
      />
    );
  }

  // Android / Web fallback
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
