import React from 'react';
import { StyleSheet } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { colors, spacing } from '../constants/theme';

export default function Card({ children, style, ...props }) {
  return (
    <PaperCard style={[styles.card, style]} {...props}>
      <PaperCard.Content>
        {children}
      </PaperCard.Content>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    borderRadius: 12,
    elevation: 2,
  },
});
