import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, ViewStyle } from "react-native";

interface DeleteButtonProps {
  onPress: () => void;
  variant?: "filled" | "outline" | "ghost";
  shape?: "circle" | "square" | "pill";
  size?: "sm" | "md" | "lg";
  label?: string;
  showIcon?: boolean;
  className?: string;
  style?: ViewStyle;
}

const sizeMap = {
  sm: 32,
  md: 44,
  lg: 52,
};

const iconSizeMap = {
  sm: 14,
  md: 18,
  lg: 20,
};

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onPress,
  variant = "filled",
  shape = "circle",
  size = "md",
  label,
  showIcon = true,
  className = "",
  style,
}) => {
  const btnSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  const variantStyles = {
    filled: "bg-black border border-black",
    outline: "bg-white border border-black",
    ghost: "bg-transparent border border-transparent",
  };

  const textColor =
    variant === "filled" ? "text-white" : "text-black";

  const iconColor = variant === "filled" ? "white" : "black";

  const radiusClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "pill"
      ? "rounded-full px-4"
      : "rounded";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`items-center justify-center flex-row ${variantStyles[variant]} ${radiusClass} ${className}`}
      style={[
        {
          minWidth: label ? undefined : btnSize,
          width: label ? undefined : btnSize,
          height: btnSize,
        },
        style,
      ]}
    >
      {showIcon && <Feather name="trash-2" size={iconSize} color={iconColor} />}
      {label ? (
        <Text className={`${textColor} text-[12px] ml-2 tracking-[1px]`}>
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

export default DeleteButton;