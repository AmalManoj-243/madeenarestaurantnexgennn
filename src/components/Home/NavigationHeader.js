import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FONT_FAMILY } from '@constants/theme';
import Text from '@components/Text';

const NavigationHeader = ({ onSearchPress, onOptionsPress, onScannerPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onSearchPress}>
        <Image source={require('@assets/images/Home/Header/search.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onOptionsPress}>
        <Text style={styles.text}>What are you looking for ?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onScannerPress}>
        <Image source={require('@assets/images/Home/Header/barcode_scanner.png')} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2e294e',
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  text: {
    color: 'white',
    fontFamily: FONT_FAMILY.urbanistLight,
  },
});

export default NavigationHeader;
