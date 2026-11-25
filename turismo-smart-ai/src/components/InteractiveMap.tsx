import L from 'leaflet';
import {
  Clock,
  Compass,
  Download,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Route,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { TouristPlace } from '../types/place.ts';
import {
  downloadKmlForGoogleMaps,
  formatGuaranies,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsMultiRouteUrl,
  getGoogleMapsPlaceUrl,
} from '../utils/maps.ts';

interface InteractiveMapProps {
  places: TouristPlace[];
  selectedPlace: TouristPlace | null;
  onSelectPlace: (place: TouristPlace) => void;
  onOpenDetail: (place: TouristPlace) => void;
}

function buildMarkerIcon(index: number, isActive: boolean): L.DivIcon {
  const bg = isActive ? '#14532D' : '#1C1917';
  const ring = isActive ? '0 0 0 4px rgba(20, 83, 45, 0.25)' : '0 2px 6px rgba(0,0,0,0.28)';
  const scale = isActive ? 'scale(1.12)' : 'scale(1)';

  return L.divIcon({
    className: 'custom-map-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
    html: `<div style="width:30px;height:30px;border-radius:9999px;background:${bg};color:#FBF9F5;border:2px solid #FBF9F5;box-shadow:${ring};display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;transform:${scale};transition:transform 150ms ease;">${index + 1}</div>`,
  });
}

function buildSafePopupElement(place: TouristPlace): HTMLElement {
  const container = document.createElement('div');
  container.className = 'text-stone-900 space-y-1.5';

  const kicker = document.createElement('p');
  kicker.className = 'text-[11px] font-medium text-[#78350F]';
  kicker.textContent = `${place.tipo} · ${formatGuaranies(place.costo_entrada)}`;
  container.appendChild(kicker);

  const title = document.createElement('h4');
  title.className = 'font-serif text-lg font-semibold leading-tight text-stone-900';
  title.textContent = place.nombre;
  container.appendChild(title);

  const address = document.createElement('p');
  address.className = 'text-xs text-stone-600';
  address.textContent = place.direccion;
  container.appendChild(address);

  const hours = document.createElement('p');
  hours.className = 'text-xs text-stone-500';
  hours.textContent = place.horarios;
  container.appendChild(hours);

  const linkRow = document.createElement('div');
  linkRow.className = 'pt-2 border-t border-stone-100 flex items-center gap-3';

  const gmLink = document.createElement('a');
  gmLink.href = getGoogleMapsPlaceUrl(place.latitud, place.longitud);
  gmLink.target = '_blank';
  gmLink.rel = 'noopener noreferrer';
  gmLink.className = 'text-xs font-semibold text-[#14532D] hover:underline';
  gmLink.textContent = 'Abrir en Google Maps ↗';
  linkRow.appendChild(gmLink);

  container.appendChild(linkRow);
  return container;
}

export function InteractiveMap({
  places,
  selectedPlace,
  onSelectPlace,
  onOpenDetail,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Leaflet OpenStreetMap instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-25.2805, -57.6305],
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      markerMapRef.current.clear();
    };
  }, []);

  // Synchronize markers whenever places or selectedPlace changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    markerMapRef.current.clear();

    if (places.length === 0) return;

    const bounds: L.LatLngTuple[] = [];

    places.forEach((place, index) => {
      const isActive = selectedPlace?.id === place.id;
      const marker = L.marker([place.latitud, place.longitud], {
        icon: buildMarkerIcon(index, isActive),
        title: place.nombre,
      });

      marker.bindPopup(buildSafePopupElement(place));
      marker.on('click', () => {
        onSelectPlace(place);
      });

      marker.addTo(layerGroup);
      markerMapRef.current.set(place.id, marker);
      bounds.push([place.latitud, place.longitud]);
    });

    if (selectedPlace && markerMapRef.current.has(selectedPlace.id)) {
      const activeMarker = markerMapRef.current.get(selectedPlace.id);
      if (activeMarker) {
        map.panTo([selectedPlace.latitud, selectedPlace.longitud], { animate: true });
        activeMarker.openPopup();
      }
    } else if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [44, 44], maxZoom: 14 });
    }
  }, [places, selectedPlace, onSelectPlace]);

  const activePlace = selectedPlace || places[0] || null;

  return (
    <section id="mapa" className="py-12 lg:py-16 border-b border-stone-200 bg-[#F4EFE6]/60">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-stone-500 font-medium">
              Cartografía abierta · OpenStreetMap y transferencia a Google Maps
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-stone-900">
              Mapa interactivo de atractivos
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={getGoogleMapsMultiRouteUrl(places)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Route className="w-4 h-4 text-[#14532D]" />
              <span>Pasar ruta a Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>

            <button
              type="button"
              disabled={places.length === 0}
              onClick={() => downloadKmlForGoogleMaps(places)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-[#FBF9F5] bg-[#1C1917] hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Exportar KML (Google My Maps)</span>
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <div className="relative h-[420px] lg:h-[520px] w-full rounded-xl overflow-hidden border border-stone-300 bg-[#EBE6DF]">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {places.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {places.map((place, index) => {
                  const isCurrent = activePlace?.id === place.id;
                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => onSelectPlace(place)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#14532D] text-[#FBF9F5] border-[#14532D]'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="font-mono tabular-nums mr-1.5">{index + 1}.</span>
                      {place.nombre}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 bg-white rounded-xl border border-stone-200 p-6 flex flex-col justify-between">
            {activePlace ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-medium text-[#78350F]">{activePlace.tipo}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-stone-800 tabular-nums">
                      {formatGuaranies(activePlace.costo_entrada)}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-serif text-2xl font-semibold text-stone-900 leading-snug">
                    {activePlace.nombre}
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                    {activePlace.descripcion || activePlace.actividades}
                  </p>
                </div>

                <dl className="border-t border-stone-100 pt-4 space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-stone-500">Dirección</dt>
                      <dd className="text-stone-900 font-medium mt-0.5">{activePlace.direccion}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-stone-500">Horarios</dt>
                      <dd className="text-stone-900 font-medium mt-0.5">{activePlace.horarios}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-stone-500">Contacto</dt>
                      <dd className="text-stone-900 font-medium mt-0.5">{activePlace.contacto}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Compass className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <dt className="text-stone-500">Coordenadas GPS</dt>
                      <dd className="font-mono text-stone-800 tabular-nums mt-0.5">
                        {activePlace.latitud.toFixed(4)}, {activePlace.longitud.toFixed(4)}
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="border-t border-stone-100 pt-4">
                  <p className="text-xs font-medium text-stone-500 mb-1.5">Actividades disponibles</p>
                  <p className="text-xs text-stone-700 leading-relaxed">{activePlace.actividades}</p>
                </div>

                <div className="pt-2 space-y-2">
                  <a
                    href={getGoogleMapsPlaceUrl(activePlace.latitud, activePlace.longitud)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#FBF9F5] bg-[#14532D] hover:bg-[#166534] rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ver ubicación en Google Maps</span>
                  </a>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={getGoogleMapsDirectionsUrl(activePlace.latitud, activePlace.longitud)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-800 bg-[#F4EFE6] hover:bg-[#EBE6DF] rounded-lg transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#14532D]" />
                      <span>Cómo llegar</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(activePlace)}
                      className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-stone-700 border border-stone-200 hover:border-stone-300 rounded-lg transition-colors cursor-pointer"
                    >
                      Ficha completa
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-auto text-center py-12">
                <p className="font-serif text-xl text-stone-800">Sin ubicaciones visibles</p>
                <p className="mt-1 text-xs text-stone-500">
                  Ajusta los filtros de búsqueda o registra un nuevo atractivo.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
