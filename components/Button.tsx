import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import React, { ForwardedRef } from "react";
import { colors } from "@/constants/Colors";
import Color from "color";
import { MonoText } from "./StyledText";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeOut,
  FadeOutUp,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps extends TouchableOpacityProps {
  label?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  rest?: any[];
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  rounded?: boolean;
}

const Button = React.forwardRef(
  (
    {
      label,
      icon,
      variant = "primary",
      style,
      labelStyle,
      rounded = false,
      disabled,
      ...rest
    }: ButtonProps,
    ref: ForwardedRef<TouchableOpacity>
  ) => {
    const backgroundColor =
      variant === "primary"
        ? colors.primary
        : variant === "danger"
        ? colors.danger
        : colors.backgroud;

    return (
      <TouchableOpacity
        ref={ref}
        disabled={disabled}
        // entering={FadeInDown.duration(200)}
        // exiting={FadeOutUp.duration(200)}
        activeOpacity={0.6}
        style={[
          {
            backgroundColor,
            borderColor: ["primary", "secondary"].includes(variant)
              ? colors.primary
              : colors.danger,
            borderWidth: 3,
            borderRadius: rounded ? 99 : 12,
            opacity: disabled ? 0.3 : 1,
          },
          styles.button,
          style,
        ]}
        {...rest}
      >
        {icon}
        {label && (
          <Text
            style={[
              { color: variant === "primary" ? colors.backgroud : "white" },
              styles.label,
              labelStyle,
            ]}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
);

export default Button;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    // borderTopLeftRadius: 24,
    // borderBottomRightRadius: 24,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Blauer Medium",
    fontSize: 22,
    // fontWeight: '400',
  },
});
