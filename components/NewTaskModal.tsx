import React, { useState } from 'react';
import { Task, TaskStatus, Priority, User } from '../types';
import { useProject } from '../context/ProjectContext';
import { Button } from './Button';
import { generateSubtasks, draftNotificationEmail } from '../services/geminiService';
import { Sparkles, X, Calendar, FileText, LayoutTemplate, Mail } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id'>) => void;
  users: User[];
  existingTasks?: Task[];
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSave, users, existingTasks = [] }) => {
  const { taskTemplates, currentUser } = useProject();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [subtasks, setSubtasks] = useState<{title: string, completed: boolean}[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  const [notifyAssignee, setNotifyAssignee] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSubtasks = async () => {
    if (!title) return;
    setIsGenerating(true);
    const suggestions = await generateSubtasks(title, description);
    setSubtasks(suggestions.map((s, i) => ({ title: s.title, completed: false })));
    setIsGenerating(false);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tplId = e.target.value;
    setSelectedTemplateId(tplId);
    
    if (tplId) {
      const template = taskTemplates.find(t => t.id === tplId);
      if (template) {
        setTitle(template.title);
        setDescription(template.description);
        setPriority(template.priority);
        setSubtasks(template.subtasks.map(s => ({ ...s }))); // clone
        if (template.dependencies) {
           // We only keep dependencies that actually exist in the current project context
           const validDeps = template.dependencies.filter(dId => existingTasks.some(t => t.id === dId));
           setSelectedDependencies(validDeps);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const newTask = {
      title,
      description,
      status: TaskStatus.TODO,
      priority,
      assigneeId,
      dueDate,
      subtasks: subtasks.map((s, i) => ({ id: `new-st-${i}`, ...s })),
      dependencies: selectedDependencies,
      order: 0, // Default order, will be recalculated by parent
      comments: []
    };

    // Notification Logic
    if (assigneeId && notifyAssignee && currentUser) {
      const assignee = users.find(u => u.id === assigneeId);
      if (assignee) {
        try {
          // Use a temp ID for draft generation
          const draft = await draftNotificationEmail({ ...newTask, id: 'temp-id' } as Task, assignee, currentUser);
          const mailtoLink = `mailto:${assignee.email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
          // Open mail client
          window.location.href = mailtoLink;
        } catch (error) {
          console.error("Failed to draft email notification:", error);
        }
      }
    }

    onSave(newTask);
    onClose();
    
    // Reset form
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setPriority(Priority.MEDIUM);
    setDueDate('');
    setSubtasks([]);
    setSelectedDependencies([]);
    setSelectedTemplateId('');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/40">
          <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Template Selector */}
          {taskTemplates.length > 0 && (
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100/60 flex items-center gap-4 backdrop-blur-sm">
              <LayoutTemplate className="w-5 h-5 text-blue-900" />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-blue-900 uppercase tracking-wider mb-1">Load from Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={handleTemplateChange}
                  className="block w-full rounded-lg border-blue-200/50 shadow-sm focus:border-blue-900 focus:ring-blue-900 sm:text-sm bg-white/70 text-gray-700"
                >
                  <option value="">Select a template...</option>
                  {taskTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-blue-900 sm:text-sm bg-white/60 p-2.5"
                placeholder="e.g., Design System Update"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-blue-900 sm:text-sm bg-white/60 p-2.5"
                placeholder="Details about the task..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-blue-900 sm:text-sm bg-white/60 p-2.5"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              {assigneeId && (
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyAssignee}
                    onChange={(e) => setNotifyAssignee(e.target.checked)}
                    className="rounded border-gray-300 text-blue-900 focus:ring-blue-900 w-4 h-4"
                  />
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Notify via email
                  </span>
                </label>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-blue-900 sm:text-sm bg-white/60 p-2.5"
              >
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full pl-10 pr-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-blue-900 sm:text-sm bg-white/60 p-2.5"
                />
              </div>
            </div>

            {existingTasks.length > 0 && (
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Blocking Tasks (Dependencies)</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-white/60 custom-scrollbar">
                  {existingTasks.map(t => (
                     <label key={t.id} className="flex items-center space-x-2 p-1.5 hover:bg-white/50 rounded cursor-pointer transition-colors">
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
                          className="rounded text-blue-900 focus:ring-blue-900 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{t.title}</span>
                     </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/40 pt-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-medium text-gray-900">Subtasks</h3>
               <Button
                 type="button"
                 variant="outline"
                 size="sm"
                 onClick={handleGenerateSubtasks}
                 disabled={!title || isGenerating}
                 isLoading={isGenerating}
                 className="flex items-center gap-2 bg-white/50 border-white/60 hover:bg-white/80"
               >
                 <Sparkles className="w-4 h-4 text-purple-600" />
                 AI Breakdown
               </Button>
            </div>
            
            <div className="space-y-2">
              {subtasks.length > 0 ? (
                subtasks.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/60 p-2.5 rounded-lg border border-white/40">
                    <div className="w-2 h-2 rounded-full bg-blue-900" />
                    <span className="text-sm text-gray-700">{st.title}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic p-2">No subtasks yet. Ask AI to generate some!</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/40">
            <Button type="button" variant="secondary" onClick={onClose} className="bg-white/50 border-white/60 hover:bg-white/80">Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Create Task</Button>
          </div>
        </form>
      </div>
    </div>
  );
};