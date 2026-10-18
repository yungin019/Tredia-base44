/**
 * generate-locale-files.mjs
 * Merges all feature-based translation files into one file per language.
 * Run: node scripts/generate-locale-files.mjs
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, '../src/locales');

// Import all feature files (same set as i18n.js)
import translations from '../src/locales/translations.js';
import enExtra from '../src/locales/en-extra.js';
import alpacaTranslations from '../src/locales/alpaca-translations.js';
import extraTranslations from '../src/locales/extra-translations.js';
import coreTranslations from '../src/locales/core-translations.js';
import portfolioTranslations from '../src/locales/portfolio-translations.js';
import deTranslations from '../src/locales/de-translations.js';
import ptTranslations from '../src/locales/pt-translations.js';
import tradersTranslations, { alpacaConnectorTranslations } from '../src/locales/traders-translations.js';

const ALL_LANGS = ['en', 'sv', 'fr', 'de', 'it', 'es', 'pt', 'ar', 'ja', 'zh', 'ko', 'ru', 'tr', 'nl', 'pl', 'th', 'id', 'ro', 'el'];

for (const lang of ALL_LANGS) {
  const base = translations[lang]?.translation || {};
  const coreKeys = coreTranslations[lang] || {};
  const portfolioKeys = portfolioTranslations[lang] || {};
  const deKeys = deTranslations[lang] || {};
  const ptKeys = ptTranslations[lang] || {};
  const tradersKeys = tradersTranslations[lang] || {};
  const alpacaConnectorKeys = alpacaConnectorTranslations[lang] || {};
  const alpacaKeys = alpacaTranslations[lang] || {};
  const extraKeys = extraTranslations[lang] || {};

  // Same merge order as i18n.js buildResources — later entries override earlier
  const merged = lang === 'en'
    ? { ...base, ...enExtra, ...coreKeys, ...portfolioKeys, ...deKeys, ...ptKeys, ...tradersKeys, ...alpacaConnectorKeys, ...alpacaKeys, ...extraKeys }
    : { ...base, ...coreKeys, ...portfolioKeys, ...deKeys, ...ptKeys, ...tradersKeys, ...alpacaConnectorKeys, ...alpacaKeys, ...extraKeys };

  const keyCount = Object.keys(merged).length;
  const content = `// Auto-generated merged translations for ${lang} (${keyCount} keys)\n// Regenerate via: node scripts/generate-locale-files.mjs\nexport default ${JSON.stringify(merged, null, 2)};\n`;

  writeFileSync(resolve(localesDir, `${lang}.js`), content);
  console.log(`  ${lang}.js — ${keyCount} keys`);
}

console.log('\n✓ Generated 19 language files in src/locales/');