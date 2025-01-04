import React from 'react';
import { View, Image } from 'react-native';

const BlankPage = () => {

  return (
    <View 
      style={{ 
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={require('../img/icon.png')}
        style={{
          height: 128,
          width: 128,
        }}
      />

    </View>
  );
};

export default BlankPage;
