import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { useState } from 'react';
import UpdateDetail from './UpdateDetail';
import FollowUp from './FollowUp';
import { SafeAreaView } from '@components/containers';
import NavigationHeader from '@components/Header/NavigationHeader';
import { CustomTabBar } from '@components/TabBar';
import { useRoute } from '@react-navigation/native';

const UpdateDetailTabs = ({ navigation }) => {
  const route = useRoute();
  const { id, details } = route.params || {};
  console.log('Service ID:', id);
  console.log('Details:', details);

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Update Details' },
    { key: 'second', title: 'Follow Up' },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'first':
        return <UpdateDetail serviceId={id} details={details} />;
      case 'second':
        return <FollowUp serviceId={id} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationHeader
        title="Update Details"
        onBackPress={() => navigation.goBack()}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={props => <CustomTabBar {...props} scrollEnabled={false} />}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

export default UpdateDetailTabs;
