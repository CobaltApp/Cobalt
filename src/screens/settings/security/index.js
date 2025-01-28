import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View, TouchableWithoutFeedback, TouchableOpacity, StyleSheet, Linking, Platform, Pressable } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

import navigationStyle from '../../../components/navigationStyle';
import loc from '../../../loc';
import DeviceQuickActions from '../../../class/quick-actions';
import BlueClipboard from '../../../custom-modules/clipboard';
import { BlueStorageContext } from '../../../custom-modules/storage-context';
import WidgetCommunication from '../../../custom-modules/WidgetCommunication';
import { defaultStyles } from '../../../components/defaultStyles';
import ToggleSection from '../../../components/section-toggle';

const A = require('../../../custom-modules/analytics');

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
    <View style={styles.root}>
      <View style={defaultStyles.modal}>
        <View style={{gap: 32}}>
          <ToggleSection
            header={loc.settings.privacy_read_clipboard}
            body={loc.settings.privacy_clipboard_explanation}
            input={isReadClipboardAllowed}
            onChange={onValueChange}
          />
          <ToggleSection
            header={loc.settings.privacy_do_not_track}
            body={loc.settings.privacy_do_not_track_explanation}
            input={doNotTrackSwitchValue}
            onChange={onDoNotTrackValueChange}
          />
          {!storageIsEncrypted && (
            <ToggleSection
              header={loc.settings.privacy_quickactions}
              body={loc.settings.privacy_quickactions_explanation}
              input={isQuickActionsEnabled}
              onChange={onQuickActionsValueChange}
            />
          )}
          {/* <BlueListItem
            onPress={navigateToPlausibleDeniability}
            title={'Encrypted Storage'}
            chevron
            testID="PlausibleDeniabilityButton"
            Component={TouchableOpacity}
          /> */}
        </View>
      </View>
    </View>
  );
};

SettingsPrivacy.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.settings.privacy }));

export default SettingsPrivacy;
