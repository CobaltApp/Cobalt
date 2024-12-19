import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';

import navigationStyle from '../../../components/navigationStyle';
import loc from '../../../loc';
import DeviceQuickActions from '../../../class/quick-actions';
import { BlueStorageContext } from '../../../blue_modules/storage-context';
import WidgetCommunication from '../../../blue_modules/WidgetCommunication';
import { defaultStyles } from '../../../components/defaultStyles';
import ToggleSection from '../../../components/section-toggle';

const A = require('../../../blue_modules/analytics');

const DeviceSettings = () => {
  const { colors } = useTheme();
  const { isStorageEncrypted, isHandOffUseEnabled, setIsHandOffUseEnabledAsyncStorage } = useContext(BlueStorageContext);
  const sections = Object.freeze({ ALL: 0, CLIPBOARDREAD: 1, QUICKACTION: 2, WIDGETS: 3 });
  const [isLoading, setIsLoading] = useState(sections.ALL);
  const [isDisplayWidgetBalanceAllowed, setIsDisplayWidgetBalanceAllowed] = useState(false);
  const [isQuickActionsEnabled, setIsQuickActionsEnabled] = useState(false);
  const [storageIsEncrypted, setStorageIsEncrypted] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setStorageIsEncrypted(await isStorageEncrypted());
        setIsQuickActionsEnabled(await DeviceQuickActions.getEnabled());
        setIsDisplayWidgetBalanceAllowed(await WidgetCommunication.isBalanceDisplayAllowed());
      } catch (e) {
        console.log(e);
      }
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onQuickActionsValueChange = async value => {
    setIsLoading(sections.QUICKACTION);
    try {
      await DeviceQuickActions.setEnabled(value);
      setIsQuickActionsEnabled(value);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const onWidgetsTotalBalanceValueChange = async value => {
    setIsLoading(sections.WIDGETS);
    try {
      await WidgetCommunication.setBalanceDisplayAllowed(value);
      setIsDisplayWidgetBalanceAllowed(value);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const openApplicationSettings = () => {
    Linking.openSettings();
  };

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modal: {
      flex: 1,
      display: 'flex',
      marginTop: 32,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 400,
      borderRadius: 40,
      backgroundColor: colors.element,
    },
  });

  return (
    <View style={styles.root}>
      <View style={defaultStyles.modal}>
        <View style={{gap: 32}}>
          {!storageIsEncrypted && (
            <ToggleSection
              header={loc.settings.privacy_quickactions}
              body={loc.settings.general_continuity_e}
              input={isQuickActionsEnabled}
              onChange={onQuickActionsValueChange}
            />
          )}
          {Platform.OS === 'ios' && !storageIsEncrypted && (
            <>
              <ToggleSection
                header={loc.settings.general_continuity}
                body={loc.settings.general_continuity_e}
                input={isHandOffUseEnabled}
                onChange={setIsHandOffUseEnabledAsyncStorage}
              />
              <ToggleSection
                header={'Show Total Balance in Widgets'}
                body={loc.settings.general_continuity_e}
                input={isDisplayWidgetBalanceAllowed}
                onChange={onWidgetsTotalBalanceValueChange}
              />
            </>
          )}
      {/* <BlueListItem
            onPress={navigateToPlausibleDeniability}
            title={'Encrypted Storage'}
            chevron
            testID="PlausibleDeniabilityButton"
            Component={TouchableOpacity}
          /> */}
      {/* <BlueListItem title={loc.settings.privacy_system_settings} chevron onPress={openApplicationSettings} testID="PrivacySystemSettings" /> */}
        </View>
      </View>
    </View>
  );
};

DeviceSettings.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.settings.device }));

export default DeviceSettings;
