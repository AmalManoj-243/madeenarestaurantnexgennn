import React, { useState, useCallback } from 'react';
import { RoundedScrollContainer } from '@components/containers';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { DetailField } from '@components/common/Detail';
import { formatDateTime } from '@utils/common/date';
import { showToastMessage } from '@components/Toast';
import { fetchServiceDetails } from '@api/details/detailApi';
import { OverlayLoader } from '@components/Loader';

const UpdateDetail = ({ serviceId }) => {
    console.log(serviceId, "Service ID")
    const [details, setDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const navigation = useNavigation();

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const updatedDetails = await fetchServiceDetails(serviceId);
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
    
    return (
        <RoundedScrollContainer>
            <DetailField label="Customer"
                value={details?.customer_name || '-' }
                multiline
                numberOfLines={3}
                textAlignVertical={'top'} />
            <DetailField label="Mobile Number" value={details?.customer_mobile || '-'} />
            <DetailField label="Email" value={details?.customer_email || '-'} />
            <DetailField label="Warehouse Name" value={details?.warehouse_name || '-'} />
            <DetailField label="Created On" value={formatDateTime(details.date)} />
            <DetailField label="Created By" value={details?.assignee_name || '-'} />
            <DetailField label="Brand Name" value={details?.brand_name || '-'} />
            <DetailField label="Device Name" value={details?.device_name || '-'} />
            <DetailField label="Consumer Model" value={details?.consumer_model_name || '-'} />
            <OverlayLoader visible={isLoading} />
        </RoundedScrollContainer>
    );
};

export default UpdateDetail;