import { Text, TouchableOpacity } from "react-native";

interface DeleteButtonProps {
  onPress?: () => void;
  label?: string;
  className?:string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onPress, label = "Delete",className }) => {
  return (
    <TouchableOpacity
      className="bg-blue-500 rounded-md p-3 m-5"
      onPress={onPress}
    >
      <Text className="text-white text-center text-lg">{label}</Text>
    </TouchableOpacity>
  );
};

export default DeleteButton;
