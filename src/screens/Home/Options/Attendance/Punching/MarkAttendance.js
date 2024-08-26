import React, { useEffect, useState } from 'react';
import { RoundedScrollContainer, SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { MapViewComponent } from '@components/MapViewScreen';
import * as Location from 'expo-location';
import { TextInput as FormInput } from '@components/common/TextInput';
import Text from '@components/Text';
import { FONT_FAMILY } from '@constants/theme';
import { formatDate } from '@utils/common/date';
import { Button } from '@components/common/Button';
import { View } from 'react-native';
import { post, put } from '@api/services/utils'; // Adjusted to include PUT
import { useAuthStore } from '@stores/auth';
import { fetchAttendance } from '@api/services/generalApi';
import { OverlayLoader } from '@components/Loader';

const MarkAttendanceScreen = ({ navigation, route }) => {
    const { date } = route?.params;
    const formattedDate = formatDate(date, 'yyyy-MM-dd');
    const currentUser = useAuthStore((state) => state.user);
    const [locationData, setLocationData] = useState({
        latitude: null,
        longitude: null,
    });
    const [loading, setLoading] = useState(true);
    const [buttonTitle, setButtonTitle] = useState('Forenoon Check In');
    const [attendanceStatus, setAttendanceStatus] = useState('');
    const [attendanceId, setAttendanceId] = useState({})
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const handleMarkAttendance = async () => {
        try {
            let endpoint;
            let requestPayload = {
                user_id: currentUser?._id,
                date: formattedDate,
            };

            if (attendanceStatus === '') {
                // Initial forenoon check-in
                endpoint = '/createAttendance';
                requestPayload.forenoon_in = new Date();
                await post(endpoint, requestPayload);
            } else {
                // Update attendance based on the current status
                endpoint = '/updateAttendance';
                if (attendanceStatus === 'Forenoon checkin') {
                    requestPayload.attendance_id = attendanceId
                    requestPayload.forenoon_out = new Date();
                } else if (attendanceStatus === 'Forenoon checkout') {
                    requestPayload.afternoon_in = new Date();
                    requestPayload.attendance_id = attendanceId
                } else if (attendanceStatus === 'afternoon checkin') {
                    requestPayload.afternoon_out = new Date();
                    requestPayload.attendance_id = attendanceId
                }
                await put(endpoint, requestPayload);
            }

            const response = await fetchAttendance({ userId: currentUser?._id, date: formattedDate });
            // Update the button title and attendance status based on the response
            if (response && response.length > 0) {
                const currentStatus = response?.[0].status;
                setAttendanceStatus(currentStatus);
                setAttendanceId(response?.[0]._id)
                updateButtonTitle(currentStatus);
            }
        } catch (error) {
            console.log('API Error: ', error);
        }
    };

    const updateButtonTitle = (status) => {
        switch (status) {
            case 'Forenoon checkin':
                setButtonTitle('Forenoon Check Out');
                break;
            case 'Forenoon checkout':
                setButtonTitle('Afternoon Check In');
                break;
            case 'afternoon checkin':
                setButtonTitle('Afternoon Check Out');
                break;
            case 'afternoon checkout':
                setIsButtonDisabled(true);
                setButtonTitle('Attendance Completed');
                break;

            default:
                setButtonTitle('Forenoon Check In');
        }
    };

    const fetchAttendanceApi = async () => {
        const response = await fetchAttendance({
            userId: currentUser?._id,
            date: formattedDate,
        });
        if (response && response.length > 0) {
            const currentStatus = response?.[0].status;
            setAttendanceId(response?.[0]?._id)
            setAttendanceStatus(currentStatus);
            updateButtonTitle(currentStatus);
        }
    };
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            console.log("🚀 ~ file: MarkAttendance.js:110 ~ status:", status);
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                setLoading(false);
                return;
            }
            try {
                const location = await Location.getCurrentPositionAsync({});
                setLocationData({
                    longitude: location.coords.longitude,
                    latitude: location.coords.latitude,
                });
            } catch (error) {
                console.log('Error getting location:', error);
            } finally {
                setLoading(false);
            }
        })();
        fetchAttendanceApi();
    }, []);

    return (
        <SafeAreaView>
            <NavigationHeader
                title="Mark Attendance"
                onBackPress={() => navigation.goBack()}
                showLogo={false}
            />
            <RoundedScrollContainer>
                <FormInput label={'Date & Time'} editable={false} value={formatDate(date, 'yyyy-MM-dd')} />
                <Button title={buttonTitle} onPress={handleMarkAttendance} disabled={isButtonDisabled} width={'80%'} alignSelf={'center'} />
                <View style={{ marginBottom: 100 }} />
                <Text style={{ fontFamily: FONT_FAMILY.urbanistSemiBold }}>You should be inside your shop</Text>
                {loading ? (
                    <OverlayLoader visible={loading} />
                ) : (
                    <MapViewComponent
                        longitude={locationData.longitude}
                        latitude={locationData.latitude}
                    />
                )}
            </RoundedScrollContainer>
        </SafeAreaView>
    );
};

export default MarkAttendanceScreen;
