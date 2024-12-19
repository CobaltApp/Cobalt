import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, TextInput, FlatList, StyleSheet, ImageBackground} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon} from 'react-native-elements';
import { ScreenWidth, ScreenHeight } from 'react-native-elements/dist/helpers';
import { defaultStyles } from '../../components/defaultStyles';
import Chart from '../../components/chart';

const News = () => {
  const [tickers, setTickers] = useState([]);
  const [search, setSearch] = React.useState('');
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const editable = true;
  const articles = [];
  const [ data, setData ] = useState([]);
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

  const fetchNews = async () => {
    const url = 'https://cryptocurrency-news2.p.rapidapi.com/v1/cryptodaily';
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'bd005cca93mshd7a76b684067a8dp110803jsn3270c1522322',
        'x-rapidapi-host': 'cryptocurrency-news2.p.rapidapi.com'
      }
    };
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        // const dataFiltered = result.slice(0, 10);
        setData(result.data[0]);
        console.log(result.data[0]);
    } catch (error) {
      console.log(error);
    }

    // for (let i = 0; i < 10; i++) {
    //   articles.push(data[i])
    // }
    //console.log(articles);
  }

  useEffect(() => {
    fetchNews();
  }, [])

//   useEffect(() => {
//     fetchCurrency();
//     }, [])

//   const fetchCurrency = async () => {
//     const array = [];
//     for (let i = 0; i < itemList.length; i++) {
//       let json;
//       let ticker = itemList[i].name.toLowerCase();
//       try {
//         const res = await fetch(`https://api.coingecko.com/api/v3/coins/${ticker}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
//         json = await res.json();
//       } catch (e) {
//         throw new Error(`Could not update rate for USD: ${e.message}`);
//       }
//       const data = json?.market_data;
//       const mcap = Math.round(json?.market_data.price_change_percentage_24h * 100) / 100;
//       array.push({
//         icon: itemList[i].icon,
//         name: itemList[i].name,
//         price: Math.round(data.current_price.usd * 100) / 100,
//         change: data.market_cap.usd,
//         cap: mcap,
//       })
//     }
//     setItemList(data)
//   };

  // const data =
  //   search.length > 0 ? tickers.filter(item => item.address.toLowerCase().includes(search.toLowerCase())) : tickers;

  return (
    <View style={{flex: 1}}>
        <View style={defaultStyles.modal}>
          {/* <ImageBackground
            source={imageUrl} 
            style={{
              display: 'flex',
              width: ScreenWidth - 48,
              height: 364,
              padding: 8,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
            imageStyle={{
              borderRadius: 24,
            }}
          >
            <View
              style={{
                borderRadius: 16,
                padding: 8,
                backgroundColor: colors.card
              }}
            >
              <Text style={defaultStyles.h4}>
                Friday, Dec 13 2024
              </Text>

            </View>
            <View
              style={{
                display: 'flex',
                alignSelf: 'stretch',
                borderRadius: 16,
                padding: 16,
                backgroundColor: colors.card
              }}
            >
              <Text style={defaultStyles.h3}>
                Forte Unveils Open-Source Rules Engine to Support Safety and Economic Stability in Blockchain Development
              </Text>
            </View>
          </ImageBackground> */}
          {data.map((x, index) => (
            <ImageBackground
            source={{ uri: x.thumbnail }}
            style={{
              display: 'flex',
              width: ScreenWidth - 48,
              height: 364,
              padding: 8,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
            imageStyle={{
              borderRadius: 24,
            }}
          >
            <View
              style={{
                borderRadius: 16,
                padding: 8,
                backgroundColor: colors.card
              }}
            >
              <Text style={defaultStyles.h4}>
                {x.createdAt}
              </Text>

            </View>
            <View
              style={{
                display: 'flex',
                alignSelf: 'stretch',
                borderRadius: 16,
                padding: 16,
                backgroundColor: colors.card
              }}
            >
              <Text style={defaultStyles.h3}>
                {x.title}
              </Text>
            </View>
          </ImageBackground>
          ))}
        </View>
    </View>
  );
};

export default News;
