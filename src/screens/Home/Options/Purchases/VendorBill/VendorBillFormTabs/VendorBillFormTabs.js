import * as React from 'react';
import { useWindowDimensions, KeyboardAvoidingView, Platform, Keyboard, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TabView } from 'react-native-tab-view';
import { useState, useCallback } from 'react';
import { useAuthStore } from "@stores/auth";
import { SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { LoadingButton } from '@components/common/Button';
import { showToast } from '@utils/common';
import { fetchPurchaseOrderDetails } from '@api/details/detailApi';
import { post } from '@api/services/utils';
import { validateFields } from '@utils/validation';
import { CustomTabBar } from '@components/TabBar';
import VendorDetails from './VendorDetails';
import DateDetails from './DateDetails';
import OtherDetails from './OtherDetails';

const VendorBillFormTabs = ({ navigation, route }) => {

  const layout = useWindowDimensions();
  const { id: vendorBillId } = route?.params || {};
  const [details, setDetails] = useState({});
  console.log(details)
  const currentUser = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Vendor Details' },
    { key: 'second', title: 'Date & Details' },
    { key: 'third', title: 'Other Details' },
  ]);

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const updatedDetails = await fetchPurchaseOrderDetails(vendorBillId);
        if (updatedDetails && updatedDetails[0]) {
          setDetails(updatedDetails[0]);
          setDeliveryNotes(updatedDetails[0]?.products_lines || []);
        }
      } catch (error) {
        console.error('Error fetching purchase order details:', error);
        showToastMessage('Failed to fetch purchase order details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    useFocusEffect(
      useCallback(() => {
        if (vendorBillId) {
          fetchDetails();
        }
      }, [vendorBillId])
    );

  const [formData, setFormData] = useState({
    vendorName: "",
    purchaseType: "",
    countryOfOrigin: "",
    currency: "",
    amountPaid: "",
    paymentMode: "",
    date: new Date(), 
    trnnumber: "",
    orderDate: new Date(),
    billDate: new Date(),
    salesPerson: "",
    warehouse: { id: currentUser?.warehouse?.warehouse_id || '', label: currentUser?.warehouse?.warehouse_name },
    reference: "",
  });
  // console.log("🚀 ~ VendorBillFormTabs ~ formData:", JSON.stringify(formData, null, 2));

  const handleFieldChange = (field, value) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [field]: null
      }));
    }
  };

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'first':
        return <VendorDetails formData={formData} onFieldChange={handleFieldChange} errors={errors} />;
      case 'second':
        return <DateDetails formData={formData} onFieldChange={handleFieldChange} errors={errors} />;
      case 'third':
        return <OtherDetails formData={formData} onFieldChange={handleFieldChange} errors={errors} />;
      default:
        return null;
    }
  };

  const validateForm = (fieldsToValidate) => {
    Keyboard.dismiss();
    const { isValid, errors } = validateFields(formData, fieldsToValidate);
    console.log("Validation errors:", errors);
    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    const fieldsToValidate = ['vendor', 'purchaseType', 'countryOfOrigin', 'currency', 'amountPaid', 'paymentMode', 'salesPerson', 'warehouse'];
    if (validateForm(fieldsToValidate)) {
      setIsSubmitting(true);
      const vendorData = {
        date: new Date(),
        customer_id: formData?.vendor.id ?? null,
        customer_name: formData.vendor?.label ?? null,
        customer_mobile: formData.phoneNumber || null,
        customer_email: formData.emailAddress || null,
        address: formData.address || null,
        trn_no: parseInt(formData.trn, 10) || null,
        warehouse_id: formData?.warehouse.id ?? null,
        warehouse_name: formData.warehouse?.label ?? null,
        device_id: formData?.device.id ?? null,
        device_name: formData.device?.label ?? null,
        brand_id: formData?.brand.id ?? null,
        brand_name: formData.brand?.label ?? null,
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
        accessories: formData.accessories?.map(accessories => ({
          accessory_id: accessories.id,
          accessory_name: accessories.label,
        })),
        service_register_complaints : formData.complaints.map((complaint) => ({
          editable: false,
          master_problem_id: complaint.id,
          master_problem_name: complaint.label,
          remarks: formData.subRemarks || null,
        sub_problems_ids: formData.subComplaints.map(subComplaint => ({
          sub_problem_id: subComplaint.id,
          sub_problem_name: subComplaint.label,
        })),
      }))
    }
      console.log("🚀 ~ submit ~ vendorData:", JSON.stringify(vendorData, null, 2));
      try {
        const response = await post("/createJobRegistration", vendorData);
        if (response.success === 'true') {
          showToast({
            type: "success",
            title: "Success",
            message: response.message || "Vendor Bill created successfully",
          });

          navigation.navigate("VendorBillScreen");
        } else {
          console.error("Vendor Bill Failed:", response.message);
          showToast({
            type: "error",
            title: "ERROR",
            message: response.message || "Vendor Bill creation failed",
          });
        }
      } catch (error) {
        console.error("Error Creating Vendor Bill Failed:", error);
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
    <SafeAreaView>
      <NavigationHeader
        title="Vendor Bill Creation"
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={props => <CustomTabBar {...props} />} onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
        />
      </KeyboardAvoidingView>
      <View style={{ backgroundColor: 'white', paddingHorizontal: 50, paddingBottom: 12 }}>
        <LoadingButton onPress={handleSubmit} title={'Submit'} loading={isSubmitting} />
      </View>
    </SafeAreaView>
  );
};

export default VendorBillFormTabs;