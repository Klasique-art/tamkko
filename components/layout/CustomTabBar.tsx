import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/config/colors';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const colors = useColors();
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 10);

    return (
        <View style={[styles.container, {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: bottomPadding,
        }]}>
            <View style={styles.tabsContainer}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Get icon name based on route
                    const getIconName = (routeName: string, focused: boolean) => {
                        switch (routeName) {
                            case 'index':
                                return focused ? 'home' : 'home-outline';
                            case 'dashboard':
                                return focused ? 'grid' : 'grid-outline';
                            case 'draws':
                                return focused ? 'trophy' : 'trophy-outline';
                            case 'wallet':
                                return focused ? 'wallet' : 'wallet-outline';
                            case 'profile':
                                return focused ? 'person' : 'person-outline';
                            default:
                                return 'ellipse';
                        }
                    };

                    // Get label based on route
                    const getLabel = (routeName: string) => {
                        switch (routeName) {
                            case 'index':
                                return 'Home';
                            case 'dashboard':
                                return 'Dashboard';
                            case 'draws':
                                return 'Draws';
                            case 'wallet':
                                return 'Wallet';
                            case 'profile':
                                return 'Profile';
                            default:
                                return routeName;
                        }
                    };

                    // Animated styles for the tab
                    const animatedIconStyle = useAnimatedStyle(() => {
                        const scale = withSpring(isFocused ? 1 : 0.9, {
                            damping: 15,
                            stiffness: 150,
                        });

                        const translateY = withSpring(isFocused ? -2 : 0, {
                            damping: 15,
                            stiffness: 150,
                        });

                        return {
                            transform: [{ scale }, { translateY }],
                        };
                    });

                    const animatedLabelStyle = useAnimatedStyle(() => {
                        const opacity = withTiming(isFocused ? 1 : 0.6, {
                            duration: 200,
                        });

                        const scale = withSpring(isFocused ? 1 : 0.92, {
                            damping: 15,
                            stiffness: 150,
                        });

                        return {
                            opacity,
                            transform: [{ scale }],
                        };
                    });

                    const animatedIndicatorStyle = useAnimatedStyle(() => {
                        const width = withSpring(isFocused ? 32 : 0, {
                            damping: 15,
                            stiffness: 150,
                        });

                        const opacity = withTiming(isFocused ? 1 : 0, {
                            duration: 200,
                        });

                        return {
                            width,
                            opacity,
                        };
                    });

                    const iconColor = isFocused ? colors.accent : colors.textSecondary;
                    const labelColor = isFocused ? colors.accent : colors.textSecondary;

                    return (
                        <AnimatedTouchable
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tab}
                            activeOpacity={0.7}
                        >
                            <View style={styles.tabContent}>
                                {/* Active indicator */}
                                <Animated.View
                                    style={[
                                        styles.activeIndicator,
                                        { backgroundColor: colors.accent },
                                        animatedIndicatorStyle,
                                    ]}
                                />

                                {/* Icon */}
                                <Animated.View style={animatedIconStyle}>
                                    <Ionicons
                                        name={getIconName(route.name, isFocused) as any}
                                        size={24}
                                        color={iconColor}
                                    />
                                </Animated.View>

                                {/* Label */}
                                <Animated.Text
                                    style={[
                                        styles.label,
                                        { color: labelColor },
                                        animatedLabelStyle,
                                    ]}
                                >
                                    {getLabel(route.name)}
                                </Animated.Text>
                            </View>
                        </AnimatedTouchable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 1,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    tabContent: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    activeIndicator: {
        position: 'absolute',
        top: -8,
        height: 3,
        borderRadius: 2,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        letterSpacing: 0.2,
    },
});
