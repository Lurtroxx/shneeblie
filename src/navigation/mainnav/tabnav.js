import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { renderIcon } from '~/hooks';

import { TabOneView } from '~/views';
import { TabTwoView } from '~/views';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen
                    name="Home"
                    component={TabOneView}
                    options={{ tabBarIcon: renderIcon("home") }}
                />
                <Tab.Screen
                    name="Settings"
                    component={TabTwoView}
                    options={{ tabBarIcon: renderIcon("cog") }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}


