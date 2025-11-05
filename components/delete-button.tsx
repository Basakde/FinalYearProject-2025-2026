import { Text, TouchableOpacity } from "react-native";

interface DeleteButtonProps {
  onPress?: () => void;
  label?: string;
  className?:string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onPress, label = "Delete",className }) => {
  return (
    <TouchableOpacity
      className="rounded-xl m-10 bg-cyan-500 h-16 p-5 items-center justify-content"
      onPress={onPress}
    >
      <Text className="text-white text-center text-lg">{label}</Text>
    </TouchableOpacity>
  );
};

export default DeleteButton;
