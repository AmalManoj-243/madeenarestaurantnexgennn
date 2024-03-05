// components/common/CommonContainer.js

import React from 'react';
import { View } from 'react-native';
import { COLORS } from '@constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const CommonContainer = ({ children, backgroundColor = COLORS.primaryThemeColor }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
      <View style={{ flex: 1, backgroundColor: 'white', borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default CommonContainer;
