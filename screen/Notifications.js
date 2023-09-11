import React, { useContext, useState } from 'react';
import { ScrollView, View, TouchableOpacity, Text, Image } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Icon} from 'react-native-elements';

import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueButton, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
import loc from '../loc';
import { BlueStorageContext } from '../blue_modules/storage-context';
import alert from '../components/Alert';
const prompt = require('../helpers/prompt');

const Notifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useNavigation();
  const { colors } = useTheme();

  const navigateHome = () => {
    navigate('Home');
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
                    Notifications
                </BlueText>
            </View>
        <ScrollView maxHeight={520}>
            <View>
                <Text
                    style={{
                        fontWeight: '400',
                        fontSize: 14,
                        color: colors.foregroundInactive,
                        marginBottom: 16,
                    }}
                >
                    Today
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        height: 120,
                        width: 320,
                        backgroundColor: colors.background,
                        borderColor: colors.lightButton,
                        borderWidth: 1,
                        borderRadius: 30,
                        paddingLeft: 13,
                        paddingTop: 25,
                      }}
                >
                    <View>
                        <Image 
                            source={require('../img/avatar-01.png')}
                            style={{ width: 40, height: 40, borderRadius: 15, backgroundColor: colors.background}}
                        />
                    </View>
                    <View
                        style={{
                            paddingLeft: 14,
                        }}
                    >
                        <Text 
                            style={{
                                fontWeight: '500',
                                fontSize: 16,
                                color: colors.foreground,
                            }}
                        >Clifford Hale</Text>
                        <Text
                            style={{
                                fontWeight: '400',
                                fontSize: 10,
                                color: colors.foreground,
                            }}
                        >Hallo bro anak wes piro saiki? wes kuliah ...</Text>
                        <Text
                            style={{
                                position: 'absolute',
                                left: 14,
                                bottom: 23,
                                fontWeight: '400',
                                fontSize: 9,
                                color: colors.foregroundInactive,
                            }}
                        >2 h ago</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
      </BlueCard>
    </SafeBlueArea>
  );
};

export default Notifications;

Notifications.navigationOptions = navigationStyle({
  title: loc.plausibledeniability.title,
});
