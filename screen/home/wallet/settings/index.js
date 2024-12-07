import React, { useEffect, useState, useCallback, useContext, useRef, useMemo, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { BlueText } from '../../../../BlueComponents';
import navigationStyle from '../../../../components/navigationStyle';
import { LightningCustodianWallet } from '../../../../class/wallets/lightning-custodian-wallet';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Biometric from '../../../../class/biometrics';
import {
  HDSegwitBech32Wallet,
  SegwitP2SHWallet,
  LegacyWallet,
  SegwitBech32Wallet,
  WatchOnlyWallet,
  MultisigHDWallet,
  HDAezeedWallet,
  LightningLdkWallet,
} from '../../../../class';
import loc, { formatBalanceWithoutSuffix } from '../../../../loc';
import { useTheme, useRoute, useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { BlueStorageContext } from '../../../../blue_modules/storage-context';
import Notifications from '../../../../blue_modules/notifications';
import { isDesktop } from '../../../../blue_modules/environment';
import { AbstractHDElectrumWallet } from '../../../../class/wallets/abstract-hd-electrum-wallet';
import alert from '../../../../components/Alert';
import { BitcoinUnit, Chain } from '../../../../models/bitcoinUnits';
import { writeFileAndExport } from '../../../../blue_modules/fs';
import { defaultStyles } from '../../../../components/defaultStyles';
import InputSection from '../../../../components/section-input';
import ToggleSection from '../../../../components/section-toggle';
import Button from '../../../../components/button-primary';

const prompt = require('../../../../helpers/prompt');

const WalletSettings = () => {
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
  const { goBack, navigate, popToTop } = useNavigation();
  const { colors } = useTheme();
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
        goBack();
      })
      .catch(error => {
        console.log(error.message);
        setIsLoading(false);
      });
  };

  useLayoutEffect(() => {
    isAdvancedModeEnabled().then(setIsAdvancedModeEnabledRender);
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


  const navigateToPaymentCodes = () =>
    navigate('PaymentCodeRoot', {
      screen: 'PaymentCodesList',
      params: {
        walletID: wallet.getID(),
      },
    });

  const walletNameTextInputOnBlur = () => {
    if (walletName.trim().length === 0) {
      const walletLabel = wallet.getLabel();
      setWalletName(walletLabel);
    }
  };

  

  return (
    <View style={{ flex: 1 }}>
      <View style={defaultStyles.modal}>
        <View style={{ gap: 32 }}>
          {/* {(() => {
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
          })()} */}
        <InputSection
          label={loc.wallets.add_wallet_name}
          input={walletName}
          max={18}
          onChange={setWalletName}
          enabled={!isLoading}
        />
        <InputSection
          label={loc.wallets.details_type}
          input={wallet.typeReadable}
          onChange={null}
          enabled={false}
        />
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
          <ToggleSection
            header={loc.transactions.transactions_count}
            body="Show your transactions on the home screen"
            input={hideTransactionsInWalletsList}
            onChange={setHideTransactionsInWalletsList}
          />
          
          {/* {backdoorBip47Pressed >= 10 && wallet.allowBIP47() ? (
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
            </View> */}
          </View>
          <Button title={loc.wallets.details_save} action={save}/>
        {/* {wallet.allowBIP47() && isBIP47Enabled && <BlueListItem onPress={navigateToPaymentCodes} title="Show payment codes" chevron />} */}
      </View>
    </View>
  );
};

WalletSettings.navigationOptions = navigationStyle({}, opts => ({ ...opts, headerTitle: loc.header.wallet_settings}));

export default WalletSettings;
