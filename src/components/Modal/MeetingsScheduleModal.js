import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '@components/Text';
import Modal from 'react-native-modal';
import { Button } from '@components/common/Button';
import Icon from 'react-native-vector-icons/FontAwesome';
import { COLORS, FONT_FAMILY } from '@constants/theme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import format from 'date-fns/format';
import { CheckBox } from '@components/common/CheckBox';
import { NavigationHeader } from '@components/Header';

const MeetingsScheduleModal = ({ isVisible, onClose, onSave, title, header = '', placeholder }) => {
    const [formState, setFormState] = useState({
        meeting: '',
        meetingDate: new Date(),
        meetingTime: new Date(),
        isDatePickerVisible: false,
        isTimePickerVisible: false,
        isReminder: false,
        reminderMinutes: 0,
        errorText: ''
    });

    const handleInputChange = (name, value) => {
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };
    console.log("🚀 ~ file: MeetingsScheduleModal.js:45 ~ MeetingsScheduleModal ~ formState:", formState)

    const handleSave = () => {
        const { meeting, meetingDate, meetingTime, isReminder, reminderMinutes } = formState;
        let hasError = false;

        if (!meeting) {
            handleInputChange('errorText', 'Meeting title is required');
            hasError = true;
        }

        if (!meetingDate) {
            handleInputChange('errorText', 'Start time is required');
            hasError = true;
        }

        if (!hasError) {
            onSave({
                title: meeting,
                date: meetingDate,
                time: meetingTime,
                is_Remainder: isReminder,
                minutes: isReminder ? reminderMinutes : 0,
                type: 'CRM',
            });
            resetForm();
            onClose();
        }
    };

    const resetForm = () => {
        setFormState({
            meeting: '',
            meetingDate: new Date(),
            meetingTime: new Date(),
            isDatePickerVisible: false,
            isTimePickerVisible: false,
            isReminder: false,
            reminderMinutes: 0,
            errorText: ''
        });
    };

    const { meeting, meetingDate, meetingTime, isDatePickerVisible, isTimePickerVisible, isReminder, reminderMinutes, errorText } = formState;

    return (
        <Modal
            isVisible={isVisible}
            animationIn="bounceIn"
            animationOut="slideOutDown"
            backdropOpacity={0.7}
            animationInTiming={400}
            animationOutTiming={300}
            backdropTransitionInTiming={400}
            backdropTransitionOutTiming={300}
        >
            <View style={styles.modalContainer}>
                <NavigationHeader onBackPress={onClose} title={title} />
                <View style={styles.modalContent}>
                    <Text style={styles.label}>{title}</Text>
                    <TextInput
                        placeholder={placeholder}
                        value={meeting}
                        onChangeText={(text) => handleInputChange('meeting', text)}
                        style={[styles.textInput, errorText && styles.textInputError]}
                    />
                    {errorText ? (
                        <View style={styles.errorContainer}>
                            <Icon name="error" size={20} color="red" />
                            <Text style={styles.errorText}>{errorText}</Text>
                        </View>
                    ) : null}
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>Enter Date:</Text>
                        <View style={[styles.textInput, { flexDirection: "row", justifyContent: 'space-between' }]}>
                            <Text style={{ marginRight: 20 }}>
                                {meetingDate ? format(meetingDate, "dd-MM-yyyy") : 'Select Date'}
                            </Text>
                            <TouchableOpacity onPress={() => handleInputChange('isDatePickerVisible', true)}>
                                <Icon name="calendar" size={25} color='#2e294e' />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        date={meetingDate}
                        onConfirm={(date) => {
                            handleInputChange('meetingDate', date);
                            handleInputChange('isDatePickerVisible', false);
                        }}
                        onCancel={() => handleInputChange('isDatePickerVisible', false)}
                    />
                    <View style={styles.inputRow}>
                        <Text style={styles.label}>Enter Time:</Text>
                        <View style={[styles.textInput, { flexDirection: "row", justifyContent: 'space-between' }]}>
                            <Text style={{ marginRight: 20 }}>
                                {meetingTime ? format(meetingTime, "HH:mm:ss") : 'Select Time'}
                            </Text>
                            <TouchableOpacity onPress={() => handleInputChange('isTimePickerVisible', true)}>
                                <Icon name="clock-o" size={25} color='#2e294e' />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <DateTimePickerModal
                        isVisible={isTimePickerVisible}
                        mode="time"
                        date={meetingTime}
                        onConfirm={(time) => {
                            handleInputChange('meetingTime', time);
                            handleInputChange('isTimePickerVisible', false);
                        }}
                        onCancel={() => handleInputChange('isTimePickerVisible', false)}
                    />
                    <View style={styles.checkboxContainer}>
                        <Text style={styles.checkboxLabel}>Set Reminder</Text>
                        <CheckBox checked={isReminder} onPress={(value) => handleInputChange('isReminder', value)} />
                    </View>
                    {isReminder && (
                        <TextInput
                            placeholder={reminderMinutes === 0 ? 'Enter reminder minutes' : ''}
                            value={reminderMinutes === 0 ? '' : reminderMinutes.toString()}
                            onChangeText={(text) => handleInputChange('reminderMinutes', parseInt(text) || 0)}
                            keyboardType="numeric"
                            style={styles.textInput}
                        />
                    )}
                    <View style={styles.buttonRow}>
                        <View style={{ flex: 2 }}>
                            <Button title="CANCEL" onPress={onClose} />
                        </View>
                        <View style={{ width: 10 }} />
                        <View style={{ flex: 2 }}>
                            <Button title="SAVE" onPress={handleSave} />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '100%',
    },
    textInput: {
        borderWidth: 1,
        borderColor: 'gray',
        marginBottom: 10,
        padding: 10,
        fontFamily: FONT_FAMILY.urbanistSemiBold,
        borderRadius: 5,
    },
    textInputError: {
        borderColor: 'red',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        marginLeft: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        flex: 1,
        textAlign: 'left',
        fontSize: 17,
        color: COLORS.primaryThemeColor,
        fontFamily: FONT_FAMILY.urbanistSemiBold,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxLabel: {
        fontSize: 17,
        color: COLORS.primaryThemeColor,
        fontFamily: FONT_FAMILY.urbanistSemiBold,
    },
});

export default MeetingsScheduleModal;
