"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Package, User, Lock, UserPlus } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

import { useState } from "react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  interface RegisterState {
  error?: string | Record<string, string[]>;
  success?: boolean;
}
const [state, formAction, pending] = useActionState(
    async (prevState: RegisterState | null, formData: FormData) => {
      if (formData.get("password") !== formData.get("confirmPassword")) {
        setPasswordError("Las contraseñas no coinciden");
        return prevState;
      } else {
        setPasswordError("");
      }
      const result = await createUserAction(formData);
      if (result?.success) {
        toast.success("¡Cuenta creada correctamente! Redirigiendo al login...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else if (result?.error) {
        toast.error(result.error);
      }
      return result;
    },
    null
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form action={formAction} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex flex-col items-center mb-4">
  <h1 className="text-2xl font-bold">Libre Scraping</h1>
</div>
<h2 className="text-xl font-semibold">Crear cuenta</h2>
<p className="text-muted-foreground text-balance">
  Regístrate para acceder a la plataforma
</p>
              </div>

              <div className="grid gap-6">
  <div className="grid gap-3">
    <Label htmlFor="email">Correo electrónico</Label>
    <Input
      id="email"
      name="email"
      type="email"
      placeholder="tucorreo@email.com"
      required
    />
  </div>

  <div className="grid gap-3">
    <Label htmlFor="username">Nombre de usuario</Label>
    <Input
      id="username"
      name="username"
      type="text"
      placeholder="tu_usuario"
      required
    />
  </div>

  <div className="grid gap-3">
  <Label htmlFor="password">Contraseña</Label>
  <Input
    id="password"
    name="password"
    type="password"
    placeholder="Mínimo 6 caracteres"
    required
    minLength={6}
    value={password}
    onChange={e => setPassword(e.target.value)}
  />
</div>
<div className="grid gap-3">
  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
  <Input
    id="confirmPassword"
    name="confirmPassword"
    type="password"
    placeholder="Repite la contraseña"
    required
    value={confirmPassword}
    onChange={e => setConfirmPassword(e.target.value)}
  />
  {passwordError && (
    <span className="text-red-500 text-xs mt-1">{passwordError}</span>
  )}
</div>
</div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear cuenta
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ¿Ya tienes cuenta? Iniciar sesión
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:flex flex-col items-center justify-center p-8 gap-4">
            <img className="w-35 h-10 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75" alt="Libre-Scraping Logo 1" />
            <img className="w-22 h-10 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75" alt="Libre-Scraping Logo 2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
