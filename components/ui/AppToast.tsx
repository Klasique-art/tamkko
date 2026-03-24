import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, View } from 'react-native';

import { useColors } from '@/config/colors';

import AppText from './AppText';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface AppToastProps {
    visible: boolean;
    message: string;
    variant?: ToastVariant;
    duration?: number;
    onHide: () => void;
}

const AppToast = ({
    visible,
    message,
    variant = 'info',
    duration = 5200,
    onHide,
}: AppToastProps) => {
    const colors = useColors();
    const { t } = useTranslation();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    const variantStyles = {
        success: { color: colors.success, icon: 'checkmark-circle' as const },
        error: { color: colors.error, icon: 'close-circle' as const },
        warning: { color: colors.warning, icon: 'warning' as const },
        info: { color: colors.info, icon: 'information-circle' as const },
    };

    const hideToast = useCallback(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -16,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (finished) onHide();
        });
    }, [onHide, opacity, translateY]);

    useEffect(() => {
        if (!visible) return;
        opacity.setValue(0);
        translateY.setValue(-20);

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                speed: 20,
                bounciness: 5,
            }),
        ]).start();

        const timer = setTimeout(() => {
            hideToast();
        }, duration);

        return () => clearTimeout(timer);
    }, [visible, message, variant, duration, hideToast, opacity, translateY]);

    if (!visible) return null;

    const active = variantStyles[variant];

    return (
        <Animated.View
            style={{
                opacity,
                transform: [{ translateY }],
            }}
            className="mx-4 rounded-xl"
        >
            <View
                className="flex-row items-center rounded-xl px-3 py-3"
                style={{
                    backgroundColor: colors.background,
                    borderLeftWidth: 4,
                    borderLeftColor: active.color,
                    shadowColor: '#000000',
                    shadowOpacity: 0.18,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 5 },
                    elevation: 6,
                }}
            >
                <Ionicons name={active.icon} size={20} color={active.color} />
                <AppText
                    className="ml-2 flex-1 text-sm font-nunmedium"
                    style={{ color: colors.textPrimary }}
                >
                    {message}
                </AppText>
                <Pressable
                    onPress={hideToast}
                    accessibilityLabel={t('Dismiss toast')}
                    accessibilityRole="button"
                    className="ml-2 p-1"
                >
                    <Ionicons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
            </View>
        </Animated.View>
    );
};

export default AppToast;
