import { Ionicons } from '@expo/vector-icons';
import type { FC } from "react";
import { View } from 'react-native';

import { useColors } from '@/config/colors';
import AppButton from "./AppButton";
import AppText from "./AppText";

interface ConfirmActionProps {
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    desc?: string;
    confirmBtnTitle?: string;
    isDestructive?: boolean;
}

const ConfirmAction: FC<ConfirmActionProps> = ({
    onConfirm,
    onCancel,
    title = "Confirm Action",
    desc = "Are you sure you want to proceed?",
    confirmBtnTitle = "Confirm",
    isDestructive = true,
}) => {
    const colors = useColors();

    return (
        <View className="px-1 pb-2 pt-1" accessible accessibilityRole="alert">
            <View className="items-center">
                <View
                    className="mb-3 h-12 w-12 items-center justify-center rounded-full"
                    style={{
                        backgroundColor: isDestructive ? `${colors.error}1F` : `${colors.accent}1F`,
                    }}
                >
                    <Ionicons
                        name={isDestructive ? 'warning-outline' : 'checkmark-circle-outline'}
                        size={24}
                        color={isDestructive ? colors.error : colors.accent}
                    />
                </View>
                <AppText
                    className="text-center text-xl font-bold"
                    color={isDestructive ? colors.error : colors.textPrimary}
                >
                    {title}
                </AppText>
                <AppText className="mt-2 px-2 text-center text-sm leading-6" color={colors.textSecondary}>
                    {desc}
                </AppText>
            </View>

            <View className="mt-6 gap-3">
                <AppButton
                    title={confirmBtnTitle}
                    variant={isDestructive ? "danger" : "primary"}
                    size="lg"
                    fullWidth
                    onClick={onConfirm}
                    accessibilityLabel={confirmBtnTitle}
                />

                <AppButton
                    title="Cancel"
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={onCancel}
                    accessibilityLabel="Cancel and close dialog"
                />
            </View>
        </View>
    );
};

export default ConfirmAction;
