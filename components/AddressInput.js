import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Text, Icon } from 'react-native-elements';
import { findNodeHandle, Image, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { getSystemName } from 'react-native-device-info';
import { useTheme } from '@react-navigation/native';

import loc from '../loc';
import * as NavigationService from '../NavigationService';
const fs = require('../blue_modules/fs');

const isDesktop = getSystemName() === 'Mac OS X';

const AddressInput = ({
  isLoading = false,
  address = '',
  placeholder = loc.send.details_address,
  onChangeText,
  onBarScanned,
  onBarScannerDismissWithoutData = () => {},
  scanButtonTapped = () => {},
  launchedBy,
  editable = true,
  inputAccessoryViewID,
  onBlur = () => {},
  keyboardType = 'default',
}) => {
  const { colors } = useTheme();
  const scanButtonRef = useRef();

  const stylesHook = StyleSheet.create({
    root: {
      borderColor: colors.element,
      borderBottomColor: colors.element,
      //backgroundColor: colors.element,
    },
    scan: {
      backgroundColor: colors.background,
    },
    scanText: {
      color: colors.background,
    },
  });

  const onBlurEditing = () => {
    onBlur();
    Keyboard.dismiss();
  };

  return (
    <View 
      style={{
        borderColor: colors.element,
        borderBottomColor: colors.element,
        flexDirection: 'row',
        borderWidth: 2,
        minHeight: 48,
        height: 56,
        marginHorizontal: 32,
        alignItems: 'center',
        marginBottom: 8,
        borderRadius: 15,
      }}
    >
      <TextInput
        testID="AddressInput"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.foregroundInactive}
        value={address}
        style={{
          flex: 1,
          marginHorizontal: 20,
          //minHeight: 56,
          color: colors.foreground,
          fontFamily: 'Poppins-Regular',
        }}
        editable={!isLoading && editable}
        multiline={!editable}
        inputAccessoryViewID={inputAccessoryViewID}
        clearButtonMode="while-editing"
        onBlur={onBlurEditing}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={keyboardType}
      />
      {editable ? (
        <TouchableOpacity
          testID="BlueAddressInputScanQrButton"
          disabled={isLoading}
          onPress={async () => {
            await scanButtonTapped();
            Keyboard.dismiss();
            if (isDesktop) {
              fs.showActionSheet({ anchor: findNodeHandle(scanButtonRef.current) }).then(onBarScanned);
            } else {
              NavigationService.navigate('ScanQRCodeRoot', {
                screen: 'ScanQRCode',
                params: {
                  launchedBy,
                  onBarScanned,
                  onBarScannerDismissWithoutData,
                },
              });
            }
          }}
          accessibilityRole="button"
          style={{
            height: 36,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 12,
            paddingVertical: 4,
            paddingHorizontal: 8,
            marginHorizontal: 4,
          }}
          accessibilityLabel={loc.send.details_scan}
          accessibilityHint={loc.send.details_scan_hint}
        >
          <Icon name="camera" type="feather" size={24} color={colors.foregroundInactive} />
          {/* <Text style={[styles.scanText, stylesHook.scanText]} accessible={false}>
            {loc.send.details_scan}
          </Text> */}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    borderWidth: 2,
    minHeight: 48,
    height: 56,
    marginHorizontal: 20,
    alignItems: 'center',
    marginVertical: 8,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    marginHorizontal: 14,
    //minHeight: 56,
    color: '#23262F',
  },
  scan: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 4,
  },
  scanText: {
    marginLeft: 4,
  },
});

AddressInput.propTypes = {
  isLoading: PropTypes.bool,
  onChangeText: PropTypes.func,
  onBarScanned: PropTypes.func.isRequired,
  launchedBy: PropTypes.string,
  address: PropTypes.string,
  placeholder: PropTypes.string,
  editable: PropTypes.bool,
  scanButtonTapped: PropTypes.func,
  inputAccessoryViewID: PropTypes.string,
  onBarScannerDismissWithoutData: PropTypes.func,
  onBlur: PropTypes.func,
  keyboardType: PropTypes.string,
};

export default AddressInput;
