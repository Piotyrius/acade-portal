import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { requestPasswordReset } from "@/api/endpoints/auth";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const { t } = useTranslation("common");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
      toast({
        title: t("auth.resetRequestSentTitle"),
        description: t("auth.resetRequestSentDescription"),
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        t("auth.resetRequestErrorDefault");
      toast({
        title: t("auth.resetRequestErrorTitle"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src="/logo.svg" alt="Cyber Academy" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl">
            {t("auth.resetPasswordTitle")}
          </CardTitle>
          <CardDescription>
            {isSubmitted
              ? t("auth.resetSubmittedMessage")
              : t("auth.resetInstructions")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link to="/login">{t("auth.backToLogin")}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("auth.sendingResetLink") : t("auth.sendResetLink")}
              </Button>
              <div className="text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">
                  {t("auth.backToLogin")}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
