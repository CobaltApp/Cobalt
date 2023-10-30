import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { useTheme } from '@react-navigation/native';

const styles = StyleSheet.create({
  boxIncoming: {
    position: 'relative',
  },
  ballOutgoing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    transform: [{ rotate: '225deg' }],
    justifyContent: 'center',
  },
});

const TransactionOutgoingIcon = props => {
  const { colors } = useTheme();
  const stylesBlueIconHooks = StyleSheet.create({
    ballOutgoing: {
      backgroundColor: colors.negative,
    },
  });

  return (
    <View style={styles.boxIncoming}>
      <View style={[styles.ballOutgoing, stylesBlueIconHooks.ballOutgoing]}>
        <Icon name="arrow-down" size={16} type="feather" color={colors.negative} />
      </View>
    </View>
  );
};

export default TransactionOutgoingIcon;
