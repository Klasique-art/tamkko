import React from 'react';
import { View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';

const TermsScreen = () => {
    return (
        <Screen>
            <View className="flex-1 items-center justify-center">
                <AppText className="text-xl font-nunbold">Terms and Conditions</AppText>
                <AppText className="mt-2 text-sm font-nunmedium">Coming soon.</AppText>
            </View>
        </Screen>
    );
};

export default TermsScreen;
