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
        <div className="mb-4 w-80 sm:w-96 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 pointer-events-auto flex flex-col overflow-hidden transition-all duration-200 ease-in-out">
          {/* Header */}
          <div className="bg-blue-900/90 backdrop-blur-sm p-4 flex items-center justify-between text-white shadow-sm">
            <div>
              <h3 className="font-semibold text-sm">
                {currentProject ? currentProject.name : 'Select a Project'}
              </h3>
              <p className="text-xs text-blue-100">Team Chat</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 h-80 overflow-y-auto p-4 bg-transparent space-y-4 scrollbar-thin">
            {!currentProject ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm text-center font-medium">
                Please select a project from the sidebar to start chatting.
              </div>
            ) : currentProject.chatMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm text-center font-medium">
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
                      className="w-8 h-8 rounded-full bg-white flex-shrink-0 border border-white/50 shadow-sm"
                      title={sender?.name}
                    />
                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 rounded-2xl text-sm shadow-sm backdrop-blur-md ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white/60 text-gray-800 border border-white/50 rounded-bl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 px-1 font-medium">
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
          <div className="p-3 bg-white/40 border-t border-white/50 backdrop-blur-md">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!currentProject}
                placeholder={currentProject ? "Type a message..." : "Select a project..."}
                className="flex-1 px-4 py-2 text-sm bg-white/60 border border-white/40 rounded-full focus:bg-white/90 focus:border-blue-300 focus:ring-0 transition-colors outline-none disabled:opacity-50 shadow-inner placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!message.trim() || !currentProject}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 shadow-md"
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
        className="pointer-events-auto p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 backdrop-blur-sm"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};