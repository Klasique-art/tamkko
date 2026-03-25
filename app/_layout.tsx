import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import '../global.css';
import '@/config/i18n';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <LanguageProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <ToastProvider>
                            <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="index" />
                                <Stack.Screen name="(public)" />
                                <Stack.Screen name="(auth)" />
                                <Stack.Screen name="onboarding" />
                                <Stack.Screen name="(tabs)" />
                                <Stack.Screen name="video" />
                                <Stack.Screen name="search" />
                                <Stack.Screen name="rooms" />
                                <Stack.Screen name="wallet" />
                                <Stack.Screen name="referral" />
                                <Stack.Screen name="notifications" />
                                <Stack.Screen name="profile" />
                                <Stack.Screen name="terms" />
                                <Stack.Screen name="verification" />
                            </Stack>
                        </ToastProvider>
                    </AuthProvider>
                </ThemeProvider>
            </LanguageProvider>
        </GestureHandlerRootView>
    );
}
