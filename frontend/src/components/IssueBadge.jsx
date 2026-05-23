import React from 'react';

export default function IssueBadge({ severity }) {
  const sev = (severity || 'low').toLowerCase();

  // Binds directly to our new earthy Claude-inspired palette
  const styles = {
    high: 'bg-high/10 text-red-300 border-high/20',
    medium: 'bg-medium/10 text-orange-300 border-medium/20',
    low: 'bg-low/10 text-emerald-300 border-low/20',
  };

  const currentStyle = styles[sev] || styles.low;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${currentStyle}`}>
      {sev}
    </span>
  );
}
