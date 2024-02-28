// components/TabBarIcon.js
import React from 'react';
import { View, Text, Image } from 'react-native';

const TabBarIcon = ({ iconComponent, label, focused }) => (
  <View style={{ alignItems: "center", justifyContent: "center" }}>
    <View style={{ width: 50, height: 32, backgroundColor: focused ? "#fff" : "#2e294e", alignItems: 'center', justifyContent: 'center', borderRadius: 20 }}>
    <Image source={iconComponent} style={{ width: 25, height: 25, tintColor: focused ? "#151718" : "#fff" }} />
    </View>
    <Text style={{ fontSize: 10, color: "#FFFFFF" }}>{label}</Text>
  </View>
);

export default TabBarIcon;
