import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Image, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearCartFromStorage } from '@api/customer/cartApi';
import { RoundedScrollContainer, SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { DetailField } from '@components/common/Detail';
import { Button } from '@components/common/Button';
import { useProductStore } from '@stores/product';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { EmptyState } from '@components/common/empty';
import { COLORS } from '@constants/theme';
import styles from './styles';
import { format } from 'date-fns';
import { useAuthStore } from '@stores/auth';
import { post } from '@api/services/utils';
import Toast from 'react-native-toast-message';
import { useCurrencyStore } from '@stores/currency';

const CustomerDetails = ({ navigation, route }) => {
  const { details } = route?.params || {};
  const currentUser = useAuthStore(state => state.user);
  const { 
    getCurrentCart, 
    setCurrentCustomer, 
    loadCustomerCart,
    removeProduct, 
    addProduct, 
    clearProducts 
  } = useProductStore();
  const currency = useCurrencyStore((state) => state.currency) || '';
  
  // Set current customer and load their cart when component mounts
  useEffect(() => {
    if (details?.id || details?._id) {
      const customerId = details.id || details._id;
      setCurrentCustomer(customerId);
      
      // Try to load saved cart from AsyncStorage
      loadCartFromStorage(customerId);
    }
  }, [details]);
  
  // Get current customer's products
  const products = getCurrentCart();
  
  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (details?.id || details?._id) {
      const customerId = details.id || details._id;
      saveCartToStorage(customerId, products);
    }
  }, [products, details]);

  const loadCartFromStorage = async (customerId) => {
    try {
      const savedCart = await AsyncStorage.getItem(`cart_${customerId}`);
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        loadCustomerCart(customerId, cartData);
      } else {
        loadCustomerCart(customerId, []);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      loadCustomerCart(customerId, []);
    }
  };

  const saveCartToStorage = async (customerId, cartData) => {
    try {
      await AsyncStorage.setItem(`cart_${customerId}`, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };
  

  const handleDelete = (productId) => {
    removeProduct(productId);
  };

  const handleQuantityChange = (productId, quantity) => {
    const updatedQuantity = Math.max(0, isNaN(parseInt(quantity)) ? 0 : parseInt(quantity));
    const product = products.find(p => p.id === productId);
    addProduct({ ...product, quantity: updatedQuantity });
  };

  const handlePriceChange = (productId, price) => {
    const updatedPrice = isNaN(parseFloat(price)) ? 0 : parseFloat(price);
    const product = products.find(p => p.id === productId);
    addProduct({ ...product, price: updatedPrice });
  };

  // Calculate amounts
  const calculateAmounts = () => {
    let untaxedAmount = 0;
    let totalQuantity = 0;

    products.forEach(product => {
      untaxedAmount += product.price * product.quantity;
      totalQuantity += product.quantity;
    });

    const taxRate = 0.05;
    const taxedAmount = untaxedAmount * taxRate;
    const totalAmount = untaxedAmount + taxedAmount;

    return { untaxedAmount, taxedAmount, totalAmount, totalQuantity };
  };

  const { untaxedAmount, taxedAmount, totalAmount, totalQuantity } = calculateAmounts();
  // console.log("🚀 ~ CustomerDetails ~ totalQuantity:", totalQuantity)

  const renderItem = ({ item }) => (
    <View style={styles.productContainer}>
      <View style={styles.row}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        </View>
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item?.name?.trim()}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => handleQuantityChange(item.id, item.quantity - 1)}>
              <AntDesign name="minus" size={20} color="black" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Quantity"
              value={item.quantity.toString()}
              onChangeText={(text) => handleQuantityChange(item.id, text)}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={() => handleQuantityChange(item.id, item.quantity + 1)}>
              <AntDesign name="plus" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Price"
              value={item.price.toString()}
              onChangeText={(text) => handlePriceChange(item.id, text)}
              keyboardType="numeric"
            />
            <Text style={styles.aedLabel}>{currency}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const placeOrder = async () => {
    const date = format(new Date(), 'yyyy-MM-dd');
    const orderItems = products.map((product) => ({
      product_id: product.id,
      tax_type_id: "648d9b54ef9cd868dfbfa37b",
      tax_value: 0.05,
      uom_id: product?.uom?.uom_id || null,
      uom: product?.uom?.uom_name || 'Pcs',
      qty: product.quantity,
      discount_percentage: 0,
      unit_price: product.price,
      remarks: '',
      total: product.price * product.quantity,
    }));
    const placeOrderData = {
      date: date,
      quotation_status: "new",
      address: details?.address,
      remarks: null,
      customer_id: details?._id,
      warehouse_id: currentUser?.warehouse?.warehouse_id,
      pipeline_id: null,
      payment_terms_id: null,
      delivery_method_id: null,
      untaxed_total_amount: untaxedAmount,
      total_amount: totalAmount,
      crm_product_line_ids: orderItems,
      sales_person_id: currentUser?.related_profile?._id ?? null,
      sales_person_name: currentUser.related_profile.name ?? '',
    }
    const response = await post('/createQuotation', placeOrderData)
    if (response.success === 'true') {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Quotation created successfully',
        position: 'bottom',
      });
      
      // Clear current customer's cart
      clearProducts();
      const customerId = details?.id || details?._id;
      if (customerId) {
        await clearCartFromStorage(customerId);
      }
      
      navigation.navigate('CustomerScreen');
    } else {
      Toast.show({
        type: 'error',
        text1: 'ERROR',
        text2: response.message || 'Quotation creation failed',
        position: 'bottom',
      });
    }
  }

  return (
    <SafeAreaView>
      <NavigationHeader title="Order Summary" onBackPress={() => navigation.goBack()} />
      <RoundedScrollContainer>
        <TouchableOpacity style={styles.itemContainer} activeOpacity={0.7}>
          <DetailField label="Customer Name" value={details.name} multiline={true} />
          <DetailField label="MOB" value={details.customer_mobile} />
        </TouchableOpacity>
        <Button
          title="Add Product(s)"
          width="50%"
          alignSelf="flex-end"
          marginTop={10}
          onPress={() => navigation.navigate('Products', { fromCustomerDetails: details })}
        />
        {products.length === 0 ? (
          <EmptyState imageSource={require('@assets/images/EmptyData/empty_cart.png')} message="Items are empty" />
        ) : (
          <View style={styles.itemContainer}>
            <Text style={styles.totalItemsText}>Total {products.length} item{products.length !== 1 ? 's' : ''}</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
            {products.length > 0 && (
              <View style={styles.footerContainer}>
                <View style={styles.totalPriceContainer}>
                  <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Untaxed Amount:</Text>
                    <Text style={styles.footerLabel}>{untaxedAmount.toFixed(2)} {currency}</Text>
                  </View>
                  <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Taxed Amount:</Text>
                    <Text style={styles.footerLabel}>{taxedAmount.toFixed(2)} {currency}</Text>
                  </View>
                  <View style={styles.footerRow}>
                    <Text style={styles.totalPriceLabel}>Total Amount:</Text>
                    <Text style={styles.totalPriceLabel}>{totalAmount.toFixed(2)} {currency}</Text>
                  </View>
                </View>
                <Button backgroundColor={COLORS.primaryThemeColor} title={'Place Order'} onPress={placeOrder} />
              </View>
            )}
          </View>
        )}
      </RoundedScrollContainer>
    </SafeAreaView>
  );
};

export default CustomerDetails;
