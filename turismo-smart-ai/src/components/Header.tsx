import { Menu, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onCreateClick: () => void;
  onOpenDeployModal: () => void;
}

export function Header({ onCreateClick, onOpenDeployModal }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#inicio"
          className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0"
        >
          Turismo Smart AI
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <a
            href="#catalogo"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Catálogo
          </a>
          <a
            href="#mapa"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Mapa interactivo
          </a>
          <a
            href="#asistente"
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Asistente AI
          </a>
          <button
            type="button"
            onClick={onOpenDeployModal}
            className="hover:text-stone-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Conexión nube
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-[#FBF9F5] bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Registrar lugar</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-stone-200 bg-[#FBF9F5] px-4 py-3 flex flex-col gap-1">
          <a
            href="#catalogo"
            onClick={() => setMobileOpen(false)}
            className="py-2.5 px-2 text-sm font-medium text-stone-700 hover:text-stone-900 rounded-md hover:bg-stone-100"
          >
            Catálogo
          </a>
          <a
            href="#mapa"
            onClick={() => setMobileOpen(false)}
            className="py-2.5 px-2 text-sm font-medium text-stone-700 hover:text-stone-900 rounded-md hover:bg-stone-100"
          >
            Mapa interactivo
          </a>
          <a
            href="#asistente"
            onClick={() => setMobileOpen(false)}
            className="py-2.5 px-2 text-sm font-medium text-stone-700 hover:text-stone-900 rounded-md hover:bg-stone-100"
          >
            Asistente AI
          </a>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenDeployModal();
            }}
            className="py-2.5 px-2 text-left text-sm font-medium text-stone-700 hover:text-stone-900 rounded-md hover:bg-stone-100 cursor-pointer"
          >
            Conexión nube
          </button>
        </nav>
      )}
    </header>
  );
}
