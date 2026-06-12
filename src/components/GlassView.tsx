import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from 'react-native';
import { Theme } from '../constants/theme';

interface GlassViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: 'low' | 'medium' | 'high';
  bordered?: boolean;
}

export const GlassView: React.FC<GlassViewProps> = ({
  children,
  style,
  intensity = 'medium',
  bordered = true,
}) => {
  const getBackgroundStyle = () => {
    switch (intensity) {
      case 'low':
        return {
          backgroundColor: 'rgba(241, 245, 249, 0.4)',
          borderColor: 'rgba(15, 23, 42, 0.05)',
        };
      case 'high':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderColor: 'rgba(15, 23, 42, 0.14)',
        };
      case 'medium':
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.70)',
          borderColor: 'rgba(15, 23, 42, 0.08)',
        };
    }
  };

  const bgStyle = getBackgroundStyle();

  const combinedStyle = StyleSheet.flatten([
    styles.glass,
    {
      backgroundColor: bgStyle.backgroundColor,
      borderColor: bordered ? bgStyle.borderColor : 'transparent',
      borderWidth: bordered ? 1 : 0,
    },
    style,
  ]);

  return <View style={combinedStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  glass: {
    borderRadius: Theme.borderRadius.md,
    ...Platform.select({
      web: {
        // Backdrop filter works natively on modern browsers
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      } as any,
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
