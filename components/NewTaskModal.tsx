import React, { useState } from 'react';
import { Task, TaskStatus, Priority, User } from '../types';
import { Button } from './Button';
import { generateSubtasks } from '../services/geminiService';
import { Sparkles, X } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  users: User[];
  existingTasks?: Task[];
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSave, users, existingTasks = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [subtasks, setSubtasks] = useState<{title: string, completed: boolean}[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleGenerateSubtasks = async () => {
    if (!title) return;
    setIsGenerating(true);
    const suggestions = await generateSubtasks(title, description);
    setSubtasks(suggestions.map((s, i) => ({ title: s.title, completed: false })));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      status: TaskStatus.TODO,
      priority,
      assigneeId,
      dueDate,
      subtasks: subtasks.map((s, i) => ({ id: `new-st-${i}`, ...s })),
      dependencies: selectedDependencies
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-blue-900 sm:text-sm"
                placeholder="e.g., Design System Update"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-blue-900 sm:text-sm"
                placeholder="Details about the task..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-blue-900 sm:text-sm"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-blue-900 sm:text-sm"
              >
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-blue-900 sm:text-sm"
              />
            </div>

            {existingTasks.length > 0 && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Blocking Tasks (Dependencies)</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {existingTasks.map(t => (
                     <label key={t.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                        <input 
                          type="checkbox" 
                          value={t.id}
                          checked={selectedDependencies.includes(t.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDependencies([...selectedDependencies, t.id]);
                            } else {
                              setSelectedDependencies(selectedDependencies.filter(id => id !== t.id));
                            }
                          }}
                          className="rounded text-blue-900 focus:ring-blue-900"
                        />
                        <span className="text-sm text-gray-700">{t.title}</span>
                     </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-medium text-gray-900">Subtasks</h3>
               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={handleGenerateSubtasks}
                 disabled={!title || isGenerating}
                 isLoading={isGenerating}
                 className="flex items-center gap-2"
               >
                 <Sparkles className="w-4 h-4 text-purple-600" />
                 AI Breakdown
               </Button>
            </div>
            
            <div className="space-y-2">
              {subtasks.length > 0 ? (
                subtasks.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded">
                    <div className="w-2 h-2 rounded-full bg-blue-900" />
                    <span className="text-sm text-gray-700">{st.title}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No subtasks yet. Ask AI to generate some!</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
};