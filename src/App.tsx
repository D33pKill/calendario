import { useState, useMemo } from 'react';
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

function SemanaCard({ semana, filtroPlanta, proximoFertilizante, onSeleccionarEvento }: SemanaCardProps) {
  const esHoy = isToday(semana.fechaInicio) || isToday(semana.fechaFin) || 
    isSameWeek(new Date(), semana.fechaInicio, { weekStartsOn: 1 });
  
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
                            'Solo agua pH 6.3-6.7'
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

// Componente principal
function App() {
  const [filtroPlanta, setFiltroPlanta] = useState('todas');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  
  const semanas = generarTodasLasSemanas();
  const proximoFertilizante = obtenerProximoFertilizante();

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Calendario de Cultivo
              </h1>
              <p className="text-sm text-gray-600">
                Santiago de Chile • 5 plantas • 2025-09-08 → 2026-03-16
              </p>
            </div>
            <button
              onClick={handleImprimir}
              className="btn-primary"
            >
              📄 Imprimir/PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
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
