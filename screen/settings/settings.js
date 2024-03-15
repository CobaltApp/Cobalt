import React, { useContext } from 'react';
import { ScrollView, StyleSheet, Platform, View, TouchableOpacity, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import navigationStyle from '../../components/navigationStyle';
import { BlueListItem, BlueHeaderDefaultMain, BlueText, BlueCard, SafeBlueArea } from '../../BlueComponents';
import loc from '../../loc';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { Icon } from 'react-native-elements';
import { ScreenHeight } from 'react-native-elements/dist/helpers';

import RadialGradient from 'react-native-radial-gradient';
import { defaultStyles } from '../../components/defaultStyles';

const items = [
  {
    page: 'GeneralSettings',
    iconUrl: require('../../img/icons/settings.png'),
    title: 'General',
  },
  {
    page: 'GeneralSettings',
    iconUrl: require('../../img/icons/card.png'),
    title: 'Payment Methods',
  },
  {
    page: 'SettingsPrivacy',
    iconUrl: require('../../img/icons/lock.png'),
    title: 'Security',
  },
  // {
  //   page: 'NotificationSettings',
  //   iconUrl: require('../../img/icons/alert.png'),
  //   title: 'Notifications',
  // },
  {
    page: 'About',
    iconUrl: require('../../img/icons/help.png'),
    title: 'About Us',
  },
];

const Settings = () => {
  const { navigate } = useNavigation();
  // By simply having it here, it'll re-render the UI if language is changed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { language } = useContext(BlueStorageContext);
  const { colors } = useTheme();

  const navigateHome = () => {
    navigate('Home');
  };

  const styles = StyleSheet.create({
    root: {
      backgroundColor: '#F7931A',
      flex: 1,
      paddingTop: 20,
    },
    modal: {
      display: 'flex',
      flex: 1,
      marginTop: 128,
      paddingHorizontal: 24,
      paddingTop: 32,
      borderRadius: 40,
      gap: 32,
      backgroundColor: colors.element,
    },
    item: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });

  return (
      <View style={styles.root}>
        <View style={{paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24}}>
          <Text style={defaultStyles.h1}>
            Settings
          </Text>
        </View>
        {/* <View
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: 24,
            marginHorizontal: 24,
            marginBottom: 42,
            borderRadius: 25,
            backgroundColor: '#F7931A',
            gap: 16,
          }}
        >
          <Text
            style={{
              width: 150,
              color: '#FFFFFF',
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            Got a question? Let Colby help.
          </Text>
          <TouchableOpacity
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingHorizontal: 24,
              paddingVertical: 8,
              borderRadius: 40,
              backgroundColor: colors.background,
            }}
            onPress={() => navigate('Chat')}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontFamily: 'Poppins',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Try now
            </Text>
          </TouchableOpacity>
          <Image 
                    source={require('../../img/Illustrations/robot-head-3.png')}
                    style={{
                        width: 206,
                        height: 168,
                        position: 'absolute',
                        right: -16,
                        bottom: -18,
                    }}
                />
        </View> */}
        <Image 
          source={require('../../img/Illustrations/ethereum.png')}
          style={{
            position: 'absolute',
            top: 32,
            right: 0,
          }}
        />
        <View style={styles.modal}>
        {items.map((x, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => navigate(x.page)}
          >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <Image 
                source={x.iconUrl}
                style={{
                  width: 32,
                  height: 32,
                }}
              />
              <Text style={defaultStyles.h3}>
                {x.title}
              </Text>
            </View>
            <Icon name="chevron-right" type="feather" size={24} color={colors.foregroundInactive} />
          </TouchableOpacity>
        ))}
          {/* <BlueListItem leftIcon={{ name: 'dollar-sign', size: 24, type: 'feather', color: colors.foreground }} title={loc.settings.currency} onPress={() => navigate('Currency')} testID="Currency" /> */}
          {/* <BlueListItem leftIcon={{ name: 'globe', size: 24, type: 'feather', color: colors.foreground }} title={loc.settings.language} onPress={() => navigate('Language')} testID="Language" /> */}
          {/* <BlueListItem leftIcon={{ name: 'lock', size: 24, type: 'feather', color: colors.foreground }} title='Security' onPress={() => navigate('SettingsPrivacy')} testID="Security" chevron/> */}
          {/* <BlueListItem leftIcon={{ name: 'lock', size: 32, type: 'feather', color: colors.foreground }} title={loc.settings.encrypt_title} onPress={() => navigate('EncryptStorage')} testID="Password" chevron/> */}
          {/* <BlueListItem leftIcon={{ name: 'share-2', size: 32, type: 'feather', color: colors.foreground }} title={loc.settings.network} onPress={() => navigate('NetworkSettings')} testID="NetworkSettings" bottomDivider={true} chevron/> */}
          {/* <BlueListItem leftIcon={{ name: 'lock', size: 24, type: 'feather', color: colors.foreground }} title='Notifications' onPress={() => navigate('NotificationSettings')} testID="Security" chevron/> */}
          {/* <BlueListItem leftIcon={{ name: 'tool', size: 24, type: 'feather', color: colors.foreground }} title={loc.settings.tools} onPress={() => navigate('Tools')} testID="Tools" chevron/> */}
          {/* <BlueListItem leftIcon={{ name: 'help-circle', size: 24, type: 'feather', color: colors.foreground }} title={loc.settings.about} onPress={() => navigate('About')} testID="AboutButton" chevron/> */}
        </View>
      </View>
  );
};

export default Settings;
Settings.navigationOptions = navigationStyle({
  headerShown: false,
  //headerLargeTitle: true,
});
