'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Customized,
} from 'recharts';
import { DEFAULT_GROUP, GROUP_COLORS, DEFAULT_GROUP_COLOR } from '@/lib/constants';

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

function getGroupColor(name: string, sortedGroups: string[]): string {
  if (name === DEFAULT_GROUP) return DEFAULT_GROUP_COLOR;
  const idx = sortedGroups.indexOf(name);
  return idx >= 0 ? GROUP_COLORS[idx % GROUP_COLORS.length] : DEFAULT_GROUP_COLOR;
}

// Draws a single top-rounded outline per group wrapping the full stacked height
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GroupOutline = (props: any) => {
  const { formattedGraphicalItems } = props;
  if (!formattedGraphicalItems?.length) return null;

  const firstItemData: Array<{ name?: string }> = formattedGraphicalItems[0]?.props?.data ?? [];
  const allNames = firstItemData.map((d) => d?.name ?? '');
  const sortedGroups = allNames.filter((n) => n !== DEFAULT_GROUP).sort();

  const groups: Record<string, { x: number; y: number; width: number; totalHeight: number; color: string }> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formattedGraphicalItems.forEach((item: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item.props?.data ?? []).forEach((entry: any) => {
      const key: string = entry?.name ?? '';
      if (!key) return;
      const h: number = entry.height ?? 0;
      if (!groups[key]) {
        groups[key] = {
          x: entry.x ?? 0,
          y: entry.y ?? 0,
          width: entry.width ?? 0,
          totalHeight: 0,
          color: getGroupColor(key, sortedGroups),
        };
      }
      if (h > 0) {
        groups[key].totalHeight += h;
        groups[key].y = Math.min(groups[key].y, entry.y ?? 0);
      }
    });
  });

  return (
    <g>
      {Object.entries(groups).map(([name, g]) => {
        if (g.totalHeight <= 0) return null;
        const r = 8;
        const { x: gx, y: gy, width: gw, totalHeight: gh, color: gc } = g;
        // Rounded top corners, square bottom
        const path = `M ${gx} ${gy + gh} L ${gx} ${gy + r} Q ${gx} ${gy} ${gx + r} ${gy} L ${gx + gw - r} ${gy} Q ${gx + gw} ${gy} ${gx + gw} ${gy + r} L ${gx + gw} ${gy + gh} Z`;
        return (
          <path
            key={name}
            d={path}
            fill="transparent"
            stroke={gc}
            strokeWidth={2.5}
          />
        );
      })}
    </g>
  );
};

const CustomLegend = () => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
    {[
      { label: 'אישרו הגעה', color: '#10b981' },
      { label: 'לא מגיעים', color: '#ef4444' },
      { label: 'ממתינים', color: '#f59e0b' },
    ].map(({ label, color }) => (
      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: '#374151' }}>{label}</span>
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: `2.5px solid ${color}`,
            backgroundColor: `${color}22`,
            flexShrink: 0,
          }}
        />
      </div>
    ))}
  </div>
);

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-gray-100 bg-white p-3 text-sm min-w-[130px]"
      style={{ boxShadow: '0 4px 20px rgba(13,148,136,0.12)' }}
    >
      <p className="font-semibold mb-2" style={{ color: '#1e3a5f' }}>{label}</p>
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

  const sortedGroups = groups.map((g) => g.name).filter((n) => n !== DEFAULT_GROUP).sort();

  function handleChartClick(state: ChartClickState) {
    if (state?.activeLabel != null) onGroupClick(String(state.activeLabel));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coloredTick = (tickProps: any) => {
    const { x, y, payload } = tickProps;
    const color = getGroupColor(payload.value, sortedGroups);
    return (
      <foreignObject x={x - 50} y={y + 4} width={100} height={30}>
        {/* @ts-expect-error: xmlns required for foreignObject HTML content */}
        <div xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <span
            style={{
              color: '#111827',
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: '999px',
              boxShadow: `0 0 0 2px ${color}40, 0 0 8px ${color}60`,
              backgroundColor: `${color}12`,
              whiteSpace: 'nowrap',
            }}
          >
            {payload.value}
          </span>
        </div>
      </foreignObject>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transparentSegment = (props: any) => {
    const { x, y, width, height, fill } = props;
    if (!height || height <= 0) return <g />;
    return <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.22} />;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={groups}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        onClick={handleChartClick}
        style={{ cursor: 'pointer' }}
        barSize={110}
        barCategoryGap="18%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={coloredTick}
          height={36}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(13,148,136,0.04)' }} />
        <Legend content={<CustomLegend />} />
        <Bar dataKey="confirmed" stackId="a" fill="#10b981" name="אישרו הגעה" shape={transparentSegment} />
        <Bar dataKey="declined" stackId="a" fill="#ef4444" name="לא מגיעים" shape={transparentSegment} />
        <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="ממתינים" shape={transparentSegment} />
        <Customized component={GroupOutline} />
      </BarChart>
    </ResponsiveContainer>
  );
}
