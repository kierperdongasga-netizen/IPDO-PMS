import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, User, Task, TaskStatus, Priority, Role, ChatMessage } from '../types';

interface ProjectContextType {
  currentUser: User | null;
  login: () => void;
  logout: () => void;
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (id: string) => void;
  addTask: (projectId: string, task: Task) => void;
  updateTask: (projectId: string, task: Task) => void;
  users: User[];
  getUserRole: (projectId: string) => Role | null;
  sendChatMessage: (projectId: string, content: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@example.com', avatarUrl: 'https://picsum.photos/200' },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah@example.com', avatarUrl: 'https://picsum.photos/201' },
  { id: 'u3', name: 'Mike Johnson', email: 'mike@example.com', avatarUrl: 'https://picsum.photos/202' },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    description: 'Overhaul the corporate website with new branding.',
    createdAt: new Date().toISOString(),
    members: MOCK_USERS,
    userRoles: {
      'u1': Role.ADMIN,
      'u2': Role.MEMBER,
      'u3': Role.VIEWER
    },
    tasks: [
      {
        id: 't1',
        title: 'Design Homepage Mockups',
        description: 'Create high-fidelity mockups for the new homepage using Figma.',
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        assigneeId: 'u1',
        dueDate: '2023-11-15',
        subtasks: [
          { id: 'st1', title: 'Hero section', completed: true },
          { id: 'st2', title: 'Footer', completed: true },
        ],
        dependencies: []
      },
      {
        id: 't2',
        title: 'Setup CI/CD Pipeline',
        description: 'Configure GitHub Actions for automated deployment.',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        assigneeId: 'u2',
        dueDate: '2023-11-20',
        subtasks: [],
        dependencies: []
      },
      {
        id: 't3',
        title: 'Frontend Implementation',
        description: 'Implement the homepage design in React.',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        assigneeId: 'u2',
        dueDate: '2023-11-25',
        subtasks: [],
        dependencies: ['t1'] // Depends on Design Homepage Mockups
      },
      {
        id: 't4',
        title: 'User Acceptance Testing',
        description: 'Coordinate with QA team for UAT round 1.',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        assigneeId: 'u3',
        dueDate: '2023-12-01',
        subtasks: [],
        dependencies: ['t3'] // Depends on Frontend Implementation
      }
    ],
    chatMessages: [
      { id: 'm1', userId: 'u2', content: 'Hey team, just finished the initial wireframes!', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 'm2', userId: 'u1', content: 'Great work Sarah! I will review them this afternoon.', timestamp: new Date(Date.now() - 82800000).toISOString() },
    ]
  },
  {
    id: 'p2',
    name: 'Mobile App Launch',
    description: 'Launch the iOS and Android applications.',
    createdAt: new Date().toISOString(),
    members: [MOCK_USERS[0], MOCK_USERS[1]],
    userRoles: {
      'u1': Role.ADMIN,
      'u2': Role.MEMBER
    },
    tasks: [],
    chatMessages: []
  }
];

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string>('p1');

  const login = () => {
    setCurrentUser(MOCK_USERS[0]); // Simulate Google Login (Alex - Admin)
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const currentProject = projects.find(p => p.id === currentProjectId) || null;

  const setCurrentProject = (id: string) => {
    setCurrentProjectId(id);
  };

  const getUserRole = (projectId: string): Role | null => {
    if (!currentUser) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.userRoles[currentUser.id] || null;
  };

  const addTask = (projectId: string, task: Task) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, tasks: [...p.tasks, task] };
      }
      return p;
    }));
  };

  const updateTask = (projectId: string, updatedTask: Task) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        };
      }
      return p;
    }));
  };

  const sendChatMessage = (projectId: string, content: string) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      content,
      timestamp: new Date().toISOString()
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, chatMessages: [...p.chatMessages, newMessage] };
      }
      return p;
    }));
  };

  return (
    <ProjectContext.Provider value={{
      currentUser,
      login,
      logout,
      projects,
      currentProject,
      setCurrentProject,
      addTask,
      updateTask,
      users: MOCK_USERS,
      getUserRole,
      sendChatMessage
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
