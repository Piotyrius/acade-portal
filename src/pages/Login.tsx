import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/api/endpoints/auth";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation("common");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Validate token before redirecting
      import('@/utils/auth').then(({ validateAuth }) => {
        validateAuth().then((isValid) => {
          if (isValid) {
            navigate('/dashboard', { replace: true });
          }
        });
      });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(email, password);
      // The login response includes both tokens and user data
      if (!response.user) {
        throw new Error("User data not received from server");
      }
      const user = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.first_name,
        lastName: response.user.last_name,
        role: response.user.role,
      };
      // Set auth with tokens and user data 
      setAuth(user, response.access, response.refresh);
      
      // Verify token is stored
      const storedToken = useAuthStore.getState().accessToken;
      if (!storedToken) {
        console.error("Token was not stored correctly");
        throw new Error("Failed to store authentication token");
      }
      
      toast({
        title: t("auth.loginSuccessTitle"),
        description: t("auth.loginSuccessMessage"),
      });
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        t("auth.loginErrorDefault");
      toast({
        title: t("auth.loginFailedTitle"),
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src="/logo.svg" alt={t("app.appLogoAlt")} className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl">
            {t("auth.loginTitle")}
          </CardTitle>
          <CardDescription>
            {t("auth.loginSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("auth.signingIn") : t("auth.loginButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
