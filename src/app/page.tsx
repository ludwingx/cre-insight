import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.has('session');
  
  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-gradient-to-br from-white via-white to-slate-100">
      <div className="flex flex-col items-center gap-4 w-full max-w-2xl px-6">
        
        {/* Logo */}
        <div className="flex items-center justify-center mt-4 mb-6">
          <img
            className="w-48 h-auto object-contain"
            src="https://www.somare.com/wp-content/uploads/2020/02/logo-cre.jpg"
            alt="Logo C.R.E."
          />
        </div>

        {/* Títulos */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#2c5d5a] mb-2 tracking-tight text-center">
          Bienvenido a <span className="text-gray-900">C.R.E. Insights</span>
        </h1>
        <h2 className="text-sm md:text-lg text-gray-600 mb-6 font-medium text-center">
          Plataforma para <span className="text-[#2c5d5a] font-semibold">monitorear</span>,{" "}
          <span className="text-[#2c5d5a] font-semibold">analizar</span> y{" "}
          <span className="text-[#2c5d5a] font-semibold">detectar riesgos</span> en redes sociales.
          <br />
          Centraliza publicaciones de <span className="font-semibold">Facebook</span>,{" "}
          <span className="font-semibold">Instagram</span> y{" "}
          <span className="font-semibold">TikTok</span>.
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          {hasAuthCookie ? (
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full cursor-pointer border-2 border-[#2c5d5a] hover:border-[#2c5d5a] text-lg py-6 rounded-xl transition-colors duration-300">
                Ir al Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full cursor-pointer border-2 border-[#2c5d5a] hover:border-[#2c5d5a] text-lg py-6 rounded-xl transition-colors duration-300">
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-sm text-gray-400 text-center w-full">
          © {new Date().getFullYear()} Desarrollado por{" "}
          <span className="text-[#2c5d5a] font-semibold">Other Brain 🧠</span>
        </footer>
      </div>
    </main>
  );
}