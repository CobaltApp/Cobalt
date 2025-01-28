import { Switch, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { defaultStyles } from './defaultStyles';

const ToggleSection = ({ header, body, input, onChange }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
    
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ gap: 12, maxWidth: width - 96 }}>
          <Text style={defaultStyles.h4}>
            {header}
          </Text>
          <Text style={defaultStyles.label}>
            {body}
          </Text>
        </View>
        <View style={{display: 'flex', flex: 1, alignItems: 'flex-end'}}>
          <Switch 
            value={input} 
            onValueChange={onChange} 
            trackColor={{true: colors.primary}} 
            thumbColor={colors.card}
          />
        </View>
      </View>
    )
}

export default ToggleSection;