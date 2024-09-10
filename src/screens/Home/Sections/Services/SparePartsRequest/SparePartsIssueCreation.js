import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from '@components/containers';
import NavigationHeader from '@components/Header/NavigationHeader';
import { RoundedScrollContainer } from '@components/containers';
import { DetailField } from '@components/common/Detail';
import { formatDateTime } from '@utils/common/date';
import { showToastMessage } from '@components/Toast';
import { fetchSparePartsDetails } from '@api/details/detailApi';
import SparePartsCreationList from './SparePartsCreationList';
import { OverlayLoader } from '@components/Loader';
import { LoadingButton } from '@components/common/Button';
import { COLORS } from '@constants/theme';
import { post } from '@api/services/utils';
import { Checkbox } from 'react-native-paper';

const SparePartsIssueCreation = ({ navigation, route }) => {
    const { id: spareId } = route?.params || {};
    const [details, setDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sparePartsItems, setSparePartsItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const updatedDetails = await fetchSparePartsDetails(spareId);
            setDetails(updatedDetails[0] || {});
            setSparePartsItems(updatedDetails[0]?.spare_parts_line || []);
        } catch (error) {
            console.error('Error fetching spare parts details:', error);
            showToastMessage('Failed to fetch spare parts details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectItem = (item) => {
        const isSelected = selectedItems.includes(item);
        const newSelectedItems = isSelected
            ? selectedItems.filter(i => i !== item)
            : [...selectedItems, item];
        setSelectedItems(newSelectedItems);
        onValueChange(newSelectedItems);
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedItems.includes(item);
        return (
            <TouchableOpacity onPress={() => handleSelectItem(item)}>
                <Checkbox
                    status={isSelected ? 'checked' : 'unchecked'}
                    onPress={() => handleSelectItem(item)}
                    color={COLORS.primaryThemeColor}
                />
                </TouchableOpacity>
        );
    };

    useFocusEffect(
        useCallback(() => {
            if (spareId) {
                fetchDetails(spareId);
            }
        }, [spareId])
    );

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const issueSpareData = {
                date: details.date,
                created_by: details.created_by,
                assigned_to: details.assigned_to,
                status: "",
                assigned_to_name: details.assigned_to_name,
                warehouse_id: details.warehouse_id,
                warehouse_name: details.warehouse_name,
                job_registration_id: details.job_registration_id,
                issue_type: "",
                spare_parts_request_id: "",
                job_diagnosis_parts_ids: "",
                spare_parts_line_id: spareId,
            };

            const response = await post('/createSparePartsIssue', issueSpareData);
            console.log("🚀 ~ handleSubmit ~ response:", response);
            if (response.success === "true") {
                navigation.navigate('SparePartsRequestScreen');
            } else {
                showToastMessage('Failed to Submit Spare. Please try again.');
            }
        } catch (error) {
            console.error('API error:', error);
            showToastMessage('An error occurred. Please try again.');
        } finally {
            fetchDetails();
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView>
            <NavigationHeader
                title={"Spare Parts Issue Creation"}
                onBackPress={() => navigation.goBack()}
            />
            <RoundedScrollContainer>
                <DetailField label="Spare Part Request" value={details?.sequence_no || '-'} />
                <DetailField label="Date" value={formatDateTime(details.date)} />
                <DetailField label="Warehouse" value={details?.warehouse_name || '-'} />
                <DetailField label="Job Registration No" value={details?.sequence_no || '-'} />
                <DetailField label="Assigned To" value={details?.assignee_name || '-'} />
                <FlatList
                    data={sparePartsItems}
                    renderItem={({ item }) => <SparePartsCreationList item={item} />}
                    keyExtractor={(item) => item._id}
                    onPress={() => handleSelectItem(item)}
                />
                <View style={{ backgroundColor: 'white', paddingHorizontal: 50, paddingBottom: 12 }}>
                    <LoadingButton
                        onPress={handleSubmit}
                        title={'Submit'}
                        backgroundColor={COLORS.green}
                        loading={isSubmitting} />
                </View>
                <OverlayLoader visible={isLoading || isSubmitting} />
            </RoundedScrollContainer>
            {renderItem}
        </SafeAreaView>
    );
};

export default SparePartsIssueCreation;