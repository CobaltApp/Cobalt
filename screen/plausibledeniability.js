import React, { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueButton, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
import loc from '../loc';
import { BlueStorageContext } from '../blue_modules/storage-context';
import alert from '../components/Alert';
import { TouchableOpacity } from 'react-native-gesture-handler';
const prompt = require('../helpers/prompt');

const PlausibleDeniability = () => {
  const { colors } = useTheme();
  const { cachedPassword, isPasswordInUse, createFakeStorage, resetWallets } = useContext(BlueStorageContext);
  const [isLoading, setIsLoading] = useState(false);
  const { popToTop } = useNavigation();

  const handleOnCreateFakeStorageButtonPressed = async () => {
    setIsLoading(true);
    try {
      const p1 = await prompt(loc.plausibledeniability.create_password, loc.plausibledeniability.create_password_explanation);
      const isProvidedPasswordInUse = p1 === cachedPassword || (await isPasswordInUse(p1));
      if (isProvidedPasswordInUse) {
        setIsLoading(false);
        ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
        return alert(loc.plausibledeniability.password_should_not_match);
      }
      if (!p1) {
        setIsLoading(false);
        return;
      }
      const p2 = await prompt(loc.plausibledeniability.retype_password);
      if (p1 !== p2) {
        setIsLoading(false);
        ReactNativeHapticFeedback.trigger('notificationError', { ignoreAndroidSystemSettings: false });
        return alert(loc.plausibledeniability.passwords_do_not_match);
      }

      await createFakeStorage(p1);
      await resetWallets();
      ReactNativeHapticFeedback.trigger('notificationSuccess', { ignoreAndroidSystemSettings: false });
      alert(loc.plausibledeniability.success);
      popToTop();
    } catch {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modal: {
      flex: 1,
      display: 'flex',
      marginTop: 32,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 400,
      gap: 24,
      borderRadius: 40,
      backgroundColor: colors.element,
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 25,
      backgroundColor: colors.card
    },
    text: {
      color: colors.foregroundInactive,
      fontFamily: 'Poppins',
      fontWeight: '400',
      fontSize: 16,
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 20,
      borderRadius: 30,
      backgroundColor: colors.primary,
    },
    buttonText: {
      color: colors.white,
      fontFamily: 'Poppins',
      fontWeight: '600',
      fontSize: 16,
    },
  });

  return isLoading ? (
    <BlueLoading />
  ) : (
        <View style={styles.modal}>
          <View style={styles.container}>
            <Text style={styles.text}>
              In the name of security, Cobalt can create a separate encrypted
              storage with a different password. You can disclose this password 
              to third parties under pressure while keeping your funds safe.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleOnCreateFakeStorageButtonPressed}
          >
            <Text style={styles.buttonText}>
              Create
            </Text>
          </TouchableOpacity>
        </View>
  );
};

export default PlausibleDeniability;

PlausibleDeniability.navigationOptions = navigationStyle({
  title: loc.plausibledeniability.title,
});
