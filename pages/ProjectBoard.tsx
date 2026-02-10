import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskStatus, Priority, Role } from '../types';
import { Button } from '../components/Button';
import { NewTaskModal } from '../components/NewTaskModal';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { Plus, MoreVertical, Calendar, Mail, Lock } from 'lucide-react';
import { draftNotificationEmail } from '../services/geminiService';

export const ProjectBoard: React.FC = () => {
  const { currentProject, addTask, updateTask, users, currentUser, getUserRole } = useProject();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [activeTaskMenu, setActiveTaskMenu] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!currentProject) return <div>Select a project</div>;

  const userRole = getUserRole(currentProject.id);
  const canEdit = userRole === Role.ADMIN || userRole === Role.MEMBER;
  const canCreate = canEdit;

  const handleCreateTask = (taskData: any) => {
    addTask(currentProject.id, {
      id: Math.random().toString(36).substr(2, 9),
      ...taskData
    });
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    updateTask(currentProject.id, updatedTask);
    setSelectedTask(null); // Close modal after update
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    // Check dependencies before allowing move to IN_PROGRESS or DONE
    if (newStatus !== TaskStatus.TODO) {
      const pendingDeps = task.dependencies?.filter(depId => {
        const depTask = currentProject.tasks.find(t => t.id === depId);
        return depTask && depTask.status !== TaskStatus.DONE;
      });

      if (pendingDeps && pendingDeps.length > 0) {
        alert(`Cannot move task. Waiting for dependencies: ${pendingDeps.map(id => currentProject.tasks.find(t=>t.id===id)?.title).join(', ')}`);
        return;
      }
    }

    updateTask(currentProject.id, { ...task, status: newStatus });
    setActiveTaskMenu(null);
  };

  const handleNotifyAssignee = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    if (!task.assigneeId || !currentUser) return;
    const assignee = users.find(u => u.id === task.assigneeId);
    if (!assignee) return;

    setLoadingEmail(task.id);
    const draft = await draftNotificationEmail(task, assignee, currentUser);
    setLoadingEmail(null);
    
    // Construct mailto link
    const mailtoLink = `mailto:${assignee.email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    window.location.href = mailtoLink;
  };

  const columns = [
    { id: TaskStatus.TODO, title: 'To Do', color: 'bg-gray-200' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-200' },
    { id: TaskStatus.REVIEW, title: 'Review', color: 'bg-yellow-200' },
    { id: TaskStatus.DONE, title: 'Done', color: 'bg-green-200' },
  ];

  const getDependencyStatus = (task: Task) => {
    if (!task.dependencies || task.dependencies.length === 0) return null;
    const blockingTasks = task.dependencies
      .map(id => currentProject.tasks.find(t => t.id === id))
      .filter(t => t && t.status !== TaskStatus.DONE);
    
    if (blockingTasks.length > 0) {
      return { isBlocked: true, blockingTasks };
    }
    return { isBlocked: false, blockingTasks: [] };
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
             <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
             <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
               userRole === Role.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-200' :
               userRole === Role.MEMBER ? 'bg-blue-50 text-blue-700 border-blue-200' :
               'bg-gray-50 text-gray-600 border-gray-200'
             }`}>
               {userRole}
             </span>
          </div>
          <p className="text-gray-500 mt-1">{currentProject.description}</p>
        </div>
        
        {canCreate && (
          <Button onClick={() => setIsNewTaskModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Task
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-[1000px]">
          {columns.map(col => (
            <div key={col.id} className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color.replace('bg-', 'bg-').replace('200', '500')}`} />
                  {col.title}
                </h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  {currentProject.tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              
              <div className="flex-1 bg-gray-100 rounded-xl p-3 overflow-y-auto space-y-3">
                {currentProject.tasks
                  .filter(t => t.status === col.id)
                  .map(task => {
                    const depStatus = getDependencyStatus(task);
                    const isBlocked = depStatus?.isBlocked;
                    
                    return (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className={`bg-white p-4 rounded-lg shadow-sm border transition-all cursor-pointer relative group ${isBlocked ? 'border-red-200 bg-red-50/10' : 'border-gray-200 hover:shadow-md hover:border-blue-200'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            task.priority === Priority.HIGH ? 'bg-red-50 text-red-700' :
                            task.priority === Priority.MEDIUM ? 'bg-orange-50 text-orange-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {task.priority}
                          </span>
                          
                          {canEdit && (
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {activeTaskMenu === task.id && (
                                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1" onClick={e => e.stopPropagation()}>
                                  {Object.values(TaskStatus).map(s => (
                                    <button
                                      key={s}
                                      onClick={() => handleStatusChange(task, s)}
                                      disabled={s === task.status || (isBlocked && s !== TaskStatus.TODO)}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Move to {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {isBlocked && (
                          <div className="flex items-center gap-2 mb-2 text-xs text-red-600 bg-red-50 p-1.5 rounded border border-red-100">
                             <Lock className="w-3 h-3" />
                             <span>Blocked by: {depStatus?.blockingTasks.map(t => t?.title).join(', ')}</span>
                          </div>
                        )}

                        <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                        
                        {task.subtasks.length > 0 && (
                          <div className="mb-3">
                             <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                               <div 
                                 className="bg-blue-900 h-1.5 rounded-full" 
                                 style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }} 
                               />
                             </div>
                             <p className="text-xs text-gray-500">
                               {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                             </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                             {task.assigneeId ? (
                               <img 
                                 src={users.find(u => u.id === task.assigneeId)?.avatarUrl} 
                                 alt="Assignee" 
                                 className="w-6 h-6 rounded-full border border-white"
                                 title={users.find(u => u.id === task.assigneeId)?.name}
                               />
                             ) : (
                               <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                                 <span className="text-xs text-gray-400">?</span>
                               </div>
                             )}
                             {task.dueDate && (
                               <div className="flex items-center text-xs text-gray-500 gap-1">
                                 <Calendar className="w-3 h-3" />
                                 {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                               </div>
                             )}
                          </div>
                          
                          {task.assigneeId && (
                             <button 
                               onClick={(e) => handleNotifyAssignee(task, e)}
                               disabled={loadingEmail === task.id}
                               className="text-gray-400 hover:text-blue-900 transition-colors"
                               title="Draft email with AI"
                             >
                               {loadingEmail === task.id ? (
                                 <div className="animate-spin w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full" />
                               ) : (
                                 <Mail className="w-4 h-4" />
                               )}
                             </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleCreateTask}
        users={users}
        existingTasks={currentProject.tasks}
      />

      <TaskDetailsModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        users={users}
        projectTasks={currentProject.tasks}
        onSave={handleTaskUpdate}
      />
      
      {/* Click outside to close menu handler overlay */}
      {activeTaskMenu && (
        <div className="fixed inset-0 z-0 bg-transparent" onClick={() => setActiveTaskMenu(null)} />
      )}
    </div>
  );
};
