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

  // PSU Colors for Charts
  const statusData = [
    { name: 'To Do', value: todo, color: '#94a3b8' }, // Slate
    { name: 'In Progress', value: inProgress, color: '#002855' }, // PSU Navy
    { name: 'Done', value: completed, color: '#006400' }, // PSU Green
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
    <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50 flex items-center justify-between hover:bg-white/50 transition-all duration-300 transform hover:-translate-y-1">
       <div>
         <p className="text-sm font-medium text-gray-600">{title}</p>
         <h3 className="text-3xl font-bold text-psu-navy mt-1">{value}</h3>
       </div>
       <div className={`p-3 rounded-xl shadow-inner ${bg} bg-opacity-70 backdrop-blur-sm`}>
         <Icon className={`w-6 h-6 ${color}`} />
       </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-psu-navy tracking-tight">Welcome back, {currentUser?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-600 font-medium bg-white/30 px-4 py-2 rounded-full border border-white/40 shadow-sm backdrop-blur-sm">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Tasks" value={allTasks.length} icon={TrendingUp} color="text-psu-navy" bg="bg-blue-100" />
        <StatCard title="In Progress" value={inProgress} icon={Clock} color="text-psu-gold" bg="bg-yellow-50" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} color="text-green-700" bg="bg-green-100" />
        <StatCard title="Assigned to Me" value={myTasks.length} icon={AlertCircle} color="text-psu-red" bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Bar Chart */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50">
           <h3 className="text-lg font-semibold text-psu-navy mb-6">Project Progress (%)</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={projectProgressData}>
                 <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.2)'}} 
                    contentStyle={{borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} 
                 />
                 <Bar dataKey="progress" fill="#002855" radius={[6, 6, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Task Status Pie Chart */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50">
           <h3 className="text-lg font-semibold text-psu-navy mb-6">Task Distribution</h3>
           <div className="h-64 flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={statusData}
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                   stroke="none"
                 >
                   {statusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)'}} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-psu-navy">{allTasks.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">Tasks</span>
             </div>
           </div>
           <div className="flex justify-center gap-6 mt-4">
             {statusData.map((d) => (
               <div key={d.name} className="flex items-center gap-2 bg-white/30 px-3 py-1 rounded-full border border-white/40">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                 <span className="text-sm text-gray-700 font-medium">{d.name}</span>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};