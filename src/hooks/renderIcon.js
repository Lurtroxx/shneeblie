import { MaterialCommunityIcons } from "@expo/vector-icons";


export const renderIcon = (name) => {
    return ({ color, size }) => (
        <MaterialCommunityIcons name={name} color={color} size={size} />
    );
}
