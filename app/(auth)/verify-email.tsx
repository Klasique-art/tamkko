import { Href, router, useLocalSearchParams } from 'expo-router';
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
    const params = useLocalSearchParams<{ email?: string }>();
    const email = String(params.email || 'new.user@tamkko.app');

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

                <FormStatusMessage />
                <SubmitButton title="Verify & Continue" />
                <FormLoader visible={loadingVisible} message="Verifying code" />
            </AppForm>
        </AuthShell>
    );
}
