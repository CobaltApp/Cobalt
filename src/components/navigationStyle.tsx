import React from 'react';
import { Image, Keyboard, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';
import { Theme } from './themes';
import loc from '../loc';
import { defaultStyles } from './defaultStyles';
import RoundButton from './button-round';

type NavigationOptions = {
  headerHideShadow?: true;
  headerStyle?: {
    height: number;
    borderBottomWidth: number;
    elevation: number;
    shadowOpacity?: number;
    shadowOffset: { height?: number; width?: number };
    backgroundColor: string;
  };
  headerTitleStyle?: {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    color: string;
  };
  headerLeft?: (() => React.ReactElement) | null;
  headerRight?: (() => React.ReactElement) | null;
  headerBackTitleVisible?: false;
  headerTintColor?: string;
  title?: string;
};

type OptionsFormatter = (options: NavigationOptions, deps: { theme: Theme; navigation: any; route: any }) => NavigationOptions;

export type NavigationOptionsGetter = (theme: Theme) => (deps: { navigation: any; route: any }) => NavigationOptions;

const navigationStyle = (
  {
    closeButton = false,
    closeButtonFunc,
    ...opts
  }: NavigationOptions & {
    closeButton?: boolean;

    closeButtonFunc?: (deps: { navigation: any; route: any }) => React.ReactElement;
  },
  formatter: OptionsFormatter,
): NavigationOptionsGetter => {
  return theme =>
    ({ navigation, route }) => {
      let headerRight;
      if (closeButton) {
        const handleClose = closeButtonFunc
          ? () => closeButtonFunc({ navigation, route })
          : () => {
              Keyboard.dismiss();
              navigation.goBack(null);
            };
        headerRight = () => (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={loc._.close}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 40,
              width: 40,
              borderRadius: 22,
              backgroundColor: theme.colors.card,
            }}
            onPress={handleClose}
            testID="NavigationCloseButton"
          >
            <Image source={theme.closeImage} />
          </TouchableOpacity>
        );
      }

      let options: NavigationOptions = {
        headerHideShadow: true,
        headerStyle: {
          height: 120,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { height: 0, width: 0 },
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: defaultStyles.h2,
        headerLeft: () => (
          <TouchableOpacity
          accessibilityRole="button"
            accessibilityLabel={loc._.close}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: 40,
            width: 40,
            borderRadius: 22,
            backgroundColor: theme.colors.card,
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 0.1,
            shadowRadius: 12,
          }}
          onPress={() => {
            Keyboard.dismiss();
            navigation.goBack(null);
          }}
        >
          <Icon name="chevron-left" type="feather" size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
        ),
        headerRight,
        headerBackTitleVisible: false,
        headerTintColor: theme.colors.foreground,
        ...opts,
      };

      if (formatter) {
        options = formatter(options, { theme, navigation, route });
      }

      return options;
    };
};

export default navigationStyle;

export const navigationStyleTx = (opts: NavigationOptions, formatter: OptionsFormatter): NavigationOptionsGetter => {
  return theme =>
    ({ navigation, route }) => {
      let options: NavigationOptions = {
        headerStyle: {
          height: 120,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOffset: { height: 0, width: 0 },
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: defaultStyles.h2,
        headerHideShadow: true,
        headerBackTitleVisible: false,
        headerTintColor: theme.colors.foreground,
        headerLeft: () => (
          <TouchableOpacity
          accessibilityRole="button"
            accessibilityLabel={loc._.close}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: 40,
            width: 40,
            borderRadius: 22,
            backgroundColor: theme.colors.card,
            shadowOffset: {
              width: 0,
              height: 12,
            },
            shadowOpacity: 0.1,
            shadowRadius: 12,
          }}
          onPress={() => {
            Keyboard.dismiss();
            navigation.goBack(null);
          }}
        >
          <Icon name="chevron-left" type="feather" size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
        ),
        ...opts,
      };

      if (formatter) {
        options = formatter(options, { theme, navigation, route });
      }

      return options;
    };
};
