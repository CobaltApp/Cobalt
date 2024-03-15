import React, { useContext, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Text, Image, TextInput, ActivityIndicator, FlatList, StyleSheet} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon} from 'react-native-elements';
import { TickerItem } from '../components/tickerItem';
import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueButton, BlueHeaderDefaultMain, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
import { ScreenHeight } from 'react-native-elements/dist/helpers';
const prompt = require('../helpers/prompt');
import { defaultStyles } from '../components/defaultStyles';

import { FiatUnit, FiatUnitSource, getFiatRate } from '../models/fiatUnit';
const currency = require('../blue_modules/currency');

// import { useGetCryptosQuery } from '../services/cryptoapi';

const categories = [
  {
    name: 'Best Value',
  },
  {
    name: 'Trending'
  },
  {
    name: 'Watchlist'
  },
];

const Discover = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = React.useState('');
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const editable = true;
  //const tickerList = useRef();
  const [showTickers, setShowTickers] = useState(false);
  const [tickers, setTickers] = useState([]);
  const [category, setCategory] = useState(0);

  const { setOptions } = useNavigation();
  const [selectedCurrency, setSelectedCurrency] = useState(FiatUnit.USD);
  //const [currencyRate, setCurrencyRate] = useState({ LastUpdated: null, Rate: 1234 });
  const [ currencyRate, setCurrencyRate ] = useState(null);
  const [ priceList, setPriceList ] = useState([]);
  const [ itemList, setItemList ] = useState([
    {
      icon: require('../img/coins/bitcoin.png'),
      name: 'Bitcoin',
      price: 0,
      change: null,
      cap: null,
    },
    {
      icon: require('../img/coins/monero.png'),
      name: 'Ethereum',
      price: 0,
      change: null,
      cap: null,
    },
    {
      icon: require('../img/coins/monero.png'),
      name: 'Monero',
      price: 0,
      change: null,
      cap: null,
    },
    {
      icon: require('../img/coins/monero.png'),
      name: 'Litecoin',
      price: 0,
      change: null,
      cap: null,
    },
    {
      icon: require('../img/coins/monero.png'),
      name: 'Ripple',
      price: 0,
      change: null,
      cap: null,
    },
    {
      icon: require('../img/coins/monero.png'),
      name: 'Dogecoin',
      price: 0,
      change: null,
      cap: null,
    },
  ]);
  const styles = StyleSheet.create({
    search: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 24,
      height: 56,
      gap: 12,
      borderRadius: 25,
      backgroundColor: colors.card,
    },
    categoryContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'center',
      gap: 16,
    },
    category: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 25,
      backgroundColor: colors.card,
    },
    categoryText: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 12,
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    rowSubtitle: {
      color: colors.foregroundInactive,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 14,
    },
  });

  useEffect(() => {
    fetchCurrency();
    }, [])

  const fetchCurrency = async () => {
    const array = [];
    for (let i = 0; i < itemList.length; i++) {
      let json;
      let ticker = itemList[i].name.toLowerCase();
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/${ticker}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
        json = await res.json();
      } catch (e) {
        throw new Error(`Could not update rate for USD: ${e.message}`);
      }
      const data = json?.market_data;
      const mcap = Math.round(json?.market_data.price_change_percentage_24h * 100) / 100;
      array.push({
        icon: itemList[i].icon,
        name: itemList[i].name,
        price: Math.round(data.current_price.usd * 100) / 100,
        change: data.market_cap.usd,
        cap: mcap,
      })
      //const data = json?.market_data;
      //prices.push(Math.round(json?.market_data.current_price.usd * 100) / 100)
      //itemList[i].price = Math.round(data.current_price.usd * 100) / 100;
      //itemList[i].cap = data.market_cap.usd;
      //itemList[i].change = Math.round(data.price_change_percentage_24h * 100) / 100;
      //setRates([...rates, {rate}]);
    }
    setItemList(data)
  };

  const data =
    search.length > 0 ? tickers.filter(item => item.address.toLowerCase().includes(search.toLowerCase())) : tickers;

  return isLoading ? (
      <BlueLoading />
  ) : (
        <View 
          style={{
            display: 'flex',
            flex: 1,
            paddingTop: 48,
            paddingHorizontal: 24,
          }}
        >
            <View style={{ gap: 32 }}>
              <Text style={defaultStyles.h1}>
                Market
              </Text>
              <View style={{ gap: 16 }}>
                <View style={styles.search}>
                  <Icon name="search" type="feather" size={24} color={colors.foregroundInactive}/>
                  <TextInput
                    testID="SearchInput"
                    placeholder="Search"
                    placeholderTextColor={colors.foregroundInactive}
                    style={{
                      flex: 1,
                      color: colors.foreground,
                      fontFamily: 'Poppins',
                      fontWeight: '400',
                      fontSize: 16,
                    }}
                    editable={!isLoading && editable}
                    multiline={false}
                    clearButtonMode="while-editing"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType='default'
                  />
                </View>
                <View style={styles.categoryContainer}>
                  {categories.map((x, index) => (
                  <TouchableOpacity
                      key={index}
                      style={styles.category}
                  >
                    <Text style={styles.categoryText}>
                      {x.name}
                    </Text>
                  </TouchableOpacity>
                  ))}
                </View>
              </View>
            {/* <FlatList
                ref={tickerList}
                //data={data}
                //extraData={data}
                initialNumToRender={10}
                renderItem={renderRow}
                //ListEmptyComponent={search.length > 0 ? null : <ActivityIndicator />}
                //centerContent={!showTickers}
                //contentInsetAdjustmentBehavior="automatic"
            /> */}
            <FlatList
              data={itemList}
              contentContainerStyle={{ minHeight: (ScreenHeight / 1.5) }}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity 
                    style={styles.row}
                    onPress={() => navigate('Chart')}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <Image
                        height={48}
                        width={48}
                        source={item.icon}
                      />
                      <View>
                        <Text style={defaultStyles.h3}>
                          {item.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {item.change > 0 ? 
                          (
                            <Icon name="chevron-up" type="feather" size={12} color={colors.positive} />
                          ) : (
                            <Icon name="chevron-down" type="feather" size={12} color={colors.negative} />
                          )}
                          <Text style={styles.rowSubtitle}>
                            {Math.abs(item.change)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={defaultStyles.h3}>
                        {item.price}
                      </Text>
                      <Text style={styles.rowSubtitle}>
                        {item.cap}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              }}
              keyExtractor={(item, index) => index.toString()}
            />
      </View>
    </View>
  );
};

export default Discover;
