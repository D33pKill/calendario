import { addWeeks, addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Configuración de fechas
export const CULTIVO_CONFIG = {
  inicio: new Date('2025-09-04'), // Fecha de inicio de temporada (Primavera)
  fin: new Date('2026-03-16'), // Fin de temporada
  zonaHoraria: 'America/Santiago'
};

// Plantas del huerto
export const PLANTAS = [
  {
    id: 'tomate-cherry',
    nombre: 'Tomate Cherry',
    banco: 'Semillas Orgánicas',
    tipo: 'maceta' as const,
    notas: 'Ideal para balcones',
    phSuelo: { min: 6.0, max: 6.8 }
  },
  {
    id: 'tomate-raf',
    nombre: 'Tomate Raf',
    banco: 'Huerto Local',
    tipo: 'suelo' as const,
    notas: 'Requiere entutorado',
    phSuelo: { min: 6.2, max: 6.8 }
  },
  {
    id: 'albahaca',
    nombre: 'Albahaca Genovesa',
    banco: 'Aromáticas',
    tipo: 'maceta' as const,
    notas: 'Compañera del tomate',
    phSuelo: { min: 6.0, max: 7.0 }
  },
  {
    id: 'pimiento',
    nombre: 'Pimiento Italiano',
    banco: 'Huerto Local',
    tipo: 'suelo' as const,
    notas: 'Necesita mucho sol',
    phSuelo: { min: 6.0, max: 7.0 }
  },
  {
    id: 'lechuga',
    nombre: 'Lechuga Costina',
    banco: 'Hojas Verdes',
    tipo: 'maceta' as const,
    notas: 'Riego frecuente',
    phSuelo: { min: 6.0, max: 7.0 }
  }
];

// Fases del cultivo
export const FASES = [
  {
    id: 'germinacion',
    nombre: 'Germinación y Plántula',
    semanas: [0, 2], 
    descripcion: 'Emergencia de semillas y desarrollo de primeras hojas verdaderas',
    fertilizacion: {
      productos: [],
      dosis: [],
      notas: 'Mantener sustrato húmedo, sin fertilizantes'
    },
    riego: {
      maceta: { min: 0.1, max: 0.2 },
      suelo: { min: 0.2, max: 0.3 }
    }
  },
  {
    id: 'crecimiento',
    nombre: 'Crecimiento Vegetativo',
    semanas: [3, 8],
    descripcion: 'Desarrollo de tallos y hojas. Mayor demanda de nitrógeno.',
    fertilizacion: {
      productos: ['Compost', 'Purín de Ortiga'],
      dosis: [100, 20], // gr o ml
      notas: 'Aplicar compost en superficie o purín diluido'
    },
    riego: {
      maceta: { min: 0.5, max: 1.0 },
      suelo: { min: 1.0, max: 2.0 }
    }
  },
  {
    id: 'floracion',
    nombre: 'Floración y Cuajado',
    semanas: [9, 14],
    descripcion: 'Aparición de flores y primeros frutos. Demanda de potasio.',
    fertilizacion: {
      productos: ['Té de Banana', 'Humus'],
      dosis: [50, 100],
      notas: 'Reforzar potasio para la floración'
    },
    riego: {
      maceta: { min: 1.5, max: 2.5 },
      suelo: { min: 2.0, max: 3.0 }
    }
  },
  {
    id: 'fructificacion',
    nombre: 'Desarrollo de Fruto',
    semanas: [15, 22],
    descripcion: 'Engorde y maduración de frutos.',
    fertilizacion: {
      productos: ['Compost', 'Ceniza de madera'],
      dosis: [100, 10],
      notas: 'Mantener nutrición equilibrada'
    },
    riego: {
      maceta: { min: 2.0, max: 3.0 },
      suelo: { min: 3.0, max: 4.0 }
    }
  },
  {
    id: 'cosecha',
    nombre: 'Cosecha Continua',
    semanas: [23, 30],
    descripcion: 'Recolección de frutos maduros.',
    fertilizacion: {
      productos: [],
      dosis: [],
      notas: 'Reducir fertilización, mantener humedad constante'
    },
    riego: {
      maceta: { min: 1.5, max: 2.5 },
      suelo: { min: 2.5, max: 3.5 }
    }
  }
];

// Tipos de eventos
export type TipoEvento = 'fertilizacion' | 'riego' | 'cosecha' | 'poda';

export interface Evento {
  id: string;
  tipo: TipoEvento;
  fecha: Date;
  productos: string[];
  dosis: number[];
  litrosPorPlanta: {
    maceta: { min: number; max: number };
    suelo: { min: number; max: number };
  };
  plantas: string[];
  notas: string;
  fase: string;
}

// Generar eventos para una semana específica
export function generarEventosSemana(fechaInicioSemana: Date, semana: number): Evento[] {
  const eventos: Evento[] = [];
  const fechaJueves = addDays(fechaInicioSemana, 3); // Jueves
  const fechaLunes = addDays(fechaInicioSemana, 0); // Lunes
  const fechaSabado = addDays(fechaInicioSemana, 5); // Sábado

  // Determinar fase actual
  const fase = FASES.find(f => 
    semana >= f.semanas[0] && semana <= f.semanas[1]
  ) || FASES[FASES.length - 1];

  // Evento de fertilización (jueves)
  if (fase.fertilizacion.productos.length > 0) {
    eventos.push({
      id: `fert-${semana}-${fechaJueves.getTime()}`,
      tipo: 'fertilizacion',
      fecha: fechaJueves,
      productos: fase.fertilizacion.productos,
      dosis: fase.fertilizacion.dosis,
      litrosPorPlanta: fase.riego,
      plantas: PLANTAS.map(p => p.id),
      notas: fase.fertilizacion.notas,
      fase: fase.nombre
    });
  }

  // Eventos de riego (lunes y sábado)
  [fechaLunes, fechaSabado].forEach((fecha, index) => {
    eventos.push({
      id: `riego-${semana}-${index}-${fecha.getTime()}`,
      tipo: 'riego',
      fecha: fecha,
      productos: [],
      dosis: [],
      litrosPorPlanta: fase.riego,
      plantas: PLANTAS.map(p => p.id),
      notas: 'Riego regular. Verificar humedad del sustrato.',
      fase: fase.nombre
    });
  });

  // Evento de cosecha (si estamos en fase de cosecha)
  if (fase.id === 'cosecha') {
     eventos.push({
      id: `cosecha-${semana}-${fechaSabado.getTime()}`,
      tipo: 'cosecha',
      fecha: fechaSabado,
      productos: [],
      dosis: [],
      litrosPorPlanta: fase.riego,
      plantas: PLANTAS.map(p => p.id),
      notas: 'Recolección de frutos maduros',
      fase: fase.nombre
    });
  }

  return eventos;
}

// Generar todas las semanas del cultivo
export function generarTodasLasSemanas(): { fechaInicio: Date; fechaFin: Date; semana: number; eventos: Evento[] }[] {
  const semanas = [];
  let fechaActual = CULTIVO_CONFIG.inicio;
  let semana = 0;

  while (fechaActual <= CULTIVO_CONFIG.fin) {
    const fechaFin = addDays(fechaActual, 6);
    const eventos = generarEventosSemana(fechaActual, semana);
    
    semanas.push({
      fechaInicio: fechaActual,
      fechaFin: fechaFin,
      semana: semana,
      eventos: eventos
    });

    fechaActual = addWeeks(fechaActual, 1);
    semana++;
  }

  return semanas;
}

// Obtener próximo evento de fertilización
export function obtenerProximoFertilizante(): Evento | null {
  const hoy = new Date();
  const todasLasSemanas = generarTodasLasSemanas();
  
  for (const semana of todasLasSemanas) {
    const proximoFertilizante = semana.eventos.find(e => 
      e.tipo === 'fertilizacion' && e.fecha >= hoy
    );
    if (proximoFertilizante) {
      return proximoFertilizante;
    }
  }
  
  return null;
}

// Formatear fecha para mostrar
export function formatearFecha(fecha: Date): string {
  return format(fecha, 'dd/MM/yyyy', { locale: es });
}

// Formatear rango de fechas de semana
export function formatearRangoSemana(fechaInicio: Date, fechaFin: Date): string {
  return `${format(fechaInicio, 'dd MMM', { locale: es })} - ${format(fechaFin, 'dd MMM yyyy', { locale: es })}`;
}

