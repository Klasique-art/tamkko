import { useColors } from '@/config/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';

import AppText from '@/components/ui/AppText';
type Option = { value: string; label: string };

interface SelectInputProps {
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    options: Option[];
    required?: boolean;
    placeholder?: string;
}

const SelectInput = ({
    name,
    label,
    value,
    onChange,
    onBlur,
    options,
    required = false,
    placeholder = 'Select an option',
}: SelectInputProps) => {
    const colors = useColors();
    const [showPicker, setShowPicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputId = `select-input-${name}`;

    const selectedOption = options.find((opt) => opt.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setShowPicker(false);
        setIsFocused(false);
        onBlur?.();
    };

    const handlePress = () => {
        setShowPicker(true);
        setIsFocused(true);
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
                        className="text-base font-nunmedium flex-1"
                        style={{ color: value ? colors.textPrimary : colors.textSecondary }}
                        numberOfLines={1}
                    >
                        {displayText}
                    </AppText>
                    <Ionicons
                        name={showPicker ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={isFocused ? colors.accent : colors.textSecondary}
                    />
                </View>
            </TouchableOpacity>

            <Modal
                visible={showPicker}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setShowPicker(false);
                    setIsFocused(false);
                    onBlur?.();
                }}
            >
                <TouchableOpacity
                    className="flex-1 justify-center items-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                    activeOpacity={1}
                    onPress={() => {
                        setShowPicker(false);
                        setIsFocused(false);
                        onBlur?.();
                    }}
                >
                    <View
                        className="w-11/12 max-h-96 rounded-2xl overflow-hidden"
                        style={{
                            backgroundColor: colors.background,
                            borderWidth: 2,
                            borderColor: colors.accent,
                        }}
                        onStartShouldSetResponder={() => true}
                    >
                        {/* Header */}
                        <View
                            className="px-4 py-3 border-b"
                            style={{
                                backgroundColor: colors.accent,
                                borderBottomColor: colors.border,
                            }}
                        >
                            <AppText className="text-lg font-nunbold">
                                {label}
                            </AppText>
                        </View>

                        {/* Options List */}
                        <ScrollView className="max-h-80">
                            {options.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => handleSelect(option.value)}
                                        className="px-4 py-4 border-b flex-row items-center justify-between"
                                        style={{
                                            backgroundColor: isSelected
                                                ? colors.accent50
                                                : colors.background,
                                            borderBottomColor: colors.border,
                                        }}
                                    >
                                        <AppText
                                            className="text-base font-nunmedium flex-1"
                                            style={{
                                                color: isSelected
                                                    ? colors.accent
                                                    : colors.textPrimary,
                                            }}
                                        >
                                            {option.label}
                                        </AppText>
                                        {isSelected && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={24}
                                                color={colors.accent}
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Close Button */}
                        <TouchableOpacity
                            onPress={() => {
                                setShowPicker(false);
                                setIsFocused(false);
                                onBlur?.();
                            }}
                            className="px-4 py-3 border-t"
                            style={{
                                backgroundColor: colors.backgroundAlt,
                                borderTopColor: colors.border,
                            }}
                        >
                            <AppText
                                className="text-center text-base font-nunbold"
                                style={{ color: colors.accent }}
                            >
                                Close
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default SelectInput;

