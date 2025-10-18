import React, { createContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'vi' | 'en';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const LANGUAGE_STORAGE_KEY = 'ai-storyboard-language';

export const LanguageContext = createContext<LanguageContextType>({
    locale: 'vi',
    setLocale: () => {},
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [locale, setLocale] = useState<Locale>(() => {
        try {
            const storedLocale = localStorage.getItem(LANGUAGE_STORAGE_KEY);
            return (storedLocale as Locale) || 'vi';
        } catch {
            return 'vi';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
        } catch (error) {
            console.error("Failed to save language to localStorage", error);
        }
    }, [locale]);

    return (
        <LanguageContext.Provider value={{ locale, setLocale }}>
            {children}
        </LanguageContext.Provider>
    );
};
