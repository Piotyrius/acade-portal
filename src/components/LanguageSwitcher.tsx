import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DEFAULT_LANGUAGE } from "@/i18n";

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("common");

  const current = i18n.language || DEFAULT_LANGUAGE;

  const handleChange = (lng: "ka" | "ru") => {
    if (lng === current) return;
    void i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="sm"
        variant={current === "ka" ? "default" : "outline"}
        onClick={() => handleChange("ka")}
      >
        {t("layout.languageKa")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant={current === "ru" ? "default" : "outline"}
        onClick={() => handleChange("ru")}
      >
        {t("layout.languageRu")}
      </Button>
    </div>
  );
};


