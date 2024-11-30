import { DefaultTheme, DarkTheme, useTheme as useThemeBase } from '@react-navigation/native';
import { Appearance } from 'react-native';

// Bitcloud
// Crayola Blue (Primary) #3772FF
// Giants Orange #FF6838
// Emerald #58BD7D
// Vivid Sky Blue #4BC9F0
// Sunglow #FFD166
// Amethyst (remove) #9757D7
// Champagne Pink (remove) #E4D7CF
// Thistle (remove) #CDB4DB
// White #FFFFFF
// Night #141416
// Raisin Black #23262F
// Onyx #353945
// Slate Gray #777E90
// French Gray #B1B5C3
// Anti-Flash White #E6E8EC
// Anti-Flash White #F4F5F6
// White #FCFCFD

export const BlueDefaultTheme = {
  ...DefaultTheme,
  closeImage: require('../img/close.png'),
  barStyle: 'dark-content',
  scanImage: require('../img/scan.png'),
  logoImage: require('../img/logolight-2048x1024.png'),
  colors: {
    ...DefaultTheme.colors,
    primary: '#1A7EF7', //Crayola Blue
    secondary: '#F7931A', //Bitcoin Orange
    tertiary: '#931AF7', //Purple
    accent: '#1AEDF7', //Fluorescent Blue
    positive: '#1AF793', //Medium Spring Green
    negative: '#F71A7E', //Electric Pink
    background: '#F4F4F4',
    foreground: '#363636',
    foregroundInactive: '#A6A6A6',
    card: '#FFFFFF',
    element: '#FAFAFA',
    button: '#030D19',
    white: '#FFFFFF',
    dark: '#EDEDED',
    shadow: '#000000',
  },
};

export type Theme = typeof BlueDefaultTheme;

export const BlueDarkTheme: Theme = {
  ...DarkTheme,
  closeImage: require('../img/close-white.png'),
  scanImage: require('../img/scan-white.png'),
  logoImage: require('../img/logodark-2048x1024.png'),
  barStyle: 'light-content',
  colors: {
    ...BlueDefaultTheme.colors,
    ...DarkTheme.colors,
    background: '#051931',
    foreground: '#FFFFFF',
    foregroundInactive: '#CACACA',
    element: '#08264A',
    card: '#0A3263',
    button: '#1A7EF7',
    dark: '#030D19',
  },
};

// Casting theme value to get autocompletion
export const useTheme = (): Theme => useThemeBase() as Theme;

export class BlueCurrentTheme {
  static colors: Theme['colors'];
  static closeImage: Theme['closeImage'];
  static scanImage: Theme['scanImage'];

  static updateColorScheme(): void {
    const isColorSchemeDark = Appearance.getColorScheme() === 'dark';
    BlueCurrentTheme.colors = isColorSchemeDark ? BlueDarkTheme.colors : BlueDefaultTheme.colors;
    BlueCurrentTheme.closeImage = isColorSchemeDark ? BlueDarkTheme.closeImage : BlueDefaultTheme.closeImage;
    BlueCurrentTheme.scanImage = isColorSchemeDark ? BlueDarkTheme.scanImage : BlueDefaultTheme.scanImage;
  }
}

BlueCurrentTheme.updateColorScheme();
