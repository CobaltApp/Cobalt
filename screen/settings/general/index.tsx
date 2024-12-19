import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, Platform, Pressable, TouchableOpacity, StyleSheet, View } from 'react-native';

import navigationStyle from '../../../components/navigationStyle';
import { BlueLoading, BlueText, BlueSpacing20, BlueListItem, BlueCard } from '../../../BlueComponents';
import { useNavigation, useTheme } from '@react-navigation/native';
import loc from '../../../loc';
import { BlueStorageContext } from '../../../blue_modules/storage-context';
import { isURv1Enabled, clearUseURv1, setUseURv1 } from '../../../blue_modules/ur';

import Notifications from '../../../blue_modules/notifications';
import ToggleSection from '../../../components/section-toggle';
import DropdownSection from '../../../components/section-dropdown';
import { defaultStyles } from '../../../components/defaultStyles';

const GeneralSettings: React.FC = () => {
  const { isAdvancedModeEnabled, setIsAdvancedModeEnabled, wallets, isHandOffUseEnabled, setIsHandOffUseEnabledAsyncStorage } =
    useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancedModeSwitchEnabled, setIsAdvancedModeSwitchEnabled] = useState(false);
  const [isURv1SwitchEnabled, setIsURv1SwitchEnabled] = useState(false);
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
  });

  const onAdvancedModeSwitch = async (value: boolean) => {
    await setIsAdvancedModeEnabled(value);
    setIsAdvancedModeSwitchEnabled(value);
    setIsAdvancedModeEnabled(value);
  };
  const onLegacyURv1Switch = async (value: boolean) => {
    setIsURv1SwitchEnabled(value);
    return value ? setUseURv1() : clearUseURv1();
  };

  useEffect(() => {
    (async () => {
      setIsAdvancedModeSwitchEnabled(await isAdvancedModeEnabled());
      setIsURv1SwitchEnabled(await isURv1Enabled());
      setIsLoading(false);
    })();
  });

  const navigateToPrivacy = () => {
    // @ts-ignore: Fix later
    navigate('SettingsPrivacy');
  };

  const navigateToPlausibleDeniability = () => {
    navigate('PlausibleDeniability');
  };

  return isLoading ? (
    <BlueLoading />
  ) : (
    <View style={styles.root}>
      <View style={defaultStyles.modal}>
        <View style={{gap: 32}}>
          <DropdownSection
            label={'Language'}
            input={'English'}
          />
          <DropdownSection
            label={'Currency'}
            input={'USD'}
          />
          <ToggleSection
            header={loc.settings.general_adv_mode}
            body={loc.settings.general_adv_mode_e}
            input={isAdvancedModeSwitchEnabled}
            onChange={onAdvancedModeSwitch}
          />
        {/* {wallets.length > 1 && (
          <>
            <BlueListItem component={TouchableOpacity} onPress={() => navigate('DefaultView')} title={loc.settings.default_title} chevron />
          </>
        )} */}
        {/* {Notifications.isNotificationsCapable && (
            <BlueListItem
              title={loc.settings.notifications}
              onPress={() => navigate('NotificationSettings')}
              testID="NotificationSettings"
              chevron
            />
          )} */}
        {/* @ts-ignore: Fix later */}
        {/* <BlueListItem title={loc.settings.privacy} onPress={navigateToPrivacy} testID="SettingsPrivacy" chevron /> */}
        {/* <ToggleSection
          header={'Legacy URv1 QR'}
          body={''}
          input={isURv1SwitchEnabled}
          onChange={onLegacyURv1Switch}
        /> */}
        </View>
      </View>
    </View>
  );
};

// @ts-ignore: Fix later
GeneralSettings.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.settings.general }));

export default GeneralSettings;
