import React from 'react';
import { useProject } from '../context/ProjectContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TaskStatus } from '../types';
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { projects, currentUser } = useProject();

  // Aggregate stats
  const allTasks = projects.flatMap(p => p.tasks);
  const completed = allTasks.filter(t => t.status === TaskStatus.DONE).length;
  const inProgress = allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const todo = allTasks.filter(t => t.status === TaskStatus.TODO).length;
  const myTasks = allTasks.filter(t => t.assigneeId === currentUser?.id);

  // Using #1e3a8a for Navy Blue (blue-900)
  const statusData = [
    { name: 'To Do', value: todo, color: '#94a3b8' },
    { name: 'In Progress', value: inProgress, color: '#1e3a8a' }, 
    { name: 'Done', value: completed, color: '#22c55e' },
  ];

  const projectProgressData = projects.map(p => {
    const total = p.tasks.length;
    const done = p.tasks.filter(t => t.status === TaskStatus.DONE).length;
    return {
      name: p.name,
      progress: total === 0 ? 0 : Math.round((done / total) * 100)
    };
  });

  const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
       <div>
         <p className="text-sm font-medium text-gray-500">{title}</p>
         <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
       </div>
       <div className={`p-3 rounded-lg ${bg}`}>
         <Icon className={`w-6 h-6 ${color}`} />
       </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {currentUser?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={allTasks.length} icon={TrendingUp} color="text-blue-900" bg="bg-blue-50" />
        <StatCard title="In Progress" value={inProgress} icon={Clock} color="text-blue-700" bg="bg-blue-50" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" />
        <StatCard title="Assigned to Me" value={myTasks.length} icon={AlertCircle} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Progress (%)</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={projectProgressData}>
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="progress" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Task Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Distribution</h3>
           <div className="h-64 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={statusData}
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-900">{allTasks.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Tasks</span>
             </div>
           </div>
           <div className="flex justify-center gap-6 mt-4">
             {statusData.map((d) => (
               <div key={d.name} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                 <span className="text-sm text-gray-600">{d.name}</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};