import { Formik, FormikConfig, FormikValues } from 'formik';
import React from 'react';
import { View } from 'react-native';

type AppFormProps<Values extends FormikValues> = {
    formStyles?: string;
    children: React.ReactNode;
} & FormikConfig<Values>;

const AppForm = <Values extends FormikValues>({
    initialValues,
    onSubmit,
    validationSchema,
    formStyles,
    children,
    ...rest
}: AppFormProps<Values>) => {
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            {...rest}
        >
            {() => (
                <View className={`relative flex flex-col gap-4 ${formStyles || ''}`}>
                    {children}
                </View>
            )}
        </Formik>
    );
};

export default AppForm;
