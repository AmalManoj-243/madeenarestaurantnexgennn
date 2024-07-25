import React, { useEffect, useCallback } from 'react';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { formatData } from '@utils/formatters';
import { RoundedContainer, SafeAreaView } from '@components/containers';
import { EmptyItem, EmptyState } from '@components/common/empty';
import { NavigationHeader } from '@components/Header';
import { FABButton } from '@components/common/Button';
import { fetchEnquiryRegister } from '@api/services/generalApi';
import { useDataFetching } from '@hooks';
import EnquiryRegisterList from './EnquiryRegisterList';
import AnimatedLoader from '@components/Loader/AnimatedLoader';
import { useAuthStore } from '@stores/auth';

const EnquiryRegisterScreen = ({ navigation }) => {

  const isFocused = useIsFocused();
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.related_profile?._id || '';
  const { data, loading, fetchData, fetchMoreData } = useDataFetching(fetchEnquiryRegister);

  useFocusEffect(
    useCallback(() => {
      fetchData({ loginEmployeeId: currentUserId });
    }, [currentUserId])
  );

  useEffect(() => {
    if (isFocused) {
      fetchData({ loginEmployeeId: currentUserId });
    }
  }, [isFocused]);

  const handleLoadMore = () => {
    fetchMoreData({ loginEmployeeId: currentUserId });
  };

  const renderItem = ({ item }) => {
    if (item.empty) {
      return <EmptyItem />;
    }
    return <EnquiryRegisterList item={item} />;
  };

  const renderEmptyState = () => (
    <EmptyState imageSource={require('@assets/images/EmptyData/empty_data.png')} message={'No Data'} />
  );

  const renderContent = () => (
    <FlashList
      data={formatData(data, 1)}
      numColumns={1}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{ padding: 10, paddingBottom: 50 }}
      onEndReached={handleLoadMore}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.2}
      ListFooterComponent={
        loading && (
          <AnimatedLoader
            visible={loading}
            animationSource={require('@assets/animations/loading.json')}
          />
        )
      }
      estimatedItemSize={100}
    />
  );

  const renderEnquiryRegister = () => {
    if (data.length === 0 && !loading) {
      return renderEmptyState();
    }
    return renderContent();
  };

  return (
    <SafeAreaView>
      <NavigationHeader
        title="Enquiry Register"
        onBackPress={() => navigation.goBack()}
      />
      {/* <SearchContainer placeholder="Search Products" onChangeText={handleSearchTextChange} /> */}
      <RoundedContainer>
        renderEnquiryRegister()
        <FABButton onPress={() => navigation.navigate('EnquiryRegisterForm')} />
      </RoundedContainer>
    </SafeAreaView>
  );
};

export default EnquiryRegisterScreen;
