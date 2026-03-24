import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import i18n, { LANGUAGE_STORAGE_KEY, SupportedLanguage, setupI18n } from '@/config/i18n';

interface LanguageContextType {
    language: SupportedLanguage;
    setLanguage: (language: SupportedLanguage) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<SupportedLanguage>('en');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const bootstrap = async () => {
            const initialLanguage = await setupI18n();
            setLanguageState(initialLanguage);
            setIsReady(true);
        };

        void bootstrap();
    }, []);

    const setLanguage = useCallback(async (nextLanguage: SupportedLanguage) => {
        if (nextLanguage === language) return;

        setLanguageState(nextLanguage);
        await i18n.changeLanguage(nextLanguage);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }, [language]);

    const value = useMemo(
        () => ({
            language,
            setLanguage,
        }),
        [language, setLanguage]
    );

    if (!isReady) return null;

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
