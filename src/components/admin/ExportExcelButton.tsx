'use client';

import { useRef, useState, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { exportGuestsToExcel } from '@/services/excel.service';
import { Guest } from '@/models/guest.model';

interface ExportExcelButtonProps {
  guests: Guest[];
}

export default function ExportExcelButton({ guests }: ExportExcelButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleExport(mode: 'all' | 'confirmed') {
    setOpen(false);
    const toExport =
      mode === 'confirmed' ? guests.filter((g) => g.status === 'confirmed') : guests;
    exportGuestsToExcel(toExport);
  }

  const confirmedCount = guests.filter((g) => g.status === 'confirmed').length;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={guests.length === 0}
        className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        ייצוא לאקסל
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute start-0 top-full mt-1 z-20 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => handleExport('all')}
            className="w-full px-4 py-2.5 text-start text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ייצא הכל
            <span className="ms-1 text-xs text-gray-400">({guests.length})</span>
          </button>
          <div className="mx-3 h-px bg-gray-100" />
          <button
            type="button"
            onClick={() => handleExport('confirmed')}
            disabled={confirmedCount === 0}
            className="w-full px-4 py-2.5 text-start text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ייצא מאשרים בלבד
            <span className="ms-1 text-xs text-gray-400">({confirmedCount})</span>
          </button>
        </div>
      )}
    </div>
  );
}
