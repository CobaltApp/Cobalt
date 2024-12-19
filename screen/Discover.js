import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, TextInput, FlatList, StyleSheet} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon} from 'react-native-elements';
import { BlueLoading } from '../BlueComponents';
import { ScreenWidth, ScreenHeight } from 'react-native-elements/dist/helpers';
import { defaultStyles } from '../components/defaultStyles';

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
  const [tickers, setTickers] = useState([]);
  const [search, setSearch] = React.useState('');
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const editable = true;
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
    lockedCard: {
      display: 'flex',
      alignItems: 'center',
      top: 200,
      marginHorizontal: 24,
      padding: 24,
      paddingTop: 100,
      borderRadius: 25,
      gap: 16,
      backgroundColor: colors.card,
    },
    lockedBody: {
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
    }
    setItemList(data)
  };

  const data =
    search.length > 0 ? tickers.filter(item => item.address.toLowerCase().includes(search.toLowerCase())) : tickers;

  return (
    <View>
      <View
            style={{
                flex: 1,
                position: 'absolute',
                width: ScreenWidth,
                height: ScreenHeight,
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 100,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
        >
                    <Image
                        style={{
                            alignSelf: 'center',
                            top: 280,
                            width: 162,
                            height: 142,
                            zIndex: 101,
                        }}
                        source={require('../img/Illustrations/robot-head-19.png')}
                    />
                    <View style={styles.lockedCard}>
                        {/* <View style={styles.row}>
                            <Icon name="lock" type="feather" size={32} colors={colors.foreground}/>
                            <Text style={defaultStyles.h3}>
                                This feature is under development
                            </Text>
                        </View> */}
                        <Text style={defaultStyles.h3}>
                          This feature is under development
                        </Text>
                        <Text style={styles.lockedBody}>
                          Explore market insights, track trends, and make informed decisions with real-time data. Coming soon to Cobalt!
                        </Text>
                        {/* <Text style={styles.lockedBody}>
                            Chat is only available for premium members. Subscribe to our premium membership to live chat with Colby, get discounted rates, and much more!
                        </Text> */}
                    </View>
                </View>
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
                    editable={editable}
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
    </View>
  );
};

export default Discover;
