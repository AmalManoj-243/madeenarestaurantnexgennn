// AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BottomTabBar from '@components/BottomTabBar'
import { HomeScreen } from '@screens/Home';
import { CategoriesScreen } from '@screens/Categories';
import { CartScreen } from '@screens/Cart';
import { DashboardScreen } from '@screens/Dashboard';
import { MyOrdersScreen } from '@screens/MyOrders';


const Tab = createBottomTabNavigator();
const screenOptions = {
  tabBarShowLabel: false,
  tabBarHideOnKeyboard: true,
  headerShown: false,
}

const AppNavigator = () => {
  return (
    <Tab.Navigator screenOptions={screenOptions} tabBar={props => <BottomTabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="MyOrders" component={MyOrdersScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
