import { isAxiosError } from 'axios';
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import client from '@/lib/client';
import { CurrentUser } from '@/types/user.types';

type EditProfileForm = {
    displayName: string;
    username: string;
    email: string;
    phone: string;
    bio: string;
};

const INPUT_MAX = {
    displayName: 80,
    username: 30,
    email: 120,
    phone: 32,
    bio: 180,
};

const buildFormFromUser = (user: CurrentUser | null): EditProfileForm => ({
    displayName: user?.profile?.displayName ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    bio: user?.profile?.bio ?? '',
});

export default function ProfileEditScreen() {
    const colors = useColors();
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();
    const [saving, setSaving] = React.useState(false);
    const [form, setForm] = React.useState<EditProfileForm>(buildFormFromUser(user));

    React.useEffect(() => {
        setForm(buildFormFromUser(user));
    }, [user]);

    const updateField = <K extends keyof EditProfileForm>(key: K, value: EditProfileForm[K]) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const extractErrorMessage = (error: unknown): string => {
        if (isAxiosError(error)) {
            const data = error.response?.data as
                | { message?: string; errors?: { message?: string }[] }
                | string
                | undefined;

            if (typeof data === 'string') return data;

            const first = data?.errors?.find((item) => item?.message?.trim())?.message?.trim();
            return first || data?.message || error.message || 'Unable to save profile.';
        }
        return 'Unable to save profile.';
    };

    const save = async () => {
        if (!form.displayName.trim()) {
            showToast('Display name is required.', { variant: 'warning' });
            return;
        }
        if (!form.username.trim()) {
            showToast('Username is required.', { variant: 'warning' });
            return;
        }
        if (!form.email.trim()) {
            showToast('Email is required.', { variant: 'warning' });
            return;
        }

        const payload = {
            username: form.username.trim().toLowerCase(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            profile: {
                displayName: form.displayName.trim(),
                bio: form.bio.trim(),
            },
        };

        setSaving(true);
        try {
            try {
                await client.patch('/auth/me', payload);
            } catch (error: any) {
                if (error?.response?.status && error.response.status !== 404) {
                    throw error;
                }
                try {
                    await client.patch('/auth/me/', payload);
                } catch (fallbackError: any) {
                    if (fallbackError?.response?.status && fallbackError.response.status !== 404) {
                        throw fallbackError;
                    }
                    await client.patch('/users/me', payload);
                }
            }

            await refreshUser();
            showToast('Profile details updated.', { variant: 'success', duration: 1400 });
        } catch (error) {
            showToast(extractErrorMessage(error), { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Screen title="Edit Profile" className="pt-3">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 120 }}
                    accessibilityLabel="Edit profile form"
                >
                    <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-lg font-black" color={colors.textPrimary}>Public Profile</AppText>
                        <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                            Update how you appear to creators and subscribers.
                        </AppText>
                    </View>

                    <View className="mt-4 rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>Display Name</AppText>
                        <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <TextInput
                                value={form.displayName}
                                onChangeText={(next) => updateField('displayName', next.slice(0, INPUT_MAX.displayName))}
                                style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                placeholder="Your display name"
                                placeholderTextColor={`${colors.textSecondary}88`}
                                accessibilityLabel="Display name"
                                accessibilityHint="Public name shown on your profile"
                                returnKeyType="next"
                                maxLength={INPUT_MAX.displayName}
                            />
                        </View>

                        <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Username</AppText>
                        <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <TextInput
                                value={form.username}
                                onChangeText={(next) => updateField('username', next.slice(0, INPUT_MAX.username))}
                                style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                placeholder="your_username"
                                placeholderTextColor={`${colors.textSecondary}88`}
                                autoCapitalize="none"
                                autoCorrect={false}
                                accessibilityLabel="Username"
                                accessibilityHint="Your unique handle. Letters, numbers, underscore or dot."
                                returnKeyType="next"
                                maxLength={INPUT_MAX.username}
                            />
                        </View>

                        <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Email</AppText>
                        <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <TextInput
                                value={form.email}
                                onChangeText={(next) => updateField('email', next.slice(0, INPUT_MAX.email))}
                                style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                placeholder="name@example.com"
                                placeholderTextColor={`${colors.textSecondary}88`}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                accessibilityLabel="Email address"
                                accessibilityHint="Email used for your account"
                                returnKeyType="next"
                                maxLength={INPUT_MAX.email}
                            />
                        </View>

                        <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Phone</AppText>
                        <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <TextInput
                                value={form.phone}
                                onChangeText={(next) => updateField('phone', next.slice(0, INPUT_MAX.phone))}
                                style={{ color: colors.textPrimary, paddingVertical: 12 }}
                                placeholder="+233XXXXXXXXX"
                                placeholderTextColor={`${colors.textSecondary}88`}
                                keyboardType="phone-pad"
                                accessibilityLabel="Phone number"
                                accessibilityHint="Phone number linked to your account"
                                returnKeyType="next"
                                maxLength={INPUT_MAX.phone}
                            />
                        </View>

                        <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Bio</AppText>
                        <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                            <TextInput
                                value={form.bio}
                                onChangeText={(next) => updateField('bio', next.slice(0, INPUT_MAX.bio))}
                                multiline
                                style={{ color: colors.textPrimary, minHeight: 84, paddingVertical: 10, textAlignVertical: 'top' }}
                                placeholder="Tell people about yourself"
                                placeholderTextColor={`${colors.textSecondary}88`}
                                accessibilityLabel="Profile bio"
                                accessibilityHint="Short description on your public profile"
                                returnKeyType="done"
                                maxLength={INPUT_MAX.bio}
                            />
                        </View>
                        <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>
                            {form.bio.length}/{INPUT_MAX.bio}
                        </AppText>
                    </View>

                    <Pressable
                        onPress={() => void save()}
                        disabled={saving}
                        className="mt-4 rounded-xl border py-3"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: saving ? 0.7 : 1 }}
                        accessibilityRole="button"
                        accessibilityLabel={saving ? 'Saving profile changes' : 'Save profile changes'}
                        accessibilityHint="Saves your updated profile information"
                        accessibilityState={{ disabled: saving, busy: saving }}
                    >
                        <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </AppText>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}
