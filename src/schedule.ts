import { addWeeks, addDays, format, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

// Configuración de fechas
export const CULTIVO_CONFIG = {
  inicio: new Date('2025-01-08'), // Fecha real de inicio (8 de enero 2025)
  fin: new Date('2025-07-16'), // Fecha estimada de fin (16 de julio 2025)
  zonaHoraria: 'America/Santiago'
};

// Plantas del cultivo
export const PLANTAS = [
  {
    id: 'fresh-candy-suelo',
    nombre: 'Fresh Candy',
    banco: 'Sweet Seeds',
    tipo: 'suelo' as const,
    notas: 'Cultivo en suelo directo'
  },
  {
    id: 'cream-mandarine-suelo',
    nombre: 'Cream Mandarine F1 Fast',
    banco: 'Sweet Seeds',
    tipo: 'suelo' as const,
    notas: 'Cultivo en suelo directo'
  },
  {
    id: 'cream-mandarine-maceta-1',
    nombre: 'Cream Mandarine F1 Fast #1',
    banco: 'Sweet Seeds',
    tipo: 'maceta' as const,
    notas: 'Cultivo en maceta'
  },
  {
    id: 'cream-mandarine-maceta-2',
    nombre: 'Cream Mandarine F1 Fast #2',
    banco: 'Sweet Seeds',
    tipo: 'maceta' as const,
    notas: 'Cultivo en maceta'
  },
  {
    id: 'cream-mandarine-maceta-3',
    nombre: 'Cream Mandarine F1 Fast #3',
    banco: 'Sweet Seeds',
    tipo: 'maceta' as const,
    notas: 'Cultivo en maceta'
  }
];

// Fases del cultivo
export const FASES = [
  {
    id: 'germinacion',
    nombre: 'Germinación',
    semanas: [0, 1], // Semanas 0-1 (2025-09-08 → 2025-09-21)
    descripcion: 'Fase de germinación y primeras hojas cotiledonares',
    fertilizacion: {
      productos: [],
      dosis: [],
      notas: 'Solo agua pH 6.3-6.7, sin fertilizantes'
    },
    riego: {
      maceta: { min: 0.05, max: 0.1 },
      suelo: { min: 0.1, max: 0.2 }
    }
  },
  {
    id: 'fase1',
    nombre: 'Crecimiento Inicial',
    semanas: [2, 3], // Semanas 2-3 (2025-09-22 → 2025-10-05)
    descripcion: 'Primeras hojas verdaderas, desarrollo de raíces',
    fertilizacion: {
      productos: ['Deeper Underground'],
      dosis: [1],
      notas: 'Fertilizante de raíces, 1 ml/L'
    },
    riego: {
      maceta: { min: 0.15, max: 0.3 },
      suelo: { min: 0.3, max: 0.5 }
    }
  },
  {
    id: 'fase2',
    nombre: 'Crecimiento Vegetativo Temprano',
    semanas: [4, 5], // Semanas 4-5 (2025-10-06 → 2025-10-19)
    descripcion: 'Desarrollo de hojas y estructura',
    fertilizacion: {
      productos: ['Deeper Underground', 'Top Veg'],
      dosis: [1.5, 2],
      notas: 'Combinación de raíces y crecimiento vegetativo'
    },
    riego: {
      maceta: { min: 0.5, max: 1 },
      suelo: { min: 1, max: 2 }
    }
  },
  {
    id: 'fase3',
    nombre: 'Crecimiento Vegetativo Intenso',
    semanas: [6, 11], // Semanas 6-11 (2025-10-20 → 2025-11-30)
    descripcion: 'Máximo crecimiento vegetativo, posible trasplante',
    fertilizacion: {
      productos: ['Top Veg'],
      dosis: [2.5],
      notas: 'Solo Top Veg. Deeper Underground solo si hay trasplante'
    },
    riego: {
      maceta: { min: 1, max: 2.5 },
      suelo: { min: 3, max: 4 }
    }
  },
  {
    id: 'fase4',
    nombre: 'Pre-floración',
    semanas: [12, 17], // Semanas 12-17 (2025-12-01 → 2026-01-05)
    descripcion: 'Preparación para floración, desarrollo de estructura',
    fertilizacion: {
      productos: ['Top Veg'],
      dosis: [3.5],
      notas: 'Máxima dosis de crecimiento vegetativo'
    },
    riego: {
      maceta: { min: 2.5, max: 4 },
      suelo: { min: 4, max: 6 }
    }
  },
  {
    id: 'fase5',
    nombre: 'Transición a Floración',
    semanas: [18, 19], // Semanas 18-19 (2026-01-06 → 2026-01-19)
    descripcion: 'Aparición de preflores, inicio de floración',
    fertilizacion: {
      productos: ['Top Veg', 'Top Bloom'],
      dosis: [2.5, 2],
      notas: 'Transición gradual a fertilizantes de floración'
    },
    riego: {
      maceta: { min: 3, max: 5 },
      suelo: { min: 5, max: 7 }
    }
  },
  {
    id: 'fase6',
    nombre: 'Floración Intensa',
    semanas: [20, 25], // Semanas 20-25 (2026-01-20 → 2026-02-23)
    descripcion: 'Desarrollo de flores y engorde de cogollos',
    fertilizacion: {
      productos: ['Top Bloom'],
      dosis: [3.5],
      notas: 'Solo fertilizantes de floración'
    },
    riego: {
      maceta: { min: 4, max: 6 },
      suelo: { min: 7, max: 10 }
    }
  },
  {
    id: 'lavado-cosecha',
    nombre: 'Lavado y Cosecha',
    semanas: [26, 30], // Semanas 26-30 (2026-02-24 → 2026-03-30)
    descripcion: 'Lavado de raíces y ventana de cosecha',
    fertilizacion: {
      productos: [],
      dosis: [],
      notas: 'Solo agua pH 6.3-6.7 para lavado'
    },
    riego: {
      maceta: { min: 2, max: 4 },
      suelo: { min: 3, max: 5 }
    }
  }
];

// Fechas de lavado específicas por variedad
export const FECHAS_LAVADO = {
  'cream-mandarine': {
    lavado: new Date('2025-06-17'),
    cosecha: { inicio: new Date('2025-06-24'), fin: new Date('2025-07-10') }
  },
  'fresh-candy': {
    lavado: new Date('2025-06-23'),
    cosecha: { inicio: new Date('2025-07-02'), fin: new Date('2025-07-16') }
  }
};

// Tipos de eventos
export type TipoEvento = 'fertilizacion' | 'riego' | 'lavado' | 'cosecha';

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
  ) || FASES[0];

  // Verificar si estamos en período de lavado
  const esLavadoCreamMandarine = isWithinInterval(fechaJueves, {
    start: FECHAS_LAVADO['cream-mandarine'].lavado,
    end: FECHAS_LAVADO['cream-mandarine'].cosecha.inicio
  });

  const esLavadoFreshCandy = isWithinInterval(fechaJueves, {
    start: FECHAS_LAVADO['fresh-candy'].lavado,
    end: FECHAS_LAVADO['fresh-candy'].cosecha.inicio
  });

  // Evento de fertilización (jueves)
  if (fase.fertilizacion.productos.length > 0 && !esLavadoCreamMandarine && !esLavadoFreshCandy) {
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
  } else if (esLavadoCreamMandarine || esLavadoFreshCandy) {
    // Evento de lavado
    const plantasLavado = esLavadoCreamMandarine 
      ? PLANTAS.filter(p => p.nombre.includes('Cream Mandarine')).map(p => p.id)
      : PLANTAS.filter(p => p.nombre.includes('Fresh Candy')).map(p => p.id);

    eventos.push({
      id: `lavado-${semana}-${fechaJueves.getTime()}`,
      tipo: 'lavado',
      fecha: fechaJueves,
      productos: [],
      dosis: [],
      litrosPorPlanta: fase.riego,
      plantas: plantasLavado,
      notas: 'Lavado de raíces - solo agua pH 6.3-6.7',
      fase: 'Lavado'
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
      notas: 'Riego con agua pH 6.3-6.7',
      fase: fase.nombre
    });
  });

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
