// src/navigation/StackNavigator.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppNavigator from "./AppNavigator";
import { ProductsScreen, SplashScreen } from "@screens";
import { OptionsScreen } from "@screens/Home/Options";
import { PrivacyPolicy } from "@screens/Auth";
import LoginScreenOdoo from "@screens/Auth/LoginScreenOdoo";
import CategoriesScreen from "@screens";
import Scanner from "@components/Scanner";
import SalesOrderChoice from "@screens/Home/Sections/Customer/SalesOrderChoice";
import POSRegister from "@screens/Home/Sections/Customer/POSRegister";
import ChooseOrderType from '@screens/Home/Sections/Customer/ChooseOrderType';
import TakeawayOrdersScreen from '@screens/Home/Sections/Customer/TakeawayOrdersScreen';
import POSOpenAmount from "@screens/Home/Sections/Customer/POSOpenAmount";
import POSProducts from "@screens/Home/Sections/Customer/POSProducts";
import POSCartSummary from "@screens/Home/Sections/Customer/POSCartSummary";
import POSPayment from "@screens/Home/Sections/Customer/POSPayment";
import TakeoutDelivery from '@screens/Home/Sections/Customer/TakeoutDelivery';
import CreateInvoice from '@screens/Home/Sections/Customer/CreateInvoice';
import CreateInvoicePreview from '@screens/Home/Sections/Customer/CreateInvoicePreview';
import KitchenBillPreview from '@screens/Home/Sections/Customer/KitchenBillPreview';
import { ProductDetail } from "@components/common/Detail";
import { CustomerDetails, CustomerScreen } from "@screens/Home/Sections/Customer";
import { CustomerFormTabs } from "@screens/Home/Sections/Customer/CustomerFormTabs";
import POSReceiptScreen from '@screens/Home/Sections/Customer/POSReceiptScreen';
import TablesScreen from '@screens/Tables/TablesScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreenOdoo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SalesOrderChoice"
        component={SalesOrderChoice}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="POSRegister"
        component={POSRegister}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChooseOrderType"
        component={ChooseOrderType}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TakeawayOrders"
        component={TakeawayOrdersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="POSOpenAmount"
        component={POSOpenAmount}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="POSProducts"
        component={POSProducts}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="POSCartSummary"
        component={POSCartSummary}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="POSPayment"
        component={POSPayment}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="POSReceiptScreen"
        component={POSReceiptScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TakeoutDelivery"
        component={TakeoutDelivery}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateInvoice"
        component={CreateInvoice}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateInvoicePreview"
        component={CreateInvoicePreview}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="KitchenBillPreview"
        component={KitchenBillPreview}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Scanner"
        component={Scanner}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppNavigator"
        component={AppNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OptionsScreen"
        component={OptionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomerScreen"
        component={CustomerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomerDetails"
        component={CustomerDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomerFormTabs"
        component={CustomerFormTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TablesScreen"
        component={TablesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
