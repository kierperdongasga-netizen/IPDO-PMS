import React from 'react';
import { useProject } from '../context/ProjectContext';
import { FolderKanban } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useProject();
  
  // Custom SVG Logo: Boxes being sorted (Minimalistic)
  const LOGO_URL = "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='50' y='130' width='100' height='30' rx='4' fill='%23002855'/%3E%3Crect x='50' y='85' width='100' height='30' rx='4' fill='%23002855'/%3E%3Crect x='60' y='40' width='100' height='30' rx='4' fill='%23F2A900' transform='rotate(-10 110 55)'/%3E%3Cpath d='M170 40 Q 185 65 170 90' fill='none' stroke='%23F2A900' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M165 80 L170 90 L180 80' fill='none' stroke='%23F2A900' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/60 relative overflow-hidden">
        
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-psu-navy via-psu-gold to-psu-red"></div>

        <div className="text-center">
          <div className="mx-auto h-28 w-28 bg-white/80 rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-psu-gold/30">
             <img src={LOGO_URL} alt="PSU Logo" className="h-20 w-20 object-contain" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-psu-navy tracking-tight">
            Partido State University
          </h2>
          <p className="text-lg font-semibold text-psu-gold">Project Management System</p>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Streamline your academic and administrative projects.
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-white/60 rounded-xl shadow-lg text-white bg-psu-navy hover:bg-blue-900 font-semibold transition-all transform hover:scale-[1.02] hover:shadow-xl backdrop-blur-sm group"
          >
            <div className="bg-white p-1 rounded-full group-hover:rotate-12 transition-transform">
               <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26c.01-.04.61-.39-.19-.58z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <span>Continue with Google</span>
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 font-medium">Authorized Personnel Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};