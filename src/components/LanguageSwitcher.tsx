import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DEFAULT_LANGUAGE } from "@/i18n";

type SupportedLang = "ka" | "ru" | "en";

const LANG_ORDER: SupportedLang[] = ["ka", "en", "ru"];

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("common");

  const current = (i18n.language as SupportedLang) || (DEFAULT_LANGUAGE as SupportedLang);

  const handleChange = (lng: SupportedLang) => {
    if (lng === current) return;
    void i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      {LANG_ORDER.map((lng) => (
        <Button
          key={lng}
          type="button"
          size="icon"
          variant={current === lng ? "default" : "outline"}
          className="h-8 w-8 p-0"
          onClick={() => handleChange(lng)}
          aria-pressed={current === lng}
          aria-label={
            lng === "ka"
              ? t("layout.languageKa")
              : lng === "ru"
              ? t("layout.languageRu")
              : t("layout.languageEn")
          }
        >
          {lng === "ka"
            ? t("layout.languageKa")
            : lng === "ru"
            ? t("layout.languageRu")
            : t("layout.languageEn")}
        </Button>
      ))}
    </div>
  );
};

