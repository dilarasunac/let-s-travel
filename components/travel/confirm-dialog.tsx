import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { PALETTE } from '@/constants/travel';

export type OnayButonTonu = 'default' | 'destructive' | 'cancel';

export interface OnayButonu {
  text: string;
  tone?: OnayButonTonu;
  onPress?: () => void;
}

export interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons: OnayButonu[];
  onClose: () => void;
}

const SURE = 200;

export function ConfirmDialog({ visible, title, message, buttons, onClose }: ConfirmDialogProps) {
  const [gorunur, setGorunur] = useState(visible);
  const ilerleme = useSharedValue(visible ? 1 : 0);
  const hareketAzalt = useReducedMotion();

  useEffect(() => {
    if (visible) {
      setGorunur(true);
      if (hareketAzalt) {
        ilerleme.value = 1;
      } else {
        ilerleme.value = withTiming(1, { duration: SURE, easing: Easing.out(Easing.cubic) });
      }
    } else {
      if (hareketAzalt) {
        ilerleme.value = 0;
        setGorunur(false);
      } else {
        ilerleme.value = withTiming(0, { duration: SURE, easing: Easing.in(Easing.cubic) }, (bitti) => {
          if (bitti) runOnJS(setGorunur)(false);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, hareketAzalt]);

  const guvenliKapat = useCallback(() => {
    onClose();
    buttons.find((b) => b.tone === 'cancel')?.onPress?.();
  }, [buttons, onClose]);

  useEffect(() => {
    if (!gorunur) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      guvenliKapat();
      return true;
    });
    return () => sub.remove();
  }, [gorunur, guvenliKapat]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: ilerleme.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    opacity: ilerleme.value,
    transform: [{ scale: 0.94 + ilerleme.value * 0.06 }],
  }));

  if (!gorunur) return null;

  const dikeyDizilim = buttons.length > 2;

  return (
    <Modal visible={gorunur} transparent animationType="none" onRequestClose={guvenliKapat} statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={guvenliKapat} />
        </Animated.View>

        <View style={styles.center} pointerEvents="box-none">
          <Animated.View style={[styles.sheet, sheetStyle]}>
            {!!title && <Text style={styles.title}>{title}</Text>}
            {!!message && <Text style={styles.message}>{message}</Text>}

            <View style={[styles.buttonsRow, dikeyDizilim && styles.buttonsColumn]}>
              {buttons.map((b, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    onClose();
                    b.onPress?.();
                  }}
                  style={[
                    styles.button,
                    dikeyDizilim ? styles.buttonFullWidth : styles.buttonFlex,
                    b.tone === 'destructive' && styles.buttonDestructive,
                    b.tone === 'cancel' && styles.buttonCancel,
                    (!b.tone || b.tone === 'default') && styles.buttonDefault,
                  ]}>
                  <Text
                    style={[
                      styles.buttonText,
                      b.tone === 'destructive' && styles.buttonTextDestructive,
                      b.tone === 'cancel' && styles.buttonTextCancel,
                      (!b.tone || b.tone === 'default') && styles.buttonTextDefault,
                    ]}>
                    {b.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(32,55,43,0.45)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: PALETTE.cream,
    borderRadius: 26,
    padding: 22,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 19,
    fontWeight: '700',
    color: PALETTE.forest,
  },
  message: {
    fontSize: 14,
    color: PALETTE.moss,
    marginTop: 8,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  buttonsColumn: {
    flexDirection: 'column',
  },
  button: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFlex: {
    flex: 1,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDefault: {
    backgroundColor: PALETTE.forest,
  },
  buttonDestructive: {
    backgroundColor: PALETTE.coral,
  },
  buttonCancel: {
    backgroundColor: PALETTE.sage,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextDefault: {
    color: PALETTE.cream,
  },
  buttonTextDestructive: {
    color: PALETTE.cream,
  },
  buttonTextCancel: {
    color: PALETTE.forest,
  },
});
