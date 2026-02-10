import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { MessageSquare, X, Send } from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const { currentProject, currentUser, users, sendChatMessage } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [currentProject?.chatMessages, isOpen]);

  if (!currentUser) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && currentProject) {
      sendChatMessage(currentProject.id, message.trim());
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 pointer-events-auto flex flex-col overflow-hidden transition-all duration-200 ease-in-out">
          {/* Header */}
          <div className="bg-blue-900 p-4 flex items-center justify-between text-white">
            <div>
              <h3 className="font-semibold text-sm">
                {currentProject ? currentProject.name : 'Select a Project'}
              </h3>
              <p className="text-xs text-blue-200">Team Chat</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 h-80 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {!currentProject ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center">
                Please select a project from the sidebar to start chatting.
              </div>
            ) : currentProject.chatMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center">
                No messages yet. Say hi! 👋
              </div>
            ) : (
              currentProject.chatMessages.map((msg) => {
                const isMe = msg.userId === currentUser.id;
                const sender = users.find(u => u.id === msg.userId);
                
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <img 
                      src={sender?.avatarUrl} 
                      alt={sender?.name} 
                      className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"
                      title={sender?.name}
                    />
                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 rounded-2xl text-sm ${
                        isMe 
                          ? 'bg-blue-900 text-white rounded-br-none' 
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!currentProject}
                placeholder={currentProject ? "Type a message..." : "Select a project..."}
                className="flex-1 px-4 py-2 text-sm bg-gray-50 border border-transparent rounded-full focus:bg-white focus:border-blue-300 focus:ring-0 transition-colors outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!message.trim() || !currentProject}
                className="p-2 bg-blue-900 text-white rounded-full hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto p-4 bg-blue-900 text-white rounded-full shadow-lg hover:bg-blue-800 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};