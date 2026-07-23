const DB_ADI = 'seyahatplanim-fotograflar';
const STORE_ADI = 'kapaklar';
const DB_SURUM = 1;
const MAX_KENAR = 1200;
const JPEG_KALITE = 0.8;

export const IDB_ONEKI = 'idb://';

export function webFotoReferansiMi(deger?: string): deger is string {
  return !!deger && deger.startsWith(IDB_ONEKI);
}

function veritabaniAc(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const istek = indexedDB.open(DB_ADI, DB_SURUM);
    istek.onupgradeneeded = () => {
      if (!istek.result.objectStoreNames.contains(STORE_ADI)) {
        istek.result.createObjectStore(STORE_ADI);
      }
    };
    istek.onsuccess = () => resolve(istek.result);
    istek.onerror = () => reject(istek.error);
  });
}

async function goruntuyuKucult(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const olcek = Math.min(1, MAX_KENAR / Math.max(bitmap.width, bitmap.height));
  const genislik = Math.max(1, Math.round(bitmap.width * olcek));
  const yukseklik = Math.max(1, Math.round(bitmap.height * olcek));

  const canvas = document.createElement('canvas');
  canvas.width = genislik;
  canvas.height = yukseklik;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context alınamadı');
  ctx.drawImage(bitmap, 0, 0, genislik, yukseklik);
  bitmap.close();

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (sonuc) => (sonuc ? resolve(sonuc) : reject(new Error('görüntü küçültme başarısız'))),
      'image/jpeg',
      JPEG_KALITE,
    );
  });
}

export async function webFotoKaydet(blob: Blob): Promise<string> {
  const kucukBlob = await goruntuyuKucult(blob);
  const anahtar = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

  const db = await veritabaniAc();
  await new Promise<void>((resolve, reject) => {
    const islem = db.transaction(STORE_ADI, 'readwrite');
    islem.objectStore(STORE_ADI).put(kucukBlob, anahtar);
    islem.oncomplete = () => resolve();
    islem.onerror = () => reject(islem.error);
  });
  db.close();

  return `${IDB_ONEKI}${anahtar}`;
}

export async function webFotoOku(referans: string): Promise<Blob | undefined> {
  const anahtar = referans.slice(IDB_ONEKI.length);
  const db = await veritabaniAc();
  const sonuc = await new Promise<Blob | undefined>((resolve, reject) => {
    const islem = db.transaction(STORE_ADI, 'readonly');
    const istek = islem.objectStore(STORE_ADI).get(anahtar);
    istek.onsuccess = () => resolve(istek.result as Blob | undefined);
    istek.onerror = () => reject(istek.error);
  });
  db.close();
  return sonuc;
}

export async function webFotoSil(referans: string): Promise<void> {
  const anahtar = referans.slice(IDB_ONEKI.length);
  const db = await veritabaniAc();
  await new Promise<void>((resolve, reject) => {
    const islem = db.transaction(STORE_ADI, 'readwrite');
    islem.objectStore(STORE_ADI).delete(anahtar);
    islem.oncomplete = () => resolve();
    islem.onerror = () => reject(islem.error);
  });
  db.close();
}
