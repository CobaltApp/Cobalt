import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  InteractionManager,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, useTheme, useFocusEffect } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Icon } from 'react-native-elements';
import Share from 'react-native-share';
import QRCodeComponent from '../../components/QRCodeComponent';
import {
  BlueLoading,
  BlueCopyTextToClipboard,
  BlueButton,
  BlueButtonLink,
  BlueText,
  BlueSpacing20,
  BlueAlertWalletExportReminder,
  BlueCard,
  BlueSpacing40,
} from '../../BlueComponents';
import { navigationStyleTx } from '../../components/navigationStyle';
import BottomModal from '../../components/BottomModal';
import { Chain, BitcoinUnit } from '../../models/bitcoinUnits';
import HandoffComponent from '../../components/handoff';
import AmountInput from '../../components/AmountInput';
import DeeplinkSchemaMatch from '../../class/deeplink-schema-match';
import loc, { formatBalance } from '../../loc';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import Notifications from '../../blue_modules/notifications';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { TransactionPendingIconBig } from '../../components/TransactionPendingIconBig';
import * as BlueElectrum from '../../blue_modules/BlueElectrum';
import { SuccessView } from '../send/success';
const currency = require('../../blue_modules/currency');
import { Button } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ScreenWidth } from 'react-native-elements/dist/helpers';
import { defaultStyles } from '../../components/defaultStyles';

const ReceiveDetails = () => {
  const { walletID, address } = useRoute().params;
  const { wallets, saveToDisk, sleep, isElectrumDisabled, fetchAndSaveWalletTransactions } = useContext(BlueStorageContext);
  const wallet = wallets.find(w => w.getID() === walletID);
  const [customLabel, setCustomLabel] = useState();
  const [customAmount, setCustomAmount] = useState();
  const [customUnit, setCustomUnit] = useState(BitcoinUnit.BTC);
  const [bip21encoded, setBip21encoded] = useState();
  const [isCustom, setIsCustom] = useState(false);
  const [isCustomModalVisible, setIsCustomModalVisible] = useState(false);
  const [showPendingBalance, setShowPendingBalance] = useState(false);
  const [showConfirmedBalance, setShowConfirmedBalance] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const { navigate, goBack, setParams } = useNavigation();
  const { colors } = useTheme();
  const [intervalMs, setIntervalMs] = useState(5000);
  const [eta, setEta] = useState('');
  const [initialConfirmed, setInitialConfirmed] = useState(0);
  const [initialUnconfirmed, setInitialUnconfirmed] = useState(0);
  const [displayBalance, setDisplayBalance] = useState('');
  const fetchAddressInterval = useRef();
  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      marginTop: 24,
      paddingTop: 32,
      paddingHorizontal: 24,
      gap: 24,
      borderRadius: 40,
      backgroundColor: colors.element,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 24,
    },
    header: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 16,
    },
    qrcode: {
      display: 'flex',
      borderRadius: 40,
      alignItems: 'center',
      alignSelf: 'center',
      padding: 24,
      backgroundColor: colors.white,
    },
    addressContainer:{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 24,
      paddingRight: 12,
      minHeight: 56,
      borderRadius: 30,
      backgroundColor: colors.card,
    },
    address: {
      color: colors.foregroundInactive,
      fontFamily: 'Poppins',
      fontWeight: '400',
      fontSize: 16,
    },
    advancedContainer: {
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'center',
      padding: 20,
      gap: 16,
      borderRadius: 25,
      backgroundColor: colors.card,
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },


    rootBackgroundColor: {
      backgroundColor: colors.background,
    },
    modalContent: {
      padding: 22,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      minHeight: 350,
      height: 350,
      //backgroundColor: colors.background,
    },
    customAmount: {
      flexDirection: 'row',
      borderWidth: 1.0,
      borderBottomWidth: 0.5,
      minHeight: 44,
      height: 44,
      marginHorizontal: 20,
      alignItems: 'center',
      marginVertical: 8,
      borderRadius: 4,
      borderColor: colors.background,
      //backgroundColor: colors.background,
    },
    root: {
      flexGrow: 1,
      justifyContent: 'space-between',
      //backgroundColor: colors.background,
    },
    scrollBody: {
      marginTop: 32,
      flexGrow: 1,
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    share: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: 8,
    },
    link: {
      marginBottom: 16,
      paddingHorizontal: 32,
    },
    amount: {
      fontWeight: '500',
      fontSize: 36,
      textAlign: 'center',
      color: colors.foreground,
    },
    label: {
      fontWeight: '700',
      textAlign: 'center',
      color: colors.foreground,
    },
    modalButton: {
      paddingHorizontal: 70,
      maxWidth: '80%',
      borderRadius: 50,
      fontWeight: '700',
    },
    customAmountText: {
      color: colors.foregroundInactive,
      fontFamily: 'Poppins',
      fontWeight: '400',
      fontSize: 16,
    },
  });

  useEffect(() => {
    if (showConfirmedBalance) {
      ReactNativeHapticFeedback.trigger('notificationSuccess', { ignoreAndroidSystemSettings: false });
    }
  }, [showConfirmedBalance]);

  // re-fetching address balance periodically
  useEffect(() => {
    console.log('receive/defails - useEffect');

    if (fetchAddressInterval.current) {
      // interval already exists, lets cleanup it and recreate, so theres no duplicate intervals
      clearInterval(fetchAddressInterval.current);
      fetchAddressInterval.current = undefined;
    }

    fetchAddressInterval.current = setInterval(async () => {
      try {
        const decoded = DeeplinkSchemaMatch.bip21decode(bip21encoded);
        const address2use = address || decoded.address;
        if (!address2use) return;

        console.log('checking address', address2use, 'for balance...');
        const balance = await BlueElectrum.getBalanceByAddress(address2use);
        console.log('...got', balance);

        if (balance.unconfirmed > 0) {
          if (initialConfirmed === 0 && initialUnconfirmed === 0) {
            // saving initial values for later (when tx gets confirmed)
            setInitialConfirmed(balance.confirmed);
            setInitialUnconfirmed(balance.unconfirmed);
            setIntervalMs(25000);
            ReactNativeHapticFeedback.trigger('impactHeavy', { ignoreAndroidSystemSettings: false });
          }

          const txs = await BlueElectrum.getMempoolTransactionsByAddress(address2use);
          const tx = txs.pop();
          if (tx) {
            const rez = await BlueElectrum.multiGetTransactionByTxid([tx.tx_hash], 10, true);
            if (rez && rez[tx.tx_hash] && rez[tx.tx_hash].vsize) {
              const satPerVbyte = Math.round(tx.fee / rez[tx.tx_hash].vsize);
              const fees = await BlueElectrum.estimateFees();
              if (satPerVbyte >= fees.fast) {
                setEta(loc.formatString(loc.transactions.eta_10m));
              }
              if (satPerVbyte >= fees.medium && satPerVbyte < fees.fast) {
                setEta(loc.formatString(loc.transactions.eta_3h));
              }
              if (satPerVbyte < fees.medium) {
                setEta(loc.formatString(loc.transactions.eta_1d));
              }
            }
          }

          setDisplayBalance(
            loc.formatString(loc.transactions.pending_with_amount, {
              amt1: formatBalance(balance.unconfirmed, BitcoinUnit.LOCAL_CURRENCY, true).toString(),
              amt2: formatBalance(balance.unconfirmed, BitcoinUnit.BTC, true).toString(),
            }),
          );
          setShowPendingBalance(true);
          setShowAddress(false);
        } else if (balance.unconfirmed === 0 && initialUnconfirmed !== 0) {
          // now, handling a case when unconfirmed == 0, but in past it wasnt (i.e. it changed while user was
          // staring at the screen)

          const balanceToShow = balance.confirmed - initialConfirmed;

          if (balanceToShow > 0) {
            // address has actually more coins then initially, so we definately gained something
            setShowConfirmedBalance(true);
            setShowPendingBalance(false);
            setShowAddress(false);

            clearInterval(fetchAddressInterval.current);
            fetchAddressInterval.current = undefined;

            setDisplayBalance(
              loc.formatString(loc.transactions.received_with_amount, {
                amt1: formatBalance(balanceToShow, BitcoinUnit.LOCAL_CURRENCY, true).toString(),
                amt2: formatBalance(balanceToShow, BitcoinUnit.BTC, true).toString(),
              }),
            );

            fetchAndSaveWalletTransactions(walletID);
          } else {
            // rare case, but probable. transaction evicted from mempool (maybe cancelled by the sender)
            setShowConfirmedBalance(false);
            setShowPendingBalance(false);
            setShowAddress(true);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }, intervalMs);
  }, [bip21encoded, address, initialConfirmed, initialUnconfirmed, intervalMs, fetchAndSaveWalletTransactions, walletID]);

  const renderConfirmedBalance = () => {
    return (
      <ScrollView style={styles.rootBackgroundColors} centerContent keyboardShouldPersistTaps="always">
        <View style={styles.scrollBody}>
          {isCustom && (
            <>
              <BlueText style={styles.label} numberOfLines={1}>
                {customLabel}
              </BlueText>
            </>
          )}
          <SuccessView />
          <BlueText style={styles.label} numberOfLines={1}>
            {displayBalance}
          </BlueText>
        </View>
      </ScrollView>
    );
  };

  const renderPendingBalance = () => {
    return (
      <ScrollView contentContainerStyle={styles.rootBackgroundColor} centerContent keyboardShouldPersistTaps="always">
        <View style={styles.scrollBody}>
          {isCustom && (
            <>
              <BlueText style={styles.label} numberOfLines={1}>
                {customLabel}
              </BlueText>
            </>
          )}
          <TransactionPendingIconBig />
          <BlueText style={styles.label} numberOfLines={1}>
            {displayBalance}
          </BlueText>
          <BlueText style={styles.label} numberOfLines={1}>
            {eta}
          </BlueText>
        </View>
      </ScrollView>
    );
  };

  const handleBackButton = () => {
    goBack(null);
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
      clearInterval(fetchAddressInterval.current);
      fetchAddressInterval.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderReceiveDetails = () => {
    return (
      <View 
        style={styles.modal}
        keyboardShouldPersistTaps="always"
      >
        {/* <View style={styles.headerContainer}>
          <Icon name="credit-card" type="feather" size={24} color={colors.foreground}/>
          <Text style={styles.header}>
            Address
          </Text>
        </View> */}
        <View style={styles.qrcode}>
          <QRCodeComponent value={bip21encoded} />
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.address}>
            {isCustom ? 
            (bip21encoded.slice(0, Math.round(ScreenWidth / 35)) + '...' + bip21encoded.slice(bip21encoded.length - (Math.round(ScreenWidth / 35) + 1), bip21encoded.length)) 
            :
            (address.slice(0, Math.round(ScreenWidth / 35)) + '...' + address.slice(address.length - (Math.round(ScreenWidth / 35) + 1), address.length)
            )}
          </Text>
          <TouchableOpacity
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 25,
              backgroundColor: colors.button,
            }}
            onPress={handleShareButtonPressed}
          >
            <Text 
              style={{
                color: colors.white,
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: 14,
              }}
            >
            Share
          </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerContainer}>
          <Icon name="settings" type="feather" size={24} color={colors.foreground}/>
          <Text style={styles.header}>
            Advanced Options {customAmount}
          </Text>
        </View>
        <KeyboardAvoidingView enabled={!Platform.isPad} behavior={Platform.OS === 'ios' ? 'position' : null}>
        <View style={styles.advancedContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={styles.row}>
              <Image
                source={require('../../img/icons/value.png')}
                style={{
                  width: 32,
                  height: 32,
                }}
              />
              <TextInput
                onChangeText={setCustomAmount}
                placeholderTextColor={colors.foregroundInactive}
                placeholder={'Amount'}
                value={customAmount || ''}
                numberOfLines={1}
                style={styles.customAmountText}
                testID="CustomAmount"
              />
            </View>
            {/* <TouchableOpacity
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 25,
                backgroundColor: colors.button,
              }}
              onPress={setCustomUnit()}
            >
              <Text 
                style={{
                  color: colors.white,
                  fontFamily: 'Poppins',
                  fontWeight: '500',
                  fontSize: 14,
                }}
              >
                {getUnit()}
            </Text>
            </TouchableOpacity> */}
            {/* <AmountInput unit={customUnit} amount={customAmount || ''} onChangeText={setCustomAmount} onAmountUnitChange={setCustomUnit} /> */}
          </View>
          <View style={defaultStyles.divider}/>
          <View style={styles.row}>
          <Image
              source={require('../../img/icons/email.png')}
              style={{
                width: 32,
                height: 32,
              }}
            />
            <TextInput
              onChangeText={setCustomLabel}
              placeholderTextColor={colors.foregroundInactive}
              placeholder={'Message'}
              value={customLabel|| ''}
              numberOfLines={1}
              style={styles.customAmountText}
              testID="CustomAmountDescription"
            />
          </View>
        </View>
        </KeyboardAvoidingView>
        <TouchableOpacity 
          style={defaultStyles.btn}
          onPress={createCustomAmountAddress}
        >
          <Text style={defaultStyles.btnText}>
            Use Custom Amount
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const obtainWalletAddress = useCallback(async () => {
    console.log('receive/details - componentDidMount');
    wallet.setUserHasSavedExport(true);
    await saveToDisk();
    let newAddress;
    if (address) {
      setAddressBIP21Encoded(address);
      await Notifications.tryToObtainPermissions();
      Notifications.majorTomToGroundControl([address], [], []);
    } else {
      if (wallet.chain === Chain.ONCHAIN) {
        try {
          if (!isElectrumDisabled) newAddress = await Promise.race([wallet.getAddressAsync(), sleep(1000)]);
        } catch (_) {}
        if (newAddress === undefined) {
          // either sleep expired or getAddressAsync threw an exception
          console.warn('either sleep expired or getAddressAsync threw an exception');
          newAddress = wallet._getExternalAddressByIndex(wallet.getNextFreeAddressIndex());
        } else {
          saveToDisk(); // caching whatever getAddressAsync() generated internally
        }
      } else if (wallet.chain === Chain.OFFCHAIN) {
        try {
          await Promise.race([wallet.getAddressAsync(), sleep(1000)]);
          newAddress = wallet.getAddress();
        } catch (_) {}
        if (newAddress === undefined) {
          // either sleep expired or getAddressAsync threw an exception
          console.warn('either sleep expired or getAddressAsync threw an exception');
          newAddress = wallet.getAddress();
        } else {
          saveToDisk(); // caching whatever getAddressAsync() generated internally
        }
      }
      setAddressBIP21Encoded(newAddress);
      await Notifications.tryToObtainPermissions();
      Notifications.majorTomToGroundControl([newAddress], [], []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAddressBIP21Encoded = addr => {
    const newBip21encoded = DeeplinkSchemaMatch.bip21encode(addr);
    setParams({ address: addr });
    setBip21encoded(newBip21encoded);
    setShowAddress(true);
  };

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(async () => {
        if (wallet) {
          if (!wallet.getUserHasSavedExport()) {
            BlueAlertWalletExportReminder({
              onSuccess: obtainWalletAddress,
              onFailure: () => {
                goBack();
                navigate('WalletExportRoot', {
                  screen: 'WalletExport',
                  params: {
                    walletID: wallet.getID(),
                  },
                });
              },
            });
          } else {
            obtainWalletAddress();
          }
        } else if (!wallet && address) {
          setAddressBIP21Encoded(address);
        }
      });
      return () => {
        task.cancel();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet]),
  );

  const dismissCustomAmountModal = () => {
    Keyboard.dismiss();
    setIsCustomModalVisible(false);
  };

  const showCustomAmountModal = () => {
    setIsCustomModalVisible(true);
  };

  const createCustomAmountAddress = () => {
    setIsCustom(true);
    setIsCustomModalVisible(false);
    let amount = customAmount;
    switch (customUnit) {
      case BitcoinUnit.BTC:
        // nop
        break;
      case BitcoinUnit.SATS:
        amount = currency.satoshiToBTC(customAmount);
        break;
      case BitcoinUnit.LOCAL_CURRENCY:
        if (AmountInput.conversionCache[amount + BitcoinUnit.LOCAL_CURRENCY]) {
          // cache hit! we reuse old value that supposedly doesnt have rounding errors
          amount = currency.satoshiToBTC(AmountInput.conversionCache[amount + BitcoinUnit.LOCAL_CURRENCY]);
        } else {
          amount = currency.fiatToBTC(customAmount);
        }
        break;
    }
    setBip21encoded(DeeplinkSchemaMatch.bip21encode(address, { amount, label: customLabel }));
    setShowAddress(true);
  };

  const renderCustomAmountModal = () => {
    return (
      <BottomModal isVisible={isCustomModalVisible} onClose={dismissCustomAmountModal}>
        <KeyboardAvoidingView enabled={!Platform.isPad} behavior={Platform.OS === 'ios' ? 'position' : null}>
          <View style={styles.modalContent}>
            <AmountInput unit={customUnit} amount={customAmount || ''} onChangeText={setCustomAmount} onAmountUnitChange={setCustomUnit} />
            <View style={styles.customAmount}>
              <TextInput
                onChangeText={setCustomLabel}
                placeholderTextColor={"#81868e"}
                placeholder={loc.receive.details_label}
                value={customLabel || ''}
                numberOfLines={1}
                style={styles.customAmountText}
                testID="CustomAmountDescription"
              />
            </View>
            <View>
              <BlueButton
                testID="CustomAmountSaveButton"
                style={styles.modalButton}
                title={loc.receive.details_create}
                onPress={createCustomAmountAddress}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </BottomModal>
    );
  };

  const handleShareButtonPressed = () => {
    Share.open({ message: bip21encoded }).catch(error => console.log(error));
  };

  /**
   * @returns {string} BTC amount, accounting for current `customUnit` and `customUnit`
   */

  const getUnit = () => {
    switch (customUnit) {
      case BitcoinUnit.BTC:
        return 'BTC';
      case BitcoinUnit.SATS:
        return 'SAT';
      case BitcoinUnit.LOCAL_CURRENCY:
        return 'USD';
    }
  };

  const getDisplayAmount = () => {
    if (Number(customAmount) > 0) {
      switch (customUnit) {
        case BitcoinUnit.BTC:
          return customAmount + ' BTC';
        case BitcoinUnit.SATS:
          return currency.satoshiToBTC(customAmount) + ' BTC';
        case BitcoinUnit.LOCAL_CURRENCY:
          return currency.fiatToBTC(customAmount) + ' BTC';
      }
      return customAmount + ' ' + customUnit;
    } else {
      return null;
    }
  };

  return (
    <View 
      style={{
        flexGrow: 1,
        justifyContent: 'space-between',
      }}
    >
      {address !== undefined && showAddress && (
        <HandoffComponent title={loc.send.details_address} type={HandoffComponent.activityTypes.ReceiveOnchain} userInfo={{ address }} />
      )}
      {showConfirmedBalance ? renderConfirmedBalance() : null}
      {showPendingBalance ? renderPendingBalance() : null}
      {showAddress ? renderReceiveDetails() : null}
      {!showAddress && !showPendingBalance && !showConfirmedBalance ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : null }
    </View>
  );
};

export default ReceiveDetails;

//ReceiveDetails.navigationOptions = navigationStyle({}, options => ({ ...options, title: loc.receive.header }));

ReceiveDetails.navigationOptions = navigationStyleTx({}, options => ({
  ...options,
  title: loc.send.header,
}));

//ReceiveDetails.navigationOptions = navigationStyle({}, options => ({ ...options, title: loc.receive.header }));
