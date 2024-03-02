import React, { useContext, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Text, Image, TextInput, ActivityIndicator, FlatList, StyleSheet} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon} from 'react-native-elements';
import { TickerItem } from '../components/tickerItem';
import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueButton, BlueHeaderDefaultMain, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
import { ScreenHeight } from 'react-native-elements/dist/helpers';
const prompt = require('../helpers/prompt');

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
  const [ itemList, setItemList ] = useState([
    {
      icon: require('../img/coins/bitcoin.png'),
      name: 'Bitcoin',
      ticker: 'bitcoin',
      price: 0,
      change: null,
      cap: null,
    },
    {
      icon: require('../img/coins/monero.png'),
      name: 'Ethereum',
      ticker: 'ethereum',
      price: 0,
      change: null,
      cap: null,
    },
    {
      icon: require('../img/coins/monero.png'),
      name: 'Monero',
      ticker: 'monero',
      price: 0,
      change: null,
      cap: null,
    },
    {
      icon: require('../img/coins/monero.png'),
      name: 'Litecoin',
      ticker: 'litecoin',
      price: 0,
      change: null,
      cap: null,
    },
    {
      icon: require('../img/coins/monero.png'),
      name: 'Ripple',
      ticker: 'ripple',
      price: 0,
      change: null,
      cap: null,
    },
    {
      icon: require('../img/coins/monero.png'),
      name: 'Dogecoin',
      ticker: 'dogecoin',
      price: 0,
      change: null,
      cap: null,
    },
  ]);

  const count = 4;
  //const { data: cryptosList } = useGetCryptosQuery(count);
  //const [ cryptos, setCryptos ] = useState();
  const [ changes, setChanges ] = useState();
  const styles = StyleSheet.create({
    header: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '600',
      fontSize: 32,
    },
    search: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 24,
      height: 56,
      gap: 12,
      borderRadius: 25,
      backgroundColor: '#0A3263',
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
      backgroundColor: '#0A3263',
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
    rowTitle: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 18,
    },
    rowSubtitle: {
      color: '#A6A6A6',
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 14,
    },
  });

  useEffect(() => {
    fetchCurrency();
    }, [])

//   useEffect(() => {
//     setCryptos(cryptosList?.data?.coins);
//   }, [cryptosList]);

//   <div className={cn(className, styles.cards)}>
//       {cryptos?.map((x, index) => (
//         <Link className={styles.card} key={index} to={x.url}>
//           <div className={styles.icon}>
//             <img src={x.iconUrl} alt="Currency" />
//           </div>
//           <div className={styles.details}>
//           <div className={styles.title}>{x.symbol}</div>
//             <div className={styles.line}>
//               <div className={styles.price}>${millify(x.price)}</div>
//               {x.change >= 0 && (
//                 <div className={styles.positive}>
//                   +{x.change}%
//                 </div>
//               )}
//               {x.change < 0 && (
//                 <div className={styles.negative}>
//                   {x.change}%
//                 </div>
//               )}
//             </div>
//             <div className={styles.coin}>{x.name}</div>
//           </div>
//         </Link>
//       ))}
//     </div>

  const fetchCurrency = async () => {
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
      itemList[i].price = Math.round(data.current_price.usd * 100) / 100;
      itemList[i].cap = data.market_cap.usd;
      itemList[i].change = Math.round(data.price_change_percentage_24h * 100) / 100;
      //setRates([...rates, {rate}]);
    }
  };

  // const fetchCurrency = async () => {
  //   let preferredCurrency = FiatUnit.USD;
  //   try {
  //     preferredCurrency = await currency.getPreferredCurrency();
  //     if (preferredCurrency === null) {
  //       throw Error();
  //     }
  //     setSelectedCurrency(preferredCurrency);
  //   } catch (_error) {
  //     setSelectedCurrency(preferredCurrency);
  //   }
  //   const mostRecentFetchedRate = await currency.mostRecentFetchedRate();
  //   setCurrencyRate(mostRecentFetchedRate);
  // };

  // useLayoutEffect(() => {
  //   // setOptions({
  //   //   searchBar: {
  //   //     onChangeText: event => setSearch(event.nativeEvent.text),
  //   //   },
  //   // });
  //   fetchCurrency();
  // }, [setCategory]);

  // useEffect(() => {
  //   // if (showTickers) {
  //   //   tickerList.current.scrollToIndex({ animated: false, index: 0 });
  //   // }
  //   fetchCurrency();
  // }, [setCategory]);


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
              <Text style={styles.header}>
                Market
              </Text>
              <View style={{ gap: 16 }}>
                <View style={styles.search}>
                  <Icon name="search" type="feather" size={24} color={'#A6A6A6'}/>
                  <TextInput
                    testID="SearchInput"
                    placeholder="Search"
                    placeholderTextColor={'#A6A6A6'}
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
                        <Text style={styles.rowTitle}>
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
                      <Text style={styles.rowTitle}>
                        {item.price}
                      </Text>
                      <Text style={styles.rowSubtitle}>
                        {item.cap}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              }}  
              keyExtractor={(item, index) => index}
            />
      </View>
    </View>
  );
};

export default Discover;
