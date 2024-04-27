import { I18nManager, StyleSheet } from 'react-native';
import { BlueCurrentTheme } from './themes';

export const defaultStyles = StyleSheet.create({
  h1: {
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    color: BlueCurrentTheme.colors.foreground,
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 32,
  },
  h2: {
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    color: BlueCurrentTheme.colors.foreground,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 20,
  },
  h3: {
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    color: BlueCurrentTheme.colors.foreground,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 18,
  },
  h4: {
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    color: BlueCurrentTheme.colors.foreground,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
  },
  inputText: {
    flex: 1,
    minHeight: 40,
    color: BlueCurrentTheme.colors.foreground,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
  },
  divider: { borderWidth: 0.5, borderColor: BlueCurrentTheme.colors.background },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 40,
    backgroundColor: BlueCurrentTheme.colors.button,
  },
  btnText: {
    color: BlueCurrentTheme.colors.white,
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 40,
    backgroundColor: BlueCurrentTheme.colors.dark,
  },
  btnSecondaryText: {
    color: BlueCurrentTheme.colors.button,
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
  },
});
