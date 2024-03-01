import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigation.replace('AppNavigator');
        }, 2000);

        return () => clearTimeout(timeout);
    }, [navigation]);

    return (
        <View style={styles.container}>
            {/* <StatusBar hidden />  */}
            <Image
                source={require('@assets/images/splash/splash.png')}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '80%',
        height: '80%'
    },
});

export default SplashScreen;
