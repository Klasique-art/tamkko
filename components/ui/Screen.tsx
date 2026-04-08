import { useNavigation } from '@react-navigation/native';
import { useRouter, useSegments } from 'expo-router';
import { ReactNode, useMemo } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from '@/config/colors';
import { useTheme } from '@/context/ThemeContext';
import Nav from '@/components/ui/Nav';

interface ScreenProps {
    children: ReactNode;
    statusBarStyle?: "default" | "light-content" | "dark-content";
    statusBarBg?: string;
    className?: string;
    title?: string;
    showTopNav?: boolean;
}

const Screen = ({
    children,
    statusBarStyle,
    statusBarBg,
    className,
    title,
    showTopNav = true,
}: ScreenProps) => {
    const colors = useColors();
    const { theme } = useTheme();
    const router = useRouter();
    const segments = useSegments();
    const navigation = useNavigation();

    const routeTitle = useMemo(() => {
        const cleaned = segments.filter((segment) => !segment.startsWith('('));
        const last = cleaned[cleaned.length - 1] ?? 'home';
        const normalized = last.replace(/\[|\]/g, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        if (normalized.toLowerCase() === 'index') return 'Home';
        return normalized || 'Home';
    }, [segments]);
    const isTabRoute = useMemo(() => (segments as string[]).includes('(tabs)'), [segments]);
    const isOnboardingRoute = useMemo(() => (segments as string[]).includes('onboarding'), [segments]);
    const shouldShowTopNav = showTopNav && !isTabRoute && !isOnboardingRoute;

    // Auto-determine status bar style based on theme if not provided
    const barStyle = statusBarStyle || (theme === 'dark' ? 'light-content' : 'dark-content');
    // Status bar should be black in dark mode, not the screen background color
    const barBg = statusBarBg || (theme === 'dark' ? '#000000' : colors.background);

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
            <StatusBar backgroundColor={barBg} barStyle={barStyle} />
            <View style={{ flex: 1, backgroundColor: colors.background }} className={`px-4 ${className || ''}`}>
                {shouldShowTopNav ? <View className="pt-1">
                    <Nav
                        title={title || routeTitle}
                        canGoBack={navigation.canGoBack()}
                        onPress={() => router.back()}
                    />
                </View> : null}
                <View style={{ flex: 1 }} className={shouldShowTopNav ? 'pt-3' : ''}>{children}</View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    }
});

export default Screen;

