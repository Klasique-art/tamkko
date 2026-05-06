import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator, StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

import { useColors } from '@/config/colors';


import AppText from '@/components/ui/AppText';
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    onClick?: () => void;
}

const AppButton: React.FC<AppButtonProps> = ({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    onClick,
    style,
    ...otherProps
}) => {
    const colors = useColors();

    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            borderWidth: variant === 'outline' || variant === 'accent' ? 2 : 0,
        };

        // Size styles
        const sizeStyles: Record<ButtonSize, ViewStyle> = {
            sm: { paddingVertical: 8, paddingHorizontal: 16 },
            md: { paddingVertical: 12, paddingHorizontal: 20 },
            lg: { paddingVertical: 16, paddingHorizontal: 24 },
        };

        // Variant styles
        const variantStyles: Record<ButtonVariant, ViewStyle> = {
            primary: {
                backgroundColor: colors.accent, // Orange
            },
            secondary: {
                backgroundColor: colors.primary, // Deep Brown
            },
            outline: {
                backgroundColor: 'transparent',
                borderColor: colors.accent,
            },
            danger: {
                backgroundColor: colors.error,
            },
            ghost: {
                backgroundColor: 'transparent',
            },
            accent: {
                backgroundColor: colors.accent,
                borderColor: colors.accent100,
                shadowColor: colors.accent,
                shadowOpacity: 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3,
            },
        };

        // Disabled style
        const disabledStyle: ViewStyle = {
            opacity: 0.5,
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
            ...(disabled && disabledStyle),
            ...(fullWidth && { width: '100%' }),
        };
    };

    const getTextStyle = (): TextStyle => {
        const sizeStyles: Record<ButtonSize, TextStyle> = {
            sm: { fontSize: 14 },
            md: { fontSize: 16 },
            lg: { fontSize: 18 },
        };

        const variantStyles: Record<ButtonVariant, TextStyle> = {
            primary: { color: colors.white },
            secondary: { color: colors.white },
            outline: { color: colors.textPrimary },
            danger: { color: colors.white },
            ghost: { color: colors.accent },
            accent: { color: colors.white },
        };

        return {
            fontWeight: '600',
            ...sizeStyles[size],
            ...variantStyles[variant],
        };
    };

    const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
    const iconColor = variant === 'outline' || variant === 'ghost' ? colors.accent : colors.white;

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onClick}
            disabled={disabled || loading}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ disabled: disabled || loading }}
            {...otherProps}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.accent : colors.white}
                    size="small"
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <Ionicons
                            name={icon}
                            size={iconSize}
                            color={iconColor}
                            style={styles.iconLeft}
                        />
                    )}
                    <AppText style={getTextStyle()}>{title}</AppText>
                    {icon && iconPosition === 'right' && (
                        <Ionicons
                            name={icon}
                            size={iconSize}
                            color={iconColor}
                            style={styles.iconRight}
                        />
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});

export default AppButton;
