import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { Task, TaskStatus, Priority, User, SubTask, Comment } from '../types';
import { Button } from './Button';
import { 
  X, Calendar, User as UserIcon, CheckSquare, Plus, Trash2, Link, 
  CheckCheck, CheckCircle2, Lock, Send, MessageSquare, AlignLeft, 
  ListTodo, Layers, Copy, Save
} from 'lucide-react';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  users: User[];
  projectTasks: Task[]; // Needed for dependency selection
  onSave: (updatedTask: Task) => void;
  currentUser: User | null;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  users, 
  projectTasks,
  onSave,
  currentUser
}) => {
  const { addTemplate } = useProject();
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showTemplateSuccess, setShowTemplateSuccess] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setIsSavingTemplate(false);
    }
  }, [task]);

  if (!isOpen || !editedTask) return null;

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    if (!editedTask) return;
    const updatedSubtasks = editedTask.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    handleChange('subtasks', updatedSubtasks);
  };

  const handleMarkAllSubtasksCompleted = () => {
    if (!editedTask) return;
    const updatedSubtasks = editedTask.subtasks.map(st => ({ ...st, completed: true }));
    handleChange('subtasks', updatedSubtasks);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !editedTask) return;
    const newSubtask: SubTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSubtaskTitle,
      completed: false
    };
    handleChange('subtasks', [...editedTask.subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!editedTask) return;
    handleChange('subtasks', editedTask.subtasks.filter(st => st.id !== subtaskId));
  };

  const handleDependencyToggle = (targetTaskId: string) => {
    if (!editedTask) return;
    const currentDeps = editedTask.dependencies || [];
    let newDeps;
    if (currentDeps.includes(targetTaskId)) {
      newDeps = currentDeps.filter(id => id !== targetTaskId);
    } else {
      newDeps = [...currentDeps, targetTaskId];
    }
    handleChange('dependencies', newDeps);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !editedTask || !currentUser) return;
    
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      content: newComment,
      timestamp: new Date().toISOString()
    };
    
    handleChange('comments', [...(editedTask.comments || []), comment]);
    setNewComment('');
  };

  const initiateSaveTemplate = () => {
      setTemplateName(editedTask.title);
      setIsSavingTemplate(true);
  };

  const handleConfirmSaveTemplate = () => {
    if (!editedTask || !templateName.trim()) return;
    addTemplate({
        name: templateName,
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        subtasks: editedTask.subtasks.map(s => ({ title: s.title, completed: false })), // Reset completion
        dependencies: editedTask.dependencies
    });
    setIsSavingTemplate(false);
    setShowTemplateSuccess(true);
    setTimeout(() => setShowTemplateSuccess(false), 3000);
  };

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      onClose();
    }
  };

  // Styles injected for animations
  const animationStyles = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `;

  return (
    <>
      <style>{animationStyles}</style>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      >
        <div 
          className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          style={{ animation: 'fadeInScale 0.3s ease-out' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/40">
             <div className="flex-1 mr-8">
               <input
                type="text"
                value={editedTask.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full text-2xl font-bold text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-400 bg-transparent"
                placeholder="Task Title"
              />
               <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-mono">
                  <span>ID: {editedTask.id}</span>
               </div>
             </div>
             
             <div className="flex items-center gap-3">
               {showTemplateSuccess && (
                 <span className="text-green-600 text-sm font-medium animate-pulse">Template Saved!</span>
               )}
               
               {isSavingTemplate ? (
                 <div className="flex items-center gap-2 bg-blue-50/50 p-1 rounded-lg border border-blue-100/50 animate-in fade-in slide-in-from-right-4 duration-200">
                   <input
                     type="text"
                     value={templateName}
                     onChange={(e) => setTemplateName(e.target.value)}
                     className="text-sm border-gray-300 rounded-md focus:ring-blue-900 focus:border-blue-900 w-40 px-2 py-1 bg-white/70"
                     placeholder="Template Name"
                     autoFocus
                     onKeyDown={(e) => e.key === 'Enter' && handleConfirmSaveTemplate()}
                   />
                   <Button size="sm" onClick={handleConfirmSaveTemplate} className="px-2 py-1 h-8">
                     Save
                   </Button>
                   <button 
                     onClick={() => setIsSavingTemplate(false)}
                     className="p-1 hover:bg-white/50 rounded-full text-gray-500"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               ) : (
                 <Button variant="outline" size="sm" onClick={initiateSaveTemplate} title="Save as Template" className="bg-white/50 border-white/60 hover:bg-white/80">
                   <Copy className="w-4 h-4 mr-2" />
                   Save as Template
                 </Button>
               )}

               <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white/50 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
             </div>
          </div>

          {/* Properties Bar */}
          <div className="flex items-center gap-6 px-8 py-4 border-b border-white/40 overflow-x-auto bg-white/20">
             <div className="flex flex-col min-w-[120px]">
               <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Status</label>
               <select
                  value={editedTask.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-900 focus:ring-blue-900 text-sm py-1.5 bg-white/60"
                >
                  {Object.values(TaskStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
             </div>
             <div className="flex flex-col min-w-[120px]">
               <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Priority</label>
               <select
                  value={editedTask.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-900 focus:ring-blue-900 text-sm py-1.5 bg-white/60"
                >
                  {Object.values(Priority).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
             </div>
             <div className="flex flex-col min-w-[180px]">
               <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Assignee</label>
               <div className="relative">
                 <UserIcon className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                 <select
                    value={editedTask.assigneeId || ''}
                    onChange={(e) => handleChange('assigneeId', e.target.value)}
                    className="block w-full pl-8 rounded-lg border-gray-200 shadow-sm focus:border-blue-900 focus:ring-blue-900 text-sm py-1.5 bg-white/60"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
               </div>
             </div>
             <div className="flex flex-col min-w-[160px]">
               <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Due Date</label>
               <div className="relative">
                 <Calendar className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                 <input
                    type="date"
                    value={editedTask.dueDate || ''}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className="block w-full pl-8 rounded-lg border-gray-200 shadow-sm focus:border-blue-900 focus:ring-blue-900 text-sm py-1.5 bg-white/60"
                  />
               </div>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Description, Subtasks, Comments */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Description Card */}
                <div className="bg-white/50 backdrop-blur-md rounded-xl shadow-sm border border-white/60 p-6">
                   <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                      <AlignLeft className="w-5 h-5 text-blue-900" />
                      <h3>Description</h3>
                   </div>
                   <textarea
                    rows={6}
                    value={editedTask.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="block w-full rounded-lg border-white/60 bg-white/40 focus:bg-white/80 shadow-inner focus:border-blue-900 focus:ring-blue-900 text-sm p-4 transition-all"
                    placeholder="Add more details about this task..."
                  />
                </div>

                {/* Subtasks Card */}
                <div className="bg-white/50 backdrop-blur-md rounded-xl shadow-sm border border-white/60 p-6">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-900 font-semibold">
                         <ListTodo className="w-5 h-5 text-blue-900" />
                         <h3>Subtasks</h3>
                         <span className="text-xs font-normal text-gray-600 bg-white/40 px-2 py-0.5 rounded-full border border-white/30">
                           {editedTask.subtasks.filter(s => s.completed).length}/{editedTask.subtasks.length}
                         </span>
                      </div>
                      {editedTask.subtasks.length > 0 && editedTask.subtasks.some(st => !st.completed) && (
                        <button
                          onClick={handleMarkAllSubtasksCompleted}
                          className="text-xs text-blue-900 hover:text-blue-700 font-medium hover:underline flex items-center gap-1 transition-colors"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Mark all complete
                        </button>
                      )}
                   </div>

                   {/* Progress Bar */}
                   {editedTask.subtasks.length > 0 && (
                     <div className="w-full bg-gray-200/50 rounded-full h-2 mb-6">
                        <div 
                           className="bg-blue-900 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                           style={{ width: `${(editedTask.subtasks.filter(s => s.completed).length / editedTask.subtasks.length) * 100}%` }}
                        />
                     </div>
                   )}
                   
                   <div className="space-y-2 mb-4">
                     {editedTask.subtasks.map((subtask, index) => (
                        <div 
                          key={subtask.id} 
                          className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-white/50 hover:bg-white/40 transition-all group"
                          style={{ animation: `slideIn 0.3s ease-out ${index * 0.05}s` }}
                        >
                           <input
                             type="checkbox"
                             checked={subtask.completed}
                             onChange={() => handleSubtaskToggle(subtask.id)}
                             className="h-5 w-5 rounded border-gray-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
                           />
                           <span className={`flex-1 text-sm ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                             {subtask.title}
                           </span>
                           <button 
                             onClick={() => handleDeleteSubtask(subtask.id)}
                             className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                   </div>
                   
                   <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        placeholder="Add a new subtask..."
                        className="flex-1 rounded-lg border-white/60 shadow-sm focus:border-blue-900 focus:ring-blue-900 text-sm bg-white/60"
                      />
                      <Button type="submit" size="sm" disabled={!newSubtaskTitle.trim()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                   </form>
                </div>

                {/* Comments Card */}
                <div className="bg-white/50 backdrop-blur-md rounded-xl shadow-sm border border-white/60 p-6">
                  <div className="flex items-center gap-2 mb-6 text-gray-900 font-semibold">
                      <MessageSquare className="w-5 h-5 text-blue-900" />
                      <h3>Activity & Comments</h3>
                  </div>

                  <div className="space-y-6 mb-6">
                    {(editedTask.comments || []).map((comment, index) => {
                      const author = users.find(u => u.id === comment.userId);
                      const isMe = currentUser?.id === comment.userId;
                      return (
                        <div 
                          key={comment.id} 
                          className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                          style={{ animation: `slideIn 0.3s ease-out` }}
                        >
                           <img 
                             src={author?.avatarUrl} 
                             alt={author?.name}
                             className="w-8 h-8 rounded-full bg-white flex-shrink-0 border border-white/50 shadow-sm" 
                           />
                           <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                              <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm border border-white/40 ${
                                isMe 
                                  ? 'bg-blue-100/60 text-blue-900 rounded-tr-none backdrop-blur-sm' 
                                  : 'bg-white/60 text-gray-700 rounded-tl-none backdrop-blur-sm'
                              }`}>
                                 <p className="whitespace-pre-wrap">{comment.content}</p>
                              </div>
                              <span className="text-[10px] text-gray-500 mt-1 px-1">
                                {author?.name} • {new Date(comment.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                           </div>
                        </div>
                      );
                    })}
                    {(!editedTask.comments || editedTask.comments.length === 0) && (
                      <div className="text-center py-8 bg-white/20 rounded-lg border border-dashed border-gray-300">
                        <p className="text-sm text-gray-500 italic">No comments yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-3 items-start">
                    <img 
                      src={currentUser?.avatarUrl} 
                      alt="Me"
                      className="w-8 h-8 rounded-full bg-white flex-shrink-0 border border-white/50 shadow-sm" 
                    />
                    <div className="flex-1 flex gap-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={1}
                        className="flex-1 rounded-lg border-white/60 shadow-sm focus:border-blue-900 focus:ring-blue-900 sm:text-sm resize-none py-2 px-3 bg-white/60"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(e);
                          }
                        }}
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="p-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* Right Sidebar: Dependencies, Info */}
              <div className="space-y-6">
                
                {/* Dependencies Card */}
                <div className="bg-white/50 backdrop-blur-md rounded-xl shadow-sm border border-white/60 p-6">
                   <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                      <Layers className="w-5 h-5 text-blue-900" />
                      <h3>Dependencies</h3>
                   </div>
                   
                   <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Select tasks that must be completed before "<strong>{editedTask.title}</strong>" can begin.
                   </p>

                   <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {projectTasks
                        .filter(t => t.id !== editedTask.id)
                        .map(t => {
                          const isSelected = (editedTask.dependencies || []).includes(t.id);
                          const isMet = t.status === TaskStatus.DONE;
                          
                          return (
                            <label 
                              key={t.id} 
                              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                isSelected 
                                  ? isMet 
                                    ? 'bg-green-50/70 border-green-200' 
                                    : 'bg-red-50/70 border-red-200'
                                  : 'bg-white/40 border-white/50 hover:bg-white/60'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleDependencyToggle(t.id)}
                                className={`mt-1 h-4 w-4 rounded transition-colors ${
                                  isSelected
                                    ? isMet ? 'text-green-600 focus:ring-green-500 border-green-600' : 'text-red-600 focus:ring-red-500 border-red-600'
                                    : 'text-blue-900 border-gray-300 focus:ring-blue-900'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                   <span className={`text-sm font-medium truncate ${isSelected ? (isMet ? 'text-green-900' : 'text-red-900') : 'text-gray-900'}`}>
                                     {t.title}
                                   </span>
                                   {isSelected && (
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                       isMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                     }`}>
                                       {isMet ? 'Met' : 'Blocking'}
                                     </span>
                                   )}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                   <span>{t.status}</span>
                                   <div className="flex items-center gap-1">
                                      <UserIcon className="w-3 h-3" />
                                      <span className="truncate max-w-[80px]">
                                        {users.find(u => u.id === t.assigneeId)?.name || 'Unassigned'}
                                      </span>
                                   </div>
                                </div>
                              </div>
                            </label>
                        );
                      })}
                      {projectTasks.length <= 1 && (
                        <p className="text-xs text-gray-400 italic text-center py-4">No other tasks available.</p>
                      )}
                   </div>
                </div>

                {/* System Info */}
                <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/40 text-xs text-gray-500 space-y-2">
                   <div className="flex justify-between">
                     <span>Created</span>
                     <span>{new Date().toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Last Updated</span>
                     <span>Just now</span>
                   </div>
                   <div className="flex justify-between">
                     <span>Task ID</span>
                     <span className="font-mono">{editedTask.id}</span>
                   </div>
                </div>

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-8 py-5 border-t border-white/40 bg-white/30 backdrop-blur-md">
            <div className="text-sm text-gray-600 font-medium">
               {editedTask.comments.length} comments • {editedTask.subtasks.filter(s => s.completed).length}/{editedTask.subtasks.length} subtasks
            </div>
            <div className="flex gap-3">
               <Button variant="secondary" onClick={onClose} className="bg-white/50 border-white/60 hover:bg-white/80">Cancel</Button>
               <Button onClick={handleSave} className="px-8 shadow-lg shadow-blue-900/20 backdrop-blur-sm">Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};