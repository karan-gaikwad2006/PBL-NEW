import React from 'react';

const LABELS = Object.freeze({
  document_verified: 'Document verified',
  phone_verified: 'Phone verified',
  track_record: 'Track record',
});

export default function TrustBadge({ tiers = [] }) {
  const labels = Array.isArray(tiers) ? tiers.map((tier) => LABELS[tier]).filter(Boolean) : [];
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Trust tiers">
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
