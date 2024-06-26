import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@react-navigation/native';
import { StyleSheet, View, Text } from 'react-native';
import loc, { formatStringAddTwoWhiteSpaces } from '../../loc';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  badgeText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 700,
  },
});

const AddressTypeBadge = ({ isInternal, hasTransactions }) => {
  const { colors } = useTheme();

  const stylesHook = StyleSheet.create({
    changeBadge: { backgroundColor: colors.secondary },
    receiveBadge: { backgroundColor: colors.positive },
    usedBadge: { backgroundColor: colors.element },
    changeText: { color: colors.background },
    receiveText: { color: colors.background },
    usedText: { color: colors.background },
  });

  const badgeLabel = hasTransactions
    ? loc.addresses.type_used
    : isInternal
    ? formatStringAddTwoWhiteSpaces(loc.addresses.type_change)
    : formatStringAddTwoWhiteSpaces(loc.addresses.type_receive);

  // eslint-disable-next-line prettier/prettier
  const badgeStyle = hasTransactions
   ? stylesHook.usedBadge
   : isInternal
    ? stylesHook.changeBadge
    : stylesHook.receiveBadge;

  // eslint-disable-next-line prettier/prettier
  const textStyle = hasTransactions
    ? stylesHook.usedText
    : isInternal
      ? stylesHook.changeText
      : stylesHook.receiveText;

  return (
    <View style={[styles.container, badgeStyle]}>
      <Text style={[styles.badgeText, textStyle]}>{badgeLabel}</Text>
    </View>
  );
};

AddressTypeBadge.propTypes = {
  isInternal: PropTypes.bool,
  hasTransactions: PropTypes.bool,
};

export { AddressTypeBadge };
