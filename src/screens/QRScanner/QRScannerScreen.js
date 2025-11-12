import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { LoadingButton } from '@components/common/Button';
import { COLORS, FONT_FAMILY } from '@constants/theme';

const QRScannerScreen = ({ navigation, route }) => {
  const { onScanSuccess } = route.params || {};
  const [scannedCode, setScannedCode] = useState('');

  const handleManualInput = () => {
    if (scannedCode.trim()) {
      if (onScanSuccess) {
        onScanSuccess(scannedCode.trim());
      }
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Please enter a valid code');
    }
  };

  const handleSimulatedScan = () => {
    // Simulate a scanned QR code
    const simulatedCode = `INV-${Date.now().toString().slice(-6)}`;
    setScannedCode(simulatedCode);
    
    Alert.alert(
      'QR Code Scanned',
      `Code: ${simulatedCode}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use This Code', 
          onPress: () => {
            if (onScanSuccess) {
              onScanSuccess(simulatedCode);
            }
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        title="QR Scanner"
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.content}>
        {/* Simulate Camera View */}
        <View style={styles.cameraPlaceholder}>
          <View style={styles.scannerFrame} />
          <Text style={styles.instructionText}>
            Point your camera at a QR code
          </Text>
        </View>

        {/* Manual Input Option */}
        <View style={styles.manualSection}>
          <Text style={styles.manualTitle}>Or enter code manually:</Text>
          <TextInput
            style={styles.textInput}
            value={scannedCode}
            onChangeText={setScannedCode}
            placeholder="Enter QR code or invoice number"
            placeholderTextColor={COLORS.gray}
          />
          
          <View style={styles.buttonContainer}>
            <LoadingButton
              title="Simulate Scan"
              onPress={handleSimulatedScan}
              style={[styles.button, styles.simulateButton]}
              backgroundColor={COLORS.primaryThemeColor}
            />
            
            <LoadingButton
              title="Use Manual Code"
              onPress={handleManualInput}
              style={styles.button}
              backgroundColor={COLORS.green}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONT_FAMILY.urbanistMedium,
    textAlign: 'center',
    marginTop: 20,
  },
  manualSection: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 12,
  },
  manualTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.urbanistMedium,
    color: COLORS.black,
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
  },
  simulateButton: {
    marginRight: 5,
  },
});

export default QRScannerScreen;