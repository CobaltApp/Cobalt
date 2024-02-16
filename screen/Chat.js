import React, { useContext, useState } from 'react';
import { StatusBar, ScrollView, View, TouchableOpacity, Text, TextInput, Image, ImageBackground, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import { Icon} from 'react-native-elements';
import Obscure from 'react-native-obscure';

import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueFormInput, BlueButton, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
import loc from '../loc';
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';
//import { TextInput } from 'react-native-gesture-handler';
const prompt = require('../helpers/prompt');

const Chat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const [isActive, setActive] = useState(false);

  const navigateHome = () => {
    navigate('Home');
  };

    function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

    function typeText(element, text) {
        let index = 0

        let interval = setInterval(() => {
            if (index < text.length) {
                element.innerHTML += text.charAt(index)
                index++
            } else {
                clearInterval(interval)
            }
        }, 20)
    }

    // generate unique ID for each message div of bot
    // necessary for typing text effect for that specific reply
    // without unique ID, typing text will work on every element
    function generateUniqueId() {
        const timestamp = Date.now();
        const randomNumber = Math.random();
        const hexadecimalString = randomNumber.toString(16);

        return `id-${timestamp}-${hexadecimalString}`;
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
    
        const data = new FormData(form)
    
        // user's chatstripe
        chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
    
        // to clear the textarea input 
        form.reset()
    
        // bot's chatstripe
        const uniqueId = generateUniqueId()
        chatContainer.innerHTML += chatStripe(true, " ", uniqueId)
    
        // to focus scroll to the bottom 
        chatContainer.scrollTop = chatContainer.scrollHeight;
    
        // specific message div 
        const messageDiv = document.getElementById(uniqueId)
    
        // messageDiv.innerHTML = "..."
        loader(messageDiv)
    
        const response = await fetch('https://codex-im0y.onrender.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: data.get('prompt')
            })
        })
    
        clearInterval(loadInterval)
        messageDiv.innerHTML = " "
    
        if (response.ok) {
            const data = await response.json();
            const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 
    
            typeText(messageDiv, parsedData)
        } else {
            const err = await response.text()
    
            messageDiv.innerHTML = "Something went wrong"
            alert(err)
        }
    }

  return isLoading ? (
    <SafeBlueArea>
      <BlueLoading />
    </SafeBlueArea>
  ) : (
    <View>
        {isActive ? null : 
        <View
            style={{
                flex: 1,
                position: 'absolute',
                width: ScreenWidth,
                height: ScreenHeight,
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 100
            }}
        >
                <ImageBackground
                style={{
                    flex: 1,
                    width: ScreenWidth,
                    height: ScreenHeight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 100,
                }}
                >
                    <Image
                        style={{
                            position: 'absolute',
                            alignSelf: 'center',
                            top: -80,
                            zIndex: 101,
                        }}
                        source={require('../img/Illustrations/locked.png')}
                    />
                    <View
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginHorizontal: 24,
                            padding: 24,
                            paddingTop: 160,
                            borderRadius: 25,
                            gap: 16,
                            backgroundColor: '#0A3263',
                        }}
                    >
                        <Text
                            style={{
                                color: colors.foreground,
                                fontFamily: 'Poppins',
                                fontWeight: '600',
                                fontSize: 18,
                            }}
                        >
                            This feature is locked
                        </Text>
                        <Text
                            style={{
                                color: '#9395A4',
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                fontSize: 14,
                            }}
                        >
                        Chat is only available for premium members. Subscribe to our premium membership to live chat with Colby, get discounted rates, and much more!
                        </Text>
                        <TouchableOpacity
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: 48,
                                paddingVertical: 16,
                                borderRadius: 40,
                                backgroundColor: colors.primary,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.foreground,
                                    fontFamily: 'Poppins',
                                    fontWeight: '600',
                                    fontSize: 16,
                                }}
                            >
                                Try Now
                            </Text>
                        </TouchableOpacity>
                        

                    </View>
                    </ImageBackground>
                    </View>
            }
        <View
            style={{
                paddingTop: 20,
                paddingBottom: 32,
                paddingHorizontal: 24,
            }}
        >
            <View
                style={{ paddingVertical: 32, backgroundColor: colors.background }}
            >
                {/* <Image 
                    source={require('../img/profile.png')}
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background}}
                /> */}
                <Text 
                    style={{
                        color: colors.foreground,
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontSize: 32,
                    }}
                >
                    Chat
                </Text>
            </View>
            {/* <View
                style={{
                    display: 'flex',
                    padding: 24,
                    borderRadius: 25,
                    backgroundColor: colors.primary,
                }}
            >
                <Text
                    style={{
                        width: 180,
                        color: '#FFFFFF',
                        fontFamily: 'Poppins',
                        fontWeight: 600,
                        fontSize: 18,
                    }}
                >
                    Chat is under construction, check back later
                </Text>
                <Image 
                    source={require('../img/Illustrations/robot-head-19.png')}
                    style={{
                        width: 195,
                        height: 172,
                        position: 'absolute',
                        right: -16,
                        bottom: 16,
                    }}
                />
            </View> */}
        <ScrollView>
            <View
                style={{
                    flex: 1,
                    minHeight: ScreenHeight * 0.65,
                    overflow: 'scroll',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    paddingBottom: 20,
                }}
            >

            </View>
        </ScrollView>
        <View
        >
            <BlueFormInput
                placeholder="Ask Colby..."
            />
        </View>
    </View>
    </View>
  );
};

// form.addEventListener('submit', handleSubmit)
// form.addEventListener('keyup', (e) => {
//     if (e.keyCode === 13) {
//         handleSubmit(e)
//     }
// })

const styles = StyleSheet.create({
    blurOverlay: {
      ...StyleSheet.absoluteFillObject,
      position: 'absolute',
      top: 0,
      left: 0,
      width: ScreenWidth,
      height: ScreenHeight,
      //backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default Chat;

Chat.navigationOptions = navigationStyle({
  title: loc.plausibledeniability.title,
});
