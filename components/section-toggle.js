import { Switch, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { defaultStyles } from './defaultStyles';

const ToggleSection = ({ header, body, input, onChange }) => {
  const { colors } = useTheme();
    
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ gap: 4 }}>
          <Text style={defaultStyles.h4}>
            {header}
          </Text>
          <Text style={defaultStyles.label}>
            {body}
          </Text>
        </View>
        <Switch 
          value={input} 
          onValueChange={onChange} 
          trackColor={{true: colors.primary}} 
          thumbColor={colors.card}
        />
      </View>
    )
}

export default ToggleSection;