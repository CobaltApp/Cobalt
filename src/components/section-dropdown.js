import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { defaultStyles } from './defaultStyles';
import { Icon } from 'react-native-elements';

const DropdownSection = ({ label, input }) => {
  const { colors } = useTheme();
    
    return (
      <View style={{ gap: 12 }}>
        <Text style={defaultStyles.hairline}>{label.toUpperCase()}</Text>
        {/* <KeyboardAvoidingView enabled={!Platform.isPad} behavior={Platform.OS === 'ios' ? 'position' : null}> */}
          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'row',
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: colors.card,
            }}
          >
            <Text>
              {input}
            </Text>
            <Icon 
              color={colors.foreground}
              name="chevron-down"
              type="feather"
              width={24}
              height={24}
            />
          </TouchableOpacity>
        {/* </KeyboardAvoidingView> */}
      </View>
    )
}

export default DropdownSection;