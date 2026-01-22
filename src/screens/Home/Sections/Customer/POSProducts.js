import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { NavigationHeader } from '@components/Header';
import { ProductsList } from '@components/Product';
import { fetchProductsOdoo, fetchPosPresets, addLineToOrderOdoo, updateOrderLineOdoo, removeOrderLineOdoo, fetchPosOrderById, fetchOrderLinesByIds, fetchPosCategoriesOdoo, fetchProductCategoriesOdoo, fetchProductsByPosCategoryId } from '@api/services/generalApi';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { formatData } from '@utils/formatters';
import { formatCurrency } from '@utils/formatters/currency';
import { OverlayLoader } from '@components/Loader';
import { RoundedContainer, SafeAreaView, SearchContainer } from '@components/containers';
import { COLORS } from '@constants/theme';
import styles from './styles';
import { EmptyState } from '@components/common/empty';
import useDataFetching from '@hooks/useDataFetching';
import useDebouncedSearch from '@hooks/useDebouncedSearch';
// ...existing code...
import { useProductStore } from '@stores/product';
import Toast from 'react-native-toast-message';
import { Button } from '@components/common/Button';
import useKitchenTickets from '@stores/kitchen/ticketsStore';

const POSProducts = ({ navigation, route }) => {
  const {
    openingAmount,
    sessionId,
    registerId,
    registerName,
    userId,
    userName
  } = route?.params || {};
  const categoryId = '';
  const isFocused = useIsFocused();
  // POS category UI + mapping state
  const [posCategories, setPosCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [selectedPosCategoryId, setSelectedPosCategoryId] = useState(null);
  const [mappedProductCategoryId, setMappedProductCategoryId] = useState(undefined);
  const [posFilteredProducts, setPosFilteredProducts] = useState(null);
  const [posFilteredLoading, setPosFilteredLoading] = useState(false);
  const { data, loading, fetchData, fetchMoreData } = useDataFetching(fetchProductsOdoo);
  const { searchText, handleSearchTextChange } = useDebouncedSearch(
    (text) => {
      try { fetchData({ searchText: text, categoryId: mappedProductCategoryId }); } catch (e) { /* ignore */ }
    },
    600
  );
  // Search column removed
  const { addProduct, setCurrentCustomer, clearProducts, removeProduct, clearAllCarts } = useProductStore();
  const [loadedOrderLines, setLoadedOrderLines] = useState([]);
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  // Quick Add popup state (for in-place add from products grid)
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [quickProduct, setQuickProduct] = useState(null);
  const [quickQty, setQuickQty] = useState(1);
  const minusScale = useRef(new Animated.Value(1)).current;
  const plusScale = useRef(new Animated.Value(1)).current;

  const animateButton = (scaleRef, toValue) => {
    Animated.timing(scaleRef, {
      toValue,
      duration: 120,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();
  };
  const [orderInfo, setOrderInfo] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [backLoading, setBackLoading] = useState(false);
  const handleMainBack = () => {
    setBackLoading(true);
    setTimeout(() => {
      try { navigation.goBack(); } catch (e) { navigation.navigate('Home'); }
    }, 80);
  };
  const handleCloseProducts = () => {
    setBackLoading(true);
    setTimeout(() => {
      setShowProducts(false);
      setTimeout(() => setBackLoading(false), 400);
    }, 80);
  };
  const setSnapshot = useKitchenTickets((s) => s.setSnapshot);
  // helper to map pos.order.line -> productStore product format
  const mapLineToProduct = (line) => {
    const productId = Array.isArray(line.product_id) ? line.product_id[0] : line.product_id;
    const productName = Array.isArray(line.product_id) ? line.product_id[1] : (line.full_product_name || line.name || 'Product');
    const qty = Number(line.qty || 1);
    const unitPrice = Number(line.price_unit || 0);
    const subtotalIncl = Number(line.price_subtotal_incl ?? line.price_subtotal ?? (qty * unitPrice));
    return {
      id: `odoo_line_${line.id}`,
      remoteId: productId,
      name: productName,
      // provide both shapes so renderers that expect either field work
      price: Number(line.price_unit || line.price_subtotal_incl || 0),
      price_unit: Number(line.price_unit || line.price_subtotal_incl || 0),
      quantity: Number(line.qty || 1),
      qty: Number(line.qty || 1),
      // include subtotal fields from server when available
      price_subtotal: Number(line.price_subtotal ?? (qty * unitPrice)),
      price_subtotal_incl: subtotalIncl,
    };
  };

  // Refresh order lines from server and sync local cart
  const refreshServerOrder = async (orderId) => {
    if (!orderId) return;
    try {
      console.log('[POSProducts] refreshServerOrder orderId:', orderId);
      const orderResp = await fetchPosOrderById(orderId);
      console.log('[POSProducts] fetched order:', orderResp);
      const orderResult = orderResp && orderResp.result ? orderResp.result : null;
      // Defensive: If order is in a closed/final state, clear cart and loaded lines
      const CLOSED_STATES = ['done', 'receipt', 'paid', 'invoiced', 'posted', 'cancel'];
      if (orderResult && CLOSED_STATES.includes(String(orderResult.state))) {
        console.log('[POSProducts] Order is closed (state:', orderResult.state, '), clearing cart and loaded lines.');
        try { clearProducts(); } catch (e) { console.warn('clearProducts failed', e); }
        setLoadedOrderLines([]);
        setOrderInfo(orderResult);
        return;
      }
      const lineIds = orderResp && orderResp.result && Array.isArray(orderResp.result.lines) ? orderResp.result.lines : [];
      if (lineIds.length > 0) {
        const linesResp = await fetchOrderLinesByIds(lineIds);
        const lines = linesResp && linesResp.result ? linesResp.result : [];
        console.log('[POSProducts] fetched order lines:', lines);
        const cartOwner = `order_${orderId}`;
        setCurrentCustomer(cartOwner);
        clearProducts();
        lines.forEach(line => {
          const p = mapLineToProduct(line);
          addProduct(p);
        });
        setLoadedOrderLines(lines);
        setOrderInfo(orderResult);
      } else {
        // no lines on server
        const cartOwner = `order_${orderId}`;
        setCurrentCustomer(cartOwner);
        clearProducts();
        setLoadedOrderLines([]);
        setOrderInfo(orderResult);
      }
    } catch (err) {
      console.error('refreshServerOrder error:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Ensure POS cart owner: if an orderId is present keep its cart, otherwise use guest
      const orderId = route?.params?.orderId;
      if (orderId) {
        try { setCurrentCustomer(`order_${orderId}`); } catch (e) {}
        // refresh server order lines when returning to register so cart stays in sync
        (async () => {
          try { await refreshServerOrder(orderId); } catch (e) { /* ignore */ }
        })();
      } else {
        try { setCurrentCustomer('pos_guest'); } catch (e) {}
      }
      fetchData({ searchText, categoryId: mappedProductCategoryId });
    }, [mappedProductCategoryId, searchText])
  );

  useEffect(() => {
    if (isFocused) fetchData({ searchText, categoryId: mappedProductCategoryId });
  }, [isFocused, mappedProductCategoryId, searchText]);

  useEffect(() => {
    console.log('POSProducts params:', route?.params);
    // If orderLines are passed, log them explicitly for debugging
    if (route?.params?.orderLines) {
      console.log('POSProducts received orderLines:', route.params.orderLines.map(l => ({ id: l.id, product_id: l.product_id, qty: l.qty, price_unit: l.price_unit })));
    }

    // Fetch pos.preset records (presets like Dine In / Takeaway), store and log them
    (async () => {
      try {
        const resp = await fetchPosPresets();
        if (resp && resp.result) {
          console.log('Fetched pos.presets:', resp.result.map(p => ({ id: p.id, name: p.name, available_in_self: p.available_in_self })));
          setPresets(resp.result);
          // try to default-select 'Dine In' if present, otherwise first preset
          const dineIn = resp.result.find(p => String(p.name).toLowerCase().includes('dine'));
          setSelectedPreset(dineIn || resp.result[0] || null);
        } else if (resp && resp.error) {
          console.warn('fetchPosPresets returned error:', resp.error);
        }
      } catch (err) {
        console.error('Error fetching pos.presets:', err);
      }
    })();
    // If orderLines are passed in route params, preload them into the cart store
    const { orderId, orderLines } = route?.params || {};
    if (orderLines && Array.isArray(orderLines) && orderLines.length > 0) {
      // use a distinct customer/cart id per order so cart operations are isolated
      const cartOwner = `order_${orderId}`;
      setCurrentCustomer(cartOwner);
      clearProducts();
      // map and add each line as a product in the cart
      orderLines.forEach(line => {
        const p = mapLineToProduct(line);
        addProduct(p);
      });
      setLoadedOrderLines(orderLines);
    }
  }, []);

  // Load POS categories and product categories to enable category filtering in the modal
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const posResp = await fetchPosCategoriesOdoo();
        const prodResp = await fetchProductCategoriesOdoo();
        const posListRaw = Array.isArray(posResp) ? posResp : (posResp && posResp.result ? posResp.result : []);
        // Exclude categories named 'Food' or 'Drinks' (case-insensitive)
        const excludeNames = ['food', 'drinks'];
        const filtered = posListRaw.filter(c => {
          const name = c && (c.name || (Array.isArray(c) ? c[1] : ''));
          if (!name) return true;
          const lower = String(name).toLowerCase();
          return !excludeNames.some(e => lower === e || lower.includes(e));
        });
        // Deduplicate by name, keeping the last occurrence (so later 'Lunch' remains)
        const seen = new Set();
        const dedupReversed = [];
        for (let i = filtered.length - 1; i >= 0; i--) {
          const c = filtered[i];
          const name = c && (c.name || (Array.isArray(c) ? c[1] : ''));
          const key = name ? String(name).trim().toLowerCase() : `__idx_${i}`;
          if (!seen.has(key)) {
            seen.add(key);
            dedupReversed.push(c);
          }
        }
        const posList = dedupReversed.reverse();
        const prodList = Array.isArray(prodResp) ? prodResp : (prodResp && prodResp.result ? prodResp.result : []);
        setPosCategories(posList);
        setProductCategories(prodList);
        // Keep selectedPosCategoryId as null to show "Show All" by default
      } catch (e) {
        console.warn('Failed to load categories for POS modal', e);
      }
    };
    loadCategories();
  }, []);

  // When mapped category changes, refresh products for modal when it's open
  useEffect(() => {
    if (showProducts) {
      fetchData({ categoryId: mappedProductCategoryId });
    }
  }, [mappedProductCategoryId, showProducts]);

  // When a POS category is selected (and modal open), fetch products by pos_categ_id
  useEffect(() => {
    let mounted = true;
    const fetchFiltered = async () => {
      if (!showProducts) return;
      if (!selectedPosCategoryId) {
        if (mounted) setPosFilteredProducts(null);
        return;
      }
      try {
        setPosFilteredLoading(true);
        const res = await fetchProductsByPosCategoryId(selectedPosCategoryId);
        if (mounted) setPosFilteredProducts(Array.isArray(res) ? res : []);
      } catch (err) {
        console.warn('Failed to fetch products for POS category', selectedPosCategoryId, err);
        if (mounted) setPosFilteredProducts([]);
      } finally {
        if (mounted) setPosFilteredLoading(false);
      }
    };
    fetchFiltered();
    return () => { mounted = false; };
  }, [selectedPosCategoryId, showProducts]);

  // Map selected POS category -> product.category id
  useEffect(() => {
    if (!selectedPosCategoryId || productCategories.length === 0 || posCategories.length === 0) {
      setMappedProductCategoryId(undefined);
      return;
    }
    const posCat = posCategories.find(c => Number(c.id) === Number(selectedPosCategoryId) || (Array.isArray(c) && Number(c[0]) === Number(selectedPosCategoryId)));
    const posName = posCat ? (posCat.name || (Array.isArray(posCat) ? posCat[1] : '')) : null;
    let mappedId = undefined;
    const manualCategoryMap = { 'APPETIZERS': 'STARTER' };
    let effectiveCategoryName = posName;
    if (posName && manualCategoryMap[posName.toUpperCase()]) {
      effectiveCategoryName = manualCategoryMap[posName.toUpperCase()];
    }
    if (effectiveCategoryName) {
      let match = productCategories.find(cat => (cat.name || '').toLowerCase() === effectiveCategoryName.toLowerCase());
      if (!match) {
        match = productCategories.find(cat => (cat.name || '').toLowerCase().includes(effectiveCategoryName.toLowerCase()) || effectiveCategoryName.toLowerCase().includes((cat.name || '').toLowerCase()));
      }
      if (match) mappedId = match.id;
    }
    setMappedProductCategoryId(mappedId);
  }, [selectedPosCategoryId, productCategories, posCategories]);

  const handleLoadMore = () => fetchMoreData({ categoryId });

  const handleAdd = (p, qtyOverride = 1) => {
    const product = {
      id: p.id,
      name: p.product_name || p.name,
      price: p.price || p.list_price || 0,
      quantity: qtyOverride,
      imageUrl: p.imageUrl || p.image_url || p.image || '',
    };
    // If we have an active order on server, add line there too
    const orderId = route?.params?.orderId;
    if (orderId) {
      (async () => {
        try {
          const payload = { orderId, productId: p.id, qty: qtyOverride, price_unit: product.price, name: product.name };
          console.log('[POSProducts] addLineToOrder payload:', payload);
          await addLineToOrderOdoo(payload);
          // Refresh server order lines into local cart so quantities/prices are authoritative
          await refreshServerOrder(orderId);
          // Update printed snapshot to include current items if this is first ticket scenario:
          // We will not auto-update here to keep delta meaningful until user prints.
          Toast.show({ type: 'success', text1: 'Added', text2: `${product.name} × ${qtyOverride}` });
        } catch (e) {
          console.error('Failed to add line to Odoo order:', e);
          Toast.show({ type: 'error', text1: 'Odoo Error', text2: 'Failed to add product to order' });
        }
      })();
    } else {
      addProduct(product);
      Toast.show({ type: 'success', text1: 'Added', text2: `${product.name} × ${qtyOverride}` });
    }
  };

  // Open Quick Add popup for a product
  const openQuickAdd = (p) => {
    setQuickProduct(p);
    setQuickQty(1);
    setQuickAddVisible(true);
  };

  // Confirm Quick Add
  const confirmQuickAdd = () => {
    if (!quickProduct) return;
    handleAdd(quickProduct, quickQty);
    setQuickAddVisible(false);
    setConfirmVisible(true);
    setTimeout(() => {
      setConfirmVisible(false);
      setQuickProduct(null);
      setQuickQty(1);
    }, 900); // auto-dismiss after 900ms
  };

  const handleViewCart = () => {
    navigation.navigate('POSCartSummary', {
      openingAmount,
      sessionId,
      registerId,
      registerName,
      userId,
      userName
    });
  };

  const renderItem = ({ item }) => {
    if (item.empty) return <View style={[styles.itemStyle, styles.itemInvisible]} />;
    return (
      <ProductsList
        item={item}
        onPress={() => { /* disabled */ }}
        showQuickAdd
        onQuickAdd={openQuickAdd}
      />
    );
  };

  const renderEmptyState = () => (
    <EmptyState imageSource={require('@assets/images/EmptyData/empty_data.png')} message={''} />
  );

  const renderContent = () => (
    <FlashList
      data={formatData(data, 3)}
      numColumns={3}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{ padding: 10, paddingBottom: 50 }}
      onEndReached={handleLoadMore}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.2}
      estimatedItemSize={100}
    />
  );

  const renderOrderLine = ({ item }) => {
    const qty = Number(item.qty ?? item.quantity ?? 1);
    const unit = Number(item.price_unit ?? item.price ?? 0);
    // price_subtotal_incl and price_subtotal are already line totals (qty × price_unit)
    // So we use them directly without multiplying by qty again
    const subtotal = (typeof item.price_subtotal_incl === 'number' && !isNaN(item.price_subtotal_incl))
      ? item.price_subtotal_incl
      : (typeof item.price_subtotal === 'number' && !isNaN(item.price_subtotal) 
          ? item.price_subtotal 
          : qty * unit);
    // Handlers for + and -
    const handleIncrease = async () => {
      const newQty = qty + 1;
      // If this line corresponds to an Odoo order line (id starts with 'odoo_line_'), update on server
      const orderId = route?.params?.orderId;
      if (orderId && String(item.id).startsWith('odoo_line_')) {
        // Optimistically update UI first
        addProduct({ ...item, quantity: newQty, qty: newQty });
        const lineId = Number(String(item.id).replace('odoo_line_', ''));
        try {
          const payload = { lineId, qty: newQty, price_unit: item.price_unit ?? item.price, orderId };
          console.log('[POSProducts] updateOrderLine payload:', payload);
          await updateOrderLineOdoo({ lineId, qty: newQty, price_unit: item.price_unit ?? item.price, orderId });
          // Only refresh from server if error, not after every success
        } catch (e) {
          console.error('Failed to update order line on Odoo:', e);
          Toast.show({ type: 'error', text1: 'Odoo Error', text2: 'Failed to update quantity' });
          // revert to server state
          try { await refreshServerOrder(orderId); } catch (_) {}
        }
      } else if (orderId && item.remoteId) {
        // Optimistically update UI
        addProduct({ ...item, quantity: newQty, qty: newQty });
        try {
          const payload = { orderId, productId: item.remoteId || item.id, qty: 1, price_unit: item.price_unit ?? item.price, name: item.name };
          console.log('[POSProducts] addLineToOrder (new) payload:', payload);
          await addLineToOrderOdoo(payload);
          // Only refresh from server if error
        } catch (e) {
          console.error('Failed to add new order line to Odoo:', e);
          Toast.show({ type: 'error', text1: 'Odoo Error', text2: 'Failed to add product to order' });
          try { await refreshServerOrder(orderId); } catch (_) {}
        }
      } else {
        addProduct({ ...item, quantity: newQty, qty: newQty });
      }
    };

    const handleDecrease = async () => {
      // Decrease locally and on server if necessary
      const orderId = route?.params?.orderId;
      if (orderId && String(item.id).startsWith('odoo_line_')) {
        const lineId = Number(String(item.id).replace('odoo_line_', ''));
        if (qty <= 1) {
          // Optimistically remove
          removeProduct(item.id);
          try {
            console.log('[POSProducts] removeOrderLine payload:', { lineId, orderId });
            await removeOrderLineOdoo({ lineId, orderId });
          } catch (e) {
            console.error('Failed to remove order line on Odoo:', e);
            Toast.show({ type: 'error', text1: 'Odoo Error', text2: 'Failed to remove product' });
          }
          // Always refresh after last product removed
          try { await refreshServerOrder(orderId); } catch (_) {}
        } else {
          const newQty = qty - 1;
          // Optimistically update
          addProduct({ ...item, quantity: newQty, qty: newQty });
          try {
            const payload = { lineId, qty: newQty, price_unit: item.price_unit ?? item.price, orderId };
            console.log('[POSProducts] updateOrderLine (decrease) payload:', payload);
            await updateOrderLineOdoo({ lineId, qty: newQty, price_unit: item.price_unit ?? item.price, orderId });
          } catch (e) {
            console.error('Failed to update order line on Odoo:', e);
            Toast.show({ type: 'error', text1: 'Odoo Error', text2: 'Failed to update quantity' });
            try { await refreshServerOrder(orderId); } catch (_) {}
          }
        }
      } else if (orderId && item.remoteId) {
        // item added locally but also present on server as product; decrease locally and remove/add line as needed
        if (qty <= 1) {
          removeProduct(item.id);
          // Always refresh after last product removed
          try { await refreshServerOrder(orderId); } catch (_) {}
        } else {
          const newQty = qty - 1;
          addProduct({ ...item, quantity: newQty, qty: newQty });
        }
      } else {
        if (qty <= 1) {
          removeProduct(item.id);
        }
        else addProduct({ ...item, quantity: qty - 1, qty: qty - 1 });
      }
    };
    return (
      <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700' }}>{item.name || item.product_id?.[1] || `Line ${item.id}`}</Text>
          <Text style={{ color: '#666' }}>{formatCurrency(unit).replace(/^\w+\s/, '')} each</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleDecrease} style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginHorizontal: 6, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>-</Text>
          </TouchableOpacity>
          <Text style={{ minWidth: 28, textAlign: 'center', fontWeight: '700', fontSize: 16 }}>{qty}</Text>
          <TouchableOpacity onPress={handleIncrease} style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginHorizontal: 6, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800' }}>+</Text>
          </TouchableOpacity>
          <Text style={{ fontWeight: '800', marginLeft: 12 }}>{formatCurrency(subtotal)}</Text>
        </View>
      </View>
    );
  };

  const renderRegisterPanel = () => {
    const cartItems = useProductStore((s) => s.getCurrentCart()) || [];
    // Compute total as sum of per-line totals directly.
    // price_subtotal_incl and price_subtotal are already line totals (qty × unit),
    // so do not multiply by quantity again.
    const total = cartItems.reduce((s, it) => {
      const itQty = Number(it.quantity ?? it.qty ?? 1);
      const itUnit = Number(it.price_unit ?? it.price ?? 0);
      const lineTotal = (typeof it.price_subtotal_incl === 'number' && !isNaN(it.price_subtotal_incl))
        ? it.price_subtotal_incl
        : (typeof it.price_subtotal === 'number' && !isNaN(it.price_subtotal)
            ? it.price_subtotal
            : (itQty * itUnit));
      return s + lineTotal;
    }, 0);
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', padding: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 6 }}>{route?.params?.registerName || 'Register'}</Text>
        <View style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => renderOrderLine({ item })}
            ListEmptyComponent={<Text style={{ color: '#666' }}>No items</Text>}
            contentContainerStyle={{ paddingBottom: 6 }}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 14, color: '#444' }}>Total</Text>
          <Text style={{ fontSize: 22, fontWeight: '800' }}>{formatCurrency(total)}</Text>
        </View>

        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <TouchableOpacity style={{ backgroundColor: '#f3f4f6', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, marginRight: 10, marginBottom: 10, minWidth: 110, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontWeight: '800', fontSize: 15 }}>{route?.params?.userName || 'John Doe'}</Text>
            </TouchableOpacity>
            {/* Note button removed */}

            {/* Single selector button for presets */}
            <TouchableOpacity
              onPress={() => setShowPresetModal(true)}
              style={{ backgroundColor: '#f3f4f6', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, marginRight: 10, marginBottom: 10, minWidth: 110, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ fontWeight: '800', fontSize: 15 }}>{selectedPreset ? selectedPreset.name : 'Order Type'}</Text>
            </TouchableOpacity>

            {/* Modal action sheet for picking preset */}
            <Modal visible={showPresetModal} transparent animationType="fade">
              <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setShowPresetModal(false)}>
                <View style={{ backgroundColor: '#fff', padding: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 8 }}>Select Order Type</Text>
                  <ScrollView style={{ maxHeight: 240 }}>
                    {presets && presets.length > 0 ? (
                      presets.map(preset => (
                        <TouchableOpacity
                          key={preset.id}
                          onPress={() => { setSelectedPreset(preset); setShowPresetModal(false); console.log('Selected preset:', preset); }}
                          style={{ padding: 12, borderRadius: 8, backgroundColor: selectedPreset && selectedPreset.id === preset.id ? '#e6f6ff' : '#fff', marginBottom: 8 }}
                        >
                          <Text style={{ fontSize: 15, fontWeight: '700' }}>{preset.name}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      ['Dine In', 'Takeaway', 'Delivery'].map((name, idx) => (
                        <TouchableOpacity
                          key={`builtin_${idx}`}
                          onPress={() => { const p = { id: `builtin_${idx}`, name }; setSelectedPreset(p); setShowPresetModal(false); console.log('Selected builtin preset:', p); }}
                          style={{ padding: 12, borderRadius: 8, backgroundColor: (selectedPreset && selectedPreset.name === name) ? '#e6f6ff' : '#fff', marginBottom: 8 }}
                        >
                          <Text style={{ fontSize: 15, fontWeight: '700' }}>{name}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                  <TouchableOpacity onPress={() => setShowPresetModal(false)} style={{ padding: 12, marginTop: 6, borderRadius: 8, backgroundColor: '#f3f4f6' }}>
                    <Text style={{ textAlign: 'center', fontWeight: '700' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <TouchableOpacity
              onPress={() => {
                const cartItems = useProductStore.getState().getCurrentCart() || [];
                if (!cartItems.length) {
                  Toast.show({ type: 'error', text1: 'No items', text2: 'No items to bill.' });
                  return;
                }
                // Prepare items for preview
                const items = cartItems.map(it => {
                  const qty = Number(it.quantity ?? it.qty ?? 1);
                  const unit = Number(it.price_unit ?? it.price ?? 0);
                  const lineTotal = (typeof it.price_subtotal_incl === 'number' && !isNaN(it.price_subtotal_incl))
                    ? it.price_subtotal_incl
                    : (typeof it.price_subtotal === 'number' && !isNaN(it.price_subtotal)
                        ? it.price_subtotal
                        : qty * unit);
                  return {
                    id: String(it.id),
                    qty,
                    name: it.name || (Array.isArray(it.product_id) ? it.product_id[1] : 'Product'),
                    unit,
                    subtotal: lineTotal,
                  };
                });
                const subtotal = items.reduce((s, it) => s + (it.subtotal || 0), 0);
                const tax = +(subtotal * 0.00).toFixed(2);
                const service = +(subtotal * 0.00).toFixed(2);
                const total = +(subtotal + tax + service).toFixed(2);
                // Try to get table name from orderInfo if available
                const tableName = orderInfo?.table_id?.[1] || '';
                navigation.navigate('CreateInvoicePreview', {
                  items,
                  subtotal,
                  tax,
                  service,
                  total,
                  orderId: null,
                  invoiceNumber: null,
                  tableName,
                });
              }}
              style={{ backgroundColor: '#f3f4f6', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center' }}
            >
              <Text style={{ fontWeight: '800' }}>Create Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              // Ensure we always pass a valid orderId: prefer route param, fallback to loaded order info
              const orderId = route?.params?.orderId || orderInfo?.id;
              const tableName = orderInfo?.table_id?.[1] || '';
              const orderName = orderInfo?.name || '';
              const cartOwner = route?.params?.cartOwner || (orderId ? `order_${orderId}` : 'pos_guest');
              navigation.navigate('KitchenBillPreview', {
                orderId,
                orderName,
                tableName,
                serverName: route?.params?.userName || '',
                items: cartItems,
                cartOwner,
                order_type: route?.params?.order_type,
              });
            }} style={{ backgroundColor: '#f3f4f6', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ fontWeight: '800' }}>Kitchen Bill</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderProducts = () => {
    const productsRaw = posFilteredProducts !== null ? posFilteredProducts : data;
    const loadingFlag = posFilteredProducts !== null ? posFilteredLoading : loading;
    // If user has typed a search, filter across the full product dataset (`data`)
    // so results are independent of the selected POS category.
    let productsToShow;
    if (searchText && String(searchText).trim()) {
      const baseList = Array.isArray(data) ? data : productsRaw;
      productsToShow = Array.isArray(baseList) ? baseList.filter(p => {
        const name = String(p.product_name || p.name || '').toLowerCase();
        return name.includes(String(searchText).toLowerCase());
      }) : baseList;
    } else {
      productsToShow = productsRaw;
    }
    if ((!productsToShow || productsToShow.length === 0) && !loadingFlag) return renderEmptyState();
    const onEndReachedHandler = posFilteredProducts !== null ? undefined : handleLoadMore;
    return (
      <FlashList
        data={formatData(productsToShow, 3)}
        numColumns={3}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 10, paddingBottom: 50 }}
        onEndReached={onEndReachedHandler}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.2}
        estimatedItemSize={100}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationHeader title="Register" onBackPress={handleMainBack} />
      <OverlayLoader visible={backLoading} />
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        {renderRegisterPanel()}

        {/* Add Products button: open in-place POS products modal */}
        <View style={{ paddingVertical: 8 }}>
          <Button title="Add Products" onPress={() => setShowProducts(true)} />
        </View>
        {/* In-place full-screen products modal for POS quick-add */}
        <Modal visible={showProducts} animationType="slide" onRequestClose={() => setShowProducts(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <NavigationHeader title="Products" onBackPress={handleCloseProducts} />
            {/* Search bar for filtering products */}
            <SearchContainer placeholder="Search Products" onChangeText={handleSearchTextChange} />
            {/* Category bar for POS modal */}
            <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6 }}>
                {/* Show All option */}
                <TouchableOpacity onPress={() => setSelectedPosCategoryId(null)} style={{ marginRight: 8 }}>
                  <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: selectedPosCategoryId === null ? (COLORS.primaryThemeColor || '#7c3aed') : '#f3f4f6' }}>
                    <Text style={{ color: selectedPosCategoryId === null ? '#fff' : '#111', fontWeight: '700' }}>Show All</Text>
                  </View>
                </TouchableOpacity>
                {posCategories && posCategories.length > 0 ? (
                  posCategories.map(cat => {
                    const id = cat.id || (Array.isArray(cat) ? cat[0] : null);
                    const name = cat.name || (Array.isArray(cat) ? cat[1] : '');
                    const selected = Number(id) === Number(selectedPosCategoryId);
                    return (
                      <TouchableOpacity key={String(id)} onPress={() => setSelectedPosCategoryId(id)} style={{ marginRight: 8 }}>
                        <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: selected ? (COLORS.primaryThemeColor || '#7c3aed') : '#f3f4f6' }}>
                          <Text style={{ color: selected ? '#fff' : '#111', fontWeight: '700' }}>{name}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={{ color: '#666' }}>No categories</Text>
                )}
              </ScrollView>
            </View>
            {/* Search column removed as requested */}
            <RoundedContainer style={{ flex: 1 }}>
              {renderProducts()}
            </RoundedContainer>
            <OverlayLoader visible={(posFilteredProducts !== null ? posFilteredLoading : loading) || backLoading} />

            {/* Quick Add popup inside the Products modal */}
            <Modal visible={quickAddVisible} transparent animationType="fade" onRequestClose={() => setQuickAddVisible(false)}>
              <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setQuickAddVisible(false)}>
                <Pressable style={{ width: '88%', backgroundColor: '#fff', borderRadius: 12, padding: 16 }} onPress={(e) => e.stopPropagation()}>
                  <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 8 }}>Add Item</Text>
                  <Text style={{ fontSize: 14, marginBottom: 12, color: '#374151' }}>{quickProduct?.product_name || quickProduct?.name || 'Product'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700' }}>Quantity</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Animated.View style={{
                        transform: [{ scale: minusScale }],
                        marginRight: 8,
                      }}>
                        <TouchableOpacity
                          onPressIn={() => {
                            animateButton(minusScale, 0.92);
                            setQuickQty(prev => Math.max(1, prev - 1));
                          }}
                          onPressOut={() => animateButton(minusScale, 1)}
                          style={{
                            backgroundColor: '#f3f4f6',
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 8,
                          }}
                        >
                          <Text style={{ fontSize: 28, fontWeight: '800', color: '#111' }}>-</Text>
                        </TouchableOpacity>
                      </Animated.View>
                      <Text style={{ minWidth: 32, textAlign: 'center', fontWeight: '700', fontSize: 18, transitionDuration: '120ms' }}>{quickQty}</Text>
                      <Animated.View style={{
                        transform: [{ scale: plusScale }],
                        marginLeft: 8,
                      }}>
                        <TouchableOpacity
                          onPressIn={() => {
                            animateButton(plusScale, 0.92);
                            setQuickQty(prev => prev + 1);
                          }}
                          onPressOut={() => animateButton(plusScale, 1)}
                          style={{
                            backgroundColor: '#f3f4f6',
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 8,
                          }}
                        >
                          <Text style={{ fontSize: 28, fontWeight: '800', color: '#111' }}>+</Text>
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                  </View>
                  <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity onPress={() => setQuickAddVisible(false)} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#f3f4f6', marginRight: 10 }}>
                      <Text style={{ fontWeight: '700' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmQuickAdd} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: COLORS.primary || '#111827' }}>
                      <Text style={{ color: '#fff', fontWeight: '800' }}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>

            {/* Confirmation popup after add */}
            <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
              <Pressable pointerEvents="box-none" style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                <Pressable style={{ width: '76%', backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 6 }}>Added to Cart</Text>
                  <Text style={{ fontSize: 14, color: '#374151', marginBottom: 12 }}>{quickProduct?.product_name || quickProduct?.name || 'Product'} × {quickQty}</Text>
                </Pressable>
              </Pressable>
            </Modal>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default POSProducts;
