/* eslint react/prop-types: "off", react-native/no-inline-styles: "off" */
import { useTheme } from '@react-navigation/native';
import { Image, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-elements';
import React from 'react';

export const LdkButton = props => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity accessibilityRole="button" onPress={props.onPress}>
      <View
        style={{
          borderColor: (props.active && colors.secondary) || colors.element,
          borderWidth: 1.5,
          borderRadius: 8,
          backgroundColor: colors.element,
          minWidth: props.style.width,
          minHeight: props.style.height,
          height: props.style.height,
          flex: 1,
          marginBottom: 8,
        }}
      >
        <View style={{ marginHorizontal: 16, marginVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
          <View>
            <Image style={{ width: 34, height: 34, marginRight: 8 }} source={require('../img/addWallet/lightning.png')} />
          </View>
          <View>
            <Text style={{ color: colors.secondary, fontWeight: 'bold', fontSize: 18 }}>{props.text || '?'}</Text>
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '500' }}>{props.subtext || '?'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
