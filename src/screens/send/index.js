import React, { useState, useRef, useEffect, useCallback, useContext, useMemo, useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  I18nManager,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation, useRoute, useTheme, useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import RNFS from 'react-native-fs';
import BigNumber from 'bignumber.js';
import * as bitcoin from 'bitcoinjs-lib';

import { BlueDismissKeyboardInputAccessory, BlueLoading, BlueText } from '../../../BlueComponents';
import { navigationStyleTx } from '../../components/navigationStyle';
import NetworkTransactionFees, { NetworkTransactionFee } from '../../models/networkTransactionFees';
import { BitcoinUnit, Chain } from '../../models/bitcoinUnits';
import { HDSegwitBech32Wallet, MultisigHDWallet, WatchOnlyWallet } from '../../class';
import DocumentPicker from 'react-native-document-picker';
import DeeplinkSchemaMatch from '../../class/deeplink-schema-match';
import loc, { formatBalance, formatBalanceWithoutSuffix } from '../../loc';
import CoinsSelected from '../../components/CoinsSelected';
import AddressInput from '../../components/AddressInput';
import AmountInput from '../../components/AmountInput';
import InputAccessoryAllFunds from '../../components/InputAccessoryAllFunds';
import { AbstractHDElectrumWallet } from '../../class/wallets/abstract-hd-electrum-wallet';
import { BlueStorageContext } from '../../custom-modules/storage-context';
import { defaultStyles } from '../../components/defaultStyles';
const currency = require('../../custom-modules/currency');
const prompt = require('../../helpers/prompt');
const fs = require('../../custom-modules/fs');
const scanqr = require('../../helpers/scan-qr');
const btcAddressRx = /^[a-zA-Z0-9]{26,35}$/;

const SendDetails = () => {
  const { wallets, setSelectedWallet, sleep, txMetadata, saveToDisk } = useContext(BlueStorageContext);
  const navigation = useNavigation();
  const { name, params: routeParams } = useRoute();
  const scrollView = useRef();
  const scrollIndex = useRef(0);
  const { colors } = useTheme();
  const [ selectedIndex, setSelectedIndex ] = useState(0);

  // state
  const [width, setWidth] = useState(Dimensions.get('window').width);
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [isAmountToolbarVisibleForAndroid, setIsAmountToolbarVisibleForAndroid] = useState(false);
  const [isFeeSelectionModalVisible, setIsFeeSelectionModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isTransactionReplaceable, setIsTransactionReplaceable] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [units, setUnits] = useState([]);
  const [transactionMemo, setTransactionMemo] = useState('');
  const [networkTransactionFees, setNetworkTransactionFees] = useState(new NetworkTransactionFee(3, 2, 1));
  const [networkTransactionFeesIsLoading, setNetworkTransactionFeesIsLoading] = useState(false);
  const [customFee, setCustomFee] = useState(null);
  const [feePrecalc, setFeePrecalc] = useState({ current: null, slowFee: null, mediumFee: null, fastestFee: null });
  const [feeUnit, setFeeUnit] = useState();
  const [amountUnit, setAmountUnit] = useState();
  const [utxo, setUtxo] = useState(null);
  const [frozenBalance, setFrozenBlance] = useState(false);
  const [payjoinUrl, setPayjoinUrl] = useState(null);
  const [changeAddress, setChangeAddress] = useState();
  const [dumb, setDumb] = useState(false);
  const { isEditable = true } = routeParams;
  // if utxo is limited we use it to calculate available balance
  const balance = utxo ? utxo.reduce((prev, curr) => prev + curr.value, 0) : wallet?.getBalance();
  const allBalance = formatBalanceWithoutSuffix(balance, BitcoinUnit.BTC, true);

  // if cutomFee is not set, we need to choose highest possible fee for wallet balance
  // if there are no funds for even Slow option, use 1 sat/vbyte fee
  const feeRate = useMemo(() => {
    if (customFee) return customFee;
    if (feePrecalc.slowFee === null) return '1'; // wait for precalculated fees
    let initialFee;
    if (feePrecalc.fastestFee !== null) {
      initialFee = String(networkTransactionFees.fastestFee);
    } else if (feePrecalc.mediumFee !== null) {
      initialFee = String(networkTransactionFees.mediumFee);
    } else {
      initialFee = String(networkTransactionFees.slowFee);
    }
    return initialFee;
  }, [customFee, feePrecalc, networkTransactionFees]);

  const feeOptions = [
    {
      icon: require('../../../assets/icons/value.png'),
      label: loc.send.fee_fast,
      time: loc.send.fee_10m,
      fee: feePrecalc.fastestFee,
      rate: networkTransactionFees.fastestFee,
      active: Number(feeRate) === networkTransactionFees.fastestFee,
    },
    {
      icon: require('../../../assets/coins/vault.png'),
      label: loc.send.fee_medium,
      time: loc.send.fee_3h,
      fee: feePrecalc.mediumFee,
      rate: networkTransactionFees.mediumFee,
      active: Number(feeRate) === networkTransactionFees.mediumFee,
      disabled: networkTransactionFees.mediumFee === networkTransactionFees.fastestFee,
    },
    {
      icon: require('../../../assets/icons/calculator.png'),
      label: loc.send.fee_slow,
      time: loc.send.fee_1d,
      fee: feePrecalc.slowFee,
      rate: networkTransactionFees.slowFee,
      active: Number(feeRate) === networkTransactionFees.slowFee,
      disabled: networkTransactionFees.slowFee === networkTransactionFees.mediumFee || networkTransactionFees.slowFee === networkTransactionFees.fastestFee,
    },
  ];

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, wallet, isTransactionReplaceable, balance, addresses, isEditable, isLoading]);

  // keyboad effects
  useEffect(() => {
    const _keyboardDidShow = () => {
      setIsAmountToolbarVisibleForAndroid(true);
    };

    const _keyboardDidHide = () => {
      setIsAmountToolbarVisibleForAndroid(false);
    };

    Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
    return () => {
      Keyboard.removeAllListeners('keyboardDidShow');
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, []);

  useEffect(() => {
    // decode route params
    const currentAddress = addresses[scrollIndex.current];
    if (routeParams.uri) {
      try {
        const { address, amount, memo, payjoinUrl: pjUrl } = DeeplinkSchemaMatch.decodeBitcoinUri(routeParams.uri);

        setUnits(u => {
          u[scrollIndex.current] = BitcoinUnit.BTC; // also resetting current unit to BTC
          return [...u];
        });

        setAddresses(addrs => {
          if (currentAddress) {
            currentAddress.address = address;
            if (Number(amount) > 0) {
              currentAddress.amount = amount;
              currentAddress.amountSats = currency.btcToSatoshi(amount);
            }
            addrs[scrollIndex.current] = currentAddress;
            return [...addrs];
          } else {
            return [...addrs, { address, amount, amountSats: currency.btcToSatoshi(amount), key: String(Math.random()) }];
          }
        });

        if (memo?.trim().length > 0) {
          setTransactionMemo(memo);
        }
        setAmountUnit(BitcoinUnit.BTC);
        setPayjoinUrl(pjUrl);
      } catch (error) {
        console.log(error);
        Alert.alert(loc.errors.error, loc.send.details_error_decode);
      }
    } else if (routeParams.address) {
      const { amount, amountSats, unit = BitcoinUnit.BTC } = routeParams;
      setAddresses(addrs => {
        if (currentAddress) {
          currentAddress.address = routeParams.address;
          addrs[scrollIndex.current] = currentAddress;
          return [...addrs];
        } else {
          return [...addrs, { address: routeParams.address, key: String(Math.random()), amount, amountSats }];
        }
      });
      if (routeParams.memo?.trim().length > 0) {
        setTransactionMemo(routeParams.memo);
      }
      setUnits(u => {
        u[scrollIndex.current] = unit;
        return [...u];
      });
    } else {
      setAddresses([{ address: '', key: String(Math.random()) }]); // key is for the FlatList
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeParams.uri, routeParams.address]);

  useEffect(() => {
    // check if we have a suitable wallet
    const suitable = wallets.filter(w => w.chain === Chain.ONCHAIN && w.allowSend());
    if (suitable.length === 0) {
      Alert.alert(loc.errors.error, loc.send.details_wallet_before_tx);
      navigation.goBack();
      return;
    }
    const newWallet = (routeParams.walletID && wallets.find(w => w.getID() === routeParams.walletID)) || suitable[0];
    setWallet(newWallet);
    setFeeUnit(newWallet.getPreferredBalanceUnit());
    setAmountUnit(newWallet.preferredBalanceUnit); // default for whole screen

    // we are ready!
    setIsLoading(false);

    // load cached fees
    AsyncStorage.getItem(NetworkTransactionFee.StorageKey)
      .then(res => {
        const fees = JSON.parse(res);
        if (!fees?.fastestFee) return;
        setNetworkTransactionFees(fees);
      })
      .catch(e => console.log('loading cached recommendedFees error', e));

    // load fresh fees from servers

    setNetworkTransactionFeesIsLoading(true);
    NetworkTransactionFees.recommendedFees()
      .then(async fees => {
        if (!fees?.fastestFee) return;
        setNetworkTransactionFees(fees);
        await AsyncStorage.setItem(NetworkTransactionFee.StorageKey, JSON.stringify(fees));
      })
      .catch(e => console.log('loading recommendedFees error', e))
      .finally(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setNetworkTransactionFeesIsLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // change header and reset state on wallet change
  useEffect(() => {
    if (!wallet) return;
    setSelectedWallet(wallet.getID());

    // reset other values
    setUtxo(null);
    setChangeAddress(null);
    setIsTransactionReplaceable(wallet.type === HDSegwitBech32Wallet.type && !routeParams.noRbf);

    // update wallet UTXO
    wallet
      .fetchUtxo()
      .then(() => {
        // we need to re-calculate fees
        setDumb(v => !v);
      })
      .catch(e => console.log('fetchUtxo error', e));
  }, [wallet]); // eslint-disable-line react-hooks/exhaustive-deps

  // recalc fees in effect so we don't block render
  useEffect(() => {
    if (!wallet) return; // wait for it
    const fees = networkTransactionFees;
    const change = getChangeAddressFast();
    const requestedSatPerByte = Number(feeRate);
    const lutxo = utxo || wallet.getUtxo();
    let frozen = 0;
    if (!utxo) {
      // if utxo is not limited search for frozen outputs and calc it's balance
      frozen = wallet
        .getUtxo(true)
        .filter(o => !lutxo.some(i => i.txid === o.txid && i.vout === o.vout))
        .reduce((prev, curr) => prev + curr.value, 0);
    }

    const options = [
      { key: 'current', fee: requestedSatPerByte },
      { key: 'slowFee', fee: fees.slowFee },
      { key: 'mediumFee', fee: fees.mediumFee },
      { key: 'fastestFee', fee: fees.fastestFee },
    ];

    const newFeePrecalc = { ...feePrecalc };

    for (const opt of options) {
      let targets = [];
      for (const transaction of addresses) {
        if (transaction.amount === BitcoinUnit.MAX) {
          // single output with MAX
          targets = [{ address: transaction.address }];
          break;
        }
        const value = parseInt(transaction.amountSats, 10);
        if (value > 0) {
          targets.push({ address: transaction.address, value });
        } else if (transaction.amount) {
          if (currency.btcToSatoshi(transaction.amount) > 0) {
            targets.push({ address: transaction.address, value: currency.btcToSatoshi(transaction.amount) });
          }
        }
      }

      // if targets is empty, insert dust
      if (targets.length === 0) {
        targets.push({ address: '36JxaUrpDzkEerkTf1FzwHNE1Hb7cCjgJV', value: 546 });
      }

      // replace wrong addresses with dump
      targets = targets.map(t => {
        if (!wallet.isAddressValid(t.address)) {
          return { ...t, address: '36JxaUrpDzkEerkTf1FzwHNE1Hb7cCjgJV' };
        } else {
          return t;
        }
      });

      let flag = false;
      while (true) {
        try {
          const { fee } = wallet.coinselect(lutxo, targets, opt.fee, change);

          newFeePrecalc[opt.key] = fee;
          break;
        } catch (e) {
          if (e.message.includes('Not enough') && !flag) {
            flag = true;
            // if we don't have enough funds, construct maximum possible transaction
            targets = targets.map((t, index) => (index > 0 ? { ...t, value: 546 } : { address: t.address }));
            continue;
          }

          newFeePrecalc[opt.key] = null;
          break;
        }
      }
    }

    setFeePrecalc(newFeePrecalc);
    setFrozenBlance(frozen);
  }, [wallet, networkTransactionFees, utxo, addresses, feeRate, dumb]); // eslint-disable-line react-hooks/exhaustive-deps

  // we need to re-calculate fees if user opens-closes coin control
  useFocusEffect(
    useCallback(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDumb(v => !v);
    }, []),
  );

  const getChangeAddressFast = () => {
    if (changeAddress) return changeAddress; // cache

    let change;
    if (WatchOnlyWallet.type === wallet.type && !wallet.isHd()) {
      // plain watchonly - just get the address
      change = wallet.getAddress();
    } else if (WatchOnlyWallet.type === wallet.type || wallet instanceof AbstractHDElectrumWallet) {
      change = wallet._getInternalAddressByIndex(wallet.getNextFreeChangeAddressIndex());
    } else {
      // legacy wallets
      change = wallet.getAddress();
    }

    return change;
  };

  const getChangeAddressAsync = async () => {
    if (changeAddress) return changeAddress; // cache

    let change;
    if (WatchOnlyWallet.type === wallet.type && !wallet.isHd()) {
      // plain watchonly - just get the address
      change = wallet.getAddress();
    } else {
      // otherwise, lets call widely-used getChangeAddressAsync()
      try {
        change = await Promise.race([sleep(2000), wallet.getChangeAddressAsync()]);
      } catch (_) {}

      if (!change) {
        // either sleep expired or getChangeAddressAsync threw an exception
        if (wallet instanceof AbstractHDElectrumWallet) {
          change = wallet._getInternalAddressByIndex(wallet.getNextFreeChangeAddressIndex());
        } else {
          // legacy wallets
          change = wallet.getAddress();
        }
      }
    }

    if (change) setChangeAddress(change); // cache

    return change;
  };

  /**
   * TODO: refactor this mess, get rid of regexp, use https://github.com/bitcoinjs/bitcoinjs-lib/issues/890 etc etc
   *
   * @param data {String} Can be address or `bitcoin:xxxxxxx` uri scheme, or invalid garbage
   */
  const processAddressData = data => {
    const currentIndex = scrollIndex.current;
    setIsLoading(true);
    if (!data.replace) {
      // user probably scanned PSBT and got an object instead of string..?
      setIsLoading(false);
      return Alert.alert(loc.errors.error, loc.send.details_address_field_is_not_valid);
    }

    const dataWithoutSchema = data.replace('bitcoin:', '').replace('BITCOIN:', '');
    if (wallet.isAddressValid(dataWithoutSchema)) {
      setAddresses(addrs => {
        addrs[scrollIndex.current].address = dataWithoutSchema;
        return [...addrs];
      });
      setIsLoading(false);
      return;
    }

    let address = '';
    let options;
    try {
      if (!data.toLowerCase().startsWith('bitcoin:')) data = `bitcoin:${data}`;
      const decoded = DeeplinkSchemaMatch.bip21decode(data);
      address = decoded.address;
      options = decoded.options;
    } catch (error) {
      data = data.replace(/(amount)=([^&]+)/g, '').replace(/(amount)=([^&]+)&/g, '');
      const decoded = DeeplinkSchemaMatch.bip21decode(data);
      decoded.options.amount = 0;
      address = decoded.address;
      options = decoded.options;
    }

    console.log('options', options);
    if (btcAddressRx.test(address) || address.startsWith('bc1') || address.startsWith('BC1')) {
      setAddresses(addrs => {
        addrs[scrollIndex.current].address = address;
        addrs[scrollIndex.current].amount = options.amount;
        addrs[scrollIndex.current].amountSats = new BigNumber(options.amount).multipliedBy(100000000).toNumber();
        return [...addrs];
      });
      setUnits(u => {
        u[scrollIndex.current] = BitcoinUnit.BTC; // also resetting current unit to BTC
        return [...u];
      });
      setTransactionMemo(options.label || options.message);
      setAmountUnit(BitcoinUnit.BTC);
      setPayjoinUrl(options.pj || '');
      // RN Bug: contentOffset gets reset to 0 when state changes. Remove code once this bug is resolved.
      setTimeout(() => scrollView.current.scrollToIndex({ index: currentIndex, animated: false }), 50);
    }

    setIsLoading(false);
  };

  const createTransaction = async () => {
    Keyboard.dismiss();
    setIsLoading(true);
    const requestedSatPerByte = feeRate;
    for (const [index, transaction] of addresses.entries()) {
      let error;
      if (!transaction.amount || transaction.amount < 0 || parseFloat(transaction.amount) === 0) {
        error = loc.send.details_amount_field_is_not_valid;
        console.log('validation error');
      } else if (parseFloat(transaction.amountSats) <= 500) {
        error = loc.send.details_amount_field_is_less_than_minimum_amount_sat;
        console.log('validation error');
      } else if (!requestedSatPerByte || parseFloat(requestedSatPerByte) < 1) {
        error = loc.send.details_fee_field_is_not_valid;
        console.log('validation error');
      } else if (!transaction.address) {
        error = loc.send.details_address_field_is_not_valid;
        console.log('validation error');
      } else if (balance - transaction.amountSats < 0) {
        // first sanity check is that sending amount is not bigger than available balance
        error = frozenBalance > 0 ? loc.send.details_total_exceeds_balance_frozen : loc.send.details_total_exceeds_balance;
        console.log('validation error');
      } else if (transaction.address) {
        const address = transaction.address.trim().toLowerCase();
        if (address.startsWith('lnb') || address.startsWith('lightning:lnb')) {
          error = loc.send.provided_address_is_invoice;
          console.log('validation error');
        }
      }

      if (!error) {
        if (!wallet.isAddressValid(transaction.address)) {
          console.log('validation error');
          error = loc.send.details_address_field_is_not_valid;
        }
      }

      if (error) {
        scrollView.current.scrollToIndex({ index });
        setIsLoading(false);
        Alert.alert(loc.errors.error, error);
        ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
        return;
      }
    }

    try {
      await createPsbtTransaction();
    } catch (Err) {
      setIsLoading(false);
      Alert.alert(loc.errors.error, Err.message);
      ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
    }
  };

  const createPsbtTransaction = async () => {
    const change = await getChangeAddressAsync();
    const requestedSatPerByte = Number(feeRate);
    const lutxo = utxo || wallet.getUtxo();
    console.log({ requestedSatPerByte, lutxo: lutxo.length });

    const targets = [];
    for (const transaction of addresses) {
      if (transaction.amount === BitcoinUnit.MAX) {
        // output with MAX
        targets.push({ address: transaction.address });
        continue;
      }
      const value = parseInt(transaction.amountSats, 10);
      if (value > 0) {
        targets.push({ address: transaction.address, value });
      } else if (transaction.amount) {
        if (currency.btcToSatoshi(transaction.amount) > 0) {
          targets.push({ address: transaction.address, value: currency.btcToSatoshi(transaction.amount) });
        }
      }
    }

    const { tx, outputs, psbt, fee } = wallet.createTransaction(
      lutxo,
      targets,
      requestedSatPerByte,
      change,
      isTransactionReplaceable ? HDSegwitBech32Wallet.defaultRBFSequence : HDSegwitBech32Wallet.finalRBFSequence,
    );

    if (tx && routeParams.launchedBy && psbt) {
      console.warn('navigating back to ', routeParams.launchedBy);
      navigation.navigate(routeParams.launchedBy, { psbt });
    }

    if (wallet.type === WatchOnlyWallet.type) {
      // watch-only wallets with enabled HW wallet support have different flow. we have to show PSBT to user as QR code
      // so he can scan it and sign it. then we have to scan it back from user (via camera and QR code), and ask
      // user whether he wants to broadcast it
      navigation.navigate('PsbtWithHardwareWallet', {
        memo: transactionMemo,
        fromWallet: wallet,
        psbt,
        launchedBy: routeParams.launchedBy,
      });
      setIsLoading(false);
      return;
    }

    if (wallet.type === MultisigHDWallet.type) {
      navigation.navigate('PsbtMultisig', {
        memo: transactionMemo,
        psbtBase64: psbt.toBase64(),
        walletID: wallet.getID(),
        launchedBy: routeParams.launchedBy,
      });
      setIsLoading(false);
      return;
    }

    txMetadata[tx.getId()] = {
      txhex: tx.toHex(),
      memo: transactionMemo,
    };
    await saveToDisk();

    let recipients = outputs.filter(({ address }) => address !== change);

    if (recipients.length === 0) {
      // special case. maybe the only destination in this transaction is our own change address..?
      // (ez can be the case for single-address wallet when doing self-payment for consolidation)
      recipients = outputs;
    }

    navigation.navigate('Confirm', {
      fee: new BigNumber(fee).dividedBy(100000000).toNumber(),
      memo: transactionMemo,
      walletID: wallet.getID(),
      tx: tx.toHex(),
      recipients,
      satoshiPerByte: requestedSatPerByte,
      payjoinUrl,
      psbt,
    });
    setIsLoading(false);
  };

  const onWalletSelect = w => {
    setWallet(w);
    navigation.pop();
  };

  /**
   * same as `importTransaction`, but opens camera instead.
   *
   * @returns {Promise<void>}
   */
  const importQrTransaction = () => {
    if (wallet.type !== WatchOnlyWallet.type) {
      return Alert.alert(loc.errors.error, 'Error: importing transaction in non-watchonly wallet (this should never happen)');
    }

    setOptionsVisible(false);

    navigation.navigate('ScanQRCodeRoot', {
      screen: 'ScanQRCode',
      params: {
        onBarScanned: importQrTransactionOnBarScanned,
        showFileImportButton: false,
      },
    });
  };

  const importQrTransactionOnBarScanned = ret => {
    navigation.dangerouslyGetParent().pop();
    if (!ret.data) ret = { data: ret };
    if (ret.data.toUpperCase().startsWith('UR')) {
      Alert.alert(loc.errors.error, 'BC-UR not decoded. This should never happen');
    } else if (ret.data.indexOf('+') === -1 && ret.data.indexOf('=') === -1 && ret.data.indexOf('=') === -1) {
      // this looks like NOT base64, so maybe its transaction's hex
      // we dont support it in this flow
    } else {
      // psbt base64?

      // we construct PSBT object and pass to next screen
      // so user can do smth with it:
      const psbt = bitcoin.Psbt.fromBase64(ret.data);
      navigation.navigate('PsbtWithHardwareWallet', {
        memo: transactionMemo,
        fromWallet: wallet,
        psbt,
      });
      setIsLoading(false);
      setOptionsVisible(false);
    }
  };

  /**
   * watch-only wallets with enabled HW wallet support have different flow. we have to show PSBT to user as QR code
   * so he can scan it and sign it. then we have to scan it back from user (via camera and QR code), and ask
   * user whether he wants to broadcast it.
   * alternatively, user can export psbt file, sign it externally and then import it
   *
   * @returns {Promise<void>}
   */
  const importTransaction = async () => {
    if (wallet.type !== WatchOnlyWallet.type) {
      return Alert.alert(loc.errors.error, 'Importing transaction in non-watchonly wallet (this should never happen)');
    }

    try {
      const res = await DocumentPicker.pickSingle({
        type:
          Platform.OS === 'ios'
            ? ['com.cobalt.psbt', 'com.cobalt.psbt.txn', DocumentPicker.types.plainText, 'public.json']
            : [DocumentPicker.types.allFiles],
      });

      if (DeeplinkSchemaMatch.isPossiblySignedPSBTFile(res.uri)) {
        // we assume that transaction is already signed, so all we have to do is get txhex and pass it to next screen
        // so user can broadcast:
        const file = await RNFS.readFile(res.uri, 'ascii');
        const psbt = bitcoin.Psbt.fromBase64(file);
        const txhex = psbt.extractTransaction().toHex();
        navigation.navigate('PsbtWithHardwareWallet', { memo: transactionMemo, fromWallet: wallet, txhex });
        setIsLoading(false);
        setOptionsVisible(false);
        return;
      }

      if (DeeplinkSchemaMatch.isPossiblyPSBTFile(res.uri)) {
        // looks like transaction is UNsigned, so we construct PSBT object and pass to next screen
        // so user can do smth with it:
        const file = await RNFS.readFile(res.uri, 'ascii');
        const psbt = bitcoin.Psbt.fromBase64(file);
        navigation.navigate('PsbtWithHardwareWallet', { memo: transactionMemo, fromWallet: wallet, psbt });
        setIsLoading(false);
        setOptionsVisible(false);
        return;
      }

      if (DeeplinkSchemaMatch.isTXNFile(res.uri)) {
        // plain text file with txhex ready to broadcast
        const file = (await RNFS.readFile(res.uri, 'ascii')).replace('\n', '').replace('\r', '');
        navigation.navigate('PsbtWithHardwareWallet', { memo: transactionMemo, fromWallet: wallet, txhex: file });
        setIsLoading(false);
        setOptionsVisible(false);
        return;
      }

      Alert.alert(loc.errors.error, loc.send.details_unrecognized_file_format);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert(loc.errors.error, loc.send.details_no_signed_tx);
      }
    }
  };

  const askCosignThisTransaction = async () => {
    return new Promise(resolve => {
      Alert.alert(
        '',
        loc.multisig.cosign_this_transaction,
        [
          {
            text: loc._.no,
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: loc._.yes,
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false },
      );
    });
  };

  const _importTransactionMultisig = async base64arg => {
    try {
      const base64 = base64arg || (await fs.openSignedTransaction());
      if (!base64) return;
      const psbt = bitcoin.Psbt.fromBase64(base64); // if it doesnt throw - all good, its valid

      if (wallet.howManySignaturesCanWeMake() > 0 && (await askCosignThisTransaction())) {
        hideOptions();
        setIsLoading(true);
        await sleep(100);
        wallet.cosignPsbt(psbt);
        setIsLoading(false);
        await sleep(100);
      }

      navigation.navigate('PsbtMultisig', {
        memo: transactionMemo,
        psbtBase64: psbt.toBase64(),
        walletID: wallet.getID(),
      });
    } catch (error) {
      Alert.alert(loc.send.problem_with_psbt, error.message);
    }
    setIsLoading(false);
    setOptionsVisible(false);
  };

  const importTransactionMultisig = () => {
    return _importTransactionMultisig();
  };

  const onBarScanned = ret => {
    navigation.dangerouslyGetParent().pop();
    if (!ret.data) ret = { data: ret };
    if (ret.data.toUpperCase().startsWith('UR')) {
      Alert.alert(loc.errors.error, 'BC-UR not decoded. This should never happen');
    } else if (ret.data.indexOf('+') === -1 && ret.data.indexOf('=') === -1 && ret.data.indexOf('=') === -1) {
      // this looks like NOT base64, so maybe its transaction's hex
      // we dont support it in this flow
    } else {
      // psbt base64?
      return _importTransactionMultisig(ret.data);
    }
  };

  const importTransactionMultisigScanQr = () => {
    setOptionsVisible(false);
    navigation.navigate('ScanQRCodeRoot', {
      screen: 'ScanQRCode',
      params: {
        onBarScanned,
        showFileImportButton: true,
      },
    });
  };

  const handleAddRecipient = async () => {
    setAddresses(addrs => [...addrs, { address: '', key: String(Math.random()) }]);
    setOptionsVisible(false);
    await sleep(200); // wait for animation
    scrollView.current.scrollToEnd();
    if (addresses.length === 0) return;
    scrollView.current.flashScrollIndicators();
  };

  const handleRemoveRecipient = async () => {
    const last = scrollIndex.current === addresses.length - 1;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAddresses(addrs => {
      addrs.splice(scrollIndex.current, 1);
      return [...addrs];
    });
    setOptionsVisible(false);
    if (addresses.length === 0) return;
    await sleep(200); // wait for animation
    scrollView.current.flashScrollIndicators();
    if (last && Platform.OS === 'android') scrollView.current.scrollToEnd(); // fix white screen on android
  };

  const handleCoinControl = () => {
    setOptionsVisible(false);
    navigation.navigate('CoinControl', {
      walletID: wallet.getID(),
      onUTXOChoose: u => setUtxo(u),
    });
  };

  const handlePsbtSign = async () => {
    setIsLoading(true);
    setOptionsVisible(false);
    await new Promise(resolve => setTimeout(resolve, 100)); // sleep for animations
    const scannedData = await scanqr(navigation.navigate, name);
    if (!scannedData) return setIsLoading(false);

    let tx;
    let psbt;
    try {
      psbt = bitcoin.Psbt.fromBase64(scannedData);
      tx = wallet.cosignPsbt(psbt).tx;
    } catch (e) {
      Alert.alert(loc.errors.error, e.message);
      return;
    } finally {
      setIsLoading(false);
    }

    if (!tx) return setIsLoading(false);

    // we need to remove change address from recipients, so that Confirm screen show more accurate info
    const changeAddresses = [];
    for (let c = 0; c < wallet.next_free_change_address_index + wallet.gap_limit; c++) {
      changeAddresses.push(wallet._getInternalAddressByIndex(c));
    }
    const recipients = psbt.txOutputs.filter(({ address }) => !changeAddresses.includes(address));

    navigation.navigate('CreateTransaction', {
      fee: new BigNumber(psbt.getFee()).dividedBy(100000000).toNumber(),
      feeSatoshi: psbt.getFee(),
      wallet,
      tx: tx.toHex(),
      recipients,
      satoshiPerByte: psbt.getFeeRate(),
      showAnimatedQr: true,
      psbt,
    });
  };

  const hideOptions = () => {
    Keyboard.dismiss();
    setOptionsVisible(false);
  };

  const onReplaceableFeeSwitchValueChanged = value => {
    setIsTransactionReplaceable(value);
  };

  // because of https://github.com/facebook/react-native/issues/21718 we use
  // onScroll for android and onMomentumScrollEnd for iOS
  const handleRecipientsScrollEnds = e => {
    if (Platform.OS === 'android') return; // for android we use handleRecipientsScroll
    const contentOffset = e.nativeEvent.contentOffset;
    const viewSize = e.nativeEvent.layoutMeasurement;
    const index = Math.floor(contentOffset.x / viewSize.width);
    scrollIndex.current = index;
  };

  const handleRecipientsScroll = e => {
    if (Platform.OS === 'ios') return; // for iOS we use handleRecipientsScrollEnds
    const contentOffset = e.nativeEvent.contentOffset;
    const viewSize = e.nativeEvent.layoutMeasurement;
    const index = Math.floor(contentOffset.x / viewSize.width);
    scrollIndex.current = index;
  };

  const onUseAllPressed = () => {
    ReactNativeHapticFeedback.trigger('notificationWarning');
    const message = frozenBalance > 0 ? loc.send.details_adv_full_sure_frozen : loc.send.details_adv_full_sure;
    Alert.alert(
      loc.send.details_adv_full,
      message,
      [
        {
          text: loc._.ok,
          onPress: () => {
            Keyboard.dismiss();
            setAddresses(addrs => {
              addrs[scrollIndex.current].amount = BitcoinUnit.MAX;
              addrs[scrollIndex.current].amountSats = BitcoinUnit.MAX;
              return [...addrs];
            });
            setUnits(u => {
              u[scrollIndex.current] = BitcoinUnit.BTC;
              return [...u];
            });
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOptionsVisible(false);
          },
          style: 'default',
        },
        { text: loc._.cancel, onPress: () => {}, style: 'cancel' },
      ],
      { cancelable: false },
    );
  };

  const formatFee = fee => formatBalance(fee, feeUnit, true);

  const styles = StyleSheet.create({
    loading: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: colors.background,
    },
    root: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingBottom: 32,
      backgroundColor: colors.background,
    },
    frozenContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 8,
    },
    addressBox: {
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'center',
      padding: 24,
      gap: 16,
      borderRadius: 25,
      backgroundColor: colors.card,
      shadowColor: '#000000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    buttonWalletSelect: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 25,
      padding: 24,
      backgroundColor: colors.card,
      shadowColor: '#000000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    containerFee: {
      display: 'flex',
      justifyContent: 'space-between',
      borderRadius: 25,
      padding: 24,
      backgroundColor: colors.card,
      shadowColor: '#000000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    button: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 83,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 40,
      backgroundColor: colors.button,
    },
    buttonText: {
      color: colors.white,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 12,
    },
    titleContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    title: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 14,
    },
    subtitle: {
      color: colors.foregroundInactive,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 12
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24,
    },
    rowFee: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    textInactive: {
      color: colors.foregroundInactive,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 14,
    },
    textTitle: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 20,
    },
  });

  const renderWalletSelectionOrCoinsSelected = () => {
    //if (walletSelectionOrCoinsSelectedHidden) return null;
    if (utxo !== null) {
      return (
        <View>
          <CoinsSelected
            number={utxo.length}
            onContainerPress={handleCoinControl}
            onClose={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setUtxo(null);
            }}
          />
        </View>
      );
    }

    return (
      <View>
        {!isLoading && isEditable && (
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.buttonWalletSelect}
            onPress={() => navigation.navigate('SelectWallet', { onWalletSelect, chainType: Chain.ONCHAIN })}
          >
            <View style={styles.row}>
              <Image
                source={require('../../../assets/icons/card.png')}
                style={{
                  width: 32,
                  height: 32,
                }}
              />
              <View>
                <Text style={styles.textInactive}>
                  Wallet
                </Text>
                <Text style={styles.textTitle}>
                  {wallet.getLabel()}
                </Text>
              </View>
            </View>
            <Icon 
              name={'chevron-right'}
              size={24} 
              type="feather" 
              color={colors.foregroundInactive}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderBitcoinTransactionInfoFields = params => {
    const { item, index } = params;
    const disableSendMax = balance === 0 || addresses.some(element => element.amount === BitcoinUnit.MAX);
    return (
      <View testID={'Transaction' + index}>
        <AmountInput
          isLoading={isLoading}
          amount={item.amount ? item.amount.toString() : null}
          onAmountUnitChange={unit => {
            setAddresses(addrs => {
              const addr = addrs[index];

              switch (unit) {
                case BitcoinUnit.SATS:
                  addr.amountSats = parseInt(addr.amount, 10);
                  break;
                case BitcoinUnit.BTC:
                  addr.amountSats = currency.btcToSatoshi(addr.amount);
                  break;
                case BitcoinUnit.LOCAL_CURRENCY:
                  // also accounting for cached fiat->sat conversion to avoid rounding error
                  addr.amountSats = AmountInput.getCachedSatoshis(addr.amount) || currency.btcToSatoshi(currency.fiatToBTC(addr.amount));
                  break;
              }

              addrs[index] = addr;
              return [...addrs];
            });
            setUnits(u => {
              u[index] = unit;
              return [...u];
            });
          }}
          onChangeText={text => {
            setAddresses(addrs => {
              item.amount = text;
              switch (units[index] || amountUnit) {
                case BitcoinUnit.BTC:
                  item.amountSats = currency.btcToSatoshi(item.amount);
                  break;
                case BitcoinUnit.LOCAL_CURRENCY:
                  item.amountSats = currency.btcToSatoshi(currency.fiatToBTC(item.amount));
                  break;
                case BitcoinUnit.SATS:
                default:
                  item.amountSats = parseInt(text, 10);
                  break;
              }
              addrs[index] = item;
              return [...addrs];
            });
          }}
          unit={units[index] || amountUnit}
          editable={isEditable}
          disabled={!isEditable}
          inputAccessoryViewID={InputAccessoryAllFunds.InputAccessoryViewID}
        />
        <TouchableOpacity
          testID="sendMaxButton"
          disabled={disableSendMax}
          style={{
            position: 'absolute',
            right: 0,
            top: 48,
            display: 'flex',
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
            minHeight: 40,
            borderRadius: 20,
            backgroundColor: colors.button,
            opacity: disableSendMax ? 0.5 : 1,
          }}
          onPress={onUseAllPressed}
        >
          <Text style={defaultStyles.btnText}>
            Max
          </Text>
        </TouchableOpacity>
        {frozenBalance > 0 && (
          <TouchableOpacity accessibilityRole="button" style={styles.frozenContainer} onPress={handleCoinControl}>
            <BlueText>
              {loc.formatString(loc.send.details_frozen, { amount: formatBalanceWithoutSuffix(frozenBalance, BitcoinUnit.BTC, true) })}
            </BlueText>
          </TouchableOpacity>
        )}
        <View style={styles.addressBox}>
          <AddressInput
            onChangeText={text => {
              text = text.trim();
              const { address, amount, memo, payjoinUrl: pjUrl } = DeeplinkSchemaMatch.decodeBitcoinUri(text);
              setAddresses(addrs => {
                item.address = address || text;
                item.amount = amount || item.amount;
                addrs[index] = item;
                return [...addrs];
              });
              setTransactionMemo(memo || transactionMemo);
              setIsLoading(false);
              setPayjoinUrl(pjUrl);
            }}
            onBarScanned={processAddressData}
            address={item.address}
            isLoading={isLoading}
            inputAccessoryViewID={BlueDismissKeyboardInputAccessory.InputAccessoryViewID}
            launchedBy={name}
            editable={isEditable}
          />
          <View style={defaultStyles.divider}/>
          <TextInput
            onChangeText={setTransactionMemo}
            placeholder={loc.send.details_note_placeholder}
            placeholderTextColor={colors.foregroundInactive}
            value={transactionMemo}
            numberOfLines={1}
            style={defaultStyles.inputText}
            editable={!isLoading}
            onSubmitEditing={Keyboard.dismiss}
            inputAccessoryViewID={BlueDismissKeyboardInputAccessory.InputAccessoryViewID}
          />
        </View>
      </View>
    );
  };

  if (isLoading || !wallet) {
    return (
      <View style={styles.loading}>
        <BlueLoading />
      </View>
    );
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.root} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
          <KeyboardAvoidingView enabled={!Platform.isPad} behavior="position">
            <View style={{ gap: 24 }}>
            <FlatList
              keyboardShouldPersistTaps="always"
              scrollEnabled={false}
              data={addresses}
              renderItem={renderBitcoinTransactionInfoFields}
              ref={scrollView}
              //pagingEnabled
              removeClippedSubviews={false}
              onMomentumScrollBegin={Keyboard.dismiss}
              onMomentumScrollEnd={handleRecipientsScrollEnds}
              onScroll={handleRecipientsScroll}
              scrollEventThrottle={200}
            />
            {renderWalletSelectionOrCoinsSelected()}
            <View style={styles.containerFee}>
              <View style={{ gap: 16 }}>
              {feeOptions.map((x, index) => (
                <View>
                  {(index != 0 && (<View style={[defaultStyles.divider, {marginBottom: 16}]}/>))}
                  <View style={styles.rowFee}>
                    <View style={styles.titleContainer}>
                        <Image
                          style={{ width: 32, height: 32 }}
                          source={x.icon}
                        />
                        <View>
                          <Text style={styles.title}>
                            {x.label}
                          </Text>
                          <Text style={styles.subtitle}>
                            {x.rate} {loc.units.sat_vbyte}
                          </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                          setFeePrecalc(fp => ({ ...fp, current: x.fee }));
                          setCustomFee(x.rate.toString());
                          setSelectedIndex(index);
                        }}
                      >
                        <View>
                        {selectedIndex == index ? ( 
                          <Icon name="check" type="feather" size={12} color={colors.white} style={{marginRight: 8}}/>
                        ) : (null)}
                        </View>
                        <Text style={styles.buttonText}>
                          {selectedIndex == index ? 'Selected' : 'Select'}
                        </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                ))}
              </View>
            </View>
          </View>
          </KeyboardAvoidingView>
        <BlueDismissKeyboardInputAccessory />
        {Platform.select({
          ios: <InputAccessoryAllFunds canUseAll={balance > 0} onUseAllPressed={onUseAllPressed} balance={allBalance} />,
          android: isAmountToolbarVisibleForAndroid && (
            <InputAccessoryAllFunds canUseAll={balance > 0} onUseAllPressed={onUseAllPressed} balance={allBalance} />
          ),
        })}
        <TouchableOpacity
          style={defaultStyles.btn}
          onPress={createTransaction}
          testID="CreateTransactionButton"
        >
          <Text style={defaultStyles.btnText}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SendDetails;

SendDetails.actionKeys = {
  ImportTransaction: 'ImportTransaction',
  ImportTransactionMultsig: 'ImportTransactionMultisig',
  ImportTransactionQR: 'ImportTransactionQR',
};

SendDetails.actionIcons = {
  ImportTransaction: { iconType: 'SYSTEM', iconValue: 'square.and.arrow.down' },
  ImportTransactionMultsig: { iconType: 'SYSTEM', iconValue: 'square.and.arrow.down.on.square' },
  ImportTransactionQR: { iconType: 'SYSTEM', iconValue: 'qrcode.viewfinder' },
};

SendDetails.navigationOptions = navigationStyleTx({}, options => ({
  ...options,
  title: loc.send.header,
}));
