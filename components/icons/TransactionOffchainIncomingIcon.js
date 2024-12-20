import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';

const styles = StyleSheet.create({
  boxIncoming: {
    position: 'relative',
  },
  ballIncomingWithoutRotate: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  icon: {
    left: 0,
    marginTop: 6,
  },
});

const TransactionOffchainIncomingIcon = props => {
  const { colors } = useTheme();
  const stylesHooks = StyleSheet.create({
    ballIncomingWithoutRotate: {
      backgroundColor: colors.positive,
    },
  });

  return (
    <View style={styles.boxIncoming}>
      <View style={[styles.ballIncomingWithoutRotate, stylesHooks.ballIncomingWithoutRotate]}>
        <Icon name="zap" size={16} type="feather" color={colors.positive} iconStyle={styles.icon} />
      </View>
    </View>
  );
};

export default TransactionOffchainIncomingIcon;
