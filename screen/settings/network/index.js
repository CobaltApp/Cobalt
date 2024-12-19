import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Notifications from '../../../blue_modules/notifications';
import navigationStyle from '../../../components/navigationStyle';
import { SafeBlueArea, BlueListItem } from '../../../BlueComponents';
import loc from '../../../loc';
import { isTorCapable } from '../../../blue_modules/environment';
import { defaultStyles } from '../../../components/defaultStyles';
import ToggleSection from '../../../components/section-toggle';
import { BlueStorageContext } from '../../../blue_modules/storage-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BlueElectrum = require('../../../blue_modules/BlueElectrum');

export default class NetworkSettings extends Component {
  static contextType = BlueStorageContext;
  constructor(props) {
    super(props);
    const server = props?.route?.params?.server;
    this.state = {
      isLoading: true,
      isOfflineMode: false,
      serverHistory: [],
      config: {},
      server,
      sslPort: '',
      port: '',
    };
  }

  async componentDidMount() {
    const host = await AsyncStorage.getItem(BlueElectrum.ELECTRUM_HOST);
    const port = await AsyncStorage.getItem(BlueElectrum.ELECTRUM_TCP_PORT);
    const sslPort = await AsyncStorage.getItem(BlueElectrum.ELECTRUM_SSL_PORT);
    const serverHistoryStr = await AsyncStorage.getItem(BlueElectrum.ELECTRUM_SERVER_HISTORY);
    const isOfflineMode = await BlueElectrum.isDisabled();
    const serverHistory = JSON.parse(serverHistoryStr) || [];
    this.setState({
      isLoading: false,
      host,
      port,
      sslPort,
      serverHistory,
      isOfflineMode,
      isAndroidNumericKeyboardFocused: false,
      isAndroidAddressKeyboardVisible: false,
    });

    const inverval = setInterval(async () => {
      this.setState({
        config: await BlueElectrum.getConfig(),
      });
    }, 500);

    this.setState({
      config: await BlueElectrum.getConfig(),
      inverval,
    });

    // if (this.state.server) {
    //   ReactNativeHapticFeedback.trigger('impactHeavy', { ignoreAndroidSystemSettings: false });
    //   Alert.alert(
    //     loc.formatString(loc.settings.set_electrum_server_as_default, { server: this.state.server }),
    //     '',
    //     [
    //       {
    //         text: loc._.ok,
    //         onPress: () => {
    //           this.onBarScanned(this.state.server);
    //         },
    //         style: 'default',
    //       },
    //       { text: loc._.cancel, onPress: () => {}, style: 'cancel' },
    //     ],
    //     { cancelable: false },
    //   );
    // }
  }

  onElectrumConnectionEnabledSwitchValueChangd = async value => {
    if (value === true) {
      await BlueElectrum.setDisabled(true);
      this.context.setIsElectrumDisabled(true);
      BlueElectrum.forceDisconnect();
    } else {
      await BlueElectrum.setDisabled(false);
      this.context.setIsElectrumDisabled(false);
      BlueElectrum.connectMain();
    }
    this.setState({ isOfflineMode: value });
  };


  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={defaultStyles.modal}>  
          <View>
            <ToggleSection
              header={loc.settings.electrum_offline_mode}
              input={this.state.isOfflineMode}
              onChange={this.onElectrumConnectionEnabledSwitchValueChangd}
            />
          {/* <BlueListItem title={loc.settings.network_electrum} onPress={navigateToElectrumSettings} testID="ElectrumSettings" chevron />
          <BlueListItem title={loc.settings.lightning_settings} onPress={navigateToLightningSettings} testID="LightningSettings" chevron /> */}
          {/* {Notifications.isNotificationsCapable && (
            <BlueListItem
              title={loc.settings.notifications}
              onPress={() => navigate('NotificationSettings')}
              testID="NotificationSettings"
              chevron
            />
          )} */}
          {/* {isTorCapable && <BlueListItem title={loc.settings.tor_settings} onPress={navigateToTorSettings} testID="TorSettings" chevron />} */}
          </View>
        </View>
      </View>
    );
  }
}

NetworkSettings.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
  route: PropTypes.shape({
    name: PropTypes.string,
    params: PropTypes.shape({
      server: PropTypes.string,
    }),
  }),
};

NetworkSettings.navigationOptions = navigationStyle({}, opts => ({ ...opts, headerTitle: loc.settings.network }));
