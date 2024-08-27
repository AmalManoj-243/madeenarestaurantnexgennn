import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { RoundedScrollContainer } from '@components/containers';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { showToastMessage } from '@components/Toast';
import { fetchSparePartsDetails } from '@api/details/detailApi';
import { OverlayLoader } from '@components/Loader';
import { COLORS, FONT_FAMILY } from "@constants/theme";

const SparePartsRequestDetails = () => {
    const [details, setDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [savedItems, setSavedItems] = useState([]);

    const navigation = useNavigation();
    const route = useRoute();
    const { updatedData } = route.params || {};

    useEffect(() => {
        if (updatedData) {
            setSavedItems((prevItems) => [...prevItems, updatedData]);
        }
    }, [updatedData]);

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const updatedDetails = await fetchSparePartsDetails(serviceId);
            setDetails(updatedDetails[0] || {});
        } catch (error) {
            console.error('Error fetching service details:', error);
            showToastMessage('Failed to fetch service details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (serviceId) {
                fetchDetails(serviceId);
            }
        }, [serviceId])
    );

    const renderSavedItem = ({ item }) => (
        <View style={styles.savedItem}>
            <Text style={styles.savedItemText}>Spare Name: {item.spareName}</Text>
            <Text style={styles.savedItemText}>Description: {item.description}</Text>
            <Text style={styles.savedItemText}>Quantity: {item.quantity}</Text>
            <Text style={styles.savedItemText}>UOM: {item.uom}</Text>
            <Text style={styles.savedItemText}>Unit Price: {item.unitPrice}</Text>
        </View>
    );

    return (
        <RoundedScrollContainer>
            <FlatList
                data={savedItems}
                renderItem={renderSavedItem}
                keyExtractor={(item, index) => index.toString()}
                style={styles.savedItemsList}
            />
            <OverlayLoader visible={isLoading} />
        </RoundedScrollContainer>
    );
};

const styles = StyleSheet.create({
    addButton: {
        backgroundColor: '#2e2a4f',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        width: 270,
        alignSelf: 'center',
    },
    addButtonText: {
        fontFamily: FONT_FAMILY.urbanistBold,
        color: COLORS.white,
        textAlign: "center",
        fontSize: 16,
        fontWeight: 'bold',
    },
    formContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    saveButton: {
        backgroundColor: '#2e2a4f',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        width: 270,
        alignSelf: 'center',
    },
    saveButtonText: {
        fontFamily: FONT_FAMILY.urbanistBold,
        color: COLORS.white,
        textAlign: "center",
        fontSize: 16,
        fontWeight: 'bold',
    },
    savedItem: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    savedItemText: {
        fontFamily: FONT_FAMILY.urbanistRegular,
        fontSize: 14,
        marginBottom: 5,
    },
    savedItemsList: {
        marginTop: 20,
    },
});

export default SparePartsRequestDetails;
