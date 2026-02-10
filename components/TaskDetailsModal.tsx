import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, User, SubTask } from '../types';
import { Button } from './Button';
import { X, Calendar, User as UserIcon, CheckSquare, Plus, Trash2, Link } from 'lucide-react';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  users: User[];
  projectTasks: Task[]; // Needed for dependency selection
  onSave: (updatedTask: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  users, 
  projectTasks,
  onSave 
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
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

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full text-2xl font-bold text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-400"
              placeholder="Task Title"
            />
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">ID: {editedTask.id}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={editedTask.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900 sm:text-sm bg-gray-50"
                >
                  {Object.values(TaskStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
                <select
                  value={editedTask.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900 sm:text-sm bg-gray-50"
                >
                  {Object.values(Priority).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Assignee</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={editedTask.assigneeId || ''}
                    onChange={(e) => handleChange('assigneeId', e.target.value)}
                    className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900 sm:text-sm bg-gray-50"
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Due Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={editedTask.dueDate || ''}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900 sm:text-sm bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
            <textarea
              rows={4}
              value={editedTask.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:ring-blue-900 sm:text-sm bg-gray-50 p-3"
              placeholder="Add more details about this task..."
            />
          </div>

          {/* Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Subtasks ({editedTask.subtasks.filter(s => s.completed).length}/{editedTask.subtasks.length})
              </label>
            </div>
            
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              {editedTask.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-3 p-3 border-b border-gray-200 last:border-0 hover:bg-gray-100 transition-colors group">
                   <button 
                     onClick={() => handleSubtaskToggle(subtask.id)}
                     className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                       subtask.completed ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-gray-300 text-transparent hover:border-blue-900'
                     }`}
                   >
                     <CheckSquare className="w-3.5 h-3.5" />
                   </button>
                   <span className={`flex-1 text-sm ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                     {subtask.title}
                   </span>
                   <button 
                     onClick={() => handleDeleteSubtask(subtask.id)}
                     className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              ))}
              
              <form onSubmit={handleAddSubtask} className="flex items-center p-2 bg-white">
                <Plus className="w-5 h-5 text-gray-400 ml-1 mr-2" />
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a subtask..."
                  className="flex-1 border-none focus:ring-0 text-sm placeholder-gray-400"
                />
                <button 
                  type="submit" 
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-1 text-xs font-medium text-blue-900 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  Add
                </button>
              </form>
            </div>
          </div>

          {/* Dependencies */}
          <div>
             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dependencies</label>
             <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-48 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-3">
                  This task is blocked by the following selected tasks:
                </p>
                <div className="space-y-2">
                  {projectTasks
                    .filter(t => t.id !== editedTask.id) // Cannot depend on self
                    .map(t => (
                      <label key={t.id} className="flex items-center space-x-3 p-2 rounded hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                        <input
                          type="checkbox"
                          checked={(editedTask.dependencies || []).includes(t.id)}
                          onChange={() => handleDependencyToggle(t.id)}
                          className="h-4 w-4 text-blue-900 rounded border-gray-300 focus:ring-blue-900"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{t.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className={`text-[10px] px-1.5 rounded ${
                               t.status === TaskStatus.DONE ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                             }`}>{t.status}</span>
                             <span className="text-[10px] text-gray-500">Assignee: {users.find(u => u.id === t.assigneeId)?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                        {t.status !== TaskStatus.DONE && (
                           <span title="Blocking" className="flex items-center">
                             <Link className="w-4 h-4 text-orange-500" />
                           </span>
                        )}
                      </label>
                  ))}
                </div>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};