import { Href, router } from 'expo-router';
import { isAxiosError } from 'axios';
import { FormikHelpers, useFormikContext } from 'formik';
import React from 'react';
import { Pressable, View } from 'react-native';

import { AuthLinkRow, AuthShell, FormStatusMessage } from '@/components/auth';
import AppErrorMessage from '@/components/form/AppErrorMessage';
import { AppForm, AppFormField, FormLoader, SubmitButton } from '@/components/form';
import ToggleField from '@/components/form/ToggleField';
import AppText from '@/components/ui/AppText';
import { SignupFormValues, SignupValidationSchema } from '@/data/authValidation';
import { authService } from '@/lib/services/authService';

const initialValues: SignupFormValues = {
    email: '',
    phone: '',
    username: '',
    fullName: '',
    password: '',
    confirm_password: '',
    agree_terms: false,
};

function TermsErrorMessage() {
    const { errors, touched } = useFormikContext<SignupFormValues>();
    return <AppErrorMessage error={errors.agree_terms} visible={Boolean(touched.agree_terms)} />;
}

export default function RegisterScreen() {
    const [loadingVisible, setLoadingVisible] = React.useState(false);
    const termsHref = '/terms' as Href;
    const privacyHref = '/(public)/privacy' as Href;

    const handleSubmit = async (
        values: SignupFormValues,
        { setStatus, setSubmitting }: FormikHelpers<SignupFormValues>
    ) => {
        setStatus(undefined);
        setLoadingVisible(true);

        try {
            const signupResponse = await authService.signup({
                email: values.email.trim().toLowerCase(),
                phone: values.phone.trim(),
                username: values.username.trim().toLowerCase(),
                fullName: values.fullName.trim(),
                password: values.password,
                confirm_password: values.confirm_password,
                agree_terms: values.agree_terms,
            });

            const verificationCode =
                (signupResponse as { data?: { verificationCode?: string; verification_code?: string } })?.data?.verificationCode ||
                (signupResponse as { data?: { verificationCode?: string; verification_code?: string } })?.data?.verification_code ||
                (signupResponse as { verificationCode?: string; verification_code?: string })?.verificationCode ||
                (signupResponse as { verificationCode?: string; verification_code?: string })?.verification_code;

            router.push({
                pathname: '/(auth)/verify-email',
                params: {
                    email: values.email.trim().toLowerCase(),
                    ...(verificationCode ? { verificationCode } : {}),
                },
            });
        } catch (error) {
            const fallback = 'Unable to create your account right now. Please try again.';

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
            title="Create Account"
            subtitle="Set up your profile so you can follow creators and unlock all community features."
            footer={<AuthLinkRow prompt="Already have an account?" actionLabel="Log in" href={'/(auth)/login' as Href} />}
        >
            <AppForm initialValues={initialValues} validationSchema={SignupValidationSchema} onSubmit={handleSubmit}>
                <AppFormField<SignupFormValues> name="username" label="Username" placeholder="felixa" required />
                <AppFormField<SignupFormValues> name="fullName" label="Full Name" placeholder="Felix Acheampong" required />
                <AppFormField<SignupFormValues> name="email" label="Email" placeholder="name@example.com" type="email" required />
                <AppFormField<SignupFormValues> name="phone" label="Phone" placeholder="+23312312312" type="tel" required />
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
                    name="agree_terms"
                    label={
                        <View className="flex-row flex-wrap items-center">
                            <AppText className="text-base font-nunbold">I agree to </AppText>
                            <Pressable
                                onPress={() => router.push(termsHref)}
                                accessibilityRole="link"
                                accessibilityLabel="Open Terms and Conditions"
                            >
                                <AppText className="text-base font-nunbold underline">Terms</AppText>
                            </Pressable>
                            <AppText className="text-base font-nunbold"> and </AppText>
                            <Pressable
                                onPress={() => router.push(privacyHref)}
                                accessibilityRole="link"
                                accessibilityLabel="Open Privacy Policy"
                            >
                                <AppText className="text-base font-nunbold underline">Privacy</AppText>
                            </Pressable>
                        </View>
                    }
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
