import L from 'leaflet';
import { MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { PLACE_TYPES } from '../types/place.ts';
import type { PlaceInput, PlaceType, TouristPlace } from '../types/place.ts';

interface PlaceFormModalProps {
  isOpen: boolean;
  editingPlace: TouristPlace | null;
  onClose: () => void;
  onSave: (input: PlaceInput, existingId?: string) => Promise<void>;
}

const DEFAULT_FORM: PlaceInput = {
  nombre: '',
  tipo: 'Museo',
  direccion: '',
  contacto: '',
  latitud: -25.2819,
  longitud: -57.635,
  actividades: '',
  horarios: '',
  costo_entrada: 0,
  descripcion: '',
  imagen_url: '',
};

export function PlaceFormModal({
  isOpen,
  editingPlace,
  onClose,
  onSave,
}: PlaceFormModalProps) {
  const [form, setForm] = useState<PlaceInput>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickerMapRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editingPlace) {
      setForm({
        nombre: editingPlace.nombre,
        tipo: editingPlace.tipo,
        direccion: editingPlace.direccion,
        contacto: editingPlace.contacto,
        latitud: editingPlace.latitud,
        longitud: editingPlace.longitud,
        actividades: editingPlace.actividades,
        horarios: editingPlace.horarios,
        costo_entrada: editingPlace.costo_entrada,
        descripcion: editingPlace.descripcion,
        imagen_url: editingPlace.imagen_url || '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [isOpen, editingPlace]);

  // Mini OpenStreetMap coordinate picker inside modal
  useEffect(() => {
    if (!isOpen || !pickerMapRef.current) return;

    const initialLat = editingPlace ? editingPlace.latitud : DEFAULT_FORM.latitud;
    const initialLng = editingPlace ? editingPlace.longitud : DEFAULT_FORM.longitud;

    const map = L.map(pickerMapRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-map-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      html: '<div style="width:20px;height:20px;border-radius:9999px;background:#14532D;border:2px solid #FBF9F5;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>',
    });

    const marker = L.marker([initialLat, initialLng], { icon: pinIcon }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([lat, lng]);
      setForm((prev) => ({ ...prev, latitud: lat, longitud: lng }));
    });

    mapRef.current = map;
    markerRef.current = marker;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isOpen, editingPlace]);

  // Sync marker position when coordinates are edited manually
  useEffect(() => {
    if (
      markerRef.current &&
      mapRef.current &&
      Number.isFinite(form.latitud) &&
      Number.isFinite(form.longitud)
    ) {
      markerRef.current.setLatLng([form.latitud, form.longitud]);
    }
  }, [form.latitud, form.longitud]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(form, editingPlace?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el registro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-modal-title"
      className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-[1px] flex items-center justify-center p-4"
    >
      <div className="bg-[#FBF9F5] border border-stone-300 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between">
          <div>
            <h2 id="place-modal-title" className="font-serif text-2xl font-semibold text-stone-900">
              {editingPlace ? 'Editar atractivo cultural' : 'Registrar nuevo atractivo'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Completa los datos del sitio y selecciona su ubicación exacta en OpenStreetMap.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Nombre del lugar *
              </label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Museo del Barro"
                className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Tipo de atractivo *
              </label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as PlaceType })}
                className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:outline-none"
              >
                {PLACE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Costo de entrada (Guaraníes — 0 si es gratis) *
              </label>
              <input
                type="number"
                min={0}
                step={500}
                required
                value={form.costo_entrada}
                onChange={(e) =>
                  setForm({ ...form, costo_entrada: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2 text-sm font-mono tabular-nums text-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Dirección *
              </label>
              <input
                type="text"
                required
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                placeholder="Ej. Grabadores del Cabichuí 2716, Asunción"
                className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Contacto (teléfono o correo) *
              </label>
              <input
                type="text"
                required
                value={form.contacto}
                onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                placeholder="Ej. (021) 607-996"
                className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Horarios de atención *
              </label>
              <input
                type="text"
                required
                value={form.horarios}
                onChange={(e) => setForm({ ...form, horarios: e.target.value })}
                placeholder="Ej. Miércoles a sábado de 14:00 a 20:00 hs"
                className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Actividades principales *
              </label>
              <textarea
                rows={2}
                required
                value={form.actividades}
                onChange={(e) => setForm({ ...form, actividades: e.target.value })}
                placeholder="Ej. Exhibición de cerámica popular, arte indígena y arte contemporáneo paraguayo."
                className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Descripción editorial
              </label>
              <textarea
                rows={2}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Breve reseña histórica o cultural del sitio..."
                className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                URL de imagen (opcional)
              </label>
              <input
                type="text"
                value={form.imagen_url || ''}
                onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                placeholder="https://... (dejar vacío para usar portada tipográfica)"
                className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3.5 py-2 text-sm text-stone-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#14532D]" />
                <span>Haz clic en OpenStreetMap para fijar latitud y longitud</span>
              </p>
              <span className="text-xs font-mono tabular-nums text-stone-500">
                {form.latitud}, {form.longitud}
              </span>
            </div>

            <div className="h-48 w-full rounded-lg overflow-hidden border border-stone-300 bg-[#EBE6DF]">
              <div ref={pickerMapRef} className="w-full h-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Latitud *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={form.latitud}
                  onChange={(e) => setForm({ ...form, latitud: Number(e.target.value) })}
                  className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3 py-1.5 text-sm font-mono tabular-nums text-stone-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Longitud *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={form.longitud}
                  onChange={(e) => setForm({ ...form, longitud: Number(e.target.value) })}
                  className="w-full bg-white border border-stone-300 focus:border-[#14532D] rounded-lg px-3 py-1.5 text-sm font-mono tabular-nums text-stone-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-[#FBF9F5] bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving
                ? 'Guardando...'
                : editingPlace
                  ? 'Guardar cambios'
                  : 'Registrar atractivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
