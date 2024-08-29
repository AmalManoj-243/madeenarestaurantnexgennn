import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from '@components/containers';
import NavigationHeader from '@components/Header/NavigationHeader';
import { RoundedScrollContainer } from '@components/containers';
import { DetailField } from '@components/common/Detail';
import { OverlayLoader } from '@components/Loader';
import SparePartsList from './SparePartsList';
import { formatDateTime } from '@utils/common/date';
import { showToastMessage } from '@components/Toast';
import { fetchServiceDetails } from '@api/details/detailApi';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import AntDesign from '@expo/vector-icons/AntDesign';

const UpdateDetails = ({ route, navigation }) => {
    const { id } = route.params || {};
    const [details, setDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [sparePartsItems, setSparePartsItems] = useState([]);
    console.log(sparePartsItems, "Spare")

    // adding spare parts list items
    const addSpareParts = (addedItems) => {
        setSparePartsItems(prevItems => [...prevItems, addedItems])
    }

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const updatedDetails = await fetchServiceDetails(id);
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
            if (id) {
                fetchDetails(id);
            }
        }, [id])
    );

    const handleSubmit = async () => {
        const fieldsToValidate = ['spareParts', 'tax'];
        if (validateForm(fieldsToValidate)) {
            const requestBody =
            {
                _id: id,
                job_stage: 'Waiting for spare',
                create_job_diagnosis: [
                    {
                        job_registration_id: id,
                        proposed_action_id: null,
                        proposed_action_name: null,
                        untaxed_total_amount: "",
                        done_by_id: currentUser?.related_profile?._id ?? null,
                        done_by_name: currentUser.related_profile.name ?? null,
                        parts_or_service_required: null,
                        service_type: null,
                        service_charge: formData?.serviceCharge || null,
                        total_amount: null,
                        parts: sparePartsItems?.map(items => ({
                            product_id: items.formData?.spareParts.id ?? null,
                            product_name: items.formData?.spareParts.label ?? null,
                            description: items.formData.description || null,
                            uom_id: items.formData?.uom.id ?? null,
                            uom: items.formData?.uom.label ?? null,
                            quantity: items.formData.quantity || null,
                            unit_price: items.formData.unitPrice || null,
                            sub_total: items.formData.subTotal || null,
                            unit_cost: null,
                            tax_type_name: items.formData?.tax.id ?? null,
                            tax_type_id: items.formData?.tax.label ?? null,

                        }))
                    }
                ]
            }

            try {
                const response = await put("/updateJobRegistration", requestBody);
                if (response.message === 'Succesfully updated Spare Part Request') {
                    showToast({
                        type: "success",
                        title: "Success",
                        message: response.message || "Spare Part Request updated successfully",
                    });
                    addSpareParts(spareItem);
                    navigation.navigate('UpdateDetail', { updatedItem: spareItem });
                } else {
                    showToast({
                        type: "error",
                        title: "ERROR",
                        message: response.message || "Spare Part Request updation failed",
                    });
                }
            } catch (error) {
                showToast({
                    type: "error",
                    title: "ERROR",
                    message: "An unexpected error occurred. Please try again later.",
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    };


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <NavigationHeader
                title="Update Details"
                onBackPress={() => navigation.goBack()}
            />
            <RoundedScrollContainer>
                <DetailField
                    label="Customer"
                    value={details?.customer_name?.trim() || '-'}
                    multiline
                    numberOfLines={3}
                    textAlignVertical={'top'}
                />
                <DetailField label="Mobile Number" value={details?.customer_mobile || '-'} />
                <DetailField label="Email" value={details?.customer_email || '-'} />
                <DetailField label="Warehouse Name" value={details?.warehouse_name || '-'} />
                <DetailField label="Created On" value={formatDateTime(details.date)} />
                <DetailField label="Created By" value={details?.assignee_name || '-'} />
                <DetailField label="Brand Name" value={details?.brand_name || '-'} />
                <DetailField label="Device Name" value={details?.device_name || '-'} />
                <DetailField label="Consumer Model" value={details?.consumer_model_name || '-'} />
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginVertical: 10 }}>
                    <Text style={styles.label}>Add an Item</Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('AddSpareParts', { id, addSpareParts })}>
                        <AntDesign name="pluscircle" size={26} color={COLORS.orange} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={sparePartsItems}
                    renderItem={({ item }) => (
                        <SparePartsList item={item} />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            </RoundedScrollContainer>
            {isLoading && <OverlayLoader />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    label: {
        marginVertical: 5,
        fontSize: 16,
        color: COLORS.primaryThemeColor,
        fontFamily: FONT_FAMILY.urbanistSemiBold,
    },
});

export default UpdateDetails;
