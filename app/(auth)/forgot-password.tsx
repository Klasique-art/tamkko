import { Href, router } from 'expo-router';
import { FormikHelpers, useFormikContext } from 'formik';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';

import AppErrorMessage from '@/components/form/AppErrorMessage';
import AppForm from '@/components/form/AppForm';
import AppFormField from '@/components/form/AppFormField';
import FormLoader from '@/components/form/FormLoader';
import SubmitButton from '@/components/form/SubmitButton';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import { useColors } from '@/config/colors';
import {
    ForgotPasswordFormValues,
    ForgotPasswordValidationSchema,
} from '@/data/authValidation';

const ForgotPasswordFormLoader = () => {
    const { isSubmitting } = useFormikContext<ForgotPasswordFormValues>();
    return <FormLoader visible={isSubmitting} message="Sending reset instructions..." />;
};

const ForgotPasswordScreen = () => {
    const colors = useColors();
    const [apiError, setApiError] = useState('');
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    const handleSubmit = async (
        values: ForgotPasswordFormValues,
        { resetForm }: FormikHelpers<ForgotPasswordFormValues>
    ) => {
        try {
            setApiError('');

            // Simulated payload for POST /auth/forgot-password
            const payload = { email: values.email.trim() };
            await new Promise((resolve) => setTimeout(resolve, 1000));
            void payload;

            const simulatedExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            setSubmittedEmail(values.email.trim());
            setExpiresAt(simulatedExpiry);
            resetForm();
        } catch (error: any) {
            setApiError(
                error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    'Failed to request reset instructions. Please try again.'
            );
        }
    };

    return (
        <Screen>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingVertical: 24, paddingBottom: 40 }}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                >
                    <View
                        className="rounded-2xl border p-5"
                        style={{ backgroundColor: colors.backgroundAlt, borderColor: colors.border }}
                    >
                        <AppText className="mb-2 text-2xl font-bold">Forgot Password</AppText>
                        <AppText className="mb-5 text-sm" color={colors.textSecondary}>
                            Enter your email and we will send password reset instructions.
                        </AppText>

                        {submittedEmail ? (
                            <View className="gap-4">
                                <View
                                    className="rounded-lg p-3"
                                    style={{
                                        backgroundColor: `${colors.success}15`,
                                        borderWidth: 1,
                                        borderColor: `${colors.success}55`,
                                    }}
                                >
                                    <AppText className="text-sm font-semibold" color={colors.success}>
                                        Reset instructions sent to {submittedEmail}.
                                    </AppText>
                                    <AppText className="mt-1 text-xs" color={colors.textSecondary}>
                                        Reset token expires at {new Date(expiresAt).toLocaleString('en-US')}.
                                    </AppText>
                                </View>

                                <TouchableOpacity
                                    onPress={() => {
                                        setSubmittedEmail('');
                                        setExpiresAt('');
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel="Use another email"
                                >
                                    <AppText className="text-center text-sm font-semibold" color={colors.accent}>
                                        Use another email
                                    </AppText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <AppForm<ForgotPasswordFormValues>
                                initialValues={{ email: '' }}
                                onSubmit={handleSubmit}
                                validationSchema={ForgotPasswordValidationSchema}
                            >
                                <ForgotPasswordFormLoader />
                                {apiError ? <AppErrorMessage error={apiError} visible /> : null}

                                <AppFormField<ForgotPasswordFormValues>
                                    name="email"
                                    label="Email"
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    icon="email"
                                />

                                <SubmitButton title="Send Reset Instructions" />
                            </AppForm>
                        )}

                        <View className="mt-5 flex-row justify-center">
                            <TouchableOpacity
                                onPress={() => router.replace('/(auth)/login' as Href)}
                                accessibilityRole="button"
                                accessibilityLabel="Back to login"
                            >
                                <AppText className="text-sm font-semibold" color={colors.accent}>
                                    Back to Login
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
};

export default ForgotPasswordScreen;
