import * as Yup from 'yup';

export const passwordSettingsValidationSchema = Yup.object().shape({
    current_password: Yup.string()
        .required('Current password is required')
        .min(8, 'Current password must be at least 8 characters'),
    new_password: Yup.string()
        .required('New password is required')
        .min(8, 'New password must be at least 8 characters')
        .matches(/[a-z]/, 'New password must include a lowercase letter')
        .matches(/[A-Z]/, 'New password must include an uppercase letter')
        .matches(/[0-9]/, 'New password must include a number')
        .matches(/[^A-Za-z0-9]/, 'New password must include a special character')
        .notOneOf([Yup.ref('current_password')], 'New password must be different from current password'),
    confirm_password: Yup.string()
        .required('Please confirm your new password')
        .oneOf([Yup.ref('new_password')], 'Passwords do not match'),
});
