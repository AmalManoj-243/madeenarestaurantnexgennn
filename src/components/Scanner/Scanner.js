import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Button, Animated, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const Scanner = ({ route }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [requestedPermission, setRequestedPermission] = useState(false);

    const scaleValue = useRef(new Animated.Value(1)).current;
    const translateYValue = useRef(new Animated.Value(0)).current;

    const { onScan, onClose = false } = route?.params || {};
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
    };

    useEffect(() => {
        if (!requestedPermission) {
            getCameraPermissions();
            setRequestedPermission(true);
        }
    }, [requestedPermission]);

    useEffect(() => {
        if (hasPermission === false) {
            setRequestedPermission(false);
            getCameraPermissions();
        }
    }, [hasPermission]);

    useEffect(() => {
        Animated.timing(scaleValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        const zoomAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleValue, {
                    toValue: 1.1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleValue, {
                    toValue: 1.0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );

        if (!scanned) {
            zoomAnimation.start();
        } else {
            zoomAnimation.stop();
            Animated.timing(translateYValue, {
                toValue: 1000,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
        return () => zoomAnimation.stop();
    }, [scanned, translateYValue]);

    useEffect(() => {
        if (isFocused) {
            setScanned(false); 
        }
    }, [isFocused]);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        onScan(data);
        if (onClose) {
            navigation.goBack();
        }
    };

    const toggleFlash = () => {
        setIsFlashOn(!isFlashOn);
    };

    const handleClose = () => {
        Animated.timing(translateYValue, {
            toValue: 1000,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            navigation.goBack();
        });
    };

    return (
        <Animated.View style={[styles.container]}>
            {isFocused && hasPermission && (
                <View style={styles.scannerContainer}>
                    <Camera
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={StyleSheet.absoluteFillObject}
                        flashMode={isFlashOn ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
                        barCodeScannerSettings={{
                            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                        }}
                    />
                    <View style={styles.scannerOverlay}>
                        <Animated.Image
                            source={require('@assets/images/scanner/scanner.png')}
                            style={[styles.scannerImage, { transform: [{ scale: scaleValue }] }]}
                        />
                    </View>
                </View>
            )}
            <View style={styles.bottomButtonsContainer}>
                <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
                    <Ionicons name={isFlashOn ? 'flash' : 'flash-off'} size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.refreshButton} onPress={() => setScanned(false)}>
                    <Ionicons name={'refresh'} size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Ionicons name="close" size={30} color="white" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default Scanner;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    scannerContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: 'black',
    },
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerImage: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
        tintColor: 'white',
    },
    buttonContainer: {
        marginTop: 20,
    },
    bottomButtonsContainer: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    flashButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    closeButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    refreshButton: {
        padding: 10,
        borderRadius: 5,
    },
});
