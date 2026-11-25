import { ArrowDownRight, MessageSquareText } from 'lucide-react';
import { HERO_IMAGE_URL } from '../data/seedPlaces.ts';
import type { TouristPlace } from '../types/place.ts';

interface HeroProps {
  places: TouristPlace[];
  storageMode: 'supabase' | 'local';
}

export function Hero({ places, storageMode }: HeroProps) {
  const totalMuseums = places.filter((p) => p.tipo === 'Museo').length;
  const freePlaces = places.filter((p) => p.costo_entrada === 0).length;

  return (
    <section id="inicio" className="border-b border-stone-200 bg-[#FBF9F5]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-10 pb-10 lg:pt-14 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-1">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500 font-medium">
                Asunción, Paraguay · Patrimonio Cultural y Turismo
              </p>
              <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-[3.35rem] font-semibold leading-[1.08] tracking-tight text-stone-900 text-balance">
                Museos, sitios históricos y cultura en un catálogo vivo
              </h1>
              <p className="mt-5 text-base sm:text-[17px] leading-relaxed text-stone-600 max-w-xl">
                Consulta horarios, actividades y costos de entrada en Guaraníes, ubica cada espacio
                en OpenStreetMap con transferencia directa a Google Maps y planifica recorridos
                junto al asistente inteligente.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#catalogo"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#FBF9F5] bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>Explorar catálogo</span>
                <ArrowDownRight className="w-4 h-4" />
              </a>
              <a
                href="#asistente"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-stone-800 bg-[#F4EFE6] hover:bg-[#EBE6DF] border border-stone-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <MessageSquareText className="w-4 h-4 text-[#14532D]" />
                <span>Consultar asistente</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <div className="relative flex-1 min-h-[260px] lg:min-h-[360px] rounded-xl overflow-hidden border border-stone-200 bg-[#EBE6DF]">
              <img
                src={HERO_IMAGE_URL}
                alt="Corredor histórico y cultural de Asunción, Paraguay al atardecer"
                referrerPolicy="no-referrer"
                className="w-full h-full lg:h-full object-cover"
              />
            </div>
            <p className="mt-2.5 text-xs font-serif italic text-stone-500">
              Fig. 1 — Corredor arquitectónico e histórico del centro de Asunción, Paraguay.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-stone-500">Lugares registrados</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-stone-900 tabular-nums">
              {places.length} atractivos
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Museos en catálogo</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-stone-900 tabular-nums">
              {totalMuseums} museos
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Acceso sin costo</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-stone-900 tabular-nums">
              {freePlaces} entradas gratuitas
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Cartografía y origen</p>
            <p className="mt-1 text-sm font-medium text-stone-900">
              OpenStreetMap + Google Maps ·{' '}
              <span className="text-[#14532D]">
                {storageMode === 'supabase' ? 'Supabase activo' : 'Base local activa'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
