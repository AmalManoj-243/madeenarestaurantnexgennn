import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from '@components/containers';
import { NavigationHeader } from "@components/Header";
import { RoundedScrollContainer } from '@components/containers';
import { DropdownSheet } from "@components/common/BottomSheets";
import { TextInput as FormInput } from '@components/common/TextInput';
import { formatDateandTime } from '@utils/common/date';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { showToastMessage } from '@components/Toast';
import { fetchPaymentModeDropdown } from "@api/dropdowns/dropdownApi";
import { fetchVendorBillDetails } from '@api/details/detailApi';
import { OverlayLoader } from '@components/Loader';
import { Button } from '@components/common/Button';
import { COLORS, FONT_FAMILY } from '@constants/theme';

const SupplierPaymentCreation = ({ navigation, route }) => {
  const { id: vendorBillId } = route?.params || {};
  const [details, setDetails] = useState({});
  console.log("🚀 ~ SupplierPaymentCreation ~ details:", JSON.stringify(details, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({});
  const [dropdown, setDropdown] = useState({
    paymentMode: [],
  });

  const fetchDetails = async (vendorBillId) => {
    setIsLoading(true);
    try {
      const [details] = await fetchVendorBillDetails(vendorBillId);
      if (details) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          vendorBill: details?.sequence_no,
          amountDue: details?.due_amount?.toString(),
          amountPaid: details?.due_amount?.toString(),
          paymentDate: new Date(),
          paymentMode: { id: details?.payment_method_id, label: details?.payment_method_name },
          salesPerson: details?.sales_preson?.sales_person_name,
          warehouse: details?.warehouse_name,
          reference: details?.reference || '',
        }));
        setDetails(details);
      } else {
        console.warn('No valid data received for purchase order details.');
        setFormData(null);
        showToastMessage({
          type: 'warning',
          title: 'Warning',
          message: 'No details found for the specified vendor bill.',
        });
      }
    } catch (error) {
      console.error('Error fetching vendor bill details:', error);
      setFormData(null);
      showToastMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch vendor bill details. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const paymentModeData = await fetchPaymentModeDropdown();
        const filteredPaymentModes = paymentModeData.filter(data =>
          ["cheque", "credit", "cash"].includes(data.payment_method_name.toLowerCase())
        );

        setDropdown(prevDropdown => ({
          ...prevDropdown,

          paymentMode: filteredPaymentModes.map(data => ({
            id: data._id,
            label: data.payment_method_name,
          })),
        }));
      } catch (error) {
        console.error('Error fetching payment mode dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDetails(vendorBillId);
    }, [vendorBillId])
  );

  useEffect(() => {
    if (route.params?.newProductLine) {
      addProducts(route.params.newProductLine);
    }
  }, [route.params?.newProductLine]);

  const handleFieldChange = (field, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
    if (errors[field]) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: null }));
    }
  };

  const toggleBottomSheet = (type) => {
    setSelectedType(type);
    setIsVisible(!isVisible);
  };

  const isAmountDueZero = details.due_amount === 0;

  const handleSupplierPayment = async () => {
    const fieldsToValidate = [''];
    if (validateForm(fieldsToValidate)) {
      setIsSubmitting(true);

      const totalAmountNum = parseFloat(purchaseDetail.total_amount);
      const currentPaidAmount = parseFloat(purchaseDetail.amount_paid);
      const currentAmountDue = parseFloat(purchaseDetail.amount_due);
      const paidAmountNum = parseFloat(amount);
      const newPaidAmount = currentPaidAmount + paidAmountNum;
      const newAmountDue = currentAmountDue - paidAmountNum;
      const paymentStatus = newPaidAmount < totalAmountNum ? 'partially_paid' : 'fully_paid';

      const supplierPaymentData = {
        payment_date: formatDateandTime(formData.paymentDate),
        amount: "200",
        payment_status: paymentStatus,
        vendor_sequence_no: "",
        remark: "null",
        type: "expense",
        chq_no: "null",
        chq_date: "",
        chq_type: "null",
        status: "new",
        transaction_no: "null",
        journal_id: null,
        chq_bank_id: null,
        vendor_bill_id: [
          {
            id: details?._id,
            payment_status: "fully_paid",
            vendor_sequence_no: details?.sequence_no,
            due_amount: details?.due_amount,
            paid_amount: details?.paid_amount,
          }
        ],
        invoice_id: null,
        customer_id: null,
        supplier_id: details?.supplier?.supplier_id,
        supplier_name: details?.supplier?.supplier_name,
        sales_person_id: details?.sales_preson?.sales_person_id,
        is_cheque_cleared: "true",
        date: formatDateandTime(formData.paymentDate),
        payment_method_id: formData.paymentMode?.id,
        payment_method_name: formData.paymentMode?.label,
        transaction: details?.sequence_no,
        in_amount: 0,
        out_amount: "200",
        due_balance: "0",
        outstanding: "",
        credit_balance: "",
        image_url: [],
        warehouse_id: details?.warehouse_id,
        warehouse_name: details?.warehouse_name,
        vendor_balance_paid_amount: "200",
        reference: "",
        ledger_name: "",
        ledger_type: "",
        ledger_id: null,
        ledger_display_name: "",
        online_transaction_type: done,
        card_transaction_type: done,
        time_zone: Asia / Dubai
      }
      console.log("🚀 ~ submit ~ supplierPaymentData:", JSON.stringify(supplierPaymentData, null, 2));
      try {
        const response = await post("/createSupplierPayment", supplierPaymentData);
        if (response.success) {
          showToast({
            type: "success",
            title: "Success",
            message: response.message || "successfully Created Register Payment",
          });
          navigation.navigate("VendorBillDetails");
        } else {
          console.error("Supplier Payment Failed:", response.message);
          showToast({
            type: "error",
            title: "ERROR",
            message: response.message || "Supplier Payment creation failed",
          });
        }
      } catch (error) {
        console.error("Error Creating Supplier Payment Failed:", error);
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

  const renderBottomSheet = () => {
    let items = [];
    let fieldName = "";

    switch (selectedType) {
      case "Payment Mode":
        items = dropdown.paymentMode;
        fieldName = "paymentMode";
        break;
      default:
        return null;
    }
    return (
      <DropdownSheet
        isVisible={isVisible}
        items={items}
        title={selectedType}
        onClose={() => setIsVisible(false)}
        onValueChange={(value) => {
          handleFieldChange(fieldName, value);
          setIsVisible(false);
        }}
      />
    );
  };

  return (
    <SafeAreaView>
      <NavigationHeader
        title={`Payment For Vendor : ${details?.sequence_no || '-'}`}
        onBackPress={() => navigation.goBack()}
        logo={false}
      />
      <RoundedScrollContainer>
        <FormInput
          label="Vendor Bill"
          editable={false}
          validate={errors.vendorBill}
          value={formData.vendorBill}
          required
        />
        <FormInput
          label="Amount Due"
          editable={false}
          validate={errors.amountDue}
          value={formData.amountDue}
          required
        />
        <FormInput
          label="Amount Paid"
          editable={true}
          validate={errors.amountPaid}
          value={formData.amountPaid}
          keyboardType="numeric"
          required
          onChangeText={(value) => handleFieldChange('amountPaid', value)}
        />
        <FormInput
          label="Payment Date"
          dropIcon="calendar"
          placeholder="dd-mm-yyyy"
          editable={false}
          required
          validate={errors.paymentDate}
          value={formatDateandTime(formData.paymentDate)}
          onPress={() => setIsDatePickerVisible(true)}
        />
        <FormInput
          label="Payment Mode"
          placeholder="Select Payment Mode"
          dropIcon="menu-down"
          editable={false}
          validate={errors.paymentMode}
          value={formData.paymentMode?.label}
          required
          onPress={() => toggleBottomSheet("Payment Mode")}
        />
        <FormInput
          label="Sales Persons"
          editable={false}
          value={formData.salesPerson}
          required
        />
        <FormInput
          label="Warehouse"
          editable={false}
          validate={errors.warehouse}
          value={formData.warehouse}
        />
        <FormInput
          label="Reference"
          editable={true}
          validate={errors.reference}
          value={formData.reference}
          required
          multiline={true}
          onChangeText={(value) => handleFieldChange('reference', value)}
        />
        {renderBottomSheet()}
        <Button
          backgroundColor={COLORS.primaryThemeColor}
          title="Submit"
          onPress={handleSupplierPayment}
          disabled={isAmountDueZero}
        />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          minimumDate={new Date()}
          onConfirm={(date) => {
            setIsDatePickerVisible(false);
            handleFieldChange("paymentDate", date);
          }}
          onCancel={() => setIsDatePickerVisible(false)}
        />
      </RoundedScrollContainer>
      <OverlayLoader visible={isLoading || isSubmitting} />
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
  totalSection: {
    flexDirection: 'row',
    marginVertical: 5,
    margin: 10,
    alignSelf: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.urbanistBold,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.urbanistBold,
    color: '#666666',
  },
});

export default SupplierPaymentCreation;