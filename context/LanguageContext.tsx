import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const LANGUAGE_STORAGE_KEY = '@tamkko_language';
export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

interface LanguageContextType {
    language: SupportedLanguage;
    setLanguage: (language: SupportedLanguage) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const normalizeLanguage = (language?: string | null): SupportedLanguage => {
    const value = (language || '').slice(0, 2).toLowerCase();
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(value) ? (value as SupportedLanguage) : 'en';
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<SupportedLanguage>('en');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
                setLanguageState(normalizeLanguage(stored));
            } finally {
                setIsReady(true);
            }
        };

        void bootstrap();
    }, []);

    const setLanguage = useCallback(async (nextLanguage: SupportedLanguage) => {
        if (nextLanguage === language) return;

        setLanguageState(nextLanguage);
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
