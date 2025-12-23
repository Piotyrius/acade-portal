import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import kaCommon from "./locales/ka/common.json";
import ruCommon from "./locales/ru/common.json";

export const DEFAULT_LANGUAGE = "ka";
export const STORAGE_KEY = "i18n_language";

const getInitialLanguage = (): string => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === "ka" || stored === "ru")) {
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
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: ["ka", "ru"],
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



