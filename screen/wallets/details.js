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

const prompt = require('../../helpers/prompt');
const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  address: {
    alignItems: 'center',
    flex: 1,
  },
  textLabel1: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 16,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  textLabel2: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  textValue: {
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
    backgroundColor: '#0A3263',
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
  },
  saveText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
  },
});

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
  const [masterFingerprint, setMasterFingerprint] = useState();
  const walletTransactionsLength = useMemo(() => wallet.getTransactions().length, [wallet]);
  const derivationPath = useMemo(() => {
    try {
      const path = wallet.getDerivationPath();
      return path.length > 0 ? path : null;
    } catch (e) {
      return null;
    }
  }, [wallet]);
  const [lightningWalletInfo, setLightningWalletInfo] = useState({});

  useEffect(() => {
    if (isAdvancedModeEnabledRender && wallet.allowMasterFingerprint()) {
      InteractionManager.runAfterInteractions(() => {
        setMasterFingerprint(wallet.getMasterFingerprintHex());
      });
    }
  }, [isAdvancedModeEnabledRender, wallet]);
  const stylesHook = StyleSheet.create({
    textLabel1: {
      color: colors.foreground,
    },
    textLabel2: {
      color: colors.foreground,
    },
    textValue: {
      color: colors.foregroundInactive,
    },
    input: {
      borderColor: colors.element,
      backgroundColor: '#0A3263',
    },
    save: {
      backgroundColor: colors.primary,
    },
    saveText: {
      color: colors.background,
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
          backgroundColor: '#0A3263',
        }}
        onPress={() =>
          goBack()
        }
      >
        <Icon name="arrow-left" type="feather" size={24} color={'#FFFFFF'} />
      </TouchableOpacity>
      ),
      // headerRight: () => (
      //   <TouchableOpacity
      //     accessibilityRole="button"
      //     testID="Save"
      //     disabled={isLoading}
      //     style={[styles.save, stylesHook.save]}
      //     onPress={save}
      //   >
      //     <Text 
      //       style={{
      //         fontFamily: 'Poppins-Regular',
      //         fontSize: 14,
      //         color: colors.white,
      //       }}
      //     >
      //       {loc.wallets.details_save}
      //     </Text>
      //   </TouchableOpacity>
      // ),
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
      contentInsetAdjustmentBehavior="automatic"
      centerContent={isLoading}
      contentContainerStyle={styles.scrollViewContent}
      testID="WalletDetailsScroll"
    >
      {isLoading ? (
        <BlueLoading />
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            <View
              style={{
                display: 'flex',
                marginTop: 32,
                paddingTop: 32,
                paddingHorizontal: 24,
                borderRadius: 40,
                backgroundColor: colors.element,
              }}
            >
              <StatusBar barStyle="default" />
              {(() => {
                if (
                  [LegacyWallet.type, SegwitBech32Wallet.type, SegwitP2SHWallet.type].includes(wallet.type) ||
                  (wallet.type === WatchOnlyWallet.type && !wallet.isHd())
                ) {
                  return (
                    <>
                      <Text style={[styles.textLabel1, stylesHook.textLabel1]}>{loc.wallets.details_address.toLowerCase()}</Text>
                      <Text style={[styles.textValue, stylesHook.textValue]}>{wallet.getAddress()}</Text>
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
              <Text style={[styles.textLabel1, stylesHook.textLabel1]}>{loc.wallets.add_wallet_name}</Text>
              <KeyboardAvoidingView enabled={!Platform.isPad} behavior={Platform.OS === 'ios' ? 'position' : null}>
                <View style={[styles.input, stylesHook.input]}>
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
              {/* <BlueSpacing20 /> */}
              <View style={{ gap: 12, marginBottom: 24 }}>
                <Text style={[styles.textLabel1, stylesHook.textLabel1]}>{loc.wallets.details_type}</Text>
                <View style={[styles.input, stylesHook.input]}>
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
                  <Text style={[styles.textLabel2, stylesHook.textLabel2]}>{loc.wallets.identity_pubkey}</Text>
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
                  <Text style={[styles.textLabel2, stylesHook.textLabel2]}>{loc.wallets.details_multisig_type}</Text>
                  <BlueText>
                    {`${wallet.getM()} / ${wallet.getN()} (${
                      wallet.isNativeSegwit() ? 'native segwit' : wallet.isWrappedSegwit() ? 'wrapped segwit' : 'legacy'
                    })`}
                  </BlueText>
                </>
              )}
              {wallet.type === MultisigHDWallet.type && (
                <>
                  <Text style={[styles.textLabel2, stylesHook.textLabel2]}>{loc.multisig.how_many_signatures_can_bluewallet_make}</Text>
                  <BlueText>{wallet.howManySignaturesCanWeMake()}</BlueText>
                </>
              )}

              {wallet.type === LightningCustodianWallet.type && (
                <>
                  <Text style={[styles.textLabel1, stylesHook.textLabel1]}>{loc.wallets.details_connected_to}</Text>
                  <BlueText>{wallet.getBaseURI()}</BlueText>
                </>
              )}

              {wallet.type === HDAezeedWallet.type && (
                <>
                  <Text style={[styles.textLabel1, stylesHook.textLabel1]}>{loc.wallets.identity_pubkey}</Text>
                  <BlueText>{wallet.getIdentityPubkey()}</BlueText>
                </>
              )}
              {/* <BlueSpacing20 /> */}
              
              <View style={{
                gap: 12,
                marginBottom: 24,
              }}>
                <Text onPress={purgeTransactions} style={[styles.textLabel1, stylesHook.textLabel1]}>
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
                backgroundColor: '#0A3263',
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
                  <Switch value={hideTransactionsInWalletsList} onValueChange={setHideTransactionsInWalletsList} trackColor={{false: colors.element, true: colors.primary}} thumbColor={'#030D19'}/>
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
                  <Text style={[styles.textLabel2, stylesHook.textLabel2]}>{loc.bip47.payment_code}</Text>
                  <View style={styles.hardware}>
                    <BlueText>{loc.bip47.purpose}</BlueText>
                    <Switch value={isBIP47Enabled} onValueChange={setIsBIP47Enabled} />
                  </View>
                </>
              ) : null}

              <View>
                {wallet.type === WatchOnlyWallet.type && wallet.isHd() && (
                  <>
                    {/* <BlueSpacing10 /> */}
                    <Text style={[styles.textLabel2, stylesHook.textLabel2]}>{loc.wallets.details_advanced.toLowerCase()}</Text>
                    <View style={styles.hardware}>
                      <BlueText>{loc.wallets.details_use_with_hardware_wallet}</BlueText>
                      <Switch value={useWithHardwareWallet} onValueChange={setUseWithHardwareWallet} />
                    </View>
                  </>
                )}
                {isAdvancedModeEnabledRender && (
                  <View style={styles.column}>
                    {wallet.allowMasterFingerprint() && (
                      <View style={styles.row}>
                        <Text style={[styles.textLabel2, stylesHook.textLabel2]}>
                          {loc.wallets.details_master_fingerprint}
                        </Text>
                        <BlueText style={[styles.textValue, stylesHook.textValue]}>{masterFingerprint ?? <ActivityIndicator />}</BlueText>
                      </View>
                    )}
                    {derivationPath && (
                      <View style={styles.row}>
                        <Text style={[styles.textLabel2, stylesHook.textLabel2]}>{loc.wallets.details_derivation_path}</Text>
                        <BlueText style={[styles.textValue, stylesHook.textValue]} testID="DerivationPath">{derivationPath}</BlueText>
                      </View>
                    )}
                  </View>
                )}
              </View>
              {(wallet instanceof AbstractHDElectrumWallet || (wallet.type === WatchOnlyWallet.type && wallet.isHd())) && (
              <BlueListItem onPress={navigateToAddresses} title={loc.wallets.details_show_addresses} chevron />
            )}
              <TouchableOpacity
                accessibilityRole="button"
                testID="Save"
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 24,
                  minHeight: 56,
                  borderRadius: 30,
                  backgroundColor: colors.primary,
                }}
                onPress={save}
              >
                <Text 
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: '600',
                    fontSize: 16,
                    color: colors.white,
                  }}
                >
                  {loc.wallets.details_save}
                </Text>
              </TouchableOpacity>
            </View>
            {wallet.allowBIP47() && isBIP47Enabled && <BlueListItem onPress={navigateToPaymentCodes} title="Show payment codes" chevron />}
            <BlueCard style={styles.address}>
              <View>
                {/* <BlueSpacing20 /> */}
                <View style={{flexDirection: 'row', alignItems: 'center',}}>
                  <Icon name="upload" type="feather" color={colors.foreground} size={20}/>
                  <SecondButton onPress={navigateToWalletExport} testID="WalletExport" title={loc.wallets.details_export_backup} />
                </View>
                {walletTransactionsLength > 0 && (
                  <View style={{flexDirection: 'row', alignItems: 'center',}}>
                    {/* <BlueSpacing20 /> */}
                    <Icon name="book-open" type="feather" color={colors.foreground} size={20}/>
                    <SecondButton onPress={onExportHistoryPressed} title={loc.wallets.details_export_history} />
                  </View>
                )}
                {wallet.type === MultisigHDWallet.type && (
                  <>
                    {/* <BlueSpacing20 /> */}
                    <SecondButton
                      onPress={navigateToMultisigCoordinationSetup}
                      testID="MultisigCoordinationSetup"
                      title={loc.multisig.export_coordination_setup.replace(/^\w/, c => c.toUpperCase())}
                    />
                  </>
                )}

                {wallet.type === MultisigHDWallet.type && (
                  <>
                    {/* <BlueSpacing20 /> */}
                    <SecondButton
                      onPress={navigateToViewEditCosigners}
                      testID="ViewEditCosigners"
                      title={loc.multisig.view_edit_cosigners}
                    />
                  </>
                )}

                {wallet.allowXpub() && (
                  <View style={{flexDirection: 'row', alignItems: 'center',}}>
                    {/* <BlueSpacing20 /> */}
                    <Icon name="hash" type="feather" color={colors.foreground} size={20}/>
                    <SecondButton onPress={navigateToXPub} testID="XPub" title={loc.wallets.details_show_xpub} />
                  </View>
                )}
                {wallet.allowSignVerifyMessage() && (
                  <TouchableOpacity accessibilityRole="button" onPress={navigateToSignVerify} testID="SignVerify" 
                  style={{
                    backgroundColor: colors.foreground,
                    padding: 8,
                    minHeight: 45,
                    borderRadius: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1,
                    flexDirection: 'row',
                  }}
                >
                  <Icon name="edit-3" type="feather" color="#FFFFFF" size={20}/>
                  <Text textBreakStrategy="simple" style={styles.delete}>{`${loc.addresses.sign_title}${'  '}`}</Text>
                </TouchableOpacity>
                )}
                {wallet.type === LightningLdkWallet.type && (
                  <>
                    {/* <BlueSpacing20 /> */}
                    <SecondButton onPress={navigateToLdkViewLogs} testID="LdkLogs" title={loc.lnd.view_logs} />
                  </>
                )}
                {/* <BlueSpacing20 />
                <BlueSpacing20 /> */}
                <TouchableOpacity accessibilityRole="button" onPress={handleDeleteButtonTapped} testID="DeleteButton"
                  style={{
                    backgroundColor: colors.negative,
                    padding: 8,
                    minHeight: 45,
                    borderRadius: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1,
                    flexDirection: 'row',
                  }}
                >
                  <Icon name="trash" type="feather" color="#FFFFFF" size={20}/>
                  <Text textBreakStrategy="simple" style={styles.delete}>{`${loc.wallets.details_delete}${'  '}`}</Text>
                </TouchableOpacity>
              </View>
            </BlueCard>
          </View>
        </TouchableWithoutFeedback>
      )}
    </ScrollView>
  );
};

WalletDetails.navigationOptions = navigationStyle({}, opts => ({ ...opts, headerTitle: 'Wallet Settings'}));

export default WalletDetails;
