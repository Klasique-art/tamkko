import { Href, router } from 'expo-router';
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

export default function TwoFactorScreen() {
    const colors = useColors();
    const { showToast } = useToast();
    const [loadingVisible, setLoadingVisible] = React.useState(false);

    const handleSubmit = async (
        values: OtpCodeFormValues,
        { setStatus, setSubmitting }: FormikHelpers<OtpCodeFormValues>
    ) => {
        setStatus(undefined);
        setLoadingVisible(true);

        try {
            void values;
            await delay(900);
            showToast('2FA verified.', { variant: 'success' });
            router.replace('/(tabs)/profile' as Href);
        } catch {
            setStatus({ error: 'Invalid authenticator code.' });
        } finally {
            setLoadingVisible(false);
            setSubmitting(false);
        }
    };

    const useBackupCode = async () => {
        setLoadingVisible(true);
        await delay(800);
        setLoadingVisible(false);
        showToast('Backup code flow is simulated for now.', { variant: 'info' });
    };

    return (
        <AuthShell
            title="Two-Factor Verification"
            subtitle="Enter your authenticator code to complete sign in."
            footer={<AuthLinkRow prompt="Need to restart?" actionLabel="Back to login" href={'/(auth)/login' as Href} />}
        >
            <AppForm initialValues={initialValues} validationSchema={OtpValidationSchema} onSubmit={handleSubmit}>
                <AppFormField<OtpCodeFormValues>
                    name="code"
                    label="Authenticator Code"
                    placeholder="123456"
                    type="number"
                    required
                />

                <Pressable
                    className="self-start"
                    onPress={useBackupCode}
                    accessibilityRole="button"
                    accessibilityLabel="Use backup code"
                >
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                        Use Backup Code
                    </AppText>
                </Pressable>

                <FormStatusMessage />
                <SubmitButton title="Verify" />
                <FormLoader visible={loadingVisible} message="Verifying 2FA" />
            </AppForm>
        </AuthShell>
    );
}
