import { DefaultTheme, DarkTheme, useTheme as useThemeBase } from '@react-navigation/native';
import { Appearance } from 'react-native';

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
  colors: {
    ...DefaultTheme.colors,
    brandingColor: '#FCFCFD',
    customHeader: '#FCFCFD',
    foregroundColor: '#23262F',
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    buttonBackgroundColor: '#CDB4DB',
    buttonTextColor: '#23262F',
    buttonAlternativeTextColor: '#3772FF',
    buttonDisabledBackgroundColor: '#E4D7CF',
    buttonDisabledTextColor: '#777E90',
    inputBorderColor: '#B1B5C3',
    inputBackgroundColor: '#F4F5F6',
    alternativeTextColor: '#777E90',
    alternativeTextColor2: '#3772FF',
    buttonBlueBackgroundColor: '#CDB4DB',
    incomingBackgroundColor: '#d2f8d6',
    incomingForegroundColor: '#58BD7D',
    outgoingBackgroundColor: '#f8d2d2',
    outgoingForegroundColor: '#FF6838',
    successColor: '#58BD7D',
    failedColor: '#FF6838',
    shadowColor: '#000000',
    inverseForegroundColor: '#FCFCFD',
    hdborderColor: '#4BC9F0',
    hdbackgroundColor: '#F4F5F6',
    lnborderColor: '#FFD166',
    lnbackgroundColor: '#F4F5F6',
    background: '#FCFCFD',
    lightButton: '#E6E8EC',
    ballReceive: '#d2f8d6',
    ballOutgoing: '#f8d2d2',
    lightBorder: '#E6E8EC',
    ballOutgoingExpired: '#E6E8EC',
    modal: '#FFFFFF',
    formBorder: '#B1B5C3',
    modalButton: '#CDB4DB',
    darkGray: '#777E90',
    scanLabel: '#777E90',
    feeText: '#777E90',
    feeLabel: '#d2f8d6',
    feeValue: '#58BD7D',
    feeActive: '#d2f8d6',
    labelText: '#777E90',
    cta2: '#23262F',
    outputValue: '#23262F',
    elevated: '#FFFFFF',
    mainColor: '#CDB4DB',
    success: '#CDB4DB',
    successCheck: '#3772FF',
    msSuccessBG: '#58BD7D',
    msSuccessCheck: '#FFFFFF',
    newBlue: '#3772FF',
    redBG: '#E4D7CF',
    redText: '#FF6838',
    changeBackground: '#E4D7CF',
    changeText: '#FFD166',
    receiveBackground: '#D1F9D6',
    receiveText: '#58BD7D',
  },
};

export type Theme = typeof BlueDefaultTheme;

export const BlueDarkTheme: Theme = {
  ...DarkTheme,
  closeImage: require('../img/close-white.png'),
  scanImage: require('../img/scan-white.png'),
  barStyle: 'light-content',
  colors: {
    ...BlueDefaultTheme.colors,
    ...DarkTheme.colors,
    customHeader: '#141416',
    brandingColor: '#141416',
    borderTopColor: '#B1B5C3',
    foregroundColor: '#FCFCFD',
    buttonDisabledBackgroundColor: '#23262F',
    buttonBackgroundColor: '#23262F',
    buttonTextColor: '#FCFCFD',
    lightButton: 'rgba(255,255,255,.1)',
    buttonAlternativeTextColor: '#FCFCFD',
    alternativeTextColor: '#B1B5C3',
    alternativeTextColor2: '#3772FF',
    ballReceive: '#23262F',
    ballOutgoing: '#23262F',
    lightBorder: '#23262F',
    ballOutgoingExpired: '#23262F',
    modal: '#23262F',
    formBorder: '#23262F',
    inputBackgroundColor: '#23262F',
    modalButton: '#141416',
    darkGray: '#23262F',
    feeText: '#B1B5C3',
    feeLabel: '#8EFFE5',
    feeValue: '#141416',
    feeActive: 'rgba(210,248,214,.2)',
    cta2: '#FCFCFD',
    outputValue: '#FFFFFF',
    elevated: '#141416',
    mainColor: '#3772FF',
    success: '#23262F',
    successCheck: '#3772FF',
    buttonBlueBackgroundColor: '23262F',
    scanLabel: 'rgba(255,255,255,.2)',
    labelText: '#FFFFFF',
    msSuccessBG: '#8EFFE5',
    msSuccessCheck: '#141416',
    newBlue: '#3772FF',
    redBG: '#23262F',
    redText: '#FF6838',
    changeBackground: '#23262F',
    changeText: '#FFD166',
    receiveBackground: 'rgba(210,248,214,.2)',
    receiveText: '#58BD7D',
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
