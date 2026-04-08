import { Href, router } from 'expo-router';
import { FormikHelpers } from 'formik';
import React from 'react';

import { AuthLinkRow, AuthShell, FormStatusMessage } from '@/components/auth';
import { AppForm, AppFormField, FormLoader, SubmitButton } from '@/components/form';
import { ForgotPasswordFormValues, ForgotPasswordValidationSchema } from '@/data/authValidation';
import { delay } from '@/lib/utils/delay';

const initialValues: ForgotPasswordFormValues = {
    email: '',
};

export default function ForgotPasswordScreen() {
    const [loadingVisible, setLoadingVisible] = React.useState(false);

    const handleSubmit = async (
        values: ForgotPasswordFormValues,
        { setStatus, setSubmitting }: FormikHelpers<ForgotPasswordFormValues>
    ) => {
        setStatus(undefined);
        setLoadingVisible(true);

        try {
            await delay(1100);
            router.push({
                pathname: '/(auth)/reset-verify',
                params: { email: values.email.trim().toLowerCase() },
            });
        } catch {
            setStatus({ error: 'Unable to start password reset. Please try again.' });
        } finally {
            setLoadingVisible(false);
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Forgot Password"
            subtitle="Enter your account email and we will send a verification code to continue reset."
            footer={<AuthLinkRow prompt="Remember your password?" actionLabel="Back to login" href={'/(auth)/login' as Href} />}
        >
            <AppForm
                initialValues={initialValues}
                validationSchema={ForgotPasswordValidationSchema}
                onSubmit={handleSubmit}
            >
                <AppFormField<ForgotPasswordFormValues>
                    name="email"
                    label="Email"
                    placeholder="name@example.com"
                    type="email"
                    required
                />
                <FormStatusMessage />
                <SubmitButton title="Send Verification Code" />
                <FormLoader visible={loadingVisible} message="Requesting reset code" />
            </AppForm>
        </AuthShell>
    );
}
