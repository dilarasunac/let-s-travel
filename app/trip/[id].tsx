import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ConfirmDialog, OnayButonu } from '@/components/travel/confirm-dialog';
import { CoverIllustration } from '@/components/travel/cover-illustration';
import { Field } from '@/components/travel/field';
import { sharedStyles } from '@/components/travel/shared-styles';
import {
  CATEGORIES,
  Category,
  CategoryItem,
  OZEL_KATEGORI_IKONLARI,
  PALETTE,
  T,
  gunSay,
  ozelKategoriyiCategoryYap,
  tarihYaz,
} from '@/constants/travel';
import { useTrips } from '@/contexts/trips-context';
import { kapakFotoSec, kapakFotoSil } from '@/lib/cover-photo';

const acUrl = (url: string) => {
  const hedef = url.includes('://') ? url : `https://${url}`;
  Linking.openURL(hedef).catch(() => {});
};

interface DialogState {
  title?: string;
  message?: string;
  buttons: OnayButonu[];
}

export default function TripDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    dil,
    yukleniyor,
    getTrip,
    updateTripData,
    updateTripCover,
    customCategories,
    addCustomCategory,
    renameCustomCategory,
    deleteCustomCategory,
  } = useTrips();
  const seyahat = getTrip(Number(id));
  const t = T[dil];

  const tumKategoriler = useMemo(
    () => [...CATEGORIES, ...customCategories.map(ozelKategoriyiCategoryYap)],
    [customCategories],
  );

  const [aktif, setAktif] = useState<string>(CATEGORIES[0].id);
  const [formAcik, setFormAcik] = useState(false);
  const [taslak, setTaslak] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [detayOge, setDetayOge] = useState<CategoryItem | null>(null);
  const [katEklemeAcik, setKatEklemeAcik] = useState(false);
  const [yeniKatAdi, setYeniKatAdi] = useState('');
  const [yeniKatIkon, setYeniKatIkon] = useState(OZEL_KATEGORI_IKONLARI[0]);
  const [katDuzenle, setKatDuzenle] = useState<Category | null>(null);
  const [katDuzenleAdi, setKatDuzenleAdi] = useState('');
  const [dialog, setDialog] = useState<DialogState | null>(null);

  if (!seyahat) {
    return (
      <View style={[styles.root, styles.notFound]}>
        {yukleniyor ? (
          <>
            <ActivityIndicator color={PALETTE.forest} />
            <Text style={styles.notFoundText}>{t.loading}</Text>
          </>
        ) : (
          <>
            <Text style={styles.notFoundText}>404</Text>
            <Pressable onPress={() => router.back()} style={[sharedStyles.button, styles.backLinkButton]}>
              <Text style={sharedStyles.buttonText}>‹</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  const kat = tumKategoriler.find((k) => k.id === aktif) ?? tumKategoriler[0];
  const liste = seyahat.veri[kat.id] ?? [];
  const biten = liste.filter((i) => i[kat.checkKey]).length;
  const gun = gunSay(seyahat.bas, seyahat.bit);

  const formuKapat = () => {
    setFormAcik(false);
    setTaslak({});
    setEditId(null);
  };

  const kaydetOge = () => {
    if (!taslak.baslik || !taslak.baslik.trim()) return;
    if (editId != null) {
      updateTripData(seyahat.id, {
        ...seyahat.veri,
        [kat.id]: liste.map((i) => (i.id === editId ? { ...i, ...taslak, baslik: taslak.baslik } : i)),
      });
    } else {
      const yeniOge: CategoryItem = { ...taslak, id: Date.now(), baslik: taslak.baslik, [kat.checkKey]: false };
      updateTripData(seyahat.id, { ...seyahat.veri, [kat.id]: [...liste, yeniOge] });
    }
    formuKapat();
  };

  const cevir = (itemId: number) => {
    updateTripData(seyahat.id, {
      ...seyahat.veri,
      [kat.id]: liste.map((i) => (i.id === itemId ? { ...i, [kat.checkKey]: !i[kat.checkKey] } : i)),
    });
  };

  const sil = (itemId: number) => {
    updateTripData(seyahat.id, { ...seyahat.veri, [kat.id]: liste.filter((i) => i.id !== itemId) });
  };

  const duzenlemeyeBasla = (item: CategoryItem) => {
    const draft: Record<string, string> = {};
    kat.fields.forEach((f) => {
      const v = item[f.key];
      if (v != null) draft[f.key] = String(v);
    });
    setTaslak(draft);
    setEditId(item.id);
    setDetayOge(null);
    setFormAcik(true);
  };

  const detaydanSil = (item: CategoryItem) => {
    sil(item.id);
    setDetayOge(null);
  };

  const kapakSec = async () => {
    const sonuc = await kapakFotoSec();
    if (sonuc.status === 'ok') {
      const eskiFoto = seyahat.foto;
      updateTripCover(seyahat.id, sonuc.uri);
      kapakFotoSil(eskiFoto);
    } else if (sonuc.status === 'denied') {
      setDialog({ title: t.permDeniedTitle, message: t.permDeniedMsg, buttons: [{ text: t.ok, tone: 'cancel' }] });
    } else if (sonuc.status === 'storage') {
      setDialog({ title: t.storageErrorTitle, message: t.storageErrorMsg, buttons: [{ text: t.ok, tone: 'cancel' }] });
    } else if (sonuc.status === 'error') {
      setDialog({ title: t.photoErrorTitle, message: t.photoErrorMsg, buttons: [{ text: t.ok, tone: 'cancel' }] });
    }
  };

  const kapakKaldir = () => {
    kapakFotoSil(seyahat.foto);
    updateTripCover(seyahat.id, undefined);
  };

  const kapagiDuzenle = () => {
    if (seyahat.foto) {
      setDialog({
        title: t.editCoverTitle,
        buttons: [
          { text: t.cancel, tone: 'cancel' },
          { text: t.changePhoto, onPress: kapakSec },
          { text: t.removePhoto, tone: 'destructive', onPress: kapakKaldir },
        ],
      });
    } else {
      kapakSec();
    }
  };

  const katEklemeyiAc = () => {
    setYeniKatAdi('');
    setYeniKatIkon(OZEL_KATEGORI_IKONLARI[0]);
    setKatEklemeAcik(true);
  };

  const katEklemeyiKapat = () => setKatEklemeAcik(false);

  const katKaydet = () => {
    const yeni = addCustomCategory({ ad: yeniKatAdi, icon: yeniKatIkon });
    if (!yeni) return;
    setKatEklemeAcik(false);
    setAktif(yeni.id);
    formuKapat();
  };

  const katSilOnayla = (k: Category) => {
    setDialog({
      title: t.deleteCategoryTitle,
      message: t.deleteCategoryMsg(k.label[dil]),
      buttons: [
        { text: t.cancel, tone: 'cancel' },
        {
          text: t.delete,
          tone: 'destructive',
          onPress: () => {
            deleteCustomCategory(k.id);
            if (aktif === k.id) {
              setAktif(CATEGORIES[0].id);
              formuKapat();
            }
          },
        },
      ],
    });
  };

  const katUzunBasildi = (k: Category) => {
    if (!k.ozel) return;
    setDialog({
      title: k.label[dil],
      buttons: [
        { text: t.cancel, tone: 'cancel' },
        { text: t.renameCategory, onPress: () => { setKatDuzenle(k); setKatDuzenleAdi(k.label[dil]); } },
        { text: t.delete, tone: 'destructive', onPress: () => katSilOnayla(k) },
      ],
    });
  };

  const katDuzenleKaydet = () => {
    if (!katDuzenle) return;
    renameCustomCategory(katDuzenle.id, katDuzenleAdi);
    setKatDuzenle(null);
  };

  return (
    <View style={styles.root}>
      <View style={styles.coverWrap}>
        <CoverIllustration tema={seyahat.tema} foto={seyahat.foto} height={200} />
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Pressable onPress={kapagiDuzenle} style={styles.editCoverButton}>
          <Text style={styles.editCoverButtonText}>✎</Text>
        </Pressable>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.city}>{seyahat.sehir}</Text>
        <View style={styles.titleMetaRow}>
          <Text style={styles.dateText}>
            {seyahat.bas ? `${tarihYaz(seyahat.bas, dil)} – ${tarihYaz(seyahat.bit, dil)}` : t.noDate2}
          </Text>
          {gun && <Text style={styles.daysText}>{t.days(gun)}</Text>}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsRow}
        contentContainerStyle={styles.tabsRowContent}>
        {tumKategoriler.map((k) => {
          const on = k.id === aktif;
          return (
            <Pressable
              key={k.id}
              onPress={() => {
                setAktif(k.id);
                formuKapat();
              }}
              onLongPress={() => katUzunBasildi(k)}
              style={[styles.tabButton, { backgroundColor: on ? PALETTE.forest : PALETTE.cream }]}>
              <Text style={{ opacity: 0.7, color: on ? PALETTE.cream : PALETTE.forest }}>{k.icon}</Text>
              <Text style={{ color: on ? PALETTE.cream : PALETTE.forest, fontSize: 13, fontWeight: '600' }}>
                {k.label[dil]}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={katEklemeyiAc} style={[styles.tabButton, styles.addCategoryTab]}>
          <Text style={styles.addCategoryTabText}>{t.addCategory}</Text>
        </Pressable>
      </ScrollView>

      <ScrollView style={sharedStyles.sheet} contentContainerStyle={styles.sheetContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{kat.label[dil]}</Text>
          <Text style={styles.sectionCount}>{t.done(biten, liste.length)}</Text>
        </View>

        {liste.length === 0 && !formAcik && <Text style={styles.emptyCat}>{t.emptyCat}</Text>}

        <View style={liste.length ? styles.itemsColumn : undefined}>
          {liste.map((it) => {
            const ok = Boolean(it[kat.checkKey]);
            const etiketler = kat.render(it, dil);
            return (
              <View key={it.id} style={styles.itemRow}>
                <Pressable
                  onPress={() => cevir(it.id)}
                  style={[styles.checkCircle, { borderColor: ok ? PALETTE.forest : PALETTE.sageDeep, backgroundColor: ok ? PALETTE.forest : PALETTE.cream }]}
                />
                <Pressable
                  onPress={() => setDetayOge(it)}
                  style={[styles.itemCard, { backgroundColor: kat.tint, opacity: ok ? 0.55 : 1 }]}>
                  <Text style={[styles.itemTitle, ok && styles.itemTitleDone]}>{it.baslik}</Text>
                  {etiketler.length > 0 && (
                    <View style={styles.tagsRow}>
                      {etiketler.map((x, i) => (
                        <Text key={i} style={styles.tag}>{x}</Text>
                      ))}
                    </View>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        {formAcik ? (
          <View style={styles.form}>
            {kat.fields.map((f) => (
              <Field key={f.key} label={f.label[dil]}>
                {f.type === 'select' ? (
                  <View style={styles.selectRow}>
                    {f.options?.map((o) => {
                      const secili = taslak[f.key] === o[dil];
                      return (
                        <Pressable
                          key={o.en}
                          onPress={() => setTaslak({ ...taslak, [f.key]: o[dil] })}
                          style={[styles.selectOption, { backgroundColor: secili ? PALETTE.forest : PALETTE.cream }]}>
                          <Text style={{ color: secili ? PALETTE.cream : PALETTE.forest, fontSize: 13 }}>{o[dil]}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    style={sharedStyles.input}
                    placeholder={f.ph?.[dil]}
                    placeholderTextColor={PALETTE.moss}
                    keyboardType={f.type === 'number' ? 'numeric' : 'default'}
                    value={taslak[f.key] || ''}
                    onChangeText={(v) => setTaslak({ ...taslak, [f.key]: v })}
                  />
                )}
              </Field>
            ))}
            <View style={styles.formButtonsRow}>
              <Pressable style={[sharedStyles.button, styles.saveButton]} onPress={kaydetOge}>
                <Text style={[sharedStyles.buttonText, styles.saveButtonText]}>{t.save}</Text>
              </Pressable>
              <Pressable style={[sharedStyles.button, styles.cancelButton]} onPress={formuKapat}>
                <Text style={[sharedStyles.buttonText, styles.cancelButtonText]}>{t.cancel}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={[sharedStyles.button, styles.addButton]} onPress={() => setFormAcik(true)}>
            <Text style={[sharedStyles.buttonText, styles.addButtonText]}>{t.addTo(kat.label[dil])}</Text>
          </Pressable>
        )}
      </ScrollView>

      <Modal visible={!!detayOge} transparent animationType="slide" onRequestClose={() => setDetayOge(null)}>
        <Pressable style={styles.backdrop} onPress={() => setDetayOge(null)} />
        {detayOge && (
          <View style={styles.detailSheet}>
            <View style={styles.detailHeaderRow}>
              <Text style={styles.detailTitle}>{detayOge.baslik}</Text>
              <Pressable onPress={() => setDetayOge(null)}>
                <Text style={styles.detailClose}>×</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.detailFields}>
              {kat.fields
                .filter((f) => f.key !== 'baslik')
                .map((f) => {
                  const deger = detayOge[f.key];
                  if (deger == null || deger === '') return null;
                  const haritaAlani = kat.id === 'rotalar' && f.key === 'harita';
                  return (
                    <View key={f.key} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{f.label[dil]}</Text>
                      {haritaAlani ? (
                        <Pressable onPress={() => acUrl(String(deger))}>
                          <Text style={[styles.detailValue, styles.detailLink]}>{t.openMap}</Text>
                        </Pressable>
                      ) : (
                        <Text style={styles.detailValue}>{String(deger)}</Text>
                      )}
                    </View>
                  );
                })}
            </ScrollView>

            <View style={styles.detailButtonsRow}>
              <Pressable style={[sharedStyles.button, styles.editButton]} onPress={() => duzenlemeyeBasla(detayOge)}>
                <Text style={[sharedStyles.buttonText, styles.editButtonText]}>{t.edit}</Text>
              </Pressable>
              <Pressable style={[sharedStyles.button, styles.deleteButton]} onPress={() => detaydanSil(detayOge)}>
                <Text style={[sharedStyles.buttonText, styles.deleteButtonText]}>{t.delete}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Modal>

      <Modal visible={katEklemeAcik} transparent animationType="slide" onRequestClose={katEklemeyiKapat}>
        <Pressable style={styles.backdrop} onPress={katEklemeyiKapat} />
        <View style={styles.detailSheet}>
          <View style={styles.detailHeaderRow}>
            <Text style={styles.detailTitle}>{t.addCategory}</Text>
            <Pressable onPress={katEklemeyiKapat}>
              <Text style={styles.detailClose}>×</Text>
            </Pressable>
          </View>

          <Field label={t.categoryName}>
            <TextInput
              style={sharedStyles.input}
              placeholder={t.categoryNamePh}
              placeholderTextColor={PALETTE.moss}
              value={yeniKatAdi}
              onChangeText={setYeniKatAdi}
            />
          </Field>

          <Field label={t.categoryIcon}>
            <View style={styles.iconGrid}>
              {OZEL_KATEGORI_IKONLARI.map((ikon) => (
                <Pressable
                  key={ikon}
                  onPress={() => setYeniKatIkon(ikon)}
                  style={[styles.iconOption, { backgroundColor: yeniKatIkon === ikon ? PALETTE.forest : PALETTE.sage }]}>
                  <Text style={{ fontSize: 18 }}>{ikon}</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <View style={styles.formButtonsRow}>
            <Pressable style={[sharedStyles.button, styles.saveButton]} onPress={katKaydet}>
              <Text style={[sharedStyles.buttonText, styles.saveButtonText]}>{t.save}</Text>
            </Pressable>
            <Pressable style={[sharedStyles.button, styles.cancelButton]} onPress={katEklemeyiKapat}>
              <Text style={[sharedStyles.buttonText, styles.cancelButtonText]}>{t.cancel}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={!!katDuzenle} transparent animationType="slide" onRequestClose={() => setKatDuzenle(null)}>
        <Pressable style={styles.backdrop} onPress={() => setKatDuzenle(null)} />
        {katDuzenle && (
          <View style={styles.detailSheet}>
            <View style={styles.detailHeaderRow}>
              <Text style={styles.detailTitle}>{t.renameCategory}</Text>
              <Pressable onPress={() => setKatDuzenle(null)}>
                <Text style={styles.detailClose}>×</Text>
              </Pressable>
            </View>

            <Field label={t.categoryName}>
              <TextInput
                style={sharedStyles.input}
                value={katDuzenleAdi}
                onChangeText={setKatDuzenleAdi}
              />
            </Field>

            <View style={styles.formButtonsRow}>
              <Pressable style={[sharedStyles.button, styles.saveButton]} onPress={katDuzenleKaydet}>
                <Text style={[sharedStyles.buttonText, styles.saveButtonText]}>{t.save}</Text>
              </Pressable>
              <Pressable style={[sharedStyles.button, styles.cancelButton]} onPress={() => setKatDuzenle(null)}>
                <Text style={[sharedStyles.buttonText, styles.cancelButtonText]}>{t.cancel}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Modal>

      <ConfirmDialog
        visible={!!dialog}
        title={dialog?.title}
        message={dialog?.message}
        buttons={dialog?.buttons ?? []}
        onClose={() => setDialog(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PALETTE.sage,
  },
  notFound: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 24,
    color: PALETTE.forest,
  },
  backLinkButton: {
    backgroundColor: PALETTE.cream,
    width: 44,
    paddingHorizontal: 0,
  },
  coverWrap: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    backgroundColor: PALETTE.cream,
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: PALETTE.forest,
    fontSize: 16,
  },
  editCoverButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    backgroundColor: PALETTE.cream,
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCoverButtonText: {
    color: PALETTE.forest,
    fontSize: 16,
  },
  titleBlock: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
  },
  city: {
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '700',
    color: PALETTE.forest,
  },
  titleMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  dateText: {
    fontSize: 13,
    color: PALETTE.moss,
  },
  daysText: {
    fontSize: 15,
    fontWeight: '700',
    color: PALETTE.coral,
  },
  tabsRow: {
    flexGrow: 0,
    paddingBottom: 16,
  },
  tabsRowContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 999,
  },
  addCategoryTab: {
    borderWidth: 1,
    borderColor: PALETTE.sageDeep,
    borderStyle: 'dashed',
  },
  addCategoryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: PALETTE.forest,
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 19,
    color: PALETTE.forest,
  },
  sectionCount: {
    fontSize: 12,
    color: PALETTE.moss,
  },
  emptyCat: {
    color: PALETTE.moss,
    fontSize: 14,
    paddingVertical: 26,
    textAlign: 'center',
  },
  itemsColumn: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
    marginTop: 16,
  },
  itemCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: PALETTE.forest,
  },
  itemTitleDone: {
    textDecorationLine: 'line-through',
  },
  tagsRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: PALETTE.cream,
    color: PALETTE.moss,
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  form: {
    backgroundColor: PALETTE.sage,
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  selectOption: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  formButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    backgroundColor: PALETTE.forest,
    flex: 1,
  },
  saveButtonText: {
    color: PALETTE.cream,
  },
  cancelButton: {
    backgroundColor: PALETTE.cream,
  },
  cancelButtonText: {
    color: PALETTE.forest,
  },
  addButton: {
    backgroundColor: PALETTE.coral,
    width: '100%',
    marginTop: 14,
  },
  addButtonText: {
    color: PALETTE.cream,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(32,55,43,0.4)',
  },
  detailSheet: {
    backgroundColor: PALETTE.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '70%',
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700',
    color: PALETTE.forest,
    flexShrink: 1,
    paddingRight: 12,
  },
  detailClose: {
    fontSize: 22,
    color: PALETTE.moss,
  },
  detailFields: {
    marginBottom: 8,
  },
  detailRow: {
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: PALETTE.moss,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: PALETTE.forest,
  },
  detailLink: {
    color: PALETTE.coral,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  detailButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    backgroundColor: PALETTE.forest,
    flex: 1,
  },
  editButtonText: {
    color: PALETTE.cream,
  },
  deleteButton: {
    backgroundColor: PALETTE.sand,
    flex: 1,
  },
  deleteButtonText: {
    color: PALETTE.forest,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  iconOption: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
