import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useColors } from '@/config/colors';
import AppText from './AppText';

interface NavProps {
    title?: string;
    onPress?: () => void;
    canGoBack?: boolean;
    rightContent?: ReactNode;
}

const Nav = ({ title = '', onPress, canGoBack = true, rightContent }: NavProps) => {
    const colors = useColors();

    return (
        <View
            style={{
                backgroundColor: colors.backgroundAlt,
                borderColor: colors.border,
                overflow: 'hidden',
            }}
            className="w-full flex-row items-center justify-between rounded-2xl border px-2 py-2"
        >
            <Pressable
                style={{ opacity: canGoBack ? 1 : 0.35 }}
                className="h-10 w-10 items-center justify-center rounded-full"
                disabled={!canGoBack}
                accessible
                accessibilityLabel="Back"
                accessibilityHint="Press to go back"
                accessibilityRole="button"
                onPress={() => {
                    if (onPress) {
                        onPress();
                    }
                }}
            >
                <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            </Pressable>

            <AppText className="flex-1 text-center text-base font-semibold" color={colors.textPrimary} disableTranslation>
                {title}
            </AppText>

            <View className="h-10 w-10 items-center justify-center">{rightContent ?? null}</View>
        </View>
    );
};

export default Nav;
