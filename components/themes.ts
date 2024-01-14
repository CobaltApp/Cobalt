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

//Crypto Whale
//Background: '#F4F9FE',
//Primary: '#0059E7',
//Secondary: '#E0E4F5',
//textPrimary: '#FFFFFF',
//textSecondary: '#5A6274',
//Green: '#06B966',
//Red: '#FC3044',

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
    //Dark Blue: #251AF7
    //Yellow: #EDF71A
    background: '#FFFFFF', //Cultured
    foreground: '#0F0F0F', //Smoky Black
    foregroundInactive: '#A6A6A6', //Quick Silver
    //foregroundLabel: '#717171', //Dark Silver
    element: '#F5F5F5', //Cultured
    //element: '#EDEDED', //Bright Gray
    //tab: '#DBDBDB', //Gainsboro
    white: '#FFFFFF',
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
    background: '#171717', //Chinese Black
    foreground: '#F5F5F5', //Cultured
    foregroundInactive: '#717171', //Dark Silver
    //foregroundLabel: '#A6A6A6', //Quick Silver
    element: '#1F1F1F', //Eerie Black //card
    //border: '#2E2E2E', //Dark Charcoal
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
