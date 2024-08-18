import React, { useContext, useState } from 'react';
import { StatusBar, ScrollView, View, TouchableOpacity, Text, TextInput, Image, ImageBackground, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import Obscure from 'react-native-obscure';
//import { BlurView } from "@react-native-community";

import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueFormInput, BlueButton, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
import loc from '../loc';
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers';
//import { TextInput } from 'react-native-gesture-handler';
const prompt = require('../helpers/prompt');
import { defaultStyles } from '../components/defaultStyles';

const Chat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const [isActive, setActive] = useState(false);
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
    lockedCard: {
        display: 'flex',
        alignItems: 'center',
        top: 200,
        marginHorizontal: 24,
        padding: 24,
        paddingTop: 100,
        borderRadius: 25,
        gap: 16,
        backgroundColor: colors.card,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    lockedBody: {
        color: colors.foregroundInactive,
        fontFamily: 'Poppins',
        fontWeight: '500',
        fontSize: 14,
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 48,
        paddingVertical: 16,
        borderRadius: 40,
        backgroundColor: colors.button,
    },
    buttonText: {
        color: colors.white,
        fontFamily: 'Poppins',
        fontWeight: '600',
        fontSize: 16,
    },
});

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
                zIndex: 100,
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
        >
                {/* <Image
                source={require('../img/Rectangle.png')}
                style={{
                    flex: 1,
                    position: 'absolute',
                    width: ScreenWidth,
                    height: ScreenHeight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    //opacity: 0.1,
                    //backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    //zIndex: 100,
                }}
                /> */}
                {/* <BlurView 
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                    reducedTransparencyFallbackColor="gray"
                    blurType="light"
                    blurAmount={20}
                /> */}
                    <Image
                        style={{
                            //position: 'absolute',
                            alignSelf: 'center',
                            top: 280,
                            width: 162,
                            height: 142,
                            //marginBottom: -250,
                            zIndex: 101,
                        }}
                        source={require('../img/Illustrations/robot-head-19.png')}
                    />
                    <View style={styles.lockedCard}>
                        {/* <View style={styles.row}>
                            <Icon name="lock" type="feather" size={32} colors={colors.foreground}/>
                            <Text style={defaultStyles.h3}>
                                This feature is under development
                            </Text>
                        </View> */}
                        <Text style={defaultStyles.h3}>
                            This feature is under development
                        </Text>
                        <Text style={styles.lockedBody}>
                            Chat with Colby, your AI financial assistant, for personalized insights and expert advice on your investment journey. Coming soon to Cobalt!
                        </Text>
                        {/* <Text style={styles.lockedBody}>
                            Chat is only available for premium members. Subscribe to our premium membership to live chat with Colby, get discounted rates, and much more!
                        </Text> */}
                        {/* <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>
                                Try Now
                            </Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            }
        <View
            style={{
                paddingTop: 20,
                paddingBottom: 32,
                paddingHorizontal: 24,
            }}
        >
            <View style={{ paddingVertical: 32 }}>
                <Text style={defaultStyles.h1}>
                    Chat
                </Text>
            </View>
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

export default Chat;

Chat.navigationOptions = navigationStyle({
  title: loc.plausibledeniability.title,
});
