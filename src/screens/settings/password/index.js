import React, { useEffect, useState, useCallback, useContext } from 'react';
import { ScrollView, Alert, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, View, TextInput } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Text } from 'react-native-elements';

import navigationStyle from '../../../components/navigationStyle';
import { BlueLoading, SafeBlueArea, BlueSpacing20, BlueCard, BlueListItem, BlueHeaderDefaultSub, BlueText, BlueFormLabel, BlueFormInput } from '../../../BlueComponents';
import Biometric from '../../../class/biometrics';
import loc from '../../../loc';
import { BlueStorageContext } from '../../../custom-modules/storage-context';
import alert from '../../../components/Alert';
import { defaultStyles } from '../../../components/defaultStyles';
import ToggleSection from '../../../components/section-toggle';
import InputSection from '../../../components/section-input';
const prompt = require('../../../helpers/prompt');

const PasswordSettings = () => {
  const { isStorageEncrypted, encryptStorage, decryptStorage, saveToDisk } = useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [biometrics, setBiometrics] = useState({ isDeviceBiometricCapable: false, isBiometricsEnabled: false, biometricsType: '' });
  const [storageIsEncryptedSwitchEnabled, setStorageIsEncryptedSwitchEnabled] = useState(false);
  const { navigate, popToTop } = useNavigation();
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

  const initialState = useCallback(async () => {
    const isBiometricsEnabled = await Biometric.isBiometricUseEnabled();
    const isDeviceBiometricCapable = await Biometric.isDeviceBiometricCapable();
    const biometricsType = (await Biometric.biometricType()) || loc.settings.biometrics;
    const isStorageEncryptedSwitchEnabled = await isStorageEncrypted();
    setStorageIsEncryptedSwitchEnabled(isStorageEncryptedSwitchEnabled);
    setBiometrics({ isBiometricsEnabled, isDeviceBiometricCapable, biometricsType });
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    initialState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDecryptStorage = async () => {
    const password = await prompt(loc.settings.password, loc._.storage_is_encrypted).catch(() => {
      setIsLoading(false);
    });
    try {
      await decryptStorage(password);
      await saveToDisk();
      popToTop();
    } catch (e) {
      if (password) {
        alert(loc._.bad_password);
        ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
      }

      setIsLoading(false);
      setStorageIsEncryptedSwitchEnabled(await isStorageEncrypted());
    }
  };

  const onEncryptStorageSwitch = async value => {
    setIsLoading(true);
    if (value === true) {
      let p1 = await prompt(loc.settings.password, loc.settings.password_explain).catch(() => {
        setIsLoading(false);
        p1 = undefined;
      });
      if (!p1) {
        setIsLoading(false);
        return;
      }
      const p2 = await prompt(loc.settings.password, loc.settings.retype_password).catch(() => {
        setIsLoading(false);
      });
      if (p1 === p2) {
        console.log(p1);
        await encryptStorage(p1);
        setIsLoading(false);
        setStorageIsEncryptedSwitchEnabled(await isStorageEncrypted());
        saveToDisk();
      } else {
        setIsLoading(false);
        alert(loc.settings.passwords_do_not_match);
      }
    } else {
      Alert.alert(
        loc.settings.encrypt_decrypt,
        loc.settings.encrypt_decrypt_q,
        [
          {
            text: loc._.cancel,
            style: 'cancel',
            onPress: () => setIsLoading(false),
          },
          {
            text: loc._.ok,
            style: 'destructive',
            onPress: handleDecryptStorage,
          },
        ],
        { cancelable: false },
      );
    }
  };

  const onUseBiometricSwitch = async value => {
    const isBiometricsEnabled = {
      isDeviceBiometricCapable: biometrics.isDeviceBiometricCapable,
      isBiometricsEnabled: biometrics.isBiometricsEnabled,
      biometricsType: biometrics.biometricsType,
    };
    if (await Biometric.unlockWithBiometrics()) {
      isBiometricsEnabled.isBiometricsEnabled = value;
      await Biometric.setBiometricUseEnabled(value);
      setBiometrics(isBiometricsEnabled);
    }
  };

  const navigateToPlausibleDeniability = () => {
    navigate('PlausibleDeniability');
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView contentContainerStyle={defaultStyles.modal}>
        {/* {biometrics.isDeviceBiometricCapable && (
          <>
            <BlueHeaderDefaultSub leftText={loc.settings.biometrics} rightComponent={null} />
            <BlueListItem
              title={loc.formatString(loc.settings.encrypt_use, { type: biometrics.biometricsType })}
              Component={TouchableWithoutFeedback}
              switch={{ value: biometrics.isBiometricsEnabled, onValueChange: onUseBiometricSwitch }}
            />
            <BlueCard>
              <BlueText>{loc.formatString(loc.settings.encrypt_use_expl, { type: biometrics.biometricsType })}</BlueText>
            </BlueCard>
            <BlueSpacing20 />
          </>
        )} */}
        {/* <BlueHeaderDefaultSub leftText={loc.settings.encrypt_tstorage} rightComponent={null} /> */}
        <View style={{gap: 24}}>
          <ToggleSection
            header={loc.settings.encrypt_enc_and_pass}
            input={storageIsEncryptedSwitchEnabled}
            onChange={onEncryptStorageSwitch}
          />
          <InputSection
            label={'Current Password'}
            placeholderText={'Current Password'}
          />
          <InputSection
            label={'New Password'}
            placeholderText={'New Password'}
          />
          <InputSection
            label={'Confirm New Password'}
            placeholderText={'Confirm New Password'}
          />
        </View>
        {/* {storageIsEncryptedSwitchEnabled && (
          <BlueListItem
            onPress={navigateToPlausibleDeniability}
            title={loc.settings.plausible_deniability}
            chevron
            testID="PlausibleDeniabilityButton"
            Component={TouchableOpacity}
          />
        )} */}
      </ScrollView>
    </View>
  );
};

export default PasswordSettings;
PasswordSettings.navigationOptions = navigationStyle({}, opts => ({ ...opts, headerTitle: loc.settings.encrypt_title }));
