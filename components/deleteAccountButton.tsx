import React from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

interface DeleteAccountButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  loadingLabel?: string;
  variant?: "outline" | "filled";
  className?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const DeleteAccountButton: React.FC<DeleteAccountButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
  label = "Delete Account",
  loadingLabel = "Deleting account...",
  variant = "outline",
  className = "",
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  const containerClassName =
    variant === "filled"
      ? "w-full rounded border border-[#B91C1C] bg-[#B91C1C] px-5 py-4"
      : "w-full rounded border border-[#B91C1C] bg-white px-5 py-4";
  const textClassName = variant === "filled" ? "text-center text-white" : "text-center text-[#B91C1C]";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      className={`${containerClassName} ${isDisabled ? "opacity-60" : "opacity-100"} ${className}`}
      style={style}
    >
      <Text className={textClassName} style={textStyle}>
        {loading ? loadingLabel : label}
      </Text>
    </TouchableOpacity>
  );
};

export default DeleteAccountButton;