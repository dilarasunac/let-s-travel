export type Lang = 'tr' | 'en';
export type ThemeId = 'city' | 'nature' | 'coast';
export type CategoryId = string;
export type FieldType = 'text' | 'number' | 'select';

export const PALETTE = {
  mist: '#B9CBD3',
  sage: '#DCE5D5',
  sageDeep: '#C3D3BC',
  cream: '#FBFAF4',
  forest: '#20372B',
  moss: '#5B7A63',
  coral: '#E0533A',
  sand: '#EFE3C8',
};

export const THEMES: Record<ThemeId, { tr: string; en: string; sky: string; far: string; near: string; accent: string }> = {
  city: { tr: 'Şehir', en: 'City', sky: '#CFDCE4', far: '#8FA9A0', near: '#5B7A63', accent: '#EFE3C8' },
  nature: { tr: 'Doğa', en: 'Nature', sky: '#DDE7CF', far: '#7E9C7A', near: '#3F5F4A', accent: '#F2EAD3' },
  coast: { tr: 'Sahil', en: 'Coast', sky: '#D9E8E6', far: '#8FC0BE', near: '#3E7373', accent: '#F5E3C4' },
};

export const T = {
  tr: {
    plans: 'Planlarım', hero1: 'Hadi', hero2: 'gezelim',
    empty: 'Henüz seyahat yok', emptySub: 'Şehri ve tarihleri gir, planlamaya başla.',
    addTrip: 'Seyahat ekle', newTrip: 'Yeni seyahat',
    city: 'Şehir', cityPh: 'Nereye gidiyorsun?', start: 'Başlangıç', end: 'Bitiş', theme: 'Tema',
    create: 'Seyahati oluştur', noDate: 'Tarih yok', noDate2: 'Tarih girilmedi',
    days: (n: number) => `${n} gün`, records: (n: number) => `${n} kayıt`,
    done: (a: number, b: number) => `${a}/${b} tamam`,
    emptyCat: 'Bu kategori boş. Aşağıdan ilk kaydını ekle.',
    save: 'Kaydet', cancel: 'Vazgeç', select: 'Seç', ok: 'Tamam',
    addTo: (l: string) => `+ ${l.toLocaleLowerCase('tr')} ekle`,
    home: 'Anasayfa', add: 'Ekle', pick: 'Tarih seç',
    deleteTrip: 'Seyahati sil',
    deleteTripMsg: (city: string) => `"${city}" seyahatini silmek istediğine emin misin?`,
    delete: 'Sil', edit: 'Düzenle', openMap: 'Haritada aç',
    pickPhoto: 'Kendi fotoğrafını seç', changePhoto: 'Fotoğrafı değiştir', removePhoto: 'Kaldır',
    editCoverTitle: 'Kapak fotoğrafı',
    permDeniedTitle: 'İzin gerekli',
    permDeniedMsg: 'Fotoğraf seçebilmek için galeri erişimine izin vermelisin.',
    photoErrorTitle: 'Bir şeyler ters gitti',
    photoErrorMsg: 'Fotoğraf seçilemedi, lütfen tekrar dene.',
    loading: 'Yükleniyor…',
    addCategory: '+ Kategori ekle',
    categoryName: 'Kategori adı',
    categoryNamePh: 'ör. Hediyelik eşya',
    categoryIcon: 'Simge',
    renameCategory: 'Adını düzenle',
    deleteCategoryTitle: 'Kategoriyi sil',
    deleteCategoryMsg: (ad: string) => `"${ad}" kategorisini silmek istediğine emin misin? İçindeki tüm kayıtlar da silinecek.`,
  },
  en: {
    plans: 'My plans', hero1: "Let's", hero2: 'travel',
    empty: 'No trips yet', emptySub: 'Add a city and dates to start planning.',
    addTrip: 'Add trip', newTrip: 'New trip',
    city: 'City', cityPh: 'Where are you going?', start: 'Start', end: 'End', theme: 'Theme',
    create: 'Create trip', noDate: 'No dates', noDate2: 'No dates set',
    days: (n: number) => `${n} days`, records: (n: number) => `${n} items`,
    done: (a: number, b: number) => `${a}/${b} done`,
    emptyCat: 'This category is empty. Add your first item below.',
    save: 'Save', cancel: 'Cancel', select: 'Select', ok: 'OK',
    addTo: (l: string) => `+ Add ${l.toLowerCase()}`,
    home: 'Home', add: 'Add', pick: 'Pick date',
    deleteTrip: 'Delete trip',
    deleteTripMsg: (city: string) => `Are you sure you want to delete "${city}"?`,
    delete: 'Delete', edit: 'Edit', openMap: 'Open in maps',
    pickPhoto: 'Choose your own photo', changePhoto: 'Change photo', removePhoto: 'Remove',
    editCoverTitle: 'Cover photo',
    permDeniedTitle: 'Permission needed',
    permDeniedMsg: 'Allow access to your photo library to choose a picture.',
    photoErrorTitle: 'Something went wrong',
    photoErrorMsg: "Couldn't select the photo, please try again.",
    loading: 'Loading…',
    addCategory: '+ Add category',
    categoryName: 'Category name',
    categoryNamePh: 'e.g. Souvenirs',
    categoryIcon: 'Icon',
    renameCategory: 'Rename',
    deleteCategoryTitle: 'Delete category',
    deleteCategoryMsg: (ad: string) => `Are you sure you want to delete "${ad}"? All records inside it will be deleted too.`,
  },
};

export interface CategoryField {
  key: string;
  type: FieldType;
  label: { tr: string; en: string };
  ph?: { tr: string; en: string };
  options?: { tr: string; en: string }[];
}

export interface CategoryItem {
  id: number;
  baslik: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Category {
  id: CategoryId;
  icon: string;
  tint: string;
  label: { tr: string; en: string };
  fields: CategoryField[];
  checkKey: string;
  render: (item: CategoryItem, dil: Lang) => string[];
  ozel?: boolean;
}

export const CATEGORIES: Category[] = [
  {
    id: 'dikkat', icon: '!', tint: PALETTE.sand,
    label: { tr: 'Dikkat', en: 'Watch out' },
    fields: [
      { key: 'baslik', type: 'text', label: { tr: 'Not', en: 'Note' }, ph: { tr: 'Pasaport süresi', en: 'Passport expiry' } },
      {
        key: 'oncelik', type: 'select', label: { tr: 'Öncelik', en: 'Priority' },
        options: [{ tr: 'Yüksek', en: 'High' }, { tr: 'Orta', en: 'Medium' }, { tr: 'Düşük', en: 'Low' }],
      },
      { key: 'detay', type: 'text', label: { tr: 'Detay', en: 'Detail' }, ph: { tr: 'İsteğe bağlı', en: 'Optional' } },
    ],
    checkKey: 'tamam',
    render: (i, d) => [i.oncelik && (d === 'tr' ? `${i.oncelik} öncelik` : `${i.oncelik} priority`), i.detay]
      .filter((x): x is string => !!x),
  },
  {
    id: 'alinacaklar', icon: '☂', tint: PALETTE.sageDeep,
    label: { tr: 'Alınacaklar', en: 'Packing list' },
    fields: [
      { key: 'baslik', type: 'text', label: { tr: 'Ürün', en: 'Item' }, ph: { tr: 'Güneş kremi', en: 'Sunscreen' } },
      { key: 'adet', type: 'number', label: { tr: 'Adet', en: 'Quantity' }, ph: { tr: '1', en: '1' } },
      { key: 'butce', type: 'number', label: { tr: 'Bütçe (₺)', en: 'Budget (₺)' }, ph: { tr: '250', en: '250' } },
    ],
    checkKey: 'alindi',
    render: (i, d) => [i.adet && (d === 'tr' ? `${i.adet} adet` : `${i.adet} pcs`), i.butce && `${i.butce} ₺`]
      .filter((x): x is string => !!x),
  },
  {
    id: 'rotalar', icon: '↗', tint: PALETTE.mist,
    label: { tr: 'Rotalar', en: 'Routes' },
    fields: [
      { key: 'baslik', type: 'text', label: { tr: 'Rota adı', en: 'Route name' }, ph: { tr: '1. gün', en: 'Day 1' } },
      { key: 'duraklar', type: 'text', label: { tr: 'Duraklar', en: 'Stops' }, ph: { tr: 'Virgülle ayır', en: 'Separate with commas' } },
      { key: 'harita', type: 'text', label: { tr: 'Harita linki', en: 'Map link' }, ph: { tr: 'https://', en: 'https://' } },
    ],
    checkKey: 'tamam',
    render: (i) => [i.duraklar].filter((x): x is string => !!x),
  },
  {
    id: 'yerler', icon: '◎', tint: PALETTE.sage,
    label: { tr: 'Gidilecek yerler', en: 'Places to visit' },
    fields: [
      { key: 'baslik', type: 'text', label: { tr: 'Yer', en: 'Place' }, ph: { tr: 'Müze', en: 'Museum' } },
      { key: 'saat', type: 'text', label: { tr: 'Açılış saatleri', en: 'Opening hours' }, ph: { tr: '09:00 – 18:00', en: '09:00 – 18:00' } },
      { key: 'not', type: 'text', label: { tr: 'Not', en: 'Note' }, ph: { tr: 'Gün batımında git', en: 'Go at sunset' } },
    ],
    checkKey: 'gidildi',
    render: (i) => [i.saat, i.not].filter((x): x is string => !!x),
  },
  {
    id: 'ulasim', icon: '≡', tint: PALETTE.sand,
    label: { tr: 'Ulaşım', en: 'Transit' },
    fields: [
      { key: 'baslik', type: 'text', label: { tr: 'Hat', en: 'Line' }, ph: { tr: 'M2 metro', en: 'M2 metro' } },
      { key: 'seferler', type: 'text', label: { tr: 'Sefer saatleri', en: 'Timetable' }, ph: { tr: '06:15 – 00:00', en: '06:15 – 00:00' } },
      { key: 'aktarma', type: 'text', label: { tr: 'Aktarma', en: 'Transfer' }, ph: { tr: 'Nerede aktarma var?', en: 'Where to transfer?' } },
    ],
    checkKey: 'tamam',
    render: (i) => [i.seferler, i.aktarma].filter((x): x is string => !!x),
  },
];

export interface CustomCategory {
  id: string;
  ad: string;
  icon: string;
}

export const OZEL_KATEGORI_IKONLARI = ['📌', '★', '♥', '✈', '☕', '🎒', '💡', '🎫', '🐾', '🎵'];

export function ozelKategoriyiCategoryYap(ozel: CustomCategory): Category {
  return {
    id: ozel.id,
    icon: ozel.icon,
    tint: PALETTE.sand,
    label: { tr: ozel.ad, en: ozel.ad },
    fields: [
      { key: 'baslik', type: 'text', label: { tr: 'Başlık', en: 'Title' }, ph: { tr: 'Başlık gir', en: 'Enter a title' } },
      { key: 'not', type: 'text', label: { tr: 'Not', en: 'Note' }, ph: { tr: 'İsteğe bağlı', en: 'Optional' } },
    ],
    checkKey: 'tamam',
    render: (i) => [i.not as string | undefined].filter((x): x is string => !!x),
    ozel: true,
  };
}

export type TripData = Record<CategoryId, CategoryItem[]>;

export interface Trip {
  id: number;
  sehir: string;
  bas: string;
  bit: string;
  tema: ThemeId;
  foto?: string;
  veri: TripData;
}

export const bosVeri = (): TripData =>
  CATEGORIES.reduce((acc, k) => {
    acc[k.id] = [];
    return acc;
  }, {} as TripData);

export const gunSay = (a?: string, b?: string): number | null => {
  if (!a || !b) return null;
  const f = (new Date(b).getTime() - new Date(a).getTime()) / 86400000;
  return f >= 0 ? f + 1 : null;
};

export const tarihYaz = (g: string | undefined, dil: Lang): string =>
  g ? new Date(g).toLocaleDateString(dil === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'short' }) : '';
