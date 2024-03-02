import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text, Image, TextInput, } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

import navigationStyleTx from '../components/navigationStyle';
import { BlueLoading, BlueButton, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
//import TradingViewWidget from '../components/TradingViewWidget';
//import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import loc from '../loc';

//import TradingViewWidget from 'react-tradingview-widget';

const periods = [
    '24H',
    '1W',
    '1M',
    '1Y',
    'ALL',
];

let change;
let mcap;
let open;
let close
let high;
let low;

const Chart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState(0);
  const [search, setSearch] = useState();
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const editable = true;
  const styles = StyleSheet.create({
    chartContainer: {
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        marginBottom: 32,
        paddingHorizontal: 24,
        gap: 20,
    },
    price: {
        color: colors.foreground,
        fontFamily: 'Poppins',
        fontWeight: '500',
        fontSize: 28,
    },
    priceChangeText: {
        color: '#9395A4',
        fontFamily: 'Poppins',
        fontWeight: '500',
        fontSize: 14,
    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: 4,
        gap: 3,
        height: 56,
        borderRadius: 30,
        backgroundColor: '#030D19',
    },
    dateButton: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        height: 48,
        minWidth: 48,
        borderRadius: 25,
    },
    dateText: {
        fontFamily: 'Poppins',
        fontWeight: '600',
        fontSize: 14,
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
        padding: 16,
        borderRadius: 30,
        backgroundColor: colors.primary,
    },
    buttonText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins',
        fontWeight: '600',
        fontSize: 16,
    },
    modal: {
        display: 'flex',
        flex: 1,
        alignItems: 'stretch',
        gap: 16,
        padding: 24,
        borderRadius: 40,
        backgroundColor: colors.element,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    subrow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        width: 128
    },
    header: {
        color: colors.foreground,
        fontFamily: 'Poppins',
        fontWeight: '500',
        fontSize: 20,
    },
    textActive: {
        color: colors.foreground,
        fontFamily: 'Poppins',
        fontWeight: '500',
        fontSize: 14,
    },
    textInactive: {
        color: '#A6A6A6',
        fontFamily: 'Poppins',
        fontWeight: '500',
        fontSize: 14,
    },
  });
  const [ price, setPrice] = useState();
  const [ change, setChange ] = useState();
  const [ cap, setCap ] = useState();

  const navigateHome = () => {
    navigate('Home');
  };

  const fetchData = async () => {
    let json;
    let ticker = 'bitcoin';
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${ticker}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
      json = await res.json();
    } catch (e) {
      throw new Error(`Could not update rate for USD: ${e.message}`);
    }
    const data = json?.market_data;
    setPrice(Math.round(data.current_price.usd * 100) / 100);
    setCap(data.market_cap.usd);
    setChange(Math.round(data.price_change_percentage_24h * 100) / 100);
};


    useEffect(() => {
        fetchData();
    }, [])

  return isLoading ? (
    <SafeBlueArea>
      <BlueLoading />
    </SafeBlueArea>
  ) : (
    <View style={{ flex: 1, backgroundColor: '#051931' }}>
        <View style={styles.chartContainer}>
            <View style={{ alignItems: 'center' }}>
                <Text style={styles.price}>
                    ${price}
                </Text>
                <Text style={styles.priceChangeText}>
                    {change}%
                </Text>
            </View>
            <View style={styles.dateContainer}>
            {periods.map((x, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.dateButton, { backgroundColor: period === index ? '#0A3263' : 'transparent' }]}
                    onPress={() => setPeriod(index)}
                >
                    <Text style={[styles.dateText, { color: period === index ? colors.foreground : '#A6A6A6' }]}>
                        {x}
                    </Text>
                </TouchableOpacity>
            ))}
            </View>
            <View style={{ height: 224 }}/>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>
                    Buy Now
                </Text>
            </TouchableOpacity>
        </View>
        <View style={styles.modal}>
                <Text style={styles.header}>
                    Statistics
                </Text>
                <View style={styles.row}>
                    <Text style={styles.textInactive}>
                        Market Capitalization
                    </Text>
                    <Text style={styles.textActive}>
                        ${cap}
                    </Text>
                </View>
                <View style={styles.row}>
                    <View style={styles.subrow}>
                        <Text style={styles.textInactive}>
                            Open
                        </Text>
                        <Text style={styles.textActive}>
                            $58,123.00
                        </Text>
                    </View>
                    <View style={styles.subrow}>
                        <Text style={styles.textInactive}>
                            Close
                        </Text>
                        <Text style={styles.textActive}>
                            $59,123.00
                        </Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.subrow}>
                        <Text style={styles.textInactive}>
                            High
                        </Text>
                        <Text style={styles.textActive}>
                            $158,123.00
                        </Text>
                    </View>
                    <View style={styles.subrow}>
                        <Text style={styles.textInactive}>
                            Low
                        </Text>
                        <Text style={styles.textActive}>
                            $9,123.00
                        </Text>
                    </View>
                </View>
            </View>
    </View>
  );
};

export default Chart;
