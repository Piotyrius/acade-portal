import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DEFAULT_LANGUAGE } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SupportedLang = "ka" | "ru" | "en";

const LANG_ORDER: SupportedLang[] = ["ka", "en", "ru"];

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation("common");

  const current = (i18n.language as SupportedLang) || (DEFAULT_LANGUAGE as SupportedLang);

  const handleChange = (lng: SupportedLang) => {
    if (lng === current) return;
    void i18n.changeLanguage(lng);
  };

  const currentLabel =
    current === "ka"
      ? t("layout.languageKa")
      : current === "ru"
      ? t("layout.languageRu")
      : t("layout.languageEn");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 p-0 text-xs"
          aria-label={t("layout.languageEn")}
        >
          {currentLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[6rem] text-xs">
        {LANG_ORDER.map((lng) => {
          const label =
            lng === "ka"
              ? t("layout.languageKa")
              : lng === "ru"
              ? t("layout.languageRu")
              : t("layout.languageEn");

          return (
            <DropdownMenuItem
              key={lng}
              onClick={() => handleChange(lng)}
              className={lng === current ? "font-semibold" : ""}
            >
              {label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

