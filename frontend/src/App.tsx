import { useState } from 'react';
import Dashboard from './components/Dashboard';
import { Activity, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="h-16 border-b border-gray-800 bg-surface/50 backdrop-blur flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Zap className="text-primary w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            EcoStruxure Predictive Maintenance
          </h1>
          <span className="ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
            Powered by AI
          </span>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            System Online
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium">OP</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1">
          <Dashboard />
        </div>
      </main>
    </div>
  );
}

export default App;
