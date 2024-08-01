import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FABButton } from '@components/common/Button';
import { RoundedContainer } from '@components/containers';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchVisitPlanDetails } from '@api/details/detailApi';

const CustomerVisit = ({ pipelineId }) => {
    const navigation = useNavigation();
    const [visitDetails, setVisitDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchVisitDetails = async () => {
        setIsLoading(true);
        try {
            const [details] = await fetchVisitPlanDetails(pipelineId);
            setVisitDetails(details);
        } catch (error) {
            console.error('Error fetching visit details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchVisitDetails();
        }, [pipelineId])
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <RoundedContainer style={styles.container}>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : (
                    visitDetails && (
                        <View>
                            <Text>Customer: {visitDetails.customer_name}</Text>
                            <Text>Date and Time: {visitDetails.visit_date}</Text>
                            <Text>Contact Person: {visitDetails.contact_person_name}</Text>
                            <Text>Visit Purpose: {visitDetails.purpose_of_visit_name}</Text>
                            <Text>Remarks: {visitDetails.remarks}</Text>
                        </View>
                    )
                )}
                <FABButton
                    onPress={() => navigation.navigate('PipelineVisitForm', { pipelineId: pipelineId })}
                    style={styles.fabButton}
                />
            </RoundedContainer>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
});

export default CustomerVisit;
