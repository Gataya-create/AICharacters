import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export const Header: React.FC = () => {
    const { t, setLocale, locale } = useTranslation();
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm shadow-md sticky top-0 z-10">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <svg className="h-8 w-8 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6l2-2m-2 2l-2-2m2 2l2 2m-2-2l-2 2" />
                        </svg>
                        <h1 className="text-xl font-bold text-white tracking-wider">{t('appTitle')}</h1>
                    </div>
                     <div className="flex items-center space-x-2">
                        <button onClick={() => setLocale('vi')} className={`px-3 py-1 text-sm rounded-md transition-colors ${locale === 'vi' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            VI
                        </button>
                        <button onClick={() => setLocale('en')} className={`px-3 py-1 text-sm rounded-md transition-colors ${locale === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            EN
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
