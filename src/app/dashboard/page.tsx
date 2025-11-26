
export default async function Page() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[calc(80vh-4rem)]">
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-6 text-center animate-in fade-in zoom-in duration-500">
        {/* Logo */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 mb-4">
          <img
            className="w-full h-full object-contain shadow-none"
            src="https://www.somare.com/wp-content/uploads/2020/02/logo-cre.jpg"
            alt="Logo C.R.E."
          />
        </div>

        {/* Títulos */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-primary">
            C.R.E. <span className="text-foreground">Insights</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Bienvenido al panel de control. Selecciona una opción del menú lateral para monitorear métricas, gestionar la reputación y analizar tendencias.
          </p>
        </div>
      </div>
    </div>
  );
}