import React, { useEffect, useState, useCallback, useContext } from 'react';
import { ActivityIndicator, View, BackHandler, Text, ScrollView, StyleSheet, I18nManager } from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';

import { SafeBlueArea, BlueButton } from '../../../../BlueComponents';
import navigationStyle from '../../../../components/navigationStyle';
import Privacy from '../../../../custom-modules/Privacy';
import loc from '../../../../loc';
import { BlueStorageContext } from '../../../../custom-modules/storage-context';
import Button from '../../../../components/button-primary';
import { defaultStyles } from '../../../../components/defaultStyles';

const Backup = () => {
  const { wallets } = useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(true);
  const { walletID } = useRoute().params;
  const wallet = wallets.find(w => w.getID() === walletID);
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    loading: {
      flex: 1,
      justifyContent: 'center',
    },
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    word: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 100,
      backgroundColor: colors.dark,
    },
    list: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 32,
      gap: 12,
    },
  });

  // const handleBackButton = useCallback(() => {
  //   navigation.dangerouslyGetParent().pop();
  //   return true;
  // }, [navigation]);

  const handleBackButton = () => {
    // const wallet = walletID;
    // navigate('WalletTransactions', {
    //   wallet,
    //   key: `WalletTransactions-${wallet}`,
    // });
    navigate('Home');
  };

  useEffect(() => {
    Privacy.enableBlur();
    setIsLoading(false);
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      Privacy.disableBlur();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderSecret = () => {
    const component = [];
    for (const [index, secret] of wallet.getSecret().split(/\s/).entries()) {
      const text = `${index + 1}. ${secret}  `;
      component.push(
        <View style={styles.word} key={index}>
          <Text style={defaultStyles.btnSecondaryText} textBreakStrategy="simple">
            {text}
          </Text>
        </View>,
      );
    }
    return component;
  };

  return isLoading ? (
    <View style={styles.loading}>
      <ActivityIndicator />
    </View>
  ) : (
    <View style={{ flex: 1 }}>
      <View style={defaultStyles.modal}>
        <View>
          <View style={{ gap: 12 }}>
            <View style={{display: 'flex', flexDirection: 'row', gap: 8}}>
              <View
                style={{
                  height: 24,
                  width: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 100,
                  backgroundColor: colors.foreground
                }}
              >
                <Text style={defaultStyles.btnText}>
                  2
                </Text>
              </View>
              <Text style={defaultStyles.h4}>
                Recovery Phrase
              </Text>
            </View>
            <Text style={defaultStyles.label}>{loc.pleasebackup.text}</Text>
          </View>
          <View style={styles.list}>
            {renderSecret()}
          </View>
        </View>
        <Button title={loc.pleasebackup.ok} action={handleBackButton}/>
      </View>
    </View>
  );
};

Backup.navigationOptions = navigationStyle(
  {
    gestureEnabled: false,
    swipeEnabled: false,
    headerHideBackButton: true,
  },
  opts => ({ ...opts, title: loc.wallets.add_title }),
);

export default Backup;
