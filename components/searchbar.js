import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { useTheme, useNavigation } from '@react-navigation/native';
import { defaultStyles } from './defaultStyles';
import loc from '../loc';

const SearchBar = () => {
    const { colors } = useTheme();
    const [ focused, setFocused ] = useState(false);
    
    return (
        <View 
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
            }}
        >
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingRight: 8,
                    borderWidth: 2,
                    borderRadius: 100,
                    borderColor: (focused ? colors.primary : colors.foreground),
                }}
            >
                <TextInput
                    underlineColorAndroid="transparent"
                    //value={'Search anything'}
                    style={{
                        fontFamily: 'Poppins',
                        fontSize: 14,
                        height: 56,
                        paddingHorizontal: 20,
                        color: colors.foreground,
                    }}
                    placeholder={loc._.search_placeholder}
                    placeholderTextColor={colors.foregroundInactive}
                    onFocus={() => setFocused(true)}
                    //onChangeText={onChangeInput}
                    autoCorrect={false}
                    autoCapitalize="none"
                    spellCheck={false}
                    selectTextOnFocus={false}
                    keyboardType={Platform.OS === 'android' ? 'visible-password' : 'default'}
                />
                <TouchableOpacity
                    style={{
                        padding: 8,
                        borderRadius: 100,
                        backgroundColor: (focused ? colors.primary : colors.foreground),
                    }}
                    onPress={focused ? (null) : (() => setFocused(true)) }
                >
                    <Icon 
                        color={colors.background}
                        name={focused ? 'arrow-right' : 'search'}
                        type="feather"
                        width={24}
                        height={24}
                    />
                </TouchableOpacity>
            </View>
            {focused && (
                <TouchableOpacity
                    onPress={() => setFocused(false)}
                >
                    <Text style={defaultStyles.btnSecondaryText}>
                        {loc._.cancel}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default SearchBar;