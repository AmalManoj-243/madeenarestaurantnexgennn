import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { useState } from 'react';
import Details from './Details';
import FollowUp from './FollowUp';
import { SafeAreaView } from '@components/containers';
import NavigationHeader from '@components/Header/NavigationHeader';
import { CustomTabBar } from '@components/TabBar';

const ServiceDetailTabs = ({ navigation, route }) => {
  const { id } = route?.params || {};
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Details' },
    { key: 'second', title: 'Follow Up' },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'first':
        return <Details serviceId={id} />;
      case 'second':
        return <FollowUp serviceId={id} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView>
      <NavigationHeader
        title="Service Details"
        onBackPress={() => navigation.goBack()}
        logo={false}
        iconTwoName="plus"
        iconTwoPress={() => { navigation.navigate('ServiceFormTabs', { serviceId: id }) }}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={props => <CustomTabBar {...props} scrollEnabled={false} />}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </SafeAreaView>
  );
};

export default ServiceDetailTabs;