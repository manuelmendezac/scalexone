import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface LaunchEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  videoUrl: string;
}

interface LaunchCalendarProps {
  events: LaunchEvent[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

const LaunchCalendar: React.FC<LaunchCalendarProps> = ({
  events,
  selectedDate,
  onSelectDate
}) => {
  // Obtener el mes actual y sus días
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Crear array de días del mes
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Obtener eventos por día
  const getEventsForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    return events.filter(event => event.date === date);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-cyan-400" />
          <h3 className="font-orbitron text-lg text-white">
            {new Date(currentYear, currentMonth).toLocaleString('es', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm text-gray-400 font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array(firstDayOfMonth).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map(day => {
          const date = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
          const dayEvents = getEventsForDay(day);
          const isSelected = date === selectedDate;
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={day}
              onClick={() => onSelectDate?.(date)}
              className={`
                aspect-square p-1 rounded-lg relative
                ${hasEvents ? 'bg-cyan-900/30' : 'hover:bg-gray-700/30'}
                ${isSelected ? 'ring-2 ring-cyan-400' : ''}
              `}
            >
              <span className={`
                text-sm
                ${hasEvents ? 'text-cyan-400 font-medium' : 'text-gray-400'}
                ${isSelected ? 'text-cyan-400' : ''}
              `}>
                {day}
              </span>
              {hasEvents && (
                <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de eventos del día seleccionado */}
      {selectedDate && (
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium text-gray-400">
            Eventos para {new Date(selectedDate).toLocaleDateString('es', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long'
            })}
          </h4>
          {getEventsForDay(new Date(selectedDate).getDate()).map(event => (
            <div
              key={event.id}
              className="p-4 rounded-lg bg-gray-700/30 border border-gray-600"
            >
              <h5 className="font-medium text-cyan-400">{event.title}</h5>
              <p className="mt-1 text-sm text-gray-400">{event.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LaunchCalendar; 