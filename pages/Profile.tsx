import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { Button } from '../components/Button';
import { User, Mail, Camera, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, updateUserProfile } = useProject();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setAvatarUrl(currentUser.avatarUrl);
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateUserProfile({
      name,
      avatarUrl
    });
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 drop-shadow-sm">My Profile</h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">Manage your personal information and preferences.</p>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-md"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative">
              <img 
                src={avatarUrl || currentUser.avatarUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-white/80 bg-white object-cover shadow-lg backdrop-blur-sm"
              />
              <div className="absolute bottom-0 right-0 bg-blue-900 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            {isSaved && (
              <div className="bg-green-100/80 backdrop-blur-sm text-green-800 px-4 py-2 rounded-lg text-sm font-bold border border-green-200 animate-fade-in-up shadow-sm">
                Changes saved successfully!
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 rounded-xl border-white/60 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 bg-white/60 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="block w-full pl-10 rounded-xl border-white/60 bg-white/40 text-gray-500 shadow-sm sm:text-sm py-2.5 cursor-not-allowed backdrop-blur-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email address cannot be changed.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Camera className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="block w-full pl-10 rounded-xl border-white/60 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 bg-white/60 backdrop-blur-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter a direct URL to an image to update your profile picture.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/40 flex justify-end">
              <Button type="submit" className="flex items-center gap-2 shadow-lg shadow-blue-900/10">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};