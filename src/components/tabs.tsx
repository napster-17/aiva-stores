'use client';

import React from 'react';

export function Tabs({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
}) {
  return <div className="space-x-2">{children}</div>;
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2 mb-2">{children}</div>;
}

export function TabsTrigger({
  value,
  currentValue,
  onSelect,
  children,
}: {
  value: string;
  currentValue: string;
  onSelect: (val: string) => void;
  children: React.ReactNode;
}) {
  const isActive = value === currentValue;
  return (
    <button
      onClick={() => onSelect(value)}
      className={`px-3 py-1 rounded border text-sm ${
        isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
