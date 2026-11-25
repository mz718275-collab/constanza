import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { PLACE_TYPES } from './src/types/place.ts';
import type { PlaceInput, PlaceType, TouristPlace } from './src/types/place.ts';
import { SEED_PLACES } from './src/data/seedPlaces.ts';

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_DB_PATH = path.join(DATA_DIR, 'places.json');
const SUPABASE_TABLE = 'lugares_turisticos';

function getSupabaseClient(): { client: SupabaseClient | null; configured: boolean } {
  const url = process.env.SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    return { client: null, configured: false };
  }

  return {
    client: createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    configured: true,
  };
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function ensureLocalDb(): Promise<TouristPlace[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as TouristPlace[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Initialize with seed places if file does not exist or is invalid
  }
  const initial = SEED_PLACES.map((p) => ({
    ...p,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  return initial;
}

async function writeLocalDb(places: TouristPlace[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(places, null, 2), 'utf-8');
}

function isSafeImageUrl(url: string): boolean {
  if (!url) return true;
  if (url.startsWith('/src/assets/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function validatePlaceInput(body: unknown): { data?: PlaceInput; error?: string } {
  if (!body || typeof body !== 'object') {
    return { error: 'El cuerpo de la solicitud es inválido.' };
  }
  const record = body as Record<string, unknown>;

  const nombre = typeof record.nombre === 'string' ? record.nombre.trim() : '';
  const tipo = typeof record.tipo === 'string' ? record.tipo.trim() : '';
  const direccion = typeof record.direccion === 'string' ? record.direccion.trim() : '';
  const contacto = typeof record.contacto === 'string' ? record.contacto.trim() : '';
  const actividades = typeof record.actividades === 'string' ? record.actividades.trim() : '';
  const horarios = typeof record.horarios === 'string' ? record.horarios.trim() : '';
  const descripcion = typeof record.descripcion === 'string' ? record.descripcion.trim() : '';
  const imagen_url = typeof record.imagen_url === 'string' ? record.imagen_url.trim() : '';

  const latitud = Number(record.latitud);
  const longitud = Number(record.longitud);
  const costo_entrada = Number(record.costo_entrada);

  if (nombre.length < 2 || nombre.length > 140) {
    return { error: 'El nombre debe tener entre 2 y 140 caracteres.' };
  }
  if (!PLACE_TYPES.includes(tipo as PlaceType)) {
    return { error: 'El tipo de atractivo no es válido.' };
  }
  if (direccion.length < 4 || direccion.length > 240) {
    return { error: 'La dirección debe tener entre 4 y 240 caracteres.' };
  }
  if (contacto.length < 3 || contacto.length > 160) {
    return { error: 'El contacto debe tener entre 3 y 160 caracteres.' };
  }
  if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
    return { error: 'La latitud debe ser un número válido entre -90 y 90.' };
  }
  if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
    return { error: 'La longitud debe ser un número válido entre -180 y 180.' };
  }
  if (actividades.length < 4 || actividades.length > 600) {
    return { error: 'Las actividades deben tener entre 4 y 600 caracteres.' };
  }
  if (horarios.length < 3 || horarios.length > 200) {
    return { error: 'Los horarios deben tener entre 3 y 200 caracteres.' };
  }
  if (!Number.isFinite(costo_entrada) || costo_entrada < 0 || costo_entrada > 100000000) {
    return { error: 'El costo de entrada debe ser un monto válido en Guaraníes (>= 0).' };
  }
  if (!isSafeImageUrl(imagen_url)) {
    return { error: 'La URL de imagen debe comenzar con http://, https:// o /src/assets/.' };
  }

  return {
    data: {
      nombre,
      tipo: tipo as PlaceType,
      direccion,
      contacto,
      latitud: Number(latitud.toFixed(6)),
      longitud: Number(longitud.toFixed(6)),
      actividades,
      horarios,
      costo_entrada: Math.round(costo_entrada),
      descripcion,
      imagen_url,
    },
  };
}

async function fetchAllPlaces(): Promise<{
  places: TouristPlace[];
  storageMode: 'supabase' | 'local';
  supabaseError?: string;
}> {
  const { client, configured } = getSupabaseClient();
  if (client && configured) {
    const { data, error } = await client
      .from(SUPABASE_TABLE)
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && Array.isArray(data)) {
      if (data.length === 0) {
        // Auto-seed initial places on first connection when table is empty
        const seedRows = SEED_PLACES.map(({ id: _id, ...rest }) => rest);
        const { data: inserted, error: seedError } = await client
          .from(SUPABASE_TABLE)
          .insert(seedRows)
          .select('*');
        if (!seedError && Array.isArray(inserted)) {
          return { places: inserted as TouristPlace[], storageMode: 'supabase' };
        }
      }
      return { places: data as TouristPlace[], storageMode: 'supabase' };
    }

    const fallback = await ensureLocalDb();
    return {
      places: fallback,
      storageMode: 'local',
      supabaseError: error?.message || 'No se pudo consultar la tabla lugares_turisticos en Supabase.',
    };
  }

  const localPlaces = await ensureLocalDb();
  return { places: localPlaces, storageMode: 'local' };
}

function filterPlaces(
  places: TouristPlace[],
  q: string,
  tipo: string,
  maxCostRaw: string
): TouristPlace[] {
  const query = q.trim().toLowerCase();
  const maxCost = maxCostRaw.trim() !== '' ? Number(maxCostRaw) : null;

  return places.filter((place) => {
    if (tipo && tipo !== 'Todos' && place.tipo !== tipo) {
      return false;
    }
    if (maxCost !== null && Number.isFinite(maxCost) && place.costo_entrada > maxCost) {
      return false;
    }
    if (query) {
      const searchable = [
        place.nombre,
        place.tipo,
        place.direccion,
        place.actividades,
        place.descripcion,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(query)) {
        return false;
      }
    }
    return true;
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Health & integration status
  app.get('/api/health', async (_req: Request, res: Response) => {
    const { configured } = getSupabaseClient();
    const { places, storageMode, supabaseError } = await fetchAllPlaces();
    const geminiConfigured = Boolean(getGeminiClient());
    res.json({
      ok: true,
      storageMode,
      supabaseConfigured: configured,
      geminiConfigured,
      totalPlaces: places.length,
      supabaseError,
    });
  });

  // Read & search/filter places
  app.get('/api/places', async (req: Request, res: Response) => {
    try {
      const { places, storageMode, supabaseError } = await fetchAllPlaces();
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const tipo = typeof req.query.tipo === 'string' ? req.query.tipo : '';
      const maxCost = typeof req.query.maxCost === 'string' ? req.query.maxCost : '';
      const filtered = filterPlaces(places, q, tipo, maxCost);
      res.json({ places: filtered, storageMode, supabaseError });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al consultar lugares.';
      res.status(500).json({ error: message });
    }
  });

  // Get single place
  app.get('/api/places/:id', async (req: Request, res: Response) => {
    try {
      const { places } = await fetchAllPlaces();
      const place = places.find((p) => p.id === req.params.id);
      if (!place) {
        res.status(404).json({ error: 'Atractivo no encontrado.' });
        return;
      }
      res.json({ place });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener el atractivo.';
      res.status(500).json({ error: message });
    }
  });

  // Create place (Alta)
  app.post('/api/places', async (req: Request, res: Response) => {
    const validation = validatePlaceInput(req.body);
    if (validation.error || !validation.data) {
      res.status(400).json({ error: validation.error || 'Datos inválidos.' });
      return;
    }

    const input = validation.data;
    const { client, configured } = getSupabaseClient();

    if (client && configured) {
      const { data, error } = await client
        .from(SUPABASE_TABLE)
        .insert([input])
        .select('*')
        .single();

      if (!error && data) {
        res.status(201).json({ place: data, storageMode: 'supabase' });
        return;
      }
      if (error) {
        res.status(500).json({ error: `Error en Supabase: ${error.message}` });
        return;
      }
    }

    const places = await ensureLocalDb();
    const now = new Date().toISOString();
    const newPlace: TouristPlace = {
      id: crypto.randomUUID(),
      nombre: input.nombre,
      tipo: input.tipo,
      direccion: input.direccion,
      contacto: input.contacto,
      latitud: input.latitud,
      longitud: input.longitud,
      actividades: input.actividades,
      horarios: input.horarios,
      costo_entrada: input.costo_entrada,
      descripcion: input.descripcion,
      imagen_url: input.imagen_url || '',
      created_at: now,
      updated_at: now,
    };
    places.push(newPlace);
    await writeLocalDb(places);
    res.status(201).json({ place: newPlace, storageMode: 'local' });
  });

  // Update place (Modificación)
  app.put('/api/places/:id', async (req: Request, res: Response) => {
    const validation = validatePlaceInput(req.body);
    if (validation.error || !validation.data) {
      res.status(400).json({ error: validation.error || 'Datos inválidos.' });
      return;
    }

    const input = validation.data;
    const { id } = req.params;
    const { client, configured } = getSupabaseClient();

    if (client && configured) {
      const { data, error } = await client
        .from(SUPABASE_TABLE)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (!error && data) {
        res.json({ place: data, storageMode: 'supabase' });
        return;
      }
      if (error) {
        res.status(error.code === 'PGRST116' ? 404 : 500).json({
          error: `Error al actualizar en Supabase: ${error.message}`,
        });
        return;
      }
    }

    const places = await ensureLocalDb();
    const idx = places.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Atractivo no encontrado.' });
      return;
    }
    const updated: TouristPlace = {
      ...places[idx],
      ...input,
      imagen_url: input.imagen_url || '',
      updated_at: new Date().toISOString(),
    };
    places[idx] = updated;
    await writeLocalDb(places);
    res.json({ place: updated, storageMode: 'local' });
  });

  // Delete place (Baja)
  app.delete('/api/places/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { client, configured } = getSupabaseClient();

    if (client && configured) {
      const { error } = await client.from(SUPABASE_TABLE).delete().eq('id', id);
      if (!error) {
        res.json({ deleted: true, id, storageMode: 'supabase' });
        return;
      }
      res.status(500).json({ error: `Error al eliminar en Supabase: ${error.message}` });
      return;
    }

    const places = await ensureLocalDb();
    const next = places.filter((p) => p.id !== id);
    if (next.length === places.length) {
      res.status(404).json({ error: 'Atractivo no encontrado.' });
      return;
    }
    await writeLocalDb(next);
    res.json({ deleted: true, id, storageMode: 'local' });
  });

  // Seed Supabase explicitly
  app.post('/api/supabase/seed', async (_req: Request, res: Response) => {
    const { client, configured } = getSupabaseClient();
    if (!client || !configured) {
      res.status(400).json({
        error: 'Variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY no configuradas en el servidor.',
      });
      return;
    }

    const { data: existing, error: fetchError } = await client
      .from(SUPABASE_TABLE)
      .select('id')
      .limit(1);

    if (fetchError) {
      res.status(500).json({ error: fetchError.message });
      return;
    }

    if (existing && existing.length > 0) {
      res.json({ seeded: false, message: 'La tabla ya contiene registros.' });
      return;
    }

    const seedRows = SEED_PLACES.map(({ id: _id, ...rest }) => rest);
    const { data, error } = await client.from(SUPABASE_TABLE).insert(seedRows).select('*');
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ seeded: true, count: data?.length ?? 0 });
  });

  // Intelligent Gemini Assistant grounded on live database records
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        message?: unknown;
        history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      };

      const message = typeof body?.message === 'string' ? body.message.trim() : '';
      if (!message || message.length > 1500) {
        res.status(400).json({ error: 'Escribe una consulta válida (máximo 1500 caracteres).' });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Falta configurar GEMINI_API_KEY en el servidor (Settings > Secrets en AI Studio o Environment Variables en Render).',
        });
        return;
      }

      const { places, storageMode } = await fetchAllPlaces();

      const catalogContext = places.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        tipo: p.tipo,
        direccion: p.direccion,
        contacto: p.contacto,
        latitud: p.latitud,
        longitud: p.longitud,
        actividades: p.actividades,
        horarios: p.horarios,
        costo_entrada_gs: p.costo_entrada,
        descripcion: p.descripcion,
      }));

      const systemInstruction = [
        'Eres el Asistente Turístico Inteligente de Turismo Smart AI.',
        `Actualmente estás consultando en tiempo real ${places.length} registros reales almacenados en la base de datos (${storageMode === 'supabase' ? 'Supabase' : 'almacenamiento local del servidor'}).`,
        'REGLAS ESTRICTAS:',
        '1. Responde siempre en español claro, cordial y bien estructurado.',
        '2. Basa TODAS tus recomendaciones exclusivamente en los registros reales proporcionados abajo en el JSON del catálogo. Nunca inventes museos, precios, direcciones ni horarios que no figuren en el catálogo.',
        '3. Cuando el usuario pregunte por un presupuesto en Guaraníes (ej. 50.000 Gs.), filtra cuidadosamente los lugares cuyo costo_entrada_gs sea menor o igual al presupuesto, indica el costo exacto de cada uno (o "Entrada gratuita" si es 0), y si pide combinaciones o itinerarios, suma el total en Gs. verificando que no supere el presupuesto.',
        '4. Cuando pregunte por categorías (ej. museos), incluye únicamente los registros que correspondan a esa categoría según el campo "tipo" o su descripción.',
        '5. Si sugiere un itinerario, ordénalo por horarios y cercanía geográfica usando las direcciones y coordenadas registradas, detallando actividades y presupuesto total.',
        '6. Si no existen lugares que cumplan con un criterio, indícalo con claridad y sugiere la alternativa más cercana del catálogo.',
        '',
        'CATÁLOGO REAL ACTUALIZADO (JSON):',
        JSON.stringify(catalogContext, null, 2),
      ].join('\n');

      const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
      const conversationLines = history.map(
        (turn) => `${turn.role === 'user' ? 'Usuario' : 'Asistente'}: ${turn.content}`
      );
      const prompt =
        conversationLines.length > 0
          ? `Historial reciente:\n${conversationLines.join('\n')}\n\nNueva consulta del usuario: ${message}`
          : message;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'El modelo no devolvió una respuesta válida.' });
        return;
      }

      const lowerReply = reply.toLowerCase();
      const referencedPlaceIds = places
        .filter((p) => lowerReply.includes(p.nombre.toLowerCase()))
        .map((p) => p.id);

      res.json({
        reply,
        referencedPlaceIds,
        storageMode,
        totalCatalogCount: places.length,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al procesar la consulta con Gemini.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Turismo Smart AI escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
