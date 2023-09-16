import React, { useContext, useState } from 'react';
import { ScrollView, View, TouchableOpacity, Text, Image, TextInput, } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon} from 'react-native-elements';

import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueButton, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
import loc from '../loc';
const prompt = require('../helpers/prompt');

const Discover = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState();
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const editable = true;

  const navigateHome = () => {
    navigate('Home');
  };
  const navigateToChart = () => {
    navigate('Chart');
  };

  return isLoading ? (
    <SafeBlueArea>
      <BlueLoading />
    </SafeBlueArea>
  ) : (
    <SafeBlueArea>
        <BlueCard>
            <View
                style={{
                    flexDirection: 'row',
                    marginBottom: 44,
                  }}
            >
                <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={loc._.more}
                testID="HomeButton"
                style={{
                  marginRight: 10,
                  height: 40,
                  width: 40,
                  backgroundColor: colors.lightButton,
                  borderRadius: 15,
                }}
                onPress={navigateHome}
              >
                <Icon size={24} name="chevron-left" type="feather" color={colors.border} style={{marginTop: 8}}/>
              </TouchableOpacity>
                <BlueText 
                    style={{
                        fontWeight: '400',
                        fontSize: 14,
                        color: colors.foreground,
                        marginTop: 13,
                    }}
                >
                    Discover
                </BlueText>
            </View>
            <TextInput
                testID="SearchInput"
                onChangeText={text => {
                    text = text.trim();
                    setSearch(text);
                  }}
                placeholder="Search Anything..."
                placeholderTextColor={colors.border}
                value={search}
                style={{
                    minHeight: 60,
                    paddingHorizontal: 12,
                    paddingVertical: 18,
                    flex: 1,
                    backgroundColor: colors.lightButton,
                    borderWidth: 0,
                    borderRadius: 20,
                    color: colors.foreground,
                    fontSize: 13,
                    textAlignVertical: 'center',
                    marginBottom: 20,
                }}
                editable={!isLoading && editable}
                multiline={false}
                //inputAccessoryViewID={inputAccessoryViewID}
                clearButtonMode="while-editing"
                //onBlur={onBlurEditing}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType='default'
            />
        <ScrollView minHeight={520}>
            <View>
                <Text
                    style={{
                        fontWeight: '400',
                        fontSize: 13,
                        color: colors.foregroundInactive,
                    }}
                >
                    Top
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        height: 68,
                        width: '100%',
                        backgroundColor: colors.background,
                        borderColor: colors.lightButton,
                        borderWidth: 1,
                        borderRadius: 20,
                        marginTop: 16,
                        paddingHorizontal: 17,
                        paddingVertical: 14,
                      }}
                >
                    <View>
                        <Image 
                            source={require('../img/addWallet/bitcoin.png')}
                            style={{ width: 40, height: 40, borderRadius: 20}}
                        />
                    </View>
                    <View
                        style={{
                            paddingLeft: 18,
                        }}
                    >
                        <Text 
                            style={{
                                fontWeight: '500',
                                fontSize: 16,
                                color: colors.foreground,
                            }}
                        >Bitcoin</Text>
                        <Text
                            style={{
                                fontWeight: '400',
                                fontSize: 10,
                                color: colors.foregroundInactive,
                            }}
                        >BTC</Text>
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            right: 0,
                            marginTop: 14,
                        }}
                    >
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={loc._.more}
                            testID="HomeButton"
                            style={{
                                position: 'absolute',
                                right: 0,
                                marginRight: 14,
                                height: 40,
                                width: 40,
                                backgroundColor: colors.lightButton,
                                borderRadius: 15,
                            }}
                            onPress={navigateToChart}
                        >
                            <Icon size={24} name="chevron-right" type="feather" color={colors.border} style={{marginTop: 8}}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
      </BlueCard>
    </SafeBlueArea>
  );
};

export default Discover;

Discover.navigationOptions = navigationStyle({
  title: "Discover",
});
