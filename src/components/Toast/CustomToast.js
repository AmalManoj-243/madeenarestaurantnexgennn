import { BaseToast, ErrorToast } from 'react-native-toast-message';
export default CustomToast = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: 'green' }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 15,
                fontWeight: '400',
                fontFamily: 'raleway'
            }}
            text2Style={{
                fontSize: 13,
                fontFamily: 'raleway',
                fontWeight: '400',
            }}
        />
    ),

    error: (props) => (
        <ErrorToast
            {...props}
            text1Style={{
                fontSize: 15,
                fontFamily: 'raleway',
                fontWeight: '400',
            }}
            text2Style={{
                fontSize: 13,
                fontFamily: 'raleway',
                fontWeight: '400',
            }}
        />
    ),
};