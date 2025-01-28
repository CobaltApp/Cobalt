import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';import { useTheme, useNavigation } from '@react-navigation/native';
import { defaultStyles } from './defaultStyles';

const Header = ({ title, icon, route }) => {
    const { colors } = useTheme();
    const { navigate } = useNavigation();
    
    return (
        <View 
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingTop: 44,
                paddingBottom: 16,
            }}
        >
            <Text style={defaultStyles.h2}>
                {title}
            </Text>
            {icon && route && (
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="HeaderButton"
                    onPress={() => navigate(`${route}`)}
                >
                    <Icon 
                        color={colors.foreground}
                        name={icon}
                        type="feather"
                        width={24}
                        height={24}
                    />
                </TouchableOpacity>
            )}
        </View>
    )
}

export default Header;