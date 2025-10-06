import { addDays, addWeeks } from 'date-fns';
import { CULTIVO_CONFIG, FASES, FECHAS_LAVADO } from './schedule';

export type TopCropEventoTipo = 'fertilizacion' | 'riego' | 'lavado' | 'cosecha';

export interface TopCropEvento {
  id: string;
  tipo: TopCropEventoTipo;
  fecha: Date;
  productos: string[];
  dosis: number[]; // ml/L
  litrosPorPlanta: {
    maceta: { min: number; max: number };
    suelo: { min: number; max: number };
  };
  notas: string;
  fase: string;
}

// Genera semanas usando mismas fechas, fases, riegos y ventanas de lavado que el calendario actual
export function generarSemanasTopCrop(): { fechaInicio: Date; fechaFin: Date; semana: number; eventos: TopCropEvento[] }[] {
  const semanas: { fechaInicio: Date; fechaFin: Date; semana: number; eventos: TopCropEvento[] }[] = [];
  let fechaActual = CULTIVO_CONFIG.inicio;
  let semana = 0;

  while (fechaActual <= CULTIVO_CONFIG.fin) {
    const fechaFin = addDays(fechaActual, 6);

    // Determinar fase por semana según FASES existentes
    const fase = FASES.find(f => semana >= f.semanas[0] && semana <= f.semanas[1]) || FASES[0];

    const fechaLunes = addDays(fechaActual, 0);
    const fechaJueves = addDays(fechaActual, 3);
    const fechaSabado = addDays(fechaActual, 5);

    const eventos: TopCropEvento[] = [];

    // Riegos de agua (lunes y sábado)
    [fechaLunes, fechaSabado].forEach((fecha, idx) => {
      const litrosSuelo = fase.riego.suelo;
      eventos.push({
        id: `tc-riego-${semana}-${idx}-${fecha.getTime()}`,
        tipo: 'riego',
        fecha,
        productos: [],
        dosis: [],
        litrosPorPlanta: { maceta: litrosSuelo, suelo: litrosSuelo },
        notas: 'Riego con agua de la llave',
        fase: fase.nombre
      });
    });

    // Determinar si corresponde lavado por ventanas existentes
    const enLavadoCream = fechaJueves >= FECHAS_LAVADO['cream-mandarine'].lavado && fechaJueves <= FECHAS_LAVADO['cream-mandarine'].cosecha.inicio;
    const enLavadoFresh = fechaJueves >= FECHAS_LAVADO['fresh-candy'].lavado && fechaJueves <= FECHAS_LAVADO['fresh-candy'].cosecha.inicio;

    if ((enLavadoCream || enLavadoFresh)) {
      const litrosSuelo = fase.riego.suelo;
      eventos.push({
        id: `tc-lavado-${semana}-${fechaJueves.getTime()}`,
        tipo: 'lavado',
        fecha: fechaJueves,
        productos: [],
        dosis: [],
        litrosPorPlanta: { maceta: litrosSuelo, suelo: litrosSuelo },
        notas: 'Lavado de raíces - solo agua de la llave',
        fase: 'Lavado'
      });
    } else if (fase.fertilizacion.productos.length > 0) {
      // Fertilización (jueves) según FASES existentes
      const litrosSuelo = fase.riego.suelo;
      eventos.push({
        id: `tc-fert-${semana}-${fechaJueves.getTime()}`,
        tipo: 'fertilizacion',
        fecha: fechaJueves,
        productos: fase.fertilizacion.productos,
        dosis: fase.fertilizacion.dosis,
        litrosPorPlanta: { maceta: litrosSuelo, suelo: litrosSuelo },
        notas: fase.fertilizacion.notas,
        fase: fase.nombre
      });
    }

    semanas.push({ fechaInicio: fechaActual, fechaFin, semana, eventos });
    fechaActual = addWeeks(fechaActual, 1);
    semana++;
  }

  return semanas;
}


