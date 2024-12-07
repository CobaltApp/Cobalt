import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { defaultStyles } from './defaultStyles';

const InputSection = ({ label, placeholderText, input, max, onChange, enabled, error }) => {
  const { colors } = useTheme();
  const [ isFocused, setIsFocused ] = useState(false);
    
    return (
      <View style={{ gap: 12 }}>
        <Text style={defaultStyles.hairline}>{label.toUpperCase()}</Text>
        {/* <KeyboardAvoidingView enabled={!Platform.isPad} behavior={Platform.OS === 'ios' ? 'position' : null}> */}
          <View 
            style={{
              display: 'flex',
              minHeight: 48,
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: (error ? colors.negative : (isFocused ? colors.primary : 'transparent')),
              backgroundColor: colors.card,
            }}
          >
            <TextInput
              testID={label}
              value={input}
              onChangeText={onChange}
              onFocus={() => setIsFocused(true)}
              //onBlur={walletNameTextInputOnBlur}
              numberOfLines={1}
              maxLength={max}
              placeholderTextColor={colors.foregroundInactive}
              placeholder={placeholderText}
              style={[defaultStyles.inputText, { color: enabled ? colors.foreground : colors.foregroundInactive }]}
              editable={enabled}
              underlineColorAndroid="transparent"
            />
          </View>
        {/* </KeyboardAvoidingView> */}
      </View>
    )
}

export default InputSection;