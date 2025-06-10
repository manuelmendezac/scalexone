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
  launchStartDate?: string; // formato YYYY-MM-DD
  launchEndDate?: string;   // formato YYYY-MM-DD
}

const LaunchCalendar: React.FC<LaunchCalendarProps> = ({
  events,
  selectedDate,
  onSelectDate,
  launchStartDate,
  launchEndDate
}) => {
  // Obtener el mes actual y sus días
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Calcular el rango de días a mostrar según el rango de lanzamiento
  let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let startDay = 1;
  let endDay = daysInMonth;
  if (launchStartDate && launchEndDate) {
    const start = new Date(launchStartDate);
    const end = new Date(launchEndDate);
    if (start.getMonth() === currentMonth && end.getMonth() === currentMonth) {
      startDay = start.getDate();
      endDay = end.getDate();
    } else if (start.getMonth() === currentMonth) {
      startDay = start.getDate();
    } else if (end.getMonth() === currentMonth) {
      endDay = end.getDate();
    }
  }
  const days = Array.from({ length: endDay - startDay + 1 }, (_, i) => i + startDay);

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
          <div key={day} className="text-center text-xs md:text-sm text-gray-400 font-medium py-1 md:py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const date = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
          const dayEvents = getEventsForDay(day);
          const isSelected = date === selectedDate;
          const hasEvents = dayEvents.length > 0;
          // Marcar si el día está dentro del rango de lanzamiento
          let isInLaunchRange = false;
          if (launchStartDate && launchEndDate) {
            const d = new Date(date);
            const start = new Date(launchStartDate);
            const end = new Date(launchEndDate);
            isInLaunchRange = d >= start && d <= end;
          }

          return (
            <button
              key={day}
              onClick={() => onSelectDate?.(date)}
              className={`
                aspect-square p-1 rounded-lg relative
                ${isInLaunchRange ? 'bg-fuchsia-700/60 border-2 border-fuchsia-400' : hasEvents ? 'bg-cyan-900/30' : 'hover:bg-gray-700/30'}
                ${isSelected ? 'ring-2 ring-cyan-400' : ''}
                flex flex-col items-center justify-center text-center transition-all duration-150
              `}
            >
              <span className={`
                text-xs md:text-sm
                ${isInLaunchRange ? 'text-fuchsia-200 font-bold' : hasEvents ? 'text-cyan-400 font-medium' : 'text-gray-400'}
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