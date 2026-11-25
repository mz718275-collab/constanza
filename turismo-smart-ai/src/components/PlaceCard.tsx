import { Clock, ExternalLink, Landmark, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { TouristPlace } from '../types/place.ts';
import { formatGuaranies, getGoogleMapsPlaceUrl } from '../utils/maps.ts';

interface PlaceCardProps {
  place: TouristPlace;
  isSelected: boolean;
  onSelectOnMap: (place: TouristPlace) => void;
  onViewDetails: (place: TouristPlace) => void;
  onEdit: (place: TouristPlace) => void;
  onDelete: (id: string) => Promise<void>;
}

export function PlaceCard({
  place,
  isSelected,
  onSelectOnMap,
  onViewDetails,
  onEdit,
  onDelete,
}: PlaceCardProps) {
  const [imgError, setImgError] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(place.id);
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <article
      className={`group flex flex-col bg-white rounded-xl border transition-colors ${
        isSelected
          ? 'border-[#14532D] ring-1 ring-[#14532D]/20'
          : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      <button
        type="button"
        onClick={() => onViewDetails(place)}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[11px] bg-[#EBE6DF] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532D]"
      >
        {place.imagen_url && !imgError ? (
          <img
            src={place.imagen_url}
            alt={place.nombre}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EBE6DF] to-[#DED7CC] p-6 text-center">
            <Landmark className="w-8 h-8 text-stone-500" />
            <span className="font-serif text-base font-medium text-stone-700 line-clamp-2">
              {place.nombre}
            </span>
          </div>
        )}
      </button>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-medium text-[#78350F]">{place.tipo}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-medium text-stone-700">
              {formatGuaranies(place.costo_entrada)}
            </span>
          </div>

          <h3 className="mt-1.5 font-serif text-2xl font-semibold leading-snug text-stone-900">
            <button
              type="button"
              onClick={() => onViewDetails(place)}
              className="text-left hover:text-[#14532D] transition-colors cursor-pointer"
            >
              {place.nombre}
            </button>
          </h3>

          <p className="mt-2 text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {place.actividades}
          </p>

          <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
            <p className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 mt-0.5 text-stone-400 shrink-0" />
              <span className="line-clamp-1">{place.direccion}</span>
            </p>
            <p className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 mt-0.5 text-stone-400 shrink-0" />
              <span className="line-clamp-1">{place.horarios}</span>
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectOnMap(place)}
              className="px-3 py-1.5 text-xs font-medium text-[#14532D] bg-[#F4EFE6] hover:bg-[#EBE6DF] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Ver en mapa
            </button>
            <a
              href={getGoogleMapsPlaceUrl(place.latitud, place.longitud)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-stone-300 rounded-md transition-colors whitespace-nowrap shrink-0"
              title="Abrir ubicación en Google Maps"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {confirmingDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Confirmar'}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmingDelete(false)}
                className="px-2 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(place)}
                aria-label={`Editar ${place.nombre}`}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                aria-label={`Eliminar ${place.nombre}`}
                className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
