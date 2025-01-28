import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation, useTheme } from '@react-navigation/native';
import { ListItem } from 'react-native-elements';
import PropTypes from 'prop-types';
import { AddressTypeBadge } from './AddressTypeBadge';
import loc, { formatBalance } from '../../loc';
import TooltipMenu from '../TooltipMenu';
import Clipboard from '@react-native-clipboard/clipboard';
import Share from 'react-native-share';
import { ScreenWidth } from 'react-native-elements/dist/helpers';
import { TouchableOpacity } from 'react-native-gesture-handler';

const AddressItem = ({ item, balanceUnit, walletID, allowSignVerifyMessage }) => {
  const { colors } = useTheme();
  const address = item.address;

  const hasTransactions = item.transactions > 0;

  const styles = StyleSheet.create({
    container: {
      display: 'flex',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    address: {
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 16,
      color: colors.foreground,
    },
    balance: {
      fontFamily: 'Poppins',
      fontWeight: '400',
      fontSize: 14,
      color: colors.foreground,
    },
  });

  const { navigate } = useNavigation();

  const menuRef = useRef();
  const navigateToReceive = () => {
    menuRef.current?.dismissMenu();
    navigate('ReceiveDetailsRoot', {
      screen: 'ReceiveDetails',
      params: {
        walletID,
        address: address,
      },
    });
  };

  const navigateToSignVerify = () => {
    menuRef.current?.dismissMenu();
    navigate('SignVerifyRoot', {
      screen: 'SignVerify',
      params: {
        walletID,
        address: address,
      },
    });
  };

  const balance = formatBalance(item.balance, balanceUnit, true);

  const handleCopyPress = () => {
    Clipboard.setString(address);
  };

  const handleSharePress = () => {
    Share.open({ message: address }).catch(error => console.log(error));
  };

  const onToolTipPress = id => {
    if (id === AddressItem.actionKeys.CopyToClipboard) {
      handleCopyPress();
    } else if (id === AddressItem.actionKeys.Share) {
      handleSharePress();
    } else if (id === AddressItem.actionKeys.SignVerify) {
      navigateToSignVerify();
    }
  };

  const getAvailableActions = () => {
    const actions = [
      {
        id: AddressItem.actionKeys.CopyToClipboard,
        text: loc.transactions.details_copy,
        icon: AddressItem.actionIcons.Clipboard,
      },
      {
        id: AddressItem.actionKeys.Share,
        text: loc.receive.details_share,
        icon: AddressItem.actionIcons.Share,
      },
    ];

    if (allowSignVerifyMessage) {
      actions.push({
        id: AddressItem.actionKeys.SignVerify,
        text: loc.addresses.sign_title,
        icon: AddressItem.actionIcons.Signature,
      });
    }

    return actions;
  };

  // const render = () => {
    return (
      // <TooltipMenu
      //   title={item.address}
      //   ref={menuRef}
      //   actions={getAvailableActions()}
      //   onPressMenuItem={onToolTipPress}
      //   previewQRCode
      //   previewValue={item.address}
      //   onPress={navigateToReceive}
      // >
      <TouchableOpacity
        key={item.key}
        style={styles.container}
        onPress={navigateToReceive}
      >
        <View 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 48,
            width: 48,
            borderRadius: 24,
            backgroundColor: item.isInternal ? 'rgba(247,147,26,0.1)': 'rgba(26,247,147,0.1)',
          }}>
          {item.isInternal ? 
          (<Icon name={'repeat'} size={24} type="feather" color={colors.secondary}/>) : 
          (<Icon name={'arrow-down'} size={24} type="feather" color={colors.positive}/>)}
        </View>
        <View>
          <Text style={styles.address}>
            {(address.slice(0, Math.round(ScreenWidth / 32)) + '...' + address.slice(address.length - (Math.round(ScreenWidth / 32) + 1), address.length))}
          </Text>
          <Text style={styles.balance}>{balance}</Text>
        </View>
      </TouchableOpacity>
        // <ListItem key={item.key} containerStyle={styles.container}>
        //   <ListItem.Content style={styles.list}>
        //     <View style={styles.iconReceive}>
        //       <Image
        //         source={require('')}
        //       />
        //     </View>
        //     <ListItem.Title style={styles.list} numberOfLines={1} ellipsizeMode="middle">
        //       {/* <Text style={styles.index}>{item.index + 1}</Text>{' '} */}
        //       <Text style={styles.address}>{item.address}</Text>
        //     </ListItem.Title>
        //     <View style={styles.subtitle}>
        //       <Text style={styles.balance}>{balance}</Text>
        //     </View>
        //   </ListItem.Content>
        //   <View style={{
        //     marginBottom: 24,
        //   }}>
        //     <AddressTypeBadge isInternal={item.isInternal} hasTransactions={hasTransactions} />
        //     <Text style={[stylesHook.list, styles.balance, stylesHook.balance]}>
        //       {loc.addresses.transactions}: {item.transactions}
        //     </Text>
        //   </View>
        // </ListItem>
      // {/* </TooltipMenu> */}
    );
  //};

  // return render();
};

AddressItem.actionKeys = {
  Share: 'share',
  CopyToClipboard: 'copyToClipboard',
  SignVerify: 'signVerify',
};

AddressItem.actionIcons = {
  Signature: {
    iconType: 'SYSTEM',
    iconValue: 'signature',
  },
  Share: {
    iconType: 'SYSTEM',
    iconValue: 'square.and.arrow.up',
  },
  Clipboard: {
    iconType: 'SYSTEM',
    iconValue: 'doc.on.doc',
  },
};

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
export { AddressItem };
