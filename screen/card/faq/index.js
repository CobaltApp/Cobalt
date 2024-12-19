import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

import navigationStyle from '../../../components/navigationStyle';
import SearchBar from '../../../components/searchbar'
import loc from '../../../loc';
import { defaultStyles } from '../../../components/defaultStyles';
import { TouchableOpacity } from 'react-native-gesture-handler';

const CardFAQ = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    section: {
        paddingVertical: 32,
        gap: 24,
    },
    listItem: {
        display: 'flex',
        alignItems: 'stretch',
        gap: 16,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.foregroundInactive,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
  });

  return (
    <View style={styles.root}>
      {/* <SearchBar/> */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.section}
      >
        {loc.faq.map((x, index) => (
          <View
            key={index} 
            style={styles.listItem}
          >
            <TouchableOpacity
              style={styles.header}
              onPress={activeIndex == (index + 1) ? (() => setActiveIndex(0)) : (() => setActiveIndex(index + 1))}
            >
              <Text style={[defaultStyles.h4, {maxWidth: (width - 72)}]}>
                {x.title}
              </Text>
              <Icon 
                color={colors.foregroundInactive}
                name={activeIndex == (index + 1) ? 'chevron-down' : 'chevron-right'}
                type="feather"
                width={24}
                height={24}
              />
            </TouchableOpacity>
            {activeIndex == (index + 1) && (
              <Text style={defaultStyles.bodyText}>
                {x.body}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CardFAQ;

CardFAQ.navigationOptions = navigationStyle({headerTitleAlign: 'left',});