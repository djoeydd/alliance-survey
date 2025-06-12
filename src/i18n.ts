import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

// Import all language files
import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import ja from "./locales/ja.json";
import zh from "./locales/zh.json";
import zhTW from "./locales/zh-TW.json";
import tr from "./locales/tr.json";
import ko from "./locales/ko.json";
import fr from "./locales/fr.json";
import nl from "./locales/nl.json";
import de from "./locales/de.json";
import ar from "./locales/ar.json";

// Add type declaration for JSON imports
declare module "*.json" {
  const value: { [key: string]: any };
  export default value;
}

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
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
    },
    lng: "en", // Set English as default
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
