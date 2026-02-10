import React, { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProjectBoard } from './pages/ProjectBoard';
import { CalendarView } from './pages/CalendarView';
import { Layout } from './components/Layout';

const AppContent: React.FC = () => {
  const { currentUser } = useProject();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'calendar'>('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' ? (
        <Dashboard />
      ) : activeTab === 'calendar' ? (
        <CalendarView />
      ) : (
        <ProjectBoard />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
};

export default App;
