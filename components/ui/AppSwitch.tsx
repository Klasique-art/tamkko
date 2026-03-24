import * as Haptics from 'expo-haptics';
import React from 'react';
import { Switch, SwitchProps } from 'react-native';

import { useColors } from '@/config/colors';

type AppSwitchProps = Omit<SwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> & {
    enableHapticsOnEnable?: boolean;
    activeTrackColor?: string;
    inactiveTrackColor?: string;
    activeThumbColor?: string;
    inactiveThumbColor?: string;
    iosBackgroundColor?: string;
};

const AppSwitch = ({
    value,
    onValueChange,
    enableHapticsOnEnable = true,
    activeTrackColor,
    inactiveTrackColor,
    activeThumbColor,
    inactiveThumbColor = '#f4f3f4',
    iosBackgroundColor,
    ...rest
}: AppSwitchProps) => {
    const colors = useColors();

    const handleValueChange = (nextValue: boolean) => {
        if (nextValue && enableHapticsOnEnable) {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        onValueChange?.(nextValue);
    };

    return (
        <Switch
            value={value}
            onValueChange={handleValueChange}
            trackColor={{
                false: inactiveTrackColor || colors.border,
                true: activeTrackColor || `${colors.accent}80`, // Orange with opacity
            }}
            thumbColor={value ? (activeThumbColor || colors.accent) : inactiveThumbColor}
            ios_backgroundColor={iosBackgroundColor || colors.border}
            {...rest}
        />
    );
};

export default AppSwitch;
