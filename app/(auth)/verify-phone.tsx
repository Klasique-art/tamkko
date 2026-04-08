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

export default function VerifyPhoneScreen() {
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
            await delay(1000);
            showToast('Phone number verified successfully.', { variant: 'success' });
            router.replace('/(tabs)/profile' as Href);
        } catch {
            setStatus({ error: 'Could not verify phone number. Please try again.' });
        } finally {
            setLoadingVisible(false);
            setSubmitting(false);
        }
    };

    const resendCode = async () => {
        setLoadingVisible(true);
        await delay(700);
        setLoadingVisible(false);
        showToast('SMS code sent again.', { variant: 'info' });
    };

    return (
        <AuthShell
            title="Verify Phone"
            subtitle="Confirm your phone number with the 6-digit SMS code."
            footer={<AuthLinkRow prompt="Need another method?" actionLabel="Back to login" href={'/(auth)/login' as Href} />}
        >
            <AppForm initialValues={initialValues} validationSchema={OtpValidationSchema} onSubmit={handleSubmit}>
                <AppFormField<OtpCodeFormValues>
                    name="code"
                    label="SMS Code"
                    placeholder="123456"
                    type="number"
                    required
                />

                <Pressable
                    className="self-start"
                    onPress={resendCode}
                    accessibilityRole="button"
                    accessibilityLabel="Resend SMS code"
                >
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                        Resend SMS Code
                    </AppText>
                </Pressable>

                <FormStatusMessage />
                <SubmitButton title="Verify Phone" />
                <FormLoader visible={loadingVisible} message="Verifying phone" />
            </AppForm>
        </AuthShell>
    );
}
