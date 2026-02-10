import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskStatus, Priority } from '../types';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '../components/Button';

type ViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC = () => {
  const { projects, users } = useProject();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  // Filter tasks logic
  const getAllTasks = () => {
    let tasks = projects.flatMap(p => 
      p.tasks.map(t => ({ ...t, projectName: p.name, projectId: p.id }))
    );

    if (filterProject !== 'all') {
      tasks = tasks.filter(t => t.projectId === filterProject);
    }
    if (filterAssignee !== 'all') {
      tasks = tasks.filter(t => t.assigneeId === filterAssignee);
    }
    return tasks;
  };

  const tasks = getAllTasks();

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dateString);
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create matrix
    const weeks = [];
    let days = [];
    
    // Empty slots for prev month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-100"></div>);
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayTasks = getTasksForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div key={d} className={`h-32 p-2 border border-gray-100 overflow-y-auto ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-1">
             <span className={`text-sm font-semibold ${isToday ? 'text-blue-900' : 'text-gray-700'}`}>{d}</span>
             <span className="text-xs text-gray-400">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          </div>
          <div className="space-y-1">
            {dayTasks.map(task => (
              <div 
                key={task.id} 
                className={`text-xs p-1 rounded truncate border-l-2 ${
                  task.status === TaskStatus.DONE ? 'bg-green-50 border-green-500 text-green-700' : 
                  task.priority === Priority.HIGH ? 'bg-red-50 border-red-500 text-red-700' :
                  'bg-blue-50 border-blue-500 text-blue-700'
                }`}
                title={`${task.title} (${task.projectName})`}
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      );

      if (days.length === 7) {
        weeks.push(<div key={`week-${d}`} className="grid grid-cols-7">{days}</div>);
        days = [];
      }
    }
    
    // Remaining empty slots
    if (days.length > 0) {
      for (let i = days.length; i < 7; i++) {
        days.push(<div key={`empty-end-${i}`} className="h-32 bg-gray-50 border border-gray-100"></div>);
      }
      weeks.push(<div key="last-week" className="grid grid-cols-7">{days}</div>);
    }

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-7 bg-gray-50 text-center py-2 border-b border-gray-200 text-sm font-medium text-gray-500">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        {weeks}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayTasks = getTasksForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div key={i} className={`flex-1 min-h-[500px] border-r border-gray-200 last:border-r-0 ${isToday ? 'bg-blue-50/30' : ''}`}>
           <div className={`p-3 text-center border-b border-gray-200 ${isToday ? 'bg-blue-100' : 'bg-gray-50'}`}>
             <div className="text-xs font-medium text-gray-500 uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
             <div className={`text-lg font-bold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>{date.getDate()}</div>
           </div>
           <div className="p-2 space-y-2">
             {dayTasks.map(task => (
                <div key={task.id} className="p-2 bg-white rounded border border-gray-200 shadow-sm text-sm">
                   <div className="font-medium text-gray-900">{task.title}</div>
                   <div className="text-xs text-gray-500 mt-1">{task.projectName}</div>
                   <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                         task.status === TaskStatus.DONE ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>{task.status}</span>
                   </div>
                </div>
             ))}
           </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 flex overflow-x-auto">
        {days}
      </div>
    );
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 min-h-[400px] p-6">
         <h3 className="text-lg font-bold text-gray-900 mb-4">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
         
         {dayTasks.length === 0 ? (
           <p className="text-gray-500 italic">No tasks due today.</p>
         ) : (
           <div className="space-y-3">
             {dayTasks.map(task => (
               <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                 <div>
                   <h4 className="font-semibold text-gray-900">{task.title}</h4>
                   <p className="text-sm text-gray-500">{task.projectName} • {task.description}</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <img 
                       src={users.find(u => u.id === task.assigneeId)?.avatarUrl} 
                       className="w-8 h-8 rounded-full bg-gray-200"
                       title={users.find(u => u.id === task.assigneeId)?.name}
                    />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === Priority.HIGH ? 'bg-red-100 text-red-700' :
                        task.priority === Priority.MEDIUM ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>{task.priority}</span>
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white rounded-lg border border-gray-300 p-1">
             <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
             <span className="min-w-[140px] text-center font-medium text-gray-700">
               {viewMode === 'day' 
                 ? currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                 : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
               }
             </span>
             <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === mode ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <select 
          value={filterProject} 
          onChange={(e) => setFilterProject(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-900 focus:border-blue-900 block p-2"
        >
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select 
          value={filterAssignee} 
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-900 focus:border-blue-900 block p-2"
        >
          <option value="all">All Assignees</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
};