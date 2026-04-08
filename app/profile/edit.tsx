import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { mockProfileSecurityService, ProfileDraft } from '@/lib/services/mockProfileSecurityService';

const INPUT_MAX = {
    firstName: 50,
    lastName: 50,
    bio: 180,
    website: 120,
    phone: 32,
};

export default function ProfileEditScreen() {
    const colors = useColors();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [saving, setSaving] = React.useState(false);
    const [form, setForm] = React.useState<ProfileDraft>({
        firstName: '',
        lastName: '',
        bio: '',
        website: '',
        phone: '',
    });

    React.useEffect(() => {
        const load = async () => {
            const state = await mockProfileSecurityService.load(user);
            setForm(state.profile);
        };
        void load();
    }, [user]);

    const updateField = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    const save = async () => {
        if (!form.firstName.trim() || !form.lastName.trim()) {
            showToast('First and last name are required.', { variant: 'warning' });
            return;
        }
        setSaving(true);
        await mockProfileSecurityService.updateProfile(user, {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            bio: form.bio.trim(),
            website: form.website.trim(),
            phone: form.phone.trim(),
        });
        setSaving(false);
        showToast('Profile details updated.', { variant: 'success', duration: 1400 });
    };

    return (
        <Screen title="Edit Profile" className="pt-3">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-lg font-black" color={colors.textPrimary}>Public Profile</AppText>
                    <AppText className="mt-1 text-sm" color={colors.textSecondary}>
                        Update how you appear to creators and subscribers.
                    </AppText>
                </View>

                <View className="mt-4 rounded-3xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>First name</AppText>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={form.firstName}
                            onChangeText={(next) => updateField('firstName', next.slice(0, INPUT_MAX.firstName))}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="First name"
                        />
                    </View>

                    <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Last name</AppText>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={form.lastName}
                            onChangeText={(next) => updateField('lastName', next.slice(0, INPUT_MAX.lastName))}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            accessibilityLabel="Last name"
                        />
                    </View>

                    <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Bio</AppText>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={form.bio}
                            onChangeText={(next) => updateField('bio', next.slice(0, INPUT_MAX.bio))}
                            multiline
                            style={{ color: colors.textPrimary, minHeight: 84, paddingVertical: 10, textAlignVertical: 'top' }}
                            accessibilityLabel="Profile bio"
                        />
                    </View>
                    <AppText className="mt-1 text-[11px]" color={colors.textSecondary}>
                        {form.bio.length}/{INPUT_MAX.bio}
                    </AppText>

                    <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Website</AppText>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={form.website}
                            onChangeText={(next) => updateField('website', next.slice(0, INPUT_MAX.website))}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            accessibilityLabel="Website URL"
                        />
                    </View>

                    <AppText className="mt-3 text-sm font-semibold" color={colors.textPrimary}>Phone</AppText>
                    <View className="mt-2 rounded-xl border px-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <TextInput
                            value={form.phone}
                            onChangeText={(next) => updateField('phone', next.slice(0, INPUT_MAX.phone))}
                            style={{ color: colors.textPrimary, paddingVertical: 12 }}
                            keyboardType="phone-pad"
                            accessibilityLabel="Phone number"
                        />
                    </View>
                </View>

                <Pressable
                    onPress={() => void save()}
                    disabled={saving}
                    className="mt-4 rounded-xl border py-3"
                    style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: saving ? 0.7 : 1 }}
                    accessibilityRole="button"
                    accessibilityLabel="Save profile changes"
                >
                    <AppText className="text-center text-sm font-semibold" color={colors.textPrimary}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </AppText>
                </Pressable>
            </ScrollView>
        </Screen>
    );
}
