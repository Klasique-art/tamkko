import { Href, router } from 'expo-router';
import { FormikHelpers } from 'formik';
import React from 'react';
import { Pressable } from 'react-native';

import { AuthLinkRow, AuthShell, FormStatusMessage } from '@/components/auth';
import { AppForm, AppFormField, FormLoader, SubmitButton } from '@/components/form';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { LoginFormValues, LoginValidationSchema } from '@/data/authValidation';
import { useAuth } from '@/context/AuthContext';
import { delay } from '@/lib/utils/delay';

const initialValues: LoginFormValues = {
    email: '',
    password: '',
};

export default function LoginScreen() {
    const colors = useColors();
    const { login } = useAuth();
    const [loadingVisible, setLoadingVisible] = React.useState(false);

    const handleSubmit = async (
        values: LoginFormValues,
        { setStatus, setSubmitting }: FormikHelpers<LoginFormValues>
    ) => {
        setStatus(undefined);
        setLoadingVisible(true);

        try {
            await delay(1200);
            await login({
                email: values.email.trim().toLowerCase(),
                password: values.password,
            });
            router.replace('/(tabs)/profile' as Href);
        } catch {
            setStatus({ error: 'Unable to log in right now. Please try again.' });
        } finally {
            setLoadingVisible(false);
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Welcome Back"
            subtitle="Log in to follow creators, send tips, and personalize your TAMKKO feed."
            footer={<AuthLinkRow prompt="Don't have an account?" actionLabel="Sign up" href={'/(auth)/register' as Href} />}
        >
            <AppForm initialValues={initialValues} validationSchema={LoginValidationSchema} onSubmit={handleSubmit}>
                <AppFormField<LoginFormValues>
                    name="email"
                    label="Email"
                    placeholder="name@example.com"
                    type="email"
                    required
                />
                <AppFormField<LoginFormValues>
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    required
                    icon="eye"
                    iconAria="Toggle password visibility"
                />

                <Pressable
                    className="self-end"
                    onPress={() => router.push('/(auth)/forgot-password' as Href)}
                    accessibilityRole="button"
                    accessibilityLabel="Forgot password"
                    accessibilityHint="Opens password recovery screen"
                >
                    <AppText className="text-sm font-semibold" color={colors.textPrimary}>
                        Forgot Password?
                    </AppText>
                </Pressable>

                <FormStatusMessage />
                <SubmitButton title="Log In" />
                <FormLoader visible={loadingVisible} message="Signing you in" />
            </AppForm>
        </AuthShell>
    );
}
