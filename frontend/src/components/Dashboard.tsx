import React, { useEffect, useState } from 'react';
import { Activity, AlertOctagon, CheckCircle2, AlertTriangle, Battery, Thermometer, Clock } from 'lucide-react';
import HistoryChart from './Charts';

// Interfaces for API response
interface UnitMetrics {
  resistance: number;
  temperature: number;
  cycles: number;
  voltage: number;
}

interface Unit {
  id: string;
  healthScore: number;
  failureProbability: number;
  status: 'Healthy' | 'Warning' | 'Critical Risk';
  metrics: UnitMetrics;
}

interface DashboardSummary {
  totalUnits: number;
  healthyUnits: number;
  atRiskUnits: number;
  criticalAlerts: number;
}

const Dashboard: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/dashboard');
      const data = await res.json();
      setUnits(data.units);
      setSummary(data.summary);
      if (!selectedUnit && data.units.length > 0) {
        setSelectedUnit(data.units[0]);
      }
      setLoading(false);
    } catch (e) {
      console.error("Error fetching data", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Left Column - List of switchgears */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 flex flex-col">
            <span className="text-gray-400 text-sm font-medium">Total Monitored</span>
            <span className="text-3xl font-bold mt-1 text-white">{summary?.totalUnits}</span>
          </div>
          <div className="glass-panel p-4 flex flex-col border-red-500/30">
            <span className="text-red-400 text-sm font-medium">Critical Risk</span>
            <span className="text-3xl font-bold mt-1 text-red-500">{summary?.criticalAlerts}</span>
          </div>
          <div className="glass-panel p-4 flex flex-col border-yellow-500/30">
            <span className="text-yellow-400 text-sm font-medium">Warning State</span>
            <span className="text-3xl font-bold mt-1 text-yellow-500">{summary?.atRiskUnits}</span>
          </div>
          <div className="glass-panel p-4 flex flex-col border-emerald-500/30">
            <span className="text-emerald-400 text-sm font-medium">Healthy</span>
            <span className="text-3xl font-bold mt-1 text-emerald-500">{summary?.healthyUnits}</span>
          </div>
        </div>

        {/* Units List */}
        <div className="glass-panel flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-800 bg-surface/50">
            <h2 className="font-semibold text-gray-200">Switchgear Fleet</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {units.sort((a,b) => b.failureProbability - a.failureProbability).map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors
                  ${selectedUnit?.id === unit.id ? 'bg-gray-800 ring-1 ring-gray-700' : 'hover:bg-gray-800/50'}
                `}
              >
                <div>
                  <div className="font-medium text-gray-200">{unit.id}</div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                    {unit.status === 'Healthy' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    {unit.status === 'Warning' && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                    {unit.status === 'Critical Risk' && <AlertOctagon className="w-3 h-3 text-red-500" />}
                    {unit.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    unit.healthScore < 40 ? 'text-red-500' : unit.healthScore < 70 ? 'text-yellow-500' : 'text-emerald-500'
                  }`}>
                    {unit.healthScore}%
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Health</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Deep dive view */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {selectedUnit ? (
          <>
            <div className="glass-panel p-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {selectedUnit.id}
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-md uppercase tracking-wide border
                    ${selectedUnit.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                    ${selectedUnit.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : ''}
                    ${selectedUnit.status === 'Critical Risk' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                  `}>
                    {selectedUnit.status}
                  </span>
                </h2>
                <p className="text-gray-400 mt-2 text-sm max-w-xl">
                  {selectedUnit.status === 'Healthy' && "Component is operating normally. Minimal degradation detected across sensing points."}
                  {selectedUnit.status === 'Warning' && "Early signs of degradation detected in contact resistance and temperature profiles. Schedule inspection during next planned downtime."}
                  {selectedUnit.status === 'Critical Risk' && "High probability of failure within 60-90 days based on degradation patterns. Urgent preventative replacement recommended."}
                </p>
              </div>
              
              <div className="relative">
                {/* SVG Gauge Implementation */}
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle className="text-gray-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                  <circle 
                    className={
                      selectedUnit.healthScore < 40 ? 'text-red-500' : selectedUnit.healthScore < 70 ? 'text-yellow-500' : 'text-emerald-500'
                    }
                    strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 40} 
                    strokeDashoffset={2 * Math.PI * 40 * (1 - selectedUnit.healthScore / 100)}
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" cx="48" cy="48" 
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} 
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-xl font-bold text-white block">{selectedUnit.healthScore}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="glass-panel p-4 flex items-center gap-4">
                 <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400">
                   <Activity size={20} />
                 </div>
                 <div>
                   <div className="text-sm font-medium text-gray-400">Resistance</div>
                   <div className="text-xl font-bold text-gray-100">{selectedUnit.metrics.resistance} <span className="text-xs text-gray-500">mΩ</span></div>
                 </div>
               </div>
               <div className="glass-panel p-4 flex items-center gap-4">
                 <div className="bg-orange-500/10 p-3 rounded-lg text-orange-400">
                   <Thermometer size={20} />
                 </div>
                 <div>
                   <div className="text-sm font-medium text-gray-400">Temperature</div>
                   <div className="text-xl font-bold text-gray-100">{selectedUnit.metrics.temperature}° <span className="text-xs text-gray-500">C</span></div>
                 </div>
               </div>
               <div className="glass-panel p-4 flex items-center gap-4">
                 <div className="bg-purple-500/10 p-3 rounded-lg text-purple-400">
                   <Clock size={20} />
                 </div>
                 <div>
                   <div className="text-sm font-medium text-gray-400">Mvmt Cycles</div>
                   <div className="text-xl font-bold text-gray-100">{(selectedUnit.metrics.cycles / 1000).toFixed(1)}k</div>
                 </div>
               </div>
               <div className="glass-panel p-4 flex items-center gap-4">
                 <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
                   <Battery size={20} />
                 </div>
                 <div>
                   <div className="text-sm font-medium text-gray-400">Coil Stability</div>
                   <div className="text-xl font-bold text-gray-100">{selectedUnit.metrics.voltage}%</div>
                 </div>
               </div>
            </div>

            <div className="glass-panel flex-1 p-6 relative overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-4">Degradation ML Profile (Last 90 Days)</h3>
              <div className="flex-1 w-full min-h-[300px]">
                <HistoryChart unitId={selectedUnit.id} />
              </div>
            </div>
          </>
        ) : (
          <div className="glass-panel h-full flex flex-col items-center justify-center text-gray-500">
            <Activity className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Select a switchgear unit to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
