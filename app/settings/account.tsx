import React from 'react';
import { ScrollView } from 'react-native';

import { Screen, Nav } from '@/components';
import { AppInput } from '@/components/form';
import { useAuth } from '@/context/AuthContext';

export default function AccountSettingsScreen() {
    const { user } = useAuth();

    const formatDob = (value?: string | null) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();

        const suffix =
            day % 10 === 1 && day % 100 !== 11
                ? 'st'
                : day % 10 === 2 && day % 100 !== 12
                    ? 'nd'
                    : day % 10 === 3 && day % 100 !== 13
                        ? 'rd'
                        : 'th';

        return `${day}${suffix} ${month}, ${year}`;
    };

    return (
        <Screen>
            <Nav title="Account Details" />
            <ScrollView className="px-4 pt-4">
                <AppInput
                    name="firstName"
                    label="First Name"
                    value={user?.first_name ?? ''}
                    placeholder="First Name"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="lastName"
                    label="Last Name"
                    value={user?.last_name ?? ''}
                    placeholder="Last Name"
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
                    name="country"
                    label="Country"
                    value={user?.country ?? ''}
                    placeholder="Country"
                    editable={false}
                    onChange={() => { }}
                />
                <AppInput
                    name="dob"
                    label="Date of Birth"
                    value={formatDob(user?.date_of_birth)}
                    placeholder="Date of Birth"
                    editable={false}
                    onChange={() => { }}
                />
            </ScrollView>
        </Screen>
    );
}
