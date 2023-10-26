import React, { useRef, useCallback, useImperativeHandle, forwardRef, useContext } from 'react';
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
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import loc, { formatBalance, transactionTimeToReadable } from '../loc';
import { LightningCustodianWallet, LightningLdkWallet, MultisigHDWallet } from '../class';
import WalletGradient from '../class/wallet-gradient';
import { BluePrivateBalance } from '../BlueComponents';
import { BlueStorageContext } from '../blue_modules/storage-context';
import { isHandset, isTablet, isDesktop } from '../blue_modules/environment';
import { Button } from 'react-native-elements';

const nStyles = StyleSheet.create({
  container: {
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    minHeight: Platform.OS === 'ios' ? 185 : 185,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAWAllet: {
    fontWeight: '200',
    fontSize: 48,
  },
  addLine: {
    fontSize: 13,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '500',
  },
});

const NewWalletPanel = ({ onPress }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const itemWidth = width * 0.82 > 375 ? 65 : 48; //65
  const isLargeScreen = Platform.OS === 'android' ? isTablet() : (width >= Dimensions.get('screen').width / 2 && isTablet()) || isDesktop;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      testID="CreateAWallet"
      onPress={onPress}
      style={[{marginVertical: 16}, isLargeScreen ? {} : { width: itemWidth * 1.3 }]}
    >
      <View
        style={[
          {
          borderRadius: 15,
          borderWidth: 2,
          borderStyle: 'dashed',
          minHeight: Platform.OS === 'ios' ? 151 : 151,
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: colors.border,
          },
          isLargeScreen ? {} : { width: itemWidth },
        ]}
      >
        <Text style={[nStyles.addAWAllet, { color: colors.foreground }]}>+</Text>
        
      </View>
    </TouchableOpacity>
  );
};

NewWalletPanel.propTypes = {
  onPress: PropTypes.func.isRequired,
};

const iStyles = StyleSheet.create({
  root: { paddingRight: 0, },
  rootLargeDevice: { marginVertical: 20 },
  grad: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 15, //12
    minHeight: 185,
    elevation: 5,
  },
  image: {
    width: 99,
    height: 94,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  br: {
    backgroundColor: 'transparent',
  },
  label: {
    backgroundColor: 'transparent',
    fontSize: 18,
    fontWeight: 400,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  balance: {
    marginTop: 6,
    backgroundColor: 'transparent',
    fontWeight: 500,
    fontSize: 28,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  latestTx: {
    marginTop: 18,
    backgroundColor: 'transparent',
    fontSize: 14,
    fontWeight: 400,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  latestTxTime: {
    marginTop: 10,
    backgroundColor: 'transparent',
    fontWeight: 700,
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    fontSize: 24,
  },
});

const WalletCarouselItem = ({ item, index, onPress, handleLongPress, isSelectedWallet }) => {
  const scaleValue = new Animated.Value(1.0);
  const { colors } = useTheme();
  const { walletTransactionUpdateStatus } = useContext(BlueStorageContext);
  const { width } = useWindowDimensions();
  const itemWidth = width * 0.82 > 375 ? 375 : width * 0.82;
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
      image = I18nManager.isRTL ? require('../img/btc-shape-rtl.png') : require('../img/btc-shape.png');
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
        isLargeScreen ? iStyles.rootLargeDevice : { ...iStyles.root, width: itemWidth },
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
        <View backgroundColor={colors.primary} style={iStyles.grad}>
          <Image source={image} style={iStyles.image} />
          <Text
            style={{
              color: colors.background,
              fontFamily: 'Poppins-Regular',
              fontSize: 18,
              writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr', 
              marginBottom: 12,
            }}
          >
            {item.getLabel()}
          </Text>
          <Text
            style={{
              color: colors.background,
              fontFamily: 'Poppins-Regular',
              fontSize: 14,
            }}
          >
            Balance
          </Text>
          {item.hideBalance ? (
            <BluePrivateBalance />
          ) : (
            <Text
              key={balance} // force component recreation on balance change. To fix right-to-left languages, like Farsi
              adjustsFontSizeToFit
              style={{
                color: colors.background,
                fontFamily: 'Poppins-Regular', //Semi-Bold
                fontSize: 32,
                writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
              }}
            >
              {balance}
            </Text>
          )}
          {/* <Text numberOfLines={1} style={[iStyles.latestTx, { color: colors.background }]}>
            {loc.wallets.list_latest_transaction}
          </Text>
          <Text numberOfLines={1} style={[iStyles.latestTxTime, { color: colors.background }]}>
            {latestTransactionText}
          </Text> */}
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
    paddingTop: 26,
    marginBottom: 24,
  },
  contentLargeScreen: {
    paddingHorizontal: 16,
  },
  separatorStyle: {
    width: 0,
    height: 20,
  },
});

const ListHeaderComponent = props => <NewWalletPanel onPress={props.onPress} />;
//<View style={cStyles.separatorStyle} />;

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
        <View/>
        //<NewWalletPanel onPress={props.onPress} />
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.horizontal, props.selectedWallet, props.handleLongPress, props.onPress, preferredFiatCurrency, language],
  );
  const flatListRef = useRef();

  useImperativeHandle(ref, () => ({
    scrollToItem: ({ item }) => {
      setTimeout(() => {
        flatListRef?.current?.scrollToItem({ item, viewOffset: 16 });
      }, 300);
    },
    scrollToIndex: ({ index }) => {
      setTimeout(() => {
        flatListRef?.current?.scrollToIndex({ index, viewOffset: 16 });
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
  const sliderHeight = 195;
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
      // ListHeaderComponent={ListHeaderComponent}
      style={props.horizontal ? { minHeight: sliderHeight + 9} : {}}
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
