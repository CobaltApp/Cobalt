import React, { useContext } from 'react';
import { TouchableOpacity, ScrollView, Linking, Image, View, Text, StyleSheet, useWindowDimensions, Platform, Alert } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { getApplicationName, getVersion, getBundleId, getBuildNumber, getUniqueId, hasGmsSync } from 'react-native-device-info';
import Rate, { AndroidMarket } from 'react-native-rate';
import { BlueButton, BlueCard, BlueListItem, BlueSpacing20, BlueTextCentered } from '../../../BlueComponents';
import navigationStyle from '../../../components/navigationStyle';
import loc, { formatStringAddTwoWhiteSpaces } from '../../../loc';
import Clipboard from '@react-native-clipboard/clipboard';
import alert from '../../../components/Alert';
import { HDSegwitBech32Wallet } from '../../../class';
import { ScreenWidth } from 'react-native-elements/dist/helpers';

const A = require('../../../custom-modules/analytics');
const branch = require('../../../current-branch.json');

const About = () => {
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  // const { isElectrumDisabled } = useContext(BlueStorageContext);
  
  const styles = StyleSheet.create({
    header: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 20,
    },
    card: {
      display: 'flex',
      marginHorizontal: 24,
      marginVertical: 24,
      padding: 20,
      borderRadius: 25,
      backgroundColor: colors.primary,
    },
    cardTitle: {
      color: colors.white,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 18,
      maxWidth: (width - 80) / 2,
    },
    cardButton: {
      display: 'flex',
      alignItems: 'center',
      marginTop: 16,
      paddingVertical: 8,
      borderRadius: 24,
      backgroundColor: colors.dark,
      maxWidth: (width - 80) / 2,
    },
    cardButtonText: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '600',
      fontSize: 14,
    },
    buttonRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    button: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minWidth: (width - 64) / 2,
      padding: 16,
      gap: 16,
      borderRadius: 32,
      backgroundColor: colors.card,
    },
    buttonText: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 14,
    },
  });

  const handleOnReleaseNotesPress = () => {
    navigate('ReleaseNotes');
  };

  // const handleOnSelfTestPress = () => {
  //   if (isElectrumDisabled) {
  //     alert(loc.settings.about_selftest_electrum_disabled);
  //   } else {
  //     navigate('Selftest');
  //   }
  // };

  const handleOnLicensingPress = () => {
    navigate('Licensing');
  };

  const handleOnRatePress = () => {
    const options = {
      AppleAppID: '1376878040',
      GooglePackageName: 'com.cobalt.cobalt',
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: Platform.OS !== 'android',
      openAppStoreIfInAppFails: true,
      fallbackPlatformURL: 'https://cobalt-pay.com',
    };
    Rate.rate(options, success => {
      if (success) {
        console.log('User Rated.');
      }
    });
  };

  return (
    <ScrollView testID="AboutScrollView" contentInsetAdjustmentBehavior="automatic">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Help improve Cobalt, tell us what you think!
        </Text>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={handleOnRatePress}
        >
          <Text style={styles.cardButtonText}>
            Leave a Review
          </Text>
        </TouchableOpacity>
        <Image 
          style={{
            position: 'absolute',
            right: -16,
            top: -16,
            width: 165,
            height: 134,
          }}
          source={require('../../../../assets/Illustrations/robot-head-3.png')}
        />
      </View>
      {/* <BlueCard>
        <View style={styles.center}>
          {((Platform.OS === 'android' && hasGmsSync()) || Platform.OS !== 'android') && (
            <BlueButton onPress={handleOnRatePress} title={loc.settings.about_review} />
          )}
        </View>
      </BlueCard> */}
      <View style={{ marginHorizontal: 24, gap: 16 }}>
        <Text style={styles.header}>
          Follow Us
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {Linking.openURL('https://twitter.com/cobaltofficial_')}}
          >
            <Icon name="twitter" type="font-awesome-5" size={24} color={colors.foreground} />
            <Text style={styles.buttonText}>
              Twitter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {Linking.openURL('https://t.me/cobaltapp')}}
          >
            <Icon name="telegram" type="font-awesome-5" size={24} color={colors.foreground} />
            <Text style={styles.buttonText}>
              Telegram
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {Linking.openURL('https://discord.gg/7ahsy3E9yB')}}
          >
            <Icon name="discord" type="font-awesome-5" size={24} color={colors.foreground} />
            <Text style={styles.buttonText}>
              Discord
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {Linking.openURL('https://github.com/CobaltApp/Cobalt')}}
          >
            <Icon name="github" type="font-awesome-5" size={24} color={colors.foreground} />
            <Text style={styles.buttonText}>
              Github
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* <BlueCard>
        <View style={styles.buildWith}>

          <BlueTextCentered>{loc.settings.about_awesome} 👍</BlueTextCentered>
          <BlueTextCentered>React Native</BlueTextCentered>
          <BlueTextCentered>bitcoinjs-lib</BlueTextCentered>
          <BlueTextCentered>Nodejs</BlueTextCentered>
          <BlueTextCentered>Electrum server</BlueTextCentered>

          <TouchableOpacity accessibilityRole="button" onPress={handleOnGithubPress} style={styles.buttonLink}>
            <Icon size={22} name="github" type="feather" color={colors.foreground} />
            <Text style={styles.textLink}>{formatStringAddTwoWhiteSpaces(loc.settings.about_sm_github)}</Text>
          </TouchableOpacity>
        </View>
      </BlueCard> */}
      {/* <BlueListItem
        leftIcon={{
          name: 'book',
          type: 'feather',
          color: colors.foreground,
        }}
        chevron
        onPress={handleOnReleaseNotesPress}
        title={loc.settings.about_release_notes}
      /> */}
      {/* <BlueListItem
        leftIcon={{
          name: 'book-open',
          type: 'feather',
          color: colors.foreground,
        }}
        //chevron
        onPress={handleOnLicensingPress}
        title={loc.settings.about_license}
      /> */}
      {/* <BlueListItem
        leftIcon={{
          name: 'flask',
          type: 'font-awesome',
          color: '#FC0D44',
        }}
        chevron
        onPress={handleOnSelfTestPress}
        testID="RunSelfTestButton"
        title={loc.settings.about_selftest}
      /> */}
      {/* <BlueListItem
        leftIcon={{
          name: 'flask',
          type: 'font-awesome',
          color: '#FC0D44',
        }}
        chevron
        onPress={async () => {
          const secret = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
          const w = new HDSegwitBech32Wallet();
          w.setSecret(secret);

          const start = Date.now();
          let num;
          for (num = 0; num < 1000; num++) {
            w._getExternalAddressByIndex(num);
            if (Date.now() - start > 10 * 1000) {
              break;
            }
          }

          Alert.alert(loc.formatString(loc.settings.performance_score, { num }));
        }}
        title={loc.settings.run_performance_test}
      /> */}
      {/* <BlueTextCentered>
        {getApplicationName()} ver {getVersion()} (build {getBuildNumber() + ' ' + branch})
      </BlueTextCentered> */}
      {/* <BlueTextCentered>{new Date(getBuildNumber() * 1000).toGMTString()}</BlueTextCentered> */}
      {/* <BlueTextCentered>{getBundleId()}</BlueTextCentered> */}
      {/* <BlueTextCentered>
        w, h = {width}, {height}
      </BlueTextCentered> */}
      {/* <BlueTextCentered>Unique ID: {getUniqueId()}</BlueTextCentered>
      <View style={styles.copyToClipboard}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            const stringToCopy = 'userId:' + getUniqueId();
            A.logError('copied unique id');
            Clipboard.setString(stringToCopy);
          }}
        >
          <Text style={styles.copyToClipboardText}>{loc.transactions.details_copy}</Text>
        </TouchableOpacity>
      </View> */}
    </ScrollView>
  );
};

About.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.settings.about }));
export default About;
