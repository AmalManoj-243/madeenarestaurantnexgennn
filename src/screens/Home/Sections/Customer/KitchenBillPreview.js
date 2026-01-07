import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform, StatusBar, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationHeader } from '@components/Header';
import { COLORS } from '@constants/theme';
import { printAndShareReceipt } from '@print/printReceipt';
// ...existing code...
import { buildKitchenBillHtml } from '@utils/printing/kitchenBillHtml';
import AsyncStorage from '@react-native-async-storage/async-storage';
import kotService from '@api/services/kotService';
import { addLineToOrderOdoo, fetchPosOrderById, fetchOrderLinesByIds } from '@api/services/generalApi';
import useKitchenTickets from '@stores/kitchen/ticketsStore';

const KitchenBillPreview = ({ navigation, route }) => {
  const { items = [], orderId, orderName = '', tableName = '', serverName = '', order_type = null, cartOwner = null } = route?.params || {};
  const [printing, setPrinting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [resolvedUserName, setResolvedUserName] = useState(serverName);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewMode, setPreviewMode] = useState('full');
  const getDelta = useKitchenTickets((s) => s.getDelta);
  const setSnapshot = useKitchenTickets((s) => s.setSnapshot);
  // Subscribe to the snapshot for this order so delta list reacts after printing
  const snapshot = useKitchenTickets((s) => (orderId ? (s.snapshots[orderId] || {}) : (cartOwner ? (s.snapshots[cartOwner] || {}) : {})));

  // For TAKEAWAY flows where there is no prior printed snapshot, initialize snapshot
  // to current items so "Add-ons since last print" is empty by default (like dine-in)
  React.useEffect(() => {
    // resolve logged-in user's display name for server/cashier if available
    (async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        const ud = userDataStr ? JSON.parse(userDataStr) : null;
        const name = ud?.related_profile?.name || ud?.user_name || ud?.name || serverName || '';
        if (name) setResolvedUserName(name);
      } catch (e) {
        console.warn('Could not resolve user name for kitchen bill', e);
      }
    })();

    const snapshotKey = orderId || cartOwner || null;
    if (String(order_type).toUpperCase() === 'TAKEAWAY' && snapshotKey && Object.keys(snapshot || {}).length === 0 && Array.isArray(items) && items.length > 0) {
      try {
        setSnapshot(snapshotKey, items);
        console.log('Initialized snapshot for TAKEAWAY:', snapshotKey);
      } catch (e) {
        console.warn('Failed to initialize snapshot for TAKEAWAY', e);
      }
    }
  }, [orderId, cartOwner, order_type, items]);

  const mapped = useMemo(() => items.map((it) => ({
    id: String(it.id ?? `${it.name}`),
    name: it.name || it.product_id?.[1] || 'Item',
    qty: Number(it.quantity ?? it.qty ?? 1),
    note: it.note || '',
  })), [items]);

  const deltaItems = useMemo(() => {
    const snapshotKey = orderId || cartOwner || null;
    if (!snapshotKey) {
      // If this is a TAKEAWAY flow and no snapshot exists, treat as no addons
      if (String(order_type || '').toUpperCase() === 'TAKEAWAY') return [];
      return mapped;
    }
    const delta = getDelta(snapshotKey, items);
    return delta.map((it) => ({
      id: String(it.id ?? `${it.name}`),
      name: it.name || it.product_id?.[1] || 'Item',
      qty: Number(it.quantity ?? it.qty ?? 1),
      note: it.note || '',
    }));
  }, [orderId, cartOwner, order_type, items, mapped, snapshot]);

  // Resolve productId from item structure
  const resolveProductId = (it) => {
    if (Array.isArray(it.product_id) && Number.isInteger(it.product_id[0])) return it.product_id[0];
    if (Number.isInteger(it.remoteId)) return it.remoteId;
    if (typeof it.id === 'number') return it.id;
    return null; // allow name-only lines if product not resolvable
  };

  // Ensure server pos.order has all current cart lines/quantities before printing
  const ensureOrderSynced = async () => {
    if (!orderId) return; // local-only order
    try {
      const orderResp = await fetchPosOrderById(orderId);
      const lineIds = orderResp?.result?.lines || [];
      let serverLines = [];
      if (lineIds.length) {
        const linesResp = await fetchOrderLinesByIds(lineIds);
        serverLines = linesResp?.result || [];
      }
      const serverQtyByProduct = {};
      serverLines.forEach((l) => {
        const pid = Array.isArray(l.product_id) ? l.product_id[0] : l.product_id;
        const qty = Number(l.qty || 0);
        if (pid) serverQtyByProduct[pid] = (serverQtyByProduct[pid] || 0) + qty;
      });

      // Desired quantities from current items
      const desiredQtyByProduct = {};
      items.forEach((it) => {
        const pid = resolveProductId(it);
        const qty = Number(it.quantity ?? it.qty ?? 1);
        if (pid) desiredQtyByProduct[pid] = (desiredQtyByProduct[pid] || 0) + qty;
      });

      // Add delta on server for missing quantities
      const productsIndex = {}; // for price/name
      items.forEach((it) => {
        const pid = resolveProductId(it);
        if (pid && !productsIndex[pid]) productsIndex[pid] = it;
      });

      const additions = [];
      Object.keys(desiredQtyByProduct).forEach((pidStr) => {
        const pid = Number(pidStr);
        const desired = desiredQtyByProduct[pid] || 0;
        const have = serverQtyByProduct[pid] || 0;
        const delta = desired - have;
        if (delta > 0) additions.push({ pid, delta });
      });

      for (const add of additions) {
        const template = productsIndex[add.pid] || {};
        const priceUnit = Number(template.price_unit ?? template.price ?? 0);
        const name = template.name || (Array.isArray(template.product_id) ? template.product_id[1] : 'Item');
        await addLineToOrderOdoo({ orderId, productId: add.pid, qty: add.delta, price_unit: priceUnit, name });
      }
    } catch (e) {
      console.warn('ensureOrderSynced failed; proceeding to print anyway:', e);
    }
  };

  const handleShowPreview = ({ deltaOnly = true } = {}) => {
    console.log('KitchenBillPreview: show preview', { deltaOnly, orderId, orderName, tableName });
    const list = deltaOnly ? (deltaItems.length ? deltaItems : mapped) : mapped;
    const html = buildKitchenBillHtml({
      restaurant: 'My Restaurant',
      orderName: orderName,
      orderId: orderId || null,
      tableName,
      serverName: resolvedUserName,
      items: list,
      order_type,
      mode: deltaOnly ? 'addons' : 'full',
    });
    setPreviewHtml(html);
    setPreviewMode(deltaOnly ? 'addons' : 'full');
    setPreviewVisible(true);
  };

  // Setup KOT service with session info from AsyncStorage
  useEffect(() => {
    const setupKot = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        const userData = userDataStr ? JSON.parse(userDataStr) : {};
        const db = await AsyncStorage.getItem('odoo_db');
        // You may want to store printerIp/printerPort in config/constants or user settings
        kotService.setup({
          odooUrl: 'http://192.168.100.175:8079', // or use config
          database: db || 'nexgenn-restaurant',
          uid: userData.uid,
          password: userData.password || 'admin',
          printerIp: '192.168.100.233', // set your printer IP
          printerPort: 9100,
        });
      } catch (e) {
        console.warn('Failed to setup KOT service:', e);
      }
    };
    setupKot();
  }, []);

  // Replace print logic to use kotService.printKot
  const handlePrintFromPreview = async () => {
    setPrinting(true);
    try {
      console.log('KitchenBillPreview: Print clicked', { previewMode, orderId, itemsCount: (previewMode === 'addons' ? deltaItems.length : mapped.length) });
      // Resolve waiter/cashier name from logged-in user if available
      let resolvedUserName = serverName;
      try {
        const userDataStr = await AsyncStorage.getItem('userData');
        const ud = userDataStr ? JSON.parse(userDataStr) : null;
        resolvedUserName = ud?.related_profile?.name || ud?.user_name || ud?.name || serverName || resolvedUserName;
      } catch (e) {
        console.warn('Could not read userData for KOT cashier resolution', e);
      }

      // Prepare KOT data
      const isTakeaway = String(order_type || '').toUpperCase() === 'TAKEAWAY' || String(order_type || '').toUpperCase() === 'TAKEOUT';
      const kotData = {
        table_name: tableName,
        order_name: orderName,
        order_id: orderId || null,
        cashier: resolvedUserName,
        // Ensure order_type is the friendly label 'Takeout' for takeaway flows
        order_type: isTakeaway ? 'Takeout' : (order_type ? String(order_type) : undefined),
        order_type_label: isTakeaway ? 'Takeout' : (order_type ? (String(order_type).charAt(0).toUpperCase() + String(order_type).slice(1).toLowerCase()) : undefined),
        // additional fields: order_number (friendly), guest_count, waiter, print_type
        order_number: orderName || (orderId ? String(orderId) : undefined),
        guest_count: route?.params?.guest_count ?? 0,
        waiter: resolvedUserName,
        print_type: previewMode === 'addons' ? 'ADDON' : 'NEW',
        items: (previewMode === 'addons' ? deltaItems : mapped).map((it) => ({
          name: it.name,
          qty: it.qty,
          note: it.note || '',
        })),
      };
      console.log('KitchenBillPreview: KOT payload', kotData);
      // Record snapshot now so future addons are computed from this point
      // Use `orderId` when available, otherwise fall back to `cartOwner` (e.g., pos_guest)
      const snapshotKey = orderId || cartOwner || null;
      if (snapshotKey) {
        console.log('KitchenBillPreview: setting snapshot before print for', snapshotKey);
        setSnapshot(snapshotKey, items);
      }
      const result = await kotService.printKot(kotData);
      console.log('KitchenBillPreview: KOT result', result);
      if (result && result.success !== false) {
        setPreviewVisible(false);
        Alert.alert('KOT Printed', 'Kitchen Order Ticket sent to printer.');
      } else {
        Alert.alert('Print error', result?.error || 'Failed to print KOT');
      }
    } catch (e) {
      Alert.alert('Print error', e.message || 'Failed to print KOT');
    } finally {
      setPrinting(false);
    }
  };

  const renderLine = ({ item }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ fontWeight: '700' }}>{item.qty} x {item.name}</Text>
      {item.note ? <Text style={{ color: '#6b7280' }}>{item.note}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['top', 'left', 'right']}>
      <View style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0 }}>
        <NavigationHeader title="Kitchen Bill" onBackPress={() => navigation.goBack()} />
      </View>
      <View style={{ padding: 16 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '800' }}>Order: {orderName || ''}</Text>
          {orderId ? <Text style={{ color: '#6b7280', marginTop: 4 }}>Order ID: #{orderId}</Text> : null}
          {tableName ? <Text style={{ color: '#6b7280', marginTop: 4 }}>Table: {tableName}</Text> : null}
          {resolvedUserName ? <Text style={{ color: '#6b7280', marginTop: 4 }}>Server: {resolvedUserName}</Text> : null}
        </View>
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>
          <Text style={{ fontWeight: '800', marginBottom: 8 }}>Add-ons since last print</Text>
          <FlatList data={deltaItems} keyExtractor={(i) => `d_${i.id}`} renderItem={renderLine}
            ListEmptyComponent={<Text style={{ color: '#6b7280' }}>No new items. Printing will include all items.</Text>} />
          <View style={{ height: 8 }} />
          <Text style={{ fontWeight: '800', marginBottom: 8 }}>Full order</Text>
          <FlatList data={mapped} keyExtractor={(i) => i.id} renderItem={renderLine} />
        </View>
        <View style={{ marginTop: 12 }}>
          <TouchableOpacity disabled={printing} onPress={() => handleShowPreview({ deltaOnly: true })} style={{ backgroundColor: COLORS.primary || '#111827', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>{printing ? 'Printing…' : 'Print Add-ons Only'}</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={printing} onPress={() => handleShowPreview({ deltaOnly: false })} style={{ backgroundColor: '#4b5563', paddingVertical: 14, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>{printing ? 'Printing…' : 'Print Full Order'}</Text>
          </TouchableOpacity>

          {/* Receipt Preview Modal */}
          <Modal visible={previewVisible} animationType="slide" onRequestClose={() => setPreviewVisible(false)}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
              <View style={{ flex: 1 }}>
                <WebView originWhitelist={["*"]} source={{ html: previewHtml }} style={{ flex: 1 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 16 }}>
                <TouchableOpacity onPress={() => setPreviewVisible(false)} style={{ backgroundColor: '#ccc', padding: 14, borderRadius: 8, minWidth: 100, alignItems: 'center' }}>
                  <Text style={{ fontWeight: '800' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePrintFromPreview} disabled={printing} style={{ backgroundColor: COLORS.primary || '#111827', padding: 14, borderRadius: 8, minWidth: 100, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>{printing ? 'Printing…' : 'Print'}</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Modal>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KitchenBillPreview;
