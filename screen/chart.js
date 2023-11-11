import React, { useContext, useState } from 'react';
import { ScrollView, View, TouchableOpacity, Text, Image, TextInput, } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueButton, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
//import TradingViewWidget from '../components/TradingViewWidget';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import loc from '../loc';

//import TradingViewWidget from 'react-tradingview-widget';

const Chart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState();
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const editable = true;

  const navigateHome = () => {
    navigate('Home');
  };

  return isLoading ? (
    <SafeBlueArea>
      <BlueLoading />
    </SafeBlueArea>
  ) : (
    <SafeBlueArea>
        <View style={{flexDirection: 'row'}}>
            <Image 
                source={require('../img/addWallet/bitcoin.png')}
                style={{ width: 24, height: 24, borderRadius: 12, alignSelf: 'center',}}
            />
            <Text
                style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 16,
                    marginLeft: 10,
                    alignSelf: 'center',
                }}
            >
                Bitcoin
            </Text>
            <View
                style={{
                    backgroundColor: colors.foreground,
                    height: 30,
                    borderRadius: 15,
                    marginLeft: 12,
                    paddingHorizontal: 10,
                    justifyContent: 'center',
                }}
            >
                <Text
                    style={{
                        color: colors.background,
                        fontFamily: 'Poppins-Regular',
                        fontSize: 14,
                    }}
                >
                    Rank #1
                </Text>
            </View>
        </View>
        <Text
            style={{
                color: colors.foregroundInactive,
                fontFamily: 'Poppins-Regular',
                fontSize: 12,
                marginTop: 20,
            }}
        >
            BITCOIN PRICE
        </Text>
        <View>
            <Text
                style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 32,
                }}
            >
                $56,694.06
            </Text>
            <TradingViewWidget
    symbol="NASDAQ:AAPL"
    theme={Themes.DARK}
    locale="fr"
    autosize
  />
        </View>
    </SafeBlueArea>
  );
};

export default Chart;

Chart.navigationOptions = navigationStyle({
  title: "Chart",
});
