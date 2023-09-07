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
      backgroundColor: colors.buttonBackgroundColor,
    },
  });

  return (
    <Avatar
      rounded
      containerStyle={[styles.ball, stylesHook.ball]}
      icon={{ name: 'add', size: 22, type: 'ionicons', color: colors.foreground }}
      {...props}
    />
  );
};

export default PlusIcon;
