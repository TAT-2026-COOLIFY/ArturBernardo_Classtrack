import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { registerUser } from "@/app/services/auth";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Dumbbell } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !passwordConfirmation) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name, email, password, password_confirmation: passwordConfirmation });
      navigate("/verify-pin", { state: { email } });
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const firstError = Object.values(apiErrors)[0] as string[];
        setError(firstError[0]);
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
      console.error(err);
    } finally {
      setLoading(false);
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
              <Dumbbell className="size-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Classtrack</CardTitle>
          <CardDescription>Crie sua conta de Personal Trainer</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Confirmar senha</Label>
              <Input
                id="passwordConfirmation"
                type="password"
                placeholder="Digite a senha novamente"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Fazer login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}