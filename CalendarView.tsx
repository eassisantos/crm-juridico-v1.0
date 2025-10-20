
import React, { useState } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { Task } from '../types';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import TaskFormModal from './TaskFormModal';

const CalendarView: React.FC = () => {
  const { cases } = useCrmData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const allTasks = cases.flatMap(c => c.tasks);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const tasksByDate: { [key: string]: Task[] } = {};
  allTasks.forEach(task => {
    const dueDate = new Date(task.dueDate).toDateString();
    if (!tasksByDate[dueDate]) {
      tasksByDate[dueDate] = [];
    }
    tasksByDate[dueDate].push(task);
  });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <>
      <TaskFormModal isOpen={isModalOpen} onClose={handleCloseModal} initialDate={selectedDate} />
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Calendário de Prazos</h1>
          <p className="text-slate-600 mt-1">Visualize e adicione tarefas e prazos do escritório.</p>
        </header>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeft /></button>
            <h2 className="text-xl font-bold text-slate-800">
              {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
            </h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100"><ChevronRight /></button>
          </div>

          <div className="grid grid-cols-7 gap-px border-l border-t border-slate-200 bg-slate-200">
            {weekDays.map(wd => (
              <div key={wd} className="text-center font-semibold text-sm py-2 bg-slate-50 text-slate-600">{wd}</div>
            ))}
            {days.map((d, i) => {
              const tasksForDay = tasksByDate[d.toDateString()] || [];
              const isCurrentMonth = d.getMonth() === currentDate.getMonth();
              const isToday = d.toDateString() === new Date().toDateString();

              return (
                <div key={i} className={`relative min-h-[120px] p-2 bg-white group ${isCurrentMonth ? '' : 'bg-slate-50'}`}>
                  <time dateTime={d.toISOString()} className={`text-sm font-semibold ${isToday ? 'flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white' : ''} ${isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>
                    {d.getDate()}
                  </time>
                  <button onClick={() => handleDayClick(d)} className="absolute top-1 right-1 p-1 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-blue-600 transition-opacity">
                    <PlusCircle size={18} />
                  </button>
                  <ul className="mt-2 space-y-1">
                    {tasksForDay.map(task => (
                      <li key={task.id}>
                        <Link to={`/cases/${task.caseId}`} className={`block p-1 rounded text-xs ${task.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} hover:opacity-80`}>
                          <p className="font-medium truncate">{task.description}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarView;
