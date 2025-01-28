import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Platform,
  Dimensions,
  TouchableOpacity,
  useWindowDimensions,
  Text,
} from 'react-native';
import WalletsCarousel from '../../components/WalletsCarousel';
import DeeplinkSchemaMatch from '../../class/deeplink-schema-match';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useFocusEffect, useIsFocused, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { BlueStorageContext } from '../../custom-modules/storage-context';
import { isDesktop, isTablet } from '../../custom-modules/environment';
import navigationStyle from '../../components/navigationStyle';
import loc from '../../loc';
import RoundButton from '../../components/button-round';
import TransactionList from '../../components/list-transactions';
import { Image } from 'react-native-elements';

const A = require('../../custom-modules/analytics');

const Home = () => {
  const walletsCarousel = useRef();
  const currentWalletIndex = useRef(0);
  const { wallets, getTransactions, getBalance, refreshAllWalletTransactions, setSelectedWallet, isElectrumDisabled } =
    useContext(BlueStorageContext);
  const { width } = useWindowDimensions();
  const { colors, scanImage, barStyle } = useTheme();
  const { navigate, setOptions } = useNavigation();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(
    Platform.OS === 'android' ? isTablet() : (width >= Dimensions.get('screen').width / 2 && isTablet()) || isDesktop,
  );
  const walletsCount = useRef(wallets.length);
  const [ modalVisible, setModalVisible ] = useState(false);
  
  const { walletID } = useRoute();
  
  useFocusEffect(
    useCallback(() => {
      verifyBalance();
      setSelectedWallet('');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    // new wallet added
    if (wallets.length > walletsCount.current) {
      walletsCarousel.current?.scrollToItem({ item: wallets[walletsCount.current] });
    }
    // wallet has been deleted
    if (wallets.length < walletsCount.current) {
      walletsCarousel.current?.scrollToItem({ item: false });
    }
    walletsCount.current = wallets.length;

    if (wallets.some(w => w.getID() === walletID)) {
      setSelectedWallet(walletID);
    }

    // if (wallets.length == 0) {
    //   setModalVisible(true);
    // }
  }, [wallets, walletID]);

  const verifyBalance = () => {
    if (getBalance() !== 0) {
      A(A.ENUM.GOT_NONZERO_BALANCE);
    } else {
      A(A.ENUM.GOT_ZERO_BALANCE);
    }
  };

  /**
   * Forcefully fetches TXs and balance for ALL wallets.
   * Triggered manually by user on pull-to-refresh.
   */
  const refreshTransactions = async (showLoadingIndicator = true, showUpdateStatusIndicator = false) => {
    if (isElectrumDisabled) return setIsLoading(false);
    setIsLoading(showLoadingIndicator);
    refreshAllWalletTransactions(false, showUpdateStatusIndicator).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    refreshTransactions(false, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // call refreshTransactions() only once, when screen mounts

  const handleClick = item => {
    if (item?.getID) {
      const walletID = item.getID();
      navigate('WalletTransactions', {
        walletID,
        walletType: item.type,
        key: `WalletTransactions-${walletID}`,
      });
    } else {
      navigate('AddWallet');
    }
  };

  const onSnapToItem = e => {
    if (!isFocused) return;

    const contentOffset = e.nativeEvent.contentOffset;
    const index = Math.ceil(contentOffset.x / width);

    if (currentWalletIndex.current !== index) {
      console.log('onSnapToItem', wallets.length === index ? 'NewWallet/Importing card' : index);
      if (wallets[index] && (wallets[index].timeToRefreshBalance() || wallets[index].timeToRefreshTransaction())) {
        console.log(wallets[index].getLabel(), 'thinks its time to refresh either balance or transactions. refetching both');
        refreshAllWalletTransactions(index, false).finally(() => setIsLoading(false));
      }
      currentWalletIndex.current = index;
    } else {
      console.log('onSnapToItem did not change. Most likely momentum stopped at the same index it started.');
    }
  };

  const handleLongPress = () => {
    if (wallets.length > 1) {
      navigate('ReorderWallets');
    } else {
      ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
    }
  };

  return (
    <View>
      <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <View>
          <Image
            source={require('../../../assets/Illustrations/hello.png')}
            style={{
              width: 320,
              height: 320,
            }}
          />
          <View
            style={{
              padding: 24,
              borderRadius: 24,
              backgroundColor: colors.card,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '400',
                fontFamily: 'Poppins',
              }}
            >
              Welcome to Cobalt! Let’s add your first wallet so you can manage your money on the move.
            </Text>
          </View>
          </View>
        </TouchableOpacity>
      </Modal>
      <WalletsCarousel
        data={wallets.concat(false)}
        extraData={[wallets]}
        onPress={handleClick}
        handleLongPress={handleLongPress}
        onMomentumScrollEnd={onSnapToItem}
        ref={walletsCarousel}
        testID="WalletsList"
        horizontal
        scrollEnabled={isFocused}
      />
      {(wallets.length > 0 &&
        <TransactionList
          walletID={wallets[currentWalletIndex.current].getID()}
        />
      )}
    </View>
  );
};

export default Home;

Home.navigationOptions = navigationStyle({});
