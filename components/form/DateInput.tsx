import { useColors } from '@/config/colors';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

import AppText from '@/components/ui/AppText';
interface DateInputProps {
    name: string;
    label: string;
    value: string;
    onChange: (date: string) => void;
    onBlur?: () => void;
    required?: boolean;
    min?: string;
    max?: string;
}

const DateInput = ({
    name,
    label,
    value,
    onChange,
    onBlur,
    required = false,
    min,
    max,
}: DateInputProps) => {
    const colors = useColors();
    const [showPicker, setShowPicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputId = `date-input-${name}`;

    const dateValue = value ? new Date(value) : new Date();
    const minDate = min ? new Date(min) : undefined;
    const maxDate = max ? new Date(max) : undefined;

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            onChange(selectedDate.toISOString().split('T')[0]);
        }

        if (event.type === 'dismissed') {
            setShowPicker(false);
        }
    };

    const handlePress = () => {
        setShowPicker(true);
        setIsFocused(true);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Select a date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <View className="w-full">
            <AppText
                className="mb-2 text-base font-nunbold"
                style={{ color: colors.textPrimary }}
                nativeID={`${inputId}-label`}
            >
                {label}
                {required && <AppText style={{ color: colors.accent }}> *</AppText>}
            </AppText>

            <TouchableOpacity
                onPress={handlePress}
                onBlur={() => {
                    setIsFocused(false);
                    onBlur?.();
                }}
                activeOpacity={0.7}
            >
                <View
                    className="w-full h-12 px-4 rounded-xl flex-row items-center justify-between"
                    style={{
                        backgroundColor: colors.backgroundAlt,
                        borderWidth: 2,
                        borderColor: isFocused ? colors.accent : colors.border,
                    }}
                >
                    <AppText
                        className="text-base font-nunmedium"
                        style={{ color: value ? colors.textPrimary : colors.textSecondary }}
                    >
                        {formatDate(value)}
                    </AppText>
                    <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={isFocused ? colors.accent : colors.textSecondary}
                    />
                </View>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={dateValue}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={minDate}
                    maximumDate={maxDate}
                    themeVariant="light"
                />
            )}
        </View>
    );
};

export default DateInput;
