'use client';

import { useState } from 'react';
import { Users, CheckCircle, XCircle, Clock, Settings, RefreshCw, UserCheck } from 'lucide-react';
import { useDashboardViewModel, GroupBreakdown } from '@/viewmodels/useDashboardViewModel';
import StatsCard from '@/components/admin/StatsCard';
import GroupsBarChart from '@/components/admin/GroupsBarChart';
import GroupDetailModal from '@/components/admin/GroupDetailModal';
import GroupsManager from '@/components/admin/GroupsManager';
import Button from '@/components/ui/Button';
import { GROUP_COLORS, DEFAULT_GROUP, DEFAULT_GROUP_COLOR } from '@/lib/constants';

function StatsSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 animate-pulse" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(13,148,136,0.06)' }}>
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="h-8 w-14 rounded bg-gray-100" />
        </div>
        <div className="w-12 h-12 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 animate-pulse space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(13,148,136,0.06)' }}>
      <div className="h-3 w-32 rounded bg-gray-100" />
      <div className="h-10 w-20 rounded bg-gray-100" />
      <div className="h-2 w-40 rounded bg-gray-100" />
    </div>
  );
}

function GroupCard({ group, onClick, index }: { group: GroupBreakdown; onClick: () => void; index: number }) {
  const pct = group.total > 0 ? Math.round((group.confirmed / group.total) * 100) : 0;
  const hex = group.name === DEFAULT_GROUP ? DEFAULT_GROUP_COLOR : GROUP_COLORS[index % GROUP_COLORS.length];
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border p-4 text-start shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
      style={{ backgroundColor: `${hex}12`, borderColor: `${hex}50` }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold truncate" style={{ color: '#1e3a5f' }}>{group.name}</span>
        <span className="text-xs text-gray-400 shrink-0 ms-2">
          {group.confirmed}/{group.total}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: `${hex}20` }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: hex }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{pct}% אישרו</span>
        {group.pending > 0 && (
          <span className="text-amber-600">{group.pending} ממתינים</span>
        )}
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const {
    stats,
    groupBreakdown,
    guests,
    loading,
    error,
    selectedGroup,
    setSelectedGroup,
    refresh,
  } = useDashboardViewModel();

  const [groupsManagerOpen, setGroupsManagerOpen] = useState(false);

  const guestCounts: Record<string, number> = {};
  for (const row of groupBreakdown) {
    guestCounts[row.name] = row.total;
  }

  const isInitialLoad = loading && guests.length === 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Page title */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: '#1e3a5f' }}>לוח בקרה</h1>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-0.5 w-8 rounded-full bg-teal-500" />
            <p className="text-sm text-gray-500">סיכום סטטוס ההזמנות</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            title="רענן נתונים"
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading && !isInitialLoad ? 'animate-spin text-teal-500' : ''}`} />
            רענן
          </button>
          <Button variant="secondary" onClick={() => setGroupsManagerOpen(true)}>
            <Settings className="w-4 h-4" />
            ניהול קבוצות
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && !loading && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isInitialLoad ? (
          Array.from({ length: 4 }).map((_, i) => <StatsSkeleton key={i} />)
        ) : (
          <>
            <div className="animate-fade-slide-up delay-100"><StatsCard title="סך אורחים"      value={stats.total}     icon={Users}       colorVariant="blue"   /></div>
            <div className="animate-fade-slide-up delay-200"><StatsCard title="אישרו הגעה"      value={stats.confirmed} icon={CheckCircle} colorVariant="green"  /></div>
            <div className="animate-fade-slide-up delay-300"><StatsCard title="דחו הזמנה"       value={stats.declined}  icon={XCircle}     colorVariant="red"    /></div>
            <div className="animate-fade-slide-up delay-400"><StatsCard title="ממתינים לתשובה"  value={stats.pending}   icon={Clock}       colorVariant="yellow" /></div>
          </>
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isInitialLoad ? (
          <>
            <SummarySkeleton />
            <SummarySkeleton />
          </>
        ) : (
          <>
            <div
              className="rounded-2xl p-6 text-white"
              style={{ background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', boxShadow: '0 4px 20px rgba(13,148,136,0.25)' }}
            >
              <p className="text-sm font-medium text-teal-100">סך מגיעים צפויים</p>
              <p className="mt-1 text-4xl font-bold text-white">{stats.totalExpectedGuests}</p>
              <p className="mt-1 text-xs text-teal-200">מאשרים + מתוכנן לממתינים</p>
            </div>
            <div
              className="rounded-2xl border border-gray-100 bg-white p-6"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(13,148,136,0.06)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <p className="text-sm font-medium text-gray-600">אנשים שאישרו בפועל</p>
              </div>
              <p className="text-4xl font-bold text-emerald-600">{stats.confirmedPeople}</p>
              <p className="mt-1 text-xs text-gray-400">לפי הצהרות האורחים</p>
            </div>
          </>
        )}
      </div>

      {/* Bar chart */}
      <div
        className="rounded-2xl border border-gray-100 bg-white animate-fade-slide-up delay-200"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(13,148,136,0.06)' }}
      >
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold" style={{ color: '#1e3a5f' }}>פירוט לפי קבוצה</h2>
          <p className="mt-0.5 text-xs text-gray-400">לחץ על עמודה לפירוט אורחים בקבוצה</p>
        </div>
        <div className="p-6">
          {isInitialLoad ? (
            <div className="flex items-end justify-around h-[200px] gap-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-t bg-teal-50" style={{ height: `${35 + i * 20}%` }} />
              ))}
            </div>
          ) : (
            <GroupsBarChart groups={groupBreakdown} onGroupClick={setSelectedGroup} />
          )}
        </div>
      </div>

      {/* Group cards */}
      {!isInitialLoad && groupBreakdown.length > 0 && (
        <div className="animate-fade-slide-up delay-300">
          <h2 className="mb-4 text-base font-semibold" style={{ color: '#1e3a5f' }}>ביצועים לפי קבוצה</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groupBreakdown.map((group, index) => (
              <GroupCard
                key={group.name}
                group={group}
                index={index}
                onClick={() => setSelectedGroup(group.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Group detail modal */}
      <GroupDetailModal
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        groupName={selectedGroup}
        guests={guests}
      />

      {/* Groups manager modal */}
      {groupsManagerOpen && (
        <GroupsManager
          onClose={() => setGroupsManagerOpen(false)}
          guestCounts={guestCounts}
        />
      )}
    </div>
  );
}
