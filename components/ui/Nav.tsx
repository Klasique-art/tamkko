import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from 'react-i18next';
import { Image, TouchableOpacity, View } from 'react-native';

import { useColors } from "@/config/colors";
import { useTheme } from "@/context/ThemeContext";
import AppText from "./AppText";

interface NavProps {
    title?: string;
    onPress?: () => void;
    showProfile?: boolean;
    profileImage?: string;
}

const Nav = ({ title = "", onPress, showProfile = false, profileImage }: NavProps) => {
    const colors = useColors();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const isDarkMode = theme === "dark";

    const navBackgroundColor = isDarkMode ? colors.backgroundAlt : colors.background;
    const navBorderColor = isDarkMode ? "#4A4A4A" : colors.border;
    const backButtonBgColor = isDarkMode ? `${colors.accent}33` : `${colors.primary}15`;
    const backIconColor = isDarkMode ? colors.accent : colors.primary;

    return (
        <View
            style={{
                backgroundColor: navBackgroundColor,
                borderColor: navBorderColor,
                zIndex: 100,
            }}
            className="w-full flex-row items-center justify-between py-3 px-4 mb-2 rounded-2xl shadow-sm border"
        >
            <TouchableOpacity
                style={{ backgroundColor: backButtonBgColor }}
                className="w-10 h-10 rounded-full items-center justify-center"
                activeOpacity={0.8}
                accessible={true}
                accessibilityLabel={t('back')}
                accessibilityHint={t('press to go back')}
                onPress={() => {
                    if (onPress) {
                        onPress();
                    } else {
                        router.back();
                    }
                }}
            >
                <Ionicons name="arrow-back" size={22} color={backIconColor} />
            </TouchableOpacity>

            <AppText styles="flex-1 text-center font-semibold text-base">{title}</AppText>

            {showProfile && profileImage ? (
                <View
                    style={{ borderColor: isDarkMode ? colors.accent : colors.primary }}
                    className="border w-10 h-10 rounded-full"
                >
                    <Image
                        source={{ uri: profileImage }}
                        className="w-full h-full rounded-full"
                        accessibilityLabel={t('User profile picture')}
                    />
                </View>
            ) : (
                <View className="w-10" />
            )}
        </View>
    );
};

export default Nav;
