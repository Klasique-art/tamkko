import { useFormikContext } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import AppSwitch from '@/components/ui/AppSwitch';
import { useColors } from '@/config/colors';

import AppText from '@/components/ui/AppText';
interface ToggleFieldProps {
    name: string;
    label: string;
    description?: string;
}

const ToggleField = ({ name, label, description }: ToggleFieldProps) => {
    const colors = useColors();
    const { t } = useTranslation();
    const { values, setFieldValue } = useFormikContext<any>();

    const value = values[name] as boolean;

    const handleToggle = (newValue: boolean) => {
        setFieldValue(name, newValue);
    };

    return (
        <View className="flex-row items-center justify-between py-3 mb-2">
            <View className="flex-1 mr-4">
                <AppText className="text-base font-nunbold mb-1" style={{ color: colors.textPrimary }}>
                    {label}
                </AppText>
                {description && (
                    <AppText className="text-xs font-nunmedium" style={{ color: colors.textSecondary }}>
                        {description}
                    </AppText>
                )}
            </View>

            <AppSwitch
                value={value}
                onValueChange={handleToggle}
                activeTrackColor={colors.accent50}
                activeThumbColor={colors.accent}
                inactiveThumbColor={colors.textSecondary}
                accessibilityLabel={t('{{label}} toggle', { label: t(label) })}
                accessibilityRole="switch"
                accessibilityState={{ checked: value }}
            />
        </View>
    );
};

export default ToggleField;
