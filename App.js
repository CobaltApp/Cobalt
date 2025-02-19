import 'react-native-gesture-handler'; // should be on top
import React, { useContext, useEffect, useRef } from 'react';
import {
  AppState,
  DeviceEventEmitter,
  NativeModules,
  NativeEventEmitter,
  Linking,
  Platform,
  StyleSheet,
  UIManager,
  useColorScheme,
  View,
  StatusBar,
  LogBox,
} from 'react-native';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { navigationRef, navigate, canGoBack, goBack, getRoute } from './NavigationService';
import * as NavigationService from './NavigationService';
import { Chain } from './src/models/bitcoinUnits';
import OnAppLaunch from './src/class/on-app-launch';
import DeeplinkSchemaMatch from './src/class/deeplink-schema-match';
import loc from './src/loc';
import { BlueDefaultTheme, BlueDarkTheme } from './src/components/themes';
import BlueClipboard from './src/custom-modules/clipboard';
import { isDesktop } from './src/custom-modules/environment';
import { BlueStorageContext } from './src/custom-modules/storage-context';
import WatchConnectivity from './WatchConnectivity';
import DeviceQuickActions from './src/class/quick-actions';
import Notifications from './src/custom-modules/notifications';
import Biometric from './src/class/biometrics';
import WidgetCommunication from './src/custom-modules/WidgetCommunication';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import ActionSheet from './src/screens/ActionSheet';
import HandoffComponent from './src/components/handoff';
import Privacy from './src/custom-modules/Privacy';
import Layout from './Navigation';
const A = require('./src/custom-modules/analytics');
const currency = require('./src/custom-modules/currency');

const eventEmitter = Platform.OS === 'ios' ? new NativeEventEmitter(NativeModules.EventEmitter) : undefined;
const { EventEmitter } = NativeModules;

LogBox.ignoreLogs(['Require cycle:']);

const ClipboardContentType = Object.freeze({
  BITCOIN: 'BITCOIN',
  LIGHTNING: 'LIGHTNING',
});

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const App = () => {
  const { walletsInitialized, wallets, addWallet, saveToDisk, fetchAndSaveWalletTransactions, refreshAllWalletTransactions } =
    useContext(BlueStorageContext);
  const appState = useRef(AppState.currentState);
  const clipboardContent = useRef();
  const colorScheme = useColorScheme();

  const onNotificationReceived = async notification => {
    const payload = Object.assign({}, notification, notification.data);
    if (notification.data && notification.data.data) Object.assign(payload, notification.data.data);
    payload.foreground = true;

    await Notifications.addNotification(payload);
    // if user is staring at the app when he receives the notification we process it instantly
    // so app refetches related wallet
    if (payload.foreground) await processPushNotifications();
  };

  const openSettings = () => {
    NavigationService.dispatch(
      CommonActions.navigate({
        name: 'Settings',
      }),
    );
  };

  const onUserActivityOpen = data => {
    switch (data.activityType) {
      case HandoffComponent.activityTypes.ReceiveOnchain:
        NavigationService.navigate('ReceiveDetailsRoot', {
          screen: 'ReceiveDetails',
          params: {
            address: data.userInfo.address,
          },
        });
        break;
      case HandoffComponent.activityTypes.Xpub:
        NavigationService.navigate('WalletXpubRoot', {
          screen: 'WalletXpub',
          params: {
            xpub: data.userInfo.xpub,
          },
        });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (walletsInitialized) {
      addListeners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletsInitialized]);

  useEffect(() => {
    return () => {
      //Linking.removeEventListener('url', handleOpenURL);
      //AppState.removeEventListener('change', handleAppStateChange);
      eventEmitter?.removeAllListeners('onNotificationReceived');
      eventEmitter?.removeAllListeners('openSettings');
      eventEmitter?.removeAllListeners('onUserActivityOpen');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (colorScheme) {
      if (colorScheme === 'light') {
        changeNavigationBarColor(BlueDefaultTheme.colors.background, true, true);
      } else {
        changeNavigationBarColor(BlueDarkTheme.colors.element, false, true);
      }
    }
  }, [colorScheme]);

  const addListeners = () => {
    Linking.addEventListener('url', handleOpenURL);
    AppState.addEventListener('change', handleAppStateChange);
    DeviceEventEmitter.addListener('quickActionShortcut', walletQuickActions);
    DeviceQuickActions.popInitialAction().then(popInitialAction);
    EventEmitter?.getMostRecentUserActivity()
      .then(onUserActivityOpen)
      .catch(() => console.log('No userActivity object sent'));
    handleAppStateChange(undefined);
    /*
      When a notification on iOS is shown while the app is on foreground;
      On willPresent on AppDelegate.m
     */
    eventEmitter?.addListener('onNotificationReceived', onNotificationReceived);
    eventEmitter?.addListener('openSettings', openSettings);
    eventEmitter?.addListener('onUserActivityOpen', onUserActivityOpen);
  };

  const popInitialAction = async data => {
    if (data) {
      const wallet = wallets.find(w => w.getID() === data.userInfo.url.split('wallet/')[1]);
      NavigationService.dispatch(
        CommonActions.navigate({
          name: 'WalletTransactions',
          key: `WalletTransactions-${wallet.getID()}`,
          params: {
            walletID: wallet.getID(),
            walletType: wallet.type,
          },
        }),
      );
    } else {
      const url = await Linking.getInitialURL();
      if (url) {
        if (DeeplinkSchemaMatch.hasSchema(url)) {
          handleOpenURL({ url });
        }
      } else {
        const isViewAllWalletsEnabled = await OnAppLaunch.isViewAllWalletsEnabled();
        if (!isViewAllWalletsEnabled) {
          const selectedDefaultWallet = await OnAppLaunch.getSelectedDefaultWallet();
          const wallet = wallets.find(w => w.getID() === selectedDefaultWallet.getID());
          if (wallet) {
            NavigationService.dispatch(
              CommonActions.navigate({
                name: 'WalletTransactions',
                key: `WalletTransactions-${wallet.getID()}`,
                params: {
                  walletID: wallet.getID(),
                  walletType: wallet.type,
                },
              }),
            );
          }
        }
      }
    }
  };

  const walletQuickActions = data => {
    const wallet = wallets.find(w => w.getID() === data.userInfo.url.split('wallet/')[1]);
    NavigationService.dispatch(
      CommonActions.navigate({
        name: 'WalletTransactions',
        key: `WalletTransactions-${wallet.getID()}`,
        params: {
          walletID: wallet.getID(),
          walletType: wallet.type,
        },
      }),
    );
  };

  /**
   * Processes push notifications stored in AsyncStorage. Might navigate to some screen.
   *
   * @returns {Promise<boolean>} returns TRUE if notification was processed _and acted_ upon, i.e. navigation happened
   * @private
   */
  const processPushNotifications = async () => {
    if (!walletsInitialized) {
      console.log('not processing push notifications because wallets are not initialized');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    // sleep needed as sometimes unsuspend is faster than notification module actually saves notifications to async storage
    const notifications2process = await Notifications.getStoredNotifications();

    await Notifications.clearStoredNotifications();
    Notifications.setApplicationIconBadgeNumber(0);
    const deliveredNotifications = await Notifications.getDeliveredNotifications();
    setTimeout(() => Notifications.removeAllDeliveredNotifications(), 5000); // so notification bubble wont disappear too fast

    for (const payload of notifications2process) {
      const wasTapped = payload.foreground === false || (payload.foreground === true && payload.userInteraction);

      console.log('processing push notification:', payload);
      let wallet;
      switch (+payload.type) {
        case 2:
        case 3:
          wallet = wallets.find(w => w.weOwnAddress(payload.address));
          break;
        case 1:
        case 4:
          wallet = wallets.find(w => w.weOwnTransaction(payload.txid || payload.hash));
          break;
      }

      if (wallet) {
        const walletID = wallet.getID();
        fetchAndSaveWalletTransactions(walletID);
        if (wasTapped) {
          if (payload.type !== 3 || wallet.chain === Chain.OFFCHAIN) {
            NavigationService.dispatch(
              CommonActions.navigate({
                name: 'WalletTransactions',
                key: `WalletTransactions-${wallet.getID()}`,
                params: {
                  walletID,
                  walletType: wallet.type,
                },
              }),
            );
          } else {
            NavigationService.navigate('ReceiveDetailsRoot', {
              screen: 'ReceiveDetails',
              params: {
                walletID,
                address: payload.address,
              },
            });
          }

          return true;
        }
      } else {
        console.log('could not find wallet while processing push notification, NOP');
      }
    } // end foreach notifications loop

    if (deliveredNotifications.length > 0) {
      // notification object is missing userInfo. We know we received a notification but don't have sufficient
      // data to refresh 1 wallet. let's refresh all.
      refreshAllWalletTransactions();
    }

    // if we are here - we did not act upon any push
    return false;
  };

  const handleAppStateChange = async nextAppState => {
    //if (wallets.length === 0) return;
    if (nextAppState === 'inactive') {
      navigate('BlankPage');
    } 
    else {
      if (canGoBack()) {
        navigate('Entry'); //PROBLEM: You might have to enter password twice if you go into app switcher and go home
      }
    }
    if ((appState.current.match(/background/) && nextAppState === 'active')) {
      setTimeout(() => A(A.ENUM.APP_UNSUSPENDED), 2000);
      currency.updateExchangeRate();
      const processed = await processPushNotifications();
      if (processed) return;
      const clipboard = await BlueClipboard().getClipboardContent();
      const isAddressFromStoredWallet = wallets.some(wallet => {
        if (wallet.chain === Chain.ONCHAIN) {
          // checking address validity is faster than unwrapping hierarchy only to compare it to garbage
          return wallet.isAddressValid && wallet.isAddressValid(clipboard) && wallet.weOwnAddress(clipboard);
        } else {
          return wallet.isInvoiceGeneratedByWallet(clipboard) || wallet.weOwnAddress(clipboard);
        }
      });
      const isBitcoinAddress = DeeplinkSchemaMatch.isBitcoinAddress(clipboard);
      const isLightningInvoice = DeeplinkSchemaMatch.isLightningInvoice(clipboard);
      const isLNURL = DeeplinkSchemaMatch.isLnUrl(clipboard);
      const isBothBitcoinAndLightning = DeeplinkSchemaMatch.isBothBitcoinAndLightning(clipboard);
      if (
        !isAddressFromStoredWallet &&
        clipboardContent.current !== clipboard &&
        (isBitcoinAddress || isLightningInvoice || isLNURL || isBothBitcoinAndLightning)
      ) {
        let contentType;
        if (isBitcoinAddress) {
          contentType = ClipboardContentType.BITCOIN;
        } else if (isLightningInvoice || isLNURL) {
          contentType = ClipboardContentType.LIGHTNING;
        } else if (isBothBitcoinAndLightning) {
          contentType = ClipboardContentType.BITCOIN;
        }
        showClipboardAlert({ contentType });
      }
      clipboardContent.current = clipboard;
    }
    
    appState.current = nextAppState;
  };

  const handleOpenURL = event => {
    DeeplinkSchemaMatch.navigationRouteFor(event, value => NavigationService.navigate(...value), { wallets, addWallet, saveToDisk });
  };

  const showClipboardAlert = ({ contentType }) => {
    ReactNativeHapticFeedback.trigger('impactLight', { ignoreAndroidSystemSettings: false });
    BlueClipboard()
      .getClipboardContent()
      .then(clipboard => {
        if (Platform.OS === 'ios' || Platform.OS === 'macos') {
          ActionSheet.showActionSheetWithOptions(
            {
              options: [loc._.cancel, loc._.continue],
              title: loc._.clipboard,
              message: contentType === ClipboardContentType.BITCOIN ? loc.wallets.clipboard_bitcoin : loc.wallets.clipboard_lightning,
              cancelButtonIndex: 0,
            },
            buttonIndex => {
              if (buttonIndex === 1) {
                handleOpenURL({ url: clipboard });
              }
            },
          );
        } else {
          ActionSheet.showActionSheetWithOptions({
            buttons: [
              { text: loc._.cancel, style: 'cancel', onPress: () => {} },
              {
                text: loc._.continue,
                style: 'default',
                onPress: () => {
                  handleOpenURL({ url: clipboard });
                },
              },
            ],
            title: loc._.clipboard,
            message: contentType === ClipboardContentType.BITCOIN ? loc.wallets.clipboard_bitcoin : loc.wallets.clipboard_lightning,
          });
        }
      });
  };

  return (
    <SafeAreaProvider>
      <View style={{flex: 1}}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
        <NavigationContainer ref={navigationRef} theme={colorScheme === 'dark' ? BlueDarkTheme : BlueDefaultTheme}>
            <Layout />
            <Notifications onProcessNotifications={processPushNotifications} />
        </NavigationContainer>
        {walletsInitialized && !isDesktop && <WatchConnectivity />}
      </View>
      <DeviceQuickActions />
      <Biometric />
      <WidgetCommunication />
      <Privacy />
    </SafeAreaProvider>
  );
};

export default App;
