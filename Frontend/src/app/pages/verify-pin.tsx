import { useState, type FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { verifyPin, resendPin } from "@/app/services/auth";
import { useAuth } from "@/app/contexts/auth-context";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { MailCheck } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";

export function VerifyPin() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUserFromToken } = useAuth();

    const emailFromState = (location.state as { email?: string })?.email;

    const [email] = useState(emailFromState ?? "");
    const [pinCode, setPinCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Se o usuário chegar direto na URL sem vir do cadastro, manda pro login
    useEffect(() => {
        if (!emailFromState) {
            navigate("/login");
        }
    }, [emailFromState, navigate]);

    // Cooldown do botão de reenviar (evita spam de cliques)
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (pinCode.length !== 6) {
            setError("O código deve ter 6 dígitos");
            return;
        }

        setLoading(true);
        try {
            const response = await verifyPin(email, pinCode);
            localStorage.setItem("token", response.token);
            setUserFromToken(response.data);
            navigate("/alunos");
        } catch (err: any) {
            console.log("err.message:", err.message);
            console.log("err.code:", err.code);
            console.log("err.response:", err.response);
            console.log("err.request:", err.request);
            setError(err.response?.data?.message ?? "Código inválido. Tente novamente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setSuccess("");
        setResending(true);
        try {
            await resendPin(email);
            setSuccess("Um novo código foi enviado para o seu e-mail.");
            setCooldown(60);
        } catch (err: any) {
            setError(err.response?.data?.message ?? "Erro ao reenviar código.");
            console.error(err);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 p-4 relative transition-colors duration-200">
            <div className="absolute top-4 right-4">
                <ThemeToggle variant="outline" />
            </div>
            <Card className="w-full max-w-md shadow-lg border-border">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-950/60 rounded-full">
                            <MailCheck className="size-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Verifique seu e-mail</CardTitle>
                    <CardDescription>
                        Enviamos um código de 6 dígitos para <strong>{email}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pinCode">Código de verificação</Label>
                            <Input
                                id="pinCode"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="000000"
                                value={pinCode}
                                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                                disabled={loading}
                                className="text-center text-2xl tracking-[0.5em] font-mono"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert>
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={loading || pinCode.length !== 6}>
                            {loading ? "Verificando..." : "Confirmar"}
                        </Button>

                        <p className="text-center text-sm text-gray-500 mt-4">
                            Não recebeu o código?{" "}
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending || cooldown > 0}
                                className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                            >
                                {cooldown > 0 ? `Reenviar em ${cooldown}s` : resending ? "Reenviando..." : "Reenviar código"}
                            </button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}