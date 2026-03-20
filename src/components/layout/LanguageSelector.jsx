import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import MobileSelect from '@/components/ui/mobile-select';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find(l => l.code === i18n.language?.slice(0, 2)) || LANGUAGES[0];

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = code;
  };

  const options = LANGUAGES.map(lang => ({
    value: lang.code,
    label: lang.label,
    icon: lang.flag
  }));

  return (
    <MobileSelect
      trigger={
        <button className="flex items-center gap-1.5 h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.07] active:bg-white/[0.07] transition-colors text-white/50">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium hidden sm:inline">{current.flag} {current.label}</span>
          <span className="text-sm font-medium sm:hidden">{current.flag}</span>
        </button>
      }
      options={options}
      value={current.code}
      onChange={handleChange}
      title="Select Language"
    />
  );
}