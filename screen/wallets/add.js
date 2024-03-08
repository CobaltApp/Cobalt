import React, { useState, useEffect, useContext } from 'react';
import {
  Text,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  StatusBar,
  TextInput,
  StyleSheet,
  Switch,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BlueText,
  BlueListItem,
  LightningButton,
  BitcoinButton,
  VaultButton,
  BlueFormLabel,
  BlueButton,
  BlueButtonLink,
  BlueSpacing20,
} from '../../BlueComponents';
import navigationStyleTx from '../../components/navigationStyle';
import { HDSegwitBech32Wallet, SegwitP2SHWallet, HDSegwitP2SHWallet, LightningCustodianWallet, LightningLdkWallet } from '../../class';
import { Icon, colors } from 'react-native-elements';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useTheme, useNavigation } from '@react-navigation/native';
import { Chain } from '../../models/bitcoinUnits';
import loc from '../../loc';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { LdkButton } from '../../components/LdkButton';
import alert from '../../components/Alert';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';
const BlueApp = require('../../BlueApp');
const AppStorage = BlueApp.AppStorage;
const A = require('../../blue_modules/analytics');

const ButtonSelected = Object.freeze({
  ONCHAIN: Chain.ONCHAIN,
  OFFCHAIN: Chain.OFFCHAIN,
  VAULT: 'VAULT',
  LDK: 'LDK',
});

const WalletsAdd = () => {
  const { colors } = useTheme();
  const { addWallet, saveToDisk, isAdvancedModeEnabled, wallets } = useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBaseURI, setWalletBaseURI] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [label, setLabel] = useState('');
  const [advancedMode, setadvancedMode] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState(false);
  const [backdoorPressed, setBackdoorPressed] = useState(1);
  const { navigate, goBack } = useNavigation();
  const [entropy, setEntropy] = useState();
  const [entropyButtonText, setEntropyButtonText] = useState(loc.wallets.add_entropy_provide);

  const styles = StyleSheet.create({
    headerContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 20,  
    },
    header: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 16,
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
  
    createButton: {
      flex: 1,
    },
    input: {
      flexDirection: 'row',
      minHeight: 54,
      padding: 12,
      alignItems: 'center',
      borderRadius: 25,
      backgroundColor: colors.card,
    },
    textInputCommon: {
      flex: 1,
      marginHorizontal: 16,
      fontFamily: 'Poppins',
      fontWeight: '400',
      fontSize: 16,
    },
    buttons: {
      display: 'flex',
      padding: 16,
      gap: 16,
      borderRadius: 25,
      backgroundColor: colors.card,
    },
    button: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 83,
      paddingVertical: 10,
      paddingHorizontal: 16,
      gap: 8,
      borderRadius: 40,
      backgroundColor: colors.primary,
    },
    buttonText: {
      color: colors.white,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 12,
    },
    modal: {
      display: 'flex',
      flex: 1,
      minHeight: ScreenHeight - 148,
      alignSelf: 'stretch',
      marginTop: 32,
      paddingVertical: 32,
      paddingHorizontal: 24,
      gap: 24,
      borderRadius: 40,
      backgroundColor: colors.element,
    },
    advancedText: {
      fontWeight: '500',
    },
    lndUri: {
      flexDirection: 'row',
      borderWidth: 1,
      borderBottomWidth: 0.5,
      minHeight: 44,
      height: 44,
      alignItems: 'center',
      marginVertical: 16,
      borderRadius: 4,
    },
    import: {
      marginBottom: 0,
      marginTop: 24,
    },
    noPadding: {
      paddingHorizontal: 0,
    },
  });

  useEffect(() => {
    AsyncStorage.getItem(AppStorage.LNDHUB)
      .then(url => setWalletBaseURI(url))
      .catch(() => setWalletBaseURI(''));
    isAdvancedModeEnabled()
      .then(setadvancedMode)
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedMode]);

  const entropyGenerated = newEntropy => {
    let entropyTitle;
    if (!newEntropy) {
      entropyTitle = loc.wallets.add_entropy_provide;
    } else if (newEntropy.length < 32) {
      entropyTitle = loc.formatString(loc.wallets.add_entropy_remain, {
        gen: newEntropy.length,
        rem: 32 - newEntropy.length,
      });
    } else {
      entropyTitle = loc.formatString(loc.wallets.add_entropy_generated, {
        gen: newEntropy.length,
      });
    }
    setEntropy(newEntropy);
    setEntropyButtonText(entropyTitle);
  };

  const createWallet = async () => {
    setIsLoading(true);

    let w;

    if (selectedWalletType === ButtonSelected.OFFCHAIN) {
      createLightningWallet(w);
    } else if (selectedWalletType === ButtonSelected.ONCHAIN) {
      if (selectedIndex === 2) {
        // zero index radio - HD segwit
        w = new HDSegwitP2SHWallet();
        w.setLabel(label || loc.wallets.details_title);
      } else if (selectedIndex === 1) {
        // btc was selected
        // index 1 radio - segwit single address
        w = new SegwitP2SHWallet();
        w.setLabel(label || loc.wallets.details_title);
      } else {
        // btc was selected
        // index 2 radio - hd bip84
        w = new HDSegwitBech32Wallet();
        w.setLabel(label || loc.wallets.details_title);
      }
      if (selectedWalletType === ButtonSelected.ONCHAIN) {
        if (entropy) {
          try {
            await w.generateFromEntropy(entropy);
          } catch (e) {
            console.log(e.toString());
            alert(e.toString());
            goBack();
            return;
          }
        } else {
          await w.generate();
        }
        addWallet(w);
        await saveToDisk();
        A(A.ENUM.CREATED_WALLET);
        ReactNativeHapticFeedback.trigger('notificationSuccess', { ignoreAndroidSystemSettings: false });
        if (w.type === HDSegwitP2SHWallet.type || w.type === HDSegwitBech32Wallet.type) {
          navigate('PleaseBackup', {
            walletID: w.getID(),
          });
        } else {
          goBack();
        }
      }
    } else if (selectedWalletType === ButtonSelected.VAULT) {
      setIsLoading(false);
      navigate('WalletsAddMultisig', { walletLabel: label.trim().length > 0 ? label : loc.multisig.default_label });
    } else if (selectedWalletType === ButtonSelected.LDK) {
      setIsLoading(false);
      createLightningLdkWallet(w);
    }
  };

  const createLightningLdkWallet = async wallet => {
    const foundLdk = wallets.find(w => w.type === LightningLdkWallet.type);
    if (foundLdk) {
      return alert('LDK wallet already exists');
    }
    setIsLoading(true);
    wallet = new LightningLdkWallet();
    wallet.setLabel(label || loc.wallets.details_title);

    await wallet.generate();
    await wallet.init();
    setIsLoading(false);
    addWallet(wallet);
    await saveToDisk();

    A(A.ENUM.CREATED_WALLET);
    ReactNativeHapticFeedback.trigger('notificationSuccess', { ignoreAndroidSystemSettings: false });
    navigate('PleaseBackupLdk', {
      walletID: wallet.getID(),
    });
  };

  const createLightningWallet = async wallet => {
    wallet = new LightningCustodianWallet();
    wallet.setLabel(label || loc.wallets.details_title);

    try {
      const lndhub = walletBaseURI?.trim();
      if (lndhub) {
        const isValidNodeAddress = await LightningCustodianWallet.isValidNodeAddress(lndhub);
        if (isValidNodeAddress) {
          wallet.setBaseURI(lndhub);
          await wallet.init();
        } else {
          throw new Error('The provided node address is not valid LNDHub node.');
        }
      }
      await wallet.createAccount();
      await wallet.authorize();
    } catch (Err) {
      setIsLoading(false);
      console.warn('lnd create failure', Err);
      if (Err.message) {
        return alert(Err.message);
      } else {
        return alert(loc.wallets.add_lndhub_error);
      }
      // giving app, not adding anything
    }
    A(A.ENUM.CREATED_LIGHTNING_WALLET);
    await wallet.generate();
    addWallet(wallet);
    await saveToDisk();

    A(A.ENUM.CREATED_WALLET);
    ReactNativeHapticFeedback.trigger('notificationSuccess', { ignoreAndroidSystemSettings: false });
    navigate('PleaseBackupLNDHub', {
      walletID: wallet.getID(),
    });
  };

  const navigateToEntropy = () => {
    navigate('ProvideEntropy', { onGenerated: entropyGenerated });
  };

  const navigateToImportWallet = () => {
    navigate('ImportWallet');
  };

  const handleOnVaultButtonPressed = () => {
    Keyboard.dismiss();
    setSelectedWalletType(ButtonSelected.VAULT);
  };

  const handleOnBitcoinButtonPressed = () => {
    Keyboard.dismiss();
    setSelectedWalletType(ButtonSelected.ONCHAIN);
  };

  const handleOnLightningButtonPressed = () => {
    setBackdoorPressed(prevState => {
      return prevState + 1;
    });
    Keyboard.dismiss();
    setSelectedWalletType(ButtonSelected.OFFCHAIN);
  };

  const handleOnLdkButtonPressed = async () => {
    Keyboard.dismiss();
    setSelectedWalletType(ButtonSelected.LDK);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.modal}>
      {/* <StatusBar
        barStyle={Platform.select({ ios: 'light-content', default: useColorScheme() === 'dark' ? 'light-content' : 'dark-content' })}
      /> */}
      {/* <KeyboardAvoidingView enabled behavior={Platform.OS === 'ios' ? 'padding' : null} keyboardVerticalOffset={62}> */}
        {/* <BlueFormLabel>{loc.wallets.add_wallet_name}</BlueFormLabel> */}
        <View style={styles.headerContainer}>
          <Icon name="type" type="feather" size={24} color={colors.foreground}/>
          <Text style={styles.header}>
            Name
          </Text>
        </View>
        <View style={styles.input}>
          <TextInput
            testID="WalletNameInput"
            value={label}
            placeholderTextColor="#A6A6A6"
            placeholder={loc.wallets.add_placeholder}
            onChangeText={setLabel}
            style={styles.textInputCommon}
            editable={!isLoading}
            underlineColorAndroid="transparent"
          />
        </View>
        <View style={styles.headerContainer}>
          <Icon name="credit-card" type="feather" size={24} color={colors.foreground}/>
          <Text style={styles.header}>
            Type
          </Text>
        </View>
        {/* <BlueFormLabel>{loc.wallets.add_wallet_type}</BlueFormLabel> */}
        <View style={styles.buttons}>
          <View style={styles.row}>
            <View style={styles.titleContainer}>
            <Image
              style={{ width: 32, height: 32 }}
              source={require('../../img/coins/bitcoin.png')}
            />
            <View>
              <Text style={styles.title}>
                Bitcoin
              </Text>
              <Text style={styles.subtitle}>
                Simple and powerful
              </Text>
            </View>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleOnBitcoinButtonPressed}
            >
              <View>
              {selectedWalletType === ButtonSelected.ONCHAIN ? ( 
                <Icon name="check" type="feather" size={12} color={colors.white}/>
              ): (null)}
              </View>
              <Text style={styles.buttonText}>
                {selectedWalletType === ButtonSelected.ONCHAIN ? 'Selected' : 'Select'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{borderWidth: 0.5, borderColor: '#535770'}}/>
          <View style={styles.row}>
            <View style={styles.titleContainer}>
            <Image
              style={{ width: 32, height: 32 }}
              source={require('../../img/coins/lightning.png')}
            />
            <View>
              <Text style={styles.title}>
                Lightning
              </Text>
              <Text style={styles.subtitle}>
                Instant transactions
              </Text>
            </View>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleOnLightningButtonPressed}
            >
              <View>
              {selectedWalletType === ButtonSelected.OFFCHAIN ? ( 
                <Icon name="check" type="feather" size={12} color={colors.white}/>
              ): (null)}
              </View>
              <Text style={styles.buttonText}>
                {selectedWalletType === ButtonSelected.OFFCHAIN ? 'Selected' : 'Select'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{borderWidth: 0.5, borderColor: '#535770'}}/>
          <View style={styles.row}>
            <View style={styles.titleContainer}>
            <Image
              style={{ width: 32, height: 32 }}
              source={require('../../img/coins/vault.png')}
            />
            <View>
              <Text style={styles.title}>
                Vault
              </Text>
              <Text style={styles.subtitle}>
                Secure for larger sums
              </Text>
            </View>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleOnVaultButtonPressed}
            >
              <View>
              {selectedWalletType === ButtonSelected.VAULT ? ( 
                <Icon name="check" type="feather" size={12} color={colors.white}/>
              ): (null)}
              </View>
              <Text style={styles.buttonText}>
                {selectedWalletType === ButtonSelected.VAULT ? 'Selected' : 'Select'}
              </Text>
            </TouchableOpacity>
          </View>
          {backdoorPressed > 100 ? (
            <LdkButton
              active={selectedWalletType === ButtonSelected.LDK}
              onPress={handleOnLdkButtonPressed}
              style={styles.button}
              subtext={LightningLdkWallet.getPackageVersion()}
              text="LDK"
            />
          ) : null}
        </View>
        {selectedWalletType != ButtonSelected.VAULT && advancedMode ? (
        <View>
          <View style={[styles.headerContainer, { marginBottom: 24 }]}>
            <Icon name="settings" type="feather" size={24} color={colors.foreground}/>
            <Text style={styles.header}>
              Advanced Options
            </Text>
          </View>
          {selectedWalletType === ButtonSelected.ONCHAIN ? (
          <View style={[styles.buttons, { marginBottom: 66 }]}>
            <View style={styles.row}>
            <View style={styles.titleContainer}>
            <Image
              style={{ width: 32, height: 32 }}
              source={require('../../img/coins/bitcoin.png')}
            />
            <View>
              <Text style={styles.title}>
                HD SegWit (Bech32 Native)
              </Text>
              <Text style={styles.subtitle}>
                Streamlined, secure transactions
              </Text>
            </View>
            </View>
            <Switch value={selectedIndex === 0} onValueChange={() => setSelectedIndex(0)} trackColor={{false: colors.element, true: colors.primary}} thumbColor={colors.dark}/>
          </View>
          <View style={{borderWidth: 0.5, borderColor: '#535770'}}/>
          <View style={styles.row}>
            <View style={styles.titleContainer}>
            <Image
              style={{ width: 32, height: 32 }}
              source={require('../../img/coins/lightning.png')}
            />
            <View>
              <Text style={styles.title}>
                HD SegWit (P2SH)
              </Text>
              <Text style={styles.subtitle}>
                Enhanced security
              </Text>
            </View>
            </View>
            <Switch value={selectedIndex === 1} onValueChange={() => setSelectedIndex(1)} trackColor={{false: colors.element, true: colors.primary}} thumbColor={colors.dark}/>
          </View>
          <View style={{borderWidth: 0.5, borderColor: '#535770'}}/>
          <View style={styles.row}>
            <View style={styles.titleContainer}>
            <Image
              style={{ width: 32, height: 32 }}
              source={require('../../img/coins/vault.png')}
            />
            <View>
              <Text style={styles.title}>
                SegWit
              </Text>
              <Text style={styles.subtitle}>
                Efficient and secure
              </Text>
            </View>
            </View>
            <Switch value={selectedIndex === 2} onValueChange={() => setSelectedIndex(2)} trackColor={{false: colors.element, true: colors.primary}} thumbColor={colors.dark}/>
          </View>
        </View>
            ) : (
              <View style={styles.input}>
                    <TextInput
                      value={walletBaseURI}
                      onChangeText={setWalletBaseURI}
                      onSubmitEditing={Keyboard.dismiss}
                      placeholder={loc.wallets.add_lndhub_placeholder}
                      clearButtonMode="while-editing"
                      autoCapitalize="none"
                      textContentType="URL"
                      autoCorrect={false}
                      placeholderTextColor="#A6A6A6"
                      style={styles.textInputCommon}
                      editable={!isLoading}
                      underlineColorAndroid="transparent"
                    />
                </View>
            ) }
          </View>
        ) : null }

          {/* {advancedMode && selectedWalletType === ButtonSelected.ONCHAIN && !isLoading && (
            <BlueButtonLink style={styles.import} title={entropyButtonText} onPress={navigateToEntropy} />
          )} */}
        <View style={{ position: 'absolute', bottom: 48, width: ScreenWidth, gap: 16, paddingHorizontal: 24,}}>
            {!isLoading ? (
              <TouchableOpacity
                testID="Create"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: 30,
                  backgroundColor: colors.primary,
                }}
                onPress={createWallet}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: 16,

                  }}
                >
                  Create
                </Text>
              </TouchableOpacity>
            ) : (
              <ActivityIndicator />
            )}
          {!isLoading && (
            <TouchableOpacity
              testID="ImportWallet"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: 30,
                  backgroundColor: '#0B376C',
                }}
                onPress={navigateToImportWallet}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: 16,

                  }}
                >
                  Import Wallet
                </Text>
              </TouchableOpacity>
          )}
          </View>
        </View>
      {/* </KeyboardAvoidingView> */}
    </ScrollView>
  );
};

WalletsAdd.navigationOptions = navigationStyleTx(
  {
    headerStyle: {
      backgroundColor: colors.background,
    },
  },
  opts => ({ ...opts, title: loc.wallets.add_title }),
);

export default WalletsAdd;
