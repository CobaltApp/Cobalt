import React, { useContext, useState, useRef, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Text, Image, TextInput, ActivityIndicator, FlatList} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon} from 'react-native-elements';
import { TickerItem } from '../components/tickerItem';
import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueButton, BlueHeaderDefaultMain, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
const prompt = require('../helpers/prompt');

// import { useGetCryptosQuery } from '../services/cryptoapi';

const Discover = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = React.useState('');
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const editable = true;
  const tickerList = useRef();
  const [showTickers, setShowTickers] = useState(false);
  const [tickers, setTickers] = useState([]);

  const count = 4;
  //const { data: cryptosList } = useGetCryptosQuery(count);
  const [ cryptos, setCryptos ] = useState();
  const [ changes, setChanges ] = useState();

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

  const navigateHome = () => {
    navigate('Home');
  };
  const navigateToChart = () => {
    navigate('Chart');
  };

  useEffect(() => {
    if (showTickers) {
      tickerList.current.scrollToIndex({ animated: false, index: 0 });
    }
  }, [showTickers]);

  const data =
    search.length > 0 ? tickers.filter(item => item.address.toLowerCase().includes(search.toLowerCase())) : tickers;

    const renderRow = item => {
        return 
        // <TickerItem {...item} />
        ;
      };

  return isLoading ? (
      <BlueLoading />
  ) : (
        <SafeBlueArea>
            {/* <View
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
                    Discover
                </BlueText>
            </View> */}
            <View 
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <BlueHeaderDefaultMain leftText='Market'/>
                <Icon name="search" type="feather" size={32} color={colors.foreground} style={{marginTop: 8}}/>
            </View>
            {/* <TextInput
                testID="SearchInput"
                // onChangeText={text => {
                //     text = text.trim();
                //     setSearch(text);
                //   }}
                placeholder="Search Anything..."
                placeholderTextColor={colors.element}
                // value={search}
                style={{
                    minHeight: 55,
                    paddingHorizontal: 20,
                    paddingVertical: 15,
                    flex: 1,
                    backgroundColor: colors.background,
                    borderWidth: 0,
                    borderRadius: 25,
                    color: colors.foreground,
                    fontSize: 13,
                    textAlignVertical: 'center',
                    marginBottom: 26,
                    marginTop: 15,
                }}
                editable={!isLoading && editable}
                multiline={false}
                //inputAccessoryViewID={inputAccessoryViewID}
                clearButtonMode="while-editing"
                //onBlur={onBlurEditing}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType='default'
            /> */}
        <ScrollView minHeight={520}>
        <View>
            <FlatList
                // contentContainerStyle={stylesHook.root}
                ref={tickerList}
                data={data}
                extraData={data}
                initialNumToRender={20}
                renderItem={renderRow}
                ListEmptyComponent={search.length > 0 ? null : <ActivityIndicator />}
                centerContent={!showTickers}
                contentInsetAdjustmentBehavior="automatic"
                //ListHeaderComponent={<AddressTypeTabs currentTab={currentTab} setCurrentTab={setCurrentTab} />}
            />
            </View>
        </ScrollView>
      </SafeBlueArea>
  );
};

export default Discover;

Discover.navigationOptions = navigationStyle({
  title: "Discover",
});
