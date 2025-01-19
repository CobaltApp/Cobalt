import React, { useRef, useCallback, useImperativeHandle, forwardRef, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Image,
  I18nManager,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Dimensions,
  FlatList,
  Pressable,
  Modal,
} from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import loc, { formatBalance, transactionTimeToReadable } from '../loc';
import { LightningCustodianWallet, LightningLdkWallet, MultisigHDWallet } from '../class';
import WalletGradient from '../class/wallet-gradient';
import { BluePrivateBalance } from '../BlueComponents';
import { BlueStorageContext } from '../blue_modules/storage-context';
import { isHandset, isTablet, isDesktop } from '../blue_modules/environment';
import { Button, Icon } from 'react-native-elements';
import { navigationRef } from '../NavigationService';
import { defaultStyles } from '../components/defaultStyles';

const NewWalletPanel = () => {
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const itemWidth = width * 0.82 > 375 ? 375 : width * 0.82;
  const itemHeight = width * 0.5;
  const margins = (width - itemWidth) / 2;
  const isLargeScreen = Platform.OS === 'android' ? isTablet() : (width >= Dimensions.get('screen').width / 2 && isTablet()) || isDesktop;
  const [ modalVisible, setModalVisible ] = useState(false);

  const navigateToAddWallet = () => {
    setModalVisible(false);
    navigate('AddWallet');
  }

  const navigateToImportWallet = () => {
    setModalVisible(false);
    navigate('ImportWallet');
  }

  return (
    <View
      style={[
        isLargeScreen ? styles.rootLargeDevice : { ...styles.root, width: width }]}
    >
      <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <View
            style={{
              display: 'flex',
              paddingHorizontal: 24,
              paddingVertical: 32,
              gap: 32,
              borderRadius: 32,
              backgroundColor: colors.card,
            }}
          >
          <View
            style={{
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '500',
                fontFamily: 'Poppins'
              }}
            >
              Add a Wallet
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '400',
                fontFamily: 'Poppins',
                textAlign: 'center',
              }}
            >
              Create a new wallet or import an existing wallet using a recovery phrase.
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
              gap: 8,
            }}
          >
          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 64,
              padding: 16,
              borderRadius: 16,
              backgroundColor: colors.card,
              shadowOpacity: 0.1,
              shadowColor: '#000000',
              shadowRadius: 8,
              shadowOffset: { height: 0, width: 0}
            }}
            onPress={() => navigateToAddWallet()}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                fontFamily: 'Poppins',
              }}
            >
              Create a New Wallet
            </Text>
            <Icon
              name='chevron-right'
              style={'feather'}
              size={24}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 64,
              padding: 16,
              borderRadius: 16,
              backgroundColor: colors.card,
              shadowOpacity: 0.1,
              shadowColor: '#000000',
              shadowRadius: 8,
              shadowOffset: { height: 0, width: 0}
            }}
            onPress={() => navigateToImportWallet()}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                fontFamily: 'Poppins',
              }}
            >
              Import a Wallet
            </Text>
            <Icon
              name='chevron-right'
              style={'feather'}
              size={24}
            />
          </TouchableOpacity>
          </View>
          </View>
        </TouchableOpacity>
      </Modal>
      <TouchableOpacity 
        style={[styles.card, {height: itemHeight, marginHorizontal: margins, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.foreground,}]}
        accessibilityRole="button"
        testID="AddWallet"
        onPress={() => setModalVisible(true)}
      >
        <View
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Text
            style={{
              color: colors.foreground,
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: 18,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr', 
            }}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            Add a Wallet
          </Text>
          <View
            style={{
              marginTop: 18,
              marginBottom: itemHeight / 2 - 36,
              padding: 8,
              borderRadius: 1000,
              backgroundColor: colors.foreground,
            }}
          >
            <Icon
              name='plus'
              type={'feather'}
              size={24}
              color={colors.background}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

NewWalletPanel.propTypes = {
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  root: { marginVertical: 24, paddingLeft: 0 },
  rootLargeDevice: { marginVertical: 20 },
  card: {
    //marginLeft: 32,
    padding: 16,
    borderRadius: 16,
    minHeight: 185,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  image: {
    width: 50,
    height: 50,
    position: 'absolute',
    top: 20,
    right: 24,
  },
  br: {
    backgroundColor: 'transparent',
  },
  balance: {
    marginTop: 6,
    backgroundColor: 'transparent',
    fontWeight: 500,
    fontSize: 28,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  latestTx: {
    backgroundColor: 'transparent',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: 500,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  latestTxTime: {
    backgroundColor: 'transparent',
    fontWeight: 500,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    fontSize: 20,
  },
});

const WalletCarouselItem = ({ item, index, onPress, handleLongPress, isSelectedWallet }) => {
  const scaleValue = new Animated.Value(1.0);
  const { colors } = useTheme();
  const { walletTransactionUpdateStatus } = useContext(BlueStorageContext);
  const { width } = useWindowDimensions();
  const itemWidth = width * 0.82 > 375 ? 375 : width * 0.82;
  const itemHeight = width * 0.5;
  const margins = (width - itemWidth) / 2;
  const isLargeScreen = Platform.OS === 'android' ? isTablet() : (width >= Dimensions.get('screen').width / 2 && isTablet()) || isDesktop;
  const onPressedIn = () => {
    const props = { duration: 50 };
    props.useNativeDriver = true;
    props.toValue = 0.9;
    Animated.spring(scaleValue, props).start();
  };

  const onPressedOut = () => {
    const props = { duration: 50 };
    props.useNativeDriver = true;
    props.toValue = 1.0;
    Animated.spring(scaleValue, props).start();
  };

  const opacity = isSelectedWallet === false ? 0.5 : 1.0;
  let image;
  switch (item.type) {
    case LightningLdkWallet.type:
    case LightningCustodianWallet.type:
      image = I18nManager.isRTL ? require('../img/lnd-shape-rtl.png') : require('../img/lnd-shape.png');
      break;
    case MultisigHDWallet.type:
      image = I18nManager.isRTL ? require('../img/vault-shape-rtl.png') : require('../img/vault-shape.png');
      break;
    default:
      image = I18nManager.isRTL ? require('../img/coins/bitcoin.png') : require('../img/coins/bitcoin.png');
  }

  const latestTransactionText =
    walletTransactionUpdateStatus === true || walletTransactionUpdateStatus === item.getID()
      ? loc.transactions.updating
      : item.getBalance() !== 0 && item.getLatestTransactionTime() === 0
      ? loc.wallets.pull_to_refresh
      : item.getTransactions().find(tx => tx.confirmations === 0)
      ? loc.transactions.pending
      : transactionTimeToReadable(item.getLatestTransactionTime());

  const balance = !item.hideBalance && formatBalance(Number(item.getBalance()), item.getPreferredBalanceUnit(), true);

  return (
    <Animated.View
      style={[
        isLargeScreen ? styles.rootLargeDevice : { ...styles.root, width: width },
        { opacity, transform: [{ scale: scaleValue }] },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        testID={item.getLabel()}
        onPressIn={onPressedIn}
        onPressOut={onPressedOut}
        onLongPress={handleLongPress}
        onPress={() => {
          onPressedOut();
          onPress(item);
          onPressedOut();
        }}
      >
        {/* backgroundColor={WalletGradient.gradientsFor(item.type)} */}
        <View backgroundColor={colors.primary} style={[styles.card, {height: itemHeight, marginHorizontal: margins}]}>
          {/* <Image source={image} style={styles.image} /> */}
          <View
            style={{ 
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
          <Text
            style={{
              color: colors.card,
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: 24,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr', 
            }}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {item.getLabel()}
          </Text>
          {item.hideBalance ? (
            <BluePrivateBalance />
          ) : (
            <Text
              key={balance} // force component recreation on balance change. To fix right-to-left languages, like Farsi
              adjustsFontSizeToFit
              style={{
                color: colors.card,
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: 16,
                writingDirection: I18nManager.isRTL ? 'ltr' : 'rtl', 
              }}
              numberOfLines={1}
            >
              {balance}
            </Text>
          )}
          {/* <Text numberOfLines={1} style={[styles.latestTx, { color: colors.foregroundInactive }]}>
            {loc.wallets.list_latest_transaction}
          </Text>
          <Text numberOfLines={1} style={[styles.latestTxTime, { color: colors.foreground }]}>
            {latestTransactionText}
          </Text> */}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

WalletCarouselItem.propTypes = {
  item: PropTypes.any,
  index: PropTypes.number.isRequired,
  onPress: PropTypes.func.isRequired,
  handleLongPress: PropTypes.func.isRequired,
  isSelectedWallet: PropTypes.bool,
};

const cStyles = StyleSheet.create({
  content: {
    //paddingTop: 26,
    //marginBottom: 24,
  },
  contentLargeScreen: {
    //paddingHorizontal: 16,
  },
  separatorStyle: {
    width: 0,
    height: 20,
  },
});

const WalletsCarousel = forwardRef((props, ref) => {
  const { preferredFiatCurrency, language } = useContext(BlueStorageContext);
  const renderItem = useCallback(
    ({ item, index }) =>
       item ? (
        <WalletCarouselItem
          isSelectedWallet={!props.horizontal && props.selectedWallet ? props.selectedWallet === item.getID() : undefined}
          item={item}
          index={index}
          handleLongPress={props.handleLongPress}
          onPress={props.onPress}
        />
       ) : (
        
        <NewWalletPanel onPress={props.onPress} />
       ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.horizontal, props.selectedWallet, props.handleLongPress, props.onPress, preferredFiatCurrency, language],
  );
  const flatListRef = useRef();

  useImperativeHandle(ref, () => ({
    scrollToItem: ({ item }) => {
      setTimeout(() => {
        flatListRef?.current?.scrollToItem({ item, viewOffset: 32 });
      }, 300);
    },
    scrollToIndex: ({ index }) => {
      setTimeout(() => {
        flatListRef?.current?.scrollToIndex({ index, viewOffset: 32 });
      }, 300);
    },
  }));

  const onScrollToIndexFailed = error => {
    console.log('onScrollToIndexFailed');
    console.log(error);
    flatListRef.current.scrollToOffset({ offset: error.averageItemLength * error.index, animated: true });
    setTimeout(() => {
      if (props.data.length !== 0 && flatListRef.current !== null) {
        flatListRef.current.scrollToIndex({ index: error.index, animated: true });
      }
    }, 100);
  };

  const { width } = useWindowDimensions();
  const sliderHeight = 185;
  const itemWidth = width * 0.82 > 375 ? 375 : width * 0.82;
  return isHandset ? (
    <FlatList
      ref={flatListRef}
      renderItem={renderItem}
      extraData={props.data}
      keyExtractor={(_, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      pagingEnabled
      disableIntervalMomentum={isHandset}
      snapToInterval={itemWidth} // Adjust to your content width
      decelerationRate="fast"
      contentContainerStyle={props.horizontal ? cStyles.content : cStyles.contentLargeScreen}
      directionalLockEnabled
      showsHorizontalScrollIndicator={false}
      initialNumToRender={10}
      //={ListHeaderComponent}
      style={props.horizontal ? { minHeight: sliderHeight} : {}}
      onScrollToIndexFailed={onScrollToIndexFailed}
      {...props}
    />
  ) : (
    <View style={cStyles.contentLargeScreen}>
      {props.data.map((item, index) =>
        item ? (
          <WalletCarouselItem
            isSelectedWallet={!props.horizontal && props.selectedWallet ? props.selectedWallet === item.getID() : undefined}
            item={item}
            index={index}
            handleLongPress={props.handleLongPress}
            onPress={props.onPress}
            key={index}
          />
        ) : (
          <NewWalletPanel key={index} onPress={props.onPress} />
        ),
      )}
    </View>
  );
});

WalletsCarousel.propTypes = {
  horizontal: PropTypes.bool,
  selectedWallet: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  handleLongPress: PropTypes.func.isRequired,
  data: PropTypes.array,
};

export default WalletsCarousel;
