import React from 'react';
import { useProject } from '../context/ProjectContext';
import { ChatWidget } from './ChatWidget';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  LogOut, 
  Menu,
  Bell,
  Search,
  CalendarDays,
  User as UserIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'projects' | 'calendar' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'projects' | 'calendar' | 'profile') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, projects, currentProject, setCurrentProject } = useProject();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Custom SVG Logo: Boxes being sorted (Minimalistic)
  const LOGO_URL = "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='50' y='130' width='100' height='30' rx='4' fill='%23002855'/%3E%3Crect x='50' y='85' width='100' height='30' rx='4' fill='%23002855'/%3E%3Crect x='60' y='40' width='100' height='30' rx='4' fill='%23F2A900' transform='rotate(-10 110 55)'/%3E%3Cpath d='M170 40 Q 185 65 170 90' fill='none' stroke='%23F2A900' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M165 80 L170 90 L180 80' fill='none' stroke='%23F2A900' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        bg-white/60 backdrop-blur-xl border-r border-white/50 shadow-lg
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 h-20 px-6 border-b border-white/50">
          <img 
            src={LOGO_URL} 
            alt="PSU Logo" 
            className="w-10 h-10 object-contain drop-shadow-sm"
          />
          <div className="flex flex-col">
             <span className="text-psu-navy font-bold text-sm leading-tight">PARTIDO STATE</span>
             <span className="text-psu-gold font-bold text-sm leading-tight">UNIVERSITY</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === 'dashboard' 
                ? 'bg-psu-navy text-white shadow-md border-l-4 border-psu-gold' 
                : 'text-gray-600 hover:bg-psu-navy/10 hover:text-psu-navy'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 mr-3 ${activeTab === 'dashboard' ? 'text-psu-gold' : ''}`} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === 'calendar' 
                ? 'bg-psu-navy text-white shadow-md border-l-4 border-psu-gold' 
                : 'text-gray-600 hover:bg-psu-navy/10 hover:text-psu-navy'
            }`}
          >
            <CalendarDays className={`w-5 h-5 mr-3 ${activeTab === 'calendar' ? 'text-psu-gold' : ''}`} />
            Calendar
          </button>
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-bold text-psu-navy/70 uppercase tracking-wider">
              Projects
            </p>
          </div>
          
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => {
                setCurrentProject(project.id);
                setActiveTab('projects');
              }}
              className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeTab === 'projects' && currentProject?.id === project.id
                  ? 'bg-psu-navy text-white shadow-md border-l-4 border-psu-gold'
                  : 'text-gray-600 hover:bg-psu-navy/10 hover:text-psu-navy'
              }`}
            >
              <span className={`w-2 h-2 mr-3 rounded-full ${
                activeTab === 'projects' && currentProject?.id === project.id ? 'bg-psu-gold' : 'bg-gray-400'
              }`} />
              {project.name}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/50">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 mb-4 w-full p-2 rounded-xl transition-all duration-200 ${
              activeTab === 'profile' ? 'bg-psu-navy/10 border border-psu-navy/20' : 'hover:bg-white/40'
            }`}
          >
             <img src={currentUser?.avatarUrl} alt="User" className="w-10 h-10 rounded-full bg-white/50 border border-white object-cover" />
             <div className="flex-1 min-w-0 text-left">
               <p className="text-sm font-bold text-psu-navy truncate">{currentUser?.name}</p>
               <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
             </div>
          </button>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-psu-red rounded-xl hover:bg-red-50/50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="flex items-center justify-between h-20 px-6 bg-white/40 backdrop-blur-xl border-b border-white/50 lg:px-8 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-500 rounded-md hover:bg-white/40"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 px-4 lg:px-8">
            <div className="relative max-w-lg">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-psu-navy/50" />
              </div>
              <input
                type="text"
                placeholder="Search tasks, projects..."
                className="block w-full py-2 pl-10 pr-3 text-sm text-gray-900 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:bg-white/80 focus:border-psu-gold focus:ring-1 focus:ring-psu-gold placeholder-gray-500 shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button className="relative p-2 text-psu-navy hover:text-psu-gold hover:bg-white/40 rounded-full transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-psu-red rounded-full border-2 border-white" />
             </button>
             <button 
                onClick={() => setActiveTab('profile')}
                className={`p-2 rounded-full hover:bg-white/40 transition-colors ${activeTab === 'profile' ? 'text-psu-navy bg-psu-navy/10' : 'text-gray-600 hover:text-psu-navy'}`}
              >
               <Settings className="w-6 h-6" />
             </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
           {children}
        </main>

        {/* Floating Chat Widget */}
        <ChatWidget />
      </div>
    </div>
  );
};