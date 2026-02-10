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
  CalendarDays
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'projects' | 'calendar';
  setActiveTab: (tab: 'dashboard' | 'projects' | 'calendar') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, projects, currentProject, setCurrentProject } = useProject();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xl">
             <FolderKanban className="w-8 h-8" />
             <span>IPDO Project Management</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-blue-50 text-blue-900' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'calendar' 
                ? 'bg-blue-50 text-blue-900' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <CalendarDays className="w-5 h-5 mr-3" />
            Calendar
          </button>
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
              className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'projects' && currentProject?.id === project.id
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`w-2 h-2 mr-3 rounded-full ${
                activeTab === 'projects' && currentProject?.id === project.id ? 'bg-blue-900' : 'bg-gray-300'
              }`} />
              {project.name}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
             <img src={currentUser?.avatarUrl} alt="User" className="w-10 h-10 rounded-full bg-gray-200" />
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
               <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
             </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-500 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 px-4 lg:px-8">
            <div className="relative max-w-lg">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks, projects..."
                className="block w-full py-2 pl-10 pr-3 text-sm text-gray-900 bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
             </button>
             <button className="p-2 text-gray-500 hover:text-gray-700">
               <Settings className="w-6 h-6" />
             </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
           {children}
        </main>

        {/* Floating Chat Widget */}
        <ChatWidget />
      </div>
    </div>
  );
};