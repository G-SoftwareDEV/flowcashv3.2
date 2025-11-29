import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ isOpen, onClose, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  if (!isOpen) return null;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(selectedDate);
    onClose();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const today = new Date();

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      <div className="bg-orange-500 text-white p-6 flex items-center justify-between shadow-md">
        <h2 className="text-2xl font-bold">Histórico</h2>
        <button onClick={onClose} className="bg-orange-600 p-2 rounded-full hover:bg-orange-700 transition">
            <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6">
          
          <div className="flex items-center justify-between mb-8">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full text-orange-500">
              <ChevronLeft size={32} />
            </button>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 capitalize">
              {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full text-orange-500">
              <ChevronRight size={32} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4 text-center">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="font-semibold text-gray-400 uppercase text-xs sm:text-sm">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isToday = dateToCheck.getDate() === today.getDate() && 
                              dateToCheck.getMonth() === today.getMonth() && 
                              dateToCheck.getFullYear() === today.getFullYear();
              
              const isFuture = dateToCheck > today;

              return (
                <button
                  key={day}
                  disabled={isFuture}
                  onClick={() => handleDateClick(day)}
                  className={`
                    aspect-square rounded-2xl flex items-center justify-center text-lg font-medium transition-all
                    ${isToday ? 'bg-orange-500 text-white shadow-orange-200 shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-orange-100'}
                    ${isFuture ? 'opacity-30 cursor-not-allowed hover:bg-gray-50' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            Selecione um dia para visualizar o fluxo de caixa daquela data.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;