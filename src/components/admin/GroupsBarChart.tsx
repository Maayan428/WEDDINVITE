'use client';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DEFAULT_GROUP } from '@/lib/constants';

interface ChartClickState {
  activeLabel?: string | number;
}

export interface GroupChartData {
  name: string;
  confirmed: number;
  declined: number;
  pending: number;
  total: number;
}

interface GroupsBarChartProps {
  groups: GroupChartData[];
  onGroupClick: (groupName: string) => void;
}

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-sm min-w-[120px]">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="leading-5">
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function GroupsBarChart({ groups, onGroupClick }: GroupsBarChartProps) {
  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-400">
        אין נתונים להצגה
      </div>
    );
  }

  function handleChartClick(state: ChartClickState) {
    if (state?.activeLabel != null) onGroupClick(String(state.activeLabel));
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={groups}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        onClick={handleChartClick}
        style={{ cursor: 'pointer' }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: '12px', color: '#374151' }}>{value}</span>
          )}
        />
        <Bar dataKey="confirmed" stackId="a" fill="#4ade80" name="אישרו הגעה">
          {groups.map((entry) => (
            <Cell
              key={`confirmed-${entry.name}`}
              fill={entry.name === DEFAULT_GROUP ? '#9ca3af' : '#4ade80'}
            />
          ))}
        </Bar>
        <Bar dataKey="declined" stackId="a" fill="#f87171" name="לא מגיעים">
          {groups.map((entry) => (
            <Cell
              key={`declined-${entry.name}`}
              fill={entry.name === DEFAULT_GROUP ? '#9ca3af' : '#f87171'}
            />
          ))}
        </Bar>
        <Bar dataKey="pending" stackId="a" fill="#fbbf24" name="ממתינים" radius={[4, 4, 0, 0]}>
          {groups.map((entry) => (
            <Cell
              key={`pending-${entry.name}`}
              fill={entry.name === DEFAULT_GROUP ? '#9ca3af' : '#fbbf24'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
