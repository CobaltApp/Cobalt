import React, { useEffect, useState, useContext } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRoute, useTheme } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Icon } from 'react-native-elements';
import Share from 'react-native-share';
import { BlueDoneAndDismissKeyboardInputAccessory, BlueFormLabel, BlueSpacing10, BlueSpacing20, SafeBlueArea } from '../../BlueComponents';
import navigationStyle from '../../components/navigationStyle';
import { defaultStyles } from '../../components/defaultStyles';
import AddressInput from '../../components/AddressInput';
import { FContainer, FButton } from '../../components/FloatButtons';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import loc from '../../loc';

const SignVerify = () => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { wallets, sleep } = useContext(BlueStorageContext);
  const { params } = useRoute();
  const [transactionMemo, setTransactionMemo] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [address, setAddress] = useState(params.address ?? '');
  const [message, setMessage] = useState(params.message ?? '');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageHasFocus, setMessageHasFocus] = useState(false);
  const [isShareVisible, setIsShareVisible] = useState(false);

  const wallet = wallets.find(w => w.getID() === params.walletID);
  const isToolbarVisibleForAndroid = Platform.OS === 'android' && messageHasFocus && isKeyboardVisible;

  useEffect(() => {
    Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setIsKeyboardVisible(true));
    Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      Keyboard.removeAllListeners(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow');
      Keyboard.removeAllListeners(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide');
    };
  }, []);

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    text: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      marginTop: 5,
      marginHorizontal: 20,
      borderWidth: 1,
      borderBottomWidth: 0.5,
      borderRadius: 4,
      textAlignVertical: 'top',
      borderColor: colors.element,
      borderBottomColor: colors.element,
      backgroundColor: colors.element,
      color: colors.foreground,
    },
    textMessage: {
      minHeight: 50,
    },
    flex: {
      flex: 1,
    },
    loading: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
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
  });

  const handleShare = () => {
    const baseUri = 'https://bluewallet.github.io/VerifySignature';
    const uri = `${baseUri}?a=${address}&m=${encodeURIComponent(message)}&s=${encodeURIComponent(signature)}`;
    Share.open({ message: uri }).catch(error => console.log(error));
  };

  const handleSign = async () => {
    setLoading(true);
    await sleep(10); // wait for loading indicator to appear
    let newSignature;
    try {
      newSignature = wallet.signMessage(message, address);
      setSignature(newSignature);
      setIsShareVisible(true);
    } catch (e) {
      ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
      Alert.alert(loc.errors.error, e.message);
    }

    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    await sleep(10); // wait for loading indicator to appear
    try {
      const res = wallet.verifyMessage(message, address, signature);
      Alert.alert(
        res ? loc._.success : loc.errors.error,
        res ? loc.addresses.sign_signature_correct : loc.addresses.sign_signature_incorrect,
      );
      if (res) {
        ReactNativeHapticFeedback.trigger('notificationSuccess', { ignoreAndroidSystemSettings: false });
      }
    } catch (e) {
      ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
      Alert.alert(loc.errors.error, e.message);
    }
    setLoading(false);
  };

  const handleFocus = value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessageHasFocus(value);
  };

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

  if (loading)
    return (
      <View style={[styles.root, styles.loading]}>
        <ActivityIndicator />
      </View>
    );

  return (
    // <SafeBlueArea style={[styles.root, stylesHooks.root]}>
    //   <StatusBar barStyle="light-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={styles.root}>
          {/* {!isKeyboardVisible && (
            <>
              <BlueSpacing20 />
              <BlueFormLabel>{loc.addresses.sign_help}</BlueFormLabel>
              <BlueSpacing20 />
            </>
          )} */}
          <View style={styles.addressBox}>
          <AddressInput
            onChangeText={t => setAddress(t.replace('\n', ''))}
            onBarScanned={processAddressData}
            address={address}
            editable={!loading}
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
            //inputAccessoryViewID={BlueDismissKeyboardInputAccessory.InputAccessoryViewID}
          />
        </View>
          <TextInput
            multiline
            textAlignVertical="top"
            blurOnSubmit
            placeholder={loc.addresses.sign_placeholder_address}
            placeholderTextColor="#81868e"
            value={address}
            onChangeText={t => setAddress(t.replace('\n', ''))}
            testID="Signature"
            style={styles.text}
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            editable={!loading}
          />
          <BlueSpacing10 />

          <TextInput
            multiline
            textAlignVertical="top"
            blurOnSubmit
            placeholder={loc.addresses.sign_placeholder_signature}
            placeholderTextColor="#81868e"
            value={signature}
            onChangeText={t => setSignature(t.replace('\n', ''))}
            testID="Signature"
            style={styles.text}
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            editable={!loading}
          />
          <BlueSpacing10 />

          <TextInput
            multiline
            placeholder={loc.addresses.sign_placeholder_message}
            placeholderTextColor="#81868e"
            value={message}
            onChangeText={setMessage}
            testID="Message"
            inputAccessoryViewID={BlueDoneAndDismissKeyboardInputAccessory.InputAccessoryViewID}
            style={[styles.flex, styles.text, styles.textMessage]}
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
            editable={!loading}
            onFocus={() => handleFocus(true)}
            onBlur={() => handleFocus(false)}
          />
          <BlueSpacing10 />

          {isShareVisible && !isKeyboardVisible && (
            <>
              <FContainer inline>
                <FButton
                  onPress={handleShare}
                  text={loc.multisig.share}
                  icon={
                    <View style={styles.buttonsIcon}>
                      <Icon name="external-link" size={16} type="feather" color={colors.foreground} />
                    </View>
                  }
                />
              </FContainer>
              <BlueSpacing10 />
            </>
          )}

          {!isKeyboardVisible && (
            <>
              <FContainer inline>
                <FButton onPress={handleSign} text={loc.addresses.sign_sign} disabled={loading} />
                <FButton onPress={handleVerify} text={loc.addresses.sign_verify} disabled={loading} />
              </FContainer>
              <BlueSpacing10 />
            </>
          )}

          {Platform.select({
            ios: (
              <BlueDoneAndDismissKeyboardInputAccessory
                onClearTapped={() => setMessage('')}
                onPasteTapped={text => {
                  setMessage(text);
                  Keyboard.dismiss();
                }}
              />
            ),
            android: isToolbarVisibleForAndroid && (
              <BlueDoneAndDismissKeyboardInputAccessory
                onClearTapped={() => {
                  setMessage('');
                  Keyboard.dismiss();
                }}
                onPasteTapped={text => {
                  setMessage(text);
                  Keyboard.dismiss();
                }}
              />
            ),
          })}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    // </SafeBlueArea>
  );
};

SignVerify.navigationOptions = navigationStyle({ closeButton: true, headerHideBackButton: true }, opts => ({
  ...opts,
  title: loc.addresses.sign_title,
}));

export default SignVerify;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  text: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginTop: 5,
    marginHorizontal: 20,
    borderWidth: 1,
    borderBottomWidth: 0.5,
    borderRadius: 4,
    textAlignVertical: 'top',
  },
  textMessage: {
    minHeight: 50,
  },
  flex: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
