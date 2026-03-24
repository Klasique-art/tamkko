import React from 'react';
import { View } from 'react-native';

import { Screen, Nav } from '@/components';
import { SettingsList } from '@/components/profile';

export default function SecurityScreen() {
    const securityOptions = [
        { id: 'password', label: 'Change Password', icon: 'key-outline', route: '/settings/security/change-password' },
    ];

    return (
        <Screen>
            <Nav title="Security" />
            <View className="pt-4">
                <SettingsList items={securityOptions as any} />
            </View>
        </Screen>
    );
}
