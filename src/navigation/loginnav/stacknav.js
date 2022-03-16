import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { renderIcon } from '~/hooks';

import { TabOneView } from '~/views';
import { TabTwoView } from '~/views';

const Stack = createStackNavigator();

export const MainStackNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={TabOneView}
                    options={{ tabBarIcon: renderIcon("home") }}
                />
                <Stack.Screen
                    name="Settings"
                    component={TabTwoView}
                    options={{ tabBarIcon: renderIcon("cog") }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}


