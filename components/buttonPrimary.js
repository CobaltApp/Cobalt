import { Text, TouchableOpacity } from 'react-native';
import { defaultStyles } from './defaultStyles';

const Button = ({ title, action }) => {
    
    return (
        <TouchableOpacity 
          style={defaultStyles.btn}
          onPress={action}
        >
          <Text style={defaultStyles.btnText}>
            {title}
          </Text>
        </TouchableOpacity>
    )
}

export default Button;