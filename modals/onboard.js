import React, { useContext, useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, useColorScheme, LayoutAnimation } from 'react-native';
import { Icon } from 'react-native-elements';
import Biometric from '../class/biometrics';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { BlueStorageContext } from '../blue_modules/storage-context';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { isHandset } from '../blue_modules/environment';
import InputSection from '../components/section-input';
import { defaultStyles } from '../components/defaultStyles';
import Button from '../components/button-primary';

const Onboard = () => {
  const { setWalletsInitialized, encryptStorage, isStorageEncrypted, saveToDisk, startAndDecrypt } = useContext(BlueStorageContext);
  const { setOptions, navigate } = useNavigation();
  // const { unlockOnComponentMount } = useRoute().params;
  const [biometricType, setBiometricType] = useState(false);
  const [isStorageEncryptedEnabled, setIsStorageEncryptedEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [animationDidFinish, setAnimationDidFinish] = useState(false);
  const colorScheme = useColorScheme();
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState();
  const [username, setUsername] = useState();
  const [p1, setP1] = useState();
  const [p2, setP2] = useState();

  const initialRender = async () => {
    let bt = false;
    if (await Biometric.isBiometricUseCapableAndEnabled()) {
      bt = await Biometric.biometricType();
    }

    setBiometricType(bt);
  };

  useEffect(() => {
    initialRender();
    setOptions({
      headerTitle: '',
      headerShown: false,
    });
  }, []);

  const successfullyAuthenticated = () => {
    setWalletsInitialized(true);
    dispatch(StackActions.replace(isHandset ? 'Navigation' : 'DrawerRoot'));
  };

  const unlockWithBiometrics = async () => {
    if (await isStorageEncrypted()) {
      unlockWithKey();
    }
    setIsAuthenticating(true);

    if (await Biometric.unlockWithBiometrics()) {
      setIsAuthenticating(false);
      await startAndDecrypt();
      return successfullyAuthenticated();
    }
    setIsAuthenticating(false);
  };

  const unlockWithKey = async () => {
    setIsAuthenticating(true);
    if (await startAndDecrypt()) {
      ReactNativeHapticFeedback.trigger('notificationSuccess', { ignoreAndroidSystemSettings: false });
      successfullyAuthenticated();
    } else {
      setIsAuthenticating(false);
    }
  };

  const renderUnlockOptions = () => {
    if (isAuthenticating) {
      return <ActivityIndicator />;
    } else {
      const color = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
      if ((biometricType === Biometric.TouchID || biometricType === Biometric.Biometrics) && !isStorageEncryptedEnabled) {
        return (
          <TouchableOpacity accessibilityRole="button" disabled={isAuthenticating} onPress={unlockWithBiometrics}>
            <Icon name="fingerprint" size={64} type="font-awesome5" color={color} />
          </TouchableOpacity>
        );
      } else if (biometricType === Biometric.FaceID && !isStorageEncryptedEnabled) {
        return (
          <TouchableOpacity accessibilityRole="button" disabled={isAuthenticating} onPress={unlockWithBiometrics}>
            {/* <Image
              source={colorScheme === 'dark' ? require('./img/faceid-default.png') : require('./img/faceid-dark.png')}
              style={{
                width: 64,
                height: 64,
              }}
            /> */}
          </TouchableOpacity>
        );
      } else if (isStorageEncryptedEnabled) {
        return (
          <TouchableOpacity accessibilityRole="button" disabled={isAuthenticating} onPress={unlockWithKey}>
            <Icon name="lock" size={64} type="feather" color={color} />
          </TouchableOpacity>
        );
      }
    }
  };

  const onButtonPress = async () => {
    if (!p1 || !p2) {
      setIsError(true);
    }
    if (p1 === p2) {
      await encryptStorage(p1);
      saveToDisk();
      successfullyAuthenticated();
    } else {
      setIsError(true);
    }
  };

  return (
    <View style={{flex: 1}}>
      <View style={defaultStyles.modal}>
        <View style={{gap: 24}}>
          <InputSection
            label={'Username'}
            placeholderText={'Username'}
            max={32}
            input={username}
            onChange={setUsername}
          />
          <InputSection
            label={'Password'}
            placeholderText={'Password'}
            max={32}
            input={p1}
            onChange={setP1}
            error={isError}
          />
          <InputSection
            label={'Confirm Password'}
            placeholderText={'Confirm Password'}
            max={32}
            input={p2}
            onChange={setP2}
            error={isError}
          />
        </View>
        <Button
          title={'Continue'}
          action={onButtonPress}
        />
      </View>
    </View>
  );
};

export default Onboard;
