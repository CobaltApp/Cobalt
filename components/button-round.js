import { TouchableOpacity } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import loc from '../loc';

const RoundButton = ({ label, size, icon, action, navigateTo }) => {
  const { colors } = useTheme();
  //const { navigate } = useNavigation();
    
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: size,
          width: size,
          borderRadius: 1000,
          backgroundColor: colors.card,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
        onPress={action}
      >
        <Icon name={icon} type="feather" size={24} color={colors.foreground} />
      </TouchableOpacity>
    )
}

export default RoundButton;