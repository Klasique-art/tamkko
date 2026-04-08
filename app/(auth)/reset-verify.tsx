import { Href, router, useLocalSearchParams } from 'expo-router';
import { FormikHelpers } from 'formik';
import React from 'react';
import { Pressable } from 'react-native';

import { AuthLinkRow, AuthShell, FormStatusMessage } from '@/components/auth';
import { AppForm, AppFormField, FormLoader, SubmitButton } from '@/components/form';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { OtpCodeFormValues, OtpValidationSchema } from '@/data/authValidation';
import { useToast } from '@/context/ToastContext';
import { delay } from '@/lib/utils/delay';

const initialValues: OtpCodeFormValues = {
    code: '',
};

export default function ResetVerifyScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const params = useLocalSearchParams<{ email?: string }>();
    const email = String(params.email || 'fan.viewer@tamkko.app');

    const [loadingVisible, setLoadingVisible] = React.useState(false);

    const handleSubmit = async (
        values: OtpCodeFormValues,
        { setStatus, setSubmitting }: FormikHelpers<OtpCodeFormValues>
    ) => {
        setStatus(undefined);
        setLoadingVisible(true);

        try {
            await delay(900);
            router.push({ pathname: '/(auth)/reset-password', params: { email, code: values.code.trim() } });
        } catch {
            setStatus({ error: 'Unable to verify reset code. Please try again.' });
        } finally {
            setLoadingVisible(false);
            setSubmitting(false);
        }
    };

    const resendCode = async () => {
        setLoadingVisible(true);
        await delay(800);
        setLoadingVisible(false);
        showToast('Reset code sent again.', { variant: 'info' });
    };

    return (
        <AuthShell
            title="Verify Reset Code"
            subtitle={`Enter the code sent to ${email} before creating a new password.`}
            footer={<AuthLinkRow prompt="Back to login?" actionLabel="Return" href={'/(auth)/login' as Href} />}
        >
            <AppForm initialValues={initialValues} validationSchema={OtpValidationSchema} onSubmit={handleSubmit}>
                <AppFormField<OtpCodeFormValues>
                    name="code"
                    label="Reset Code"
                    placeholder="123456"
                    type="number"
                    required
                />

                <Pressable
                    className="self-start"
                    onPress={resendCode}
                    accessibilityRole="button"
                    accessibilityLabel="Resend reset code"
                >
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                        Resend Code
                    </AppText>
                </Pressable>

                <FormStatusMessage />
                <SubmitButton title="Continue" />
                <FormLoader visible={loadingVisible} message="Checking code" />
            </AppForm>
        </AuthShell>
    );
}
