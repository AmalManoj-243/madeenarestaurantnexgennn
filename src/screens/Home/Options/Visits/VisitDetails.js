import { View, Text, Image } from 'react-native'
import React, { useEffect } from 'react'
import { RoundedScrollContainer, SafeAreaView } from '@components/containers'
import { NavigationHeader } from '@components/Header'
import { DetailField } from '@components/common/Detail'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { COLORS } from '@constants/theme'
import { formatDateTime } from '@utils/common/date'
import { showToastMessage } from '@components/Toast'

const VisitDetails = ({ navigation, route }) => {

const details = route?.params?.visitDetails

const customerContacts = details?.customer_contact?.map(contact => ({
  name: contact.contact_name,
  no: contact.contact_number,
})) ?? [];

const contactNames = customerContacts.map(contact => contact.name).join(', ');
const contactNo = customerContacts.map(contact => contact.no).join(', ');

const visitPuposes = details.purpose_of_visit.map(visit => visit.name).join(", ");

const handleMapIconPress = () => {
  if (details && details.longitude && details.latitude) {
      const { latitude, longitude } = details
      navigation.navigate('MapViewScreen', { latitude, longitude });
  } else {
      // Handle case when latitude and longitude are not available
      showToastMessage('The visit does not have location details')
  }
};


return (
    <SafeAreaView>
      <NavigationHeader
        title="Customer Visits Details"
        onBackPress={() => navigation.goBack()}
        // icon
        // iconName="edit"
        // iconPress={()=> navigation.navigate('EditVisit', {details})}
        logo={false}
      />
      <RoundedScrollContainer>
        <TouchableOpacity onPress={handleMapIconPress} activeOpacity={0.7}>
          <Image style={{ alignSelf: 'flex-end', height: 35, width: 30, tintColor: COLORS.orange, marginBottom: 15 }} source={require('@assets/icons/common/map_icon.png')} />
        </TouchableOpacity>
        <DetailField
          label={'Date & Time'}
          value={formatDateTime(details.date_time)}
        />
        <DetailField
          label={'Customer Name'}
          value={details?.customer?.name?.trim()}
          multiline={true}
        />
        <DetailField
          label={'Site / Location'}
          value={details?.site_location?.site_location_name}
        />
        <DetailField
          label={'Contact Person'}
          value={contactNames || '-'}
          />
        <DetailField
          label={'Contact No'}
          value={contactNo || '-'}
        />
        <DetailField
          label={'Visit Purpose'}
          value={visitPuposes|| '-'}
        />
        <DetailField
          label={'Remarks'}
          multiline={true}
          value={details?.remarks|| '-'}
          numberOfLines={5}
        />
      </RoundedScrollContainer>
    </SafeAreaView>
  )
}

export default VisitDetails