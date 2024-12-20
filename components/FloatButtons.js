import React, { useState, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

const BORDER_RADIUS = 15;
const PADDINGS = 10;
const ICON_MARGIN = 8;

const cStyles = StyleSheet.create({
  root: {
    alignSelf: 'center',
    //height: '6.3%',
    minHeight: 56,
  },
  rootAbsolute: {
    position: 'relative',
    //bottom: 0,
  },
  rootInline: {},
  rootPre: {
    position: 'absolute',
    bottom: -1000,
  },
  rootPost: {
    borderRadius: 15,
    flexDirection: 'row',
    overflow: 'hidden',
  },
});

export const FContainer = forwardRef((props, ref) => {
  const [newWidth, setNewWidth] = useState();
  const layoutCalculated = useRef(false);

  const onLayout = event => {
    if (layoutCalculated.current) return;
    const maxWidth = Dimensions.get('window').width - BORDER_RADIUS - 20;
    const { width } = event.nativeEvent.layout;
    const withPaddings = Math.ceil(width + PADDINGS * 2);
    const len = React.Children.toArray(props.children).filter(Boolean).length;
    let newW = withPaddings * len > maxWidth ? Math.floor(maxWidth / len) : withPaddings;
    if (len === 1 && newW < 90) newW = 90; // to add Paddings for lonely small button, like Scan on main screen
    setNewWidth(newW);
    layoutCalculated.current = true;
  };

  return (
    <View
      ref={ref}
      onLayout={onLayout}
      style={[cStyles.root, props.inline ? cStyles.rootInline : cStyles.rootAbsolute, newWidth ? cStyles.rootPost : cStyles.rootPre]}
    >
      {newWidth
        ? React.Children.toArray(props.children)
            .filter(Boolean)
            .map((c, index, array) =>
              React.cloneElement(c, {
                width: newWidth,
                key: index,
                first: index === 0,
                last: index === array.length - 1,
              }),
            )
        : props.children}
    </View>
  );
});

FContainer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element]),
  inline: PropTypes.bool,
};

const buttonFontSize =
  PixelRatio.roundToNearestPixel(Dimensions.get('window').width / 26) > 22
    ? 22
    : PixelRatio.roundToNearestPixel(Dimensions.get('window').width / 26);

const bStyles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: 150,
    height: 56,
  },
  icon: {
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
});

export const FButton = ({ text, icon, width, first, last, ...props }) => {
  const { colors } = useTheme();
  const bStylesHook = StyleSheet.create({
    root: {
      backgroundColor: colors.primary,
    },
    text: {
      color: colors.background,
    },
    textDisabled: {
      color: colors.element,
    },
  });
  const style = {};

  if (width) {
    const paddingLeft = PADDINGS;
    const paddingRight = PADDINGS;
    style.paddingRight = paddingRight;
    style.paddingLeft = paddingLeft;
    //style.width = 150;
  }
  //<Icon name="repeat" type="feather" size={24} color={colors.background} />
  return (
    <TouchableOpacity accessibilityRole="button" style={[bStyles.root, bStylesHook.root, style]} {...props}>
      <View style={bStyles.icon}>
        {icon}
      </View>
      <Text numberOfLines={1} style={[bStyles.text, props.disabled ? bStylesHook.textDisabled : bStylesHook.text]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

FButton.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.element,
  width: PropTypes.number,
  first: PropTypes.bool,
  last: PropTypes.bool,
  disabled: PropTypes.bool,
};
