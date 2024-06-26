import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  InteractionManager,
  PixelRatio,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  findNodeHandle,
  TouchableOpacity,
  View,
  I18nManager,
  Image,
} from 'react-native';
import { Icon, colors } from 'react-native-elements';
import { useRoute, useNavigation, useTheme, useFocusEffect } from '@react-navigation/native';
import { Chain } from '../../models/bitcoinUnits';
import { BlueAlertWalletExportReminder } from '../../BlueComponents';
import WalletGradient from '../../class/wallet-gradient';
import navigationStyle from '../../components/navigationStyle';
import { LightningCustodianWallet, LightningLdkWallet, MultisigHDWallet, WatchOnlyWallet } from '../../class';
import ActionSheet from '../ActionSheet';
import loc from '../../loc';
import { FContainer, FButton } from '../../components/FloatButtons';
import { BlueStorageContext } from '../../blue_modules/storage-context';
import { isDesktop } from '../../blue_modules/environment';
import BlueClipboard from '../../blue_modules/clipboard';
import LNNodeBar from '../../components/LNNodeBar';
import TransactionsNavigationHeader, { actionKeys } from '../../components/TransactionsNavigationHeader';
import { TransactionListItem } from '../../components/TransactionListItem';
import alert from '../../components/Alert';
import PropTypes from 'prop-types';
import { Button } from 'react-native-elements';
import { defaultStyles } from '../../components/defaultStyles';

const fs = require('../../blue_modules/fs');
const BlueElectrum = require('../../blue_modules/BlueElectrum');

const buttonFontSize =
  PixelRatio.roundToNearestPixel(Dimensions.get('window').width / 26) > 22
    ? 22
    : PixelRatio.roundToNearestPixel(Dimensions.get('window').width / 13);

const WalletTransactions = ({ navigation }) => {
  const { wallets, saveToDisk, setSelectedWallet, walletTransactionUpdateStatus, isElectrumDisabled } = useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(false);
  const { walletID } = useRoute().params;
  const { name } = useRoute();
  const wallet = wallets.find(w => w.getID() === walletID);
  const [itemPriceUnit, setItemPriceUnit] = useState(wallet.getPreferredBalanceUnit());
  const [dataSource, setDataSource] = useState(wallet.getTransactions(15));
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [limit, setLimit] = useState(15);
  const [pageSize, setPageSize] = useState(20);
  const { setParams, setOptions, navigate } = useNavigation();
  const { colors } = useTheme();
  const [lnNodeInfo, setLnNodeInfo] = useState({ canReceive: 0, canSend: 0 });
  const walletActionButtonsRef = useRef();

  const stylesHook = StyleSheet.create({
    listHeaderText: {
      color: colors.foregroundInactive,
    },
    browserButton2: {
      backgroundColor: colors.element,
    },
    marketpalceText1: {
      color: colors.foreground,
    },
    list: {
      backgroundColor: colors.background,
    },
  });

  /**
   * Simple wrapper for `wallet.getTransactions()`, where `wallet` is current wallet.
   * Sorts. Provides limiting.
   *
   * @param lmt {Integer} How many txs return, starting from the earliest. Default: all of them.
   * @returns {Array}
   */
  const getTransactionsSliced = (lmt = Infinity) => {
    let txs = wallet.getTransactions();
    for (const tx of txs) {
      tx.sort_ts = +new Date(tx.received);
    }
    txs = txs.sort(function (a, b) {
      return b.sort_ts - a.sort_ts;
    });
    return txs.slice(0, lmt);
  };

  useEffect(() => {
    const interval = setInterval(() => setTimeElapsed(prev => prev + 1), 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // useEffect(() => {
  //   setOptions({ headerTitle: wallet.getLabel() });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [walletTransactionUpdateStatus]);

  useEffect(() => {
    setIsLoading(true);
    setLimit(15);
    setPageSize(20);
    setTimeElapsed(0);
    setItemPriceUnit(wallet.getPreferredBalanceUnit());
    setIsLoading(false);
    setSelectedWallet(wallet.getID());
    setDataSource(wallet.getTransactions(15));
    setOptions({
      headerTitle: wallet.getLabel(),
      headerRight: () => (
        <TouchableOpacity
          accessibilityRole="button"
          testID="WalletDetails"
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            height: 44,
            width: 44,
            borderRadius: 22,
            backgroundColor: colors.card,
          }}
          onPress={() =>
            navigate('WalletDetails', { walletID: walletID })
          }
        >
          <Icon name="more-horizontal" type="feather" size={24} color={colors.foreground} />
        </TouchableOpacity>
      ),
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletID]);

  useEffect(() => {
    const newWallet = wallets.find(w => w.getID() === walletID);
    if (newWallet) {
      setParams({ walletID, isLoading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletID]);

  // refresh transactions if it never hasn't been done. It could be a fresh imported wallet
  useEffect(() => {
    if (wallet.getLastTxFetch() === 0) {
      refreshTransactions();
    }
    refreshLnNodeInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if description of transaction has been changed we want to show new one
  useFocusEffect(
    useCallback(() => {
      setTimeElapsed(prev => prev + 1);
    }, []),
  );

  const isLightning = () => {
    const w = wallet;
    if (w && w.chain === Chain.OFFCHAIN) {
      return true;
    }

    return false;
  };

  const refreshLnNodeInfo = () => {
    if (wallet.type === LightningLdkWallet.type) {
      setLnNodeInfo({ canReceive: wallet.getReceivableBalance(), canSend: wallet.getBalance() });
    }
  };

  /**
   * Forcefully fetches TXs and balance for wallet
   */
  const refreshTransactions = async () => {
    if (isElectrumDisabled) return setIsLoading(false);
    if (isLoading) return;
    setIsLoading(true);
    let noErr = true;
    let smthChanged = false;
    try {
      refreshLnNodeInfo();
      // await BlueElectrum.ping();
      await BlueElectrum.waitTillConnected();
      if (wallet.allowBIP47() && wallet.isBIP47Enabled()) {
        const pcStart = +new Date();
        await wallet.fetchBIP47SenderPaymentCodes();
        const pcEnd = +new Date();
        console.log(wallet.getLabel(), 'fetch payment codes took', (pcEnd - pcStart) / 1000, 'sec');
      }
      const balanceStart = +new Date();
      const oldBalance = wallet.getBalance();
      await wallet.fetchBalance();
      if (oldBalance !== wallet.getBalance()) smthChanged = true;
      const balanceEnd = +new Date();
      console.log(wallet.getLabel(), 'fetch balance took', (balanceEnd - balanceStart) / 1000, 'sec');
      const start = +new Date();
      const oldTxLen = wallet.getTransactions().length;
      await wallet.fetchTransactions();
      if (wallet.fetchPendingTransactions) {
        await wallet.fetchPendingTransactions();
      }
      if (wallet.fetchUserInvoices) {
        await wallet.fetchUserInvoices();
      }
      if (oldTxLen !== wallet.getTransactions().length) smthChanged = true;
      const end = +new Date();
      console.log(wallet.getLabel(), 'fetch tx took', (end - start) / 1000, 'sec');
    } catch (err) {
      noErr = false;
      alert(err.message);
      setIsLoading(false);
      setTimeElapsed(prev => prev + 1);
    }
    if (noErr && smthChanged) {
      console.log('saving to disk');
      await saveToDisk(); // caching
      //    setDataSource([...getTransactionsSliced(limit)]);
    }
    setIsLoading(false);
    setTimeElapsed(prev => prev + 1);
  };

  const _keyExtractor = (_item, index) => index.toString();

  const renderListFooterComponent = () => {
    // if not all txs rendered - display indicator
    return (getTransactionsSliced(Infinity).length > limit && <ActivityIndicator style={styles.activityIndicator} />) || <View />;
  };

  const renderListHeaderComponent = () => {
    const style = {};
    if (!isDesktop) {
      // we need this button for testing
      style.opacity = 0;
      style.height = 1;
      style.width = 1;
    } else if (isLoading) {
      style.opacity = 0.5;
    } else {
      style.opacity = 1.0;
    }

    return (
      <View style={{flex: 1}}>
        <View 
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          {wallet.chain === Chain.OFFCHAIN && renderLappBrowserButton()}</View>
          {wallet.type === LightningLdkWallet.type && (lnNodeInfo.canSend > 0 || lnNodeInfo.canReceive > 0) && (
          <View style={[styles.marginHorizontal18, styles.marginBottom18]}>
            <LNNodeBar canSend={lnNodeInfo.canSend} canReceive={lnNodeInfo.canReceive} itemPriceUnit={itemPriceUnit} />
          </View>
        )}
        <View 
          style={{
            flex: 1,
            marginHorizontal: 24,
            marginTop: 32,
            marginBottom: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text style={defaultStyles.h2}>
            {loc.transactions.list_title}
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            testID="refreshTransactions"
            style={style}
            onPress={refreshTransactions}
            disabled={isLoading}
          >
            <Icon name="refresh-cw" type="feather" color={colors.element} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLappBrowserButton = () => {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => {
          navigate('LappBrowserRoot', {
            screen: 'LappBrowser',
            params: {
              walletID,
              url: 'https://duckduckgo.com',
            },
          });
        }}
        style={[styles.browserButton2, stylesHook.browserButton2]}
      >
        <Text style={[styles.marketpalceText1, stylesHook.marketpalceText1]}>{loc.wallets.list_ln_browser}</Text>
      </TouchableOpacity>
    );
  };

  const onWalletSelect = async selectedWallet => {
    if (selectedWallet) {
      navigate('WalletTransactions', {
        walletType: wallet.type,
        walletID: wallet.getID(),
        key: `WalletTransactions-${wallet.getID()}`,
      });
      /** @type {LightningCustodianWallet} */
      let toAddress = false;
      if (wallet.refill_addressess.length > 0) {
        toAddress = wallet.refill_addressess[0];
      } else {
        try {
          await wallet.fetchBtcAddress();
          toAddress = wallet.refill_addressess[0];
        } catch (Err) {
          return alert(Err.message);
        }
      }
      navigate('SendDetails',
        {
          memo: loc.lnd.refill_lnd_balance,
          address: toAddress,
          walletID: selectedWallet.getID(),
        },
      );
    }
  };
  const navigateToSendScreen = () => {
    navigate('SendDetails',
      {
        walletID: wallet.getID(),
      },
    );
  };

  const renderItem = item => (
    <TransactionListItem item={item.item} itemPriceUnit={itemPriceUnit} timeElapsed={timeElapsed} walletID={walletID} />
  );

  const onBarCodeRead = ret => {
    if (!isLoading) {
      setIsLoading(true);
      const params = {
        walletID: wallet.getID(),
        uri: ret.data ? ret.data : ret,
      };
      if (wallet.chain === Chain.ONCHAIN) {
        navigate('SendDetails', params);
      } else {
        navigate('ScanLndInvoiceRoot', { screen: 'ScanLndInvoice', params });
      }
    }
    setIsLoading(false);
  };

  const choosePhoto = () => {
    fs.showImagePickerAndReadImage().then(onBarCodeRead);
  };

  const copyFromClipboard = async () => {
    onBarCodeRead({ data: await BlueClipboard().getClipboardContent() });
  };

  const sendButtonPress = () => {
    if (wallet.chain === Chain.OFFCHAIN) {
      return navigate('ScanLndInvoiceRoot', { screen: 'ScanLndInvoice', params: { walletID: wallet.getID() } });
    }

    if (wallet.type === WatchOnlyWallet.type && wallet.isHd() && !wallet.useWithHardwareWalletEnabled()) {
      return Alert.alert(
        loc.wallets.details_title,
        loc.transactions.enable_offline_signing,
        [
          {
            text: loc._.ok,
            onPress: async () => {
              wallet.setUseWithHardwareWalletEnabled(true);
              await saveToDisk();
              navigateToSendScreen();
            },
            style: 'default',
          },

          { text: loc._.cancel, onPress: () => {}, style: 'cancel' },
        ],
        { cancelable: false },
      );
    }

    navigateToSendScreen();
  };

  const sendButtonLongPress = async () => {
    const isClipboardEmpty = (await BlueClipboard().getClipboardContent()).trim().length === 0;
    if (Platform.OS === 'ios') {
      const options = [loc._.cancel, loc.wallets.list_long_choose, loc.wallets.list_long_scan];
      if (!isClipboardEmpty) {
        options.push(loc.wallets.list_long_clipboard);
      }
      ActionSheet.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0, anchor: findNodeHandle(walletActionButtonsRef.current) },
        buttonIndex => {
          if (buttonIndex === 1) {
            choosePhoto();
          } else if (buttonIndex === 2) {
            navigate('ScanQRCodeRoot', {
              screen: 'ScanQRCode',
              params: {
                launchedBy: name,
                onBarScanned: onBarCodeRead,
                showFileImportButton: false,
              },
            });
          } else if (buttonIndex === 3) {
            copyFromClipboard();
          }
        },
      );
    } else if (Platform.OS === 'android') {
      const buttons = [
        {
          text: loc._.cancel,
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: loc.wallets.list_long_choose,
          onPress: choosePhoto,
        },
        {
          text: loc.wallets.list_long_scan,
          onPress: () =>
            navigate('ScanQRCodeRoot', {
              screen: 'ScanQRCode',
              params: {
                launchedBy: name,
                onBarScanned: onBarCodeRead,
                showFileImportButton: false,
              },
            }),
        },
      ];
      if (!isClipboardEmpty) {
        buttons.push({
          text: loc.wallets.list_long_clipboard,
          onPress: copyFromClipboard,
        });
      }
      ActionSheet.showActionSheetWithOptions({
        title: '',
        message: '',
        buttons,
      });
    }
  };

  const navigateToViewEditCosigners = () => {
    navigate('ViewEditMultisigCosignersRoot', {
      screen: 'ViewEditMultisigCosigners',
      params: {
        walletId: wallet.getID(),
      },
    });
  };

  const onManageFundsPressed = ({ id }) => {
    if (id === actionKeys.Refill) {
      const availableWallets = [...wallets.filter(item => item.chain === Chain.ONCHAIN && item.allowSend())];
      if (availableWallets.length === 0) {
        alert(loc.lnd.refill_create);
      } else {
        navigate('SelectWallet', { onWalletSelect, chainType: Chain.ONCHAIN });
      }
    } else if (id === actionKeys.RefillWithExternalWallet) {
      if (wallet.getUserHasSavedExport()) {
        navigate('ReceiveDetailsRoot', { walletID: wallet.getID() });
      }
    }
  };

  const getItemLayout = (_, index) => ({
    length: 64,
    offset: 64 * index,
    index,
  });

  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle="default" animated />
      <TransactionsNavigationHeader
        navigation={navigation}
        wallet={wallet}
        onWalletUnitChange={passedWallet =>
          InteractionManager.runAfterInteractions(async () => {
            setItemPriceUnit(passedWallet.getPreferredBalanceUnit());
            saveToDisk();
          })
        }
        onManageFundsPressed={id => {
          if (wallet.type === MultisigHDWallet.type) {
            navigateToViewEditCosigners();
          } else if (wallet.type === LightningLdkWallet.type) {
            navigate('LdkInfo', { walletID: wallet.getID() });
          } else if (wallet.type === LightningCustodianWallet.type) {
            if (wallet.getUserHasSavedExport()) {
              onManageFundsPressed({ id });
            } else {
              BlueAlertWalletExportReminder({
                onSuccess: async () => {
                  wallet.setUserHasSavedExport(true);
                  await saveToDisk();
                  onManageFundsPressed({ id });
                },
                onFailure: () =>
                  navigate('WalletExportRoot', {
                    screen: 'WalletExport',
                    params: {
                      walletID: wallet.getID(),
                    },
                  }),
              });
            }
          }
        }}
      />
      <View 
        ref={walletActionButtonsRef}
        style={{
          //alignSelf: 'center',
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 48,
          //overflow: 'hidden',
        }}
      >
        {(wallet.allowSend() || (wallet.type === WatchOnlyWallet.type && wallet.isHd())) && (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: 64,
                width: 64,
                borderRadius: 32,
                backgroundColor: colors.card,
              }}
              onLongPress={sendButtonLongPress}
              onPress={sendButtonPress}
            >
              <Image source={require('../../img/icons/Send.png')} 
                  style={{
                    width: 28,
                    height: 28,
                  }}
                />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: 12,
              }}
            >
              Send
            </Text>
          </View>
          // <Button
          //   onLongPress={sendButtonLongPress}
          //   onPress={sendButtonPress}
          //   text={loc.send.header}
          //   testID="SendButton"
          //   icon={{
          //       name: "arrow-up",
          //       size: 24,
          //       type: "feather",
          //       color: colors.background,
          //   }}
          //   titleStyle={{ 
          //     fontFamily: 'Poppins-Regular',
          //     fontSize: 16,
          //     color: colors.background,
          //   }}
          //   title="Send"
          //   buttonStyle={{
          //     backgroundColor: colors.primary,
          //     height: 56,
          //     width: 150,
          //     borderRadius: 15,
          //     padding: 16,
          //     marginRight: 12,
          //   }}
          // />
        )}
        {wallet.allowReceive() && (
          <View style={{ alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 64,
              width: 64,
              borderRadius: 32,
              backgroundColor: colors.card,
            }}
            onPress={() => {
              if (wallet.chain === Chain.OFFCHAIN) {
                navigate('LNDCreateInvoiceRoot', { screen: 'LNDCreateInvoice', params: { walletID: wallet.getID() } });
              } else {
                navigate('ReceiveDetailsRoot', { walletID: wallet.getID() } );
              }
            }}
          >
            <Image source={require('../../img/icons/Receive.png')} 
                style={{
                  width: 28,
                  height: 28,
                }}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: 'Poppins',
                fontWeight: '500',
                fontSize: 12,
              }}
            >
              Receive
            </Text>
          </View>
          // <Button
          //   testID="ReceiveButton"
          //   text={loc.receive.header}
          //   onPress={() => {
          //     if (wallet.chain === Chain.OFFCHAIN) {
          //       navigate('LNDCreateInvoiceRoot', { screen: 'LNDCreateInvoice', params: { walletID: wallet.getID() } });
          //     } else {
          //       navigate('ReceiveDetailsRoot', { screen: 'ReceiveDetails', params: { walletID: wallet.getID() } });
          //     }
          //   }}
          //   icon={{
          //     name: "arrow-down",
          //     size: 24,
          //     type: "feather",
          //     color: colors.foreground,
          // }}
          //   titleStyle={{ 
          //     fontFamily: 'Poppins-Regular',
          //     fontSize: 16,
          //     color: colors.foreground,
          //   }}
          //   title="Receive"
          //   //color={colors.foreground}
          //   buttonStyle={{
          //     backgroundColor: colors.element,
          //     height: 56,
          //     width: 150,
          //     borderRadius: 15,
          //     padding: 16,
          //   }}
          // />
        )}
      </View>
      <View 
        style={{
          flex: 1,
          marginTop: 32,
          borderRadius: 40,
          backgroundColor: colors.element
        }}
      >
        <FlatList
          getItemLayout={getItemLayout}
          ListHeaderComponent={renderListHeaderComponent}
          onEndReachedThreshold={0.3}
          onEndReached={async () => {
            // pagination in works. in this block we will add more txs to FlatList
            // so as user scrolls closer to bottom it will render mode transactions

            if (getTransactionsSliced(Infinity).length < limit) {
              // all list rendered. nop
              return;
            }

            setDataSource(getTransactionsSliced(limit + pageSize));
            setLimit(prev => prev + pageSize);
            setPageSize(prev => prev * 2);
          }}
          ListFooterComponent={renderListFooterComponent}
          ListEmptyComponent={
            <ScrollView style={styles.flex} contentContainerStyle={styles.scrollViewContent}>
              <Image source={require('../../img/Illustrations/question.png')} 
                style={{
                  width: 300,
                  height: 300,
                  marginVertical: 16,
                  alignSelf: 'center',
                }}
              />
              <Text 
                numberOfLines={0} 
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: '500',
                  fontSize: 14,
                  color: colors.foregroundInactive,
                  textAlign: 'center',
                }}
              >
                {(isLightning() && loc.wallets.list_empty_txs1_lightning) || loc.wallets.list_empty_txs1}
              </Text>
              {isLightning() && <Text style={styles.emptyTxsLightning}>{loc.wallets.list_empty_txs2_lightning}</Text>}
            </ScrollView>
          }
          {...(isElectrumDisabled ? {} : { refreshing: isLoading, onRefresh: refreshTransactions })}
          data={dataSource}
          extraData={[timeElapsed, dataSource, wallets]}
          keyExtractor={_keyExtractor}
          renderItem={renderItem}
          initialNumToRender={10}
          removeClippedSubviews
          contentInset={{ top: 0, left: 0, bottom: 92, right: 0 }}
        />
      </View>

      
    </View>
  );
};

export default WalletTransactions;

WalletTransactions.navigationOptions = navigationStyle({}, opts => ({ ...opts }));
// navigationStyle({}, (options, { theme, navigation, route }) => {
//   return {
//     // headerRight: () => (
//     //   <TouchableOpacity
//     //     accessibilityRole="button"
//     //     testID="WalletDetails"
//     //     style={{
//     //       justifyContent: 'center',
//     //       alignItems: 'center',
//     //       height: 44,
//     //       width: 44,
//     //       borderRadius: 22,
//     //       backgroundColor: colors.card,
//     //     }}
//     //     onPress={() =>
//     //       navigation.navigate('WalletDetails', { walletID: route.params.walletID })
//     //     }
//     //   >
//     //     <Icon name="more-horizontal" type="feather" size={24} color={colors.foreground} />
//     //   </TouchableOpacity>
//     // ),
//   };
// });

WalletTransactions.propTypes = {
  navigation: PropTypes.shape(),
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollViewContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  marginHorizontal18: {
    marginHorizontal: 18,
  },
  marginBottom18: {
    marginBottom: 18,
  },
  activityIndicator: {
    marginVertical: 20,
  },
  listHeader: {
    //marginLeft: 16,
    //marginRight: 16,
    //marginVertical: 16,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  listHeaderTextRow: {
    flex: 1,
    marginHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listHeaderText: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 24,
  },
  browserButton2: {
    borderRadius: 9,
    minHeight: 49,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'auto',
    flexGrow: 1,
    marginHorizontal: 4,
  },
  marketpalceText1: {
    fontSize: 18,
  },
  list: {
    flex: 1,
  },
  emptyTxs: {
    fontSize: 18,
    color: '#9aa0aa',
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyTxsLightning: {
    fontSize: 18,
    color: '#9aa0aa',
    textAlign: 'center',
    fontWeight: '600',
  },
  sendIcon: {
    //transform: [{ rotate: I18nManager.isRTL ? '-225deg' : '225deg' }],
  },
  receiveIcon: {
    //transform: [{ rotate: I18nManager.isRTL ? '45deg' : '-45deg' }],
  },
});
