import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface ChartProps {
  unitId: string;
}

const HistoryChart: React.FC<ChartProps> = ({ unitId }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/unit/${unitId}/history`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Error fetching history", e);
      }
    };
    
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [unitId]);

  if (!data || data.length === 0) {
    return <div className="h-full w-full flex items-center justify-center text-gray-500">Loading history...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#4b5563" 
          tickFormatter={(tick) => tick.substring(5)} 
          tickMargin={10}
        />
        <YAxis 
          yAxisId="left" 
          stroke="#4b5563" 
          domain={['auto', 'auto']}
          tickFormatter={(val) => `${val}%`}
          orientation="left"
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="#4b5563"
          domain={['auto', 'auto']} 
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
          itemStyle={{ color: '#f3f4f6' }}
        />
        
        {/* Threshold line where actions MUST be taken */}
        <ReferenceLine y={40} yAxisId="left" stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Critical Threshold', fill: '#ef4444', fontSize: 12 }} />
        
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="health" 
          name="Health Score (%)"
          stroke="#10b981" 
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6 }} 
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="resistance" 
          name="Resistance (mΩ)"
          stroke="#3b82f6" 
          strokeWidth={2}
          strokeOpacity={0.6}
          dot={false} 
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="temperature" 
          name="Temp (°C)"
          stroke="#f59e0b" 
          strokeWidth={2}
          strokeOpacity={0.6}
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default HistoryChart;
