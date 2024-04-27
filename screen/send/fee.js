import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Text,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  View,
  Image,
  TextInput,
  StyleSheet,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import navigationStyle from '../../components/navigationStyle';
import { HDSegwitBech32Wallet, SegwitP2SHWallet, HDSegwitP2SHWallet, LightningCustodianWallet, LightningLdkWallet } from '../../class';
import { Icon, colors } from 'react-native-elements';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useTheme, useNavigation } from '@react-navigation/native';
import { Chain } from '../../models/bitcoinUnits';
import loc from '../../loc';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import alert from '../../components/Alert';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { defaultStyles } from '../../components/defaultStyles';
const BlueApp = require('../../BlueApp');
const AppStorage = BlueApp.AppStorage;
const A = require('../../blue_modules/analytics');

import NetworkTransactionFees, { NetworkTransactionFee } from '../../models/networkTransactionFees';

const FeeSelect = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { addWallet, saveToDisk, isAdvancedModeEnabled, wallets } = useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);
  const [label, setLabel] = useState('');
  const [advancedMode, setadvancedMode] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState(false);
  const { navigate, goBack } = useNavigation();
  const [entropy, setEntropy] = useState();

  const [networkTransactionFees, setNetworkTransactionFees] = useState(new NetworkTransactionFee(3, 2, 1));
  const [networkTransactionFeesIsLoading, setNetworkTransactionFeesIsLoading] = useState(false);
  const [customFee, setCustomFee] = useState(null);
  const [feePrecalc, setFeePrecalc] = useState({ current: null, slowFee: null, mediumFee: null, fastestFee: null });
  const [feeUnit, setFeeUnit] = useState();

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

  const styles = StyleSheet.create({
    modal: {
      display: 'flex',
      flex: 1,
      marginTop: 32,
      paddingVertical: 32,
      paddingHorizontal: 24,
      borderRadius: 40,
      backgroundColor: colors.element,
    },
    content: {
      display: 'flex',
      flex: 1,
      gap: 24,
      marginBottom: 24,
    },
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
      borderRadius: 40,
      backgroundColor: colors.button,
    },
    buttonText: {
      color: colors.white,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 12,
    },
    advancedText: {
      fontWeight: '500',
    },
  });

  useEffect(() => {
    isAdvancedModeEnabled()
      .then(setadvancedMode)
      .finally(() => setIsLoading(false));

    // if (!wallet) return; // wait for it
    const fees = networkTransactionFees;
    const requestedSatPerByte = Number(feeRate);
    
    const newFeePrecalc = { ...feePrecalc };
    setFeePrecalc(newFeePrecalc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedMode, networkTransactionFees, feeRate]);


  const selectType = index => {
    Keyboard.dismiss();
    setSelectedIndex(index)
    switch (index) {
      case 0: {
        setSelectedWalletType(ButtonSelected.ONCHAIN);
        break;
      }
      case 1: {
        setBackdoorPressed(prevState => {
          return prevState + 1;
        });
        setSelectedWalletType(ButtonSelected.OFFCHAIN);
        break;
      }
      case 2: {
        setSelectedWalletType(ButtonSelected.VAULT);
        break;
      }
      case 3: {
        setSelectedWalletType(ButtonSelected.LDK);
        break;
      }
      default:
        break;
    }

  };

  const options = [
    {
      icon: require('../../img/icons/value.png'),
      label: loc.send.fee_fast,
      time: loc.send.fee_10m,
      fee: feePrecalc.fastestFee,
      rate: networkTransactionFees.fastestFee,
      active: Number(feeRate) === networkTransactionFees.fastestFee,
    },
    {
      icon: require('../../img/coins/vault.png'),
      label: loc.send.fee_medium,
      time: loc.send.fee_3h,
      fee: feePrecalc.mediumFee,
      rate: networkTransactionFees.mediumFee,
      active: Number(feeRate) === networkTransactionFees.mediumFee,
      disabled: networkTransactionFees.mediumFee === networkTransactionFees.fastestFee,
    },
    {
      icon: require('../../img/icons/calculator.png'),
      label: loc.send.fee_slow,
      time: loc.send.fee_1d,
      fee: feePrecalc.slowFee,
      rate: networkTransactionFees.slowFee,
      active: Number(feeRate) === networkTransactionFees.slowFee,
      disabled: networkTransactionFees.slowFee === networkTransactionFees.mediumFee || networkTransactionFees.slowFee === networkTransactionFees.fastestFee,
    },
  ];

  return (
    <View style={styles.modal}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Icon name="credit-card" type="feather" size={24} color={colors.foreground}/>
            <Text style={styles.header}>
              Transaction Fee
            </Text>
          </View>
          <View style={styles.buttons}>
            {options.map((x, index) => index ? (
            <View style={{ gap: 16}}>
              <View style={defaultStyles.divider}/>
              <View style={styles.row}>
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
                  ): (null)}
                  </View>
                  <Text style={styles.buttonText}>
                    {selectedIndex == index ? 'Selected' : 'Select'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            ) : (
              <View style={styles.row}>
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
            ))}
          </View>
            <View>
              <View style={[styles.headerContainer, { marginBottom: 24, }]}>
                <Icon name="settings" type="feather" size={24} color={colors.foreground}/>
                <Text style={styles.header}>
                  Custom Fee
                </Text>
              </View>
              {/* {advancedMode && (
              <View style={styles.input}>
                <TextInput
                  value={customFee}
                  onChangeText={() => {
                    setSelectedIndex(3);
                    setCustomFee();
                  }}
                  onSubmitEditing={Keyboard.dismiss}
                  placeholder={'Custom Fee in SATs'}
                  clearButtonMode="while-editing"
                  autoCapitalize="none"
                  keyboardType='numeric'
                  autoCorrect={false}
                  placeholderTextColor="#A6A6A6"
                  style={defaultStyles.inputText}
                  editable={!isLoading}
                  underlineColorAndroid="transparent"
                />
              </View>
              )} */}
            </View>
        </View>
        <TouchableOpacity
          testID="Create"
          style={defaultStyles.btn}
          onPress={() => {navigation.navigate('SendDetails', {feeRate: feeRate});}}
        >
          <Text style={defaultStyles.btnText}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
  );
};

FeeSelect.navigationOptions = navigationStyle({}, opts => ({ ...opts, title: 'Fee'}));

export default FeeSelect;