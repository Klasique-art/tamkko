import React from 'react';
import { ScrollView } from 'react-native';

import { Screen, Nav } from '@/components';
import { AppInput } from '@/components/form';
import { useAuth } from '@/context/AuthContext';

export default function AccountSettingsScreen() {
    const { user } = useAuth();

    return (
        <Screen>
            <Nav title="Account Details" />
            <ScrollView className="px-4 pt-4">
                <AppInput
                    name="displayName"
                    label="Display Name"
                    value={user?.profile?.displayName ?? ''}
                    placeholder="Display Name"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="username"
                    label="Username"
                    value={user?.username ? `@${user.username}` : ''}
                    placeholder="@username"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="email"
                    label="Email Address"
                    value={user?.email ?? ''}
                    placeholder="Email"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="phone"
                    label="Phone Number"
                    value={user?.phone ?? ''}
                    placeholder="Phone"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="role"
                    label="Role"
                    value={user?.role ?? ''}
                    placeholder="Role"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="referralCode"
                    label="Referral Code"
                    value={user?.referral?.code ?? ''}
                    placeholder="Referral Code"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="wallet"
                    label="Wallet Balance"
                    value={`${user?.wallet?.currency ?? 'GHS'} ${user?.wallet?.balance ?? 0}`}
                    placeholder="Wallet Balance"
                    editable={false}
                    onChange={() => { }}
                />
            </ScrollView>
        </Screen>
    );
}
