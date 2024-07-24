import React, { useState, useEffect } from 'react';
import { useWindowDimensions, KeyboardAvoidingView, Platform, Keyboard, View } from 'react-native';
import { SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import { LoadingButton } from '@components/common/Button';
import { showToast } from '@utils/common';
import { post } from '@api/services/utils';
import { RoundedScrollContainer } from '@components/containers';
import { TextInput as FormInput } from '@components/common/TextInput';
import { DropdownSheet } from '@components/common/BottomSheets';
import { fetchSourceDropdown } from '@api/dropdowns/dropdownApi';

const EnquiryRegisterView = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const [formData, setFormData] = useState({
    datetime: "",
    source: "",
    name: "",
    companyName: "",
    phoneNumber: "",
    emailAddress: "",
    enquiryRegister: "",
  });

  const [errors, setErrors] = useState({});

  const [dropdown, setDropdown] = useState({
    source: [],
  });

  const validate = () => {
    Keyboard.dismiss();
    let isValid = true;
    let errors = {};

    const requiredFields = {
      name: 'Please enter the Name',
      phoneNumber: 'Please enter Phone Number'
    };

    Object.keys(requiredFields).forEach(field => {
      if (!formData[field]) {
        errors[field] = requiredFields[field];
        isValid = false;
      }
    });

    setErrors(errors);
    return isValid;
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const sourceData = await fetchSourceDropdown();
        setDropdown(prevDropdown => ({
          ...prevDropdown,
          source: sourceData.map(data => ({
            id: data._id,
            label: data.name,
          })),
        }));
      } catch (error) {
        console.error('Error fetching source dropdown data:', error);
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
      case 'Source':
        items = dropdown.source;
        fieldName = 'source';
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
        onValueChange={(value) => setFormData(prevFormData => ({
          ...prevFormData,
          [fieldName]: value,
        }))}
      />
    );
  };

  const onFieldChange = (fieldName, value) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

  const submit = async () => {
    if (!validate()) {
      return;
    }

    try {
      const response = await post('/viewEnquiryRegister', formData);
      if (response.success) {
        showToast('Enquiry registered successfully!');
        navigation.goBack();
      } else {
        showToast('Failed to register enquiry.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('An error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView>
      <NavigationHeader
        title="Add Enquiry Register"
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
        <RoundedScrollContainer>
        <FormInput
            label={"Date Time :"}
            placeholder={""}
            editable={true}
            validate={errors.datetime}
            onChangeText={(value) => onFieldChange('name', value)}
          />
          <FormInput
            label={"Source :"}
            placeholder={"Select Source"}
            dropIcon={"menu-down"}
            editable={false}
            validate={errors.source}
            value={formData.source?.label}
            onPress={() => toggleBottomSheet('Source')}
          />
          <FormInput
            label={"Name :"}
            placeholder={"Enter Your Name"}
            editable={true}
            validate={errors.name}
            onChangeText={(value) => onFieldChange('name', value)}
          />
          <FormInput
            label={"Company Name :"}
            placeholder={"Enter Company Name"}
            editable={true}
            validate={errors.companyName}
            onChangeText={(value) => onFieldChange('companyName', value)}
          />
          <FormInput
            label={"Phone :"}
            placeholder={"Enter Phone Number"}
            editable={true}
            keyboardType="numeric"
            validate={errors.phoneNumber}
            onChangeText={(value) => onFieldChange('phoneNumber', value)}
          />
          <FormInput
            label={"Email :"}
            placeholder={"Enter Email"}
            editable={true}
            validate={errors.emailAddress}
            onChangeText={(value) => onFieldChange('emailAddress', value)}
          />
          <FormInput
            label={"Address :"}
            placeholder={"Enter Address"}
            editable={true}
            validate={errors.emailAddress}
            onChangeText={(value) => onFieldChange('emailAddress', value)}
          />
          <FormInput
            label={"Enquiry Details :"}
            placeholder={"Enter Enquiry Details"}
            editable={true}
            validate={errors.enquiryRegister}
            multiline={true}
            numberOfLines={5}
            onChangeText={(value) => onFieldChange('emailAddress', value)}
          />
          {renderBottomSheet()}
        </RoundedScrollContainer>
      </KeyboardAvoidingView>

      <View style={{ backgroundColor: 'white', paddingHorizontal: 50, paddingBottom: 20 }}>
        <LoadingButton onPress={submit} title={'Save'} />
      </View>
    </SafeAreaView>
  );
};

export default EnquiryRegisterView;
