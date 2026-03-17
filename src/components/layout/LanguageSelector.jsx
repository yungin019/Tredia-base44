import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-colors text-white/50 hover:text-white/80">
          <Globe className="h-3.5 w-3.5" />
          <span className="text-[11px] font-mono font-medium hidden sm:inline">{current.flag} {current.code.toUpperCase()}</span>
          <span className="text-[11px] font-mono font-medium sm:hidden">{current.flag}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[#111118] border-white/[0.08] w-44 max-h-[340px] overflow-y-auto"
      >
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`flex items-center gap-2.5 text-[12px] cursor-pointer ${
              current.code === lang.code
                ? 'text-primary bg-primary/8'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {current.code === lang.code && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}