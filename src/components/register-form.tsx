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
        toast.success("¡Cuenta creada exitosamente! Redirigiendo...");
        router.push('/login');
      } else if (result?.error) {
        toast.error(result.error);
      }
      return result;
    },
    null
  );

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="overflow-hidden border-0 w-full">
        <CardContent className="p-0">
          <div className="flex flex-col">
            <div className="p-6 sm:p-8 w-full">
              <div className="flex justify-center mb-4 sm:mb-6">
                <img
                  className="w-24 sm:w-32 h-auto object-contain"
                  src="https://www.somare.com/wp-content/uploads/2020/02/logo-cre.jpg"
                  alt="Logo C.R.E."
                />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-[#2c5d5a] text-center mb-2">
                Crear cuenta
              </h2>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">
                Regístrate para acceder a la plataforma
              </p>

              {state?.error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
                  {typeof state.error === 'string' ? state.error : 'Error al crear la cuenta'}
                </div>
              )}

              <form action={formAction} className="space-y-4 sm:space-y-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base text-gray-700">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tucorreo@email.com"
                    className="h-10 sm:h-11 border-gray-300 focus:border-[#2c5d5a] focus:ring-[#2c5d5a] text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="username" className="text-sm sm:text-base text-gray-700">Nombre de usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="tu_usuario"
                    className="h-10 sm:h-11 border-gray-300 focus:border-[#2c5d5a] focus:ring-[#2c5d5a] text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="password" className="text-sm sm:text-base text-gray-700">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="h-10 sm:h-11 border-gray-300 focus:border-[#2c5d5a] focus:ring-[#2c5d5a] text-sm sm:text-base"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm sm:text-base text-gray-700">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repite la contraseña"
                    className="h-10 sm:h-11 border-gray-300 focus:border-[#2c5d5a] focus:ring-[#2c5d5a] text-sm sm:text-base"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  {passwordError && (
                    <span className="text-red-500 text-xs mt-1">{passwordError}</span>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={pending}
                  className="w-full cursor-pointer bg-[#2c5d5a] hover:bg-[#244a48] text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors duration-300 disabled:opacity-70"
                >
                  {pending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>

                <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                  ¿Ya tienes una cuenta?{' '}
                  <Link href="/login" className="text-[#2c5d5a] font-medium hover:underline">
                    Iniciar sesión
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
