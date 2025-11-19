import { useState, useMemo, useEffect } from 'react';
import {
  generarTodasLasSemanas,
  obtenerProximoFertilizante,
  formatearRangoSemana,
  PLANTAS,
  type Evento
} from './schedule';
import { format, isToday, isSameWeek } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente de filtros
interface FiltrosProps {
  filtroPlanta: string;
  onFiltroChange: (filtro: string) => void;
}

function Filtros({ filtroPlanta, onFiltroChange }: FiltrosProps) {
  const opciones = [
    { id: 'todas', label: 'Todas', icon: '🌱' },
    { id: 'tomate-cherry', label: 'Tomate Cherry', icon: '🍅' },
    { id: 'tomate-raf', label: 'Tomate Raf', icon: '🍅' },
    { id: 'albahaca', label: 'Albahaca', icon: '🌿' },
    { id: 'pimiento', label: 'Pimiento', icon: '🫑' },
    { id: 'lechuga', label: 'Lechuga', icon: '🥬' },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
        <span>🔍</span> Filtros de Cultivo
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {opciones.map((opcion) => (
          <label
            key={opcion.id}
            className={`
              flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 border
              ${filtroPlanta === opcion.id
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-emerald-200'}
            `}
          >
            <input
              type="radio"
              name="filtro-planta"
              value={opcion.id}
              checked={filtroPlanta === opcion.id}
              onChange={(e) => onFiltroChange(e.target.value)}
              className="hidden"
            />
            <span className="mr-2 text-xl">{opcion.icon}</span>
            <span className="text-sm font-medium">{opcion.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Componente de evento
interface EventoCardProps {
  evento: Evento;
  esHoy: boolean;
  esProximo: boolean;
  onSeleccionar: (evento: Evento) => void;
}

function EventoCard({ evento, esHoy, esProximo, onSeleccionar }: EventoCardProps) {
  const getBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'fertilizacion': return 'badge badge-fertilizacion';
      case 'riego': return 'badge badge-riego';
      case 'cosecha': return 'badge badge-cosecha';
      default: return 'badge bg-gray-100 text-gray-800';
    }
  };

  const getTipoTexto = (tipo: string) => {
    switch (tipo) {
      case 'fertilizacion': return 'Fertilización';
      case 'riego': return 'Riego';
      case 'cosecha': return 'Cosecha';
      default: return tipo;
    }
  };

  return (
    <div
      className={`card card-hover cursor-pointer ${esHoy ? 'semaforo-hoy' : esProximo ? 'semaforo-proximo' : ''
        }`}
      onClick={() => onSeleccionar(evento)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={getBadgeClass(evento.tipo)}>
          {getTipoTexto(evento.tipo)}
        </span>
        <span className="text-sm text-gray-500">
          {format(evento.fecha, 'HH:mm', { locale: es })}
        </span>
      </div>

      <div className="space-y-1">
        {evento.productos.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Productos: </span>
            {evento.productos.map((producto, index) => (
              <span key={index}>
                {producto} {evento.dosis[index] > 0 && `(${evento.dosis[index]} ml/L)`}
                {index < evento.productos.length - 1 && ', '}
              </span>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <span className="font-medium">Litros: </span>
          Maceta: {evento.litrosPorPlanta.maceta.min}-{evento.litrosPorPlanta.maceta.max}L |
          Suelo: {evento.litrosPorPlanta.suelo.min}-{evento.litrosPorPlanta.suelo.max}L
        </div>

        {evento.notas && (
          <div className="text-xs text-gray-500 italic">
            {evento.notas}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de semana
interface SemanaCardProps {
  semana: {
    fechaInicio: Date;
    fechaFin: Date;
    semana: number;
    eventos: Evento[];
  };
  filtroPlanta: string;
  proximoFertilizante: Evento | null;
  onSeleccionarEvento: (evento: Evento) => void;
}

function SemanaCard({ semana, filtroPlanta, proximoFertilizante, onSeleccionarEvento, fechaActual }: SemanaCardProps & { fechaActual: Date }) {
  // Verificar si la fecha actual está dentro del rango de la semana
  const esHoy = (fechaActual >= semana.fechaInicio && fechaActual <= semana.fechaFin) ||
    isToday(semana.fechaInicio) || isToday(semana.fechaFin);

  const esProximo = Boolean(proximoFertilizante &&
    isSameWeek(proximoFertilizante.fecha, semana.fechaInicio, { weekStartsOn: 1 }));

  // Filtrar eventos según el filtro de planta
  const eventosFiltrados = useMemo(() => {
    if (filtroPlanta === 'todas') return semana.eventos;

    return semana.eventos.filter(evento => {
      if (filtroPlanta === 'todas') return true;
      return evento.plantas.includes(filtroPlanta);
    });
  }, [semana.eventos, filtroPlanta]);

  return (
    <div className={`card ${esHoy ? 'semaforo-hoy' : esProximo ? 'semaforo-proximo' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Semana {semana.semana + 1}
        </h3>
        <div className="text-sm text-gray-600">
          {formatearRangoSemana(semana.fechaInicio, semana.fechaFin)}
        </div>
      </div>

      {esHoy && (
        <div className="bg-cultivo-100 text-cultivo-800 px-3 py-2 rounded-lg mb-4 text-sm font-medium">
          🚦 HOY
        </div>
      )}

      {esProximo && !esHoy && (
        <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg mb-4 text-sm font-medium">
          ⏰ Próximo fertilizante
        </div>
      )}

      <div className="space-y-3">
        {eventosFiltrados.length > 0 ? (
          eventosFiltrados.map((evento) => (
            <EventoCard
              key={evento.id}
              evento={evento}
              esHoy={esHoy}
              esProximo={esProximo}
              onSeleccionar={onSeleccionarEvento}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            No hay eventos para esta planta en esta semana
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de detalles
interface DetallesPanelProps {
  evento: Evento | null;
  onCerrar: () => void;
}

function DetallesPanel({ evento, onCerrar }: DetallesPanelProps) {
  if (!evento) return null;

  const plantasDetalle = PLANTAS.filter(p => evento.plantas.includes(p.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Detalles & Dosis</h2>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600">{evento.notas}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Fase del cultivo</h3>
              <p className="text-gray-600">{evento.fase}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Dosis por planta</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Planta
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Litros sugeridos
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dosis ml/L
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plantasDetalle.map((planta) => (
                      <tr key={planta.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {planta.nombre}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {planta.tipo}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {planta.tipo === 'maceta'
                            ? `${evento.litrosPorPlanta.maceta.min}-${evento.litrosPorPlanta.maceta.max}L`
                            : `${evento.litrosPorPlanta.suelo.min}-${evento.litrosPorPlanta.suelo.max}L`
                          }
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {evento.productos.length > 0 ? (
                            evento.productos.map((producto, index) => (
                              <div key={index}>
                                {producto}: {evento.dosis[index]} ml/L
                              </div>
                            ))
                          ) : (
                            'Solo agua de la llave'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Función para enviar notificación por WhatsApp
function enviarWhatsApp(mensaje: string) {
  const numero = '56937244264';
  const mensajeCodificado = encodeURIComponent(mensaje);
  const url = `https://wa.me/${numero}?text=${mensajeCodificado}`;
  window.open(url, '_blank');
}

// Tipos para recordatorios
interface Recordatorio {
  tipo: 'fertilizacion-hoy' | 'fertilizacion-manana' | 'trasplante';
  mensaje: string;
  urgencia: 'alta' | 'media';
}

// Función para generar recordatorios de cultivo
function generarRecordatorios(fechaActual: Date): Recordatorio[] {
  const semanas = generarTodasLasSemanas();
  const recordatorios: Recordatorio[] = [];

  // Encontrar la semana actual
  const semanaActual = semanas.find(semana =>
    (fechaActual >= semana.fechaInicio && fechaActual <= semana.fechaFin) ||
    isToday(semana.fechaInicio) || isToday(semana.fechaFin)
  );

  if (!semanaActual) return recordatorios;

  // Recordatorios de cambio de fase
  const faseActual = semanaActual.eventos[0]?.fase || 'Germinación';
  recordatorios.push({
    tipo: 'fertilizacion-hoy',
    mensaje: `🌿 CAMBIO DE FASE DETECTADO\n\nFase actual: ${faseActual}\nSemana ${semanaActual.semana + 1}\n\n📅 Rango: ${formatearRangoSemana(semanaActual.fechaInicio, semanaActual.fechaFin)}\n\n⚠️ IMPORTANTE: Ajusta el cuidado según la nueva fase`,
    urgencia: 'media'
  });

  // Recordatorios de fertilización
  const eventosFertilizacion = semanaActual.eventos.filter(e => e.tipo === 'fertilizacion');
  eventosFertilizacion.forEach(evento => {
    const diasRestantes = Math.ceil((evento.fecha.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes === 0) {
      recordatorios.push({
        tipo: 'fertilizacion-hoy',
        mensaje: `🌱 HOY: Fertilización\n\nProductos: ${evento.productos.join(', ')}\nDosis: ${evento.dosis.join(' ml/L, ')} ml/L\nMaceta: ${evento.litrosPorPlanta.maceta.min}-${evento.litrosPorPlanta.maceta.max}L\nSuelo: ${evento.litrosPorPlanta.suelo.min}-${evento.litrosPorPlanta.suelo.max}L\n\nNotas: ${evento.notas}`,
        urgencia: 'alta'
      });
    } else if (diasRestantes === 1) {
      recordatorios.push({
        tipo: 'fertilizacion-manana',
        mensaje: `🌱 MAÑANA: Fertilización\n\nProductos: ${evento.productos.join(', ')}\nDosis: ${evento.dosis.join(' ml/L, ')} ml/L\nMaceta: ${evento.litrosPorPlanta.maceta.min}-${evento.litrosPorPlanta.maceta.max}L\nSuelo: ${evento.litrosPorPlanta.suelo.min}-${evento.litrosPorPlanta.suelo.max}L\n\nNotas: ${evento.notas}`,
        urgencia: 'media'
      });
    }
  });

  // Recordatorios de riego (evitar sobre-riego)
  const eventosRiego = semanaActual.eventos.filter(e => e.tipo === 'riego');
  eventosRiego.forEach(evento => {
    const diasRestantes = Math.ceil((evento.fecha.getTime() - fechaActual.getTime()) / (1000 * 60 * 60 * 24));

    if (diasRestantes === 0) {
      recordatorios.push({
        tipo: 'fertilizacion-hoy',
        mensaje: `💧 HOY: Riego\n\n⏰ Hora sugerida: ${format(evento.fecha, 'HH:mm', { locale: es })}\n\n📏 Cantidades:\n• Maceta: ${evento.litrosPorPlanta.maceta.min}-${evento.litrosPorPlanta.maceta.max}L\n• Suelo: ${evento.litrosPorPlanta.suelo.min}-${evento.litrosPorPlanta.suelo.max}L\n\n⚠️ NO SOBRE-REGAR: Verifica que el sustrato esté seco antes de regar\n\nNotas: ${evento.notas}`,
        urgencia: 'alta'
      });
    }
  });

  // Recordatorios de trasplante (eliminado o adaptado)
  // const semanaTrasplante = semanas.find(semana => semana.semana === 5); 
  // if (semanaTrasplante && fechaActual >= semanaTrasplante.fechaInicio && fechaActual <= semanaTrasplante.fechaFin) {
  //   recordatorios.push({
  //     tipo: 'trasplante',
  //     mensaje: `🌿 SUGERENCIA DE TRASPLANTE\n\nSi tienes plantas en macetas pequeñas, considera trasplantar.`,
  //     urgencia: 'media'
  //   });
  // }

  return recordatorios;
}

// Componente de notificaciones WhatsApp
function NotificacionesWhatsApp({ fechaActual }: { fechaActual: Date }) {
  const recordatorios = useMemo(() => generarRecordatorios(fechaActual), [fechaActual]);

  const handleProbarWhatsApp = () => {
    const mensajePrueba = `🧪 PRUEBA DE NOTIFICACIONES\n\n📱 Huerto Urbano - Santiago de Chile\n\n✅ Sistema funcionando correctamente\n📅 Fecha: ${format(fechaActual, 'dd/MM/yyyy HH:mm', { locale: es })}\n\n🌱 Tu huerto está siendo monitoreado automáticamente\n\n📞 Número configurado: +56937244264`;
    enviarWhatsApp(mensajePrueba);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">📱 Notificaciones WhatsApp</h3>
        <button
          onClick={handleProbarWhatsApp}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
        >
          🧪 Probar
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
        <div className="flex items-center">
          <span className="text-green-600 text-sm">✅</span>
          <p className="text-xs text-green-800 ml-2">
            <strong>Automático:</strong> Las notificaciones se envían solas cuando corresponde
          </p>
        </div>
      </div>

      {recordatorios.length === 0 ? (
        <div className="text-center text-gray-500 py-2">
          <p className="text-xs">No hay notificaciones activas hoy</p>
          <p className="text-xs">El sistema te avisará automáticamente cuando sea necesario</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 mb-2">Alertas que se enviarán automáticamente:</p>
          {recordatorios.map((recordatorio, index) => (
            <div key={index} className={`p-2 rounded-lg border ${recordatorio.urgencia === 'alta'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs font-medium">
                    {recordatorio.tipo === 'fertilizacion-hoy' && recordatorio.mensaje.includes('CAMBIO DE FASE') ? '🌿 Cambio de Fase' :
                      recordatorio.tipo === 'fertilizacion-hoy' && recordatorio.mensaje.includes('HOY: Fertilización') ? '🌱 Fertilización HOY' :
                        recordatorio.tipo === 'fertilizacion-hoy' && recordatorio.mensaje.includes('HOY: Riego') ? '💧 Riego HOY' :
                          recordatorio.tipo === 'fertilizacion-manana' ? '🌱 Fertilización MAÑANA' :
                            '🌿 Trasplante'}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {recordatorio.urgencia === 'alta' ? '(Urgente)' : '(Recordatorio)'}
                  </span>
                </div>
                <span className="text-xs text-green-600">✓ Auto</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de reloj
function Reloj({ fechaActual }: { fechaActual: Date }) {
  const semanas = generarTodasLasSemanas();

  // Obtener próximo fertilizante usando la fecha actual del estado
  const proximoFertilizante = useMemo(() => {
    for (const semana of semanas) {
      const proximo = semana.eventos.find(e =>
        e.tipo === 'fertilizacion' && e.fecha >= fechaActual
      );
      if (proximo) return proximo;
    }
    return null;
  }, [semanas, fechaActual]);

  // Encontrar la semana actual
  const semanaActual = semanas.find(semana =>
    (fechaActual >= semana.fechaInicio && fechaActual <= semana.fechaFin) ||
    isToday(semana.fechaInicio) || isToday(semana.fechaFin)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Fecha y Hora Actual</h3>
            <p className="text-lg font-mono text-cultivo-600">
              {format(fechaActual, 'dd/MM/yyyy HH:mm:ss', { locale: es })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Santiago, Chile</p>
            <p className="text-xs text-gray-500">
              {format(fechaActual, 'EEEE', { locale: es })}
            </p>
          </div>
        </div>

        {semanaActual && (
          <div className="bg-cultivo-50 border border-cultivo-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-cultivo-800">
                Semana {semanaActual.semana + 1}
              </span>
              <span className="text-xs text-cultivo-600">
                {formatearRangoSemana(semanaActual.fechaInicio, semanaActual.fechaFin)}
              </span>
            </div>
            <p className="text-xs text-cultivo-600 mt-1">
              {proximoFertilizante ? 'Próximo fertilizante: ' + format(proximoFertilizante.fecha, 'dd/MM', { locale: es }) : 'Solo riegos de agua'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal
function App() {
  const [filtroPlanta, setFiltroPlanta] = useState('todas');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [alertasEnviadas, setAlertasEnviadas] = useState<Set<string>>(new Set());

  // Actualizar fecha cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setFechaActual(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, []);

  // Sistema de alertas automáticas
  useEffect(() => {
    const recordatorios = generarRecordatorios(fechaActual);
    const hoy = format(fechaActual, 'yyyy-MM-dd', { locale: es });

    recordatorios.forEach(recordatorio => {
      const claveAlerta = `${hoy}-${recordatorio.tipo}`;

      // Solo enviar si no se ha enviado hoy
      if (!alertasEnviadas.has(claveAlerta)) {
        // Enviar automáticamente TODAS las alertas
        enviarWhatsApp(recordatorio.mensaje);
        setAlertasEnviadas(prev => new Set([...prev, claveAlerta]));
      }
    });
  }, [fechaActual, alertasEnviadas]);

  // Sistema de notificaciones programadas (cada 6 horas)
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      const recordatorios = generarRecordatorios(ahora);
      const hoy = format(ahora, 'yyyy-MM-dd', { locale: es });

      recordatorios.forEach(recordatorio => {
        const claveAlerta = `${hoy}-${recordatorio.tipo}-${ahora.getHours()}`;

        // Solo enviar si no se ha enviado en esta hora
        if (!alertasEnviadas.has(claveAlerta)) {
          enviarWhatsApp(recordatorio.mensaje);
          setAlertasEnviadas(prev => new Set([...prev, claveAlerta]));
        }
      });
    }, 6 * 60 * 60 * 1000); // Cada 6 horas

    return () => clearInterval(interval);
  }, [alertasEnviadas]);

  const semanas = generarTodasLasSemanas();
  const proximoFertilizante = obtenerProximoFertilizante();

  const handleImprimir = () => {
    window.print();
  };

  const handleEnviarResumenWhatsApp = () => {
    const semanas = generarTodasLasSemanas();
    const semanaActual = semanas.find(semana =>
      (fechaActual >= semana.fechaInicio && fechaActual <= semana.fechaFin) ||
      isToday(semana.fechaInicio) || isToday(semana.fechaFin)
    );

    if (!semanaActual) return;

    const proximoFertilizante = semanaActual.eventos.find(e => e.tipo === 'fertilizacion');

    let mensaje = `🌱 RESUMEN CULTIVO - ${format(fechaActual, 'dd/MM/yyyy', { locale: es })}\n\n`;
    mensaje += `📅 Semana ${semanaActual.semana + 1}: ${formatearRangoSemana(semanaActual.fechaInicio, semanaActual.fechaFin)}\n\n`;

    if (proximoFertilizante) {
      mensaje += `🌱 Próximo fertilizante: ${format(proximoFertilizante.fecha, 'dd/MM', { locale: es })}\n`;
      mensaje += `Productos: ${proximoFertilizante.productos.join(', ')}\n`;
      mensaje += `Dosis: ${proximoFertilizante.dosis.join(' ml/L, ')} ml/L\n\n`;
    } else {
      mensaje += `💧 Solo riegos de agua de la llave\n\n`;
    }

    mensaje += `📋 Plantas:\n`;
    PLANTAS.forEach(planta => {
      mensaje += `• ${planta.nombre} (${planta.tipo})\n`;
    });

    mensaje += `\n🌿 Fase: ${semanaActual.eventos[0]?.fase || 'Germinación'}`;

    enviarWhatsApp(mensaje);
  };

  return (
    <>
      {/* Nature Animated Background */}
      <div className="animated-bg">
        <div className="orb orb-1"></div> {/* Sun */}
        <div className="orb orb-2"></div> {/* Foliage */}
        <div className="orb orb-3"></div> {/* Foliage */}
        <div className="orb orb-4"></div> {/* Water/Sky */}
      </div>

      <div className="min-h-screen relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-emerald-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-full">
                  <span className="text-2xl">🪴</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-emerald-900 tracking-tight">
                    Huerto Urbano
                  </h1>
                  <p className="text-sm text-emerald-600 font-medium">
                    Gestión Inteligente de Cultivos
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEnviarResumenWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-emerald-200 flex items-center gap-2"
                >
                  <span>📱</span> WhatsApp
                </button>
                <button
                  onClick={handleImprimir}
                  className="bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <span>📄</span> PDF
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Reloj fechaActual={fechaActual} />

              <NotificacionesWhatsApp fechaActual={fechaActual} />

              <Filtros
                filtroPlanta={filtroPlanta}
                onFiltroChange={setFiltroPlanta}
              />

              {/* Info de plantas */}
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Plantas</h3>
                <div className="space-y-2">
                  {PLANTAS.map((planta) => (
                    <div key={planta.id} className="text-sm">
                      <div className="font-medium text-gray-900">{planta.nombre}</div>
                      <div className="text-gray-600">{planta.tipo} • {planta.banco}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {semanas.map((semana) => (
                  <SemanaCard
                    key={semana.semana}
                    semana={semana}
                    filtroPlanta={filtroPlanta}
                    proximoFertilizante={proximoFertilizante}
                    onSeleccionarEvento={setEventoSeleccionado}
                    fechaActual={fechaActual}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Panel de detalles */}
      <DetallesPanel
        evento={eventoSeleccionado}
        onCerrar={() => setEventoSeleccionado(null)}
      />
    </>
  );
}

export default App;
