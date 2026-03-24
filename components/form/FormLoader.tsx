import React from 'react';
import { View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

import { useColors } from '@/config/colors';

import AppText from '@/components/ui/AppText';

interface FormLoaderProps {
    visible: boolean;
    message?: string;
}

const FormLoader = ({ visible, message = 'Processing...' }: FormLoaderProps) => {
    const colors = useColors();
    const ringRotate = useSharedValue(0);
    const orbitRotate = useSharedValue(0);
    const glowPulse = useSharedValue(0);

    React.useEffect(() => {
        if (!visible) return;

        ringRotate.value = 0;
        orbitRotate.value = 0;
        glowPulse.value = 0;

        ringRotate.value = withRepeat(withTiming(360, { duration: 1800, easing: Easing.linear }), -1, false);
        orbitRotate.value = withRepeat(withTiming(-360, { duration: 2600, easing: Easing.linear }), -1, false);
        glowPulse.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, true);
    }, [visible, glowPulse, orbitRotate, ringRotate]);

    const ringStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${ringRotate.value}deg` }],
    }));

    const orbitStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${orbitRotate.value}deg` }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(glowPulse.value, [0, 1], [0.35, 0.9]),
        transform: [{ scale: interpolate(glowPulse.value, [0, 1], [0.92, 1.06]) }],
    }));

    if (!visible) return null;

    return (
        <View
            className="absolute inset-0 items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.58)', zIndex: 30 }}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`${message}. Please wait.`}
            accessibilityLiveRegion="polite"
            accessibilityViewIsModal
        >
            <Animated.View style={glowStyle} accessible={false} importantForAccessibility="no-hide-descendants">
                <View
                    className="mx-4 items-center rounded-2xl p-8"
                    style={{
                        backgroundColor: colors.background,
                        borderWidth: 2,
                        borderColor: colors.accent,
                        maxWidth: 320,
                        width: '100%',
                    }}
                >
                    <View
                        className="mb-4 h-20 w-20 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${colors.accent}14` }}
                        accessible={false}
                        importantForAccessibility="no"
                    >
                        <Animated.View
                            className="absolute h-20 w-20 rounded-full"
                            style={[
                                ringStyle,
                                {
                                    borderWidth: 3,
                                    borderColor: `${colors.accent}25`,
                                    borderTopColor: colors.accent,
                                },
                            ]}
                        />
                        <Animated.View
                            className="absolute h-14 w-14 rounded-full"
                            style={[
                                orbitStyle,
                                {
                                    borderWidth: 3,
                                    borderColor: `${colors.accent}33`,
                                    borderBottomColor: colors.accent,
                                },
                            ]}
                        />
                        <View className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.accent }} />
                    </View>

                    <View className="items-center gap-2">
                        <AppText className="text-center text-xl font-nunbold" style={{ color: colors.textPrimary }}>
                            {message}
                        </AppText>
                        <AppText className="text-center text-sm font-nunmedium" style={{ color: colors.textSecondary }}>
                            Finalizing your details securely...
                        </AppText>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

export default FormLoader;
