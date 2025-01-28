import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import {
  Alert,
  Dimensions,
  InteractionManager,
  PixelRatio,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  findNodeHandle,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute, useNavigation, useTheme, useFocusEffect } from '@react-navigation/native';
import { Chain } from '../../../models/bitcoinUnits';
import { BlueAlertWalletExportReminder } from '../../../../BlueComponents';
import navigationStyle from '../../../components/navigationStyle';
import ActionSheet from '../../ActionSheet';
import loc from '../../../loc';
import { BlueStorageContext } from '../../../custom-modules/storage-context';
import { isDesktop } from '../../../custom-modules/environment';
import BlueClipboard from '../../../custom-modules/clipboard';
import LNNodeBar from '../../../components/LNNodeBar';
import TransactionsNavigationHeader, { actionKeys } from '../../../components/TransactionsNavigationHeader';
import alert from '../../../components/Alert';
import PropTypes from 'prop-types';
import { defaultStyles } from '../../../components/defaultStyles';

import RoundButton from '../../../components/button-round';
import TooltipMenu from '../../../components/TooltipMenu';

import {
  HDSegwitBech32Wallet,
  SegwitP2SHWallet,
  LegacyWallet,
  SegwitBech32Wallet,
  WatchOnlyWallet,
  MultisigHDWallet,
  HDAezeedWallet,
  LightningLdkWallet,
  LightningCustodianWallet,
} from '../../../class';
import { AbstractHDElectrumWallet } from '../../../class/wallets/abstract-hd-electrum-wallet';
import TransactionList from '../../../components/list-transactions';



const fs = require('../../../custom-modules/fs');

const WalletTransactions = ({ navigation }) => {
  const { wallets, saveToDisk } = useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(false);
  const { walletID } = useRoute().params;
  const { name } = useRoute();
  //const wallet = wallets.find(w => w.getID() === walletID);
  const wallet = useRef(wallets.find(w => w.getID() === walletID)).current;
  
  const [itemPriceUnit, setItemPriceUnit] = useState(wallet.getPreferredBalanceUnit());
  const { setOptions, navigate } = useNavigation();
  const { colors } = useTheme();
  const [lnNodeInfo, setLnNodeInfo] = useState({ canReceive: 0, canSend: 0 });
  const walletActionButtonsRef = useRef();
  const walletTransactionsLength = useMemo(() => wallet.getTransactions().length, [wallet]);
  

  const styles = StyleSheet.create({
    flex: {
      flex: 1,
    },
    browserButton2: {
      borderRadius: 9,
      minHeight: 49,
      paddingHorizontal: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      alignSelf: 'auto',
      flexGrow: 1,
      marginHorizontal: 4,
      backgroundColor: colors.element,
    },
    marketpalceText1: {
      fontSize: 18,
      color: colors.foreground,
    },
    list: {
      backgroundColor: colors.background,
    },
    emptyTxsLightning: {
      fontSize: 18,
      color: '#9aa0aa',
      textAlign: 'center',
      fontWeight: '600',
    },
    marginHorizontal18: {
      marginHorizontal: 18,
    },
  });

  const handleExportTransactions = async () => {
    let csvFile = [
      loc.transactions.date,
      loc.transactions.txid,
      `${loc.send.create_amount} (${BitcoinUnit.BTC})`,
      loc.send.create_memo,
    ].join(','); // CSV header
    const transactions = wallet.getTransactions();

    for (const transaction of transactions) {
      const value = formatBalanceWithoutSuffix(transaction.value, BitcoinUnit.BTC, true);

      let hash = transaction.hash;
      let memo = txMetadata[transaction.hash]?.memo?.trim() ?? '';

      if (wallet.chain === Chain.OFFCHAIN) {
        hash = transaction.payment_hash;
        memo = transaction.description;

        if (hash?.type === 'Buffer' && hash?.data) {
          const bb = Buffer.from(hash);
          hash = bb.toString('hex');
        }
      }
      csvFile += '\n' + [new Date(transaction.received).toString(), hash, value, memo].join(','); // CSV line
    }

    await writeFileAndExport(`${wallet.label.replace(' ', '-')}-history.csv`, csvFile);
  };

  const handleDelete = () => {
    ReactNativeHapticFeedback.trigger('notificationWarning', { ignoreAndroidSystemSettings: false });
    Alert.alert(
      loc.wallets.details_delete_wallet,
      loc.wallets.details_are_you_sure,
      [
        {
          text: loc.wallets.details_yes_delete,
          onPress: async () => {
            const isBiometricsEnabled = await Biometric.isBiometricUseCapableAndEnabled();

            if (isBiometricsEnabled) {
              if (!(await Biometric.unlockWithBiometrics())) {
                return;
              }
            }
            if (wallet.getBalance() > 0 && wallet.allowSend()) {
              presentWalletHasBalanceAlert();
            } else {
              navigateToOverviewAndDeleteWallet();
            }
          },
          style: 'destructive',
        },
        { text: loc.wallets.details_no_cancel, onPress: () => {}, style: 'cancel' },
      ],
      { cancelable: false },
    );
  };

  const headerRightOnPress = id => {
    if (id === 'Settings') {
      navigate('WalletSettings', {
        walletID: wallet.getID(),
      });
    }
    else if (id === 'Addresses') {
      navigate('WalletAddresses', {
        walletID: wallet.getID(),
      });
    } else if (id === 'Export') {
      navigate('WalletExportRoot', {
        screen: 'WalletExport',
        params: {
          walletID: wallet.getID(),
        },
      });
    } else if (id === 'Transaction') {
      handleExportTransactions();
    } else if (id === 'Coordination') {
      navigate('ExportMultisigCoordinationSetupRoot', {
        screen: 'ExportMultisigCoordinationSetup',
        params: {
          walletId: wallet.getID(),
        },
      });
    } else if (id === 'Cosigners') {
      navigate('ViewEditMultisigCosignersRoot', {
        screen: 'ViewEditMultisigCosigners',
        params: {
          walletId: wallet.getID(),
        },
      });
    } else if (id === 'XPub') {
      navigate('WalletXpubRoot', {
        screen: 'WalletXpub',
        params: {
          walletID,
        }});
    } else if (id === 'SignVerify') {
      navigate('SignVerifyRoot', {
        screen: 'SignVerify',
        params: {
          walletID: wallet.getID(),
          address: wallet.getAllExternalAddresses()[0], // works for both single address and HD wallets
        },
      });
    } else if (id === 'LdkLogs') {
      navigate('LdkViewLogs', {
        walletID,
      });
    } else if (id === 'Delete') {
      handleDelete();
    }
  };

  const headerRightActions = () => {
    const actions = [];
    actions.push(
      {
        id: 'Settings',
        text: 'Settings',
        icon: { iconType: 'SYSTEM', iconValue: 'gear' }
      }
    );
    // if (wallet instanceof AbstractHDElectrumWallet || (wallet.type === WatchOnlyWallet.type && wallet.isHd())) {
    //   actions.push(
    //     {
    //       id: 'Addresses',
    //       text: loc.wallets.details_show_addresses,
    //       icon: { iconType: 'SYSTEM', iconValue: 'creditcard' }
    //     },
    //   );
    // }
    // actions.push(
    //   {
    //     id: 'Export',
    //     text: loc.wallets.details_export_backup,
    //     icon: { iconType: 'SYSTEM', iconValue: 'square.and.arrow.up' },
    //   },
    // );
    if (walletTransactionsLength > 0) {
      actions.push(
        {
          id: 'Transactions',
          text: loc.wallets.details_export_history,
          icon: { iconType: 'SYSTEM', iconValue: 'clock' },
        },
      );
    }
    if (wallet.type === MultisigHDWallet.type) {
      actions.push(
        {
          id: 'Coordination',
          text: loc.multisig.export_coordination_setup.replace(/^\w/, c => c.toUpperCase()),
          icon: { iconType: 'SYSTEM', iconValue: 'person.2.fill' },
        },
        {
          id: 'Cosigners',
          text: loc.multisig.view_edit_cosigners,
          icon: { iconType: 'SYSTEM', iconValue: 'person.fill.checkmark' },
        },
      );
    }
    // if (wallet.allowXpub()) {
    //   actions.push(
    //     {
    //       id: 'XPub',
    //       text: loc.wallets.details_show_xpub,
    //       icon: { iconType: 'SYSTEM', iconValue: 'qrcode.viewfinder' },
    //     },
    //   );
    // }
    // if (wallet.allowSignVerifyMessage()) {
    //   actions.push(
    //     {
    //       id: 'SignVerify',
    //       text: loc.addresses.sign_title,
    //       icon: { iconType: 'SYSTEM', iconValue: 'signature' },
    //     },
    //   );
    // }
    if (wallet.type === LightningLdkWallet.type) {
      actions.push(
        {
          id: 'LdkLogs',
          text: loc.lnd.view_logs,
          icon: { iconType: 'SYSTEM', iconValue: 'doc.text' },
        },
      );
    }
    actions.push(
      {
        id: 'Delete',
        text: loc.wallets.details_delete,
        icon: { iconType: 'SYSTEM', iconValue: 'trash' },
      },
    );

    return actions;
  };

  useEffect(() => {
    setIsLoading(true);
    setOptions({
      headerTitle: wallet.getLabel(),
      headerRight: () => (
        <TooltipMenu
          isButton
          isMenuPrimaryAction
          onPressMenuItem={headerRightOnPress}
          actions={headerRightActions()}
        >
          <RoundButton size={32} icon="more-horizontal"/>
        </TooltipMenu>
      ),
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletID]);


  const isLightning = () => {
    const w = wallet;
    if (w && w.chain === Chain.OFFCHAIN) {
      return true;
    }

    return false;
  };

  const refreshLnNodeInfo = () => {
    if (wallet.type === LightningLdkWallet.type) {
      setLnNodeInfo({ canReceive: wallet.getReceivableBalance(), canSend: wallet.getBalance() });
    }
  };

  const renderLappBrowserButton = () => {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => {
          navigate('LappBrowserRoot', {
            screen: 'LappBrowser',
            params: {
              walletID,
              url: 'https://duckduckgo.com',
            },
          });
        }}
        style={styles.browserButton2}
      >
        <Text style={styles.marketpalceText1}>{loc.wallets.list_ln_browser}</Text>
      </TouchableOpacity>
    );
  };

  const onWalletSelect = async selectedWallet => {
    if (selectedWallet) {
      navigate('WalletTransactions', {
        walletType: wallet.type,
        walletID: wallet.getID(),
        key: `WalletTransactions-${wallet.getID()}`,
      });
      /** @type {LightningCustodianWallet} */
      let toAddress = false;
      if (wallet.refill_addressess.length > 0) {
        toAddress = wallet.refill_addressess[0];
      } else {
        try {
          await wallet.fetchBtcAddress();
          toAddress = wallet.refill_addressess[0];
        } catch (Err) {
          return alert(Err.message);
        }
      }
      navigate('SendDetails',
        {
          memo: loc.lnd.refill_lnd_balance,
          address: toAddress,
          walletID: selectedWallet.getID(),
        },
      );
    }
  };
  const navigateToSendScreen = () => {
    navigate('SendDetails',
      {
        walletID: wallet.getID(),
      },
    );
  };

  const onBarCodeRead = ret => {
    if (!isLoading) {
      setIsLoading(true);
      const params = {
        walletID: wallet.getID(),
        uri: ret.data ? ret.data : ret,
      };
      if (wallet.chain === Chain.ONCHAIN) {
        navigate('SendDetails', params);
      } else {
        navigate('ScanLndInvoiceRoot', { screen: 'ScanLndInvoice', params });
      }
    }
    setIsLoading(false);
  };

  const choosePhoto = () => {
    fs.showImagePickerAndReadImage().then(onBarCodeRead);
  };

  const copyFromClipboard = async () => {
    onBarCodeRead({ data: await BlueClipboard().getClipboardContent() });
  };

  const sendButtonPress = () => {
    if (wallet.chain === Chain.OFFCHAIN) {
      return navigate('ScanLndInvoiceRoot', { screen: 'ScanLndInvoice', params: { walletID: wallet.getID() } });
    }

    if (wallet.type === WatchOnlyWallet.type && wallet.isHd() && !wallet.useWithHardwareWalletEnabled()) {
      return Alert.alert(
        loc.wallets.details_title,
        loc.transactions.enable_offline_signing,
        [
          {
            text: loc._.ok,
            onPress: async () => {
              wallet.setUseWithHardwareWalletEnabled(true);
              await saveToDisk();
              navigateToSendScreen();
            },
            style: 'default',
          },

          { text: loc._.cancel, onPress: () => {}, style: 'cancel' },
        ],
        { cancelable: false },
      );
    }

    navigateToSendScreen();
  };

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
            choosePhoto();
          } else if (buttonIndex === 2) {
            navigate('ScanQRCodeRoot', {
              screen: 'ScanQRCode',
              params: {
                launchedBy: name,
                onBarScanned: onBarCodeRead,
                showFileImportButton: false,
              },
            });
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
          onPress: choosePhoto,
        },
        {
          text: loc.wallets.list_long_scan,
          onPress: () =>
            navigate('ScanQRCodeRoot', {
              screen: 'ScanQRCode',
              params: {
                launchedBy: name,
                onBarScanned: onBarCodeRead,
                showFileImportButton: false,
              },
            }),
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

  const navigateToViewEditCosigners = () => {
    navigate('ViewEditMultisigCosignersRoot', {
      screen: 'ViewEditMultisigCosigners',
      params: {
        walletId: wallet.getID(),
      },
    });
  };

  const onManageFundsPressed = ({ id }) => {
    if (id === actionKeys.Refill) {
      const availableWallets = [...wallets.filter(item => item.chain === Chain.ONCHAIN && item.allowSend())];
      if (availableWallets.length === 0) {
        alert(loc.lnd.refill_create);
      } else {
        navigate('SelectWallet', { onWalletSelect, chainType: Chain.ONCHAIN });
      }
    } else if (id === actionKeys.RefillWithExternalWallet) {
      if (wallet.getUserHasSavedExport()) {
        navigate('ReceiveDetailsRoot', { walletID: wallet.getID() });
      }
    }
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle="default" animated />
      <TransactionsNavigationHeader
        navigation={navigation}
        wallet={wallet}
        onWalletUnitChange={passedWallet =>
          InteractionManager.runAfterInteractions(async () => {
            setItemPriceUnit(passedWallet.getPreferredBalanceUnit());
            saveToDisk();
          })
        }
        onManageFundsPressed={id => {
          if (wallet.type === MultisigHDWallet.type) {
            navigateToViewEditCosigners();
          } else if (wallet.type === LightningLdkWallet.type) {
            navigate('LdkInfo', { walletID: wallet.getID() });
          } else if (wallet.type === LightningCustodianWallet.type) {
            if (wallet.getUserHasSavedExport()) {
              onManageFundsPressed({ id });
            } else {
              BlueAlertWalletExportReminder({
                onSuccess: async () => {
                  wallet.setUserHasSavedExport(true);
                  await saveToDisk();
                  onManageFundsPressed({ id });
                },
                onFailure: () =>
                  navigate('WalletExportRoot', {
                    screen: 'WalletExport',
                    params: {
                      walletID: wallet.getID(),
                    },
                  }),
              });
            }
          }
        }}
      />
      <View 
        ref={walletActionButtonsRef}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 48,
        }}
      >
        {(wallet.allowSend() || (wallet.type === WatchOnlyWallet.type && wallet.isHd())) && (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <RoundButton
              label="Send"
              size={64}
              icon="arrow-up"
              action={sendButtonPress}
            />
            <Text
              style={defaultStyles.bodyText}
            >
              Send
            </Text>
          </View>
        )}
        {wallet.allowReceive() && (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <RoundButton
              label="Send"
              size={64}
              icon="arrow-down"
              action={
                () => {
                  if (wallet.chain === Chain.OFFCHAIN) {
                    navigate('LNDCreateInvoiceRoot', { screen: 'LNDCreateInvoice', params: { walletID: wallet.getID() } });
                  } else {
                    navigate('ReceiveDetailsRoot', { walletID: wallet.getID() } );
                  }
                }
              }
            />
            <Text
              style={defaultStyles.bodyText}
            >
              Receive
            </Text>
          </View>
        )}
      </View>
      <TransactionList
        walletID={walletID}
      />
    </View>
  );
};

export default WalletTransactions;

WalletTransactions.navigationOptions = navigationStyle({}, opts => ({ ...opts }));

WalletTransactions.propTypes = {
  navigation: PropTypes.shape(),
};