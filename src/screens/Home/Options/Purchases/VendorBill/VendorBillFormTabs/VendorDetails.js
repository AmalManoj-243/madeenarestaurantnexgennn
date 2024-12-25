import React, { useState, useEffect } from 'react';
import { FlatList } from "react-native";
import { RoundedScrollContainer } from '@components/containers';
import { TextInput as FormInput } from '@components/common/TextInput';
import { DropdownSheet } from '@components/common/BottomSheets';
import { fetchCurrencyDropdown, fetchCountryDropdown, fetchSupplierDropdown } from '@api/dropdowns/dropdownApi';
import { paymentMode, purchaseType } from '@constants/dropdownConst';
import { TitleWithButton } from '@components/Header';
import ProductLineList from '../../PriceEnquiry/ProductLineList';

const VendorDetails = ({ formData, onFieldChange, errors, navigation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [productLines, setProductLines] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [dropdown, setDropdown] = useState({
    vendorName: [],
    purchaseType: [],
    countryOfOrigin: [],
    currency: [],
    paymentMode: [],
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (selectedType === "Vendor Name") {
        try {
          const vendorData = await fetchSupplierDropdown(searchText);
          setDropdown((prevDropdown) => ({
            ...prevDropdown,
            vendorName: vendorData?.map((data) => ({
              id: data._id,
              label: data.name?.trim(),
            })),
          }));
        } catch (error) {
          console.error("Error fetching Supplier dropdown data:", error);
        }
      }
    };
    fetchSuppliers();
  }, [searchText, selectedType]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [currencyData, countryData] = await Promise.all([
          fetchCurrencyDropdown(),
          fetchCountryDropdown(),
        ]);
        setDropdown({
          currency: currencyData.map(data => ({
            id: data._id,
            label: data.currency_name,
          })),
          countryOfOrigin: countryData.map(data => ({
            id: data._id,
            label: data.country_name,
          })),
        });
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  const toggleBottomSheet = (type) => {
    setSelectedType(type);
    setIsVisible(!isVisible);
  };

  const renderBottomSheet = () => {
    let items = [];
    let fieldName = '';

    switch (selectedType) {
      case 'Vendor Name':
        items = dropdown.vendorName;
        fieldName = "vendorName";
        break;
      case "Purchase Type":
        items = purchaseType;
        fieldName = "purchaseType";
        break;
      case "Country Of Origin":
        items = dropdown.countryOfOrigin;
        fieldName = "countryOfOrigin";
        break;
      case "Currency":
        items = dropdown.currency;
        fieldName = "currency";
        break;
      case 'Payment Mode':
        items = paymentMode;
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
        search={selectedType === "Vendor Name"}
        onSearchText={(value) => setSearchText(value)}
        onValueChange={(value) => onFieldChange(fieldName, value)}
      />
    );
  };

  return (
    <RoundedScrollContainer>
      <FormInput
        label={"Vendor Name"}
        placeholder={"Select Vendor Name"}
        dropIcon={"menu-down"}
        editable={false}
        required
        multiline={true}
        validate={errors.vendorName}
        value={formData.vendorName?.label}
        onPress={() => toggleBottomSheet('Vendor Name')}
      />
      <FormInput
        label="Purchase Type"
        placeholder="Select Purchase Type"
        dropIcon="menu-down"
        editable={false}
        required
        validate={errors.purchaseType}
        value={formData.purchaseType?.label}
        onPress={() => toggleBottomSheet("Purchase Type")}
      />
      <FormInput
        label={"Country Of Origin"}
        placeholder="Select Country"
        dropIcon="menu-down"
        editable={false}
        validate={errors.countryOfOrigin}
        value={formData.countryOfOrigin?.label}
        required
        onPress={() => toggleBottomSheet("Country Of Origin")}
      />
      <FormInput
        label="Currency"
        placeholder="Select Currency"
        dropIcon="menu-down"
        editable={false}
        validate={errors.currency}
        value={formData.currency?.label}
        required
        onPress={() => toggleBottomSheet("Currency")}
      />
      <FormInput
        label={"Amount Paid"}
        placeholder={"Enter Amount Paid"}
        editable={true}
        value={formData.amountPaid}
        onChangeText={(value) => onFieldChange('amountPaid', value)}
      />
      <FormInput
        label="Payment Mode"
        placeholder="Select Purchase Type"
        dropIcon="menu-down"
        editable={false}
        validate={errors.paymentMode}
        value={formData.paymentMode?.label}
        required
        onPress={() => toggleBottomSheet("Payment Mode")}
      />
      <TitleWithButton
        label="Add Products"
        onPress={() => navigation.navigate('AddVendorProducts')}
      />
      <FlatList
        data={productLines}
        renderItem={({ item }) => (
          <ProductLineList item={item} />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      {renderBottomSheet()}
    </RoundedScrollContainer>
  );
};

export default VendorDetails;