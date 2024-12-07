import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

import navigationStyle from '../../components/navigationStyle';
import Button from '../../components/button-primary'
import loc from '../../loc';
import { defaultStyles } from '../../components/defaultStyles';

const Card = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const [isActive, setActive] = useState(false);

  return (
    <View>
      <View 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 36,
        }}
      >
        <Image
          source={require('../../img/icons/virtual_card.png')} 
          style={{
            width: 400,
            height: 400,
          }}
        />
        <Text style={defaultStyles.h1}>
          {loc.card.title}
        </Text>
        <Text style={defaultStyles.bodyText}>
          {loc.card.subtitle}
        </Text>
      </View>
      <View style={{paddingHorizontal:24}}>
        <Button title={"Get Started"}/>
      </View>
    </View>
  );
};

export default Card;

Card.navigationOptions = navigationStyle({});