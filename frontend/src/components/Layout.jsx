import React from 'react';
import { Eye, History, LayoutDashboard, Home } from 'lucide-react';

export default function Layout({ children, activePage, setActivePage }) {
  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
      {/* Navigation Header */}
      <header className="border-b border-navy-800 bg-navy-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActivePage('home')}
          >
            <div className="bg-blue-600/10 p-2 rounded-lg border border-blue-500/20">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-50 serif-heading">
                Code<span className="text-blue-500">Lens</span>
              </span>
              <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-navy-800 text-slate-400 uppercase tracking-wider font-mono">
                AI Auditor
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActivePage('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activePage === 'home' 
                  ? 'bg-navy-800 text-blue-400 border border-navy-700/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            
            <button
              onClick={() => setActivePage('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activePage === 'dashboard' 
                  ? 'bg-navy-800 text-blue-400 border border-navy-700/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActivePage('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activePage === 'history' 
                  ? 'bg-navy-800 text-blue-400 border border-navy-700/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-800/60 bg-navy-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} CodeLens — Sophisticated AI-Powered Code Review Engine.</p>
          <p className="mt-1 text-slate-600">Analyzing public repositories for bugs, performance, security, and best practices.</p>
        </div>
      </footer>
    </div>
  );
}
