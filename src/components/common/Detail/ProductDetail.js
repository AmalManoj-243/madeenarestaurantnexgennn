import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Modal, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Text from '@components/Text';
import { RoundedScrollContainer, SafeAreaView } from '@components/containers';
import { NavigationHeader } from '@components/Header';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import { fetchProductDetails } from '@api/details/detailApi';
import { fetchProductDetailsOdoo } from '@api/services/generalApi';
import { showToastMessage } from '@components/Toast';
import { useAuthStore } from '@stores/auth';
import { OverlayLoader } from '@components/Loader';
import { useProductStore } from '@stores/product';
import { useCurrencyStore } from '@stores/currency';

const ProductDetail = ({ navigation, route }) => {
  const { detail = {}, fromCustomerDetails = {} } = route?.params || {};
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const currentUser = useAuthStore(state => state.user);
  const currency = useCurrencyStore((state) => state.currency);

  const addProductStore = useProductStore((state) => state.addProduct);

  // Detect if this is an Odoo product (id but no _id)
  const isOdooProduct = !!detail.id && !detail._id;

  const productDetails = async () => {
    try {
      const productId = detail?._id;
      if (!productId) return;
      const response = await fetchProductDetails(productId);
      setDetails(response[0] || {});
    } catch (e) {}
  };

  // Initialise `details` depending on source (Odoo vs existing backend)
  useEffect(() => {
    if (isOdooProduct) {
      const loadOdooDetails = async () => {
        setLoading(true);
        try {
          const od = await fetchProductDetailsOdoo(detail.id);
          setDetails({
            ...detail,
            id: detail.id,
            product_name: od?.product_name || detail.product_name || detail.name,
            image_url: od?.image_url || detail.image_url,
            cost: od?.price ?? detail.price ?? 0,
            sale_price: od?.price ?? detail.price ?? 0,
            minimal_sales_price: od?.minimal_sales_price ?? null,
            inventory_ledgers: od?.inventory_ledgers || [],
            total_product_quantity: od?.total_product_quantity ?? 0,
            product_code: od?.product_code || detail.code || detail.default_code || null,
            uom: od?.uom || detail.uom || null,
            categ_id: od?.categ_id || detail.categ_id || null,
          });
        } catch (e) {
          setDetails({
            ...detail,
            id: detail.id,
            product_name: detail.product_name || detail.name,
            image_url: detail.image_url,
            cost: detail.price ?? 0,
            sale_price: detail.price ?? 0,
            minimal_sales_price: null,
            inventory_ledgers: [],
            total_product_quantity: 0,
            uom: detail.uom || null,
          });
        } finally {
          setLoading(false);
        }
      };
      loadOdooDetails();
    } else if (detail?._id) {
      productDetails();
    } else {
      setDetails(detail || {});
    }
  }, [detail, isOdooProduct]);

  const renderStockDetails = () => {
    const { inventory_ledgers = [] } = details || {};
    const filteredLedgers = inventory_ledgers.filter(
      l => l?.warehouse_name?.toLowerCase() !== 'inv adj' && l?.warehouse_name?.toLowerCase() !== 'inventory adjustment'
    );
    if (!filteredLedgers || filteredLedgers.length === 0) return null;

    return (
      <View style={{ marginTop: 10, marginLeft: 10 }}>
        {filteredLedgers.map((ledger, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: COLORS.lightGray,
                padding: 5,
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold }}>
                Stocks on hand:
              </Text>
              <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold }}>
                {ledger?.total_warehouse_quantity}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: FONT_FAMILY.urbanistBold,
                color: COLORS.orange,
                fontSize: 16,
                marginTop: 8,
                marginLeft: 5,
              }}
            >
              {ledger?.warehouse_name || '-'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const handleAddProduct = () => {
    const { getCurrentCart, addProduct, setCurrentCustomer } = useProductStore.getState();

    if (Object.keys(fromCustomerDetails).length > 0) {
      const customerId = fromCustomerDetails.id || fromCustomerDetails._id;
      if (customerId) {
        setCurrentCustomer(customerId);
      }
    }

    const currentProducts = getCurrentCart();

    let uomData = null;
    if (details?.uom?.uom_id) {
      uomData = details.uom;
    } else if (Array.isArray(details?.uom) && details.uom.length >= 2) {
      uomData = { uom_id: details.uom[0], uom_name: details.uom[1] };
    }

    const newProduct = {
      id: details.id ?? details._id,
      name: details.product_name || details.name,
      quantity: 1,
      price: details.cost ?? details.price ?? 0,
      imageUrl: details.image_url,
      uom: uomData,
      inventory_ledgers: details.inventory_ledgers || [],
    };

    if (!newProduct.id) {
      showToastMessage('Product ID missing, cannot add to cart');
      return;
    }

    const exist = currentProducts.some((p) => p.id === newProduct.id);
    if (exist) {
      showToastMessage('Product already added');
    } else {
      addProduct(newProduct);
      if (Object.keys(fromCustomerDetails).length > 0) {
        navigation.navigate('CustomerDetails', { details: fromCustomerDetails });
      } else {
        navigation.navigate('CustomerScreen');
      }
    }
  };

  const handleAddToPosCart = () => {
    const { getCurrentCart, addProduct, setCurrentCustomer } = useProductStore.getState();
    setCurrentCustomer('pos_guest');

    const currentProducts = getCurrentCart();

    const newProduct = {
      id: details.id ?? details._id,
      name: details.product_name || details.name,
      quantity: 1,
      price: details.cost ?? details.price ?? 0,
      imageUrl: details.image_url,
    };

    if (!newProduct.id) {
      showToastMessage('Product ID missing, cannot add to cart');
      return;
    }

    const exist = currentProducts.some((p) => p.id === newProduct.id);
    if (exist) {
      showToastMessage('Product already added to POS cart');
    } else {
      addProduct(newProduct);
      showToastMessage('Added to POS cart');
      navigation.goBack();
    }
  };

  // Fullscreen image modal state
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <SafeAreaView>
      <NavigationHeader title="Product Details" onBackPress={() => navigation.goBack()} />
      <RoundedScrollContainer>
        {details && Object.keys(details).length > 0 ? (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <View style={{ width: '50%' }}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setImageModalVisible(true)}>
                  <View style={{ width: '100%', height: 260, justifyContent: 'center', alignItems: 'center' }}>
                    {isImageLoading && (
                      <ActivityIndicator size="large" color={COLORS.primaryThemeColor} style={{ position: 'absolute' }} />
                    )}
                    <Image
                      source={
                        details.image_url
                          ? { uri: details.image_url }
                          : require('@assets/images/error/error.png')
                      }
                      style={{ width: '100%', height: 260 }}
                      resizeMode="contain"
                      onLoadStart={() => setIsImageLoading(true)}
                      onLoadEnd={() => setIsImageLoading(false)}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ width: '50%', padding: 10 }}>
                <Text style={{ fontSize: 18, fontFamily: FONT_FAMILY.urbanistBold }}>
                  {(details.product_name || details.name || 'Product').trim()}
                </Text>
                {details.product_description && (
                  <Text style={{ marginTop: 10, fontFamily: FONT_FAMILY.urbanistSemiBold }}>
                    {details.product_description}
                  </Text>
                )}
                {details.alternateproduct?.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ fontFamily: FONT_FAMILY.urbanistSemiBold }}>
                      Alternate Products:
                    </Text>
                    {details.alternateproduct.map((product) => (
                      <Text
                        key={product._id || product.id}
                        style={{ fontFamily: FONT_FAMILY.urbanistSemiBold }}
                      >
                        {product?.product_name}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={{ padding: 10, marginTop: route?.params?.fromPOS ? 40 : 20 }}>
              <Text style={{ fontFamily: FONT_FAMILY.urbanistBold, fontSize: 20 }}>
                Details:
              </Text>

              {!route?.params?.fromPOS && (
                <View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
                    <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                      Category:
                    </Text>
                    <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                      {
                        details?.category?.category_name
                        || (Array.isArray(details?.categ_id) ? details.categ_id[1] : null)
                        || details?.category_name
                        || 'N/A'
                      }
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
                    <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                      Price:
                    </Text>
                    <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                      {(details.cost ?? details.price ?? 0).toString()} {currency || ''}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
                    <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                      Minimum Sales Price:
                    </Text>
                    <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                      {(details.minimal_sales_price ?? 'N/A').toString()} {currency || ''}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
                    <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                      Product Code:
                    </Text>
                    <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                      {details.product_code ?? details.code ?? details.default_code ?? 'N/A'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
                    <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                      Stocks on hand:
                    </Text>
                    <Text style={{ width: '50%', fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                      {details.total_product_quantity ?? 'N/A'}
                    </Text>
                  </View>
                </View>
              )}

              {route?.params?.fromPOS && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18 }}>
                    Category: {details?.category?.category_name
                      || (Array.isArray(details?.categ_id) ? details.categ_id[1] : null)
                      || details?.category_name
                      || 'N/A'}
                  </Text>
                  <Text style={{ fontFamily: FONT_FAMILY.urbanistSemiBold, fontSize: 18, marginTop: 4 }}>
                    Price: {(details.cost ?? details.price ?? 0).toString()} {currency || ''}
                  </Text>
                </View>
              )}
            </View>

            {renderStockDetails()}

            <View style={{ flex: 1 }} />
          </>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, color: COLORS.error, textAlign: 'center' }}>
              No product details available.
            </Text>
          </View>
        )}
      </RoundedScrollContainer>

      {/* Fullscreen image modal */}
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade">
        <View style={styles.imageModalBg}>
          <TouchableOpacity
            style={styles.imageCloseBtn}
            onPress={() => setImageModalVisible(false)}
            accessibilityLabel="Close image"
            accessibilityRole="button"
          >
            <Text style={{ color: '#111', fontSize: 28, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
          <Image
            source={
              details.image_url
                ? { uri: details.image_url }
                : require('@assets/images/error/error.png')
            }
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {loading && <OverlayLoader visible={true} backgroundColor={true} />}
    </SafeAreaView>
  );
};

export default ProductDetail;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  imageModalBg: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  fullImage: {
    width: Math.min(width * 0.9, 900),
    height: Math.min(height * 0.65, 800),
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  imageCloseBtn: {
    position: 'absolute',
    top: 28,
    right: 18,
    zIndex: 10,
    padding: 8,
  },
});
