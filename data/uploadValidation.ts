import * as Yup from 'yup';

export const UploadVideoValidationSchema = Yup.object().shape({
    title: Yup.string().trim().min(3).max(120).required('Title is required'),
    caption: Yup.string().trim().max(500),
    hashtags: Yup.array().of(Yup.string().trim().max(50)).max(10),
    visibility: Yup.string().oneOf(['public', 'followers', 'subscribers']).required('Visibility is required'),
});
