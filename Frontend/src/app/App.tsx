import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import { useEffect } from "react";
import { AuthProvider } from "@/app/contexts/auth-context";
import { ThemeProvider } from "@/app/contexts/theme-context";

export default function App() {
  useEffect(() => {
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}