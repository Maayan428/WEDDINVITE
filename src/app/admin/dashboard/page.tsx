'use client';

import { useState } from 'react';
import { Users, CheckCircle, XCircle, Clock, Settings, RefreshCw, UserCheck } from 'lucide-react';
import { useDashboardViewModel, GroupBreakdown } from '@/viewmodels/useDashboardViewModel';
import StatsCard from '@/components/admin/StatsCard';
import GroupsBarChart from '@/components/admin/GroupsBarChart';
import GroupDetailModal from '@/components/admin/GroupDetailModal';
import GroupsManager from '@/components/admin/GroupsManager';
import Button from '@/components/ui/Button';

function StatsSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-8 w-14 rounded bg-gray-200" />
        </div>
        <div className="w-12 h-12 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse space-y-3">
      <div className="h-3 w-32 rounded bg-gray-200" />
      <div className="h-10 w-20 rounded bg-gray-200" />
      <div className="h-2 w-40 rounded bg-gray-200" />
    </div>
  );
}

function GroupCard({ group, onClick }: { group: GroupBreakdown; onClick: () => void }) {
  const pct = group.total > 0 ? Math.round((group.confirmed / group.total) * 100) : 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-start hover:border-navy-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800 truncate">{group.name}</span>
        <span className="text-xs text-gray-400 shrink-0 ms-2">
          {group.confirmed}/{group.total}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{pct}% אישרו</span>
        {group.pending > 0 && (
          <span className="text-yellow-600">{group.pending} ממתינים</span>
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
          <h1 className="text-2xl font-bold text-gray-900">לוח בקרה</h1>
          <p className="mt-1 text-sm text-gray-600">סיכום סטטוס ההזמנות</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            title="רענן נתונים"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading && !isInitialLoad ? 'animate-spin' : ''}`} />
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
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isInitialLoad ? (
          Array.from({ length: 4 }).map((_, i) => <StatsSkeleton key={i} />)
        ) : (
          <>
            <StatsCard title="סך אורחים"      value={stats.total}     icon={Users}       colorVariant="blue"   />
            <StatsCard title="אישרו הגעה"      value={stats.confirmed} icon={CheckCircle} colorVariant="green"  />
            <StatsCard title="דחו הזמנה"       value={stats.declined}  icon={XCircle}     colorVariant="red"    />
            <StatsCard title="ממתינים לתשובה"  value={stats.pending}   icon={Clock}       colorVariant="yellow" />
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
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-600">סך מגיעים צפויים</p>
              <p className="mt-1 text-4xl font-bold text-navy-800">{stats.totalExpectedGuests}</p>
              <p className="mt-1 text-xs text-gray-400">מאשרים + מתוכנן לממתינים</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-gray-600">אנשים שאישרו בפועל</p>
              </div>
              <p className="text-4xl font-bold text-green-700">{stats.confirmedPeople}</p>
              <p className="mt-1 text-xs text-gray-400">לפי הצהרות האורחים</p>
            </div>
          </>
        )}
      </div>

      {/* Bar chart */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">פירוט לפי קבוצה</h2>
          <p className="mt-0.5 text-xs text-gray-400">לחץ על עמודה לפירוט אורחים בקבוצה</p>
        </div>
        <div className="p-6">
          {isInitialLoad ? (
            <div className="flex items-end justify-around h-[200px] gap-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-t bg-gray-200" style={{ height: `${35 + i * 20}%` }} />
              ))}
            </div>
          ) : (
            <GroupsBarChart groups={groupBreakdown} onGroupClick={setSelectedGroup} />
          )}
        </div>
      </div>

      {/* Group cards */}
      {!isInitialLoad && groupBreakdown.length > 0 && (
        <div>
          <h2 className="mb-4 text-base font-semibold text-gray-900">ביצועים לפי קבוצה</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groupBreakdown.map((group) => (
              <GroupCard
                key={group.name}
                group={group}
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
