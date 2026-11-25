import { Plus, RotateCcw, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AiAssistant } from './components/AiAssistant.tsx';
import { DeployConfigModal } from './components/DeployConfigModal.tsx';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { InteractiveMap } from './components/InteractiveMap.tsx';
import { PlaceCard } from './components/PlaceCard.tsx';
import { PlaceDetailModal } from './components/PlaceDetailModal.tsx';
import { PlaceFormModal } from './components/PlaceFormModal.tsx';
import { PLACE_TYPES } from './types/place.ts';
import type { PlaceInput, SystemHealth, TouristPlace } from './types/place.ts';

const BUDGET_PRESETS = [
  { label: 'Cualquier presupuesto', value: '' },
  { label: 'Entrada gratuita (0 Gs.)', value: '0' },
  { label: 'Hasta 20.000 Gs.', value: '20000' },
  { label: 'Hasta 50.000 Gs.', value: '50000' },
  { label: 'Hasta 100.000 Gs.', value: '100000' },
];

export default function App() {
  const [places, setPlaces] = useState<TouristPlace[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [maxBudget, setMaxBudget] = useState<string>('');

  const [selectedPlace, setSelectedPlace] = useState<TouristPlace | null>(null);
  const [detailPlace, setDetailPlace] = useState<TouristPlace | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<TouristPlace | null>(null);
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [placesRes, healthRes] = await Promise.all([
        fetch('/api/places'),
        fetch('/api/health'),
      ]);

      if (!placesRes.ok) {
        throw new Error('No se pudieron cargar los atractivos turísticos.');
      }

      const placesData = (await placesRes.json()) as { places: TouristPlace[] };
      setPlaces(placesData.places || []);

      if (healthRes.ok) {
        const healthData = (await healthRes.json()) as SystemHealth;
        setHealth(healthData);
      }

      setSelectedPlace((prev) => {
        if (prev) {
          const stillExists = (placesData.places || []).find((p) => p.id === prev.id);
          if (stillExists) return stillExists;
        }
        return (placesData.places || [])[0] || null;
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const maxCost = maxBudget.trim() !== '' ? Number(maxBudget) : null;

    return places.filter((place) => {
      if (selectedType !== 'Todos' && place.tipo !== selectedType) {
        return false;
      }
      if (maxCost !== null && Number.isFinite(maxCost) && place.costo_entrada > maxCost) {
        return false;
      }
      if (q) {
        const haystack = [
          place.nombre,
          place.tipo,
          place.direccion,
          place.actividades,
          place.descripcion,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [places, searchQuery, selectedType, maxBudget]);

  const handleSavePlace = async (input: PlaceInput, existingId?: string) => {
    const endpoint = existingId ? `/api/places/${existingId}` : '/api/places';
    const method = existingId ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = (await response.json()) as { place?: TouristPlace; error?: string };
    if (!response.ok || !data.place) {
      throw new Error(data.error || 'No se pudo guardar el atractivo.');
    }

    await loadData();
    setSelectedPlace(data.place);
  };

  const handleDeletePlace = async (id: string) => {
    const response = await fetch(`/api/places/${id}`, { method: 'DELETE' });
    const data = (await response.json()) as { deleted?: boolean; error?: string };
    if (!response.ok) {
      setErrorMsg(data.error || 'No se pudo eliminar el atractivo.');
      return;
    }
    await loadData();
  };

  const handleSelectOnMap = useCallback((place: TouristPlace) => {
    setSelectedPlace(place);
    const mapSection = document.getElementById('mapa');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedType !== 'Todos' || maxBudget.trim() !== '';

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      <Header
        onCreateClick={() => {
          setEditingPlace(null);
          setFormOpen(true);
        }}
        onOpenDeployModal={() => setDeployModalOpen(true)}
      />

      <main className="flex-1">
        <Hero places={places} storageMode={health?.storageMode || 'local'} />

        <section id="catalogo" className="py-12 lg:py-16 border-b border-stone-200 bg-[#FBF9F5]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-stone-500 font-medium">
                  Archivo de atractivos · Altas, bajas, modificaciones y búsqueda
                </p>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
                  Catálogo turístico y cultural
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPlace(null);
                  setFormOpen(true);
                }}
                className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2 text-sm font-medium text-[#FBF9F5] bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo atractivo</span>
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-6 relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, dirección o actividad..."
                    className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none"
                  />
                </div>

                <div className="lg:col-span-3">
                  <select
                    aria-label="Filtrar por presupuesto máximo"
                    value={
                      BUDGET_PRESETS.some((p) => p.value === maxBudget) ? maxBudget : 'custom'
                    }
                    onChange={(e) => {
                      if (e.target.value !== 'custom') {
                        setMaxBudget(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none"
                  >
                    {BUDGET_PRESETS.map((preset) => (
                      <option key={preset.label} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                    {!BUDGET_PRESETS.some((p) => p.value === maxBudget) && (
                      <option value="custom">Presupuesto personalizado</option>
                    )}
                  </select>
                </div>

                <div className="lg:col-span-3">
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      placeholder="Monto máx. en Gs."
                      aria-label="Presupuesto máximo en Guaraníes"
                      className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 pr-12 py-2.5 text-sm font-mono tabular-nums text-stone-900 placeholder:font-sans placeholder:text-stone-400 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-medium pointer-events-none">
                      Gs.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EBE6DF] rounded-lg">
                  {['Todos', ...PLACE_TYPES].map((type) => {
                    const active = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-white text-stone-900 shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span className="tabular-nums">
                    Mostrando {filteredPlaces.length} de {places.length} registros
                  </span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedType('Todos');
                        setMaxBudget('');
                      }}
                      className="inline-flex items-center gap-1 font-medium text-[#14532D] hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Limpiar filtros</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {errorMsg}
              </div>
            )}

            {loading ? (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-96 rounded-xl border border-stone-200 bg-white animate-pulse"
                  />
                ))}
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="mt-8 rounded-xl border border-stone-200 bg-white p-10 text-center">
                <p className="font-serif text-2xl font-semibold text-stone-900">
                  No se encontraron atractivos con esos filtros
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Prueba ampliando el presupuesto en Guaraníes o cambiando la categoría seleccionada.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    isSelected={selectedPlace?.id === place.id}
                    onSelectOnMap={handleSelectOnMap}
                    onViewDetails={(p) => setDetailPlace(p)}
                    onEdit={(p) => {
                      setEditingPlace(p);
                      setFormOpen(true);
                    }}
                    onDelete={handleDeletePlace}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <InteractiveMap
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={(p) => setSelectedPlace(p)}
          onOpenDetail={(p) => setDetailPlace(p)}
        />

        <AiAssistant places={places} onSelectPlaceOnMap={handleSelectOnMap} />
      </main>

      <footer className="bg-[#F4EFE6] border-t border-stone-200 py-8">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-stone-600">
          <div>
            <p className="font-semibold text-stone-900">
              Turismo Smart AI · Colegio Nacional EMD Asunción Escalada
            </p>
            <p className="mt-0.5">
              Proyecto de Segundo Bachillerato Técnico en Informática · Gimenez Zarate, Constanza Milagros
            </p>
          </div>
          <div className="flex items-center gap-5">
            <a href="#catalogo" className="hover:text-stone-900 hover:underline">
              Catálogo
            </a>
            <a href="#mapa" className="hover:text-stone-900 hover:underline">
              Mapa OpenStreetMap
            </a>
            <button
              type="button"
              onClick={() => setDeployModalOpen(true)}
              className="hover:text-stone-900 hover:underline cursor-pointer"
            >
              Configuración Supabase y Render
            </button>
          </div>
        </div>
      </footer>

      <PlaceFormModal
        isOpen={formOpen}
        editingPlace={editingPlace}
        onClose={() => {
          setFormOpen(false);
          setEditingPlace(null);
        }}
        onSave={handleSavePlace}
      />

      <PlaceDetailModal
        place={detailPlace}
        onClose={() => setDetailPlace(null)}
        onEdit={(p) => {
          setEditingPlace(p);
          setFormOpen(true);
        }}
        onShowOnMap={handleSelectOnMap}
      />

      <DeployConfigModal
        isOpen={deployModalOpen}
        health={health}
        onClose={() => setDeployModalOpen(false)}
        onRefreshData={loadData}
      />
    </div>
  );
}
