import React, { useState } from 'react';
import { ButtonContainer, RoundedScrollContainer, SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import Text from '@components/Text';
import { View, FlatList } from 'react-native';
import { COLORS } from '@constants/theme';
import { DetailField } from '@components/common/Detail';
import { EmptyState } from '@components/common/empty';
import { formatDate } from '@utils/common/date';
import InventoryBoxList from './InventoryBoxList';
import useAuthStore from '@stores/auth/authStore';
import { Button } from '@components/common/Button';
import { styles } from './styles';
import { reasons } from '@constants/dropdownConst';
import { TextInput as FormInput } from '@components/common/TextInput';
import { DropdownSheet } from '@components/common/BottomSheets';
import { showToastMessage } from '@components/Toast';

const InventoryDetails = ({ navigation, route }) => {
  const { inventoryDetails } = route?.params || {};
  const [isVisible, setIsVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [reason, setReason] = useState('');
  const currentUser = useAuthStore((state) => state.user);

  const isResponsible = (userId) => currentUser && (userId === currentUser.related_profile._id);

  const renderItem = ({ item }) => {
    if (item.empty) return <EmptyItem />;
    return <InventoryBoxList item={item} />;
  };

  const renderEmptyState = () => (
    <EmptyState imageSource={require('@assets/images/EmptyData/empty_inventory_box.png')} message="Box items is empty" />
  );

  const renderContent = () => (
    <FlatList
      data={inventoryDetails?.items || []}
      numColumns={1}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={100}
    />
  );

  const toggleBottomSheet = (type) => {
    setSelectedType(type);
    setIsVisible(!isVisible);
  };

  const renderBottomSheet = () => {
    if (selectedType === 'Select Reason') {
      return (
        <DropdownSheet
          isVisible={isVisible}
          items={reasons}
          title={selectedType}
          onClose={() => setIsVisible(false)}
          onValueChange={(value) => setReason(value)}
        />
      );
    }
    return null;
  };

  const handleBoxOpeningRequest = () => {
    if (!reason) {
      showToastMessage('Please select a reason before proceeding.');
      return;
    }
    navigation.navigate('InventoryForm', {
      items: inventoryDetails?.items || [],
      boxId: inventoryDetails?._id,
      boxName: inventoryDetails?.name,
      reason: reason
    });
  };

  const hasPermission = () =>
    currentUser &&
    (isResponsible(inventoryDetails?.responsible_person?._id) ||
      inventoryDetails?.employees?.some((employee) => isResponsible(employee._id)));

  return (
    <SafeAreaView>
      <NavigationHeader onBackPress={() => navigation.goBack()} title="Inventory Details" />
      <RoundedScrollContainer>
        <DetailField label="Inventory Box" value={inventoryDetails?.name} labelColor={COLORS.boxTheme} />
        <DetailField label="Location" value={inventoryDetails?.location_name} labelColor={COLORS.boxTheme} />
        <DetailField label="Date" value={formatDate(inventoryDetails?.date, 'yyyy-MM-dd hh:mm a')} labelColor={COLORS.boxTheme} />
        <FormInput
          labelColor={COLORS.boxTheme}
          label="Select Reason"
          placeholder="Select Reason"
          dropIcon="menu-down"
          editable={false}
          value={reason.label}
          multiline
          onPress={() => toggleBottomSheet('Select Reason')}
        />
        <View style={{ marginVertical: 10 }} />
        <Text style={styles.label}>Box Items</Text>
        {inventoryDetails?.items?.length === 0 ? renderEmptyState() : renderContent()}
        {hasPermission() ? (
          <ButtonContainer>
            <Button title="Box Opening Request" backgroundColor={COLORS.boxTheme} onPress={handleBoxOpeningRequest} />
          </ButtonContainer>
        ) : (
          <Text style={styles.notification}>You do not have permission to open the box request</Text>
        )}
        {/* <Button title="Box Opening Request" backgroundColor={COLORS.boxTheme} onPress={handleBoxOpeningRequest} /> */}

        {renderBottomSheet()}
      </RoundedScrollContainer>
    </SafeAreaView>
  );
};

export default InventoryDetails;
