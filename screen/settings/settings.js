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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const Settings = () => {
  const { navigate } = useNavigation();
  // By simply having it here, it'll re-render the UI if language is changed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { language } = useContext(BlueStorageContext);
  const { colors } = useTheme();

  const navigateHome = () => {
    navigate('Home');
  };

  return (
    // <ScrollView>
      <View
        style={{
          backgroundColor: '#F3F5F6',
          flex: 1,
        }}
      >
      {/* <View
        style={{
          flexDirection: 'row',
          marginBottom: 44,
        }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={loc._.more}
          testID="HomeButton"
          style={{
            marginRight: 10,
            height: 40,
            width: 40,
            backgroundColor: colors.element,
            borderRadius: 15,
          }}
          onPress={navigateHome}
        >
          <Icon size={24} name="chevron-left" type="feather" color={colors.element} style={{marginTop: 8}}/>
        </TouchableOpacity>
        <BlueText
          style={{
            fontWeight: '400',
            fontSize: 14,
            color: colors.foreground,
            marginTop: 13,
          }}
        >
          Settings
        </BlueText>
      </View> */}
        <View style={{paddingTop: 32, paddingHorizontal: 25}}>
          <BlueHeaderDefaultMain leftText='Account'/>
        </View>
        <View
          style={{
            flexDirection: 'column',
            //alignSelf: 'center',
            //alignItems: 'center',
            marginBottom: 36,
            marginHorizontal: 25,
            padding: 25,
            backgroundColor: '#1A7EF7',
            borderRadius: 25,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              //alignSelf: 'center',
              alignItems: 'center',
              //marginBottom: 40,
              //marginLeft: 4,
            }}
          >
            {/* <Image
              source={require('../../img/profile.png')}
              style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.secondary}}
            /> */}
            <View
              style={{
                // marginLeft: 16,
              }}
            >
              <BlueText
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 20,
                  color: colors.background,
                  marginBottom: 10,
                }}
              >
                John Doe
              </BlueText>
              <BlueText
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 14,
                  color: colors.background,
                }}
              >
                johndoe89@cobalt.com
              </BlueText>
            </View>
          </View>
          {/* <View
            style={{
              marginTop: 8,
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          > */}
            {/* <View
              style={{
                marginTop: 4,
                marginRight: 4,
                backgroundColor: colors.primary,
                borderColor: colors.background,
                borderWidth: 2,
                borderRadius: 12,
                maxWidth: 192,
                paddingVertical: 4,
                paddingHorizontal: 8,
              }}
            >
              <Text style={{
                color: colors.background,
                fontWeight: 700,
              }}>
                🧭 Explorer
              </Text>
            </View>
            <View
              style={{
                marginTop: 4,
                marginRight: 4,
                backgroundColor: colors.background,
                borderColor: colors.negative,
                borderWidth: 2,
                borderRadius: 12,
                maxWidth: 192,
                paddingVertical: 4,
                paddingHorizontal: 8,
              }}
            >
              <Text style={{
                color: colors.negative,
                fontWeight: 700,
              }}>
                🦐 Shrimp
              </Text>
            </View>
            <View
              style={{
                marginTop: 4,
                marginRight: 4,
                backgroundColor: colors.background,
                borderColor: colors.tertiary,
                borderWidth: 2,
                borderRadius: 12,
                maxWidth: 192,
                paddingVertical: 4,
                paddingHorizontal: 8,
              }}
            >
              <Text style={{
                color: colors.tertiary,
                fontWeight: 700,
              }}>
                📊 Market Watcher
              </Text>
            </View>
          </View> */}
        </View>
        <View 
          style={{
            backgroundColor: '#F7F7FA',
            borderRadius: 25,
            paddingVertical: 12,
            paddingHorizontal: 25,
            height: 560,
          }}
        >
          <BlueListItem leftIcon={{ name: 'settings', size: 32, type: 'feather', color: colors.foreground }} title={loc.settings.general} onPress={() => navigate('GeneralSettings')} testID="GeneralSettings" chevron/>
          {/* <BlueListItem leftIcon={{ name: 'dollar-sign', size: 24, type: 'feather', color: colors.foreground }} title={loc.settings.currency} onPress={() => navigate('Currency')} testID="Currency" />
          <BlueListItem leftIcon={{ name: 'globe', size: 24, type: 'feather', color: colors.foreground }} title={loc.settings.language} onPress={() => navigate('Language')} testID="Language" /> */}
          <BlueListItem leftIcon={{ name: 'shield', size: 32, type: 'feather', color: colors.foreground }} title='Security' onPress={() => navigate('SettingsPrivacy')} testID="Security" chevron/>
          <BlueListItem leftIcon={{ name: 'lock', size: 32, type: 'feather', color: colors.foreground }} title={loc.settings.encrypt_title} onPress={() => navigate('EncryptStorage')} testID="Password" chevron/>
          {/* <BlueListItem leftIcon={{ name: 'share-2', size: 32, type: 'feather', color: colors.foreground }} title={loc.settings.network} onPress={() => navigate('NetworkSettings')} testID="NetworkSettings" bottomDivider={true} chevron/> */}
          <BlueListItem leftIcon={{ name: 'tool', size: 32, type: 'feather', color: colors.foreground }} title={loc.settings.tools} onPress={() => navigate('Tools')} testID="Tools" chevron/>
          <BlueListItem leftIcon={{ name: 'help-circle', size: 32, type: 'feather', color: colors.foreground }} title={loc.settings.about} onPress={() => navigate('About')} testID="AboutButton" chevron/>
        </View>
      </View>
      
    // </ScrollView>
  );
};

export default Settings;
Settings.navigationOptions = navigationStyle({
  headerShown: false,
  //headerLargeTitle: true,
});
