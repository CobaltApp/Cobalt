import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { defaultStyles } from './defaultStyles';
import { TransactionListItem } from './TransactionListItem';
import { BlueStorageContext } from '../custom-modules/storage-context';
import alert from './Alert';
import loc from '../loc';

const BlueElectrum = require('../custom-modules/BlueElectrum');

const TransactionList = ({ walletID }) => {
  const { wallets, saveToDisk, setSelectedWallet, isElectrumDisabled } = useContext(BlueStorageContext);
  const wallet = useRef(wallets.find(w => w.getID() === walletID)).current;
  
  //const wallet = wallets.find(w => w.getID() === walletID);
  const [itemPriceUnit, setItemPriceUnit] = useState(wallet.getPreferredBalanceUnit());
  const [dataSource, setDataSource] = useState(wallet.getTransactions(15));
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [limit, setLimit] = useState(15);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  const _keyExtractor = (_item, index) => index.toString();

  const getItemLayout = (_, index) => ({
    length: 64,
    offset: 64 * index,
    index,
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

  useEffect(() => {
    setIsLoading(true);
    setLimit(15);
    setPageSize(20);
    setTimeElapsed(0);
    setItemPriceUnit(wallet.getPreferredBalanceUnit());
    setIsLoading(false);
    setSelectedWallet(wallet.getID());
    setDataSource(wallet.getTransactions(15));
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletID]);

  useEffect(() => {
    const newWallet = wallets.find(w => w.getID() === walletID);
    if (newWallet) {
      setIsLoading(false);
      // setParams({ walletID, isLoading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletID]);

  // refresh transactions if it never hasn't been done. It could be a fresh imported wallet
  useEffect(() => {
    if (wallet.getLastTxFetch() === 0) {
      refreshTransactions();
    }
    // refreshLnNodeInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if description of transaction has been changed we want to show new one
  useFocusEffect(
    useCallback(() => {
      setTimeElapsed(prev => prev + 1);
    }, []),
  );

  const refreshTransactions = async () => {
    if (isElectrumDisabled) return setIsLoading(false);
    if (isLoading) return;
    setIsLoading(true);
    let noErr = true;
    let smthChanged = false;
    try {
      //refreshLnNodeInfo();
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

  const renderItem = item => (
    <TransactionListItem item={item.item} itemPriceUnit={itemPriceUnit} timeElapsed={timeElapsed} walletID={walletID} />
  );

  const renderListFooterComponent = () => {
    // if not all txs rendered - display indicator
    return (getTransactionsSliced(Infinity).length > limit && <ActivityIndicator style={{ marginVertical: 20 }} />) || <View />;
  };
    
  return (
    <View 
      style={{
        display: 'flex',
        padding: 24,
      }}
    >
      <Text style={defaultStyles.h3}>
        {loc.transactions.list_title}
      </Text>
      <FlatList
        getItemLayout={getItemLayout}
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
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }} 
            contentContainerStyle={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 32,
              paddingBottom: 40,
            }}
          >
            
            <Image 
              source={require('../../assets/Illustrations/question.png')} 
              style={{
                width: 300,
                height: 300,
                marginVertical: 16,
              }}
            />
            <Text 
              numberOfLines={0} 
              style={defaultStyles.bodyText}
            >
              {loc.wallets.list_empty_txs1}
              {/* {(isLightning() && loc.wallets.list_empty_txs1_lightning) || loc.wallets.list_empty_txs1} */}
            </Text>
            {/* {isLightning() && <Text style={styles.emptyTxsLightning}>{loc.wallets.list_empty_txs2_lightning}</Text>} */}
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
  )
}

export default TransactionList;