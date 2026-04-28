import * as Yup from 'yup';

export type LoginFormValues = {
    email: string;
    password: string;
};

export type SignupFormValues = {
    email: string;
    phone: string;
    username: string;
    fullName: string;
    password: string;
    confirm_password: string;
    agree_terms: boolean;
};

export type ForgotPasswordFormValues = {
    email: string;
};

export type OtpCodeFormValues = {
    code: string;
};

export type ResetPasswordFormValues = {
    password: string;
    confirm_password: string;
};

export type ReactivateFormValues = {
    email: string;
    code: string;
};

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
const simplePhoneRegex = /^\+?[1-9]\d{7,14}$/;
const sixDigitCodeRegex = /^\d{6}$/;

export const LoginValidationSchema = Yup.object().shape({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
    password: Yup.string().notRequired(),
});

export const SignupValidationSchema = Yup.object().shape({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
    phone: Yup.string()
        .trim()
        .matches(simplePhoneRegex, 'Please enter a valid phone number.')
        .required('Phone number is required.'),
    username: Yup.string()
        .trim()
        .min(3, 'Username must be at least 3 characters.')
        .max(30, 'Username must be at most 30 characters.')
        .matches(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores.')
        .required('Username is required.'),
    fullName: Yup.string()
        .trim()
        .min(2, 'Full name is too short.')
        .required('Full name is required.'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters.')
        .matches(
            strongPasswordRegex,
            'Password must include uppercase, lowercase, number, and special character.'
        )
        .required('Password is required.'),
    confirm_password: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match.')
        .required('Please confirm your password.'),
    agree_terms: Yup.boolean()
        .oneOf([true], 'You must agree to the terms and conditions.')
        .required('You must agree to the terms and conditions.'),
});

export const ForgotPasswordValidationSchema = Yup.object().shape({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
});

export const OtpValidationSchema = Yup.object().shape({
    code: Yup.string()
        .trim()
        .matches(sixDigitCodeRegex, 'Enter a valid 6-digit code.')
        .required('Code is required.'),
});

export const ResetPasswordValidationSchema = Yup.object().shape({
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters.')
        .matches(
            strongPasswordRegex,
            'Password must include uppercase, lowercase, number, and special character.'
        )
        .required('Password is required.'),
    confirm_password: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match.')
        .required('Please confirm your password.'),
});

export const ReactivateValidationSchema = Yup.object().shape({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address.')
        .required('Email is required.'),
    code: Yup.string()
        .trim()
        .matches(sixDigitCodeRegex, 'Enter a valid 6-digit code.')
        .required('Code is required.'),
});
