import React, { useContext, useState } from 'react';
import { StatusBar, ScrollView, View, TouchableOpacity, Text, TextInput, Image } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon} from 'react-native-elements';

import navigationStyle from '../components/navigationStyle';
import { BlueLoading, BlueFormInput, BlueButton, SafeBlueArea, BlueCard, BlueText, BlueSpacing20 } from '../BlueComponents';
import loc from '../loc';
//import { TextInput } from 'react-native-gesture-handler';
const prompt = require('../helpers/prompt');

const Chat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useNavigation();
  const { colors } = useTheme();

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
            <View
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
            </View>
        <ScrollView
        >
            <SafeBlueArea>
                <View
                    style={{
                        flex: 1,
                        width: 375,
                        height: 400,
                        overflow: 'scroll',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        paddingBottom: 20,
                    }}
                >
                </View>
            </SafeBlueArea>
        </ScrollView>
        <View
            style={{
                //width: 311,
                //position: 'absolute',
                //bottom: 92,
            }}
        >
            <BlueFormInput
                placeholder="Ask Colby..."
            />
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
