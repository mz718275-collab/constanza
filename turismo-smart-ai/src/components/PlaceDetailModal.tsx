import { ExternalLink, Landmark, MapPin, Navigation, Pencil, X } from 'lucide-react';
import { useState } from 'react';
import type { TouristPlace } from '../types/place.ts';
import {
  formatGuaranies,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsPlaceUrl,
} from '../utils/maps.ts';

interface PlaceDetailModalProps {
  place: TouristPlace | null;
  onClose: () => void;
  onEdit: (place: TouristPlace) => void;
  onShowOnMap: (place: TouristPlace) => void;
}

export function PlaceDetailModal({
  place,
  onClose,
  onEdit,
  onShowOnMap,
}: PlaceDetailModalProps) {
  const [imgError, setImgError] = useState(false);

  if (!place) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-[1px] flex items-center justify-center p-4"
    >
      <div className="bg-[#FBF9F5] border border-stone-300 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
        <div className="relative h-56 sm:h-64 w-full bg-[#EBE6DF] shrink-0">
          {place.imagen_url && !imgError ? (
            <img
              src={place.imagen_url}
              alt={place.nombre}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EBE6DF] to-[#DED7CC]">
              <Landmark className="w-10 h-10 text-stone-500" />
              <span className="font-serif text-xl text-stone-700">{place.nombre}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-stone-800 hover:bg-white shadow-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="font-medium text-[#78350F]">{place.tipo}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-stone-800 tabular-nums">
                {formatGuaranies(place.costo_entrada)}
              </span>
            </div>
            <h2
              id="detail-modal-title"
              className="mt-1.5 font-serif text-3xl font-semibold text-stone-900"
            >
              {place.nombre}
            </h2>
            {place.descripcion && (
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{place.descripcion}</p>
            )}
          </div>

          <dl className="border-t border-stone-200 divide-y divide-stone-200 text-sm">
            <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="text-xs font-medium text-stone-500">Dirección</dt>
              <dd className="sm:col-span-2 text-stone-900">{place.direccion}</dd>
            </div>
            <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="text-xs font-medium text-stone-500">Horarios</dt>
              <dd className="sm:col-span-2 text-stone-900">{place.horarios}</dd>
            </div>
            <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="text-xs font-medium text-stone-500">Actividades</dt>
              <dd className="sm:col-span-2 text-stone-900">{place.actividades}</dd>
            </div>
            <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="text-xs font-medium text-stone-500">Contacto</dt>
              <dd className="sm:col-span-2 text-stone-900">{place.contacto}</dd>
            </div>
            <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="text-xs font-medium text-stone-500">Coordenadas GPS</dt>
              <dd className="sm:col-span-2 font-mono text-xs tabular-nums text-stone-700">
                {place.latitud.toFixed(6)}, {place.longitud.toFixed(6)}
              </dd>
            </div>
          </dl>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={getGoogleMapsPlaceUrl(place.latitud, place.longitud)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-[#FBF9F5] bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ver en Google Maps</span>
              </a>
              <a
                href={getGoogleMapsDirectionsUrl(place.latitud, place.longitud)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-stone-800 bg-[#F4EFE6] hover:bg-[#EBE6DF] rounded-lg transition-colors"
              >
                <Navigation className="w-4 h-4 text-[#14532D]" />
                <span>Cómo llegar</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onShowOnMap(place);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-stone-700 bg-white border border-stone-300 hover:border-stone-400 rounded-lg transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Ubicar en OpenStreetMap</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(place);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span>Editar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
