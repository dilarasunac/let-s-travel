import { Image, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { ThemeId } from '@/constants/travel';

const COVER_IMAGES: Record<ThemeId, number> = {
  city: require('@/assets/images/sehir.jpg'),
  nature: require('@/assets/images/doga.jpg'),
  coast: require('@/assets/images/sahil.jpg'),
};

export function CoverIllustration({ tema, foto, height = 150 }: { tema: ThemeId; foto?: string; height?: number }) {
  const source = foto ? { uri: foto } : COVER_IMAGES[tema] ?? COVER_IMAGES.city;

  return (
    <Animated.View key={foto} entering={FadeIn.duration(650)} style={{ width: '100%', height }}>
      <Image source={source} resizeMode="cover" style={styles.image} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
