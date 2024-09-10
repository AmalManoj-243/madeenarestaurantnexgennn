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

const SparePartsIssueCreation = ({ navigation, route }) => {
  const { id: spareId } = route?.params || {};
  const [details, setDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionToPerform, setActionToPerform] = useState(null);

  const fetchDetails = async () => {
      setIsLoading(true);
      try {
          const updatedDetails = await fetchSparePartsDetails(spareId);
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
          if (spareId) {
              fetchDetails(spareId);
          }
      }, [spareId])
  );

  const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
          const spareIssueData = {
              spare_id: spareId,
          };
          const response = await post('/createSparePartsIssue', spareIssueData);
          if (response.success === "true") {
              navigation.navigate('UpdateDetail', {
                  id: spareId,
                  details: {
                      customerName: details.customer_name,
                      mobile: details.customer_mobile,
                      email: details.customer_email,
                      warehouse: details.warehouse_name,
                      createdOn: details.date,
                      createdBy: details.assignee_name,
                      brandName: details.brand_name,
                      deviceName: details.device_name,
                      consumerModel: details.consumer_model_name,
                      serialNumber: details.serial_no,
                  }
              });
          } else {
              showToastMessage('Failed to submit spare. Please try again.');
          }
      } catch (error) {
          console.error('API error:', error);
          showToastMessage('An error occurred. Please try again.');
      } finally {
          fetchDetails();
          setIsSubmitting(false);
      }
  };

  const accessoriesString = details?.accessories?.map(acc => acc.accessory_name).join(', ') || '-';

  return (
    <SafeAreaView>
      <NavigationHeader
        title= {"Spare Parts Issue Creation"}
        onBackPress={() => navigation.goBack()}
      />
      <RoundedScrollContainer>
          <DetailField label="Spare Part Request" value={details?.sequence_no || '-'} />
          <DetailField label="Date" value={formatDateTime(details.date)} />
          <DetailField label="Warehouse" value={details?.warehouse_name || '-'} />
          <DetailField label="Job Registration No" value={details?.sequence_no || '-'} />
          <DetailField label="Assigned To" value={details?.assignee_name || '-'} />
          <View style={{ flexDirection: 'row', marginVertical: 20 }}>
              <View style={{ width: 5 }} />
              <LoadingButton
                width={'50%'}
                backgroundColor={COLORS.green}
                title="SUBMIT"
                onPress={handleSubmit}
              />
          </View>
          <OverlayLoader visible={isLoading || isSubmitting} />
      </RoundedScrollContainer>
    </SafeAreaView>
  );
};

export default SparePartsIssueCreation;