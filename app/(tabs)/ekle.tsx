import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { createElement, useState, type ChangeEvent } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog, OnayButonu } from '@/components/travel/confirm-dialog';
import { CoverIllustration } from '@/components/travel/cover-illustration';
import { Field } from '@/components/travel/field';
import { sharedStyles } from '@/components/travel/shared-styles';
import { NewTripDraft, useTrips } from '@/contexts/trips-context';
import { PALETTE, T, ThemeId, THEMES } from '@/constants/travel';
import { kapakFotoSec, kapakFotoSil } from '@/lib/cover-photo';

const bosTaslak: NewTripDraft = { sehir: '', bas: '', bit: '', tema: 'city' };

const webTarihStili = {
  width: '100%',
  marginTop: 5,
  paddingTop: 11,
  paddingBottom: 11,
  paddingLeft: 13,
  paddingRight: 13,
  borderRadius: 12,
  backgroundColor: PALETTE.cream,
  color: PALETTE.forest,
  fontSize: 14,
  fontFamily: 'inherit',
  border: 'none',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

function WebTarihAlani({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return createElement('input', {
    type: 'date',
    value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    style: webTarihStili,
  });
}

interface DialogState {
  title?: string;
  message?: string;
  buttons: OnayButonu[];
}

export default function EkleScreen() {
  const { dil, addTrip } = useTrips();
  const t = T[dil];
  const [yeni, setYeni] = useState<NewTripDraft>(bosTaslak);
  const [pickerFor, setPickerFor] = useState<'bas' | 'bit' | null>(null);
  const [fotoYukleniyor, setFotoYukleniyor] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const kaydet = () => {
    const trip = addTrip(yeni);
    if (!trip) return;
    setYeni(bosTaslak);
    router.push({ pathname: '/trip/[id]', params: { id: String(trip.id) } });
  };

  const fotoSec = async () => {
    setFotoYukleniyor(true);
    const sonuc = await kapakFotoSec();
    setFotoYukleniyor(false);
    if (sonuc.status === 'ok') {
      const eskiFoto = yeni.foto;
      setYeni((prev) => ({ ...prev, foto: sonuc.uri }));
      kapakFotoSil(eskiFoto);
    } else if (sonuc.status === 'denied') {
      setDialog({ title: t.permDeniedTitle, message: t.permDeniedMsg, buttons: [{ text: t.ok, tone: 'cancel' }] });
    } else if (sonuc.status === 'storage') {
      setDialog({ title: t.storageErrorTitle, message: t.storageErrorMsg, buttons: [{ text: t.ok, tone: 'cancel' }] });
    } else if (sonuc.status === 'error') {
      setDialog({ title: t.photoErrorTitle, message: t.photoErrorMsg, buttons: [{ text: t.ok, tone: 'cancel' }] });
    }
  };

  const fotoKaldir = () => {
    kapakFotoSil(yeni.foto);
    setYeni((prev) => ({ ...prev, foto: undefined }));
  };

  const onDateChange = (field: 'bas' | 'bit', date?: Date) => {
    setPickerFor(null);
    if (!date) return;
    setYeni((prev) => ({ ...prev, [field]: date.toISOString().slice(0, 10) }));
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.newTrip}</Text>
      </View>

      <ScrollView style={sharedStyles.sheet} contentContainerStyle={styles.sheetContent}>
        <View style={styles.cover}>
          <CoverIllustration tema={yeni.tema} foto={yeni.foto} height={130} />
        </View>

        <Field label={t.city}>
          <TextInput
            style={sharedStyles.input}
            placeholder={t.cityPh}
            placeholderTextColor={PALETTE.moss}
            value={yeni.sehir}
            onChangeText={(v) => setYeni({ ...yeni, sehir: v })}
          />
        </Field>

        <View style={styles.dateRow}>
          <Field label={t.start} flex>
            {Platform.OS === 'web' ? (
              <WebTarihAlani value={yeni.bas} onChange={(v) => setYeni((prev) => ({ ...prev, bas: v }))} />
            ) : (
              <Pressable style={sharedStyles.input} onPress={() => setPickerFor('bas')}>
                <Text style={{ color: yeni.bas ? PALETTE.forest : PALETTE.moss }}>{yeni.bas || t.pick}</Text>
              </Pressable>
            )}
          </Field>
          <Field label={t.end} flex>
            {Platform.OS === 'web' ? (
              <WebTarihAlani value={yeni.bit} onChange={(v) => setYeni((prev) => ({ ...prev, bit: v }))} />
            ) : (
              <Pressable style={sharedStyles.input} onPress={() => setPickerFor('bit')}>
                <Text style={{ color: yeni.bit ? PALETTE.forest : PALETTE.moss }}>{yeni.bit || t.pick}</Text>
              </Pressable>
            )}
          </Field>
        </View>

        {pickerFor && (
          <DateTimePicker
            value={(pickerFor === 'bas' ? yeni.bas : yeni.bit) ? new Date(pickerFor === 'bas' ? yeni.bas : yeni.bit) : new Date()}
            mode="date"
            onChange={(_, date) => onDateChange(pickerFor, date)}
            {...(Platform.OS === 'ios' ? { display: 'inline' as const } : {})}
          />
        )}

        <Field label={t.theme}>
          <View style={styles.themeRow}>
            {(Object.entries(THEMES) as [ThemeId, (typeof THEMES)[ThemeId]][]).map(([id, th]) => (
              <Pressable
                key={id}
                onPress={() => setYeni({ ...yeni, tema: id })}
                style={[styles.themeButton, { backgroundColor: yeni.tema === id ? PALETTE.forest : PALETTE.sage }]}>
                <Text style={{ color: yeni.tema === id ? PALETTE.cream : PALETTE.forest, fontSize: 13, fontWeight: '600' }}>
                  {th[dil]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <View style={styles.photoButtonsRow}>
          <Pressable
            style={[sharedStyles.button, styles.photoButton]}
            onPress={fotoSec}
            disabled={fotoYukleniyor}>
            <Text style={[sharedStyles.buttonText, styles.photoButtonText]}>
              {fotoYukleniyor ? t.loading : yeni.foto ? t.changePhoto : t.pickPhoto}
            </Text>
          </Pressable>
          {yeni.foto && (
            <Pressable style={[sharedStyles.button, styles.removePhotoButton]} onPress={fotoKaldir}>
              <Text style={[sharedStyles.buttonText, styles.removePhotoButtonText]}>{t.removePhoto}</Text>
            </Pressable>
          )}
        </View>

        <Pressable style={[sharedStyles.button, styles.createButton]} onPress={kaydet}>
          <Text style={[sharedStyles.buttonText, styles.createButtonText]}>{t.create}</Text>
        </Pressable>
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
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 20,
    color: PALETTE.forest,
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cover: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 18,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: PALETTE.coral,
    width: '100%',
    marginTop: 20,
  },
  createButtonText: {
    color: PALETTE.cream,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  photoButton: {
    backgroundColor: PALETTE.sage,
    flex: 1,
  },
  photoButtonText: {
    color: PALETTE.forest,
  },
  removePhotoButton: {
    backgroundColor: PALETTE.cream,
  },
  removePhotoButtonText: {
    color: PALETTE.moss,
  },
});
