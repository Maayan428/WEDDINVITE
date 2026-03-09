'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(13,148,136,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          {title && (
            <h2 className="text-lg font-semibold" style={{ color: '#1e3a5f' }}>
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ms-auto rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
