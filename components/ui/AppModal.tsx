import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, View } from 'react-native';

import { useColors } from '@/config/colors';

import AppText from './AppText';

interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    closeOnBackdropPress?: boolean;
    showCloseButton?: boolean;
}

const AppModal = ({
    visible,
    onClose,
    title,
    children,
    closeOnBackdropPress = true,
    showCloseButton = true,
}: AppModalProps) => {
    const colors = useColors();
    const [isMounted, setIsMounted] = useState(visible);
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(16)).current;

    const animateIn = useCallback(() => {
        Animated.parallel([
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.spring(contentTranslateY, {
                toValue: 0,
                useNativeDriver: true,
                speed: 20,
                bounciness: 6,
            }),
        ]).start();
    }, [overlayOpacity, contentOpacity, contentTranslateY]);

    const animateOut = useCallback(
        (onDone?: () => void) => {
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.timing(contentOpacity, {
                    toValue: 0,
                    duration: 160,
                    useNativeDriver: true,
                }),
                Animated.timing(contentTranslateY, {
                    toValue: 16,
                    duration: 160,
                    useNativeDriver: true,
                }),
            ]).start(() => onDone?.());
        },
        [overlayOpacity, contentOpacity, contentTranslateY]
    );

    useEffect(() => {
        if (visible) {
            setIsMounted(true);
            animateIn();
            return;
        }

        if (isMounted) {
            animateOut(() => setIsMounted(false));
        }
    }, [visible, isMounted, animateIn, animateOut]);

    const handleClose = useCallback(() => {
        animateOut(() => {
            setIsMounted(false);
            onClose();
        });
    }, [animateOut, onClose]);

    if (!isMounted) return null;

    return (
        <Modal
            transparent
            visible
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <Animated.View
                className="flex-1 items-center justify-center px-5"
                style={{ opacity: overlayOpacity }}
            >
                <Pressable
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                    onPress={closeOnBackdropPress ? handleClose : undefined}
                    accessibilityRole={closeOnBackdropPress ? 'button' : undefined}
                    accessibilityLabel={closeOnBackdropPress ? 'Close modal' : undefined}
                />

                <Animated.View
                    accessibilityViewIsModal
                    className="w-full rounded-2xl border p-4"
                    style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        opacity: contentOpacity,
                        transform: [{ translateY: contentTranslateY }],
                    }}
                >
                    {(title || showCloseButton) && (
                        <View className="mb-3 flex-row items-center justify-between">
                            {title ? (
                                <AppText className="text-base font-bold" style={{ color: colors.textPrimary }}>
                                    {title}
                                </AppText>
                            ) : (
                                <View />
                            )}
                            {showCloseButton && (
                                <Pressable
                                    onPress={handleClose}
                                    className="rounded-full p-1"
                                    accessibilityRole="button"
                                    accessibilityLabel="Close modal"
                                >
                                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                                </Pressable>
                            )}
                        </View>
                    )}

                    {children}
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

export default AppModal;
