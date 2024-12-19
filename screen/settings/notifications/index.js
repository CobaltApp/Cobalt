import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, Switch, Linking, View, Text, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';

import navigationStyle from '../../../components/navigationStyle';
import { BlueButton, BlueCard, BlueCopyToClipboardButton, BlueListItem, BlueLoading, BlueSpacing20, BlueText } from '../../../BlueComponents';
import loc from '../../../loc';
import Notifications from '../../../blue_modules/notifications';
import alert from '../../../components/Alert';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';
import { defaultStyles } from '../../../components/defaultStyles';
import { BlueStorageContext } from '../../../blue_modules/storage-context';
import ToggleSection from '../../../components/section-toggle';

const NotificationSettings = () => {
  const { isAdvancedModeEnabled } = useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isShowTokenInfo, setShowTokenInfo] = useState(0);
  const [tokenInfo, setTokenInfo] = useState('<empty>');
  const [URI, setURI] = useState();

  const { colors } = useTheme();

  const onNotificationsSwitch = async value => {
    setNotificationsEnabled(value); // so the slider is not 'jumpy'
    if (value) {
      // user is ENABLING notifications
      await Notifications.cleanUserOptOutFlag();
      if (await Notifications.getPushToken()) {
        // we already have a token, so we just need to reenable ALL level on groundcontrol:
        await Notifications.setLevels(true);
      } else {
        // ok, we dont have a token. we need to try to obtain permissions, configure callbacks and save token locally:
        await Notifications.tryToObtainPermissions();
      }
    } else {
      // user is DISABLING notifications
      await Notifications.setLevels(false);
    }

    setNotificationsEnabled(await Notifications.isNotificationsEnabled());
  };

  useEffect(() => {
    (async () => {
      setNotificationsEnabled(await Notifications.isNotificationsEnabled());
      setURI(await Notifications.getSavedUri());
      setTokenInfo(
        'token: ' +
          JSON.stringify(await Notifications.getPushToken()) +
          ' permissions: ' +
          JSON.stringify(await Notifications.checkPermissions()) +
          ' stored notifications: ' +
          JSON.stringify(await Notifications.getStoredNotifications()),
      );
      setIsLoading(false);
    })();
  }, []);

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modal: {
      display: 'flex',
      flex: 1,
      alignItems: 'stretch',
      marginTop: 48,
      paddingHorizontal: 24,
      paddingBottom: 48,
      paddingTop: 32,
      gap: 24,
      borderRadius: 40,
      backgroundColor: colors.element
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowText: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 16,
    },
    uri: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      height: 56,
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 16,
      borderRadius: 25,
      marginBottom: 120,
    },
    uriText: {
      flex: 1,
      color: colors.foregroundInactive,
      fontFamily: 'Poppins',
      fontWeight: '400',
      fontSize: 14,
    },
  });

  const save = useCallback(async () => {
    setIsLoading(true);
    try {
      if (URI) {
        // validating only if its not empty. empty means use default
        if (await Notifications.isGroundControlUriValid(URI)) {
          await Notifications.saveUri(URI);
          alert(loc.settings.saved);
        } else {
          alert(loc.settings.not_a_valid_uri);
        }
      } else {
        await Notifications.saveUri('');
        alert(loc.settings.saved);
      }
    } catch (error) {
      console.warn(error);
    }
    setIsLoading(false);
  }, [URI]);

  return isLoading ? (
    <BlueLoading />
  ) : (
    <View style={styles.root}>
      <View style={defaultStyles.modal}>
        <ToggleSection
          header={'Push Notifications'}
          body={loc.settings.general_adv_mode_e}
          input={isNotificationsEnabled}
          onChange={onNotificationsSwitch}
        />
        {isNotificationsEnabled && isAdvancedModeEnabled && (
          <View style={{ display: 'flex', flex: 1, gap: 24 }}>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: 14,
              }}
            >
            GroundControl is a FREE, open-source push notification server for Bitcoin wallets. You can install your own GroundControl server and put its URL here to not rely on Cobalt’s infrastructure.
            </Text>
            <View style={styles.uri}>
              <TextInput
                placeholder={Notifications.getDefaultUri()}
                value={URI}
                onChangeText={setURI}
                numberOfLines={1}
                style={styles.uriText}
                placeholderTextColor="#A6A6A6"
                editable={!isLoading}
                textContentType="URL"
                autoCapitalize="none"
                underlineColorAndroid="transparent"
              />
            </View>
            <TouchableOpacity
            style={{
              display: 'flex',
              position: 'absolute',
              width: ScreenWidth - 48,
              height: 56,
              left: 0,
              bottom: 0,
              alignSelf: 'stretch',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 40,
              backgroundColor: colors.primary,
            }}
            onPress={save}
          >
            <Text
              style={{
                color: colors.white,
                fontFamily: 'Poppins',
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              Save
            </Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={{
              display: 'flex',
              position: 'absolute',
              width: ScreenWidth - 48,
              height: 56,
              left: 0,
              bottom: 96,
              alignSelf: 'stretch',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 40,
              backgroundColor: '#F7931A',
            }}
            onPress={() => Linking.openURL('https://github.com/BlueWallet/GroundControl')}
          >
            <Text
              style={{
                color: colors.white,
                fontFamily: 'Poppins',
                fontWeight: '600',
                fontSize: 16,
              }}
            >
              Visit GroundControl
            </Text>
          </TouchableOpacity>
          </View>
        )}

      {/* <BlueCard>
        <BlueText>{loc.settings.groundcontrol_explanation}</BlueText>
      </BlueCard> */}

      {/* <Button
        icon={{
          name: 'github',
          type: 'font-awesome',
          color: colors.foreground,
        }}
        onPress={() => Linking.openURL('https://github.com/BlueWallet/GroundControl')}
        titleStyle={{ color: colors.foreground }}
        title="github.com/BlueWallet/GroundControl"
        color={colors.foreground}
        buttonStyle={styles.buttonStyle}
      />

      <BlueCard>

        <BlueText style={styles.centered} onPress={() => setShowTokenInfo(isShowTokenInfo + 1)}>
          ♪ Ground Control to Major Tom ♪
        </BlueText>
        <BlueText style={styles.centered} onPress={() => setShowTokenInfo(isShowTokenInfo + 1)}>
          ♪ Commencing countdown, engines on ♪
        </BlueText>

        {isShowTokenInfo >= 9 && (
          <View>
            <BlueCopyToClipboardButton stringToCopy={tokenInfo} displayText={tokenInfo} />
          </View>
        )}
         */}
      {/* </BlueCard> */}
      </View>
    </View>
  );
};

NotificationSettings.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.settings.notifications }));

export default NotificationSettings;
