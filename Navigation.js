import React, { useCallback, useMemo, useRef } from 'react';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Keyboard, Platform, I18nManager, Text, View, Image, useWindowDimensions } from 'react-native';
import { useTheme, useNavigation, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator, useBottomTabBarHeight, BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { Icon, Button } from 'react-native-elements';
// import { FContainer, FButton } from './src/components/FloatButtons';

import Settings from './src/screens/settings';
import About from './src/screens/settings/about';
// import ReleaseNotes from './src/screens/settings/releasenotes';
// import Licensing from './src/screens/settings/licensing';
// import Selftest from './src/screens/selftest';
// import Language from './src/screens/settings/language';
// import Currency from './src/screens/settings/currency';
import PasswordSettings from './src/screens/settings/password';
// import PlausibleDeniability from './src/screens/plausibledeniability';
// import LightningSettings from './src/screens/settings/lightningSettings';
// import ElectrumSettings from './src/screens/settings/electrumSettings';
// import TorSettings from './src/screens/settings/torSettings';
// import Tools from './src/screens/settings/tools';
import GeneralSettings from './src/screens/settings/general';
import NetworkSettings from './src/screens/settings/network';
import NotificationSettings from './src/screens/settings/notifications';
// import DefaultView from './src/screens/settings/defaultView';
import DeviceSettings from './src/screens/settings/device';

import Home from './src/screens/home';
import WalletTransactions from './src/screens/home/wallet';
import AddWallet from './src/screens/home/add';
// import WalletsAddMultisig from './src/screens/wallets/addMultisig';
// import WalletsAddMultisigStep2 from './src/screens/wallets/addMultisigStep2';
// import WalletsAddMultisigHelp from './src/screens/wallets/addMultisigHelp';
import Backup from './src/screens/home/add/seed';
// import PleaseBackupLNDHub from './src/screens/wallets/pleaseBackupLNDHub';
// import PleaseBackupLdk from './src/screens/wallets/pleaseBackupLdk';
import ImportWallet from './src/screens/wallets/import';
// import ImportWalletDiscovery from './src/screens/wallets/importDiscovery';
// import ImportCustomDerivationPath from './src/screens/wallets/importCustomDerivationPath';
// import ImportSpeed from './src/screens/wallets/importSpeed';
import WalletSettings from './src/screens/home/wallet/settings';
import WalletExport from './src/screens/wallets/export';
// import ExportMultisigCoordinationSetup from './src/screens/wallets/exportMultisigCoordinationSetup';
// import ViewEditMultisigCosigners from './src/screens/wallets/viewEditMultisigCosigners';
import WalletXpub from './src/screens/wallets/xpub';
import SignVerify from './src/screens/wallets/signVerify';
import WalletAddresses from './src/screens/wallets/addresses';
import ReorderWallets from './src/screens/wallets/reorderWallets';
import SelectWallet from './src/screens/wallets/selectWallet';
// import ProvideEntropy from './src/screens/wallets/provideEntropy';

import TransactionDetails from './src/screens/transactions/details';
import TransactionStatus from './src/screens/transactions/transactionStatus';
// import CPFP from './src/screens/transactions/CPFP';
// import RBFBumpFee from './src/screens/transactions/RBFBumpFee';
// import RBFCancel from './src/screens/transactions/RBFCancel';

import ReceiveDetails from './src/screens/home/wallet/receive';

import SendDetails from './src/screens/send';
import ScanQRCode from './src/screens/send/ScanQRCode';
import FeeSelect from './src/screens/send/fee';
// import SendCreate from './src/screens/send/create';
// import Confirm from './src/screens/send/confirm';
// import PsbtWithHardwareWallet from './src/screens/send/psbtWithHardwareWallet';
// import PsbtMultisig from './src/screens/send/psbtMultisig';
// import PsbtMultisigQRCode from './src/screens/send/psbtMultisigQRCode';
// import Success from './src/screens/send/success';
// import Broadcast from './src/screens/send/broadcast';
// import IsItMyAddress from './src/screens/send/isItMyAddress';
// import CoinControl from './src/screens/send/coinControl';

// import ScanLndInvoice from './src/screens/lnd/scanLndInvoice';
import LappBrowser from './src/screens/lnd/browser';
// import LNDCreateInvoice from './src/screens/lnd/lndCreateInvoice';
// import LNDViewInvoice from './src/screens/lnd/lndViewInvoice';
import LdkOpenChannel from './src/screens/lnd/ldkOpenChannel';
import LdkInfo from './src/screens/lnd/ldkInfo';
// import LNDViewAdditionalInvoiceInformation from './src/screens/lnd/lndViewAdditionalInvoiceInformation';
// import LnurlPay from './src/screens/lnd/lnurlPay';
// import LnurlPaySuccess from './src/screens/lnd/lnurlPaySuccess';
// import LnurlAuth from './src/screens/lnd/lnurlAuth';
import BlankPage from './src/screens/blank';
import Entry from './src/screens/entry';
import Unlock from './src/screens/unlock';
import Onboard from './src/screens/onboard';
// import DrawerList from './src/screens/wallets/drawerList';
import { isDesktop, isTablet, isHandset } from './src/custom-modules/environment';
import SettingsPrivacy from './src/screens/settings/security';
// import LNDViewAdditionalInvoicePreImage from './src/screens/lnd/lndViewAdditionalInvoicePreImage';
import LdkViewLogs from './src/screens/wallets/ldkViewLogs';
// import PaymentCode from './src/screens/wallets/paymentCode';
// import PaymentCodesList from './src/screens/wallets/paymentCodesList';
import loc from './src/loc';

import DeeplinkSchemaMatch from './src/class/deeplink-schema-match';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

//import Notifications from './src/screens/Notifications';
//import Chat from './src/screens/Chat';
import Card from './src/screens/card';
import CardFAQ from './src/screens/card/faq';

import Marketplace from './src/screens/marketplace';

//import Discover from './src/screens/Discover';
import Chart from './src/components/chart';
//import { IconConfigKeys } from 'react-native-ios-context-menu';

import * as NavigationService from './NavigationService';
import { TouchableOpacity } from 'react-native-gesture-handler';

//import RoundButton from './src/components/button-round';

import { defaultStyles } from './src/components/defaultStyles';
//import { InactivityProvider } from './context/inactivity';

const WalletsStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const scanqrHelper = require('./src/helpers/scan-qr');
//const scanButtonRef = useRef();

function TabNavigator() {
  const { theme, colors, scanImage, barStyle } = useTheme();
  //const { navigation, route } = props;
  const { navigate } = useNavigation();
  const routeName = useRoute().name;
  const walletActionButtonsRef = useRef();
  const { width } = useWindowDimensions();

  const scanButtonRef = useRef();

  const onScanButtonPressed = () => {
    scanqrHelper(navigate, routeName, false).then(onBarScanned);
  };

  const onBarScanned = value => {
    if (!value) return;
    DeeplinkSchemaMatch.navigationRouteFor({ url: value }, completionValue => {
      ReactNativeHapticFeedback.trigger('impactLight', { ignoreAndroidSystemSettings: false });
      navigate(...completionValue);
    });
  };

  return (
    <Tab.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: 'left',
        headerStyle: {
          borderBottomWidth: 0,
          shadowOffset: { height: 0, width: 0 },
          backgroundColor: colors.background,
        },
        headerTitleStyle: [defaultStyles.h2, {marginLeft: 12}],
        tabBarShowLabel: false,
        tabBarStyle: { 
          backgroundColor: colors.card, 
          borderTopWidth: 0,
          minHeight: 100,
          paddingTop: 16,
          paddingBottom: 36,
          paddingHorizontal: 12,
          justifyContent: 'space-between',
          position: 'absolute',
        },
      }}
    >
      <Tab.Screen 
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{display: 'flex', alignItems: 'center', paddingTop: (focused ? 24: 0)}}>
              <Icon
                color={colors.foreground}
                name={ focused ? "home" : "home-outline" }
                type="ionicon"
                width={24}
                height={24}
              />
              {focused && (
                <Text style={{fontSize:20}}>•</Text>
              )}    
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Card"
        component={Card}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{display: 'flex', alignItems: 'center', paddingTop: (focused ? 24: 0)}}>
              <Icon
                color={colors.foreground}
                name={ focused ? "card" : "card-outline" }
                type="ionicon"
                width={24}
                height={24}
              />
              {focused && (
                <Text style={{fontSize:20}}>•</Text>
              )}    
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Pay"
        component={ScanQRCode}
        options={{
          headerShown: false,
          tabBarButton: () => (
            <View style={{ width: width/4, alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    borderRadius: 100,
                    backgroundColor: colors.primary,
                  }}
                  onPress={onScanButtonPressed}
                  onLongPress={sendButtonLongPress}
                >
                  <Icon
                    color={ colors.background }
                    name="qr-code-outline"
                    type="ionicon"
                    width={24}
                    height={24}
                  />
                </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={Marketplace}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{display: 'flex', alignItems: 'center', paddingTop: (focused ? 24: 0)}}>
              <Icon
                color={colors.foreground}
                name={ focused ? "cart" : "cart-outline" }
                type="ionicon"
                width={24}
                height={24}
              />
              {focused && (
                <Text style={{fontSize:20}}>•</Text>
              )}    
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{display: 'flex', alignItems: 'center', paddingTop: (focused ? 24: 0)}}>
              <Icon
                color={colors.foreground}
                name={ focused ? "person" : "person-outline" }
                type="ionicon"
                width={24}
                height={24}
              />
              {focused && (
                <Text style={{fontSize:20}}>•</Text>
              )}    
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const sendButtonLongPress = async () => {
  const isClipboardEmpty = (await BlueClipboard().getClipboardContent()).trim().length === 0;
  if (Platform.OS === 'ios') {
    const options = [loc._.cancel, loc.wallets.list_long_choose, loc.wallets.list_long_scan];
    if (!isClipboardEmpty) {
      options.push(loc.wallets.list_long_clipboard);
    }
    ActionSheet.showActionSheetWithOptions(
      { options, cancelButtonIndex: 0, anchor: findNodeHandle(walletActionButtonsRef.current) },
      buttonIndex => {
        if (buttonIndex === 1) {
          fs.showImagePickerAndReadImage().then(onBarScanned);
        } else if (buttonIndex === 2) {
          scanqrHelper(navigate, routeName, false).then(onBarScanned);
        } else if (buttonIndex === 3) {
          copyFromClipboard();
        }
      },
    );
  } else if (Platform.OS === 'android') {
    const buttons = [
      {
        text: loc._.cancel,
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: loc.wallets.list_long_choose,
        onPress: () => fs.showImagePickerAndReadImage().then(onBarScanned),
      },
      {
        text: loc.wallets.list_long_scan,
        onPress: () => scanqrHelper(navigate, routeName, false).then(onBarScanned),
      },
    ];
    if (!isClipboardEmpty) {
      buttons.push({
        text: loc.wallets.list_long_clipboard,
        onPress: copyFromClipboard,
      });
    }
    ActionSheet.showActionSheetWithOptions({
      title: '',
      message: '',
      buttons,
    });
  }
};

// const WalletsRoot = () => {
//   const theme = useTheme();
//   return (
//     <WalletsStack.Navigator name="Root" screenOptions={{ headerHideShadow: true, headerShown: true }}>
//       <WalletsStack.Screen name="CPFP" component={CPFP} options={CPFP.navigationOptions(theme)} />
//       <WalletsStack.Screen name="RBFBumpFee" component={RBFBumpFee} options={RBFBumpFee.navigationOptions(theme)} />
//       <WalletsStack.Screen name="RBFCancel" component={RBFCancel} options={RBFCancel.navigationOptions(theme)} />
//     </WalletsStack.Navigator>
//   );
// };

// const SettingsRoot = () => {
//   const theme = useTheme();
//   return (
//     <WalletsStack.Navigator screenOptions={{ headerHideShadow: true, headerShown: true }}>
//       {/* <WalletsStack.Screen name="Settings" component={Settings} options={Settings.navigationOptions(theme)} /> */}
//       {/* <WalletsStack.Screen name="SelectWallet" component={SelectWallet} options={SelectWallet.navigationOptions(theme)} /> */}
//       <WalletsStack.Screen name="Currency" component={Currency} options={Currency.navigationOptions(theme)} />
//       {/* <WalletsStack.Screen name="About" component={About} options={About.navigationOptions(theme)} /> */}
//       <WalletsStack.Screen name="ReleaseNotes" component={ReleaseNotes} options={ReleaseNotes.navigationOptions(theme)} />
//       <WalletsStack.Screen name="Selftest" component={Selftest} options={Selftest.navigationOptions(theme)} />
//       <WalletsStack.Screen name="Licensing" component={Licensing} options={Licensing.navigationOptions(theme)} />
//       <WalletsStack.Screen name="DefaultView" component={DefaultView} options={DefaultView.navigationOptions(theme)} />
//       <WalletsStack.Screen name="Language" component={Language} options={Language.navigationOptions(theme)} />
//       <WalletsStack.Screen name="EncryptStorage" component={EncryptStorage} options={EncryptStorage.navigationOptions(theme)} />
//       {/* <WalletsStack.Screen name="GeneralSettings" component={GeneralSettings} options={GeneralSettings.navigationOptions(theme)} /> */}
//       <WalletsStack.Screen name="NetworkSettings" component={NetworkSettings} options={NetworkSettings.navigationOptions(theme)} />
//       <WalletsStack.Screen
//         name="NotificationSettings"
//         component={NotificationSettings}
//         options={NotificationSettings.navigationOptions(theme)}
//       />
//       <WalletsStack.Screen
//         name="PlausibleDeniability"
//         component={PlausibleDeniability}
//         options={PlausibleDeniability.navigationOptions(theme)}
//       />
//       <WalletsStack.Screen name="LightningSettings" component={LightningSettings} options={LightningSettings.navigationOptions(theme)} />
//       <WalletsStack.Screen name="ElectrumSettings" component={ElectrumSettings} options={ElectrumSettings.navigationOptions(theme)} />
//       <WalletsStack.Screen name="TorSettings" component={TorSettings} options={TorSettings.navigationOptions(theme)} />
//       <WalletsStack.Screen name="SettingsPrivacy" component={SettingsPrivacy} options={SettingsPrivacy.navigationOptions(theme)} />
//       <WalletsStack.Screen name="Tools" component={Tools} options={Tools.navigationOptions(theme)} />
//       <WalletsStack.Screen name="LNDViewInvoice" component={LNDViewInvoice} options={LNDViewInvoice.navigationOptions(theme)} />
//       <WalletsStack.Screen
//         name="LNDViewAdditionalInvoiceInformation"
//         component={LNDViewAdditionalInvoiceInformation}
//         options={LNDViewAdditionalInvoiceInformation.navigationOptions(theme)}
//       />
//       <WalletsStack.Screen
//         name="LNDViewAdditionalInvoicePreImage"
//         component={LNDViewAdditionalInvoicePreImage}
//         options={LNDViewAdditionalInvoicePreImage.navigationOptions(theme)}
//       />
//       <WalletsStack.Screen name="Broadcast" component={Broadcast} options={Broadcast.navigationOptions(theme)} />
//       <WalletsStack.Screen name="IsItMyAddress" component={IsItMyAddress} options={IsItMyAddress.navigationOptions(theme)} />
//       <WalletsStack.Screen name="LnurlPay" component={LnurlPay} options={LnurlPay.navigationOptions(theme)} />
//       <WalletsStack.Screen name="LnurlPaySuccess" component={LnurlPaySuccess} options={LnurlPaySuccess.navigationOptions(theme)} />
//       <WalletsStack.Screen name="LnurlAuth" component={LnurlAuth} options={LnurlAuth.navigationOptions(theme)} />
//       <WalletsStack.Screen
//         name="Success"
//         component={Success}
//         options={{
//           headerShown: false,
//           gestureEnabled: false,
//         }}
//       />
//     </WalletsStack.Navigator>
//   );
// };

// const AddWalletStack = createNativeStackNavigator();
// const AddWalletRoot = () => {
//   const theme = useTheme();

//   return (
//     <WalletsStack.Navigator screenOptions={{ headerHideShadow: true, headerShown: true, }}>
//       <WalletsStack.Screen
//         name="ImportWalletDiscovery"
//         component={ImportWalletDiscovery}
//         options={ImportWalletDiscovery.navigationOptions(theme)}
//       />
//       <WalletsStack.Screen
//         name="ImportCustomDerivationPath"
//         component={ImportCustomDerivationPath}
//         options={ImportCustomDerivationPath.navigationOptions(theme)}
//       />
//       {/* <WalletsStack.Screen name="ImportSpeed" component={ImportSpeed} options={ImportSpeed.navigationOptions(theme)} />
//       <WalletsStack.Screen name="PleaseBackup" component={PleaseBackup} options={PleaseBackup.navigationOptions(theme)} /> */}
//       <WalletsStack.Screen
//         name="PleaseBackupLNDHub"
//         component={PleaseBackupLNDHub}
//         options={PleaseBackupLNDHub.navigationOptions(theme)}
//       />
//       <WalletsStack.Screen name="PleaseBackupLdk" component={PleaseBackupLdk} options={PleaseBackupLdk.navigationOptions(theme)} />
//       <WalletsStack.Screen name="ProvideEntropy" component={ProvideEntropy} options={ProvideEntropy.navigationOptions(theme)} />
//       <WalletsStack.Screen
//         name="WalletsAddMultisig"
//         component={WalletsAddMultisig}
//         options={WalletsAddMultisig.navigationOptions(theme)}
//       />
//       <WalletsStack.Screen
//         name="WalletsAddMultisigStep2"
//         component={WalletsAddMultisigStep2}
//         options={WalletsAddMultisigStep2.navigationOptions(theme)}
//       />
//       <WalletsStack.Screen
//         name="WalletsAddMultisigHelp"
//         component={WalletsAddMultisigHelp}
//         options={WalletsAddMultisigHelp.navigationOptions(theme)}
//       />
//     </WalletsStack.Navigator>
//   );
// };

// const SendDetailsStack = createNativeStackNavigator();
// const SendDetailsRoot = () => {
//   const theme = useTheme();

//   return (
//     <SendDetailsStack.Navigator screenOptions={{ headerHideShadow: true }}>
//       <SendDetailsStack.Screen name="Confirm" component={Confirm} options={Confirm.navigationOptions(theme)} />
//       <SendDetailsStack.Screen
//         name="PsbtWithHardwareWallet"
//         component={PsbtWithHardwareWallet}
//         options={PsbtWithHardwareWallet.navigationOptions(theme)}
//       />
//       <SendDetailsStack.Screen name="CreateTransaction" component={SendCreate} options={SendCreate.navigationOptions(theme)} />
//       <SendDetailsStack.Screen name="PsbtMultisig" component={PsbtMultisig} options={PsbtMultisig.navigationOptions(theme)} />
//       <SendDetailsStack.Screen
//         name="PsbtMultisigQRCode"
//         component={PsbtMultisigQRCode}
//         options={PsbtMultisigQRCode.navigationOptions(theme)}
//       />
//       <SendDetailsStack.Screen
//         name="Success"
//         component={Success}
//         options={{
//           headerShown: false,
//           gestureEnabled: false,
//         }}
//       />
//       <SendDetailsStack.Screen name="SelectWallet" component={SelectWallet} options={SelectWallet.navigationOptions(theme)} />
//       <SendDetailsStack.Screen name="CoinControl" component={CoinControl} options={CoinControl.navigationOptions(theme)} />
//     </SendDetailsStack.Navigator>
//   );
// };

// const LNDCreateInvoiceStack = createNativeStackNavigator();
// const LNDCreateInvoiceRoot = () => {
//   const theme = useTheme();

//   return (
//     <LNDCreateInvoiceStack.Navigator screenOptions={{ headerHideShadow: true }}>
//       <LNDCreateInvoiceStack.Screen
//         name="LNDCreateInvoice"
//         component={LNDCreateInvoice}
//         options={LNDCreateInvoice.navigationOptions(theme)}
//       />
//       <LNDCreateInvoiceStack.Screen name="SelectWallet" component={SelectWallet} options={SelectWallet.navigationOptions(theme)} />
//       <LNDCreateInvoiceStack.Screen name="LNDViewInvoice" component={LNDViewInvoice} options={LNDViewInvoice.navigationOptions(theme)} />
//       <LNDCreateInvoiceStack.Screen
//         name="LNDViewAdditionalInvoiceInformation"
//         component={LNDViewAdditionalInvoiceInformation}
//         options={LNDViewAdditionalInvoiceInformation.navigationOptions(theme)}
//       />
//       <LNDCreateInvoiceStack.Screen
//         name="LNDViewAdditionalInvoicePreImage"
//         component={LNDViewAdditionalInvoicePreImage}
//         options={LNDViewAdditionalInvoicePreImage.navigationOptions(theme)}
//       />
//     </LNDCreateInvoiceStack.Navigator>
//   );
// };

// const ScanLndInvoiceStack = createNativeStackNavigator();
// const ScanLndInvoiceRoot = () => {
//   const theme = useTheme();

//   return (
//     <ScanLndInvoiceStack.Navigator screenOptions={{ headerHideShadow: true }}>
//       <ScanLndInvoiceStack.Screen name="ScanLndInvoice" component={ScanLndInvoice} options={ScanLndInvoice.navigationOptions(theme)} />
//       <ScanLndInvoiceStack.Screen name="SelectWallet" component={SelectWallet} options={SelectWallet.navigationOptions(theme)} />
//       <ScanLndInvoiceStack.Screen name="Success" component={Success} options={{ headerShown: false, gestureEnabled: false }} />
//       <ScanLndInvoiceStack.Screen name="LnurlPay" component={LnurlPay} options={LnurlPay.navigationOptions(theme)} />
//       <ScanLndInvoiceStack.Screen name="LnurlPaySuccess" component={LnurlPaySuccess} options={LnurlPaySuccess.navigationOptions(theme)} />
//     </ScanLndInvoiceStack.Navigator>
//   );
// };

// const LDKOpenChannelStack = createNativeStackNavigator();
// const LDKOpenChannelRoot = () => {
//   const theme = useTheme();

//   return (
//     <LDKOpenChannelStack.Navigator name="LDKOpenChannelRoot" screenOptions={{ headerHideShadow: true }} initialRouteName="SelectWallet">
//       <LDKOpenChannelStack.Screen name="SelectWallet" component={SelectWallet} options={SelectWallet.navigationOptions(theme)} />
//       <LDKOpenChannelStack.Screen
//         name="LDKOpenChannelSetAmount"
//         component={LdkOpenChannel}
//         options={LdkOpenChannel.navigationOptions(theme)}
//       />
//       <LDKOpenChannelStack.Screen name="Success" component={Success} options={{ headerShown: false, gestureEnabled: false }} />
//     </LDKOpenChannelStack.Navigator>
//   );
// };

const ReorderWalletsStack = createNativeStackNavigator();
const ReorderWalletsStackRoot = () => {
  const theme = useTheme();

  return (
    <ReorderWalletsStack.Navigator name="ReorderWalletsRoot" screenOptions={{ headerHideShadow: true }}>
      <ReorderWalletsStack.Screen name="ReorderWallets" component={ReorderWallets} options={ReorderWallets.navigationOptions(theme)} />
    </ReorderWalletsStack.Navigator>
  );
};

// const WalletXpubStack = createNativeStackNavigator();
// const WalletXpubStackRoot = () => {
//   const theme = useTheme();

//   return (
//     <WalletXpubStack.Navigator name="WalletXpubRoot" screenOptions={{ headerHideShadow: true }} initialRouteName="WalletXpub">
//       <WalletXpubStack.Screen name="WalletXpub" component={WalletXpub} options={WalletXpub.navigationOptions(theme)} />
//     </WalletXpubStack.Navigator>
//   );
// };



const InitStack = createNativeStackNavigator();
export default function Layout() {
  const theme = useTheme();
  return (
  <InitStack.Navigator initialRouteName="Entry">
    <InitStack.Screen 
      name="Entry"
      component={Entry}
      options={{
        headerShown: false,
        stackAnimation: 'fade',
      }}
      initialParams={{ unlockOnComponentMount: true }} 
    />
    <InitStack.Screen 
      name="BlankPage"
      component={BlankPage}
      options={{
        headerShown: false,
        stackAnimation: 'fade',
      }}
    />
    <InitStack.Screen 
      name="Onboard"
      component={Onboard}
    />
    <InitStack.Screen 
      name="Unlock"
      component={Unlock}
      initialParams={{ headerShown: false, unlockOnComponentMount: true }} 
    />
    <InitStack.Screen
      name="ReorderWallets"
      component={ReorderWalletsStackRoot}
      options={{ headerShown: true, gestureEnabled: false, stackPresentation: isDesktop ? 'containedModal' : 'modal' }}
    />
    <InitStack.Screen //TODO: Make tab navigator disappear when pressing into a screen
      name='Navigation'
      component={TabNavigator}
      options={{ 
        headerShown: false,
        gestureEnabled: false,
        replaceAnimation: 'push',
      }} 
    />
    <InitStack.Screen //TODO: Test transactions
      name="Home" 
      component={Home}
      options={Home.navigationOptions(theme)}
    />
    <WalletsStack.Screen 
      name="Chart" 
      component={Chart}
      //options={Chart.navigationOptions(theme)}
    />
    <InitStack.Screen //TODO: Test transactions
      name="Card" 
      component={Card}
      options={Card.navigationOptions(theme)}
    />
    <InitStack.Screen //TODO: Test transactions
      name="FAQ"
      component={CardFAQ}
      options={CardFAQ.navigationOptions(theme)}
    />
    {/* <InitStack.Screen
      name="ReceiveDetailsRoot" 
      component={ReceiveDetailsStackRoot} 
      options={NavigationDefaultOptions}
    /> */}
    <InitStack.Screen //TODO: Test transaction
      name="WalletTransactions" 
      component={WalletTransactions} 
      options={WalletTransactions.navigationOptions(theme)}
    />
    <InitStack.Screen //TODO: Re-style buttons
      name="WalletSettings"
      component={WalletSettings}
      options={WalletSettings.navigationOptions(theme)}
    />
    <InitStack.Screen //TODO: Change searchbar style
      name="WalletAddresses" 
      component={WalletAddresses}
      options={WalletAddresses.navigationOptions(theme)}
    />
    <InitStack.Screen //TODO: Add header style
      name="ReceiveDetailsRoot" 
      component={ReceiveDetails}
      options={ReceiveDetails.navigationOptions(theme)}
    />
    <InitStack.Screen //TODO: Edit functionality
      name="SendDetails"
      component={SendDetails} 
      options={SendDetails.navigationOptions(theme)} 
    />
    <InitStack.Screen 
      name="ScanQRCodeRoot" 
      component={ScanQRCode} 
      options={{ 
        headerShown: false, 
        stackPresentation: 'fullScreenModal',
      }}
    />
    <InitStack.Screen //TODO: Edit functionality
      name="FeeSelect"
      component={FeeSelect} 
      options={FeeSelect.navigationOptions(theme)} 
    />
    <InitStack.Screen //TODO: Edit this screen
      name="SelectWallet"
      component={SelectWallet}
      options={SelectWallet.navigationOptions(theme)}
    />
    <InitStack.Screen
      name="AddWallet"
      component={AddWallet}
      options={AddWallet.navigationOptions(theme)}
    />
    <InitStack.Screen
      name="ImportWallet"
      component={ImportWallet}
      options={ImportWallet.navigationOptions(theme)}
    />
    <InitStack.Screen
      name="Backup"
      component={Backup}
      options={Backup.navigationOptions(theme)}
    />
    <InitStack.Screen //Ldk
      name="LdkOpenChannel"
      component={LdkOpenChannel}
      options={LdkOpenChannel.navigationOptions(theme)}
    />
    <InitStack.Screen 
      name="LdkInfo" 
      component={LdkInfo} 
      options={LdkInfo.navigationOptions(theme)} 
    />
    <InitStack.Screen 
      name="LdkViewLogs" 
      component={LdkViewLogs} 
      options={LdkViewLogs.navigationOptions(theme)} 
    />
    <InitStack.Screen 
      name="TransactionDetails" 
      component={TransactionDetails} 
      options={TransactionDetails.navigationOptions(theme)} 
    />
    <InitStack.Screen 
      name="TransactionStatus" 
      component={TransactionStatus} 
      options={TransactionStatus.navigationOptions(theme)} 
    />
    <InitStack.Screen //TODO: Change icons
      name="Settings" 
      component={Settings} 
      options={Settings.navigationOptions(theme)} 
    />
    <InitStack.Screen //TODO: Add currency, language, network settings, etc.
      name="GeneralSettings" 
      component={GeneralSettings} 
      options={GeneralSettings.navigationOptions(theme)} 
    />
    {/* <InitStack.Screen
      name="DefaultView"
      component={DefaultView}
      options={DefaultView.navigationOptions(theme)}
    /> */}
    <InitStack.Screen
      name="DeviceSettings"
      component={DeviceSettings}
      options={DeviceSettings.navigationOptions(theme)}
    />  
    <InitStack.Screen
      name="NotificationSettings"
      component={NotificationSettings}
      options={NotificationSettings.navigationOptions(theme)}
    />
    <InitStack.Screen
      name="NetworkSettings"
      component={NetworkSettings}
      options={NetworkSettings.navigationOptions(theme)}
    />
    <InitStack.Screen
      name="PasswordSettings"
      component={PasswordSettings}
      options={PasswordSettings.navigationOptions(theme)}
    />
    <InitStack.Screen
      name="SettingsPrivacy"
      component={SettingsPrivacy}
      options={SettingsPrivacy.navigationOptions(theme)}
    />
    <InitStack.Screen 
      name="About" 
      component={About} 
      options={About.navigationOptions(theme)} 
    />

    <InitStack.Screen 
      name="SignVerifyRoot" 
      component={SignVerify} 
      options={SignVerify.navigationOptions(theme)} 
    />
    <InitStack.Screen 
      name="WalletExportRoot" 
      component={WalletExport} 
      options={WalletExport.navigationOptions(theme)} 
    />
    <InitStack.Screen 
      name="WalletXpubRoot" 
      component={WalletXpub}
      options={WalletXpub.navigationOptions(theme)} />
    <InitStack.Screen 
      name="LappBrowserRoot" 
      component={LappBrowser} 
      options={LappBrowser.navigationOptions(theme)} 
    />
  </InitStack.Navigator>
)};

// const ViewEditMultisigCosignersStack = createNativeStackNavigator();
// const ViewEditMultisigCosignersRoot = () => {
//   const theme = useTheme();

//   return (
//     <ViewEditMultisigCosignersStack.Navigator
//       name="ViewEditMultisigCosignersRoot"
//       initialRouteName="ViewEditMultisigCosigners"
//       screenOptions={{ headerHideShadow: true }}
//     >
//       <ViewEditMultisigCosignersStack.Screen
//         name="ViewEditMultisigCosigners"
//         component={ViewEditMultisigCosigners}
//         options={ViewEditMultisigCosigners.navigationOptions(theme)}
//       />
//     </ViewEditMultisigCosignersStack.Navigator>
//   );
// };

// const ExportMultisigCoordinationSetupStack = createNativeStackNavigator();
// const ExportMultisigCoordinationSetupRoot = () => {
//   const theme = useTheme();

//   return (
//     <ExportMultisigCoordinationSetupStack.Navigator
//       name="ExportMultisigCoordinationSetupRoot"
//       initialRouteName="ExportMultisigCoordinationSetup"
//       screenOptions={{ headerHideShadow: true }}
//     >
//       <ExportMultisigCoordinationSetupStack.Screen
//         name="ExportMultisigCoordinationSetup"
//         component={ExportMultisigCoordinationSetup}
//         options={ExportMultisigCoordinationSetup.navigationOptions(theme)}
//       />
//     </ExportMultisigCoordinationSetupStack.Navigator>
//   );
// };

// const PaymentCodeStack = createNativeStackNavigator();
// const PaymentCodeStackRoot = () => {
//   return (
//     <PaymentCodeStack.Navigator name="PaymentCodeRoot" screenOptions={{ headerHideShadow: true }} initialRouteName="PaymentCode">
//       <PaymentCodeStack.Screen name="PaymentCode" component={PaymentCode} options={{ headerTitle: loc.bip47.payment_code }} />
//       <PaymentCodeStack.Screen
//         name="PaymentCodesList"
//         component={PaymentCodesList}
//         options={{ headerTitle: loc.bip47.payment_codes_list }}
//       />
//     </PaymentCodeStack.Navigator>
//   );
// };

// const RootStack = createNativeStackNavigator();
// const NavigationDefaultOptions = { 
//   headerShown: false,
//   presentation: 'card',
// };

// const Navigation = () => {
//   return (
//     <RootStack.Navigator initialRouteName="UnlockWithScreenRoot" screenOptions={{ headerHideShadow: true }}>
//       <RootStack.Screen name="Home" component={TabNavigator} options={NavigationDefaultOptions}/>
//       <RootStack.Screen name="WalletsRoot" component={WalletsRoot} options={{ headerShown: false, translucent: false }} />
//       <RootStack.Screen name="AddWalletRoot" component={AddWalletRoot} options={NavigationDefaultOptions} />
//       <RootStack.Screen name="SendDetailsRoot" component={SendDetailsRoot} options={NavigationDefaultOptions} />
//       <RootStack.Screen name="LNDCreateInvoiceRoot" component={LNDCreateInvoiceRoot} options={NavigationDefaultOptions} />
//       <RootStack.Screen name="ScanLndInvoiceRoot" component={ScanLndInvoiceRoot} options={NavigationDefaultOptions} />
//       <RootStack.Screen name="WalletExportRoot" component={WalletExportStackRoot} options={NavigationDefaultOptions} />
//       <RootStack.Screen
//         name="ExportMultisigCoordinationSetupRoot"
//         component={ExportMultisigCoordinationSetupRoot}
//         options={NavigationDefaultOptions}
//       />
//       <RootStack.Screen name="ViewEditMultisigCosignersRoot" component={ViewEditMultisigCosignersRoot} options={NavigationDefaultOptions} />
//       <RootStack.Screen name="WalletXpubRoot" component={WalletXpubStackRoot} options={NavigationDefaultOptions} />
//       <RootStack.Screen name="SignVerifyRoot" component={SignVerifyStackRoot} options={NavigationDefaultOptions} />
//       <RootStack.Screen name="SelectWallet" component={SelectWallet} />
//       <RootStack.Screen name="LappBrowserRoot" component={LappBrowserStackRoot} options={NavigationDefaultOptions} />
//       <RootStack.Screen name="LDKOpenChannelRoot" component={LDKOpenChannelRoot} options={NavigationDefaultOptions} />

//       <RootStack.Screen
//         name="ScanQRCodeRoot"
//         component={ScanQRCodeRoot}
//         options={{
//           headerShown: false,
//           stackPresentation: isDesktop ? 'containedModal' : 'fullScreenModal',
//         }}
//       />

//       <RootStack.Screen name="PaymentCodeRoot" component={PaymentCodeStackRoot} options={NavigationDefaultOptions} />
//     </RootStack.Navigator>
//   );
// };

// export default InitRoot;
