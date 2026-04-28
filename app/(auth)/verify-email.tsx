import { Href, router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { FormikHelpers } from 'formik';
import React from 'react';
import { Pressable } from 'react-native';

import { AuthLinkRow, AuthShell, FormStatusMessage } from '@/components/auth';
import { AppForm, AppFormField, FormLoader, SubmitButton } from '@/components/form';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { OtpCodeFormValues, OtpValidationSchema } from '@/data/authValidation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { delay } from '@/lib/utils/delay';

const initialValues: OtpCodeFormValues = {
    code: '',
};

export default function VerifyEmailScreen() {
    const colors = useColors();
    const { verifySignupCode } = useAuth();
    const { showToast } = useToast();
    const params = useLocalSearchParams<{ email?: string; verificationCode?: string }>();
    const email = String(params.email || 'new.user@tamkko.app');
    const verificationCode = typeof params.verificationCode === 'string' ? params.verificationCode : '';

    const [loadingVisible, setLoadingVisible] = React.useState(false);

    const handleSubmit = async (
        values: OtpCodeFormValues,
        { setStatus, setSubmitting }: FormikHelpers<OtpCodeFormValues>
    ) => {
        setStatus(undefined);
        setLoadingVisible(true);

        try {
            await delay(1000);
            await verifySignupCode(email, values.code.trim());
            showToast('Email verified successfully.', { variant: 'success' });
            router.replace('/(tabs)/profile' as Href);
        } catch {
            setStatus({ error: 'Invalid or expired code. Please try again.' });
        } finally {
            setLoadingVisible(false);
            setSubmitting(false);
        }
    };

    const resendCode = async () => {
        setLoadingVisible(true);
        await delay(850);
        setLoadingVisible(false);
        showToast('A new verification code was sent.', { variant: 'info' });
    };

    const handleCopyCode = async () => {
        if (!verificationCode) return;
        await Clipboard.setStringAsync(verificationCode);
        showToast('Verification code copied.', { variant: 'success', duration: 1400 });
    };

    return (
        <AuthShell
            title="Verify Email"
            subtitle={`Enter the 6-digit code sent to ${email}.`}
            footer={<AuthLinkRow prompt="Wrong email?" actionLabel="Back to sign up" href={'/(auth)/register' as Href} />}
        >
            <AppForm initialValues={initialValues} validationSchema={OtpValidationSchema} onSubmit={handleSubmit}>
                <AppFormField<OtpCodeFormValues>
                    name="code"
                    label="Verification Code"
                    placeholder="123456"
                    type="number"
                    required
                />

                <Pressable
                    className="self-start"
                    onPress={resendCode}
                    accessibilityRole="button"
                    accessibilityLabel="Resend verification code"
                >
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                        Resend Code
                    </AppText>
                </Pressable>

                {__DEV__ && verificationCode ? (
                    <Pressable
                        onPress={handleCopyCode}
                        className="rounded-xl border px-3 py-2"
                        style={{ borderColor: colors.border, backgroundColor: colors.backgroundAlt }}
                        accessibilityRole="button"
                        accessibilityLabel="Copy development verification code"
                        accessibilityHint="Copies the development verification code to clipboard"
                    >
                        <AppText className="text-xs" color={colors.textSecondary}>
                            Dev verification code
                        </AppText>
                        <AppText className="mt-1 text-base font-bold" color={colors.textPrimary}>
                            {verificationCode}
                        </AppText>
                        <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                            Tap to copy
                        </AppText>
                    </Pressable>
                ) : null}

                {__DEV__ && !verificationCode ? (
                    <AppText className="text-xs" color={colors.textSecondary}>
                        Dev note: backend did not return a verification code in signup response.
                    </AppText>
                ) : null}

                <FormStatusMessage />
                <SubmitButton title="Verify & Continue" />
                <FormLoader visible={loadingVisible} message="Verifying code" />
            </AppForm>
        </AuthShell>
    );
}
