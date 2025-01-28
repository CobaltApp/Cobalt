import React from 'react';
import { View, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';

const BlankPage = () => {

  const { colors } = useTheme();

  return (
    <View 
      style={{ 
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
      }}
    >
      <Image
        source={require('../../assets/icon-borderless.png')}
        style={{
          height: 128,
          width: 128,
        }}
      />

    </View>
  );
};

export default BlankPage;
