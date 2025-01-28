import React from 'react';
import { StyleSheet } from 'react-native';
import { Avatar } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';

const styles = StyleSheet.create({
  ball: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});

const PlusIcon = props => {
  const { colors } = useTheme();
  const stylesHook = StyleSheet.create({
    ball: {
      backgroundColor: colors.element,
    },
  });

  return (
    <Avatar
      rounded
      containerStyle={[styles.ball, stylesHook.ball]}
      icon={{ name: 'plus', size: 22, type: 'feather', color: colors.foreground }}
      {...props}
    />
  );
};

export default PlusIcon;
