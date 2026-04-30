import * as Yup from 'yup';

export type AmbassadorApplicationFormValues = {
    campus: string;
    faculty: string;
    studentId: string;
    graduationYear: string;
    socialLinks: {
        url: string;
    }[];
    whyApply: string;
};

export const AmbassadorApplicationValidationSchema = Yup.object().shape({
    campus: Yup.string().trim().required('Campus is required.'),
    faculty: Yup.string().trim().required('Faculty is required.'),
    studentId: Yup.string().trim().required('Student ID is required.'),
    graduationYear: Yup.string()
        .trim()
        .matches(/^\d{4}$/, 'Graduation year must be 4 digits.')
        .required('Graduation year is required.'),
    socialLinks: Yup.array()
        .of(
            Yup.object().shape({
                url: Yup.string().trim().url('Enter a valid URL (include https://).').required('Link URL is required.'),
            })
        )
        .min(1, 'Add at least one social link.')
        .required('Add at least one social link.'),
    whyApply: Yup.string().trim().min(10, 'Please add more detail (at least 10 characters).').required('Why apply is required.'),
});
