import { Href, router } from 'expo-router';
import { FormikHelpers } from 'formik';
import React from 'react';

import { AuthLinkRow, AuthShell, FormStatusMessage } from '@/components/auth';
import { AppForm, AppFormField, FormLoader, SubmitButton } from '@/components/form';
import { ReactivateFormValues, ReactivateValidationSchema } from '@/data/authValidation';
import { useToast } from '@/context/ToastContext';
import { delay } from '@/lib/utils/delay';

const initialValues: ReactivateFormValues = {
    email: '',
    code: '',
};

export default function ReactivateScreen() {
    const { showToast } = useToast();
    const [loadingVisible, setLoadingVisible] = React.useState(false);

    const handleSubmit = async (
        values: ReactivateFormValues,
        { setStatus, setSubmitting }: FormikHelpers<ReactivateFormValues>
    ) => {
        setStatus(undefined);
        setLoadingVisible(true);

        try {
            void values;
            await delay(1200);
            showToast('Account reactivated successfully.', { variant: 'success' });
            router.replace('/(tabs)/profile' as Href);
        } catch {
            setStatus({ error: 'Unable to reactivate account right now.' });
        } finally {
            setLoadingVisible(false);
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Reactivate Account"
            subtitle="Enter your account email and reactivation code to recover access."
            footer={<AuthLinkRow prompt="Changed your mind?" actionLabel="Back to login" href={'/(auth)/login' as Href} />}
        >
            <AppForm initialValues={initialValues} validationSchema={ReactivateValidationSchema} onSubmit={handleSubmit}>
                <AppFormField<ReactivateFormValues>
                    name="email"
                    label="Email"
                    placeholder="name@example.com"
                    type="email"
                    required
                />
                <AppFormField<ReactivateFormValues>
                    name="code"
                    label="Reactivation Code"
                    placeholder="123456"
                    type="number"
                    required
                />

                <FormStatusMessage />
                <SubmitButton title="Reactivate Account" />
                <FormLoader visible={loadingVisible} message="Reactivating account" />
            </AppForm>
        </AuthShell>
    );
}
