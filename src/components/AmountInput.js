import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import { Badge, Icon, Text } from 'react-native-elements';
import { Image, LayoutAnimation, Pressable, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import confirm from '../helpers/confirm';
import { BitcoinUnit } from '../models/bitcoinUnits';
import loc, { formatBalanceWithoutSuffix, formatBalancePlain, removeTrailingZeros } from '../loc';
// import { BlueText } from '../../BlueComponents';
import { Button } from 'react-native-elements';
import dayjs from 'dayjs';
const currency = require('../custom-modules/currency');
dayjs.extend(require('dayjs/plugin/localizedFormat'));

class AmountInput extends Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    /**
     * amount is a sting thats always in current unit denomination, e.g. '0.001' or '9.43' or '10000'
     */
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * callback that returns currently typed amount, in current denomination, e.g. 0.001 or 10000 or $9.34
     * (btc, sat, fiat)
     */
    onChangeText: PropTypes.func.isRequired,
    /**
     * callback thats fired to notify of currently selected denomination, returns <BitcoinUnit.*>
     */
    onAmountUnitChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    colors: PropTypes.object.isRequired,
    pointerEvents: PropTypes.string,
    unit: PropTypes.string,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
  };

  /**
   * cache of conversions  fiat amount => satoshi
   * @type {{}}
   */
  static conversionCache = {};

  static getCachedSatoshis = amount => {
    return AmountInput.conversionCache[amount + BitcoinUnit.LOCAL_CURRENCY] || false;
  };

  static setCachedSatoshis = (amount, sats) => {
    AmountInput.conversionCache[amount + BitcoinUnit.LOCAL_CURRENCY] = sats;
  };

  constructor() {
    super();
    this.state = { mostRecentFetchedRate: Date(), isRateOutdated: false, isRateBeingUpdated: false };
  }

  componentDidMount() {
    currency
      .mostRecentFetchedRate()
      .then(mostRecentFetchedRate => {
        this.setState({ mostRecentFetchedRate });
      })
      .finally(() => {
        currency.isRateOutdated().then(isRateOutdated => this.setState({ isRateOutdated }));
      });
  }

  /**
   * here we must recalculate old amont value (which was denominated in `previousUnit`) to new denomination `newUnit`
   * and fill this value in input box, so user can switch between, for example, 0.001 BTC <=> 100000 sats
   *
   * @param previousUnit {string} one of {BitcoinUnit.*}
   * @param newUnit {string} one of {BitcoinUnit.*}
   */
  onAmountUnitChange(previousUnit, newUnit) {
    const amount = this.props.amount || 0;
    const log = `${amount}(${previousUnit}) ->`;
    let sats = 0;
    switch (previousUnit) {
      case BitcoinUnit.BTC:
        sats = new BigNumber(amount).multipliedBy(100000000).toString();
        break;
      case BitcoinUnit.SATS:
        sats = amount;
        break;
      case BitcoinUnit.LOCAL_CURRENCY:
        sats = new BigNumber(currency.fiatToBTC(amount)).multipliedBy(100000000).toString();
        break;
    }
    if (previousUnit === BitcoinUnit.LOCAL_CURRENCY && AmountInput.conversionCache[amount + previousUnit]) {
      // cache hit! we reuse old value that supposedly doesnt have rounding errors
      sats = AmountInput.conversionCache[amount + previousUnit];
    }

    const newInputValue = formatBalancePlain(sats, newUnit, false);
    console.log(`${log} ${sats}(sats) -> ${newInputValue}(${newUnit})`);

    if (newUnit === BitcoinUnit.LOCAL_CURRENCY && previousUnit === BitcoinUnit.SATS) {
      // we cache conversion, so when we will need reverse conversion there wont be a rounding error
      AmountInput.conversionCache[newInputValue + newUnit] = amount;
    }
    this.props.onChangeText(newInputValue);
    this.props.onAmountUnitChange(newUnit);
  }

  /**
   * responsible for cycling currently selected denomination, BTC->SAT->LOCAL_CURRENCY->BTC
   */
  changeAmountUnit = () => {
    let previousUnit = this.props.unit;
    let newUnit;
    if (previousUnit === BitcoinUnit.BTC) {
      newUnit = BitcoinUnit.SATS;
    } else if (previousUnit === BitcoinUnit.SATS) {
      newUnit = BitcoinUnit.LOCAL_CURRENCY;
    } else if (previousUnit === BitcoinUnit.LOCAL_CURRENCY) {
      newUnit = BitcoinUnit.BTC;
    } else {
      newUnit = BitcoinUnit.BTC;
      previousUnit = BitcoinUnit.SATS;
    }
    this.onAmountUnitChange(previousUnit, newUnit);
  };

  maxLength = () => {
    switch (this.props.unit) {
      case BitcoinUnit.BTC:
        return 11;
      case BitcoinUnit.SATS:
        return 15;
      default:
        return 15;
    }
  };

  textInput = React.createRef();

  handleTextInputOnPress = () => {
    this.textInput.current.focus();
  };

  handleChangeText = text => {
    text = text.trim();
    if (this.props.unit !== BitcoinUnit.LOCAL_CURRENCY) {
      text = text.replace(',', '.');
      const split = text.split('.');
      if (split.length >= 2) {
        text = `${parseInt(split[0], 10)}.${split[1]}`;
      } else {
        text = `${parseInt(split[0], 10)}`;
      }

      text = this.props.unit === BitcoinUnit.BTC ? text.replace(/[^0-9.]/g, '') : text.replace(/[^0-9]/g, '');

      if (text.startsWith('.')) {
        text = '0.';
      }
    } else if (this.props.unit === BitcoinUnit.LOCAL_CURRENCY) {
      text = text.replace(/,/gi, '.');
      if (text.split('.').length > 2) {
        // too many dots. stupid code to remove all but first dot:
        let rez = '';
        let first = true;
        for (const part of text.split('.')) {
          rez += part;
          if (first) {
            rez += '.';
            first = false;
          }
        }
        text = rez;
      }
      if (text.startsWith('0') && !(text.includes('.') || text.includes(','))) {
        text = text.replace(/^(0+)/g, '');
      }
      text = text.replace(/[^\d.,-]/g, ''); // remove all but numbers, dots & commas
      text = text.replace(/(\..*)\./g, '$1');
    }
    this.props.onChangeText(text);
  };

  resetAmount = async () => {
    if (await confirm(loc.send.reset_amount, loc.send.reset_amount_confirm)) {
      this.props.onChangeText();
    }
  };

  updateRate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({ isRateBeingUpdated: true }, async () => {
      try {
        await currency.updateExchangeRate();
        currency.mostRecentFetchedRate().then(mostRecentFetchedRate => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          this.setState({ mostRecentFetchedRate });
        });
      } finally {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ isRateBeingUpdated: false, isRateOutdated: await currency.isRateOutdated() });
      }
    });
  };

  render() {
    const { colors, disabled, unit } = this.props;
    const amount = this.props.amount || 0;
    //const [frozenBalance, setFrozenBlance] = useState(false);
    let secondaryDisplayCurrency = formatBalanceWithoutSuffix(amount, BitcoinUnit.LOCAL_CURRENCY, false);

    // if main display is sat or btc - secondary display is fiat
    // if main display is fiat - secondary dislay is btc
    let sat;
    switch (unit) {
      case BitcoinUnit.BTC:
        sat = new BigNumber(amount).multipliedBy(100000000).toString();
        secondaryDisplayCurrency = formatBalanceWithoutSuffix(sat, BitcoinUnit.LOCAL_CURRENCY, false);
        break;
      case BitcoinUnit.SATS:
        secondaryDisplayCurrency = formatBalanceWithoutSuffix((isNaN(amount) ? 0 : amount).toString(), BitcoinUnit.LOCAL_CURRENCY, false);
        break;
      case BitcoinUnit.LOCAL_CURRENCY:
        secondaryDisplayCurrency = currency.fiatToBTC(parseFloat(isNaN(amount) ? 0 : amount));
        if (AmountInput.conversionCache[isNaN(amount) ? 0 : amount + BitcoinUnit.LOCAL_CURRENCY]) {
          // cache hit! we reuse old value that supposedly doesn't have rounding errors
          const sats = AmountInput.conversionCache[isNaN(amount) ? 0 : amount + BitcoinUnit.LOCAL_CURRENCY];
          secondaryDisplayCurrency = currency.satoshiToBTC(sats);
        }
        break;
    }

    const onUseAllPressed = () => {
      //Keyboard.dismiss();
        // setAddresses(addrs => {
        //   addrs[scrollIndex.current].amount = BitcoinUnit.MAX;
        //   addrs[scrollIndex.current].amountSats = BitcoinUnit.MAX;
        //   return [...addrs];
        // });
        // setUnits(u => {
        //   u[scrollIndex.current] = BitcoinUnit.BTC;
        //   return [...u];
        // });
        //LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        //setOptionsVisible(false);
    };

    if (amount === BitcoinUnit.MAX) secondaryDisplayCurrency = ''; // we don't want to display NaN

    // const stylesHook = StyleSheet.create({
    //   center: { padding: amount === BitcoinUnit.MAX ? 0 : 15 },
    //   localCurrency: { color: disabled ? colors.foregroundInactive : colors.foreground },
    //   input: { 
    //     color: disabled ? colors.foregroundInactive : colors.foreground, 
    //     fontFamily: 'Poppins-Regular',
    //     fontSize: amount.length > 5 ? 32 : 64
    //   },
    //   cryptoCurrency: { color: colors.foregroundInactive },
    // });

    const styles = StyleSheet.create({
      root: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      inputBox: {
        alignItems: 'center',
        marginVertical: 48,
      },
      row: {
        flexDirection: 'row',
        justifyContent: 'center',
      },

      center: {
        alignSelf: 'center',
        padding: amount === BitcoinUnit.MAX ? 0 : 15 
      },
      flex: {
        flex: 1,
      },
      spacing8: {
        width: 8,
      },
      disabledButton: {
        opacity: 0.5,
      },
      enabledButon: {
        opacity: 1,
      },
      outdatedRateContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
      },
      container: {
        flexDirection: 'row',
        alignContent: 'space-between',
        justifyContent: 'center',
        paddingTop: 16,
        paddingBottom: 2,
        paddingLeft: 24,
      },
      localCurrency: {
        fontFamily: 'Poppins-Regular',
        color: disabled ? colors.foregroundInactive : colors.foreground,
        fontSize: 32,
        alignSelf: 'center',
        justifyContent: 'center',
      },
      input: {
        color: disabled ? colors.foregroundInactive : colors.foreground, 
        fontFamily: 'Poppins',
        fontWeight: '600',
        fontSize: 32,
      },
      cryptoCurrency: {
        color: colors.foregroundInactive,
        fontFamily: 'Poppins-Regular',
        fontSize: 20,
        alignSelf: 'center',
        justifyContent: 'center',
      },
      secondaryRoot: {
        alignItems: 'center',
      },
      secondaryText: {
        color: colors.foregroundInactive,
        fontFamily: 'Poppins',
        fontWeight: '500',
        fontSize: 20,
      },
      changeAmountUnit: {
        alignSelf: 'center',
        marginRight: 16,
        paddingVertical: 16,
      },
    });

    return (
      <TouchableWithoutFeedback
        accessibilityRole="button"
        accessibilityLabel={loc._.enter_amount}
        disabled={this.props.pointerEvents === 'none'}
        onPress={() => this.textInput.focus()}
      >
        <>
          <View style={styles.inputBox}>
            {/* {!disabled && <View style={{alignSelf: 'center', padding: amount === BitcoinUnit.MAX ? 16 : 16}} />} */}
            {/* <View style={{ marginVertical: 48 }}> */}
              <View style={styles.row}>
                {unit === BitcoinUnit.LOCAL_CURRENCY && amount !== BitcoinUnit.MAX && (
                  <Text 
                    style={styles.input}
                  >
                    {currency.getCurrencySymbol() + ''}</Text>
                )}
                {amount !== BitcoinUnit.MAX ? (
                  <TextInput
                    {...this.props}
                    testID="BitcoinAmountInput"
                    keyboardType="numeric"
                    adjustsFontSizeToFit
                    onChangeText={this.handleChangeText}
                    onBlur={() => {
                      if (this.props.onBlur) this.props.onBlur();
                    }}
                    onFocus={() => {
                      if (this.props.onFocus) this.props.onFocus();
                    }}
                    placeholder="0"
                    maxLength={this.maxLength()}
                    ref={textInput => (this.textInput = textInput)}
                    editable={!this.props.isLoading && !disabled}
                    value={amount === BitcoinUnit.MAX ? loc.units.MAX : parseFloat(amount) >= 0 ? String(amount) : undefined}
                    placeholderTextColor={disabled ? colors.foregroundInactive : colors.foreground}
                    style={styles.input}
                  />
                ) : (
                  <Pressable onPress={this.resetAmount}>
                    <Text style={styles.input}>{BitcoinUnit.MAX}</Text>
                  </Pressable>
                )}
                {unit !== BitcoinUnit.LOCAL_CURRENCY && amount !== BitcoinUnit.MAX && (
                  <Text style={styles.cryptoCurrency}>{' ' + loc.units[unit]}</Text>
                )}
              </View>
              <View>
                <Text style={styles.secondaryText}>
                  {unit === BitcoinUnit.LOCAL_CURRENCY && amount !== BitcoinUnit.MAX
                    ? removeTrailingZeros(secondaryDisplayCurrency)
                    : secondaryDisplayCurrency}
                  {unit === BitcoinUnit.LOCAL_CURRENCY && amount !== BitcoinUnit.MAX ? ` ${loc.units[BitcoinUnit.BTC]}` : null}
                </Text>
              </View>
            {/* </View> */}
            {/* <View
              style={{
                marginRight: 16,
                justifyContent: 'center',
                //paddingTop: 16,
              }}
            > */}
              {/* <Button
              onPress={onUseAllPressed}
              testID="SendButton"
              titleStyle={{ 
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: colors.background,
              }}
              title="Max"
              buttonStyle={{
                backgroundColor: colors.foreground,
                borderRadius: 15,
                paddingHorizontal: 16,
                paddingVertical: 4,
                //marginBottom: 6,
              }}
            /> */}
            {/* {!disabled && amount !== BitcoinUnit.MAX && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={loc._.change_input_currency}
                testID="changeAmountUnitButton"
                style={{
                  //alignSelf: 'center',
                  marginTop: 6,
                }}
                onPress={this.changeAmountUnit}
              >
                <Icon name="repeat" type="feather" size={24} color={colors.foreground} />
              </TouchableOpacity>
            )} */}
            {/* </View> */}
          </View>
          {/* {this.state.isRateOutdated && (
            <View style={styles.outdatedRateContainer}>
              <Badge status="warning" />
              <View style={styles.spacing8} />
              <BlueText>
                {loc.formatString(loc.send.outdated_rate, { date: dayjs(this.state.mostRecentFetchedRate.LastUpdated).format('l LT') })}
              </BlueText>
              <View style={styles.spacing8} />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={loc._.refresh}
                onPress={this.updateRate}
                disabled={this.state.isRateBeingUpdated}
                style={this.state.isRateBeingUpdated ? styles.disabledButton : styles.enabledButon}
              >
                <Icon name="refresh-cw" type="feather" size={16} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          )} */}
        </>
      </TouchableWithoutFeedback>
    );
  }
}

const AmountInputWithStyle = props => {
  const { colors } = useTheme();

  return <AmountInput {...props} colors={colors} />;
};

// expose static methods
AmountInputWithStyle.conversionCache = AmountInput.conversionCache;
AmountInputWithStyle.getCachedSatoshis = AmountInput.getCachedSatoshis;
AmountInputWithStyle.setCachedSatoshis = AmountInput.setCachedSatoshis;

export default AmountInputWithStyle;
