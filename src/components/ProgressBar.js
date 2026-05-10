import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function ProgressBar({ progress, height = 8, style }) {
  const pct = Math.min(Math.max(progress || 0, 0), 1);
  return (
    <View style={[styles.track, { height }, style]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.purple,
    borderRadius: 4,
  },
});
