import { Href, router } from 'expo-router';
import { FormikHelpers, useFormikContext } from 'formik';
import React from 'react';

import { AuthLinkRow, AuthShell, FormStatusMessage } from '@/components/auth';
import AppErrorMessage from '@/components/form/AppErrorMessage';
import { AppForm, AppFormField, FormLoader, SubmitButton } from '@/components/form';
import ToggleField from '@/components/form/ToggleField';
import { SignupFormValues, SignupValidationSchema } from '@/data/authValidation';
import { useAuth } from '@/context/AuthContext';
import { delay } from '@/lib/utils/delay';

const initialValues: SignupFormValues = {
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    agree_to_terms: false,
};

function TermsErrorMessage() {
    const { errors, touched } = useFormikContext<SignupFormValues>();
    return <AppErrorMessage error={errors.agree_to_terms} visible={Boolean(touched.agree_to_terms)} />;
}

export default function RegisterScreen() {
    const { signup } = useAuth();
    const [loadingVisible, setLoadingVisible] = React.useState(false);

    const handleSubmit = async (
        values: SignupFormValues,
        { setStatus, setSubmitting }: FormikHelpers<SignupFormValues>
    ) => {
        setStatus(undefined);
        setLoadingVisible(true);

        try {
            await delay(1400);
            await signup({
                email: values.email.trim().toLowerCase(),
                phone: values.phone.trim(),
                password: values.password,
                re_password: values.confirm_password,
                first_name: values.first_name.trim(),
                last_name: values.last_name.trim(),
                date_of_birth: values.date_of_birth,
                agree_to_terms: values.agree_to_terms,
            });

            router.push({ pathname: '/(auth)/verify-email', params: { email: values.email.trim().toLowerCase() } });
        } catch {
            setStatus({ error: 'Unable to create your account right now. Please try again.' });
        } finally {
            setLoadingVisible(false);
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Create Account"
            subtitle="Set up your profile so you can follow creators and unlock all community features."
            footer={<AuthLinkRow prompt="Already have an account?" actionLabel="Log in" href={'/(auth)/login' as Href} />}
        >
            <AppForm initialValues={initialValues} validationSchema={SignupValidationSchema} onSubmit={handleSubmit}>
                <AppFormField<SignupFormValues> name="first_name" label="First Name" placeholder="First name" required />
                <AppFormField<SignupFormValues> name="last_name" label="Last Name" placeholder="Last name" required />
                <AppFormField<SignupFormValues> name="email" label="Email" placeholder="name@example.com" type="email" required />
                <AppFormField<SignupFormValues> name="phone" label="Phone" placeholder="+233xxxxxxxxx" type="tel" required />
                <AppFormField<SignupFormValues> name="date_of_birth" label="Date of Birth" type="date" required />
                <AppFormField<SignupFormValues>
                    name="password"
                    label="Password"
                    placeholder="Create a strong password"
                    type="password"
                    required
                    icon="eye"
                    iconAria="Toggle password visibility"
                />
                <AppFormField<SignupFormValues>
                    name="confirm_password"
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    type="password"
                    required
                    icon="eye"
                    iconAria="Toggle password visibility"
                />

                <ToggleField
                    name="agree_to_terms"
                    label="I agree to Terms & Privacy"
                    description="You must agree before creating an account."
                />
                <TermsErrorMessage />
                <FormStatusMessage />
                <SubmitButton title="Create Account" />
                <FormLoader visible={loadingVisible} message="Creating account" />
            </AppForm>
        </AuthShell>
    );
}
