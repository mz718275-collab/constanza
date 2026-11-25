import { Check, Copy, Database, GitBranch, Globe, X } from 'lucide-react';
import { useState } from 'react';
import type { SystemHealth } from '../types/place.ts';

interface DeployConfigModalProps {
  isOpen: boolean;
  health: SystemHealth | null;
  onClose: () => void;
  onRefreshData: () => Promise<void>;
}

const SUPABASE_SQL_SNIPPET = `create table if not exists public.lugares_turisticos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null,
  direccion text not null,
  contacto text not null,
  latitud double precision not null,
  longitud double precision not null,
  actividades text not null,
  horarios text not null,
  costo_entrada integer not null default 0,
  descripcion text not null default '',
  imagen_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);`;

export function DeployConfigModal({
  isOpen,
  health,
  onClose,
  onRefreshData,
}: DeployConfigModalProps) {
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(SUPABASE_SQL_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeedSupabase = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/supabase/seed', { method: 'POST' });
      const data = (await res.json()) as { seeded?: boolean; count?: number; message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo inicializar Supabase.');
      }
      setSeedMessage(
        data.seeded
          ? `Se cargaron ${data.count} atractivos en tu tabla de Supabase.`
          : data.message || 'La tabla ya contiene registros.'
      );
      await onRefreshData();
    } catch (err) {
      setSeedMessage(err instanceof Error ? err.message : 'Error al sincronizar.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deploy-modal-title"
      className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-[1px] flex items-center justify-center p-4"
    >
      <div className="bg-[#FBF9F5] border border-stone-300 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <div>
            <h2 id="deploy-modal-title" className="font-serif text-2xl font-semibold text-stone-900">
              Conexión Supabase, GitHub y Render
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Estado de los servicios y guía rápida de publicación con variables protegidas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 text-sm text-stone-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 rounded-lg p-4">
              <p className="text-xs text-stone-500">Base de datos activa</p>
              <p className="mt-1 font-semibold text-stone-900">
                {health?.storageMode === 'supabase'
                  ? 'Supabase PostgreSQL conectado'
                  : 'Almacenamiento local de respaldo'}
              </p>
              {health?.supabaseError && (
                <p className="mt-1 text-xs text-amber-800">{health.supabaseError}</p>
              )}
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-4">
              <p className="text-xs text-stone-500">Asistente Gemini API</p>
              <p className="mt-1 font-semibold text-stone-900">
                {health?.geminiConfigured
                  ? 'Conectado en servidor (GEMINI_API_KEY)'
                  : 'Pendiente de clave en entorno'}
              </p>
              <p className="mt-1 text-xs text-stone-500 tabular-nums">
                {health?.totalPlaces ?? 0} registros en catálogo
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#14532D]" />
                  <span>1. Preparar tabla en Supabase</span>
                </h3>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#14532D]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar SQL'}</span>
                </button>
              </div>
              <p className="text-xs text-stone-600">
                Ejecuta el archivo <code className="font-mono bg-stone-100 px-1 rounded">supabase/schema.sql</code> en el SQL Editor de Supabase para crear la tabla{' '}
                <code className="font-mono bg-stone-100 px-1 rounded">lugares_turisticos</code> con los 6 sitios iniciales.
              </p>
              <pre className="text-[11px] font-mono bg-stone-900 text-stone-100 p-3 rounded-lg overflow-x-auto">
                {SUPABASE_SQL_SNIPPET}
              </pre>
              {health?.supabaseConfigured && (
                <div className="pt-1 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={seeding}
                    onClick={handleSeedSupabase}
                    className="px-3.5 py-1.5 text-xs font-medium text-[#FBF9F5] bg-[#14532D] hover:bg-[#166534] rounded-md cursor-pointer disabled:opacity-50"
                  >
                    {seeding ? 'Sincronizando...' : 'Cargar datos iniciales en Supabase'}
                  </button>
                  {seedMessage && <span className="text-xs text-stone-700">{seedMessage}</span>}
                </div>
              )}
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#14532D]" />
                <span>2. Repositorio en GitHub</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Sube el proyecto a GitHub manteniendo <code className="font-mono bg-stone-100 px-1 rounded">.env</code> fuera del repositorio (<code className="font-mono bg-stone-100 px-1 rounded">.gitignore</code> lo excluye automáticamente). El archivo <code className="font-mono bg-stone-100 px-1 rounded">render.yaml</code> ya está listo para despliegue directo.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#14532D]" />
                <span>3. Publicación en Render</span>
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                En Render crea un <strong>Web Service</strong> conectado a tu repo de GitHub con Build Command{' '}
                <code className="font-mono bg-stone-100 px-1 rounded">npm install && npm run build</code> y Start Command{' '}
                <code className="font-mono bg-stone-100 px-1 rounded">npm start</code>. Agrega estas variables de entorno privadas:
              </p>
              <ul className="text-xs font-mono text-stone-800 bg-stone-50 border border-stone-200 rounded-md p-3 space-y-1">
                <li>GEMINI_API_KEY</li>
                <li>SUPABASE_URL</li>
                <li>SUPABASE_ANON_KEY</li>
                <li>SUPABASE_SERVICE_ROLE_KEY</li>
                <li>NODE_ENV=production</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
