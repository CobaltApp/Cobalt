import React, { useCallback, useMemo, useRef } from 'react';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Keyboard, Platform, useWindowDimensions, Dimensions, I18nManager, View, Image } from 'react-native';
import { useTheme, useNavigation, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator, useBottomTabBarHeight, BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { Icon, Button } from 'react-native-elements';
import { FContainer, FButton } from './components/FloatButtons';

import Settings from './screen/settings/settings';
import About from './screen/settings/about';
import ReleaseNotes from './screen/settings/releasenotes';
import Licensing from './screen/settings/licensing';
import Selftest from './screen/selftest';
import Language from './screen/settings/language';
import Currency from './screen/settings/currency';
import EncryptStorage from './screen/settings/encryptStorage';
import PlausibleDeniability from './screen/plausibledeniability';
import LightningSettings from './screen/settings/lightningSettings';
import ElectrumSettings from './screen/settings/electrumSettings';
import TorSettings from './screen/settings/torSettings';
import Tools from './screen/settings/tools';
import GeneralSettings from './screen/settings/GeneralSettings';
import NetworkSettings from './screen/settings/NetworkSettings';
import NotificationSettings from './screen/settings/notificationSettings';
import DefaultView from './screen/settings/defaultView';

import Home from './screen/home';
import WalletTransactions from './screen/wallets/transactions';
import AddWallet from './screen/wallets/add';
import WalletsAddMultisig from './screen/wallets/addMultisig';
import WalletsAddMultisigStep2 from './screen/wallets/addMultisigStep2';
import WalletsAddMultisigHelp from './screen/wallets/addMultisigHelp';
import PleaseBackup from './screen/wallets/pleaseBackup';
import PleaseBackupLNDHub from './screen/wallets/pleaseBackupLNDHub';
import PleaseBackupLdk from './screen/wallets/pleaseBackupLdk';
import ImportWallet from './screen/wallets/import';
import ImportWalletDiscovery from './screen/wallets/importDiscovery';
import ImportCustomDerivationPath from './screen/wallets/importCustomDerivationPath';
import ImportSpeed from './screen/wallets/importSpeed';
import WalletDetails from './screen/wallets/details';
import WalletExport from './screen/wallets/export';
import ExportMultisigCoordinationSetup from './screen/wallets/exportMultisigCoordinationSetup';
import ViewEditMultisigCosigners from './screen/wallets/viewEditMultisigCosigners';
import WalletXpub from './screen/wallets/xpub';
import SignVerify from './screen/wallets/signVerify';
import WalletAddresses from './screen/wallets/addresses';
import ReorderWallets from './screen/wallets/reorderWallets';
import SelectWallet from './screen/wallets/selectWallet';
import ProvideEntropy from './screen/wallets/provideEntropy';

import TransactionDetails from './screen/transactions/details';
import TransactionStatus from './screen/transactions/transactionStatus';
import CPFP from './screen/transactions/CPFP';
import RBFBumpFee from './screen/transactions/RBFBumpFee';
import RBFCancel from './screen/transactions/RBFCancel';

import ReceiveDetails from './screen/receive/details';
import AztecoRedeem from './screen/receive/aztecoRedeem';

import SendDetails from './screen/send/details';
import ScanQRCode from './screen/send/ScanQRCode';
import FeeSelect from './screen/send/fee';
import SendCreate from './screen/send/create';
import Confirm from './screen/send/confirm';
import PsbtWithHardwareWallet from './screen/send/psbtWithHardwareWallet';
import PsbtMultisig from './screen/send/psbtMultisig';
import PsbtMultisigQRCode from './screen/send/psbtMultisigQRCode';
import Success from './screen/send/success';
import Broadcast from './screen/send/broadcast';
import IsItMyAddress from './screen/send/isItMyAddress';
import CoinControl from './screen/send/coinControl';

import ScanLndInvoice from './screen/lnd/scanLndInvoice';
import LappBrowser from './screen/lnd/browser';
import LNDCreateInvoice from './screen/lnd/lndCreateInvoice';
import LNDViewInvoice from './screen/lnd/lndViewInvoice';
import LdkOpenChannel from './screen/lnd/ldkOpenChannel';
import LdkInfo from './screen/lnd/ldkInfo';
import LNDViewAdditionalInvoiceInformation from './screen/lnd/lndViewAdditionalInvoiceInformation';
import LnurlPay from './screen/lnd/lnurlPay';
import LnurlPaySuccess from './screen/lnd/lnurlPaySuccess';
import LnurlAuth from './screen/lnd/lnurlAuth';
import UnlockWith from './UnlockWith';
import DrawerList from './screen/wallets/drawerList';
import { isDesktop, isTablet, isHandset } from './blue_modules/environment';
import SettingsPrivacy from './screen/settings/SettingsPrivacy';
import LNDViewAdditionalInvoicePreImage from './screen/lnd/lndViewAdditionalInvoicePreImage';
import LdkViewLogs from './screen/wallets/ldkViewLogs';
import PaymentCode from './screen/wallets/paymentCode';
import PaymentCodesList from './screen/wallets/paymentCodesList';
import loc from './loc';

import DeeplinkSchemaMatch from './class/deeplink-schema-match';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import Notifications from './screen/Notifications';
import Chat from './screen/Chat';
import Card from './screen/card';
import CardFAQ from './screen/card/faq';

import Discover from './screen/Discover';
import Chart from './screen/chart';
import { IconConfigKeys } from 'react-native-ios-context-menu';

import * as NavigationService from './NavigationService';
import { TouchableOpacity } from 'react-native-gesture-handler';

const WalletsStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const scanqrHelper = require('./helpers/scan-qr');
//const scanButtonRef = useRef();

function TabNavigator() {
  const { theme, colors, scanImage, barStyle } = useTheme();
  //const { navigation, route } = props;
  const { navigate } = useNavigation();
  const routeName = useRoute().name;
  const walletActionButtonsRef = useRef();

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
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Icon
              color={colors.foreground}
              name={ focused ? "home" : "home-outline" }
              type="ionicon"
              width={24}
              height={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={Discover}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Icon
              color={colors.foreground}
              name={ focused ? "bar-chart" : "bar-chart-outline" }
              type="ionicon"
              width={24}
              height={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Pay"
        component={ScanQRCode}
        options={{
          headerShown: false,
          tabBarButton: () => (
            <View style={{ width: 100, alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: colors.primary,
                  }}
                  onPress={onScanButtonPressed}
                  onLongPress={sendButtonLongPress}
                >
                  <Icon
                    color={ colors.background }
                    name="plus"
                    type="feather"
                    width={24}
                    height={24}
                  />
                </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Card"
        component={Card}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Icon
              color={colors.foreground}
              name={ focused ? "card" : "card-outline"}
              type="ionicon"
              width={24}
              height={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Icon
              color={colors.foreground}
              name={focused ? "person" : "person-outline"}
              type="ionicon"
              width={24}
              height={24}
            />
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

const WalletsRoot = () => {
  const theme = useTheme();
  return (
    <WalletsStack.Navigator name="Root" screenOptions={{ headerHideShadow: true, headerShown: true }}>
      {/* <WalletsStack.Screen name="WalletsList" component={WalletsList} options={WalletsList.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen name="ReceiveDetails" component={ReceiveDetails} options={ReceiveDetails.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen name="ReceiveDetailsRoot" component={ReceiveDetailsStackRoot} options={NavigationDefaultOptions} /> */}
      {/* <WalletsStack.Screen name="WalletTransactions" component={WalletTransactions} options={WalletTransactions.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen name="LdkOpenChannel" component={LdkOpenChannel} options={LdkOpenChannel.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen name="LdkInfo" component={LdkInfo} options={LdkInfo.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen name="WalletDetails" component={WalletDetails} options={WalletDetails.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen name="LdkViewLogs" component={LdkViewLogs} options={LdkViewLogs.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen name="TransactionDetails" component={TransactionDetails} options={TransactionDetails.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen name="TransactionStatus" component={TransactionStatus} options={TransactionStatus.navigationOptions(theme)} /> */}
      <WalletsStack.Screen name="CPFP" component={CPFP} options={CPFP.navigationOptions(theme)} />
      <WalletsStack.Screen name="RBFBumpFee" component={RBFBumpFee} options={RBFBumpFee.navigationOptions(theme)} />
      <WalletsStack.Screen name="RBFCancel" component={RBFCancel} options={RBFCancel.navigationOptions(theme)} />
      {/* <WalletsStack.Screen name="WalletAddresses" component={WalletAddresses} options={WalletAddresses.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen 
        name="Chart" 
        component={Chart} 
        options={{
          presentation: 'card',
        headerShadowVisible: false,
        title: 'Bitcoin (BTC)',
        headerStyle: {
          //backgroundColor: '#051931'
        },
        headerTitleStyle: {
          fontFamily: 'Poppins',
          fontWeight: '500',
          fontSize: 18,
          color: '#FFFFFF',
        },
        headerLeft: () => (
          <TouchableOpacity
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: 44,
            width: 44,
            borderRadius: 22,
            //backgroundColor: colors.card,
          }}
          onPress={() =>
            navigation.pop()
          }
        >
          <Icon name="arrow-left" type="feather" size={24} color={'#FFFFFF'} />
        </TouchableOpacity>
        ),
        }}
        options={NavigationDefaultOptions}
      /> */}
    </WalletsStack.Navigator>
  );
};

const SettingsRoot = () => {
  const theme = useTheme();
  return (
    <WalletsStack.Navigator screenOptions={{ headerHideShadow: true, headerShown: true }}>
      {/* <WalletsStack.Screen name="Settings" component={Settings} options={Settings.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen name="SelectWallet" component={SelectWallet} options={SelectWallet.navigationOptions(theme)} /> */}
      <WalletsStack.Screen name="Currency" component={Currency} options={Currency.navigationOptions(theme)} />
      {/* <WalletsStack.Screen name="About" component={About} options={About.navigationOptions(theme)} /> */}
      <WalletsStack.Screen name="ReleaseNotes" component={ReleaseNotes} options={ReleaseNotes.navigationOptions(theme)} />
      <WalletsStack.Screen name="Selftest" component={Selftest} options={Selftest.navigationOptions(theme)} />
      <WalletsStack.Screen name="Licensing" component={Licensing} options={Licensing.navigationOptions(theme)} />
      <WalletsStack.Screen name="DefaultView" component={DefaultView} options={DefaultView.navigationOptions(theme)} />
      <WalletsStack.Screen name="Language" component={Language} options={Language.navigationOptions(theme)} />
      <WalletsStack.Screen name="EncryptStorage" component={EncryptStorage} options={EncryptStorage.navigationOptions(theme)} />
      {/* <WalletsStack.Screen name="GeneralSettings" component={GeneralSettings} options={GeneralSettings.navigationOptions(theme)} /> */}
      <WalletsStack.Screen name="NetworkSettings" component={NetworkSettings} options={NetworkSettings.navigationOptions(theme)} />
      <WalletsStack.Screen
        name="NotificationSettings"
        component={NotificationSettings}
        options={NotificationSettings.navigationOptions(theme)}
      />
      <WalletsStack.Screen
        name="PlausibleDeniability"
        component={PlausibleDeniability}
        options={PlausibleDeniability.navigationOptions(theme)}
      />
      <WalletsStack.Screen name="LightningSettings" component={LightningSettings} options={LightningSettings.navigationOptions(theme)} />
      <WalletsStack.Screen name="ElectrumSettings" component={ElectrumSettings} options={ElectrumSettings.navigationOptions(theme)} />
      <WalletsStack.Screen name="TorSettings" component={TorSettings} options={TorSettings.navigationOptions(theme)} />
      <WalletsStack.Screen name="SettingsPrivacy" component={SettingsPrivacy} options={SettingsPrivacy.navigationOptions(theme)} />
      <WalletsStack.Screen name="Tools" component={Tools} options={Tools.navigationOptions(theme)} />
      <WalletsStack.Screen name="LNDViewInvoice" component={LNDViewInvoice} options={LNDViewInvoice.navigationOptions(theme)} />
      <WalletsStack.Screen
        name="LNDViewAdditionalInvoiceInformation"
        component={LNDViewAdditionalInvoiceInformation}
        options={LNDViewAdditionalInvoiceInformation.navigationOptions(theme)}
      />
      <WalletsStack.Screen
        name="LNDViewAdditionalInvoicePreImage"
        component={LNDViewAdditionalInvoicePreImage}
        options={LNDViewAdditionalInvoicePreImage.navigationOptions(theme)}
      />
      <WalletsStack.Screen name="Broadcast" component={Broadcast} options={Broadcast.navigationOptions(theme)} />
      <WalletsStack.Screen name="IsItMyAddress" component={IsItMyAddress} options={IsItMyAddress.navigationOptions(theme)} />
      <WalletsStack.Screen name="LnurlPay" component={LnurlPay} options={LnurlPay.navigationOptions(theme)} />
      <WalletsStack.Screen name="LnurlPaySuccess" component={LnurlPaySuccess} options={LnurlPaySuccess.navigationOptions(theme)} />
      <WalletsStack.Screen name="LnurlAuth" component={LnurlAuth} options={LnurlAuth.navigationOptions(theme)} />
      <WalletsStack.Screen
        name="Success"
        component={Success}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </WalletsStack.Navigator>
  );
};

const AddWalletStack = createNativeStackNavigator();
const AddWalletRoot = () => {
  const theme = useTheme();

  return (
    <WalletsStack.Navigator screenOptions={{ headerHideShadow: true, headerShown: true, }}>
      {/* <WalletsStack.Screen name="AddWallet" component={AddWallet} options={AddWallet.navigationOptions(theme)} /> */}
      {/* <WalletsStack.Screen name="ImportWallet" component={ImportWallet} options={ImportWallet.navigationOptions(theme)} /> */}
      <WalletsStack.Screen
        name="ImportWalletDiscovery"
        component={ImportWalletDiscovery}
        options={ImportWalletDiscovery.navigationOptions(theme)}
      />
      <WalletsStack.Screen
        name="ImportCustomDerivationPath"
        component={ImportCustomDerivationPath}
        options={ImportCustomDerivationPath.navigationOptions(theme)}
      />
      <WalletsStack.Screen name="ImportSpeed" component={ImportSpeed} options={ImportSpeed.navigationOptions(theme)} />
      <WalletsStack.Screen name="PleaseBackup" component={PleaseBackup} options={PleaseBackup.navigationOptions(theme)} />
      <WalletsStack.Screen
        name="PleaseBackupLNDHub"
        component={PleaseBackupLNDHub}
        options={PleaseBackupLNDHub.navigationOptions(theme)}
      />
      <WalletsStack.Screen name="PleaseBackupLdk" component={PleaseBackupLdk} options={PleaseBackupLdk.navigationOptions(theme)} />
      <WalletsStack.Screen name="ProvideEntropy" component={ProvideEntropy} options={ProvideEntropy.navigationOptions(theme)} />
      <WalletsStack.Screen
        name="WalletsAddMultisig"
        component={WalletsAddMultisig}
        options={WalletsAddMultisig.navigationOptions(theme)}
      />
      <WalletsStack.Screen
        name="WalletsAddMultisigStep2"
        component={WalletsAddMultisigStep2}
        options={WalletsAddMultisigStep2.navigationOptions(theme)}
      />
      <WalletsStack.Screen
        name="WalletsAddMultisigHelp"
        component={WalletsAddMultisigHelp}
        options={WalletsAddMultisigHelp.navigationOptions(theme)}
      />
    </WalletsStack.Navigator>
  );
};

// CreateTransactionStackNavigator === SendDetailsStack
const SendDetailsStack = createNativeStackNavigator();
const SendDetailsRoot = () => {
  const theme = useTheme();

  return (
    <SendDetailsStack.Navigator screenOptions={{ headerHideShadow: true }}>
      {/* <SendDetailsStack.Screen name="SendDetails" component={SendDetails} options={SendDetails.navigationOptions(theme)} /> */}
      <SendDetailsStack.Screen name="Confirm" component={Confirm} options={Confirm.navigationOptions(theme)} />
      <SendDetailsStack.Screen
        name="PsbtWithHardwareWallet"
        component={PsbtWithHardwareWallet}
        options={PsbtWithHardwareWallet.navigationOptions(theme)}
      />
      <SendDetailsStack.Screen name="CreateTransaction" component={SendCreate} options={SendCreate.navigationOptions(theme)} />
      <SendDetailsStack.Screen name="PsbtMultisig" component={PsbtMultisig} options={PsbtMultisig.navigationOptions(theme)} />
      <SendDetailsStack.Screen
        name="PsbtMultisigQRCode"
        component={PsbtMultisigQRCode}
        options={PsbtMultisigQRCode.navigationOptions(theme)}
      />
      <SendDetailsStack.Screen
        name="Success"
        component={Success}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <SendDetailsStack.Screen name="SelectWallet" component={SelectWallet} options={SelectWallet.navigationOptions(theme)} />
      <SendDetailsStack.Screen name="CoinControl" component={CoinControl} options={CoinControl.navigationOptions(theme)} />
    </SendDetailsStack.Navigator>
  );
};

const LNDCreateInvoiceStack = createNativeStackNavigator();
const LNDCreateInvoiceRoot = () => {
  const theme = useTheme();

  return (
    <LNDCreateInvoiceStack.Navigator screenOptions={{ headerHideShadow: true }}>
      <LNDCreateInvoiceStack.Screen
        name="LNDCreateInvoice"
        component={LNDCreateInvoice}
        options={LNDCreateInvoice.navigationOptions(theme)}
      />
      <LNDCreateInvoiceStack.Screen name="SelectWallet" component={SelectWallet} options={SelectWallet.navigationOptions(theme)} />
      <LNDCreateInvoiceStack.Screen name="LNDViewInvoice" component={LNDViewInvoice} options={LNDViewInvoice.navigationOptions(theme)} />
      <LNDCreateInvoiceStack.Screen
        name="LNDViewAdditionalInvoiceInformation"
        component={LNDViewAdditionalInvoiceInformation}
        options={LNDViewAdditionalInvoiceInformation.navigationOptions(theme)}
      />
      <LNDCreateInvoiceStack.Screen
        name="LNDViewAdditionalInvoicePreImage"
        component={LNDViewAdditionalInvoicePreImage}
        options={LNDViewAdditionalInvoicePreImage.navigationOptions(theme)}
      />
    </LNDCreateInvoiceStack.Navigator>
  );
};

// LightningScanInvoiceStackNavigator === ScanLndInvoiceStack
const ScanLndInvoiceStack = createNativeStackNavigator();
const ScanLndInvoiceRoot = () => {
  const theme = useTheme();

  return (
    <ScanLndInvoiceStack.Navigator screenOptions={{ headerHideShadow: true }}>
      <ScanLndInvoiceStack.Screen name="ScanLndInvoice" component={ScanLndInvoice} options={ScanLndInvoice.navigationOptions(theme)} />
      <ScanLndInvoiceStack.Screen name="SelectWallet" component={SelectWallet} options={SelectWallet.navigationOptions(theme)} />
      <ScanLndInvoiceStack.Screen name="Success" component={Success} options={{ headerShown: false, gestureEnabled: false }} />
      <ScanLndInvoiceStack.Screen name="LnurlPay" component={LnurlPay} options={LnurlPay.navigationOptions(theme)} />
      <ScanLndInvoiceStack.Screen name="LnurlPaySuccess" component={LnurlPaySuccess} options={LnurlPaySuccess.navigationOptions(theme)} />
    </ScanLndInvoiceStack.Navigator>
  );
};

const LDKOpenChannelStack = createNativeStackNavigator();
const LDKOpenChannelRoot = () => {
  const theme = useTheme();

  return (
    <LDKOpenChannelStack.Navigator name="LDKOpenChannelRoot" screenOptions={{ headerHideShadow: true }} initialRouteName="SelectWallet">
      <LDKOpenChannelStack.Screen name="SelectWallet" component={SelectWallet} options={SelectWallet.navigationOptions(theme)} />
      <LDKOpenChannelStack.Screen
        name="LDKOpenChannelSetAmount"
        component={LdkOpenChannel}
        options={LdkOpenChannel.navigationOptions(theme)}
      />
      <LDKOpenChannelStack.Screen name="Success" component={Success} options={{ headerShown: false, gestureEnabled: false }} />
    </LDKOpenChannelStack.Navigator>
  );
};

const AztecoRedeemStack = createNativeStackNavigator();
const AztecoRedeemRoot = () => {
  const theme = useTheme();

  return (
    <AztecoRedeemStack.Navigator screenOptions={{ headerHideShadow: true }}>
      <AztecoRedeemStack.Screen name="AztecoRedeem" component={AztecoRedeem} options={AztecoRedeem.navigationOptions(theme)} />
      <AztecoRedeemStack.Screen name="SelectWallet" component={SelectWallet} />
    </AztecoRedeemStack.Navigator>
  );
};

// const ScanQRCodeStack = createNativeStackNavigator();
// const ScanQRCodeRoot = () => (
//   <ScanQRCodeStack.Navigator screenOptions={{ headerShown: false, stackPresentation: isDesktop ? 'containedModal' : 'fullScreenModal' }}>
//     <ScanQRCodeStack.Screen name="ScanQRCode" component={ScanQRCode} />
//   </ScanQRCodeStack.Navigator>
// );

// const UnlockWithScreenStack = createNativeStackNavigator();
// const UnlockWithScreenRoot = () => (
//   <UnlockWithScreenStack.Navigator name="UnlockWithScreenRoot" screenOptions={{ headerShown: false }}>
//     <UnlockWithScreenStack.Screen name="UnlockWithScreen" component={UnlockWith} initialParams={{ unlockOnComponentMount: true }} />
//   </UnlockWithScreenStack.Navigator>
// );

const ReorderWalletsStack = createNativeStackNavigator();
const ReorderWalletsStackRoot = () => {
  const theme = useTheme();

  return (
    <ReorderWalletsStack.Navigator name="ReorderWalletsRoot" screenOptions={{ headerHideShadow: true }}>
      <ReorderWalletsStack.Screen name="ReorderWallets" component={ReorderWallets} options={ReorderWallets.navigationOptions(theme)} />
    </ReorderWalletsStack.Navigator>
  );
};

const WalletXpubStack = createNativeStackNavigator();
const WalletXpubStackRoot = () => {
  const theme = useTheme();

  return (
    <WalletXpubStack.Navigator name="WalletXpubRoot" screenOptions={{ headerHideShadow: true }} initialRouteName="WalletXpub">
      <WalletXpubStack.Screen name="WalletXpub" component={WalletXpub} options={WalletXpub.navigationOptions(theme)} />
    </WalletXpubStack.Navigator>
  );
};



const InitStack = createNativeStackNavigator();
const InitRoot = () => {
  const theme = useTheme();
  return (
  <InitStack.Navigator initialRouteName="UnlockWithScreenRoot">
    <InitStack.Screen 
      name="UnlockWithScreenRoot" 
      component={UnlockWith}
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
      name="WalletDetails"
      component={WalletDetails}
      options={WalletDetails.navigationOptions(theme)}
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
    <InitStack.Screen //TODO: Finalize screen style
      name="AddWalletRoot" 
      component={AddWallet}
      options={AddWallet.navigationOptions(theme)} 
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

const ViewEditMultisigCosignersStack = createNativeStackNavigator();
const ViewEditMultisigCosignersRoot = () => {
  const theme = useTheme();

  return (
    <ViewEditMultisigCosignersStack.Navigator
      name="ViewEditMultisigCosignersRoot"
      initialRouteName="ViewEditMultisigCosigners"
      screenOptions={{ headerHideShadow: true }}
    >
      <ViewEditMultisigCosignersStack.Screen
        name="ViewEditMultisigCosigners"
        component={ViewEditMultisigCosigners}
        options={ViewEditMultisigCosigners.navigationOptions(theme)}
      />
    </ViewEditMultisigCosignersStack.Navigator>
  );
};

const ExportMultisigCoordinationSetupStack = createNativeStackNavigator();
const ExportMultisigCoordinationSetupRoot = () => {
  const theme = useTheme();

  return (
    <ExportMultisigCoordinationSetupStack.Navigator
      name="ExportMultisigCoordinationSetupRoot"
      initialRouteName="ExportMultisigCoordinationSetup"
      screenOptions={{ headerHideShadow: true }}
    >
      <ExportMultisigCoordinationSetupStack.Screen
        name="ExportMultisigCoordinationSetup"
        component={ExportMultisigCoordinationSetup}
        options={ExportMultisigCoordinationSetup.navigationOptions(theme)}
      />
    </ExportMultisigCoordinationSetupStack.Navigator>
  );
};

const PaymentCodeStack = createNativeStackNavigator();
const PaymentCodeStackRoot = () => {
  return (
    <PaymentCodeStack.Navigator name="PaymentCodeRoot" screenOptions={{ headerHideShadow: true }} initialRouteName="PaymentCode">
      <PaymentCodeStack.Screen name="PaymentCode" component={PaymentCode} options={{ headerTitle: loc.bip47.payment_code }} />
      <PaymentCodeStack.Screen
        name="PaymentCodesList"
        component={PaymentCodesList}
        options={{ headerTitle: loc.bip47.payment_codes_list }}
      />
    </PaymentCodeStack.Navigator>
  );
};

const RootStack = createNativeStackNavigator();
const NavigationDefaultOptions = { 
  headerShown: false,
  presentation: 'card',
};

const Navigation = () => {
  return (
    <RootStack.Navigator initialRouteName="UnlockWithScreenRoot" screenOptions={{ headerHideShadow: true }}>
      {/* stacks */}
      <RootStack.Screen name="Home" component={TabNavigator} options={NavigationDefaultOptions}/>
      <RootStack.Screen name="WalletsRoot" component={WalletsRoot} options={{ headerShown: false, translucent: false }} />
      <RootStack.Screen name="AddWalletRoot" component={AddWalletRoot} options={NavigationDefaultOptions} />
      <RootStack.Screen name="SendDetailsRoot" component={SendDetailsRoot} options={NavigationDefaultOptions} />
      <RootStack.Screen name="LNDCreateInvoiceRoot" component={LNDCreateInvoiceRoot} options={NavigationDefaultOptions} />
      <RootStack.Screen name="ScanLndInvoiceRoot" component={ScanLndInvoiceRoot} options={NavigationDefaultOptions} />
      <RootStack.Screen name="AztecoRedeemRoot" component={AztecoRedeemRoot} options={NavigationDefaultOptions} />
      {/* screens */}
      <RootStack.Screen name="WalletExportRoot" component={WalletExportStackRoot} options={NavigationDefaultOptions} />
      <RootStack.Screen
        name="ExportMultisigCoordinationSetupRoot"
        component={ExportMultisigCoordinationSetupRoot}
        options={NavigationDefaultOptions}
      />
      <RootStack.Screen name="ViewEditMultisigCosignersRoot" component={ViewEditMultisigCosignersRoot} options={NavigationDefaultOptions} />
      <RootStack.Screen name="WalletXpubRoot" component={WalletXpubStackRoot} options={NavigationDefaultOptions} />
      <RootStack.Screen name="SignVerifyRoot" component={SignVerifyStackRoot} options={NavigationDefaultOptions} />
      <RootStack.Screen name="SelectWallet" component={SelectWallet} />
      {/* <RootStack.Screen name="ReceiveDetailsRoot" component={ReceiveDetailsStackRoot} options={NavigationDefaultOptions} /> */}
      <RootStack.Screen name="LappBrowserRoot" component={LappBrowserStackRoot} options={NavigationDefaultOptions} />
      <RootStack.Screen name="LDKOpenChannelRoot" component={LDKOpenChannelRoot} options={NavigationDefaultOptions} />

      <RootStack.Screen
        name="ScanQRCodeRoot"
        component={ScanQRCodeRoot}
        options={{
          headerShown: false,
          stackPresentation: isDesktop ? 'containedModal' : 'fullScreenModal',
        }}
      />

      <RootStack.Screen name="PaymentCodeRoot" component={PaymentCodeStackRoot} options={NavigationDefaultOptions} />
    </RootStack.Navigator>
  );
};

export default InitRoot;
