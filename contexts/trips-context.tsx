import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { bosVeri, CustomCategory, Lang, ThemeId, Trip, TripData } from '@/constants/travel';
import { kapakFotoSil } from '@/lib/cover-photo';

const STORAGE_KEY = 'seyahatplanim:state';

export interface NewTripDraft {
  sehir: string;
  bas: string;
  bit: string;
  tema: ThemeId;
  foto?: string;
}

export interface NewCategoryDraft {
  ad: string;
  icon: string;
}

interface TripsContextValue {
  dil: Lang;
  setDil: (d: Lang) => void;
  trips: Trip[];
  yukleniyor: boolean;
  customCategories: CustomCategory[];
  getTrip: (id: number) => Trip | undefined;
  addTrip: (draft: NewTripDraft) => Trip | null;
  updateTripData: (id: number, veri: TripData) => void;
  updateTripCover: (id: number, foto: string | undefined) => void;
  deleteTrip: (id: number) => void;
  addCustomCategory: (draft: NewCategoryDraft) => CustomCategory | null;
  renameCustomCategory: (id: string, ad: string) => void;
  deleteCustomCategory: (id: string) => void;
}

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const [dil, setDil] = useState<Lang>('tr');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const ham = await AsyncStorage.getItem(STORAGE_KEY);
        if (ham) {
          const ayristirilmis = JSON.parse(ham);
          if (ayristirilmis?.dil === 'tr' || ayristirilmis?.dil === 'en') setDil(ayristirilmis.dil);
          if (Array.isArray(ayristirilmis?.trips)) setTrips(ayristirilmis.trips);
          if (Array.isArray(ayristirilmis?.customCategories)) setCustomCategories(ayristirilmis.customCategories);
        }
      } catch {
        // bozuk veya erişilemeyen depolama - varsayılan boş durumla devam et
      } finally {
        setYukleniyor(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (yukleniyor) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ dil, trips, customCategories })).catch(() => {
      // yazma hatası uygulamayı çökertmesin
    });
  }, [dil, trips, customCategories, yukleniyor]);

  const value = useMemo<TripsContextValue>(() => ({
    dil,
    setDil,
    trips,
    yukleniyor,
    customCategories,
    getTrip: (id) => trips.find((s) => s.id === id),
    addTrip: (draft) => {
      const sehir = draft.sehir.trim();
      if (!sehir) return null;
      const trip: Trip = { ...draft, sehir, id: Date.now(), veri: bosVeri() };
      setTrips((prev) => [trip, ...prev]);
      return trip;
    },
    updateTripData: (id, veri) => {
      setTrips((prev) => prev.map((s) => (s.id === id ? { ...s, veri } : s)));
    },
    updateTripCover: (id, foto) => {
      setTrips((prev) => prev.map((s) => (s.id === id ? { ...s, foto } : s)));
    },
    deleteTrip: (id) => {
      const trip = trips.find((s) => s.id === id);
      if (trip?.foto) kapakFotoSil(trip.foto);
      setTrips((prev) => prev.filter((s) => s.id !== id));
    },
    addCustomCategory: (draft) => {
      const ad = draft.ad.trim();
      if (!ad) return null;
      const yeni: CustomCategory = { id: `ozel-${Date.now()}`, ad, icon: draft.icon };
      setCustomCategories((prev) => [...prev, yeni]);
      return yeni;
    },
    renameCustomCategory: (id, ad) => {
      const temiz = ad.trim();
      if (!temiz) return;
      setCustomCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ad: temiz } : c)));
    },
    deleteCustomCategory: (id) => {
      setCustomCategories((prev) => prev.filter((c) => c.id !== id));
      setTrips((prev) => prev.map((trip) => {
        if (!(id in trip.veri)) return trip;
        const kalan = { ...trip.veri };
        delete kalan[id];
        return { ...trip, veri: kalan };
      }));
    },
  }), [dil, trips, customCategories, yukleniyor]);

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTrips must be used within a TripsProvider');
  return ctx;
}
