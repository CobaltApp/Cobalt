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
    lnbackgroundColor: '#F4F5F6',
    buttonDisabledTextColor: '#777E90',
    inputBorderColor: '#B1B5C3',

    background: '#FCFCFD',

    inputBackgroundColor: '#FCFCFD',
    formBorder: '#E6E8EC',

    modal: '#F4F5F6',
    redBG: '#F4F5F6',
    receiveBackground: '#F4F5F6',
    
    lightButton: '#E6E8EC',
    buttonDisabledBackgroundColor: '#E6E8EC',
    buttonBackgroundColor: '#E6E8EC',
    buttonBlueBackgroundColor: '#E6E8EC',
    lightBorder: '#E6E8EC',
    ballOutgoingExpired: '#E6E8EC',
    modalButton: '#E6E8EC',
    success: '#E6E8EC',
    changeBackground: '#E6E8EC',

    border: '#777E90',

    scanLabel: '#353945',
    labelText: '#353945',

    foreground: '#23262F',
    
    incomingBackgroundColor: '#d2f8d6',
    incomingForegroundColor: '#58BD7D',
    outgoingBackgroundColor: '#f8d2d2',
    outgoingForegroundColor: '#FF6838',

    primary: '#3772FF',
    positive: '#58BD7D',
    negative: '#FF6838',
    lightning: '#FFD166',
  
    ballReceive: '#d2f8d6',
    ballOutgoing: '#f8d2d2',
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
    background: '#141416',

    inputBackgroundColor: '#23262F',
    formBorder: '#23262F',
    modal: '#23262F',
    redBG: '#23262F',
    receiveBackground: '#23262F',

    lightButton: '#353945',
    buttonDisabledBackgroundColor: '#353945',
    buttonBackgroundColor: '#353945',
    buttonBlueBackgroundColor: '#353945',
    lightBorder: '#353945',
    ballOutgoingExpired: '#353945',
    modalButton: '#353945',
    success: '#353945',
    changeBackground: '#353945',

    border: '#B1B5C3', 
        
    scanLabel: '#E6E8EC',
    labelText: '#E6E8EC',

    foreground: '#F4F5F6',

    ballReceive: '#23262F',
    ballOutgoing: '#23262F',
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
