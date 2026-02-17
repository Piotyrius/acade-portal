import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import kaCommon from "./locales/ka/common.json";
import ruCommon from "./locales/ru/common.json";
import enCommon from "./locales/en/common.json";

export const DEFAULT_LANGUAGE = "ka";
export const STORAGE_KEY = "i18n_language";

const SUPPORTED_LANGUAGES = ["ka", "ru", "en"] as const;

const getInitialLanguage = (): string => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
    return stored;
  }

  return DEFAULT_LANGUAGE;
};

void i18n.use(initReactI18next).init({
  resources: {
    ka: {
      common: kaCommon,
    },
    ru: {
      common: ruCommon,
    },
    en: {
      common: enCommon,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
  ns: ["common"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
});

// Persist language changes
i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, lng);
  }
});

export default i18n;

