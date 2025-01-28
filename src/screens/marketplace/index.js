import React, { useState, useEffect } from 'react';
import { Linking, View, TouchableOpacity, Text, Image, TextInput, FlatList, StyleSheet, ImageBackground} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon} from 'react-native-elements';
import { ScreenWidth, ScreenHeight } from 'react-native-elements/dist/helpers';
import { defaultStyles } from '../../components/defaultStyles';
import loc from '../../loc';

import Button from '../../components/button-primary'

const Marketplace = () => {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    search: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 24,
      height: 56,
      gap: 12,
      borderRadius: 25,
      backgroundColor: colors.card,
    },
    categoryContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'center',
      gap: 16,
    },
    category: {
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 25,
      backgroundColor: colors.card,
    },
    categoryText: {
      color: colors.foreground,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 12,
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    rowSubtitle: {
      color: colors.foregroundInactive,
      fontFamily: 'Poppins',
      fontWeight: '500',
      fontSize: 14,
    },
  });

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
          source={require('../../../assets/icons/nft_collectables.png')} 
          style={{
            width: 400,
            height: 400,
          }}
        />
        <Text style={defaultStyles.h1}>
          {loc.marketplace.title}
        </Text>
        <Text style={defaultStyles.bodyText}>
          {loc.marketplace.subtitle}
        </Text>
      </View>
      <View style={{paddingHorizontal:24}}>
        <Button
          title={"Get Started"}
          action={()=>{Linking.openURL('https://forms.gle/6vMSqgKkYFDiwrW98')}}
        />
      </View>
      {/* {data.map((x, index) => (
            <ImageBackground
            source={{ uri: x.thumbnail }}
            style={{
              display: 'flex',
              width: ScreenWidth - 48,
              height: 364,
              padding: 8,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
            imageStyle={{
              borderRadius: 24,
            }}
          >
            <View
              style={{
                borderRadius: 16,
                padding: 8,
                backgroundColor: colors.card
              }}
            >
              <Text style={defaultStyles.h4}>
                {x.createdAt}
              </Text>

            </View>
            <View
              style={{
                display: 'flex',
                alignSelf: 'stretch',
                borderRadius: 16,
                padding: 16,
                backgroundColor: colors.card
              }}
            >
              <Text style={defaultStyles.h3}>
                {x.title}
              </Text>
            </View>
          </ImageBackground>
          ))} */}
    </View>
  );
};

export default Marketplace;
