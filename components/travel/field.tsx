import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PALETTE } from '@/constants/travel';

export function Field({ label, children, flex }: { label: string; children: ReactNode; flex?: boolean }) {
  return (
    <View style={[styles.wrap, flex && { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    color: PALETTE.moss,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
});
