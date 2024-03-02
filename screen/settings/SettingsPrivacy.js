import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View, TouchableWithoutFeedback, TouchableOpacity, StyleSheet, Linking, Platform, Pressable } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

import navigationStyle from '../../components/navigationStyle';
import { BlueText, BlueSpacing20, BlueListItem, BlueCard, BlueHeaderDefaultSub } from '../../BlueComponents';
import loc from '../../loc';
import DeviceQuickActions from '../../class/quick-actions';
import BlueClipboard from '../../blue_modules/clipboard';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import WidgetCommunication from '../../blue_modules/WidgetCommunication';

const A = require('../../blue_modules/analytics');

const SettingsPrivacy = () => {
  const { colors } = useTheme();
  const { navigate } = useNavigation();
  const { isStorageEncrypted, setDoNotTrack, isDoNotTrackEnabled, setIsPrivacyBlurEnabled } = useContext(BlueStorageContext);
  const sections = Object.freeze({ ALL: 0, CLIPBOARDREAD: 1, QUICKACTION: 2, WIDGETS: 3 });
  const [isLoading, setIsLoading] = useState(sections.ALL);
  const [isReadClipboardAllowed, setIsReadClipboardAllowed] = useState(false);
  const [doNotTrackSwitchValue, setDoNotTrackSwitchValue] = useState(false);

  const [isDisplayWidgetBalanceAllowed, setIsDisplayWidgetBalanceAllowed] = useState(false);
  const [isQuickActionsEnabled, setIsQuickActionsEnabled] = useState(false);
  const [storageIsEncrypted, setStorageIsEncrypted] = useState(true);
  const [isPrivacyBlurEnabledTapped, setIsPrivacyBlurEnabledTapped] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setDoNotTrackSwitchValue(await isDoNotTrackEnabled());
        setIsReadClipboardAllowed(await BlueClipboard().isReadClipboardAllowed());
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

  const onValueChange = async value => {
    setIsLoading(sections.CLIPBOARDREAD);
    try {
      await BlueClipboard().setReadClipboardAllowed(value);
      setIsReadClipboardAllowed(value);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const onDoNotTrackValueChange = async value => {
    setIsLoading(sections.ALL);
    try {
      setDoNotTrackSwitchValue(value);
      A.setOptOut(value);
      await setDoNotTrack(value);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

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

  const navigateToPlausibleDeniability = () => {
    navigate('PlausibleDeniability');
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

  const onDisablePrivacyTapped = () => {
    setIsPrivacyBlurEnabled(!(isPrivacyBlurEnabledTapped >= 10));
    setIsPrivacyBlurEnabledTapped(prev => prev + 1);
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
    <ScrollView style={styles.root}>
      <View
        style={styles.modal}
      >
      <BlueListItem
        hideChevron
        title={loc.settings.privacy_read_clipboard}
        Component={TouchableWithoutFeedback}
        switch={{ onValueChange, value: isReadClipboardAllowed, disabled: isLoading === sections.ALL, testID: 'ClipboardSwitch' }}
      />
      <BlueListItem
        hideChevron
        title={loc.settings.privacy_do_not_track}
        Component={TouchableWithoutFeedback}
        switch={{ onValueChange: onDoNotTrackValueChange, value: doNotTrackSwitchValue, disabled: isLoading === sections.ALL }}
      />
      {!storageIsEncrypted && (
        <>
          <BlueListItem
            hideChevron
            title={loc.settings.privacy_quickactions}
            Component={TouchableWithoutFeedback}
            switch={{
              onValueChange: onQuickActionsValueChange,
              value: isQuickActionsEnabled,
              disabled: isLoading === sections.ALL,
              testID: 'QuickActionsSwitch',
            }}
          />
        </>
      )}
      {Platform.OS === 'ios' && !storageIsEncrypted && (
        <>
          <BlueListItem
            hideChevron
            title={'Show Total Balance in Widgets'}
            Component={TouchableWithoutFeedback}
            switch={{
              onValueChange: onWidgetsTotalBalanceValueChange,
              value: isDisplayWidgetBalanceAllowed,
              disabled: isLoading === sections.ALL,
            }}
          />
        </>
      )}
      <BlueListItem
            onPress={navigateToPlausibleDeniability}
            title={'Encrypted Storage'}
            chevron
            testID="PlausibleDeniabilityButton"
            Component={TouchableOpacity}
          />
      <BlueListItem title={loc.settings.privacy_system_settings} chevron onPress={openApplicationSettings} testID="PrivacySystemSettings" />
      </View>
    </ScrollView>
  );
};

SettingsPrivacy.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.settings.privacy }));

export default SettingsPrivacy;
