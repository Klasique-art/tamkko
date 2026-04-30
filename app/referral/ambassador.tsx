import React from 'react';
import { Href, router } from 'expo-router';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useFormikContext } from 'formik';

import { AppErrorMessage, AppForm, AppFormField, SubmitButton } from '@/components/form';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import { useToast } from '@/context/ToastContext';
import { AmbassadorApplicationFormValues, AmbassadorApplicationValidationSchema } from '@/data/referralValidation';
import { referralService } from '@/lib/services/referralService';
import { AmbassadorStatus } from '@/types/referral.types';

function SocialLinksFields({ colors }: { colors: ReturnType<typeof useColors> }) {
    const { values, setFieldValue, errors, touched } = useFormikContext<AmbassadorApplicationFormValues>();
    const links = values.socialLinks ?? [];
    const socialErrors = (errors.socialLinks as ({ url?: string } | string)[] | string | undefined);
    const socialTouched = touched.socialLinks as { url?: boolean }[] | boolean | undefined;

    React.useEffect(() => {
        if (links.length === 0) {
            setFieldValue('socialLinks', [{ url: '' }]);
        }
    }, [links.length, setFieldValue]);

    return (
        <View className="mt-1">
            <AppText className="mb-2 text-sm font-semibold" color={colors.textPrimary}>Social Media Links</AppText>
            <AppText className="mb-2 text-xs" color={colors.textSecondary}>Add your public profile links (include `https://`).</AppText>

            {links.map((item, index) => {
                const rowError = Array.isArray(socialErrors) ? socialErrors[index] : undefined;
                const rowTouched = Array.isArray(socialTouched) ? socialTouched[index] : undefined;
                const urlError = typeof rowError === 'object' && rowError ? rowError.url : undefined;
                const urlTouched = typeof rowTouched === 'object' && rowTouched ? rowTouched.url : false;

                return (
                    <View key={`social_link_${index}`} className="mb-3 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                        <AppFormField
                            name={`socialLinks.${index}.url`}
                            label="Profile Link"
                            placeholder="e.g. https://instagram.com/yourhandle"
                            required
                            type="url"
                        />
                        {urlError ? <AppErrorMessage error={urlError} visible={Boolean(urlTouched)} /> : null}
                        {links.length > 1 ? (
                            <Pressable
                                onPress={() => {
                                    const next = links.filter((_, i) => i !== index);
                                    setFieldValue('socialLinks', next);
                                }}
                                className="mt-2 self-start rounded-lg border px-3 py-2"
                                style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                                accessibilityRole="button"
                                accessibilityLabel={`Remove social link ${index + 1}`}
                            >
                                <AppText className="text-xs font-semibold" color={colors.textPrimary}>Remove Link</AppText>
                            </Pressable>
                        ) : null}
                    </View>
                );
            })}

            <Pressable
                onPress={() => {
                    setFieldValue('socialLinks', [...links, { url: '' }]);
                }}
                className="rounded-lg border px-3 py-2"
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
                accessibilityRole="button"
                accessibilityLabel="Add another social link"
            >
                <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>Add Another</AppText>
            </Pressable>

            {typeof socialErrors === 'string' ? <AppErrorMessage error={socialErrors} visible={Boolean(socialTouched)} /> : null}
        </View>
    );
}

export default function AmbassadorScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const [status, setStatus] = React.useState<AmbassadorStatus | null>(null);
    const [profileFixMessage, setProfileFixMessage] = React.useState<string | null>(null);
    const [keyboardInset, setKeyboardInset] = React.useState(0);

    React.useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (event) => {
            setKeyboardInset(event.endCoordinates?.height ?? 0);
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardInset(0);
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    React.useEffect(() => {
        const load = async () => {
            try {
                const nextStatus = await referralService.getAmbassadorStatus();
                setStatus(nextStatus);
            } catch {
                showToast('Could not load ambassador status right now.', { variant: 'error' });
            }
        };
        void load();
    }, [showToast]);

    const handleApply = React.useCallback(async (values: AmbassadorApplicationFormValues) => {
        const gradYear = Number(values.graduationYear);
        setProfileFixMessage(null);
        try {
            const next = await referralService.applyForAmbassador({
                campus: values.campus.trim(),
                faculty: values.faculty.trim(),
                studentId: values.studentId.trim(),
                graduationYear: gradYear,
                socialFollowing: (values.socialLinks ?? [])
                    .map((item) => ({
                        url: item.url.trim(),
                    }))
                    .filter((item) => item.url),
                whyApply: values.whyApply.trim(),
            });
            setStatus(next);
            showToast('Ambassador application submitted.', { variant: 'success' });
        } catch (error) {
            const e = error as {
                response?: { data?: { message?: string; errors?: { missing_fields?: string[] } } };
                message?: string;
            };
            const message = e?.response?.data?.message ?? e?.message ?? 'Could not submit application.';
            const missingFields = e?.response?.data?.errors?.missing_fields ?? [];
            const needsProfileUpdate =
                /update your full profile details/i.test(message) || (Array.isArray(missingFields) && missingFields.length > 0);

            if (needsProfileUpdate) {
                const details = missingFields.length > 0 ? ` Missing: ${missingFields.join(', ')}.` : '';
                setProfileFixMessage(`Please complete your profile before applying.${details}`);
                showToast('Please complete your profile details first.', { variant: 'warning' });
            } else {
                showToast(message, { variant: 'error' });
            }
        }
    }, [showToast]);

    const hasApprovedAmbassadorAccess = Boolean(status?.isAmbassador || status?.status === 'approved');

    return (
        <Screen title="Campus Ambassador" className="pt-2">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="none"
                    automaticallyAdjustKeyboardInsets
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 180 + keyboardInset, flexGrow: 1 }}
                >
                <View className="rounded-3xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.primary }}>
                    <AppText className="text-lg font-extrabold" color={colors.white}>Campus Ambassador Program</AppText>
                    <AppText className="mt-1 text-sm" color="rgba(255,255,255,0.92)">
                        Ambassadors unlock higher referral rates and campus leaderboard visibility.
                    </AppText>
                </View>

                <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>Current Status</AppText>
                    <AppText className="mt-2 text-base font-bold" color={status?.status === 'approved' ? colors.success : colors.textPrimary}>
                        {status?.status ? status.status.replace('_', ' ').toUpperCase() : 'LOADING'}
                    </AppText>
                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                        Reward Rate: {status?.rewardRatePercent ?? 5}%
                    </AppText>
                    {status?.reviewMessage ? (
                        <AppText className="mt-2 text-xs" color={colors.textSecondary}>{status.reviewMessage}</AppText>
                    ) : null}
                </View>

                {hasApprovedAmbassadorAccess ? (
                    <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>Ambassador Access Active</AppText>
                        <AppText className="mt-2 text-xs" color={colors.textSecondary}>
                            Your ambassador status is approved. Higher referral rewards are now active on your account.
                        </AppText>
                    </View>
                ) : (
                    <View className="mt-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}>
                        <AppText className="text-sm font-semibold" color={colors.textPrimary}>Apply to Become an Ambassador</AppText>

                        <AppForm<AmbassadorApplicationFormValues>
                            initialValues={{
                                campus: 'University of Ghana',
                                faculty: 'Engineering',
                                studentId: 'UG123',
                                graduationYear: '2027',
                                socialLinks: [{ url: 'https://instagram.com/yourhandle' }],
                                whyApply: 'I can grow campus adoption.',
                            }}
                            validationSchema={AmbassadorApplicationValidationSchema}
                            onSubmit={async (values, { setSubmitting }) => {
                                try {
                                    await handleApply(values);
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            <View className="mt-3">
                                <AppFormField name="campus" label="Campus" placeholder="e.g. University of Ghana" required />
                            </View>
                            <AppFormField name="faculty" label="Faculty" placeholder="e.g. Engineering" required />
                            <AppFormField name="studentId" label="Student ID" placeholder="e.g. UG12345" required />
                            <AppFormField name="graduationYear" label="Graduation Year" placeholder="e.g. 2027" type="number" required />
                            <SocialLinksFields colors={colors} />
                            <AppFormField
                                name="whyApply"
                                label="Why You Are Applying"
                                placeholder="e.g. I can grow creator adoption on my campus through events and workshops."
                                multiline
                                numberOfLines={5}
                                required
                            />

                            <View className="mt-1">
                                <SubmitButton title="Submit Application" />
                            </View>
                        </AppForm>

                        {profileFixMessage ? (
                            <View className="mt-3 rounded-xl border p-3" style={{ borderColor: `${colors.warning}66`, backgroundColor: `${colors.warning}10` }}>
                                <AppText className="text-sm font-semibold" color={colors.warning}>Profile Update Required</AppText>
                                <AppText className="mt-1 text-xs" color={colors.textSecondary}>{profileFixMessage}</AppText>
                                <Pressable
                                    onPress={() => router.push('/profile/edit' as Href)}
                                    className="mt-3 rounded-lg border py-2"
                                    style={{ borderColor: colors.border, backgroundColor: colors.background }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Go to edit profile"
                                >
                                    <AppText className="text-center text-xs font-semibold" color={colors.textPrimary}>Go To Edit Profile</AppText>
                                </Pressable>
                            </View>
                        ) : null}
                    </View>
                )}

                {status?.status === 'pending' ? (
                    <Pressable
                        className="mt-3 rounded-xl border px-4 py-3"
                        style={{ borderColor: `${colors.info}66`, backgroundColor: `${colors.info}10` }}
                        accessibilityRole="text"
                    >
                        <AppText className="text-sm font-semibold" color={colors.info}>Application Pending Review</AppText>
                        <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                            You will receive a push notification once your application is approved or rejected.
                        </AppText>
                    </Pressable>
                ) : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}
