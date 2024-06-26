/* eslint react/prop-types: "off", react-native/no-inline-styles: "off" */
import { useTheme } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';
import React from 'react';

export const TransactionPendingIconBig = props => {
  const { colors } = useTheme();

  const stylesBlueIconHooks = StyleSheet.create({
    ball: {
      backgroundColor: colors.element,
    },
    ball2: {
      width: 150,
      height: 150,
      borderRadius: 75,
    },
    boxIncoming: {
      position: 'relative',
    },
  });
  return (
    <View {...props}>
      <View style={stylesBlueIconHooks.boxIncoming}>
        <View style={[stylesBlueIconHooks.ball2, stylesBlueIconHooks.ball]}>
          <Icon {...props} name="more-horizontal" type="feather" size={100} color={colors.foreground} iconStyle={{ left: 0, top: 25 }} />
        </View>
      </View>
    </View>
  );
};
