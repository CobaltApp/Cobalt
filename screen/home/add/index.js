import React, { useState, useEffect, useContext } from 'react';
import {
  Text,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  View,
  Image,
  StatusBar,
  TextInput,
  StyleSheet,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import navigationStyle from '../../../components/navigationStyle';
import { HDSegwitBech32Wallet, SegwitP2SHWallet, HDSegwitP2SHWallet, LightningCustodianWallet, LightningLdkWallet } from '../../../class';
import { Icon } from 'react-native-elements';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useTheme, useNavigation } from '@react-navigation/native';
import { Chain } from '../../../models/bitcoinUnits';
import loc from '../../../loc';
import { BlueStorageContext } from '../../../blue_modules/storage-context';
import alert from '../../../components/Alert';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';
import { defaultStyles } from '../../../components/defaultStyles';
import InputSection from '../../../components/section-input';
import Button from '../../../components/button-primary';

const BlueApp = require('../../../BlueApp');
const AppStorage = BlueApp.AppStorage;
const A = require('../../../blue_modules/analytics');

const ButtonSelected = Object.freeze({
  ONCHAIN: Chain.ONCHAIN,
  OFFCHAIN: Chain.OFFCHAIN,
  VAULT: 'VAULT',
  LDK: 'LDK',
});

// const types = [
//   {
//     icon: require('../../img/coins/bitcoin.png'),
//     name: 'Bitcoin',
//     desc: 'Simple and powerful',
//   },
//   {
//     icon: require('../../img/coins/vault.png'),
//     name: 'Vault',
//     desc: 'Secure for larger sums',
//   },
// ];

// const options = [
//   {
//     icon: require('../../img/icons/value.png'),
//     name: 'HD SegWit (Bech32 Native)',
//     desc: 'Streamlined, secure transactions',
//   },
//   {
//     icon: require('../../img/coins/vault.png'),
//     name: 'HD SegWit (P2SH)',
//     desc: 'Enhanced security',
//   },
//   {
//     icon: require('../../img/icons/calculator.png'),
//     name: 'SegWit',
//     desc: 'Efficient and secure',
//   },
// ];

const WalletsAdd = () => {
  const { colors } = useTheme();
  const { addWallet, saveToDisk, isAdvancedModeEnabled, wallets } = useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBaseURI, setWalletBaseURI] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [selectedOption, setSelectedOption] = useState(0);
  const [label, setLabel] = useState('');
  const [advancedMode, setadvancedMode] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState(ButtonSelected.ONCHAIN);
  const [backdoorPressed, setBackdoorPressed] = useState(1);
  const { navigate, goBack } = useNavigation();
  const [entropy, setEntropy] = useState(false);
  const [ hideOptions, setHideOptions ] = useState(true);
  const [ isError, setIsError ] = useState(false);

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
      borderRadius: 40,
      backgroundColor: colors.button,
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
      justifyContent: 'space-between',
      marginTop: 32,
      paddingVertical: 32,
      paddingHorizontal: 24,
      borderRadius: 40,
      backgroundColor: colors.element,
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

  const createWallet = async () => {
    setIsLoading(true);

    let w;
    if (label != '') {
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
            navigate('Backup', {
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
    } else {
      setIsLoading(false);
      setIsError(true);
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

  const navigateToImportWallet = () => {
    navigate('ImportWallet');
  };

  const selectType = index => {
    Keyboard.dismiss();
    setSelectedIndex(index)
    switch (index) {
      case 0: {
        setSelectedWalletType(ButtonSelected.ONCHAIN);
        setHideOptions(!advancedMode);
        break;
      }
      // case 1: {
      //   setBackdoorPressed(prevState => {
      //     return prevState + 1;
      //   });
      //   setSelectedWalletType(ButtonSelected.OFFCHAIN);
      //   break;
      // }
      case 1: {
        setSelectedWalletType(ButtonSelected.VAULT);
        break;
      }
      // case 2: {
      //   setSelectedWalletType(ButtonSelected.LDK);
      //   break;
      // }
      default:
        break;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={defaultStyles.modal}>
        <View>
          <View style={{ gap: 12 }}>
            <View style={{display: 'flex', flexDirection: 'row', gap: 8}}>
              <View
                style={{
                  height: 24,
                  width: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 100,
                  backgroundColor: colors.foreground
                }}
              >
                <Text style={defaultStyles.btnText}>
                  1
                </Text>
              </View>
              <Text style={defaultStyles.h4}>
                Setup
              </Text>
            </View>
            <Text style={defaultStyles.label}>{loc.wallets.add_wallet_prompt}</Text>
          </View>
          <View style={{ marginTop: 32, gap: 32 }}>
            <InputSection
              label={loc.wallets.add_wallet_name}
              placeholderText={loc.wallets.add_placeholder}
              input={label}
              max={18}
              onChange={setLabel}
              enabled={!isLoading}
              error={isError}
            />
          </View>
        </View>
        <Button title={"Create"} action={createWallet}/>
        </View>
    </View>
      // <View style={styles.modal}>
      //   <View 
      //     style={{
      //       gap: 24,
      //       marginBottom: 24,
      //     }}
      //   >
      //     <View style={styles.headerContainer}>
      //       <Icon name="type" type="feather" size={24} color={colors.foreground}/>
      //       <Text style={styles.header}>
      //         Name
      //       </Text>
      //     </View>
      //     <View style={styles.input}>
      //       <TextInput
      //         testID="WalletNameInput"
      //         value={label}
      //         placeholderTextColor="#A6A6A6"
      //         placeholder={loc.wallets.add_placeholder}
      //         onChangeText={setLabel}
      //         style={styles.textInputCommon}
      //         editable={!isLoading}
      //         underlineColorAndroid="transparent"
      //       />
      //     </View>
      //     <View style={styles.headerContainer}>
      //       <Icon name="credit-card" type="feather" size={24} color={colors.foreground}/>
      //       <Text style={styles.header}>
      //         Type
      //       </Text>
      //     </View>
      //     <View style={styles.buttons}>
      //       {types.map((x, index) => index ? (
      //       <View style={{ gap: 16}}>
      //         <View style={defaultStyles.divider}/>
      //         <View style={styles.row}>
      //           <View style={styles.titleContainer}>
      //           <Image
      //             style={{ width: 32, height: 32 }}
      //             source={x.icon}
      //           />
      //           <View>
      //             <Text style={styles.title}>
      //               {x.name}
      //             </Text>
      //             <Text style={styles.subtitle}>
      //               {x.desc}
      //             </Text>
      //           </View>
      //           </View>
      //           <TouchableOpacity
      //             style={styles.button}
      //             onPress={() => selectType(index)}
      //           >
      //             <View>
      //             {selectedIndex == index ? ( 
      //               <Icon name="check" type="feather" size={12} color={colors.white} style={{marginRight: 8}}/>
      //             ): (null)}
      //             </View>
      //             <Text style={styles.buttonText}>
      //               {selectedIndex == index ? 'Selected' : 'Select'}
      //             </Text>
      //           </TouchableOpacity>
      //         </View>
      //       </View>
      //       ) : (
      //         <View style={styles.row}>
      //           <View style={styles.titleContainer}>
      //           <Image
      //             style={{ width: 32, height: 32 }}
      //             source={x.icon}
      //           />
      //           <View>
      //             <Text style={styles.title}>
      //               {x.name}
      //             </Text>
      //             <Text style={styles.subtitle}>
      //               {x.desc}
      //             </Text>
      //           </View>
      //           </View>
      //           <TouchableOpacity
      //             style={styles.button}
      //             onPress={() => selectType(index)}
      //           >
      //             <View>
      //             {selectedIndex == index ? ( 
      //               <Icon name="check" type="feather" size={12} color={colors.white} style={{marginRight: 8}}/>
      //             ): (null)}
      //             </View>
      //             <Text style={styles.buttonText}>
      //               {selectedIndex == index ? 'Selected' : 'Select'}
      //             </Text>
      //           </TouchableOpacity>
      //         </View>
      //       ))}
      //     </View>
      //     {!hideOptions ? (
      //     <View>
      //       <View style={[styles.headerContainer, { marginBottom: 24 }]}>
      //         <Icon name="settings" type="feather" size={24} color={colors.foreground}/>
      //         <Text style={styles.header}>
      //           Advanced Options
      //         </Text>
      //       </View>
      //       {selectedWalletType === ButtonSelected.ONCHAIN ? (
      //       <View style={styles.buttons}>
      //         {options.map((x, index) => index ? (
      //         <View style={{ gap: 16}}>
      //           <View style={defaultStyles.divider}/>
      //           <View style={styles.row}>
      //             <View style={styles.titleContainer}>
      //             <Image
      //               style={{ width: 32, height: 32 }}
      //               source={x.icon}
      //             />
      //             <View>
      //               <Text style={styles.title}>
      //                 {x.name}
      //               </Text>
      //               <Text style={styles.subtitle}>
      //                 {x.desc}
      //               </Text>
      //             </View>
      //             </View>
      //             <Switch value={selectedOption === index} onValueChange={() => setSelectedOption(index)} trackColor={{false: colors.element, true: colors.primary}} thumbColor={colors.dark}/>
      //           </View>
      //         </View>
      //         ) : (
      //         <View style={styles.row}>
      //             <View style={styles.titleContainer}>
      //             <Image
      //               style={{ width: 32, height: 32 }}
      //               source={x.icon}
      //             />
      //             <View>
      //               <Text style={styles.title}>
      //                 {x.name}
      //               </Text>
      //               <Text style={styles.subtitle}>
      //                 {x.desc}
      //               </Text>
      //             </View>
      //             </View>
      //             <Switch value={selectedOption === index} onValueChange={() => setSelectedOption(index)} trackColor={{false: colors.element, true: colors.primary}} thumbColor={colors.dark}/>
      //         </View>
      //       ))}
      //     </View>
      //         ) : (null
      //           // <View style={styles.input}>
      //           //       <TextInput
      //           //         value={walletBaseURI}
      //           //         onChangeText={setWalletBaseURI}
      //           //         onSubmitEditing={Keyboard.dismiss}
      //           //         placeholder={loc.wallets.add_lndhub_placeholder}
      //           //         clearButtonMode="while-editing"
      //           //         autoCapitalize="none"
      //           //         textContentType="URL"
      //           //         autoCorrect={false}
      //           //         placeholderTextColor="#A6A6A6"
      //           //         style={styles.textInputCommon}
      //           //         editable={!isLoading}
      //           //         underlineColorAndroid="transparent"
      //           //       />
      //           //   </View>
      //         ) }
      //       </View>
      //     ) : null }
      //   </View>
      //   <View style={{ gap: 16 }}>
      //       {!isLoading ? (
      //         <TouchableOpacity
      //           testID="Create"
      //           style={defaultStyles.btn}
      //           onPress={createWallet}
      //         >
      //           <Text style={defaultStyles.btnText}>
      //             Create
      //           </Text>
      //         </TouchableOpacity>
      //       ) : (
      //         <ActivityIndicator />
      //       )}
      //     {!isLoading && (
      //       <TouchableOpacity
      //         testID="ImportWallet"
      //           style={defaultStyles.btnSecondary}
      //           onPress={navigateToImportWallet}
      //         >
      //           <Text style={defaultStyles.btnSecondaryText}>
      //             Import Wallet
      //           </Text>
      //         </TouchableOpacity>
      //     )}
      //   </View>
      //   </View>
  );
};

WalletsAdd.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: loc.wallets.add_title }));

export default WalletsAdd;
