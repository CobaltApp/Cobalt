import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { ListItem } from 'react-native-elements';
import PropTypes from 'prop-types';

const TickerItem = ({ item, balanceUnit, walletID, allowSignVerifyMessage }) => {
  const { colors } = useTheme();

  const hasTransactions = item.transactions > 0;

  const stylesHook = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 70,
        width: '100%',
        marginBottom: 10,
        paddingVertical: 10,
    },
    list: {
        paddingHorizontal: 15,
                    alignSelf: 'center',
                    width: 92,
    },
    index: {
      color: colors.foreground,
    },
    balance: {
        fontWeight: '500',
        fontSize: 14,
        color: colors.foregroundInactive,
    },
    address: {
        fontWeight: '500',
        fontSize: 18,
        color: colors.foreground,
    },
  });

  const { navigate } = useNavigation();

//   const menuRef = useRef();
//   const navigateToReceive = () => {
//     menuRef.current?.dismissMenu();
//     navigate('ReceiveDetailsRoot', {
//       screen: 'ReceiveDetails',
//       params: {
//         walletID,
//         address: item.address,
//       },
//     });
//   };

  const render = () => {
    return (
        <ListItem key={item.key} containerStyle={stylesHook.container}>
            <Image 
                source={require('../img/addWallet/bitcoin.png')}
                style={{ width: 50, height: 50, borderRadius: 20}}
            />
            <View style={stylesHook.list} numberOfLines={1} ellipsizeMode="middle">
                <Text style={[stylesHook.address, styles.address]}>Bitcoin</Text>
                <Text style={[styles.balance, stylesHook.balance]}>BTC</Text>
            </View>
            <View style={{width: 60,}}></View>
            <View
                style={{
                    alignSelf: 'center',
                    alignItems: 'flex-end',
                    width: 123
                }}
            >
                <Text 
                    style={{
                        fontWeight: '500',
                        fontSize: 18,
                        color: colors.foreground,
                    }}
                >$32,128.80</Text>
                <Text
                    style={{
                        fontWeight: '500',
                        fontSize: 14,
                        color: colors.foregroundInactive,
                    }}
                >MCap $893.43 B</Text>
            </View>
        </ListItem>
    );
  };

  return render();
};

const styles = StyleSheet.create({
  address: {
    fontWeight: '500',
    fontSize: 16,
    marginHorizontal: 40,
  },
  index: {
    fontSize: 14,
  },
  balance: {
    // marginTop: 8,
    // marginLeft: 14,
  },
  subtitle: {
    // flex: 1,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // width: '100%',
  },
});

AddressItem.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string,
    index: PropTypes.number,
    address: PropTypes.string,
    isInternal: PropTypes.bool,
    transactions: PropTypes.number,
    balance: PropTypes.number,
  }),
  balanceUnit: PropTypes.string,
};
export { TickerItem };
