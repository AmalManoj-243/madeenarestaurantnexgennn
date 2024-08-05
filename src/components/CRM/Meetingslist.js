import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import Text from '@components/Text';
import { FONT_FAMILY } from '@constants/theme';

const MeetingsList = ({ item  }) => {
    return (
        <TouchableOpacity activeOpacity={0.8} style={styles.itemContainer}>
            <View style={styles.leftColumn}>
                <Text style={styles.titles}>{item?.title || '-'}</Text>
                <View style={styles.detailsContainer}>
                    <Text style={styles.detailText}>
                        {/* {item?.start? format(new Date(item.start), "dd-MM-yyyy") : '-'} {item?.time ? `at ${format(new Date(item.time), "HH:mm:ss")}` : ''} */}
                    </Text>
                    <Text style={styles.reminderText}>
                        {/* {item?.is_Remainder ? `Reminder in ${item?.minutes || 0} minutes` : 'No Reminder'} */}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        marginHorizontal: 5,
        marginVertical: 5,
        backgroundColor: 'white',
        borderRadius: 15,
        ...Platform.select({
            android: {
                elevation: 4,
            },
            ios: {
                shadowColor: 'black',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
            },
        }),
        padding: 20,
    },
    leftColumn: {
        flex: 1,
    },
    detailsContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        flex: 1,
    },
    titles: {
        fontFamily: FONT_FAMILY.urbanistBold,
        fontSize: 17,
        marginBottom: 5,
    },
    detailText: {
        color: '#666666',
        marginBottom: 5,
        fontSize: 14,
        fontFamily: FONT_FAMILY.urbanistSemiBold,
    },
    reminderText: {
        color: '#666666',
        fontFamily: FONT_FAMILY.urbanistSemiBold,
        fontSize: 14,
    },
});

export default MeetingsList;
