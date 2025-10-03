"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/app/actions/auth"
import { toast } from "sonner"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(async (prevState: unknown, formData: FormData) => {
    const result = await loginAction(formData)
    if (result?.success) {
      toast.success("¡Inicio de sesión exitoso! Redirigiendo...")
      router.push('/dashboard')
    } else if (result?.error) {
      toast.error(result.error)
    }
    return result
  }, null)

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="overflow-hidden border-0 shadow-xl w-full">
        <CardContent className="p-0">
          <div className="flex flex-col">
            {/* Form Section */}
            <div className="p-6 sm:p-8 w-full">
              <div className="flex justify-center mb-4 sm:mb-6">
                <img
                  className="w-24 sm:w-32 h-auto object-contain"
                  src="https://www.somare.com/wp-content/uploads/2020/02/logo-cre.jpg"
                  alt="Logo C.R.E."
                />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-[#2c5d5a] text-center mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">
                Ingresa tus credenciales para acceder
              </p>

                {state?.error && (
                  <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
                    {state.error}
                  </div>
                )}

                <form action={formAction} className="space-y-4 sm:space-y-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="username" className="text-sm sm:text-base text-gray-700">Usuario</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Ingresa tu usuario"
                      className="h-10 sm:h-11 border-gray-300 focus:border-[#2c5d5a] focus:ring-[#2c5d5a] text-sm sm:text-base"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm sm:text-base text-gray-700">Contraseña</Label>
                      <Link href="/forgot-password" className="text-xs sm:text-sm text-[#2c5d5a] hover:underline whitespace-nowrap ml-2">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <Input 
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-10 sm:h-11 border-gray-300 focus:border-[#2c5d5a] focus:ring-[#2c5d5a] text-sm sm:text-base"
                      required 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={pending}
                    className="w-full bg-[#2c5d5a] hover:bg-[#244a48] text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors duration-300 disabled:opacity-70"
                  >
                    {pending ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </Button>

                  <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                    ¿No tienes una cuenta?{' '}
                    <Link href="/register" className="text-[#2c5d5a] font-medium hover:underline">
                      Regístrate
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

    </div>
  )
}