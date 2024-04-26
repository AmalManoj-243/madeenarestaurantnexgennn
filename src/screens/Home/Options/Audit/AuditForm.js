import { View, StyleSheet, Keyboard, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { RoundedScrollContainer, SafeAreaView } from '@components/containers'
import { NavigationHeader } from '@components/Header'
import { TextInput as FormInput } from '@components/common/TextInput'
import { COLORS, FONT_FAMILY } from '@constants/theme'
import { Button } from '@components/common/Button'
import SignaturePad from '@components/SignaturePad'
import Text from '@components/Text'
import { fetchBills } from '@api/details/detailApi'
import { format } from 'date-fns'
import useAuthStore from '@stores/auth/authStore'
import { ActionModal } from '@components/Modal'
import { formatData } from '@utils/formatters'
import { EmptyItem } from '@components/common/empty'

const AuditForm = ({ navigation }) => {

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [url, setUrl] = useState('')
  const [imageUrl, setImageUrl] = useState([])
  console.log("🚀 ~ AuditForm ~ imageUrl:", imageUrl)
  const [displayBillDetails, setDisplayBillDetails] = useState({})
  const [collectionType, setCollectionType] = useState(null);
  const [errors, setErrors] = useState({});
  const [ledger, setLedger] = useState({})
  const [scannedBillDetails, setScannedBillDetails] = useState({});
  const [isActionVisible, setIsActionVisible] = useState(false)
  const loginUser = useAuthStore(state => state.user)

  let scannedBillName;
  let scannedBillSequence;

  // Function to handle scanned data
  const handleScan = async (data) => {

    const billParts = data.split('-')
    console.log("🚀 ~ handleScan ~ billParts:", billParts)
    scannedBillName = billParts[0]
    scannedBillSequence = billParts.slice(1).join('-')

    try {
      let response, billDetails;
      // console.log("Response of customer data", billDetails)
      switch (scannedBillName) {
        case "Invoice":
          response = await fetchBills.invoiceDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Invoice Bill data", billDetails);
          break;

        case "Vendor Bill":
          response = await fetchBills.vendorDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Vendor bill Bill data", billDetails);
          break;

        case "Sales Return":
          response = await fetchBills.salesReturnDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Sales return Bill data", billDetails);
          break;

        case "PURCHRET":
          response = await fetchBills.purchaseReturnDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Sales return Bill data", billDetails);
          break;

        case "CAPREC":
          response = await fetchBills.capitalRecieptsDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "Cash rec":
          response = await fetchBills.cashReceiptsDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "Cash pay":
          response = await fetchBills.cashPaymentsDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "Bankpay":
          response = await fetchBills.expenseDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "Bank rec":
          response = await fetchBills.capitalRecieptsDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "CUSTREC":
          response = await fetchBills.customerReceiptsDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "CUSTPAY":
          response = await fetchBills.customerPaymentDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "SUPREC":
          response = await fetchBills.supplierRecieptsDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "SUPPAY":
          response = await fetchBills.supplierPaymentsDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "CAPPAY":
          response = await fetchBills.capitalPaymentDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "JobInvoice":
          response = await fetchBills.jobInvoiceDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "PETTYALLOT":
          response = await fetchBills.pettyCashAllotmentDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "PETEXP":
          response = await fetchBills.pettyCashExpenseDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "CASRET":
          response = await fetchBills.pettyCashReturnDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "PETTYTRANS":
          response = await fetchBills.pettyCashTransferDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        case "Spare Issue":
          response = await fetchBills.sparePartsIssueDetails(scannedBillSequence);
          billDetails = response[0];
          console.log("Bill data", billDetails);
          break;

        default:
          console.log("Unknown bill type");
      }
      if (billDetails) {
        setScannedBillDetails(billDetails)
        const transactionDetails = {
          displayName: billDetails?.customer?.customer_name ||
            billDetails?.supplier?.supplier_name ||
            billDetails?.capital_chart_of_account_name ||
            billDetails?.expense_chart_of_account_name ||
            billDetails?.sales_person?.sales_person_name || '',
          documentNumber: billDetails.sequence_no || '',
          totalAmount: billDetails.total_amount || billDetails.amount || '',
          businessType: billDetails.bussiness_type_id || '',
          paymentMethod: billDetails?.payment_method_id ||
            billDetails?.register_payments?.[0]?.payment_method_id ||
            billDetails?.transaction_type_id ||
            billDetails?.paid_through_chart_of_account_id || '',
          ledgerId: billDetails?.capital_chart_of_account_id ||
            billDetails?.expense_chart_of_account_id ||
            billDetails?.ledger_id || '',
        };
        const collectionTypeResponse = await fetchBills.collectionTypeDetails(transactionDetails.businessType, transactionDetails.paymentMethod);
        const collectionResponseData = collectionTypeResponse[0];
        setCollectionType(collectionResponseData);
        if (transactionDetails.ledgerId) {
          const ledgerTypeResponse = await fetchBills.ledgerTypeDetails(transactionDetails.ledgerId);
          const ledgerTypeResponseData = ledgerTypeResponse[0]?.auditing_ledger;
          setLedger(ledgerTypeResponseData);
        }
        setDisplayBillDetails(transactionDetails);

        // Clear errors for all fields if they are not empty
        for (const field in transactionDetails) {
          if (transactionDetails[field]) {
            updateErrorState(null, field);
          }
        }
        // Clear errors for collection type if it's not empty
        if (collectionResponseData?.collection_type_name) {
          updateErrorState(null, 'collectionType');
        }
      }
      // console.log("Customer:", customer);
    } catch (error) {
      console.log('Error fetching customer details:', error);
    }
  };

  const updateErrorState = (error, input) => {
    setErrors((prevState) => ({ ...prevState, [input]: error }));
  };

  // Function to validate form
  const validate = () => {
    Keyboard.dismiss();
    let isValid = true;
    const errorMessages = {
      customerName: "Scanned Customer name is required",
      invoiceNumber: "Scanned Invoice no is required",
      totalAmount: "Scanned Total amount is required",
      collectionType: "Scanned Collection type is required",
    };

    for (const field in errorMessages) {
      if (!displayBillDetails[field]) {
        updateErrorState(errorMessages[field], field);
        isValid = false;
      }
    }
    if (isValid) {
      handleSubmitAudit();
    }
  };

  const handleSubmitAudit = async () => {
    try {
      let auditingData = {
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: displayBillDetails?.totalAmount ?? 0,
        un_taxed_amount: scannedBillDetails?.untaxed_total_amount ?? 0,
        customer_vendor_signature: uploadUrl ?? null,
        attachments: imageUrls ?? null,
        cashier_signature: "",
        remarks: remarks || "",
        warehouse_id: loginUser?.warehouse_id ?? null,
        warehouse_name: loginUser?.warehouse?.warehouse_name ?? null,
        sales_person_id: loginUser?.related_profile?._id ?? null,
        sales_person_name: loginUser?.related_profile?.name ?? null,
        company_id: loginUser?.company.company_id ?? null,
        company_name: loginUser?.company?.name ?? null,
        supplier_id: scannedBillDetails?.supplier?.supplier_id ?? null,
        supplier_name: scannedBillDetails?.supplier?.supplier_name ?? null,
        collection_type_id: collectionType?._id ?? null,
        collection_type_name: collectionType?.collection_type_name ?? null,
        customer_id: null,
        customer_name: '',
        invoice_id: scannedBillDetails?._id,
        inv_sequence_no: displayBillDetails?.documentNumber ?? null,
        register_payment_id: scannedBillDetails?.register_payments[0]._id ?? null,
        chq_no: scannedBillDetails?.register_payments[0]?.chq_no ?? null,
        chq_date: scannedBillDetails?.register_payments[0]?.chq_date ?? null,
        chq_type: scannedBillDetails?.register_payments[0]?.chq_type ?? null,
        cheque_transaction_type: "",
        chart_of_accounts_id: loginUser?.company.company_id ?? null,
        chart_of_accounts_name: "",
        ledger_name: null,
        ledger_type: null,
        ledger_id: "",
        ledger_display_name: null,
        employee_ledger_id: "",
        employee_ledger_name: null,
        employee_ledger_display_name: null,
        service_amount: null,
        service_product_amount: null,
        is_estimation: scannedBillDetails?.is_estimation ?? null
      };
      switch (scannedBillName) {
        case "Invoice":
          // Handling for Invoice bill
          auditingData.customer_id = loginUser?.company?.company_id ?? null;
          auditingData.customer_name = displayBillDetails?.customerName ?? null;
          auditingData.supplier_id = scannedBillDetails?.supplier?.supplier_id ?? null;
          auditingData.supplier_name = scannedBillDetails?.supplier?.supplier_name ?? null;
          break;
        case "Vendor Bill":
          // Handling for Vendor Bill
          auditingData.customer_id = null;
          auditingData.register_payment_sequence_no = scannedBillDetails?.register_payments[0]?.sequence_no ?? null;
          break;
        case "Sales Return":
          // Handling for Sales Return 
          auditingData.register_payment_id = null,
            auditingData.register_payment_sequence_no = null,
            auditingData.chq_type = scannedBillDetails?.chq_type ?? null;
          auditingData.chq_date = scannedBillDetails?.chq_date ?? null;
          auditingData.chq_no = scannedBillDetails.chq_no ?? null;
          auditingData.customer_id = scannedBillDetails?.customer?.customer_id;
          auditingData.customer_name = displayBillDetails.displayName;
          auditingData.register_payment_sequence_no = scannedBillDetails?.register_payments[0]?.sequence_no ?? null;
          break;
        case "Cash rec":
          auditingData.chq_no = scannedBillDetails?.chq_type ?? null,
            auditingData.chq_date = scannedBillDetails?.chq_type ?? null,
            auditingData.chq_type = scannedBillDetails?.chq_type ?? null,
            auditingData.customer_id = null;
          auditingData.register_payment_sequence_no = scannedBillDetails?.register_payments[0]?.sequence_no ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          auditingData.ledger_name = ledger?.ledger_name
          break;
        case "Cash pay":
          auditingData.collection_type_id = collectionType?._id ?? null;
          auditingData.collection_type_name = collectionType?.collection_type_name ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_name = ledger?.ledger_name ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          break;
        case "Bank rec":
          auditingData.collection_type_id = collectionType?._id ?? null;
          auditingData.collection_type_name = collectionType?.collection_type_name ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_name = ledger?.ledger_name ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          break;
        case "Bankpay":
          auditingData.collection_type_id = collectionType?._id ?? null;
          auditingData.collection_type_name = collectionType?.collection_type_name ?? null;
          auditingData.bussiness_type_id = collectionType?.bussiness_type_id ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_name = ledger?.ledger_name ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          break;
        case "SUPREC":
          auditingData.customer_id = loginUser?.company?.company_id ?? null;
          auditingData.customer_name = customer?.customerName ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_name = ledger?.ledger_name ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          break;
        case "SUPPAY":
          auditingData.supplier_id = scannedBillDetails?.supplier?.supplier_id ?? null;
          auditingData.supplier_name = scannedBillDetails?.supplier?.supplier_name ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_name = ledger?.ledger_name ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          break;
        case "CUSTREC":
          auditingData.customer_id = scannedBillDetails?.customer?.customer_id ?? null;
          auditingData.customer_name = scannedBillDetails?.customer?.customer_name ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_name = ledger?.ledger_name ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          break;
        case "CUSTPAY":
          auditingData.bussiness_type_id = scannedBillDetails?.bussiness_type_id ?? null;
          auditingData.customer_id = scannedBillDetails?.chart_of_account_id ?? null;
          auditingData.customer_name = scannedBillDetails?.chart_of_account_name ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_name = ledger?.ledger_name ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          break;
        case "CAPREC":
          // Handling for Sales Return 
          auditingData.chq_no = scannedBillDetails?.chq_type ?? null,
            auditingData.chq_date = scannedBillDetails?.chq_type ?? null,
            auditingData.chq_type = scannedBillDetails?.chq_type ?? null,
            auditingData.customer_id = null;
          auditingData.register_payment_sequence_no = scannedBillDetails?.register_payments[0]?.sequence_no ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_name = ledger?.ledger_name ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          break;
        case "CAPPAY":
          auditingData.supplier_id = scannedBillDetails?.supplier?.supplier_id ?? null;
          auditingData.supplier_name = scannedBillDetails?.supplier?.supplier_name ?? null;
          auditingData.register_payment_id = scannedBillDetails?.register_payments[0]._id ?? null;
          auditingData.chq_no = scannedBillDetails?.register_payments[0]?.chq_no ?? null;
          auditingData.chq_date = scannedBillDetails?.register_payments[0]?.chq_date ?? null;
          auditingData.chq_type = scannedBillDetails?.register_payments[0]?.chq_type ?? null;
          auditingData.chart_of_accounts_id = scannedBillDetails?.capital_chart_of_account_id ?? null;
          auditingData.chart_of_accounts_name = scannedBillDetails?.capital_chart_of_account_name ?? null;
          auditingData.employee_ledger_id = scannedBillDetails?.employee_ledger ?? null;
          auditingData.employee_ledger_name = scannedBillDetails?.employee_ledger ?? null;
          break;
        case "PETEXP":
          auditingData.supplier_id = scannedBillDetails?.supplier?.supplier_id ?? null;
          auditingData.supplier_name = scannedBillDetails?.supplier?.supplier_name ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_name = ledger?.ledger_name ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          break;
        case "PETTYALLOT":
          auditingData.customer_id = loginUser?.company?.company_id ?? null;
          auditingData.customer_name = customer?.customerName ?? null;
          auditingData.chart_of_accounts_id = scannedBillDetails?.capital_chart_of_account_id ?? null;
          auditingData.chart_of_accounts_name = scannedBillDetails?.capital_chart_of_account_name ?? null;
          auditingData.employee_ledger_id = scannedBillDetails?.employee_ledger ?? null;
          auditingData.employee_ledger_name = scannedBillDetails?.employee_ledger ?? null;
          auditingData.ledger_id = ledger?.ledger_id ?? null;
          auditingData.ledger_type = ledger?.ledger_type ?? null;
          auditingData.ledger_name = ledger?.ledger_name ?? null;
          auditingData.ledger_display_name = ledger?.ledger_display_name ?? null;
          break;
        case "PURCHRET":
          auditingData.customer_id = loginUser?.company?.company_id ?? null;
          auditingData.customer_name = displayBillDetails?.displayName ?? null;
          auditingData.supplier_id = scannedBillDetails?.supplier?.supplier_id ?? null;
          auditingData.supplier_name = scannedBillDetails?.supplier?.supplier_name ?? null;
          auditingData.un_taxed_amount = scannedBillDetails?.total_untaxed_amount ?? 0;
          auditingData.chq_no = scannedBillDetails?.chq_no ?? null;
          auditingData.chq_date = scannedBillDetails?.chq_date ?? null;
          auditingData.chq_type = scannedBillDetails?.chq_type ?? null;
          auditingData.cheque_transaction_type = scannedBillDetails?.type ?? null;
          auditingData.chart_of_accounts_id = scannedBillDetails?.capital_chart_of_account_id ?? null;
          auditingData.chart_of_accounts_name = scannedBillDetails?.capital_chart_of_account_name ?? null;
          auditingData.ledger_name = scannedBillDetails?.ledger_name ?? null;
          auditingData.ledger_type = scannedBillDetails?.ledger_type ?? null;
          auditingData.ledger_id = scannedBillDetails?.ledger_id ?? null;
          auditingData.employee_ledger_id = scannedBillDetails?.employee_ledger ?? null;
          auditingData.employee_ledger_name = scannedBillDetails?.employee_ledger ?? null;
          break;
        case "Spare Issue":
          auditingData.customer_id = loginUser?.company?.company_id ?? null;
          auditingData.customer_name = customer?.customerName ?? null;
          break;
        case "JobInvoice":
          auditingData.customer_id = loginUser?.company?.company_id ?? null;
          auditingData.customer_name = displayBillDetails?.displayName ?? null;
          auditingData.un_taxed_amount = scannedBillDetails?.untaxed_total_amount ?? 0;
          auditingData.register_payment_id = scannedBillDetails?.register_payments[0]._id ?? null;
          auditingData.register_payment_sequence_no = scannedBillDetails?.register_payments[0].sequence_no ?? null;
          auditingData.chq_no = scannedBillDetails?.register_payments[0]?.chq_no ?? null;
          auditingData.chq_date = scannedBillDetails?.register_payments[0]?.chq_date ?? null;
          auditingData.chq_type = scannedBillDetails?.register_payments[0]?.chq_type ?? null;
          auditingData.cheque_transaction_type = scannedBillDetails?.register_payments[0]?.type ?? null;
          auditingData.service_amount = scannedBillDetails?.total_service_amount;
          auditingData.service_product_amount = scannedBillDetails?.total_product_amount;
          break;
        default:
          break;
      }
      return auditingData;
    } catch (err) {
      console.log("🚀 ~ handleSubmitAudit ~ err:", err)
    }
  }


  const ListAction = ({ title, image, onPress }) => {
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <Image source={{ uri: image }} style={styles.image} />
      </TouchableOpacity>
    );
  };


  const renderItem = ({ item }) => {
    if (item.empty) {
      return <View style={[styles.itemStyle, styles.itemInvisible]} />
    }
    return <ListAction image={item} onPress={''} />;
  };

  return (
    <SafeAreaView>
      <NavigationHeader
        title="New Transaction Audit"
        onBackPress={() => navigation.goBack()}
      />
      <RoundedScrollContainer scrollEnabled={scrollEnabled}  >
        <FormInput label={'Date'} editable={false} value={format(new Date(), 'yyyy-MM-dd')} />
        <FormInput label={'Branch'} editable={false} value={loginUser.company ? loginUser.company?.name : ''} />
        <FormInput
          label={'Collection Type'}
          placeholder={'Collection Type'}
          editable={false}
          value={collectionType?.collection_type_name}
          validate={errors.collectionType}
        />
        <View style={styles.dottedQrBorderContainer}>
          <FormInput
            label={'Customer'}
            placeholder={'Customer Name'}
            editable={false}
            value={displayBillDetails?.displayName?.toUpperCase() || ''}
            validate={errors.customerName}
          />
          <FormInput
            label={'Invoice Number'}
            placeholder={'Invoice no'}
            editable={false}
            value={displayBillDetails?.documentNumber || ''}
            validate={errors.invoiceNumber}
          />
          <FormInput
            label={'Total Amount'}
            editable={false}
            placeholder={'Total Amount'}
            value={displayBillDetails?.totalAmount?.toString()}
            validate={errors.totalAmount}
          />
          <View style={styles.rowCotainer}>
            <Text style={styles.qrCodeText}>Update from qr Code </Text>
            <View style={styles.buttonContainer}>
              <Button backgroundColor={COLORS.primaryThemeColor} title={'Scan'} onPress={() => navigation.navigate('Scanner', { onScan: handleScan })} />
            </View>
          </View>
        </View>
        <ActionModal title={'Attach file'} setImageUrl={(url) => setImageUrl(prevUrls => [...prevUrls, url])} />
        {imageUrl && imageUrl.length > 0 && (
          <View style={styles.uploadsContainer}>
            {/* <Text style={''}>Update from qr Code </Text> */}
            <FlatList
              data={formatData(imageUrl, 4)}
              numColumns={4}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ padding: 10 }}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
            />
          </View>
        )}
        <SignaturePad setScrollEnabled={setScrollEnabled} setUrl={setUrl} title={'Customer/Vendor Signature'} />
        <FormInput label={'Remarks'} multiline={true} numberOfLines={5} />
        <Button backgroundColor={COLORS.primaryThemeColor} title={'SUBMIT'} onPress={validate} />
      </RoundedScrollContainer>
    </SafeAreaView>
  )
}

export default AuditForm

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  dottedQrBorderContainer: {
    padding: 15,
    borderWidth: 1.3,
    borderColor: COLORS.primaryThemeColor,
    borderRadius: 18,
    borderStyle: 'dotted',
    marginVertical: 10
  },
  rowCotainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  qrCodeText: {
    fontFamily: FONT_FAMILY.urbanistSemiBold,
    fontSize: 16,
    color: COLORS.primaryThemeColor,
    flex: 2,
  },
  uploadsContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 6,
    borderWidth: 0.8,
    borderColor: '#BBB7B7',
    backgroundColor: 'white',
    marginVertical: 5,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius:8
  },
  title: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.urbanistBold,
    color: COLORS.black,
    alignSelf: 'center'
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  itemStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },

});

