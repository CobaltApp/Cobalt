import React, { useEffect, useState, useCallback, useContext, useRef, useMemo, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Switch,
  Platform,
  Linking,
  StyleSheet,
  StatusBar,
  ScrollView,
  PermissionsAndroid,
  InteractionManager,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { BlueCard, BlueLoading, BlueSpacing10, BlueSpacing20, BlueText, SecondButton, BlueListItem } from '../../BlueComponents';
import navigationStyle from '../../components/navigationStyle';
import { LightningCustodianWallet } from '../../class/wallets/lightning-custodian-wallet';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Biometric from '../../class/biometrics';
import {
  HDSegwitBech32Wallet,
  SegwitP2SHWallet,
  LegacyWallet,
  SegwitBech32Wallet,
  WatchOnlyWallet,
  MultisigHDWallet,
  HDAezeedWallet,
  LightningLdkWallet,
} from '../../class';
import { Icon } from 'react-native-elements';
import loc, { formatBalanceWithoutSuffix } from '../../loc';
import { useTheme, useRoute, useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import Notifications from '../../blue_modules/notifications';
import { isDesktop } from '../../blue_modules/environment';
import { AbstractHDElectrumWallet } from '../../class/wallets/abstract-hd-electrum-wallet';
import alert from '../../components/Alert';
import { BitcoinUnit, Chain } from '../../models/bitcoinUnits';
import { writeFileAndExport } from '../../blue_modules/fs';
import { defaultStyles } from '../../components/defaultStyles';
import TooltipMenu from '../../components/TooltipMenu';

const prompt = require('../../helpers/prompt');

const WalletDetails = () => {
  const { saveToDisk, wallets, deleteWallet, setSelectedWallet, txMetadata } = useContext(BlueStorageContext);
  const { walletID } = useRoute().params;
  const [isLoading, setIsLoading] = useState(false);
  const [backdoorPressed, setBackdoorPressed] = useState(0);
  const [backdoorBip47Pressed, setBackdoorBip47Pressed] = useState(0);
  const wallet = useRef(wallets.find(w => w.getID() === walletID)).current;
  const [walletName, setWalletName] = useState(wallet.getLabel());
  const [useWithHardwareWallet, setUseWithHardwareWallet] = useState(wallet.useWithHardwareWalletEnabled());
  const { isAdvancedModeEnabled } = useContext(BlueStorageContext);
  const [isAdvancedModeEnabledRender, setIsAdvancedModeEnabledRender] = useState(false);
  const [isBIP47Enabled, setIsBIP47Enabled] = useState(wallet.isBIP47Enabled());
  const [hideTransactionsInWalletsList, setHideTransactionsInWalletsList] = useState(!wallet.getHideTransactionsInWalletsList());
  const { goBack, navigate, setOptions, popToTop } = useNavigation();
  const { colors } = useTheme();
  const menuRef = useRef();
  const [masterFingerprint, setMasterFingerprint] = useState();
  const walletTransactionsLength = useMemo(() => wallet.getTransactions().length, [wallet]);
  // const derivationPath = useMemo(() => {
  //   try {
  //     const path = wallet.getDerivationPath();
  //     return path.length > 0 ? path : null;
  //   } catch (e) {
  //     return null;
  //   }
  // }, [wallet]);
  const [lightningWalletInfo, setLightningWalletInfo] = useState({});

  // useEffect(() => {
  //   if (isAdvancedModeEnabledRender && wallet.allowMasterFingerprint()) {
  //     InteractionManager.runAfterInteractions(() => {
  //       setMasterFingerprint(wallet.getMasterFingerprintHex());
  //     });
  //   }
  // }, [isAdvancedModeEnabledRender, wallet]);
  const styles = StyleSheet.create({
    scrollViewContent: {
      //flexGrow: 1,
      flex: 1,
    },
    address: {
      alignItems: 'center',
      flex: 1,
    },
    textLabel1: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 16,
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    },
    textLabel2: {
      color: colors.foreground,
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    },
    textValue: {
      color: colors.foregroundInactive,
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      //marginBottom: 12,
    },
    input: {
      flexDirection: 'row',
      minHeight: 55,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 24,
      borderRadius: 25,
      marginBottom: 24,
      borderColor: colors.element,
      backgroundColor: colors.card,
    },
    inputText: {
      flex: 1,
      marginHorizontal: 8,
      minHeight: 33,
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    },
    hardware: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: -8,
      marginBottom: 18,
    },
    delete: {
      color: "#FFFFFF",
      fontFamily: 'Poppins-Regular',
      fontSize: 16,
      textAlign: 'center',
      marginLeft: 12,
    },
    column: {
      flexDirection: 'column',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    save: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
      borderRadius: 8,
      height: 34,
      backgroundColor: colors.primary,
    },
    saveText: {
      color: colors.background,
      fontFamily: 'Poppins-Regular',
      fontSize: 15,
    },
  });
  useEffect(() => {
    if (wallet.type === LightningLdkWallet.type) {
      wallet.getInfo().then(setLightningWalletInfo);
    }
  }, [wallet]);

  const save = () => {
    setIsLoading(true);
    if (walletName.trim().length > 0) {
      wallet.setLabel(walletName.trim());
      if (wallet.type === WatchOnlyWallet.type && wallet.isHd()) {
        wallet.setUseWithHardwareWalletEnabled(useWithHardwareWallet);
      }
      wallet.setHideTransactionsInWalletsList(!hideTransactionsInWalletsList);
      if (wallet.allowBIP47()) {
        wallet.switchBIP47(isBIP47Enabled);
      }
    }
    saveToDisk()
      .then(() => {
        alert(loc.wallets.details_wallet_updated);
        goBack();
      })
      .catch(error => {
        console.log(error.message);
        setIsLoading(false);
      });
  };

  const headerRightOnPress = id => {
    if (id === WalletDetails.actionKeys.ShowAddresses) {
      navigateToAddresses();
    } else if (id === WalletDetails.actionKeys.WalletExport) {
      navigateToWalletExport();
    } else if (id === WalletDetails.actionKeys.ExportHistory) {
      onExportHistoryPressed();
    } else if (id === WalletDetails.actionKeys.MultisigCoordination) {
      navigateToMultisigCoordinationSetup();
    } else if (id === WalletDetails.actionKeys.EditCosigners) {
      navigateToViewEditCosigners();
    } else if (id === WalletDetails.actionKeys.XPub) {
      navigateToXPub();
    } else if (id === WalletDetails.actionKeys.SignVerify) {
      navigateToSignVerify();
    } else if (id === WalletDetails.actionKeys.LdkLogs) {
      navigateToLdkViewLogs();
    } else if (id === WalletDetails.actionKeys.DeleteButton) {
      handleDeleteButtonTapped();
    }
  };

  const headerRightActions = () => {
    const actions = [];
    if (wallet instanceof AbstractHDElectrumWallet || (wallet.type === WatchOnlyWallet.type && wallet.isHd())) {
      actions.push(
        {
          id: WalletDetails.actionKeys.ShowAddresses,
          text: loc.wallets.details_show_addresses,
          icon: WalletDetails.actionIcons.Address,
        },
      );
    }
    actions.push(
      {
        id: WalletDetails.actionKeys.WalletExport,
        text: loc.wallets.details_export_backup,
        icon: WalletDetails.actionIcons.Export,
      },
    );
    if (walletTransactionsLength > 0) {
      actions.push(
        {
          id: WalletDetails.actionKeys.ExportHistory,
          text: loc.wallets.details_export_history,
          icon: WalletDetails.actionIcons.History,
        },
      );
    }
    if (wallet.type === MultisigHDWallet.type) {
      actions.push(
        {
          id: WalletDetails.actionKeys.MultisigCoordination,
          text: loc.multisig.export_coordination_setup.replace(/^\w/, c => c.toUpperCase()),
          icon: WalletDetails.actionIcons.Multisig,
        },
        {
          id: WalletDetails.actionKeys.EditCosigners,
          text: loc.multisig.view_edit_cosigners,
          icon: WalletDetails.actionIcons.EditMultisig,
        },
      );
    }
    if (wallet.allowXpub()) {
      actions.push(
        {
          id: WalletDetails.actionKeys.XPub,
          text: loc.wallets.details_show_xpub,
          icon: WalletDetails.actionIcons.XPub,
        },
      );
    }
    if (wallet.allowSignVerifyMessage()) {
      actions.push(
        {
          id: WalletDetails.actionKeys.SignVerify,
          text: loc.addresses.sign_title,
          icon: WalletDetails.actionIcons.Sign,
        },
      );
    }
    if (wallet.type === LightningLdkWallet.type) {
      actions.push(
        {
          id: WalletDetails.actionKeys.LdkLogs,
          text: loc.lnd.view_logs,
          icon: WalletDetails.actionIcons.LdkLogs,
        },
      );
    }
    actions.push(
      {
        id: WalletDetails.actionKeys.DeleteButton,
        text: loc.wallets.details_delete,
        icon: WalletDetails.actionIcons.Delete,
      },
    );

    return actions;
  };

  useLayoutEffect(() => {
    isAdvancedModeEnabled().then(setIsAdvancedModeEnabledRender);

    setOptions({
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTitleStyle: {
        fontFamily: 'Poppins',
        fontWeight: '500',
        fontSize: 18,
        color: colors.foreground,
      },
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft: () => (
        <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: 44,
          width: 44,
          borderRadius: 22,
          backgroundColor: colors.card,
        }}
        onPress={() =>
          goBack()
        }
      >
        <Icon name="arrow-left" type="feather" size={24} color={colors.foreground} />
      </TouchableOpacity>
      ),
      headerRight: () => (
        <TooltipMenu
          isButton
          isMenuPrimaryAction
          onPressMenuItem={headerRightOnPress}
            actions={headerRightActions()}
          //onPressMenuItem={onToolTipPress}
        >
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 44,
              width: 44,
              borderRadius: 22,
              backgroundColor: colors.card,
            }}
            //onPress={onToolTipPress}
          >
            <Icon name="more-horizontal" type="feather" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </TooltipMenu>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, colors, walletName, useWithHardwareWallet, hideTransactionsInWalletsList, isBIP47Enabled]);

  useEffect(() => {
    if (wallets.some(w => w.getID() === walletID)) {
      setSelectedWallet(walletID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletID]);

  const navigateToOverviewAndDeleteWallet = () => {
    setIsLoading(true);
    let externalAddresses = [];
    try {
      externalAddresses = wallet.getAllExternalAddresses();
    } catch (_) {}
    Notifications.unsubscribe(externalAddresses, [], []);
    popToTop();
    deleteWallet(wallet);
    saveToDisk(true);
    ReactNativeHapticFeedback.trigger('notificationSuccess', { ignoreAndroidSystemSettings: false });
  };

  const presentWalletHasBalanceAlert = useCallback(async () => {
    ReactNativeHapticFeedback.trigger('notificationWarning', { ignoreAndroidSystemSettings: false });
    try {
      const walletBalanceConfirmation = await prompt(
        loc.wallets.details_delete_wallet,
        loc.formatString(loc.wallets.details_del_wb_q, { balance: wallet.getBalance() }),
        true,
        'plain-text',
        true,
        loc.wallets.details_delete,
      );
      if (Number(walletBalanceConfirmation) === wallet.getBalance()) {
        navigateToOverviewAndDeleteWallet();
      } else {
        ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
        setIsLoading(false);
        alert(loc.wallets.details_del_wb_err);
      }
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToWalletExport = () => {
    navigate('WalletExportRoot', {
      screen: 'WalletExport',
      params: {
        walletID: wallet.getID(),
      },
    });
  };
  const navigateToMultisigCoordinationSetup = () => {
    navigate('ExportMultisigCoordinationSetupRoot', {
      screen: 'ExportMultisigCoordinationSetup',
      params: {
        walletId: wallet.getID(),
      },
    });
  };
  const navigateToViewEditCosigners = () => {
    navigate('ViewEditMultisigCosignersRoot', {
      screen: 'ViewEditMultisigCosigners',
      params: {
        walletId: wallet.getID(),
      },
    });
  };
  const navigateToXPub = () =>
    navigate('WalletXpubRoot', {
      screen: 'WalletXpub',
      params: {
        walletID,
      },
    });
  const navigateToSignVerify = () =>
    navigate('SignVerifyRoot', {
      screen: 'SignVerify',
      params: {
        walletID: wallet.getID(),
        address: wallet.getAllExternalAddresses()[0], // works for both single address and HD wallets
      },
    });
  const navigateToLdkViewLogs = () => {
    navigate('LdkViewLogs', {
      walletID,
    });
  };

  const navigateToAddresses = () =>
    navigate('WalletAddresses', {
      walletID: wallet.getID(),
    });

  const navigateToPaymentCodes = () =>
    navigate('PaymentCodeRoot', {
      screen: 'PaymentCodesList',
      params: {
        walletID: wallet.getID(),
      },
    });

  const exportInternals = async () => {
    if (backdoorPressed < 10) return setBackdoorPressed(backdoorPressed + 1);
    setBackdoorPressed(0);
    if (wallet.type !== HDSegwitBech32Wallet.type) return;
    const fileName = 'wallet-externals.json';
    const contents = JSON.stringify(
      {
        _balances_by_external_index: wallet._balances_by_external_index,
        _balances_by_internal_index: wallet._balances_by_internal_index,
        _txs_by_external_index: wallet._txs_by_external_index,
        _txs_by_internal_index: wallet._txs_by_internal_index,
        _utxo: wallet._utxo,
        next_free_address_index: wallet.next_free_address_index,
        next_free_change_address_index: wallet.next_free_change_address_index,
        internal_addresses_cache: wallet.internal_addresses_cache,
        external_addresses_cache: wallet.external_addresses_cache,
        _xpub: wallet._xpub,
        gap_limit: wallet.gap_limit,
        label: wallet.label,
        _lastTxFetch: wallet._lastTxFetch,
        _lastBalanceFetch: wallet._lastBalanceFetch,
      },
      null,
      2,
    );
    if (Platform.OS === 'ios') {
      const filePath = RNFS.TemporaryDirectoryPath + `/${fileName}`;
      await RNFS.writeFile(filePath, contents);
      Share.open({
        url: 'file://' + filePath,
        saveToFiles: isDesktop,
      })
        .catch(error => {
          console.log(error);
          alert(error.message);
        })
        .finally(() => {
          RNFS.unlink(filePath);
        });
    } else if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
        title: loc.send.permission_storage_title,
        message: loc.send.permission_storage_message,
        buttonNeutral: loc.send.permission_storage_later,
        buttonNegative: loc._.cancel,
        buttonPositive: loc._.ok,
      });

      if (granted === PermissionsAndroid.RESULTS.GRANTED || Platform.Version >= 33) {
        console.log('Storage Permission: Granted');
        const filePath = RNFS.DownloadDirectoryPath + `/${fileName}`;
        try {
          await RNFS.writeFile(filePath, contents);
          alert(loc.formatString(loc.send.txSaved, { filePath: fileName }));
        } catch (e) {
          console.log(e);
          alert(e.message);
        }
      } else {
        console.log('Storage Permission: Denied');
        Alert.alert(loc.send.permission_storage_title, loc.send.permission_storage_denied_message, [
          {
            text: loc.send.open_settings,
            onPress: () => {
              Linking.openSettings();
            },
            style: 'default',
          },
          { text: loc._.cancel, onPress: () => {}, style: 'cancel' },
        ]);
      }
    }
  };

  const purgeTransactions = async () => {
    if (backdoorPressed < 10) return setBackdoorPressed(backdoorPressed + 1);
    setBackdoorPressed(0);
    const msg = 'Transactions purged. Pls go to main screen and back to rerender screen';

    if (wallet.type === HDSegwitBech32Wallet.type) {
      wallet._txs_by_external_index = {};
      wallet._txs_by_internal_index = {};
      alert(msg);
    }

    if (wallet._hdWalletInstance) {
      wallet._hdWalletInstance._txs_by_external_index = {};
      wallet._hdWalletInstance._txs_by_internal_index = {};
      alert(msg);
    }
  };

  const walletNameTextInputOnBlur = () => {
    if (walletName.trim().length === 0) {
      const walletLabel = wallet.getLabel();
      setWalletName(walletLabel);
    }
  };

  const onExportHistoryPressed = async () => {
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

  const handleDeleteButtonTapped = () => {
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

  return (
    <ScrollView
      // contentInsetAdjustmentBehavior="automatic"
      centerContent={isLoading}
      contentContainerStyle={styles.scrollViewContent}
      testID="WalletDetailsScroll"
    >
      {isLoading ? (
        <BlueLoading />
      ) : (
        // <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'space-between',
              marginTop: 32,
              paddingVertical: 32,
              paddingHorizontal: 24,
              borderRadius: 40,
              backgroundColor: colors.element,
            }}
          >
            <View>
              <StatusBar barStyle="default" />
              {(() => {
                if (
                  [LegacyWallet.type, SegwitBech32Wallet.type, SegwitP2SHWallet.type].includes(wallet.type) ||
                  (wallet.type === WatchOnlyWallet.type && !wallet.isHd())
                ) {
                  return (
                    <>
                      <Text style={styles.textLabel1}>{loc.wallets.details_address.toLowerCase()}</Text>
                      <Text style={styles.textValue}>{wallet.getAddress()}</Text>
                    </>
                  );
                }
              })()}
              <View 
                style={{
                  gap: 12,
                  marginBottom: 24,
                }}
              >
              <Text style={styles.textLabel1}>{loc.wallets.add_wallet_name}</Text>
              <KeyboardAvoidingView enabled={!Platform.isPad} behavior={Platform.OS === 'ios' ? 'position' : null}>
                <View style={styles.input}>
                  <TextInput
                    value={walletName}
                    onChangeText={setWalletName}
                    onBlur={walletNameTextInputOnBlur}
                    numberOfLines={1}
                    placeholderTextColor={colors.element}
                    style={{
                      flex: 1,
                      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
                      //color: colors.foreground,
                      color: colors.foreground,
                      fontFamily: 'Poppins',
                      fontWeight: '500',
                      fontSize: 14,
                    }}
                    editable={!isLoading}
                    underlineColorAndroid="transparent"
                    testID="WalletNameInput"
                  />
                </View>
              </KeyboardAvoidingView>
              </View>
              <View style={{ gap: 12, marginBottom: 24 }}>
                <Text style={styles.textLabel1}>{loc.wallets.details_type}</Text>
                <View style={styles.input}>
                  <Text 
                    style={{
                      color: colors.foregroundInactive,
                      fontFamily: 'Poppins',
                      fontWeight: '500',
                      fontSize: 14,
                    }}
                  >{wallet.typeReadable}</Text>
                </View>
              </View>
              {wallet.type === LightningLdkWallet.type && (
                <>
                  <Text style={styles.textLabel2}>{loc.wallets.identity_pubkey}</Text>
                  {lightningWalletInfo?.identityPubkey ? (
                    <>
                      <BlueText>{lightningWalletInfo.identityPubkey}</BlueText>
                    </>
                  ) : (
                    <ActivityIndicator />
                  )}
                </>
              )}
              {wallet.type === MultisigHDWallet.type && (
                <>
                  <Text style={styles.textLabel2}>{loc.wallets.details_multisig_type}</Text>
                  <BlueText>
                    {`${wallet.getM()} / ${wallet.getN()} (${
                      wallet.isNativeSegwit() ? 'native segwit' : wallet.isWrappedSegwit() ? 'wrapped segwit' : 'legacy'
                    })`}
                  </BlueText>
                </>
              )}
              {wallet.type === MultisigHDWallet.type && (
                <>
                  <Text style={styles.textLabel2}>{loc.multisig.how_many_signatures_can_bluewallet_make}</Text>
                  <BlueText>{wallet.howManySignaturesCanWeMake()}</BlueText>
                </>
              )}

              {wallet.type === LightningCustodianWallet.type && (
                <>
                  <Text style={styles.textLabel1}>{loc.wallets.details_connected_to}</Text>
                  <BlueText>{wallet.getBaseURI()}</BlueText>
                </>
              )}

              {wallet.type === HDAezeedWallet.type && (
                <>
                  <Text style={styles.textLabel1}>{loc.wallets.identity_pubkey}</Text>
                  <BlueText>{wallet.getIdentityPubkey()}</BlueText>
                </>
              )}
              <View style={{
                gap: 12,
                marginBottom: 24,
              }}>
                <Text 
                  //onPress={purgeTransactions} 
                  style={styles.textLabel1}
                >
                  {loc.transactions.transactions_count}
                </Text>
              </View>
              <View style={{
                alignItems: 'stretch',
                justifyContent: 'center',
                padding: 24,
                gap: 24,
                borderRadius: 25,
                marginBottom: 24,
                backgroundColor: colors.card,
              }}>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      color: colors.foregroundInactive,
                      fontFamily: 'Poppins',
                      fontWeight: '500',
                      fontSize: 14,
                    }}
                  >
                    Show on Home Page
                  </Text>
                {/* <BlueText style={[styles.textValue, stylesHook.textValue]}>{wallet.getTransactions().length}</BlueText> */}
                {/* <BlueText style={[styles.textLabel1, stylesHook.textLabel1]} onPress={() => setBackdoorBip47Pressed(prevState => prevState + 1)}>{loc.wallets.details_display}</BlueText> */}
                  <Switch value={hideTransactionsInWalletsList} onValueChange={setHideTransactionsInWalletsList} trackColor={{true: colors.primary}} thumbColor={colors.card}/>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      color: colors.foregroundInactive,
                      fontFamily: 'Poppins',
                      fontWeight: '500',
                      fontSize: 14,
                    }}
                  >
                    Count
                  </Text>
                  <Text
                    style={{
                      color: colors.foregroundInactive,
                      fontFamily: 'Poppins',
                      fontWeight: '500',
                      fontSize: 14,
                    }}
                  >
                    {wallet.getTransactions().length}
                  </Text>
                </View>
              </View>
              {backdoorBip47Pressed >= 10 && wallet.allowBIP47() ? (
                <>
                  <Text style={styles.textLabel2}>{loc.bip47.payment_code}</Text>
                  <View style={styles.hardware}>
                    <BlueText>{loc.bip47.purpose}</BlueText>
                    <Switch value={isBIP47Enabled} onValueChange={setIsBIP47Enabled} />
                  </View>
                </>
              ) : null}

                <View>
                  {wallet.type === WatchOnlyWallet.type && wallet.isHd() && (
                    <>
                      <Text style={styles.textLabel2}>{loc.wallets.details_advanced.toLowerCase()}</Text>
                      <View style={styles.hardware}>
                        <BlueText>{loc.wallets.details_use_with_hardware_wallet}</BlueText>
                        <Switch value={useWithHardwareWallet} onValueChange={setUseWithHardwareWallet} />
                      </View>
                    </>
                  )}
                </View>
            </View>
            <View>
              <TouchableOpacity
                accessibilityRole="button"
                testID="Save"
                disabled={isLoading}
                style={defaultStyles.btn}
                onPress={save}
              >
                <Text style={defaultStyles.btnText}>
                  {loc.wallets.details_save}
                </Text>
              </TouchableOpacity>
            </View>
            {wallet.allowBIP47() && isBIP47Enabled && <BlueListItem onPress={navigateToPaymentCodes} title="Show payment codes" chevron />}
          </View>
        // </TouchableWithoutFeedback>
      )}
    </ScrollView>
  );
};

WalletDetails.actionKeys = {
  ShowAddresses: 'ShowAddresses',
  WalletExport: 'WalletExport',
  ExportHistory: 'ExportHistory',
  MultisigCoordination: 'MultisigCoordination',
  EditCosigners: 'EditCosigners',
  XPub: 'XPub',
  SignVerify: 'SignVerify',
  LdkLogs: 'LdkLogs',
  DeleteButton: 'DeleteButton',
};

WalletDetails.actionIcons = {
  Address: { iconType: 'SYSTEM', iconValue: 'creditcard' },
  Export: { iconType: 'SYSTEM', iconValue: 'square.and.arrow.up' },
  History: { iconType: 'SYSTEM', iconValue: 'clock' },
  Multisig: { iconType: 'SYSTEM', iconValue: 'person.2.fill' },
  EditMultsig: { iconType: 'SYSTEM', iconValue: 'person.fill.checkmark' },
  XPub: { iconType: 'SYSTEM', iconValue: 'qrcode.viewfinder' },
  Sign: { iconType: 'SYSTEM', iconValue: 'signature' },
  LdkLogs: { iconType: 'SYSTEM', iconValue: 'doc.text' },
  Delete: { iconType: 'SYSTEM', iconValue: 'trash' },
};

WalletDetails.navigationOptions = navigationStyle({}, opts => ({ ...opts, headerTitle: 'Wallet Settings'}));

export default WalletDetails;
