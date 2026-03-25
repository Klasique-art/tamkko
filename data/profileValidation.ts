import * as Yup from 'yup';

export const ProfileValidationSchema = Yup.object().shape({
    display_name: Yup.string().trim().min(2).max(50).required('Display name is required.'),
    bio: Yup.string().trim().max(160),
    website: Yup.string().trim().url('Enter a valid URL').nullable(),
});
