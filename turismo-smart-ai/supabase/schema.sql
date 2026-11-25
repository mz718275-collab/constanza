-- Esquema SQL para Supabase — Turismo Smart AI
-- Ejecutar en el SQL Editor de tu proyecto Supabase

create table if not exists public.lugares_turisticos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('Museo', 'Sitio Histórico', 'Espacio Cultural', 'Parque y Naturaleza')),
  direccion text not null,
  contacto text not null,
  latitud double precision not null check (latitud >= -90 and latitud <= 90),
  longitud double precision not null check (longitud >= -180 and longitud <= 180),
  actividades text not null,
  horarios text not null,
  costo_entrada integer not null default 0 check (costo_entrada >= 0),
  descripcion text not null default '',
  imagen_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para acelerar búsquedas por categoría y presupuesto
create index if not exists idx_lugares_tipo on public.lugares_turisticos (tipo);
create index if not exists idx_lugares_costo on public.lugares_turisticos (costo_entrada);

-- Habilitar Row Level Security (RLS)
alter table public.lugares_turisticos enable row level security;

-- Políticas de acceso (lectura pública del catálogo y escritura desde el servicio web)
drop policy if exists "Lectura pública del catálogo" on public.lugares_turisticos;
create policy "Lectura pública del catálogo"
  on public.lugares_turisticos
  for select
  using (true);

drop policy if exists "Gestión desde servicio web" on public.lugares_turisticos;
create policy "Gestión desde servicio web"
  on public.lugares_turisticos
  for all
  using (true)
  with check (true);

-- Datos iniciales de demostración (Asunción, Paraguay)
insert into public.lugares_turisticos
  (nombre, tipo, direccion, contacto, latitud, longitud, actividades, horarios, costo_entrada, descripcion)
values
  (
    'Museo Nacional de Bellas Artes',
    'Museo',
    'Eligio Ayala 1345 c/ Paí Pérez, Asunción',
    '(021) 211-578 · mnba.paraguay@cultura.gov.py',
    -25.2869,
    -57.6248,
    'Recorrido por colecciones de arte paraguayo y europeo del siglo XIX y XX, exposiciones temporales y visitas guiadas educativas.',
    'Martes a viernes de 07:00 a 18:00 hs · Sábados de 08:00 a 18:00 hs',
    0,
    'Principal pinacoteca pública del Paraguay, fundada por Juan Silvano Godoi con obras de Pablo Alborno, Jaime Bestard, Andrés Guevara y maestros europeos.'
  ),
  (
    'Museo Casa de la Independencia',
    'Museo',
    '14 de Mayo esq. Presidente Franco, Asunción',
    '(021) 493-918 · casadelaindependencia@cultura.gov.py',
    -25.2804,
    -57.6377,
    'Visita histórica a las salas coloniales de 1772, patio central, callejón histórico y exhibición de documentos de la gesta de mayo de 1811.',
    'Martes a sábado de 08:00 a 16:00 hs',
    0,
    'Residencia colonial donde se gestó la independencia del Paraguay. Conserva mobiliario de época, retratos, armas y documentos originales.'
  ),
  (
    'Panteón Nacional de los Héroes',
    'Sitio Histórico',
    'Palma esq. Chile, Centro Histórico, Asunción',
    '(021) 446-114 · turismo@asuncion.gov.py',
    -25.2820,
    -57.6352,
    'Visita arquitectónica al oratorio neoclásico, observación del cambio de guardia ceremonial y recorrido histórico guiado.',
    'Lunes a domingo de 08:00 a 17:30 hs',
    15000,
    'Monumento emblemático de la capital paraguaya construido bajo inspiración de Los Inválidos de París, donde descansan figuras clave de la historia nacional.'
  ),
  (
    'Centro Cultural de la República El Cabildo',
    'Espacio Cultural',
    'Av. de la República e/ Chile y Alberdi, Asunción',
    '(021) 443-094 · elcabildo@senado.gov.py',
    -25.2797,
    -57.6327,
    'Salas de música, arte sacro, pueblos originarios, cine y literatura; audioguía patrimonial y conciertos acústicos.',
    'Lunes a viernes de 09:00 a 19:00 hs · Sábados y domingos de 10:00 a 17:00 hs',
    20000,
    'Antigua sede del Poder Legislativo convertida en centro cultural multidisciplinario con siete salas temáticas frente a la Plaza de Armas.'
  ),
  (
    'Jardín Botánico y Museo de Historia Natural',
    'Parque y Naturaleza',
    'Av. Primer Presidente y Artigas, Asunción',
    '(021) 290-101 · botanico@asuncion.gov.py',
    -25.2528,
    -57.5718,
    'Senderismo botánico entre lapachos y palmeras, visita a la histórica Casa Alta de Carlos Antonio López y recorrido por colecciones naturales.',
    'Lunes a domingo de 08:00 a 17:00 hs',
    25000,
    'Reserva verde de más de 110 hectáreas en la antigua quinta presidencial, que alberga flora nativa, fauna y arquitectura patrimonial del siglo XIX.'
  ),
  (
    'Paseo Cultural Palacio de López y Bahía',
    'Sitio Histórico',
    'El Paraguayo Independiente e/ Ayolas y O''Leary, Asunción',
    '(021) 414-0200 · circuitos@senatur.gov.py',
    -25.2775,
    -57.6382,
    'Tour guiado nocturno por los jardines exteriores iluminados del Palacio de Gobierno, mirador de la Costanera y paseo cultural en lancha por la bahía.',
    'Miércoles a domingo de 17:00 a 21:00 hs',
    60000,
    'Experiencia patrimonial combinada que recorre la arquitectura palaciega de 1867 y la vista panorámica de la Bahía de Asunción.'
  );
