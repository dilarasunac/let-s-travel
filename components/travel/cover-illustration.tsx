import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { PALETTE, type ThemeId } from '@/constants/travel';
import { webFotoOku, webFotoReferansiMi } from '@/lib/web-photo-store';

const COVER_IMAGES: Record<ThemeId, number> = {
  city: require('@/assets/images/sehir.jpg'),
  nature: require('@/assets/images/doga.jpg'),
  coast: require('@/assets/images/sahil.jpg'),
};

function useFotoUri(foto?: string): { uri?: string; yukleniyor: boolean } {
  const webReferans = webFotoReferansiMi(foto);
  const [uri, setUri] = useState<string | undefined>(webReferans ? undefined : foto);
  const [yukleniyor, setYukleniyor] = useState(webReferans);

  useEffect(() => {
    if (!webFotoReferansiMi(foto)) {
      setUri(foto);
      setYukleniyor(false);
      return;
    }

    let iptal = false;
    let olusturulanUrl: string | undefined;
    setYukleniyor(true);
    setUri(undefined);

    webFotoOku(foto)
      .then((blob) => {
        if (iptal || !blob) return;
        olusturulanUrl = URL.createObjectURL(blob);
        setUri(olusturulanUrl);
      })
      .catch(() => {})
      .finally(() => {
        if (!iptal) setYukleniyor(false);
      });

    return () => {
      iptal = true;
      if (olusturulanUrl) URL.revokeObjectURL(olusturulanUrl);
    };
  }, [foto]);

  return { uri, yukleniyor };
}

export function CoverIllustration({ tema, foto, height = 150 }: { tema: ThemeId; foto?: string; height?: number }) {
  const { uri, yukleniyor } = useFotoUri(foto);

  if (yukleniyor) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <ActivityIndicator color={PALETTE.forest} />
      </View>
    );
  }

  const source = uri ? { uri } : COVER_IMAGES[tema] ?? COVER_IMAGES.city;

  return (
    <Animated.View key={uri ?? tema} entering={FadeIn.duration(650)} style={{ width: '100%', height }}>
      <Image source={source} resizeMode="cover" style={styles.image} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    backgroundColor: PALETTE.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
