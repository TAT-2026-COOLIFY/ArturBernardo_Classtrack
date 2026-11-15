import { createBrowserRouter } from "react-router";
import { Layout } from "@/app/components/layout";
import { ProtectedRoute } from "@/app/components/protected-route";
import { Login } from "@/app/pages/login";
import { Dashboard } from "@/app/pages/dashboard";
import { Alunos } from "@/app/pages/alunos";
import { Grupos } from "@/app/pages/grupos";
import { Planos } from "@/app/pages/planos";
import { Pagamentos } from "@/app/pages/pagamentos";
import { Calendario } from "@/app/pages/calendario";
import { Register } from "@/app/pages/register";
import { VerifyPin } from "@/app/pages/verify-pin";
import { AulasAvulsas } from "@/app/pages/aulas-avulsas";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  { path: "/register", Component: Register },
  { path: "/verify-pin", Component: VerifyPin },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: "alunos", Component: Alunos },
      { path: "grupos", Component: Grupos },
      { path: "planos", Component: Planos },
      { path: "pagamentos", Component: Pagamentos },
      { path: "calendario", Component: Calendario },
      { path: "aulas-avulsas", Component: AulasAvulsas},
    ],
  },
]);