import { useColors } from '@/config/colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, TouchableOpacity, View } from 'react-native';

import AppText from '@/components/ui/AppText';
type IconName = keyof typeof MaterialIcons.glyphMap | keyof typeof Ionicons.glyphMap;

interface AppInputProps extends Omit<RNTextInputProps, 'onChange'> {
    name: string;
    label: string;
    value: string;
    onChange: (text: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    multiline?: boolean;
    numberOfLines?: number;
    required?: boolean;
    icon?: IconName;
    iconAria?: string;
    iconClick?: () => void;
    inputStyles?: string;
}

const AppInput = ({
    name,
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    multiline = false,
    numberOfLines = 4,
    required = false,
    secureTextEntry = false,
    icon,
    iconAria,
    iconClick,
    inputStyles,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    ...otherProps
}: AppInputProps) => {
    const colors = useColors();
    const { t } = useTranslation();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputId = `input-${name}`;

    // Handle password visibility toggle
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const getIconComponent = () => {
        if (!icon) return null;

        const iconColor = isFocused ? colors.accent : colors.textSecondary;
        const iconSize = 20;

        // Check if it's a password field with eye icon
        if (icon === 'eye' || icon === 'eye-off') {
            return (
                <Ionicons
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={iconSize}
                    color={iconColor}
                />
            );
        }

        // Try MaterialIcons first
        if (icon in MaterialIcons.glyphMap) {
            return <MaterialIcons name={icon as any} size={iconSize} color={iconColor} />;
        }

        // Fallback to Ionicons
        return <Ionicons name={icon as any} size={iconSize} color={iconColor} />;
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

            <View className={`relative w-full ${inputStyles || ''}`}>
                <RNTextInput
                    nativeID={inputId}
                    className={`w-full ${multiline ? 'py-3' : 'h-12'} ${icon ? 'pr-12' : 'pr-4'} pl-4 rounded-xl text-base font-nunmedium`}
                    style={{
                        backgroundColor: colors.backgroundAlt,
                        borderWidth: 2,
                        borderColor: isFocused ? colors.accent : colors.border,
                        color: colors.textPrimary,
                    }}
                    placeholder={placeholder ? t(placeholder) : placeholder}
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={() => {
                        setIsFocused(false);
                        onBlur?.();
                    }}
                    onFocus={() => setIsFocused(true)}
                    multiline={multiline}
                    numberOfLines={multiline ? numberOfLines : 1}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    accessibilityLabel={t(label)}
                    {...otherProps}
                />
                {icon && (
                    <TouchableOpacity
                        className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center"
                        onPress={secureTextEntry ? togglePasswordVisibility : iconClick}
                        accessibilityLabel={iconAria ? t(iconAria) : t('Icon button')}
                        accessibilityRole="button"
                    >
                        {getIconComponent()}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default AppInput;
