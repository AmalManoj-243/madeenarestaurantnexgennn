import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View } from 'react-native';
import { SafeAreaView } from '@components/containers';
import NavigationHeader from '@components/Header/NavigationHeader';
import { RoundedScrollContainer } from '@components/containers';
import { DetailField } from '@components/common/Detail';
import { formatDateTime } from '@utils/common/date';
import { showToastMessage } from '@components/Toast';
import { fetchSparePartsDetails } from '@api/details/detailApi';
import { OverlayLoader } from '@components/Loader';
import { LoadingButton } from '@components/common/Button';
import { COLORS } from '@constants/theme';
import { post } from '@api/services/utils';

const SparePartsRequestDetails = ({ navigation, route }) => {
    const { id: serviceId } = route?.params || {};
    const [details, setDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [closingReason, setClosingReason] = useState('');

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const updatedDetails = await fetchSparePartsDetails(serviceId);
            console.log('Fetched details:', updatedDetails); // Log details
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

    const handleDeleteJob = async () => {
        setIsSubmitting(true);
        try {
            const deleteJobData = {
                service_id: serviceId,
                reason: closingReason,
            };
            const response = await post('/deleteJobData', deleteJobData);
            console.log('Delete job response:', response); // Log delete response
            if (response.success === "true") {
                showToastMessage('Job successfully deleted!');
            } else {
                showToastMessage('Failed to delete job. Please try again.');
            }
        } catch (error) {
            console.error('API error:', error);
            showToastMessage('An error occurred. Please try again.');
        } finally {
            fetchDetails();
            setIsSubmitting(false);
            setClosingReason('');
        }
    };

    const handleIssueJob = async () => {
        setIsSubmitting(true);
        try {
            const issueJobData = {
                service_id: serviceId,
            };
            const response = await post('/createSparePartsIssue', issueJobData);
            console.log('Issue job response:', response); // Log issue response
            console.log('Details before navigation:', details); // Log details before navigation
            if (response.success === "true") {
                navigation.navigate('SparePartsIssueCreation', {
                    id: serviceId,
                    details: {
                        date: details.date,
                        status: details.status,
                        assignedTo: details.assigned_to_name,
                        createdBy: details.created_by_name,
                        jobRegistrationNo: details.job_registration_id,
                    }
                });
            } else {
                showToastMessage('Failed to Issue job. Please try again.');
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
                title={details?.sequence_no || 'Spare Request Details'}
                onBackPress={() => navigation.goBack()}
            />
            <RoundedScrollContainer>
                <DetailField label="Date" value={formatDateTime(details.date)} />
                <DetailField label="Status" value={details?.status || '-'} />
                <DetailField label="Assigned To" value={details?.assigned_to_name || '-'} />
                <DetailField label="Created By" value={details?.assignee_name || '-'} />
                <DetailField label="Job Registration No" value={details?.sequence_no || '-'} />

                <View style={{ flexDirection: 'row', marginVertical: 20 }}>
                    <LoadingButton
                        width={'50%'}
                        backgroundColor={COLORS.lightRed}
                        title="DELETE"
                        onPress={handleDeleteJob}
                    />
                    <View style={{ width: 5 }} />
                    <LoadingButton
                        width={'50%'}
                        backgroundColor={COLORS.green}
                        title="ISSUE"
                        onPress={handleIssueJob}
                    />
                </View>
                <OverlayLoader visible={isLoading || isSubmitting} />
            </RoundedScrollContainer>
        </SafeAreaView>
    );
};

export default SparePartsRequestDetails;
