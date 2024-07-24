import React, { useEffect, useCallback } from 'react';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { formatData } from '@utils/formatters';
import { RoundedContainer, SafeAreaView, SearchContainer } from '@components/containers';
import { EmptyItem, EmptyState } from '@components/common/empty';
import { NavigationHeader } from '@components/Header';
import Text from '@components/Text';
import { fetchEnquiryRegister } from '@api/services/generalApi';
import { TouchableOpacity, ActivityIndicator, View, Image } from 'react-native';
import { useDataFetching, useDebouncedSearch } from '@hooks';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import { FABButton } from '@components/common/Button';

const EnquiryRegisterScreen = ({ navigation }) => {

  const options = [
    { title: 'Enquiry Register', image: require('@assets/images/Home/options/crm.png'), onPress: () => navigation.navigate('EnquiryRegisterView') },
  ]

  const isFocused = useIsFocused();
  const { data, loading, fetchData, fetchMoreData } = useDataFetching(fetchEnquiryRegister);
  const { searchText, handleSearchTextChange } = useDebouncedSearch((text) => fetchData({ searchText: text }), 500);

  useFocusEffect(
    useCallback(() => {
      fetchData({ searchText });
    }, [searchText])
  );

  useEffect(() => {
    if (isFocused) {
      fetchData({ searchText });
    }
  }, [isFocused, searchText]);

  const handleLoadMore = () => {
    fetchMoreData({ searchText });
  };

  const renderItem = ({ item }) => {
    if (item.empty) {
      return <EmptyItem />;
    }
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('EnquiryRegisterView', { details: item })}>
        <View style={styles.itemContainer}>
          <Image source={require('@assets/icons/common/user_bg.png')} tintColor={COLORS.primaryThemeColor} style={styles.itemImage} />
          <View style={styles.itemSpacer} />
          <Text style={styles.itemText}>{item?.name?.trim() || '-'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <EmptyState imageSource={require('@assets/images/EmptyData/empty_data.png')} message="" />
  );

  const renderContent = () => (
    <FlashList
      data={formatData(data, 1)}
      numColumns={1}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.listContentContainer}
      onEndReached={handleLoadMore}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.2}
      ListFooterComponent={loading && <ActivityIndicator size="large" color={COLORS.orange} />}
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
      <SearchContainer placeholder="Search..." onChangeText={handleSearchTextChange} />
      <RoundedContainer>
        {renderEnquiryRegister()}
        <FABButton onPress={() => navigation.navigate('EnquiryRegisterView')} />
      </RoundedContainer>
    </SafeAreaView>
  );
};

const styles = {
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
  },
  itemImage: {
    width: 45,
    height: 45,
  },
  itemSpacer: {
    width: 10,
  },
  itemText: {
    fontFamily: FONT_FAMILY.urbanistBold,
    fontSize: 14,
    flex: 1,
    color: COLORS.primaryThemeColor,
  },
  listContentContainer: {
    padding: 10,
    paddingBottom: 50,
  },
};

export default EnquiryRegisterScreen;