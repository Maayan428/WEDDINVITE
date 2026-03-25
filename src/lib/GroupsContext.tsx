'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { GroupEntry, getGroups } from '@/services/groups.service';
import { DEFAULT_GROUP, DEFAULT_GROUP_COLOR } from '@/lib/constants';

interface GroupsContextValue {
  groups: GroupEntry[];
  getColor: (groupName: string) => string;
  refresh: () => void;
}

const GroupsContext = createContext<GroupsContextValue>({
  groups: [],
  getColor: () => DEFAULT_GROUP_COLOR,
  refresh: () => {},
});

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<GroupEntry[]>([]);

  function load() {
    getGroups().then(setGroups).catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  function getColor(groupName: string): string {
    if (groupName === DEFAULT_GROUP) return DEFAULT_GROUP_COLOR;
    return groups.find((g) => g.name === groupName)?.color ?? DEFAULT_GROUP_COLOR;
  }

  return (
    <GroupsContext.Provider value={{ groups, getColor, refresh: load }}>
      {children}
    </GroupsContext.Provider>
  );
}

export const useGroups = () => useContext(GroupsContext);
