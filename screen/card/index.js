import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

import navigationStyle from '../../components/navigationStyle';
import Button from '../../components/button-primary'
import loc from '../../loc';
import { defaultStyles } from '../../components/defaultStyles';
import RoundButton from '../../components/button-round';

const Card = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { navigate, setOptions } = useNavigation();
  const { colors } = useTheme();
  const [isActive, setActive] = useState(false);

  useEffect(() => {
    setOptions({
      headerRight: () => (
        <View style={{ marginRight: 24 }}>
          <RoundButton label={'FAQ'} size={32} icon="help-circle" action={() => navigate('FAQ')} />
        </View>
      ),
      })
  }, []);

  return (
    <View>
      <View 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 36,
          gap: 12,
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
        <Button
          title={"Get Started"}
          action={()=>{Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSdsdoSlXq9Hc1BO2HJ8B1WfSW8oTCrD-XoE1tFrS8NUJJ3IUw/viewform?usp=dialog')}}
        />
      </View>
    </View>
  );
};

export default Card;

Card.navigationOptions = navigationStyle({});