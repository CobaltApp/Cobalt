import React, { useContext, useEffect, useState } from 'react';
import { View, ActivityIndicator, Image, Text, TouchableOpacity, I18nManager, FlatList, StyleSheet, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useRoute, useTheme, useNavigation, useNavigationState } from '@react-navigation/native';

import { SafeBlueArea, BlueText, BlueSpacing20, BluePrivateBalance } from '../../../BlueComponents';
import navigationStyle from '../../components/navigationStyle';
import WalletGradient from '../../class/wallet-gradient';
import loc, { formatBalance, transactionTimeToReadable } from '../../loc';
import { LightningLdkWallet, MultisigHDWallet, LightningCustodianWallet } from '../../class';
import { BlueStorageContext } from '../../custom-modules/storage-context';

const SelectWallet = () => {
  const { chainType, onWalletSelect, availableWallets, noWalletExplanationText } = useRoute().params;
  const [isLoading, setIsLoading] = useState(true);
  const { pop, navigate, setOptions, dangerouslyGetParent } = useNavigation();
  const { wallets } = useContext(BlueStorageContext);
  const { colors, closeImage } = useTheme();
  const isModal = useNavigationState(state => state.routes.length) === 1;
  let data = chainType
    ? wallets.filter(item => item.chain === chainType && item.allowSend())
    : wallets.filter(item => item.allowSend()) || [];

  if (availableWallets && availableWallets.length > 0) {
    // availableWallets if provided, overrides chainType argument and `allowSend()` check
    data = availableWallets;
  }
  const styles = StyleSheet.create({
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignContent: 'center',
      paddingTop: 20,
      backgroundColor: colors.background,
    },
    itemRoot: {
      backgroundColor: 'transparent',
      padding: 10,
      marginVertical: 17,
    },
    gradient: {
      padding: 15,
      borderRadius: 10,
      minHeight: 164,
      elevation: 5,
    },
    image: {
      width: 99,
      height: 94,
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
    transparentText: {
      backgroundColor: 'transparent',
    },
    label: {
      backgroundColor: 'transparent',
      fontSize: 19,
      color: '#fff',
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    },

    balance: {
      backgroundColor: 'transparent',
      fontWeight: 'bold',
      fontSize: 36,
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',

      color: '#fff',
    },
    latestTxLabel: {
      backgroundColor: 'transparent',
      fontSize: 13,
      color: '#fff',
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    },
    latestTxValue: {
      backgroundColor: 'transparent',
      fontWeight: 'bold',
      fontSize: 16,
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',

      color: '#fff',
    },
    noWallets: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
    },
    center: {
      textAlign: 'center',
    },
  });

  useEffect(() => {
    console.log('SelectWallet - useEffect');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setOptions(
      isModal
        ? {
            // eslint-disable-next-line react/no-unstable-nested-components
            headerLeft: () => (
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.button}
                onPress={() => {
                  dangerouslyGetParent().pop();
                }}
                testID="NavigationCloseButton"
              >
                <Image source={closeImage} />
              </TouchableOpacity>
            ),
          }
        : {},
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeImage, isModal, styles.button]);

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          ReactNativeHapticFeedback.trigger('selection', { ignoreAndroidSystemSettings: false });
          onWalletSelect(item, { navigation: { pop, navigate } });
        }}
        accessibilityRole="button"
      >
        <View style={styles.itemRoot}>
          <View backgroundColor={WalletGradient.gradientsFor(item.type)} style={styles.gradient}>
            <Image
              source={(() => {
                switch (item.type) {
                  case LightningLdkWallet.type:
                  case LightningCustodianWallet.type:
                    return I18nManager.isRTL ? require('../../../assets/lnd-shape-rtl.png') : require('../../../assets/lnd-shape.png');
                  case MultisigHDWallet.type:
                    return I18nManager.isRTL ? require('../../../assets/vault-shape-rtl.png') : require('../../../assets/vault-shape.png');
                  default:
                    return I18nManager.isRTL ? require('../../../assets/btc-shape-rtl.png') : require('../../../assets/btc-shape.png');
                }
              })()}
              style={styles.image}
            />

            <Text style={styles.transparentText} />
            <Text numberOfLines={1} style={styles.label}>
              {item.getLabel()}
            </Text>
            {item.hideBalance ? (
              <BluePrivateBalance />
            ) : (
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.balance}>
                {formatBalance(Number(item.getBalance()), item.getPreferredBalanceUnit(), true)}
              </Text>
            )}
            <Text style={styles.transparentText} />
            <Text numberOfLines={1} style={styles.latestTxLabel}>
              {loc.wallets.list_latest_transaction}
            </Text>
            <Text numberOfLines={1} style={styles.latestTxValue}>
              {transactionTimeToReadable(item.getLatestTransactionTime())}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator />
      </View>
    );
  } else if (data.length <= 0) {
    return (
      <SafeBlueArea>
        <StatusBar barStyle="light-content" />
        <View style={styles.noWallets}>
          <BlueText style={styles.center}>{loc.wallets.select_no_bitcoin}</BlueText>
          <BlueSpacing20 />
          <BlueText style={styles.center}>{noWalletExplanationText || loc.wallets.select_no_bitcoin_exp}</BlueText>
        </View>
      </SafeBlueArea>
    );
  } else {
    return (
      <SafeBlueArea>
        <StatusBar barStyle="default" />
        <FlatList extraData={data} data={data} renderItem={renderItem} keyExtractor={(_item, index) => `${index}`} />
      </SafeBlueArea>
    );
  }
};

SelectWallet.navigationOptions = navigationStyle({}, opts => ({ ...opts, headerTitle: loc.wallets.select_wallet }));

export default SelectWallet;
