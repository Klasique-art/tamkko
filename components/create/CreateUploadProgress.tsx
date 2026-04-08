import React from 'react';
import { View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { MockUploadStage } from '@/lib/services/mockCreateUploadService';

type CreateUploadProgressProps = {
    progress: number;
    stage: MockUploadStage;
};

const stageLabel: Record<MockUploadStage, string> = {
    preparing: 'Preparing media',
    uploading: 'Uploading securely',
    processing: 'Processing post',
    done: 'Completed',
};

export default function CreateUploadProgress({ progress, stage }: CreateUploadProgressProps) {
    const colors = useColors();
    const safeProgress = Math.max(0, Math.min(1, progress));
    const percentage = Math.round(safeProgress * 100);

    return (
        <View
            className="rounded-2xl border p-4"
            style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: percentage }}
            accessibilityLabel={`${stageLabel[stage]}, ${percentage}%`}
        >
            <View className="flex-row items-center justify-between">
                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                    {stageLabel[stage]}
                </AppText>
                <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                    {percentage}%
                </AppText>
            </View>
            <View className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: `${colors.textSecondary}33` }}>
                <View
                    className="h-full rounded-full"
                    style={{ width: `${percentage}%`, backgroundColor: colors.accent }}
                />
            </View>
        </View>
    );
}
