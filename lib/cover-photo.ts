import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { webFotoKaydet, webFotoReferansiMi, webFotoSil } from '@/lib/web-photo-store';

const KAPAK_KLASORU = 'covers';

export type KapakSecSonuc =
  | { status: 'ok'; uri: string }
  | { status: 'cancelled' }
  | { status: 'denied' }
  | { status: 'storage' }
  | { status: 'error' };

function uzantiAl(uri: string): string {
  const temiz = uri.split('?')[0];
  const parca = temiz.split('.').pop();
  return parca && parca.length <= 5 ? parca : 'jpg';
}

export async function kapakFotoSec(): Promise<KapakSecSonuc> {
  try {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) return { status: 'denied' };

    const sonuc = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (sonuc.canceled || !sonuc.assets?.length) return { status: 'cancelled' };

    const secilen = sonuc.assets[0];

    // expo-file-system web'i desteklemiyor - web'de seçilen fotoğraf küçültülüp
    // IndexedDB'ye kopyalanır (blob URI kalıcı değildir, sayfa yenilenince geçersiz olur).
    if (Platform.OS === 'web') {
      try {
        const blob = secilen.file ?? (await (await fetch(secilen.uri)).blob());
        const referans = await webFotoKaydet(blob);
        return { status: 'ok', uri: referans };
      } catch {
        return { status: 'storage' };
      }
    }

    const kaynakUri = secilen.uri;
    const dizin = new Directory(Paths.document, KAPAK_KLASORU);
    dizin.create({ idempotent: true, intermediates: true });

    const dosyaAdi = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${uzantiAl(kaynakUri)}`;
    const hedef = new File(dizin, dosyaAdi);
    new File(kaynakUri).copy(hedef);

    return { status: 'ok', uri: hedef.uri };
  } catch {
    return { status: 'error' };
  }
}

export function kapakFotoSil(uri?: string) {
  if (!uri) return;
  if (Platform.OS === 'web') {
    if (webFotoReferansiMi(uri)) webFotoSil(uri).catch(() => {});
    return;
  }
  try {
    const dosya = new File(uri);
    if (dosya.exists) dosya.delete();
  } catch {
    // dosya sistemi hatası uygulamayı çökertmesin
  }
}
