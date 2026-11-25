# Turismo Smart AI

Sistema web dinámico para la gestión y exploración de sitios turísticos, museos y espacios culturales, desarrollado con React, Express, OpenStreetMap (Leaflet), Supabase y la API de Google Gemini.

## Funcionalidades principales

- **Catálogo cultural completo (CRUD)**: Altas, bajas, modificaciones, consultas, búsqueda de texto y filtrado por tipo de atractivo o presupuesto máximo en Guaraníes (`Gs.`).
- **Mapa interactivo con OpenStreetMap**: Marcadores clicables con información completa de cada atractivo y selector directo en mapa para registrar nuevas coordenadas.
- **Integración y transferencia a Google Maps**: Botones directos en cada atractivo para abrir la ubicación o ruta en Google Maps, ruta múltiple de lugares filtrados y descarga en formato `.kml` compatible con **Google My Maps**.
- **Asistente Inteligente (Gemini API)**: Chat en tiempo real que consulta los registros reales almacenados en la base de datos para responder sobre presupuestos, museos disponibles e itinerarios personalizados.
- **Persistencia en Supabase**: Conexión segura desde el backend mediante variables de entorno, con almacenamiento local automático de respaldo mientras no se configuren las claves.

## Despliegue en Supabase, GitHub y Render

1. **Supabase**:
   - Crea un proyecto en Supabase y abre el **SQL Editor**.
   - Ejecuta el archivo `supabase/schema.sql` para crear la tabla `lugares_turisticos`, índices, políticas RLS y registros iniciales.
   - Copia `Project URL`, `anon public key` y `service_role key` desde **Project Settings > API**.

2. **GitHub**:
   - Sube el repositorio completo a tu cuenta de GitHub (`git init`, `git add .`, `git commit`, `git push`).
   - Asegúrate de no subir archivos `.env` con claves privadas (`.gitignore` ya lo protege).

3. **Render**:
   - Crea un nuevo **Web Service** conectado a tu repositorio de GitHub (o importa `render.yaml`).
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - En **Environment Variables**, agrega:
     - `GEMINI_API_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NODE_ENV=production`
