import React, { useContext, useState } from 'react';
import { Image, SectionList, Text, View } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { BlueStorageContext } from '../../../blue_modules/storage-context';
import { TransactionListItem } from '../../../components/TransactionListItem';
import { defaultStyles } from '../../../components/defaultStyles';
import loc from '../../../loc'

const Transactions = () => {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const { wallets, getTransactions, getBalance, refreshAllWalletTransactions, setSelectedWallet, isElectrumDisabled } = useContext(BlueStorageContext);
    const dataSource = getTransactions(null, 3);
    /**
     * Forcefully fetches TXs and balance for ALL wallets.
     * Triggered manually by user on pull-to-refresh.
     */
    const refreshTransactions = async (showLoadingIndicator = true, showUpdateStatusIndicator = false) => {
        if (isElectrumDisabled) return setIsLoading(false);
        setIsLoading(showLoadingIndicator);
        refreshAllWalletTransactions(false, showUpdateStatusIndicator).finally(() => setIsLoading(false));
    };

    const onRefresh = () => {
        refreshTransactions(true, false);
    };

    const renderTransactionListsRow = data => {
        return (
          <View>
            <TransactionListItem item={data.item} itemPriceUnit={data.item.walletPreferredBalanceUnit} walletID={data.item.walletID} />
          </View>
        );
    };

    const sectionListKeyExtractor = (item, index) => {
        return `${item}${index}`;
    };
    
    return (
        <View
            style={{
                display: 'flex',
                paddingHorizontal: 24,
            }}
        >
            <Text style={defaultStyles.h3}>
                {loc.transactions.list_title}
            </Text>
            <SectionList
            removeClippedSubviews
            contentInsetAdjustmentBehavior="automatic"
            automaticallyAdjustContentInsets
            refreshing={isLoading}
            {...(isElectrumDisabled ? {} : { refreshing: isLoading, onRefresh })}
            renderItem={item => renderTransactionListsRow(item)}
            keyExtractor={sectionListKeyExtractor}
            initialNumToRender={10}
            sections={[
              { key: 1, data: dataSource },
            ]}
            />
            {dataSource.length === 0 && !isLoading && (
            <View style={{
              alignItems: "center",
            }} testID="NoTransactionsMessage">
              <Image source={require('../../../img/Illustrations/question.png')} 
                style={{
                  width: 300,
                  height: 300,
                }}
              />
              <Text 
                style={{
                  color: colors.foregroundInactive,
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  
                }}
              >{loc.wallets.list_empty_txs1}</Text>
            </View>
          )
        }
        </View>
    )
}

export default Transactions;