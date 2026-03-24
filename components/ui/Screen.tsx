import { ReactNode } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from '@/config/colors';
import { useTheme } from '@/context/ThemeContext';

interface ScreenProps {
    children: ReactNode;
    statusBarStyle?: "default" | "light-content" | "dark-content";
    statusBarBg?: string;
    className?: string;
}

const Screen = ({
    children,
    statusBarStyle,
    statusBarBg,
    className
}: ScreenProps) => {
    const colors = useColors();
    const { theme } = useTheme();

    // Auto-determine status bar style based on theme if not provided
    const barStyle = statusBarStyle || (theme === 'dark' ? 'light-content' : 'dark-content');
    // Status bar should be black in dark mode, not the screen background color
    const barBg = statusBarBg || (theme === 'dark' ? '#000000' : colors.background);

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} className={`${className}`}>
            <StatusBar backgroundColor={barBg} barStyle={barStyle} />
            <View style={{ flex: 1, backgroundColor: colors.background }} className={`${className} px-4`}>
                {children}
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

