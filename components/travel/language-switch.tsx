import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PALETTE } from '@/constants/travel';
import type { Lang } from '@/constants/travel';

export function LanguageSwitch({ dil, setDil }: { dil: Lang; setDil: (d: Lang) => void }) {
  return (
    <View style={styles.wrap}>
      {(['tr', 'en'] as const).map((d) => (
        <Pressable
          key={d}
          onPress={() => setDil(d)}
          style={[styles.item, dil === d && styles.itemActive]}>
          <Text style={[styles.label, dil === d && styles.labelActive]}>{d.toUpperCase()}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: PALETTE.cream,
    borderRadius: 999,
    padding: 3,
  },
  item: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  itemActive: {
    backgroundColor: PALETTE.forest,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.moss,
  },
  labelActive: {
    color: PALETTE.cream,
  },
});
