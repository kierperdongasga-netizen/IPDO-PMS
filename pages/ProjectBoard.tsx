import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskStatus, Priority, Role } from '../types';
import { Button } from '../components/Button';
import { NewTaskModal } from '../components/NewTaskModal';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { Plus, MoreVertical, Calendar, Mail, Lock } from 'lucide-react';
import { draftNotificationEmail } from '../services/geminiService';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export const ProjectBoard: React.FC = () => {
  const { currentProject, addTask, updateTask, reorderTasks, users, currentUser, getUserRole } = useProject();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [activeTaskMenu, setActiveTaskMenu] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // React 18 Strict Mode fix for DnD
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!currentProject) return <div className="text-psu-navy/80 p-10 text-center font-medium text-lg">Select a project to view tasks</div>;

  const userRole = getUserRole(currentProject.id);
  const canEdit = userRole === Role.ADMIN || userRole === Role.MEMBER;
  const canCreate = canEdit;

  const handleCreateTask = (taskData: any) => {
    // Calculate max order for Todo column
    const todoTasks = currentProject.tasks.filter(t => t.status === TaskStatus.TODO);
    const maxOrder = todoTasks.reduce((max, t) => Math.max(max, t.order || 0), -1);

    addTask(currentProject.id, {
      id: Math.random().toString(36).substr(2, 9),
      ...taskData,
      order: maxOrder + 1
    });
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    updateTask(currentProject.id, updatedTask);
    setSelectedTask(null); // Close modal after update
  };

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

  const validateStatusChange = (task: Task, newStatus: TaskStatus): boolean => {
    // Check dependencies before allowing move to IN_PROGRESS or DONE
    if (newStatus !== TaskStatus.TODO) {
      const depStatus = getDependencyStatus(task);
      if (depStatus?.isBlocked) {
        alert(`Cannot move task. Waiting for dependencies: ${depStatus.blockingTasks.map((t: any) => t?.title).join(', ')}`);
        return false;
      }
    }
    return true;
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    if (!validateStatusChange(task, newStatus)) return;
    updateTask(currentProject.id, { ...task, status: newStatus });
    setActiveTaskMenu(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!currentProject) return;
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const task = currentProject.tasks.find(t => t.id === draggableId);
    if (!task) return;

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    if (sourceStatus === destStatus) {
      // Reordering within same column
      const columnTasks = currentProject.tasks
        .filter(t => t.status === sourceStatus)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const newTasks = Array.from(columnTasks);
      const [removed] = newTasks.splice(source.index, 1);
      
      if (!removed) return;

      newTasks.splice(destination.index, 0, removed);

      const updatedTasks = newTasks.map((t, index) => ({
        ...(t as any),
        order: index
      }));

      reorderTasks(currentProject.id, updatedTasks);

    } else {
       // Moving to different column
       // Validate business rules
       if (!validateStatusChange(task, destStatus)) return;
       
       const destColumnTasks = currentProject.tasks
         .filter(t => t.status === destStatus)
         .sort((a, b) => (a.order || 0) - (b.order || 0));
      
       // Insert into new column at specific index
       const newDestTasks = Array.from(destColumnTasks);
       // Update task status before inserting
       if (!task) return;
       const updatedTask = { ...(task as any), status: destStatus };
       newDestTasks.splice(destination.index, 0, updatedTask);

       // Reindex destination column
       const updatedDestTasks = newDestTasks.map((t, index) => ({
         ...(t as any),
         order: index
       }));

       // Optional: Reindex source column (good for consistency but not strictly required if we just remove one)
       // Let's just update destination + the moved task
       reorderTasks(currentProject.id, updatedDestTasks);
    }
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
    { id: TaskStatus.TODO, title: 'To Do', color: 'bg-slate-100/50' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'bg-blue-100/50' },
    { id: TaskStatus.REVIEW, title: 'Review', color: 'bg-amber-100/50' },
    { id: TaskStatus.DONE, title: 'Done', color: 'bg-emerald-100/50' },
  ];

  if (!enabled) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold text-psu-navy drop-shadow-sm">{currentProject.name}</h1>
             <span className={`px-2 py-0.5 rounded-md text-xs font-bold border backdrop-blur-sm ${
               userRole === Role.ADMIN ? 'bg-purple-100/50 text-purple-800 border-purple-200' :
               userRole === Role.MEMBER ? 'bg-blue-100/50 text-blue-800 border-blue-200' :
               'bg-gray-100/50 text-gray-700 border-gray-200'
             }`}>
               {userRole}
             </span>
          </div>
          <p className="text-gray-600 mt-2 text-sm font-medium">{currentProject.description}</p>
        </div>
        
        {canCreate && (
          <Button onClick={() => setIsNewTaskModalOpen(true)} className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow bg-psu-navy/90 backdrop-blur-sm">
            <Plus className="w-5 h-5" />
            Add Task
          </Button>
        )}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex gap-6 h-full min-w-[1000px]">
            {columns.map(col => (
              <div key={col.id} className="w-80 flex-shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full shadow-sm ${col.color.replace('/50', '').replace('bg-', 'bg-').replace('100', '500')}`} />
                    {col.title}
                  </h3>
                  <span className="bg-white/40 border border-white/50 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm">
                    {currentProject.tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                
                <Droppable droppableId={col.id} isDropDisabled={!canEdit}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 rounded-2xl p-3 overflow-y-auto space-y-3 transition-colors border border-white/30 shadow-inner ${
                        snapshot.isDraggingOver ? 'bg-blue-50/60 ring-2 ring-blue-200 ring-inset backdrop-blur-md' : 'bg-white/20 backdrop-blur-sm'
                      }`}
                    >
                      {currentProject.tasks
                        .filter(t => t.status === col.id)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((task, index) => {
                          const depStatus = getDependencyStatus(task);
                          const isBlocked = depStatus?.isBlocked;
                          const blockedTooltip = isBlocked 
                            ? `Blocked by: ${depStatus?.blockingTasks.map((t: any) => t?.title).join(', ')}`
                            : undefined;
                          
                          return (
                            <Draggable 
                              key={task.id} 
                              draggableId={task.id} 
                              index={index}
                              isDragDisabled={!canEdit || (isBlocked && col.id === TaskStatus.TODO && false)} // Allowed to drag even if blocked, validation happens on drop
                            >
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedTask(task)}
                                  style={{ ...provided.draggableProps.style }}
                                  className={`bg-white/70 backdrop-blur-md p-4 rounded-xl shadow-sm border transition-all cursor-pointer relative group 
                                    ${isBlocked ? 'border-red-300 ring-1 ring-red-300 bg-red-50/50' : 'border-white/60'}
                                    ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-400 rotate-2 z-50 bg-white/90 scale-105' : 'hover:shadow-lg hover:bg-white/80 hover:scale-[1.02]'}
                                  `}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                          task.priority === Priority.HIGH ? 'bg-red-50/80 text-red-700 border-red-200' :
                                          task.priority === Priority.MEDIUM ? 'bg-orange-50/80 text-orange-700 border-orange-200' :
                                          'bg-blue-50/80 text-blue-700 border-blue-200'
                                        }`}>
                                          {task.priority}
                                        </span>
                                        {isBlocked && (
                                            <div 
                                                title={blockedTooltip} 
                                                className="text-red-600 bg-white/80 border border-red-200 p-1 rounded-md shadow-sm hover:bg-red-50 cursor-help"
                                            >
                                                <Lock className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {canEdit && (
                                      <div className="relative">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id);
                                          }}
                                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-black/5"
                                        >
                                          <MoreVertical className="w-4 h-4" />
                                        </button>
                                        
                                        {activeTaskMenu === task.id && (
                                          <div className="absolute right-0 mt-1 w-36 bg-white/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/60 z-10 py-1" onClick={e => e.stopPropagation()}>
                                            {Object.values(TaskStatus).map(s => (
                                              <button
                                                key={s}
                                                onClick={() => handleStatusChange(task, s)}
                                                disabled={s === task.status || (isBlocked && s !== TaskStatus.TODO)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                              >
                                                Move to {s}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <h4 className="font-semibold text-psu-navy mb-2 leading-tight">{task.title}</h4>
                                  
                                  {task.subtasks.length > 0 && (
                                    <div className="mb-3">
                                       <div className="w-full bg-gray-200/60 rounded-full h-1.5 mb-1 overflow-hidden">
                                         <div 
                                           className="bg-psu-navy h-1.5 rounded-full" 
                                           style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }} 
                                         />
                                       </div>
                                       <p className="text-[10px] text-gray-500 font-medium">
                                         {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                                       </p>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100/50">
                                    <div className="flex items-center gap-2">
                                       {task.assigneeId ? (
                                         <img 
                                           src={users.find(u => u.id === task.assigneeId)?.avatarUrl} 
                                           alt="Assignee" 
                                           className="w-6 h-6 rounded-full border border-white shadow-sm"
                                           title={users.find(u => u.id === task.assigneeId)?.name}
                                         />
                                       ) : (
                                         <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                                           <span className="text-xs text-gray-400">?</span>
                                         </div>
                                       )}
                                       {task.dueDate && (
                                         <div className="flex items-center text-xs text-gray-500 gap-1 font-medium bg-gray-50/50 px-1.5 py-0.5 rounded">
                                           <Calendar className="w-3 h-3" />
                                           {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                         </div>
                                       )}
                                    </div>
                                    
                                    {task.assigneeId && (
                                       <button 
                                         onClick={(e) => handleNotifyAssignee(task, e)}
                                         disabled={loadingEmail === task.id}
                                         className="text-gray-400 hover:text-psu-navy transition-colors p-1 hover:bg-blue-50/50 rounded"
                                         title="Draft email with AI"
                                       >
                                         {loadingEmail === task.id ? (
                                           <div className="animate-spin w-4 h-4 border-2 border-psu-navy border-t-transparent rounded-full" />
                                         ) : (
                                           <Mail className="w-4 h-4" />
                                         )}
                                       </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

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
        currentUser={currentUser}
      />
      
      {/* Click outside to close menu handler overlay */}
      {activeTaskMenu && (
        <div className="fixed inset-0 z-0 bg-transparent" onClick={() => setActiveTaskMenu(null)} />
      )}
    </div>
  );
};