import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SubscriptionStatus } from '@/src/types';
import { STATUS_LABELS } from '@/src/constants/app';
import { COLORS } from '@/src/constants/colors';

interface StatusBadgeProps {
  status: SubscriptionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = COLORS.status[status];
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.label, { color: color.text }]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
