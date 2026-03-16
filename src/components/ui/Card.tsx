import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { COLORS } from '@/src/constants/colors';

interface CardProps {
  children: React.ReactNode;
  noPadding?: boolean;
  style?: ViewStyle;
}

export function Card({ children, noPadding = false, style }: CardProps) {
  return (
    <View style={[styles.card, !noPadding && styles.padding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  padding: {
    padding: 16,
  },
});
