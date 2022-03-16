import { MainTabNavigator } from "~/navigation";
import { enableScreens } from 'react-native-screens' // react-native-screens is a react-navigation dependency


enableScreens()

export default function App() {
  return (
    <MainTabNavigator />
  );
}

