import { Href, router } from 'expo-router';
import { isAxiosError } from 'axios';
import { FormikHelpers } from 'formik';
import React from 'react';
import { Pressable } from 'react-native';

import { AuthLinkRow, AuthShell, FormStatusMessage } from '@/components/auth';
import { AppForm, AppFormField, FormLoader, SubmitButton } from '@/components/form';
import AppText from '@/components/ui/AppText';
import { useColors } from '@/config/colors';
import { LoginFormValues, LoginValidationSchema } from '@/data/authValidation';
import { useAuth } from '@/context/AuthContext';

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
            await login({
                emailOrUsername: values.email.trim().toLowerCase(),
                password: values.password,
            });
            router.replace('/(tabs)/profile' as Href);
        } catch (error) {
            const fallback = 'Unable to log in right now. Please try again.';

            if (isAxiosError(error)) {
                const responseData = error.response?.data as
                    | { message?: string; errors?: { message?: string }[] }
                    | undefined;
                const firstValidationError = responseData?.errors?.find((item) => item?.message?.trim())?.message?.trim();
                setStatus({ error: firstValidationError || responseData?.message || fallback });
            } else {
                setStatus({ error: fallback });
            }
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
                    label="Email or Username"
                    placeholder="name@example.com or felixa"
                    type="email"
                    required
                />
                <AppFormField<LoginFormValues>
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
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
