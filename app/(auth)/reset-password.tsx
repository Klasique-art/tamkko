import { Href, router, useLocalSearchParams } from 'expo-router';
import { FormikHelpers } from 'formik';
import React from 'react';

import { AuthLinkRow, AuthShell, FormStatusMessage } from '@/components/auth';
import { AppForm, AppFormField, FormLoader, SubmitButton } from '@/components/form';
import { ResetPasswordFormValues, ResetPasswordValidationSchema } from '@/data/authValidation';
import { useToast } from '@/context/ToastContext';
import { delay } from '@/lib/utils/delay';

const initialValues: ResetPasswordFormValues = {
    password: '',
    confirm_password: '',
};

export default function ResetPasswordScreen() {
    const { showToast } = useToast();
    const params = useLocalSearchParams<{ email?: string; code?: string }>();
    const email = String(params.email || 'fan.viewer@tamkko.app');
    const code = String(params.code || '');

    const [loadingVisible, setLoadingVisible] = React.useState(false);

    const handleSubmit = async (
        values: ResetPasswordFormValues,
        { setStatus, setSubmitting, resetForm }: FormikHelpers<ResetPasswordFormValues>
    ) => {
        setStatus(undefined);
        setLoadingVisible(true);

        try {
            void code;
            void email;
            await delay(1200);
            resetForm();
            showToast('Password reset successful. Please log in.', { variant: 'success' });
            router.replace('/(auth)/login' as Href);
        } catch {
            setStatus({ error: 'Could not reset password. Please try again.' });
        } finally {
            setLoadingVisible(false);
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Set New Password"
            subtitle="Create a new strong password for your account."
            footer={<AuthLinkRow prompt="Remembered it now?" actionLabel="Back to login" href={'/(auth)/login' as Href} />}
        >
            <AppForm
                initialValues={initialValues}
                validationSchema={ResetPasswordValidationSchema}
                onSubmit={handleSubmit}
            >
                <AppFormField<ResetPasswordFormValues>
                    name="password"
                    label="New Password"
                    placeholder="Create new password"
                    type="password"
                    required
                    icon="eye"
                    iconAria="Toggle password visibility"
                />
                <AppFormField<ResetPasswordFormValues>
                    name="confirm_password"
                    label="Confirm Password"
                    placeholder="Re-enter new password"
                    type="password"
                    required
                    icon="eye"
                    iconAria="Toggle password visibility"
                />

                <FormStatusMessage />
                <SubmitButton title="Update Password" />
                <FormLoader visible={loadingVisible} message="Updating password" />
            </AppForm>
        </AuthShell>
    );
}
