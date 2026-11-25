import type { TouristPlace } from '../types/place.ts';

export const HERO_IMAGE_URL = '/src/assets/images/hero_asuncion_patrimonio_1795625093186.jpg';

export const SEED_PLACES: TouristPlace[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    nombre: 'Museo Nacional de Bellas Artes',
    tipo: 'Museo',
    direccion: 'Eligio Ayala 1345 c/ Paí Pérez, Asunción',
    contacto: '(021) 211-578 · mnba.paraguay@cultura.gov.py',
    latitud: -25.2869,
    longitud: -57.6248,
    actividades:
      'Recorrido por colecciones de arte paraguayo y europeo de los siglos XIX y XX, exposiciones temporales y visitas guiadas educativas.',
    horarios: 'Martes a viernes de 07:00 a 18:00 hs · Sábados de 08:00 a 18:00 hs',
    costo_entrada: 0,
    descripcion:
      'Principal pinacoteca pública del Paraguay, fundada por Juan Silvano Godoi, con obras maestras de Pablo Alborno, Jaime Bestard y artistas internacionales.',
    imagen_url: '/src/assets/images/museo_bellas_artes_1795625093168.jpg',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    nombre: 'Museo Casa de la Independencia',
    tipo: 'Museo',
    direccion: '14 de Mayo esq. Presidente Franco, Asunción',
    contacto: '(021) 493-918 · casadelaindependencia@cultura.gov.py',
    latitud: -25.2804,
    longitud: -57.6377,
    actividades:
      'Visita histórica a las salas coloniales de 1772, patio central, callejón histórico y exhibición de documentos originales de mayo de 1811.',
    horarios: 'Martes a sábado de 08:00 a 16:00 hs',
    costo_entrada: 0,
    descripcion:
      'Residencia colonial donde se gestó la independencia del Paraguay. Conserva mobiliario de época, retratos, armas y documentos patrimoniales.',
    imagen_url: '/src/assets/images/casa_independencia_1795625094279.jpg',
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    nombre: 'Panteón Nacional de los Héroes',
    tipo: 'Sitio Histórico',
    direccion: 'Palma esq. Chile, Centro Histórico, Asunción',
    contacto: '(021) 446-114 · turismo@asuncion.gov.py',
    latitud: -25.282,
    longitud: -57.6352,
    actividades:
      'Visita arquitectónica al oratorio neoclásico, observación del cambio de guardia ceremonial y recorrido histórico guiado.',
    horarios: 'Lunes a domingo de 08:00 a 17:30 hs',
    costo_entrada: 15000,
    descripcion:
      'Monumento emblemático de la capital paraguaya inspirado en Los Inválidos de París, donde descansan figuras clave de la historia nacional.',
    imagen_url: '/src/assets/images/panteon_heroes_1795625094579.jpg',
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    nombre: 'Centro Cultural de la República El Cabildo',
    tipo: 'Espacio Cultural',
    direccion: 'Av. de la República e/ Chile y Alberdi, Asunción',
    contacto: '(021) 443-094 · elcabildo@senado.gov.py',
    latitud: -25.2797,
    longitud: -57.6327,
    actividades:
      'Recorrido por salas de música, arte sacro, pueblos originarios, cine y literatura; audioguía patrimonial y conciertos acústicos.',
    horarios: 'Lunes a viernes de 09:00 a 19:00 hs · Sábados y domingos de 10:00 a 17:00 hs',
    costo_entrada: 20000,
    descripcion:
      'Antigua sede del Poder Legislativo convertida en centro cultural multidisciplinario con siete salas temáticas frente a la Plaza de Armas.',
    imagen_url: '/src/assets/images/cabildo_cultural_1795625096113.jpg',
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    nombre: 'Jardín Botánico y Museo de Historia Natural',
    tipo: 'Parque y Naturaleza',
    direccion: 'Av. Primer Presidente y Artigas, Asunción',
    contacto: '(021) 290-101 · botanico@asuncion.gov.py',
    latitud: -25.2528,
    longitud: -57.5718,
    actividades:
      'Senderismo botánico entre lapachos y palmeras, visita a la histórica Casa Alta de Carlos Antonio López y recorrido por colecciones naturales.',
    horarios: 'Lunes a domingo de 08:00 a 17:00 hs',
    costo_entrada: 25000,
    descripcion:
      'Reserva verde de más de 110 hectáreas en la antigua quinta presidencial, que alberga flora nativa, fauna y arquitectura patrimonial del siglo XIX.',
    imagen_url: '/src/assets/images/jardin_botanico_1795625096663.jpg',
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    nombre: 'Paseo Cultural Palacio de López y Bahía',
    tipo: 'Sitio Histórico',
    direccion: "El Paraguayo Independiente e/ Ayolas y O'Leary, Asunción",
    contacto: '(021) 414-0200 · circuitos@senatur.gov.py',
    latitud: -25.2775,
    longitud: -57.6382,
    actividades:
      'Tour guiado nocturno por los jardines iluminados del Palacio de Gobierno, mirador de la Costanera y paseo cultural en lancha por la bahía.',
    horarios: 'Miércoles a domingo de 17:00 a 21:00 hs',
    costo_entrada: 60000,
    descripcion:
      'Experiencia patrimonial combinada que recorre la arquitectura palaciega de 1867 y la vista panorámica de la Bahía de Asunción.',
    imagen_url: '/src/assets/images/hero_asuncion_patrimonio_1795625093186.jpg',
  },
];
