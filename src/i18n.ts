import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import all language files
import en from "./i18n/locales/en.json";
import es from "./i18n/locales/es.json";
import pt from "./i18n/locales/pt.json";
import ja from "./i18n/locales/ja.json";
import zh from "./i18n/locales/zh.json";
import zhTW from "./i18n/locales/zh-TW.json";
import tr from "./i18n/locales/tr.json";
import ko from "./i18n/locales/ko.json";
import fr from "./i18n/locales/fr.json";
import nl from "./i18n/locales/nl.json";
import de from "./i18n/locales/de.json";
import ar from "./i18n/locales/ar.json";
import vi from "./i18n/locales/vi.json";
import th from "./i18n/locales/th.json";

// Add type declaration for JSON imports
declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
    ja: { translation: ja },
    zh: { translation: zh },
    "zh-TW": { translation: zhTW },
    tr: { translation: tr },
    ko: { translation: ko },
    fr: { translation: fr },
    nl: { translation: nl },
    de: { translation: de },
    ar: { translation: ar },
    vi: { translation: vi },
    th: { translation: th },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
