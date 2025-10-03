"use client";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="w-full bg-white border-b flex items-center px-6 py-2 z-20">
      
      {/* Centro: Logos y nombre */}
      <div className="flex-1 flex justify-center items-center gap-3 min-w-0">
        <Link href="/">
          <img className="w-35 h-10 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75" alt="Libre-Scraping Logo 1" />
        </Link>
        <Link href="/">
          <img className="w-23 h-10 object-contain" src="https://tuto-noticias-test.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75" alt="Libre-Scraping Logo 2" />
        </Link>
      </div>
    </nav>
  );
}

