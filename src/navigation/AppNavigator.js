// navigation/TabNavigator.js
import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, MaterialCommunityIcons, MaterialIcons, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import TabBarIcon from '@components/TabBarIcon';
import { HomeScreen, CartScreen, CategoriesScreen, MyOrdersScreen, ProfileScreen } from '@screens';
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const tabBarOptions = {
    tabBarShowLabel: false,
    tabBarHideOnKeyboard: true,
    headerShown: false,
    tabBarStyle: {
      position: "absolute",
      bottom: 5,
      right: 10,
      left: 10,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      // borderRadius: 10,
      elevation: 0,
      height: 60,
      backgroundColor: '#2e294e', // Focused state background color
    }
  };

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabBarIcon
              focused={focused}
              iconComponent={require('@assets/icons/bottom_tabs/home.png')}
              label="Home"
            />
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabBarIcon
              focused={focused}
              iconComponent={require('@assets/icons/bottom_tabs/category.png')}
              label="Categories"
            />
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabBarIcon
              focused={focused}
              iconComponent={require('@assets/icons/bottom_tabs/cart.png')}
              label="Cart"
            />
          // tabBarStyle: { display: 'none' }
        }}
      />
      <Tab.Screen
        name="MyOrders"
        component={MyOrdersScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabBarIcon
              focused={focused}
              iconComponent={require('@assets/icons/bottom_tabs/order.png')}
              label="Orders"
            />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabBarIcon
              focused={focused}
              iconComponent={require('@assets/icons/bottom_tabs/profile.png')}
              label="Profile"
            />
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
