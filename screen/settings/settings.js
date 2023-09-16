import React, { useContext } from 'react';
import { ScrollView, StyleSheet, Platform, View, TouchableOpacity, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import navigationStyle from '../../components/navigationStyle';
import { BlueListItem, BlueHeaderDefaultSub, BlueText, BlueCard, SafeBlueArea } from '../../BlueComponents';
import loc from '../../loc';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { Icon } from 'react-native-elements';

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
    <SafeBlueArea>
      <BlueCard>
      <View
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
            backgroundColor: colors.lightButton,
            borderRadius: 15,
          }}
          onPress={navigateHome}
        >
          <Icon size={24} name="chevron-left" type="feather" color={colors.border} style={{marginTop: 8}}/>
        </TouchableOpacity>
        <BlueText
          style={{
            fontWeight: '400',
            fontSize: 14,
            color: colors.foreground,
            marginTop: 13,
          }}
        >
          Discover
        </BlueText>
      </View>
      <View
          style={{
            flexDirection: 'column',
            alignSelf: 'center',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <Image
            source={require('../../img/avatar-01.png')}
            style={{ width: 75, height: 75, borderRadius: 30, marginBottom: 26, backgroundColor: colors.foregroundInactive}}
          />
          <BlueText
            style={{
              fontWeight: '700',
              fontSize: 16,
              color: colors.foreground,
            }}
          >
            Clifford Hale
          </BlueText>
          <BlueText
            style={{
              fontWeight: '400',
              fontSize: 12,
              color: colors.foreground,
            }}
          >
            ID: 54FSD545C
          </BlueText>
        </View>
        <View>
        <BlueListItem leftIcon={{ name: 'user', size: 22, type: 'feather', color: colors.foreground }} title={loc.settings.general} onPress={() => navigate('GeneralSettings')} testID="GeneralSettings" />
        <BlueListItem leftIcon={{ name: 'dollar-sign', size: 22, type: 'feather', color: colors.foreground }} title={loc.settings.currency} onPress={() => navigate('Currency')} testID="Currency" />
        <BlueListItem leftIcon={{ name: 'globe', size: 22, type: 'feather', color: colors.foreground }} title={loc.settings.language} onPress={() => navigate('Language')} testID="Language" />
        <BlueListItem leftIcon={{ name: 'lock', size: 22, type: 'feather', color: colors.foreground }} title={loc.settings.encrypt_title} onPress={() => navigate('EncryptStorage')} testID="SecurityButton" />
        <BlueListItem leftIcon={{ name: 'share-2', size: 22, type: 'feather', color: colors.foreground }} title={loc.settings.network} onPress={() => navigate('NetworkSettings')} testID="NetworkSettings" />
        <BlueListItem leftIcon={{ name: 'tool', size: 22, type: 'feather', color: colors.foreground }} title={loc.settings.tools} onPress={() => navigate('Tools')} testID="Tools" />
        <BlueListItem leftIcon={{ name: 'info', size: 22, type: 'feather', color: colors.foreground }} title={loc.settings.about} onPress={() => navigate('About')} testID="AboutButton" />
    </View>
    </BlueCard>
    </SafeBlueArea>
  );
};

export default Settings;
Settings.navigationOptions = navigationStyle({
  headerTitle: '',
  headerLargeTitle: true,
});
