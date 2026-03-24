import type { FC } from "react";
import { View } from 'react-native';

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
    return (
        <View className="p-6" style={{ minHeight: 280, zIndex: 100 }}>
            {/* Title */}
            <AppText
                styles={`text-center text-xl mb-3 font-bold ${isDestructive ? "text-error" : "text-primary"}`}
            >
                {title}
            </AppText>

            {/* Description */}
            <AppText styles="text-center text-sm text-textSecondary mb-8 px-2">
                {desc}
            </AppText>

            {/* Action Buttons */}
            <View style={{ gap: 12 }}>
                {/* Confirm Button */}
                <AppButton
                    title={confirmBtnTitle}
                    variant={isDestructive ? "danger" : "primary"}
                    size="lg"
                    onClick={onConfirm}
                />

                {/* Cancel Button */}
                <AppButton
                    title="Cancel"
                    variant="outline"
                    size="lg"
                    onClick={onCancel}
                />
            </View>
        </View>
    );
};

export default ConfirmAction;
