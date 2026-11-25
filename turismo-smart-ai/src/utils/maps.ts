import type { TouristPlace } from '../types/place.ts';

export function formatGuaranies(amount: number): string {
  if (!amount || amount <= 0) {
    return 'Entrada gratuita';
  }
  return `${new Intl.NumberFormat('es-PY').format(amount)} Gs.`;
}

export function getGoogleMapsPlaceUrl(latitud: number, longitud: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitud},${longitud}`)}`;
}

export function getGoogleMapsDirectionsUrl(latitud: number, longitud: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitud},${longitud}`)}`;
}

export function getGoogleMapsMultiRouteUrl(places: TouristPlace[]): string {
  if (places.length === 0) {
    return 'https://www.google.com/maps/@-25.2819,-57.6350,14z';
  }
  if (places.length === 1) {
    return getGoogleMapsPlaceUrl(places[0].latitud, places[0].longitud);
  }
  const limited = places.slice(0, 9);
  const path = limited.map((p) => `${p.latitud},${p.longitud}`).join('/');
  return `https://www.google.com/maps/dir/${path}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateGoogleMyMapsKml(places: TouristPlace[]): string {
  const placemarks = places
    .map(
      (place) => `    <Placemark>
      <name>${escapeXml(place.nombre)}</name>
      <description>${escapeXml(
        `${place.tipo} | Costo: ${formatGuaranies(place.costo_entrada)}\nDirección: ${place.direccion}\nHorarios: ${place.horarios}\nContacto: ${place.contacto}\nActividades: ${place.actividades}`
      )}</description>
      <Point>
        <coordinates>${place.longitud},${place.latitud},0</coordinates>
      </Point>
    </Placemark>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Turismo Smart AI — Catálogo Cultural</name>
    <description>Ubicaciones registradas en Turismo Smart AI listas para importar en Google My Maps.</description>
${placemarks}
  </Document>
</kml>`;
}

export function downloadKmlForGoogleMaps(places: TouristPlace[]): void {
  const kml = generateGoogleMyMapsKml(places);
  const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'turismo-smart-ai-ubicaciones.kml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
