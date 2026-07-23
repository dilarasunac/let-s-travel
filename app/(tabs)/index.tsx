import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog, OnayButonu } from '@/components/travel/confirm-dialog';
import { CoverIllustration } from '@/components/travel/cover-illustration';
import { LanguageSwitch } from '@/components/travel/language-switch';
import { sharedStyles } from '@/components/travel/shared-styles';
import { CATEGORIES, PALETTE, T, gunSay, tarihYaz } from '@/constants/travel';
import { useTrips } from '@/contexts/trips-context';

interface DialogState {
  title?: string;
  message?: string;
  buttons: OnayButonu[];
}

export default function ListeScreen() {
  const { dil, setDil, trips, yukleniyor, deleteTrip, customCategories } = useTrips();
  const t = T[dil];
  const tumKategoriIdleri = [...CATEGORIES.map((k) => k.id), ...customCategories.map((k) => k.id)];
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const silOnayla = (id: number, sehir: string) => {
    setDialog({
      title: t.deleteTrip,
      message: t.deleteTripMsg(sehir),
      buttons: [
        { text: t.cancel, tone: 'cancel' },
        { text: t.delete, tone: 'destructive', onPress: () => deleteTrip(id) },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <LanguageSwitch dil={dil} setDil={setDil} />
        </View>
        <View style={styles.headerHeroRow}>
          <View>
            <Text style={styles.eyebrow}>{t.plans}</Text>
            <Text style={styles.hero}>
              {t.hero1}
              {'\n'}
              <Text style={styles.heroBold}>{t.hero2}</Text>
            </Text>
          </View>
          <Pressable style={styles.addButton} onPress={() => router.push('/ekle')}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={sharedStyles.sheet} contentContainerStyle={styles.sheetContent}>
        {yukleniyor ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={PALETTE.forest} />
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyCover}>
              <Image source={require('@/assets/images/karsilama.jpg')} resizeMode="contain" style={styles.emptyCoverImage} />
            </View>
            <Text style={styles.emptyTitle}>{t.empty}</Text>
            <Text style={styles.emptySub}>{t.emptySub}</Text>
            <Pressable style={[sharedStyles.button, styles.emptyButton]} onPress={() => router.push('/ekle')}>
              <Text style={[sharedStyles.buttonText, styles.emptyButtonText]}>{t.addTrip}</Text>
            </Pressable>
          </View>
        ) : (
          trips.map((s) => {
            const gun = gunSay(s.bas, s.bit);
            const toplam = tumKategoriIdleri.reduce((a, id) => a + (s.veri[id]?.length ?? 0), 0);
            return (
              <Pressable
                key={s.id}
                onPress={() => router.push({ pathname: '/trip/[id]', params: { id: String(s.id) } })}
                onLongPress={() => silOnayla(s.id, s.sehir)}
                style={styles.card}>
                <CoverIllustration tema={s.tema} foto={s.foto} />
                <View style={styles.cardBody}>
                  <Text style={styles.cardCity}>{s.sehir}</Text>
                  <View style={styles.cardMetaRow}>
                    <Text style={styles.cardMeta}>
                      {s.bas ? `${tarihYaz(s.bas, dil)} – ${tarihYaz(s.bit, dil)}` : t.noDate}
                    </Text>
                    <Text style={styles.cardCount}>{gun ? t.days(gun) : t.records(toplam)}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <ConfirmDialog
        visible={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        buttons={dialog?.buttons ?? []}
        onClose={() => setDialog(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.sage,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerHeroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 2,
    color: PALETTE.moss,
    textTransform: 'uppercase',
  },
  hero: {
    fontFamily: 'serif',
    fontSize: 30,
    color: PALETTE.forest,
    lineHeight: 34,
    marginTop: 6,
  },
  heroBold: {
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: PALETTE.cream,
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: PALETTE.forest,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: PALETTE.moss,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
  emptyCover: {
    width: '100%',
    aspectRatio: 1548 / 1072,
    borderRadius: 22,
    overflow: 'hidden',
  },
  emptyCoverImage: {
    width: '100%',
    height: '100%',
  },
  emptyTitle: {
    fontFamily: 'serif',
    fontSize: 19,
    color: PALETTE.forest,
    marginTop: 24,
  },
  emptySub: {
    fontSize: 14,
    color: PALETTE.moss,
    marginTop: 6,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: PALETTE.coral,
    marginTop: 18,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: PALETTE.cream,
  },
  card: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: PALETTE.sage,
    marginBottom: 14,
  },
  cardBody: {
    padding: 16,
    paddingTop: 14,
  },
  cardCity: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: PALETTE.forest,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardMeta: {
    fontSize: 13,
    color: PALETTE.moss,
  },
  cardCount: {
    fontSize: 14,
    fontWeight: '700',
    color: PALETTE.coral,
  },
});
