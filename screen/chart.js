import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text, Image, TextInput, } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

import navigationStyleTx from '../components/navigationStyle';
import { BlueLoading, BlueButton, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
//import TradingViewWidget from '../components/TradingViewWidget';
//import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import loc from '../loc';
//import { createChart } from 'lightweight-charts';
//import { ChartComponent } from '../components/ChartComponent';

//import TradingViewWidget from 'react-tradingview-widget';

import { Defs, LinearGradient, Stop } from 'react-native-svg'
import { LineChart, Grid } from 'react-native-svg-charts';
import * as shape from 'd3-shape';

const periodList = [
    {
        name: '24H',
        days: 1,
    },
    {
        name: '1W',
        days: 7,
    },
    {
        name: '1M',
        days: 30,
    },
    {
        name: '1Y',
        days: 365,
    },
    {
        name: 'ALL',
        days: 'max',
    },
];

const Chart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(0);
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
        backgroundColor: colors.dark,
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
        color: colors.white,
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
        color: colors.foregroundInactive,
        fontFamily: 'Poppins',
        fontWeight: '500',
        fontSize: 14,
    },
  });
  const [ price, setPrice] = useState();
  const [ change, setChange ] = useState();
  const [ cap, setCap ] = useState();
  const [ data24H, setData24H ] = useState([]);
  const [ data1W, setData1W ] = useState([]);
  const [ data1M, setData1M ] = useState([]);
  const [ data1Y, setData1Y ] = useState([]);
  const [ dataALL, setDataALL ] = useState([]);
  const [ chartData, setChartData ] = useState([]);

  const navigateHome = () => {
    navigate('Home');
  };

  const initialData = [
	{ time: '2018-12-22', value: 32.51 },
	{ time: '2018-12-23', value: 31.11 },
	{ time: '2018-12-24', value: 27.02 },
	{ time: '2018-12-25', value: 27.32 },
	{ time: '2018-12-26', value: 25.17 },
	{ time: '2018-12-27', value: 28.89 },
	{ time: '2018-12-28', value: 25.46 },
	{ time: '2018-12-29', value: 23.92 },
	{ time: '2018-12-30', value: 22.68 },
	{ time: '2018-12-31', value: 22.67 },
];

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

const fetchChart = async () => {
    let daily;
    let weekly;
    let monthly;
    let yearly;
    let all;
    let ticker = 'bitcoin';
    // const data = [[]];
    // const daily = [];
    // const weekly = [];
    // const monthly = [];
    // const yearly = [];
    // const all = [];
    // for (i = 0; i < 5; i++) {
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${ticker}/market_chart?vs_currency=usd&days=1`);
            daily = await res.json();
        } catch (e) {
            throw new Error(`Could not update rate for USD: ${e.message}`);
        }
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${ticker}/market_chart?vs_currency=usd&days=7`);
            weekly = await res.json();
        } catch (e) {
            throw new Error(`Could not update rate for USD: ${e.message}`);
        }
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${ticker}/market_chart?vs_currency=usd&days=30`);
            monthly = await res.json();
        } catch (e) {
            throw new Error(`Could not update rate for USD: ${e.message}`);
        }
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${ticker}/market_chart?vs_currency=usd&days=365`);
            yearly = await res.json();
        } catch (e) {
            throw new Error(`Could not update rate for USD: ${e.message}`);
        }
        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/${ticker}/market_chart?vs_currency=usd&days=max`);
            all = await res.json();
        } catch (e) {
            throw new Error(`Could not update rate for USD: ${e.message}`);
        }
        //const list = [];
        //const data = json?.prices;
        const dailyData = [];
        for (i = 0; i < daily?.prices.length; i++) {
            dailyData.push(daily?.prices[i][1])
        }
        const weeklyData = [];
        for (i = 0; i < weekly?.prices.length; i++) {
            weeklyData.push(weekly?.prices[i][1])
        }
        const monthlyData = [];
        for (i = 0; i < monthly?.prices.length; i++) {
            monthlyData.push(monthly?.prices[i][1])
        }
        const yearlyData = [];
        for (i = 0; i < yearly?.prices.length; i++) {
            yearlyData.push(yearly?.prices[i][1])
        }
        const allData = [];
        for (i = 0; i < all?.prices.length; i++) {
            allData.push(all?.prices[i][1])
        }
        //setChartData(list)
        // for (j = 0; j < json?.prices.length; j++) {
        //     //data[i].push(json?.prices[j][1])
        //     switch(i) {
        //         case 0:
        //           daily.push(json?.prices[j][1])
        //           break;
        //         case 1:
        //           weekly.push(json?.prices[j][1])
        //           break;
        //         case 1:
        //           monthly.push(json?.prices[j][1])
        //           break;
        //         case 1:
        //           yearly.push(json?.prices[j][1])
        //           break;
        //         default:
        //           all.push(json?.prices[j][1])
        //       }
        // }
    // }
    setData24H(dailyData);
    setData1W(weeklyData);
    setData1M(monthlyData);
    setData1Y(yearlyData);
    setDataALL(allData);
    setChartData(dailyData);
};

    useEffect(() => {
        fetchData();
        fetchChart();
    }, [])

    const changePeriod = async (period) => {
        setCurrentPeriod(period)
        switch(period) {
            case 0:
              setChartData(data24H);
              break;
            case 1:
                setChartData(data1W);
              break;
            case 1:
                setChartData(data1M);
              break;
            case 1:
              setChartData(data1Y);
              break;
            default:
              setChartData(dataALL);
          }
        //fetchChart();
    }

  return isLoading ? (null
    // <SafeBlueArea>
    //   <BlueLoading />
    // </SafeBlueArea>
  ) : (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
            {periodList.map((x, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.dateButton, { backgroundColor: currentPeriod === index ? colors.card : 'transparent' }]}
                    onPress={() => {
                        changePeriod(index)
                    }}
                >
                    <Text style={[styles.dateText, { color: currentPeriod === index ? colors.foreground : colors.foregroundInactive }]}>
                        {x.name}
                    </Text>
                </TouchableOpacity>
            ))}
            </View>

            {/* <ChartComponent data={initialData}></ChartComponent> */}
            <View>
                <LineChart
                    style={{ height: 224 }}
                    data={chartData}
                    // contentInset={{ top: 24, bottom: 24 }}
                    curve={shape.curveBasis}
                    svg={{
                        strokeWidth: 4,
                        stroke: colors.primary,
                    }}
                >
                    <Grid
                        svg={{
                            strokeWidth: 0.5,
                            stroke: 'rgba(229, 231, 243, 0.2)',
                        }}
                    />
                </LineChart>
            </View>
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
