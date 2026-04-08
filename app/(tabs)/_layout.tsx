import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors } from '@/config/colors';

const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    index: 'home-outline',
    community: 'people-outline',
    inbox: 'notifications-outline',
    profile: 'person-outline',
};

export default function TabsLayout() {
    const insets = useSafeAreaInsets();
    const colors = useColors();

    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.border,
                    height: 58 + Math.max(insets.bottom, 6),
                    paddingTop: 2,
                    paddingBottom: Math.max(insets.bottom, 6),
                },
                tabBarItemStyle: {
                    paddingTop: 0,
                    paddingBottom: 0,
                    justifyContent: 'center',
                },
                tabBarIconStyle: {
                    marginTop: 0,
                    marginBottom: -2,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    lineHeight: 10,
                    marginTop: -1,
                    paddingBottom: 0,
                },
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name={tabIcons[route.name] ?? 'ellipse-outline'} size={Math.max(16, size - 4)} color={color} />
                ),
            })}
        >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="community" options={{ title: 'Community' }} />

            <Tabs.Screen
                name="create"
                options={{
                    title: '',
                    tabBarIcon: () => null,
                    tabBarLabel: '',
                    tabBarAccessibilityLabel: 'Create',
                    tabBarButtonTestID: 'tab-create',
                    tabBarButton: (props) => {
                        const focused = Boolean(props.accessibilityState?.selected);
                        const { onPress, onLongPress, accessibilityState, testID, style } = props;
                        return (
                            <Pressable
                                onPress={onPress}
                                onLongPress={onLongPress}
                                accessibilityState={accessibilityState}
                                testID={testID}
                                accessibilityRole="button"
                                accessibilityLabel="Create"
                                accessibilityHint="Create new content"
                                style={[
                                    style,
                                    {
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    },
                                ]}
                            >
                                <View
                                    style={{
                                        height: 46,
                                        width: 46,
                                        borderRadius: 23,
                                        backgroundColor: focused ? colors.accent : colors.textPrimary,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: '#000',
                                        shadowOpacity: 0.16,
                                        shadowRadius: 5,
                                        shadowOffset: { width: 0, height: 2 },
                                        elevation: 4,
                                    }}
                                >
                                    <Ionicons name="add" size={20} color={colors.background} />
                                </View>
                            </Pressable>
                        );
                    },
                }}
            />

            <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

            <Tabs.Screen name="discover" options={{ href: null }} />
        </Tabs>
    );
}
