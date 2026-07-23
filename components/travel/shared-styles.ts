import { StyleSheet } from 'react-native';

import { PALETTE } from '@/constants/travel';

export const sharedStyles = StyleSheet.create({
  input: {
    width: '100%',
    marginTop: 5,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: PALETTE.cream,
    color: PALETTE.forest,
    fontSize: 14,
  },
  button: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheet: {
    backgroundColor: PALETTE.cream,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
  },
});
