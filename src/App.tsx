import { useState, useMemo, useEffect } from 'react';
import { 
  generarTodasLasSemanas, 
  formatearRangoSemana,
  PLANTAS,
  type Evento 
} from './schedule';
import { generarSemanasTopCrop } from './topcrop';
import tablaTopCrop from './img/Tabla-de-cultivo-768x549.jpg';
import { format, isToday, isSameWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fetchWeatherData, buildWeatherAdvice, type WeatherData } from './weather';

// Componente de filtros
interface FiltrosProps {
  filtroPlanta: string;
  onFiltroChange: (filtro: string) => void;
}

function Filtros({ filtroPlanta, onFiltroChange }: FiltrosProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="filtro-planta"
            value="todas"
            checked={filtroPlanta === 'todas'}
            onChange={(e) => onFiltroChange(e.target.value)}
            className="mr-2"
          />
          <span className="text-sm">Todas las plantas</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="filtro-planta"
            value="fresh-candy-suelo"
            checked={filtroPlanta === 'fresh-candy-suelo'}
            onChange={(e) => onFiltroChange(e.target.value)}
            className="mr-2"
          />
          <span className="text-sm">Fresh Candy (suelo)</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="filtro-planta"
            value="cream-mandarine-suelo"
            checked={filtroPlanta === 'cream-mandarine-suelo'}
            onChange={(e) => onFiltroChange(e.target.value)}
            className="mr-2"
          />
          <span className="text-sm">Cream Mandarine (suelo)</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="filtro-planta"
            value="cream-mandarine-maceta"
            checked={filtroPlanta === 'cream-mandarine-maceta'}
            onChange={(e) => onFiltroChange(e.target.value)}
            className="mr-2"
          />
          <span className="text-sm">Cream Mandarine (macetas)</span>
        </label>
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
      case 'lavado': return 'badge badge-lavado';
      case 'cosecha': return 'badge badge-cosecha';
      default: return 'badge bg-gray-100 text-gray-800';
    }
  };

  const getTipoTexto = (tipo: string) => {
    switch (tipo) {
      case 'fertilizacion': return 'Fertilización';
      case 'riego': return 'Riego';
      case 'lavado': return 'Lavado';
      case 'cosecha': return 'Cosecha';
      default: return tipo;
    }
  };

  return (
    <div 
      data-anim="evento"
      className={`card card-hover cursor-pointer ${
        esHoy ? 'semaforo-hoy' : esProximo ? 'semaforo-proximo' : ''
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
      if (filtroPlanta === 'fresh-candy-suelo') {
        return evento.plantas.includes('fresh-candy-suelo');
      } else if (filtroPlanta === 'cream-mandarine-suelo') {
        return evento.plantas.includes('cream-mandarine-suelo');
      } else if (filtroPlanta === 'cream-mandarine-maceta') {
        return evento.plantas.some(id => id.includes('maceta'));
      }
      return true;
    });
  }, [semana.eventos, filtroPlanta]);

  return (
    <div data-anim="semana" className={`card ${esHoy ? 'semaforo-hoy' : esProximo ? 'semaforo-proximo' : ''}`}>
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
                        pH suelo
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
                          {'phSuelo' in planta ? `${(planta as any).phSuelo.min}-${(planta as any).phSuelo.max}` : '—'}
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
function generarRecordatorios(fechaActual: Date, semanas: { fechaInicio: Date; fechaFin: Date; semana: number; eventos: Evento[] }[]): Recordatorio[] {
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
  
  // Recordatorios de trasplante
  const semanaTrasplante = semanas.find(semana => semana.semana === 5); // Semana 6 (índice 5)
  if (semanaTrasplante && fechaActual >= semanaTrasplante.fechaInicio && fechaActual <= semanaTrasplante.fechaFin) {
    recordatorios.push({
      tipo: 'trasplante',
      mensaje: `🌿 MOMENTO IDEAL DE TRASPLANTE\n\nSemana 6 - Crecimiento Vegetativo Intenso\n\n📋 Instrucciones:\n• Fresh Candy: Trasplantar a suelo directo\n• Cream Mandarine #1: Trasplantar a suelo directo\n• Cream Mandarine #2-4: Trasplantar a macetas definitivas (más grandes)\n\n💡 Consejos:\n• Hacerlo en horas de menor calor\n• Regar bien después del trasplante\n• Usar sustrato de buena calidad`,
      urgencia: 'media'
    });
  }
  
  return recordatorios;
}

// Componente de notificaciones WhatsApp
function NotificacionesWhatsApp({ fechaActual, semanas }: { fechaActual: Date; semanas: { fechaInicio: Date; fechaFin: Date; semana: number; eventos: Evento[] }[] }) {
  const recordatorios = useMemo(() => generarRecordatorios(fechaActual, semanas), [fechaActual, semanas]);
  
  const handleProbarWhatsApp = () => {
    const mensajePrueba = `🧪 PRUEBA DE NOTIFICACIONES\n\n📱 Calendario de Cultivo - Santiago de Chile\n\n✅ Sistema funcionando correctamente\n📅 Fecha: ${format(fechaActual, 'dd/MM/yyyy HH:mm', { locale: es })}\n\n🌱 Tu cultivo está siendo monitoreado automáticamente\n\n📞 Número configurado: +56937244264`;
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
            <div key={index} className={`p-2 rounded-lg border ${
              recordatorio.urgencia === 'alta' 
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
function Reloj({ fechaActual, semanas }: { fechaActual: Date; semanas: { fechaInicio: Date; fechaFin: Date; semana: number; eventos: Evento[] }[] }) {
  
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
  const [tipoCalendario, setTipoCalendario] = useState<'personalizado' | 'topcrop'>('personalizado');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  
  // Actualizar fecha cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setFechaActual(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, []);

  // Sistema de alertas automáticas
  useEffect(() => {
    const recordatorios = generarRecordatorios(fechaActual, semanasMemo);
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
      const recordatorios = generarRecordatorios(ahora, semanasMemo);
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

  // Clima: obtener al cargar y refrescar cada 6h
  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const data = await fetchWeatherData();
        if (!cancel) setWeather(data);
      } catch {}
    };
    load();
    const t = setInterval(load, 6 * 60 * 60 * 1000);
    return () => { cancel = true; clearInterval(t); };
  }, []);
  
  const semanasMemo = useMemo(() => {
    if (tipoCalendario === 'personalizado') {
      return generarTodasLasSemanas();
    }
    return generarSemanasTopCrop().map(sem => ({
      fechaInicio: sem.fechaInicio,
      fechaFin: sem.fechaFin,
      semana: sem.semana,
      eventos: sem.eventos.map(ev => ({
        id: ev.id,
        tipo: ev.tipo as Evento['tipo'],
        fecha: ev.fecha,
        productos: ev.productos,
        dosis: ev.dosis,
        litrosPorPlanta: ev.litrosPorPlanta,
        plantas: PLANTAS.map(p => p.id),
        notas: ev.notas,
        fase: ev.fase
      }))
    }));
  }, [tipoCalendario]);

  const proximoFertilizante = useMemo(() => {
    for (const semana of semanasMemo) {
      const proximo = semana.eventos.find(e => e.tipo === 'fertilizacion' && e.fecha >= fechaActual);
      if (proximo) return proximo;
    }
    return null;
  }, [semanasMemo, fechaActual]);

  const handleImprimir = () => {
    window.print();
  };

  const handleEnviarResumenWhatsApp = () => {
    const semanaActual = semanasMemo.find(semana => 
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

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!rootRef.current) return;

    const listeners: Array<() => void> = [];

    const ctx = gsap.context(() => {
      gsap.from('[data-anim="header"]', { y: -20, opacity: 0, duration: 0.6, ease: 'power2.out' });
      gsap.from('[data-anim="header-actions"] > *', { y: -10, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power2.out' });

      gsap.from('[data-anim="sidebar"] > *', { x: -20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' });

      gsap.utils.toArray<HTMLElement>('[data-anim="semana"]').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%'
          },
          y: 20,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          delay: Math.min(i * 0.03, 0.3)
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-anim="evento"]').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 90%'
          },
          y: 10,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      });

      // Microinteracciones dopaminérgicas en tarjetas (hover): sutil pop y elevación
      const hoveredCards = gsap.utils.toArray<HTMLElement>('.card');
      hoveredCards.forEach((card) => {
        const onEnter = () => {
          gsap.to(card, { duration: 0.2, y: -3, scale: 1.012, boxShadow: '0 12px 24px rgba(0,0,0,0.12)', ease: 'power2.out' });
        };
        const onLeave = () => {
          gsap.to(card, { duration: 0.25, y: 0, scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', ease: 'power2.out' });
        };
        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);
        listeners.push(() => {
          card.removeEventListener('mouseenter', onEnter);
          card.removeEventListener('mouseleave', onLeave);
        });
      });

      // Parallax suave para la imagen Top Crop si existe
      const topCropImg = document.querySelector<HTMLImageElement>('img[alt="Tabla de cultivo Top Crop"]');
      if (topCropImg) {
        gsap.fromTo(topCropImg, { yPercent: -2 }, {
          yPercent: 2,
          ease: 'none',
          scrollTrigger: {
            trigger: topCropImg,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5
          }
        });
      }

    }, rootRef);

    return () => {
      listeners.forEach((fn) => fn());
      ctx.revert();
    };
  }, [tipoCalendario, filtroPlanta]);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden" ref={rootRef}>
      {/* Parallax decorativo */}
      <div className="parallax-layer z-0" style={{ backgroundImage: `linear-gradient(rgba(17,24,39,0.25), rgba(17,24,39,0.25)), url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1920&auto=format&fit=crop')`, opacity: 0.08 }} />
      <div className="parallax-layer z-0" style={{ backgroundImage: `radial-gradient(transparent 45%, rgba(17,24,39,0.35)), url('https://images.unsplash.com/photo-1516542076529-1ea3854896e1?q=80&w=1920&auto=format&fit=crop')`, opacity: 0.06, transform: 'translateY(10vh)' }} />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-10" data-anim="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Calendario de Cultivo
              </h1>
              <p className="text-sm text-gray-600">
                Santiago de Chile • 5 plantas • 2025-09-04 → 2026-03-16
              </p>
            </div>
            <div className="flex space-x-2" data-anim="header-actions">
              <select
                value={tipoCalendario}
                onChange={(e) => setTipoCalendario(e.target.value as 'personalizado' | 'topcrop')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                aria-label="Tipo de calendario"
              >
                <option value="personalizado">Personalizado</option>
                <option value="topcrop">Top Crop</option>
              </select>
              <button
                onClick={handleEnviarResumenWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                📱 WhatsApp
              </button>
              <button
                onClick={handleImprimir}
                className="btn-primary"
              >
                📄 Imprimir/PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-4 self-start" data-anim="sidebar">
            <Reloj fechaActual={fechaActual} semanas={semanasMemo} />
            
            <NotificacionesWhatsApp fechaActual={fechaActual} semanas={semanasMemo} />
            
            {/* Clima */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Clima - Cerro Navia</h3>
              {weather ? (
                <div className="space-y-3">
                  {weather.current && (
                    <div className="text-sm text-gray-700">
                      <div>Ahora: {Math.round(weather.current.temperature)}°C • Viento {Math.round(weather.current.windSpeed)} km/h</div>
                      <div>Humedad: {Math.round(weather.current.relativeHumidity)}%</div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left text-gray-500">Día</th>
                          <th className="px-2 py-1 text-left text-gray-500">Min/Max</th>
                          <th className="px-2 py-1 text-left text-gray-500">Lluvia</th>
                          <th className="px-2 py-1 text-left text-gray-500">Viento</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {weather.daily.slice(0,5).map((d, i) => (
                          <tr key={i}>
                            <td className="px-2 py-1 text-gray-700">{d.date.slice(5)}</td>
                            <td className="px-2 py-1 text-gray-700">{Math.round(d.tempMin)}° / {Math.round(d.tempMax)}°</td>
                            <td className="px-2 py-1 text-gray-700">{Math.round(d.precipitationProbMax)}% ({Math.round(d.precipitationSum)}mm)</td>
                            <td className="px-2 py-1 text-gray-700">{Math.round(d.windMax)} km/h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                    {buildWeatherAdvice(weather.daily).map((m, i) => (
                      <div key={i}>• {m}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Cargando clima…</div>
              )}
            </div>
            
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
                    {'phSuelo' in planta && (
                      <div className="text-xs text-gray-500">pH suelo recomendado: {(planta as any).phSuelo.min}-{(planta as any).phSuelo.max}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {tipoCalendario === 'topcrop' && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tabla Top Crop (referencia)</h3>
                  <p className="text-sm text-gray-600 mb-3">Esta vista simula la tabla oficial de Top Crop.</p>
                  <img src={tablaTopCrop} alt="Tabla de cultivo Top Crop" className="w-full h-auto rounded" />
                </div>
              )}
              {semanasMemo.map((semana) => (
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

      {/* Panel de detalles */}
      <DetallesPanel
        evento={eventoSeleccionado}
        onCerrar={() => setEventoSeleccionado(null)}
      />
    </div>
  );
}

export default App;
