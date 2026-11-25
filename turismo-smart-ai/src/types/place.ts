export const PLACE_TYPES = [
  'Museo',
  'Sitio Histórico',
  'Espacio Cultural',
  'Parque y Naturaleza',
] as const;

export type PlaceType = (typeof PLACE_TYPES)[number];

export interface TouristPlace {
  id: string;
  nombre: string;
  tipo: PlaceType;
  direccion: string;
  contacto: string;
  latitud: number;
  longitud: number;
  actividades: string;
  horarios: string;
  costo_entrada: number;
  descripcion: string;
  imagen_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlaceInput {
  nombre: string;
  tipo: PlaceType;
  direccion: string;
  contacto: string;
  latitud: number;
  longitud: number;
  actividades: string;
  horarios: string;
  costo_entrada: number;
  descripcion: string;
  imagen_url?: string;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  referencedPlaceIds?: string[];
  timestamp?: string;
}

export interface SystemHealth {
  ok: boolean;
  storageMode: 'supabase' | 'local';
  supabaseConfigured: boolean;
  geminiConfigured: boolean;
  totalPlaces: number;
  supabaseError?: string;
}
