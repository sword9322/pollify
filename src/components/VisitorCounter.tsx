import React from 'react';
import { BarChart } from 'lucide-react';
import { useVisitorCounter } from '../hooks/useVisitorCounter';

export default function VisitorCounter() {
  const { visitorCount, loading, error } = useVisitorCounter();

  // Always render the component, but with a default value if needed
  const displayCount = (visitorCount !== null) ? visitorCount : 0;

  return (
    <div className="inline-flex items-center justify-center gap-2 text-sm bg-teal-50 px-4 py-1 rounded-full shadow-sm border border-teal-100 mt-1">
      <BarChart size={18} className="text-teal-600" />
      <span className="text-teal-700 font-medium">
        {displayCount.toLocaleString()} polls created with Pollify
      </span>
    </div>
  );
} 