import React, { useContext, useState } from 'react';
import { ScrollView, View, TouchableOpacity, Text, Image, TextInput, } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon} from 'react-native-elements';

import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueButton, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
//import Widget from '../components/widgetChart';\
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import loc from '../loc';

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
        <BlueCard>
            <View
                style={{
                    flexDirection: 'row',
                    marginBottom: 44,
                  }}
            >
                <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={loc._.more}
                testID="HomeButton"
                style={{
                  marginRight: 10,
                  height: 40,
                  width: 40,
                  backgroundColor: colors.element,
                  borderRadius: 15,
                }}
                onPress={navigateHome}
              >
                <Icon size={24} name="chevron-left" type="feather" color={colors.element} style={{marginTop: 8}}/>
              </TouchableOpacity>
                <BlueText 
                    style={{
                        fontWeight: '400',
                        fontSize: 14,
                        color: colors.foreground,
                        marginTop: 13,
                    }}
                >
                    Bitcoin Live Chart
                </BlueText>
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    height: 94,
                    width: '100%',
                    paddingHorizontal: 20,
                    paddingVertical: 25,
                    backgroundColor: colors.primary,
                    borderWidth: 0,
                    borderRadius: 30,
                    marginBottom: 20,
                }}
            >
                <View>
                    <Image 
                        source={require('../img/addWallet/bitcoin.png')}
                        style={{ width: 43, height: 43, borderRadius: 22}}
                    />
                </View>
                <View
                    style={{
                        marginLeft: 18,
                    }}
                >
                    <Text 
                        style={{
                            fontWeight: '700',
                            fontSize: 18,
                            color: colors.background,
                        }}
                    >Bitcoin</Text>
                    <Text
                        style={{
                            fontWeight: '400',
                            fontSize: 12,
                            marginTop: 6,
                            color: colors.background,
                        }}
                    >BTC</Text>
                </View>
                <View
                    style={{
                        position: 'absolute',
                        right: 20,
                        marginTop: 25,
                        //marginLeft: 72,
                        alignItems: 'flex-end',
                    }}
                >
                    <Text 
                        style={{
                            fontWeight: '700',
                            fontSize: 18,
                            color: colors.background,
                        }}
                    >$32,785.00</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                        }}
                    >
                        <Icon size={24} name="arrow-up" type="feather" color={colors.positive} style={{marginTop: 4}}/>
                        <Text
                            style={{
                                fontWeight: '600',
                                fontSize: 16,
                                marginTop: 6,
                                color: colors.positive,
                            }}
                            //<TradingViewWidget symbol="NASDAQ:AAPL" />
                        >1.37%</Text>
                    </View>
                </View>
            </View>
      </BlueCard>
    </SafeBlueArea>
  );
};

export default Chart;

Chart.navigationOptions = navigationStyle({
  title: "Chart",
});
