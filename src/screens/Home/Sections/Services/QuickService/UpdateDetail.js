import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from '@components/containers';
import NavigationHeader from '@components/Header/NavigationHeader';
import { RoundedScrollContainer } from '@components/containers';
import { DetailField } from '@components/common/Detail';
import { OverlayLoader } from '@components/Loader';
import { Button } from '@components/common/Button';
import SparePartsList from './SparePartsList';
import { formatDateTime } from '@utils/common/date';
import { showToastMessage } from '@components/Toast';
import { fetchServiceDetails } from '@api/details/detailApi';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import AntDesign from '@expo/vector-icons/AntDesign';
import { put } from '@api/services/utils';

const UpdateDetails = ({ route, navigation }) => {
    const { id } = route.params || {};
    const [details, setDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [sparePartsItems, setSparePartsItems] = useState([]);

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
        const fieldsToValidate = [];
        if (validateForm(fieldsToValidate)) {
          setIsSubmitting(true);
          const spareData = {
            customer_id: formData?.customerName.id ?? null,
            customer_name: formData.customerName?.label ?? null,
            customer_mobile: formData.phoneNumber || null,
            customer_email: formData.emailAddress || null,
            address: formData.address || null,
            trn_no: parseInt(formData.trn, 10) || null,
            warehouse_id: formData?.warehouse.id ?? null,
            warehouse_name: formData.warehouse?.label ?? null,
            brand_id: formData?.brand.id ?? null,
            brand_name: formData.brand?.label ?? null,
            device_id: formData?.device.id ?? null,
            device_name: formData.device?.label ?? null,
            consumer_model_id: formData?.consumerModel.id ?? null,
            consumer_model_name: formData.consumerModel?.label ?? null,
            serial_no: formData.serialNumber || null,
            imei_no: formData.imeiNumber || null,
            is_rma: false,
            job_stage: "new",
            job_registration_type: "quick",
            assignee_id: formData?.assignedTo.id ?? null,
            assignee_name: formData.assignedTo?.label ?? null,
            pre_condition: formData.preCondition || null,
            estimation: formData.estimation || null,
            remarks: formData.remarks || null,
            sales_person_id: formData?.assignedTo.id ?? null,
            sales_person_name: formData.assignedTo?.label ?? null,
            remarks: formData.remarks || null,
            accessories: formData.accessories?.map(accessories => ({
              accessory_id: accessories.id,
              accessory_name: accessories.label,
            })),
            service_register_complaints: [
              {
                editable: false,
                no: 0,
                master_problem_id: formData?.complaints.id ?? null,
                master_problem_name: formData.complaints?.label ?? null,
                uom: null,
                sub_problems_ids: [
                  {
                    sub_problem_id: formData?.subComplaints.id ?? null,
                    sub_problem_name: formData.subComplaints?.label ?? null,
                  }
                ],
                remarks: ""
              }
            ],
          }
          console.log("🚀 ~ submit ~ spareData:", JSON.stringify(spareData, null, 2));
          try {
            const response = await put("/updateJobRegistration", spareData);
            console.log("🚀 ~ submit ~ response:", response);
            if (response.success === 'true') {
              showToast({
                type: "success",
                title: "Success",
                message: response.message || "Spare Parts Request updated successfully",
              });
              navigation.navigate("QuickServiceScreen");
            } else {
              console.error("Spare Parts Request Failed:", response.message);
              showToast({
                type: "error",
                title: "ERROR",
                message: response.message || "Spare Parts Request updation failed",
              });
            }
          } catch (error) {
            console.error("Error Updating Spare Parts Request Failed:", error);
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
                <Button
                    title={'SAVE'}
                    width={'50%'}
                    alignSelf={'center'}
                    backgroundColor={COLORS.primaryThemeColor}
                    onPress={handleSubmit}
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
