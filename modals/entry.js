import React, { useContext, useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, useColorScheme, LayoutAnimation } from 'react-native';
import { Icon } from 'react-native-elements';
import Biometric from '../class/biometrics';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { BlueStorageContext } from '../blue_modules/storage-context';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { isHandset } from '../blue_modules/environment';
import InputSection from '../components/section-input';
import { defaultStyles } from '../components/defaultStyles';

const Entry = () => {
  const { setWalletsInitialized, isStorageEncrypted, startAndDecrypt } = useContext(BlueStorageContext);
  const { dispatch, setOptions } = useNavigation();
  const { unlockOnComponentMount } = useRoute().params;
  const [biometricType, setBiometricType] = useState(false);
  const [isStorageEncryptedEnabled, setIsStorageEncryptedEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [animationDidFinish, setAnimationDidFinish] = useState(false);
  const colorScheme = useColorScheme();
  const { colors } = useTheme();

  const initialRender = async () => {
    let bt = false;
    if (await Biometric.isBiometricUseCapableAndEnabled()) {
      bt = await Biometric.biometricType();
    }

    setBiometricType(bt);
  };

  useEffect(() => {
    initialRender();
    onAnimationFinish();
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
      } else {
        return (
          <View style={defaultStyles.modal}>
            <View style={{gap: 24}}>
              <InputSection
                label={'Username'}
                placeholderText={'Username'}
              />
              <InputSection
                label={'Password'}
                placeholderText={'Password'}
              />
              <InputSection
                label={'Confirm Password'}
                placeholderText={'Confirm Password'}
              />
            </View>
          </View>
        )
      }
    }
  };

  const onAnimationFinish = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (unlockOnComponentMount) {
      const storageIsEncrypted = await isStorageEncrypted();
      setIsStorageEncryptedEnabled(storageIsEncrypted);
      if (!biometricType || storageIsEncrypted) {
        
        //dispatch(StackActions.replace('Unlock'));
        unlockWithKey();
        //successfullyAuthenticated();
      } else if (typeof biometricType === 'string') {
        unlockWithBiometrics();
      } else {
        successfullyAuthenticated();
        //dispatch(StackActions.replace('Onboard'));
      }
    }
    setAnimationDidFinish(true);
  };

  return (
    <View 
      style={{ 
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
      }}
    >
      
        {/* <LottieView 
          source={require('./img/intro.json')}
          autoPlay 
          loop={false} 
          onAnimationFinish={onAnimationFinish}
        /> */}
          {/* {animationDidFinish &&  */}
              {/* {renderUnlockOptions()} */}
              <Image
                source={require('../img/icon-borderless.png')}
                style={{
                  height: 128,
                  width: 128,
                }}
              />
          
    </View>
  );
};

export default Entry;
